# Momento 개발 가이드

## 개발 환경 설정

### 필수 요구사항

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 22.x | JavaScript 런타임 |
| npm | 10.x | 패키지 매니저 |
| PostgreSQL | 16.x | 데이터베이스 |
| Git | 2.x | 버전 관리 |

### React Native 개발 환경 (Frontend)

#### macOS
- Xcode (iOS 개발)
- Android Studio (Android 개발)
- Watchman (`brew install watchman`)

#### Windows
- Android Studio (Android 개발만 가능)

---

## 프로젝트 설정

### 1. 저장소 클론

```bash
git clone https://github.com/hjxarchive/madcamp_2025W_W1_planner.git momento
cd momento
```

### 2. Backend 설정

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

`.env` 파일 수정:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/momento?schema=public"
PORT=3000
NODE_ENV=development
```

```bash
# PostgreSQL 데이터베이스 생성
createdb momento

# Prisma 클라이언트 생성 및 마이그레이션
npm run prisma:generate
npm run prisma:migrate

# 개발 서버 실행
npm run start:dev
```

### 3. Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# iOS 의존성 설치 (macOS만)
cd ios && pod install && cd ..

# 환경 변수 설정
cp .env.example .env
```

```bash
# iOS 실행
npx react-native run-ios

# Android 실행 (에뮬레이터 먼저 실행)
npx react-native run-android
```

---

## Git 워크플로우

### 브랜치 전략

```
main              # 프로덕션 브랜치
├── develop       # 개발 브랜치
│   ├── feature/xxx   # 기능 개발
│   ├── fix/xxx       # 버그 수정
│   └── refactor/xxx  # 리팩토링
```

### 커밋 컨벤션

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트
- `chore`: 빌드, 설정 변경

**예시**
```
feat(project): 프로젝트 생성 API 구현

- POST /api/projects 엔드포인트 추가
- ProjectService 생성 로직 구현
- CreateProjectDto 유효성 검사 추가

Closes #123
```

---

## 서버 배포 (KCloud)

### 서버 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Nginx | 80, 443 | 리버스 프록시, SSL |
| NestJS | 3000 | 백엔드 API |
| PostgreSQL | 5432 | 데이터베이스 |

### Nginx 설정

```nginx
# /etc/nginx/sites-available/momento
server {
    listen 80;
    server_name api.momento.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.momento.app;

    ssl_certificate /etc/letsencrypt/live/api.momento.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.momento.app/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 설정

```bash
# PM2로 NestJS 앱 실행
cd /path/to/momento/backend
pm2 start dist/main.js --name momento-api

# 재시작
pm2 restart momento-api

# 로그 확인
pm2 logs momento-api

# 시작 시 자동 실행
pm2 startup
pm2 save
```

### 배포 스크립트

```bash
#!/bin/bash
# deploy.sh

cd /path/to/momento/backend

# 최신 코드 가져오기
git pull origin main

# 의존성 설치
npm install

# Prisma 마이그레이션
npm run prisma:migrate:prod

# 빌드
npm run build

# PM2 재시작
pm2 restart momento-api
```

---

## Prisma 관리

### 스키마 변경 후 마이그레이션

```bash
# 개발 환경 (마이그레이션 파일 생성)
npm run prisma:migrate

# 마이그레이션 이름 지정
npx prisma migrate dev --name add_rating_to_project

# 프로덕션 환경 (마이그레이션 적용만)
npm run prisma:migrate:prod
```

### Prisma Studio

```bash
# DB GUI 실행 (localhost:5555)
npm run prisma:studio
```

### 주의사항

⚠️ **Git에 올리면 안 되는 파일들**
- `.env` (환경 변수)
- `node_modules/` (의존성)
- `prisma/migrations/` 폴더의 `migration_lock.toml`은 커밋해야 함

✅ **Git에 올려야 하는 파일들**
- `prisma/schema.prisma` (스키마 정의)
- `prisma/migrations/` (마이그레이션 히스토리)
- `.env.example` (환경 변수 예시)

---

## 환경별 설정

### 개발 환경 (Development)

```env
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@localhost:5432/momento_dev"
```

### 테스트 환경 (Test)

```env
NODE_ENV=test
DATABASE_URL="postgresql://user:pass@localhost:5432/momento_test"
```

### 프로덕션 환경 (Production)

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@localhost:5432/momento"
```

---

## 추후 추가 예정

| 기술 | 용도 | 우선순위 |
|------|------|----------|
| @nestjs/websockets | 실시간 통신 | 높음 |
| socket.io | WebSocket 구현 | 높음 |
| firebase-admin | Firebase Auth 검증 | 높음 |
| Let's Encrypt | SSL 인증서 | 높음 |
| Redis | 세션 캐싱 | 중간 |
| AWS S3 | 이미지 저장 | 중간 |
