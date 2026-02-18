import { IsString, MinLength } from 'class-validator';

export class AddApplicationNoteDto {
  @IsString()
  @MinLength(2)
  note!: string;
}
