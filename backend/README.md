# Momento Backend

NestJS + Prisma + PostgreSQL 기반 백엔드 서버

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 22.x | JavaScript 런타임 |
| NestJS | 11.x | 백엔드 프레임워크 |
| TypeScript | 5.x | 타입 안정성 |
| Prisma | 6.x | ORM |
| PostgreSQL | 16.x | 데이터베이스 |
| Socket.io | - | 실시간 통신 (스터디 탭) |
| Firebase Admin | 13.x | 인증 토큰 검증 |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에서 DATABASE_URL 등 수정
```

### 3. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 개발 환경 마이그레이션
npx prisma migrate dev

# 프로덕션 환경 마이그레이션
npx prisma migrate deploy
```

### 4. 서버 실행

```bash
# 개발 모드 (hot reload)
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

## 폴더 구조

```
backend/
├── prisma/
│   ├── schema.prisma      # DB 스키마 정의
│   └── migrations/        # 마이그레이션 히스토리
├── src/
│   ├── main.ts            # 앱 엔트리포인트
│   ├── app.module.ts      # 루트 모듈
│   └── modules/           # 기능별 모듈
├── dist/                  # 빌드 결과물 (gitignore)
├── .env                   # 환경 변수 (gitignore)
├── .env.example           # 환경 변수 템플릿
├── package.json           # 패키지 정의
└── tsconfig.json          # TypeScript 설정
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run start:dev` | 개발 서버 (hot reload) |
| `npm run start:prod` | 프로덕션 서버 |
| `npm run build` | TypeScript 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷팅 |
| `npx prisma studio` | DB GUI (localhost:5555) |
| `npx prisma migrate dev` | 마이그레이션 생성 |
| `npx prisma migrate deploy` | 마이그레이션 적용 |

## API 문서

상세 API 스펙은 [docs/API.md](../docs/API.md) 참고

## 환경 변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://user:pass@localhost:5432/momento` |
| `PORT` | 서버 포트 | `3000` |
| `NODE_ENV` | 환경 | `development` / `production` |
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | - |
