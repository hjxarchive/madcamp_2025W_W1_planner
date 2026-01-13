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
  // Firebase Admin 초기화
  if (!admin.apps.length) {
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with service account');
    } else {
      console.warn('⚠️ firebase-service-account.json not found');
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('✅ Firebase Admin initialized with default credentials');
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
  if (process.env.DEV_AUTH_BYPASS === 'true') {
    console.log('🔧 DEV_AUTH_BYPASS 모드: dev-token으로 인증 우회 가능');
  }
}
bootstrap();
