import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Locale, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../common/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

type DurationString = `${number}${'s' | 'm' | 'h' | 'd'}`;

interface AccessPayload {
  sub: string;
  email: string;
  role: Role;
  tokenType: 'access';
}

interface RefreshPayload {
  sub: string;
  email: string;
  role: Role;
  tokenType: 'refresh';
  tokenId: string;
}

interface ResetPayload {
  sub: string;
  email: string;
  tokenType: 'reset';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenMaxAge: number;
  refreshTokenMaxAge: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService
  ) {}

  private getFrontendUrl(): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (frontendUrl) {
      return frontendUrl;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('FRONTEND_URL is not configured');
    }

    return 'http://localhost:3000';
  }

  private durationToMs(value: string, fallbackMs: number): number {
    const match = value.match(/^(\d+)([smhd])$/i);
    if (!match) {
      return fallbackMs;
    }

    const quantity = Number(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === 's') {
      return quantity * 1000;
    }
    if (unit === 'm') {
      return quantity * 60 * 1000;
    }
    if (unit === 'h') {
      return quantity * 60 * 60 * 1000;
    }
    return quantity * 24 * 60 * 60 * 1000;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private assertNoBotField(website?: string): void {
    if (website && website.trim().length > 0) {
      throw new BadRequestException('Bot protection triggered');
    }
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessTtl = this.configService.get<string>('ACCESS_TOKEN_TTL', '15m') as DurationString;
    const refreshTtl = this.configService.get<string>('REFRESH_TOKEN_TTL', '7d') as DurationString;

    const accessPayload: AccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'access'
    };

    const refreshPayload: RefreshPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'refresh',
      tokenId: randomUUID()
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
      expiresIn: accessTtl
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
      expiresIn: refreshTtl
    });

    const refreshMaxAge = this.durationToMs(refreshTtl, 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshMaxAge)
      }
    });

    return {
      accessToken,
      refreshToken,
      accessTokenMaxAge: this.durationToMs(accessTtl, 15 * 60 * 1000),
      refreshTokenMaxAge: refreshMaxAge
    };
  }

  private buildResetEmail(locale: Locale, resetUrl: string): { subject: string; body: string } {
    if (locale === Locale.ar) {
      return {
        subject: 'إعادة تعيين كلمة المرور',
        body: `<p>مرحباً،</p><p>استخدم هذا الرابط لإعادة تعيين كلمة المرور:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
      };
    }

    if (locale === Locale.en) {
      return {
        subject: 'Reset your password',
        body: `<p>Hello,</p><p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
      };
    }

    return {
      subject: 'Réinitialisez votre mot de passe',
      body: `<p>Bonjour,</p><p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    };
  }

  async register(dto: RegisterDto): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    this.assertNoBotField(dto.website);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        role: Role.CANDIDATE,
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        preferredLocale: dto.preferredLocale ?? Locale.fr
      }
    });

    const tokens = await this.issueTokens(user);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    this.assertNoBotField(dto.website);

    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async refresh(refreshToken: string): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret')
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash: this.hashToken(refreshToken),
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() }
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User inactive');
    }

    const tokens = await this.issueTokens(user);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: this.hashToken(refreshToken),
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  async getMe(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !user.isActive) {
      return;
    }

    const expiresIn = this.configService.get<string>('RESET_TOKEN_TTL', '30m') as DurationString;
    const resetToken = await this.jwtService.signAsync<ResetPayload>(
      { sub: user.id, email: user.email, tokenType: 'reset' },
      {
        secret: this.configService.get<string>('RESET_TOKEN_SECRET', 'reset-secret'),
        expiresIn
      }
    );

    const frontendUrl = this.getFrontendUrl();
    const locale = dto.locale ?? user.preferredLocale ?? Locale.fr;
    const resetUrl = `${frontendUrl}/${locale}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const message = this.buildResetEmail(locale, resetUrl);

    await this.mailService.sendMail({
      to: user.email,
      subject: message.subject,
      html: message.body
    });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    let payload: ResetPayload;
    try {
      payload = await this.jwtService.verifyAsync<ResetPayload>(dto.token, {
        secret: this.configService.get<string>('RESET_TOKEN_SECRET', 'reset-secret')
      });
    } catch {
      throw new BadRequestException('Invalid reset token');
    }

    if (payload.tokenType !== 'reset') {
      throw new BadRequestException('Invalid reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: {
        passwordHash
      }
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: payload.sub, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
}

