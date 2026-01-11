import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }
    return user;
  }

  async findByNickname(nickname: string) {
    const user = await this.prisma.user.findUnique({
      where: { nickname },
      select: {
        id: true,
        nickname: true,
        profileEmoji: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  async create(firebaseUid: string, dto: CreateUserDto) {
    // 중복 체크
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid }, { nickname: dto.nickname }],
      },
    });

    if (existing) {
      if (existing.firebaseUid === firebaseUid) {
        throw new ConflictException('이미 가입된 사용자입니다');
      }
      throw new ConflictException('이미 사용 중인 닉네임입니다');
    }

    return this.prisma.user.create({
      data: {
        firebaseUid,
        nickname: dto.nickname,
        profileEmoji: dto.profileEmoji ?? '😀',
      },
    });
  }

  async update(firebaseUid: string, dto: UpdateUserDto) {
    const user = await this.findByFirebaseUid(firebaseUid);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // 닉네임 중복 체크
    if (dto.nickname && dto.nickname !== user.nickname) {
      const existingNickname = await this.prisma.user.findUnique({
        where: { nickname: dto.nickname },
      });

      if (existingNickname) {
        throw new ConflictException('이미 사용 중인 닉네임입니다');
      }
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: dto,
    });
  }
}
