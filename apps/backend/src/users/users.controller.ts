import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUserPayload } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

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
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    }
  });
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: AuthUserPayload): Promise<{ success: boolean; user: unknown }> {
    const profile = await this.usersService.findById(user.sub);
    return { success: true, user: profile };
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: AuthUserPayload, @Body() dto: UpdateProfileDto): Promise<{ success: boolean; user: unknown }> {
    const profile = await this.usersService.updateProfile(user.sub, dto);
    return { success: true, user: profile };
  }

  @Post('me/cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: uploadStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
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
  async uploadCv(
    @CurrentUser() user: AuthUserPayload,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ success: boolean; item: unknown }> {
    const item = await this.usersService.uploadCv(user.sub, file);
    return { success: true, item };
  }

  @Get('me/cv')
  async getCvMeta(@CurrentUser() user: AuthUserPayload): Promise<{ success: boolean; item: unknown }> {
    const item = await this.usersService.getCvMeta(user.sub);
    return { success: true, item };
  }

  @Get('me/cv/download')
  async downloadCv(@CurrentUser() user: AuthUserPayload, @Res() res: Response): Promise<void> {
    const file = await this.usersService.getCvFile(user.sub);
    res.download(file.absolutePath, file.originalName);
  }
}

