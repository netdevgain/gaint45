import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<unknown> {
    const settings = await this.prisma.setting.findUnique({ where: { id: 1 } });
    const templates = await this.prisma.emailTemplate.findMany({
      orderBy: [{ type: 'asc' }, { locale: 'asc' }]
    });

    return {
      settings,
      templates
    };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<unknown> {
    return this.prisma.setting.update({
      where: { id: 1 },
      data: dto
    });
  }

  async upsertTemplate(dto: UpdateEmailTemplateDto): Promise<unknown> {
    return this.prisma.emailTemplate.upsert({
      where: {
        type_locale: {
          type: dto.type,
          locale: dto.locale
        }
      },
      update: {
        subject: dto.subject,
        body: dto.body
      },
      create: {
        type: dto.type,
        locale: dto.locale,
        subject: dto.subject,
        body: dto.body
      }
    });
  }
}
