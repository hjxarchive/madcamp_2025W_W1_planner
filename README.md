# Momento - 효과적인 시간 관리 및 기록 시스템

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

개인 및 협업 프로젝트의 시간을 효과적으로 관리하고 기록하는 모바일 애플리케이션

## 📱 주요 기능

### 1. 메인 탭 (Today)
- 오늘 진행한 프로젝트 **총 시간** 표시
- 오늘 작업한 프로젝트 목록 요약
- 일일 활동 대시보드

### 2. 현재 탭 (Current)
- **진행 중인 개인 프로젝트** 리스트
  - 프로젝트 내 체크리스트가 모두 완료되지 않은 프로젝트
  - member가 1명인 개인 프로젝트만 표시
- 프로젝트별 진행률 및 총 작업 시간 표시
- 체크리스트 시작/정지 타이머 기능

### 3. 과거 탭 (Past)
- **완료된 프로젝트** 이미지 갤러리
  - 모든 체크리스트가 완료된 프로젝트
  - 음악 커버사진 스타일 UI
- 프로젝트별 총 소요 시간 및 완료일 표시
- 프로젝트 평점 (0~10)

### 4. 협업 탭 (Collaboration)
- **진행 중인 협업 프로젝트** 리스트
  - member가 2명 이상인 프로젝트
  - 현재 탭에서 사용자 추가 시 자동 이동
- 체크리스트별 담당자 할당 기능
- 팀원별 진행률 확인

### 5. 스터디 탭 (Study)
- **같은 장소**에서 공부하는 사람들 현황
- 참여자별 현재 진행 중인 프로젝트 제목
- 오늘 총 공부 시간 공유
- 장소 선택 (현재는 단순 select로 구현, 추후 위치 기반 확장 예정)

---

## 🛠️ 기술 스택

### Backend

| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Runtime | Node.js | 22.x | JavaScript 실행 환경 |
| Framework | NestJS | 10.x | 백엔드 프레임워크 |
| Language | TypeScript | 5.x | 타입 안정성 |
| ORM | Prisma | 6.x | 데이터베이스 접근 |
| Database | PostgreSQL | 16.x | 메인 데이터베이스 |

### Frontend

| 구분 | 기술 | 용도 |
|------|------|------|
| Framework | React Native | 모바일 앱 (iOS/Android) |
| 인증 | Firebase Auth | 사용자 인증 |

### Infrastructure

| 구분 | 기술 | 용도 |
|------|------|------|
| Server | KCloud (Ubuntu) | 호스팅 |
| Web Server | Nginx | 리버스 프록시, SSL |
| Process Manager | PM2 | Node.js 프로세스 관리 |

### 통신

| 구분 | 기술 | 용도 |
|------|------|------|
| API | REST API | CRUD 작업 |
| 실시간 | Socket.io (예정) | 스터디 탭 실시간 기능 |

---

## 📁 프로젝트 구조

```
momento/
├── backend/                 # NestJS 백엔드 서버
│   ├── prisma/
│   │   ├── schema.prisma    # DB 스키마 정의
│   │   ├── migrations/      # 마이그레이션 파일들
│   │   └── seed.ts          # 시드 데이터
│   ├── src/
│   │   ├── main.ts          # 앱 엔트리포인트
│   │   ├── app.module.ts    # 루트 모듈
│   │   └── modules/         # 기능별 모듈
│   └── .env.example         # 환경 변수 예시
│
├── frontend/                # React Native 앱
│   ├── src/
│   │   ├── components/      # 재사용 컴포넌트
│   │   ├── screens/         # 화면 컴포넌트
│   │   ├── navigation/      # 네비게이션 설정
│   │   ├── services/        # API 서비스
│   │   └── hooks/           # 커스텀 훅
│   └── .env.example         # 환경 변수 예시
│
└── docs/                    # 프로젝트 문서
    ├── API.md               # API 문서
    ├── DATABASE.md          # DB 스키마 문서
    └── DEVELOPMENT.md       # 개발 가이드
```

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 22.x 이상
- PostgreSQL 16.x
- React Native 개발 환경 (Xcode, Android Studio)

### Backend 설정

```bash
cd backend
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 DATABASE_URL 수정

# Prisma 설정
npm run prisma:generate
npm run prisma:migrate

# 개발 서버 실행
npm run start:dev
```

### Frontend 설정

```bash
cd frontend
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

자세한 설정 방법은 각 디렉토리의 README를 참고하세요:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

---

## 📖 문서

- [API 문서](./docs/API.md) - REST API 엔드포인트 정의
- [Database 문서](./docs/DATABASE.md) - 데이터베이스 스키마 설명
- [개발 가이드](./docs/DEVELOPMENT.md) - 개발 환경 설정 및 배포 가이드

---

## 🔐 포트 구성

| 포트 | 서비스 | 접근 |
|------|--------|------|
| 22 | SSH | 외부 |
| 80 | Nginx (HTTP) | 외부 |
| 443 | Nginx (HTTPS) | 외부 |
| 3000 | NestJS | 내부 |
| 5432 | PostgreSQL | 내부 |

---

## 📄 License

This project is licensed under the MIT License.
