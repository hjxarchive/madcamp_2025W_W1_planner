import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateChecklistDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
