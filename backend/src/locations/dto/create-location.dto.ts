import { IsString, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
