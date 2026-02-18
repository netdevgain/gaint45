import { IsEnum, IsString } from 'class-validator';
import { EmailTemplateType, Locale } from '@prisma/client';

export class UpdateEmailTemplateDto {
  @IsEnum(EmailTemplateType)
  type!: EmailTemplateType;

  @IsEnum(Locale)
  locale!: Locale;

  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}
