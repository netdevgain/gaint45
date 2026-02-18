import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { Locale, Role } from '@prisma/client';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, AuthUserPayload } from '../common/decorators/current-user.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationsService } from './applications.service';
import { AdminListApplicationsQueryDto } from './dto/admin-list-applications-query.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { AddApplicationNoteDto } from './dto/add-application-note.dto';

const allowedExtensions = new Set(['.pdf', '.doc', '.docx']);
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

function uploadStorage() {
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  mkdirSync(uploadDir, { recursive: true });

  return diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, uploadDir);
    },
    filename: (_req, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    }
  });
}

@Controller()
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('applications')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: uploadStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024
      },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
          callback(new BadRequestException('Only PDF/DOC/DOCX allowed'), false);
          return;
        }
        callback(null, true);
      }
    })
  )
  async apply(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: CreateApplicationDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ success: boolean; item: unknown }> {
    const item = await this.applicationsService.apply(user.sub, dto, file);
    return { success: true, item };
  }

  @Get('applications/me')
  async myApplications(
    @CurrentUser() user: AuthUserPayload,
    @Query('locale') locale = 'fr'
  ): Promise<{ success: boolean; items: unknown[] }> {
    const items = await this.applicationsService.listMine(user.sub, locale as Locale);
    return { success: true, items };
  }

  @Get('applications/:id')
  async myApplicationById(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Query('locale') locale = 'fr'
  ): Promise<{ success: boolean; item: unknown }> {
    const item = await this.applicationsService.getMineById(user.sub, id, locale as Locale);
    return { success: true, item };
  }

  @Get('applications/:id/cv')
  async myCvDownload(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<void> {
    const file = await this.applicationsService.getCvFile(id, user.sub, user.role as Role);
    res.download(file.absolutePath, file.originalName);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Get('admin/applications')
  async adminList(
    @Query() query: AdminListApplicationsQueryDto
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.applicationsService.adminList(query);
    return { success: true, data };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Get('admin/applications/export')
  async export(
    @Query() query: AdminListApplicationsQueryDto,
    @Res() res: Response
  ): Promise<void> {
    const csv = await this.applicationsService.exportCsv(query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
    res.send(csv);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Get('admin/applications/:id')
  async adminDetail(@Param('id') id: string): Promise<{ success: boolean; item: unknown }> {
    const item = await this.applicationsService.adminGetById(id);
    return { success: true, item };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Get('admin/applications/:id/cv')
  async adminCvDownload(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<void> {
    const file = await this.applicationsService.getCvFile(id, user.sub, user.role as Role);
    res.download(file.absolutePath, file.originalName);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Patch('admin/applications/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser() user: AuthUserPayload
  ): Promise<{ success: boolean; item: unknown }> {
    const item = await this.applicationsService.changeStatus(id, dto, user.sub);
    return { success: true, item };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Post('admin/applications/:id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() dto: AddApplicationNoteDto,
    @CurrentUser() user: AuthUserPayload
  ): Promise<{ success: boolean; item: unknown }> {
    const item = await this.applicationsService.addNote(id, dto, user.sub);
    return { success: true, item };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Get('admin/analytics')
  async analytics(): Promise<{ success: boolean; data: unknown }> {
    const data = await this.applicationsService.analytics();
    return { success: true, data };
  }
}

