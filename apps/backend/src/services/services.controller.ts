import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Locale, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get('services')
  async getPublic(@Query('locale') locale = 'fr'): Promise<{ success: boolean; items: unknown[] }> {
    const data = await this.servicesService.getPublic(locale as Locale);
    return { success: true, items: data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Get('admin/services')
  async adminList(): Promise<{ success: boolean; items: unknown[] }> {
    const items = await this.servicesService.adminList();
    return { success: true, items };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Post('admin/services')
  async create(@Body() dto: CreateServiceDto): Promise<{ success: boolean; item: unknown }> {
    const item = await this.servicesService.create(dto);
    return { success: true, item };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Patch('admin/services/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto): Promise<{ success: boolean; item: unknown }> {
    const item = await this.servicesService.update(id, dto);
    return { success: true, item };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/services/:id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.servicesService.remove(id);
    return { success: true };
  }
}
