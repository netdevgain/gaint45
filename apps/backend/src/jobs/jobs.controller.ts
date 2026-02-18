import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Locale, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Public()
  @Get('jobs')
  async listPublic(@Query() query: ListJobsQueryDto): Promise<{ success: boolean; data: unknown }> {
    const data = await this.jobsService.listPublic(query);
    return { success: true, data };
  }

  @Public()
  @Get('jobs/:id')
  async getPublicById(@Param('id') id: string, @Query('locale') locale = 'fr'): Promise<{ success: boolean; item: unknown }> {
    const item = await this.jobsService.getPublicById(id, locale as Locale);
    return { success: true, item };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Get('admin/jobs')
  async adminList(@Query() query: ListJobsQueryDto): Promise<{ success: boolean; data: unknown }> {
    const data = await this.jobsService.adminList(query);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Get('admin/jobs/:id')
  async adminGetById(@Param('id') id: string, @Query('locale') locale = 'fr'): Promise<{ success: boolean; item: unknown }> {
    const item = await this.jobsService.adminGetById(id, locale as Locale);
    return { success: true, item };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Post('admin/jobs')
  async create(@Body() dto: CreateJobDto): Promise<{ success: boolean; item: unknown }> {
    const item = await this.jobsService.create(dto);
    return { success: true, item };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Patch('admin/jobs/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateJobDto): Promise<{ success: boolean; item: unknown }> {
    const item = await this.jobsService.update(id, dto);
    return { success: true, item };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/jobs/:id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.jobsService.remove(id);
    return { success: true };
  }
}
