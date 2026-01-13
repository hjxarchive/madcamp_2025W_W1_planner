import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { FirebaseAuthGuard, CurrentUser } from '../common';
import type { FirebaseUser } from '../common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getMe(@CurrentUser() user: FirebaseUser) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);

    if (!dbUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return dbUser;
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(
    @CurrentUser() user: FirebaseUser,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(user.firebaseUid, dto);
  }

  @Patch('me')
  @UseGuards(FirebaseAuthGuard)
  async update(
    @CurrentUser() user: FirebaseUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.firebaseUid, dto);
  }

  @Get('search')
  @UseGuards(FirebaseAuthGuard)
  async searchByNickname(@Query('nickname') nickname: string) {
    if (!nickname) {
      throw new NotFoundException('닉네임을 입력해주세요');
    }
    return this.usersService.findByNickname(nickname);
  }
}
