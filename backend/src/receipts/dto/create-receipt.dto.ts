import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateReceiptDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
