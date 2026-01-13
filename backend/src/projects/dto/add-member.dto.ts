import { IsString, IsOptional, IsIn } from 'class-validator';

export class AddMemberDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsIn(['owner', 'member'])
  role?: 'owner' | 'member';
}
