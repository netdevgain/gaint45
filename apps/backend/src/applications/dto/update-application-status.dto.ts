import { ApplicationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  toStatus!: ApplicationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
