import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2글자입니다' })
  @MaxLength(20, { message: '닉네임은 최대 20글자입니다' })
  nickname?: string;

  @IsOptional()
  @IsString()
  profileEmoji?: string;
}
