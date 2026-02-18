import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Locale } from '@prisma/client';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;
}
