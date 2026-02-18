import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUserPayload } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(response: Response, accessToken: string, refreshToken: string, accessMaxAge: number, refreshMaxAge: number): void {
    const secure = process.env.NODE_ENV === 'production';

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: accessMaxAge,
      path: '/'
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: refreshMaxAge,
      path: '/'
    });
  }

  private clearAuthCookies(response: Response): void {
    const secure = process.env.NODE_ENV === 'production';

    response.clearCookie('access_token', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/'
    });

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/'
    });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response): Promise<{ success: boolean; user: unknown }> {
    const { user, tokens } = await this.authService.register(dto);
    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken, tokens.accessTokenMaxAge, tokens.refreshTokenMaxAge);
    return { success: true, user };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<{ success: boolean; user: unknown }> {
    const { user, tokens } = await this.authService.login(dto);
    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken, tokens.accessTokenMaxAge, tokens.refreshTokenMaxAge);
    return { success: true, user };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<{ success: boolean; user: unknown }> {
    const refreshToken = request.cookies?.refresh_token as string | undefined;
    const { user, tokens } = await this.authService.refresh(refreshToken ?? '');
    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken, tokens.accessTokenMaxAge, tokens.refreshTokenMaxAge);
    return { success: true, user };
  }

  @Public()
  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<{ success: boolean }> {
    const refreshToken = request.cookies?.refresh_token as string | undefined;
    await this.authService.logout(refreshToken);
    this.clearAuthCookies(response);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthUserPayload): Promise<{ success: boolean; user: unknown }> {
    const profile = await this.authService.getMe(user.sub);
    return { success: true, user: profile };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot')
  async forgot(@Body() dto: ForgotPasswordDto): Promise<{ success: boolean }> {
    await this.authService.forgotPassword(dto);
    return { success: true };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('reset')
  async reset(@Body() dto: ResetPasswordDto): Promise<{ success: boolean }> {
    await this.authService.resetPassword(dto);
    return { success: true };
  }
}
