import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';

async function bootstrap() {
  // Firebase Admin 초기화 (프로덕션 환경에서만 필수)
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      if (isDev) {
        console.warn('⚠️ Firebase Admin 초기화 실패 - 개발 모드로 진행');
        // 개발 모드에서는 Firebase 없이도 동작하도록 더미 앱 초기화
        admin.initializeApp({
          projectId: 'momento-dev',
        });
      } else {
        throw error;
      }
    }
  }

  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS 설정
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 전역 ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  if (isDev) {
    console.log('🔧 개발 모드: Firebase 인증이 우회됩니다 (dev-token 사용 가능)');
  }
}
bootstrap();
