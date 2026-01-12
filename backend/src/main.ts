import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as swaggerUi from 'swagger-ui-express';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

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

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // 정적 파일 서빙 (영수증 이미지)
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });
  console.log(`📁 정적 파일 서빙: /uploads -> ${uploadsPath}`);

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

  // Swagger UI 설정 (OpenAPI YAML 파일 사용)
  try {
    // dist/openapi.yaml (nest-cli assets로 복사됨)
    const openApiPath = path.join(__dirname, '..', 'openapi.yaml');
    const openApiDocument = yaml.load(
      fs.readFileSync(openApiPath, 'utf8'),
    ) as swaggerUi.JsonObject;
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
    console.log('📚 Swagger UI: http://localhost:3000/api-docs');
  } catch (error) {
    console.warn('⚠️ OpenAPI 문서를 로드할 수 없습니다:', (error as Error).message);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  if (isDev) {
    console.log('🔧 개발 모드: Firebase 인증이 우회됩니다 (dev-token 사용 가능)');
  }
}
bootstrap();
