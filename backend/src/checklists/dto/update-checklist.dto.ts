import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateChecklistDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
