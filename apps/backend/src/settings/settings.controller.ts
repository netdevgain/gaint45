import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.HR_MANAGER)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAll(): Promise<{ success: boolean; data: unknown }> {
    const data = await this.settingsService.getSettings();
    return { success: true, data };
  }

  @Patch()
  async update(@Body() dto: UpdateSettingsDto): Promise<{ success: boolean; item: unknown }> {
    const item = await this.settingsService.updateSettings(dto);
    return { success: true, item };
  }

  @Post('templates')
  async updateTemplate(@Body() dto: UpdateEmailTemplateDto): Promise<{ success: boolean; item: unknown }> {
    const item = await this.settingsService.upsertTemplate(dto);
    return { success: true, item };
  }
}
