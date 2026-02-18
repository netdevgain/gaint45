import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { existsSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private getUploadDir(): string {
    return process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<unknown> {
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          email: dto.email.toLowerCase(),
          id: { not: userId }
        }
      });

      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        email: dto.email?.toLowerCase(),
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined
      }
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async findById(userId: string): Promise<unknown> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async listUsers(params: {
    page: number;
    pageSize: number;
    search?: string;
    role?: Role;
  }): Promise<{ items: unknown[]; total: number; page: number; pageSize: number }> {
    const where = {
      role: params.role,
      OR: params.search
        ? [
            { email: { contains: params.search } },
            { firstName: { contains: params.search } },
            { lastName: { contains: params.search } }
          ]
        : undefined
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize
      })
    ]);

    const items = rows.map((user) => {
      const { passwordHash: _, ...safeUser } = user;
      return safeUser;
    });

    return {
      items,
      total,
      page: params.page,
      pageSize: params.pageSize
    };
  }

  async changeRole(targetUserId: string, role: Role, actorRole: Role): Promise<unknown> {
    if (actorRole !== Role.ADMIN) {
      throw new BadRequestException('Only admin can change roles');
    }

    const user = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role }
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async setUserActive(targetUserId: string, isActive: boolean): Promise<unknown> {
    const user = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive }
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async uploadCv(userId: string, file: Express.Multer.File): Promise<unknown> {
    if (!file) {
      throw new BadRequestException('CV file is required');
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { cvFilePath: true }
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (existing.cvFilePath) {
      const oldPath = resolve(this.getUploadDir(), existing.cvFilePath);
      if (oldPath.startsWith(resolve(this.getUploadDir())) && existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        cvFilePath: file.filename,
        cvOriginalName: file.originalname,
        cvMimeType: file.mimetype,
        cvSize: file.size
      }
    });

    return {
      cvFilePath: user.cvFilePath,
      cvOriginalName: user.cvOriginalName,
      cvMimeType: user.cvMimeType,
      cvSize: user.cvSize
    };
  }

  async getCvMeta(userId: string): Promise<unknown> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        cvFilePath: true,
        cvOriginalName: true,
        cvMimeType: true,
        cvSize: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getCvFile(userId: string): Promise<{ absolutePath: string; originalName: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        cvFilePath: true,
        cvOriginalName: true
      }
    });

    if (!user || !user.cvFilePath || !user.cvOriginalName) {
      throw new NotFoundException('CV not found');
    }

    const uploadDir = this.getUploadDir();
    const absolutePath = resolve(uploadDir, user.cvFilePath);

    if (!absolutePath.startsWith(resolve(uploadDir)) || !existsSync(absolutePath)) {
      throw new NotFoundException('CV file not found');
    }

    return {
      absolutePath,
      originalName: user.cvOriginalName
    };
  }
}

