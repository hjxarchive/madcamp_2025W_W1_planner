import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiry = '15m'; // 15분
  private readonly refreshTokenExpiryDays = 30; // 30일

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async googleAuth(dto: GoogleAuthDto) {
    // 1. Firebase ID 토큰 검증
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(dto.idToken);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 Google 토큰입니다');
    }

    const { uid: firebaseUid, email } = decodedToken;

    // 2. 사용자 조회 또는 생성
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    const isNewUser = !user;

    if (!user) {
      // 신규 사용자: 임시 닉네임으로 생성 (이후 프로필 설정에서 변경)
      const tempNickname = `user_${Date.now().toString(36)}`;
      user = await this.prisma.user.create({
        data: {
          firebaseUid,
          nickname: tempNickname,
          profileEmoji: null,
        },
      });
    }

    // 3. JWT 토큰 생성
    const tokens = await this.generateTokens(user.id, firebaseUid, email);

    return {
      ...tokens,
      isNewUser,
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        nickname: user.nickname,
        profileEmoji: user.profileEmoji,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    // 1. DB에서 refresh token 조회
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
    }

    // 2. 만료 확인
    if (new Date() > storedToken.expiresAt) {
      // 만료된 토큰 삭제
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다');
    }

    // 3. 기존 토큰 삭제 후 새 토큰 발급
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.firebaseUid,
    );

    return {
      ...tokens,
      user: {
        id: storedToken.user.id,
        firebaseUid: storedToken.user.firebaseUid,
        nickname: storedToken.user.nickname,
        profileEmoji: storedToken.user.profileEmoji,
      },
    };
  }

  async logout(refreshToken: string) {
    // refresh token 삭제
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: '로그아웃 되었습니다' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  private async generateTokens(
    userId: string,
    firebaseUid: string,
    email?: string,
  ) {
    const payload: JwtPayload = {
      sub: userId,
      firebaseUid,
      email,
    };

    // Access Token 생성
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
    });

    // Refresh Token 생성 (랜덤 UUID)
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpiryDays);

    // Refresh Token DB 저장
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15분 (초 단위)
    };
  }
}
