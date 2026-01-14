import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { TimerGateway } from '../timer/timer.gateway';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TimerGateway))
    private timerGateway: TimerGateway,
  ) {}

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

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: dto,
    });

    // 실시간 브로드캐스트: 사용자 정보 변경
    this.timerGateway.broadcastUserUpdate(updatedUser.id, {
      nickname: updatedUser.nickname,
      profileEmoji: updatedUser.profileEmoji || undefined,
    });

    return updatedUser;
  }

  async checkNicknameAvailability(firebaseUid: string, nickname: string) {
    // 현재 사용자 조회
    const currentUser = await this.findByFirebaseUid(firebaseUid);

    // 자신의 현재 닉네임과 같으면 사용 가능
    if (currentUser && currentUser.nickname === nickname) {
      return { available: true, message: '현재 사용 중인 닉네임입니다' };
    }

    // 다른 사용자가 사용 중인지 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser) {
      return { available: false, message: '이미 사용 중인 닉네임입니다' };
    }

    return { available: true, message: '사용 가능한 닉네임입니다' };
  }
}
