import { IsArray, IsEmail, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Locale } from '@prisma/client';
import { Type } from 'class-transformer';

export class ServiceTranslationDto {
  @IsEnum(Locale)
  locale!: Locale;

  @IsString()
  name!: string;
}

export class CreateServiceDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  translations!: ServiceTranslationDto[];
}
