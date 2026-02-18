import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { ContractType, JobStatus, Locale } from '@prisma/client';

export class JobTranslationDto {
  @IsEnum(Locale)
  locale!: Locale;

  @IsString()
  title!: string;

  @IsString()
  description!: string;
}

export class CreateJobDto {
  @IsString()
  serviceId!: string;

  @IsEnum(ContractType)
  contractType!: ContractType;

  @IsString()
  wilaya!: string;

  @IsString()
  city!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceYears!: number;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  closingAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobTranslationDto)
  translations!: JobTranslationDto[];
}
