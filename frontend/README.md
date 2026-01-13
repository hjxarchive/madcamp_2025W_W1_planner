# Momento - React Native Frontend

Momento 시간 추적 앱의 React Native 프론트엔드입니다.

## 요구사항

- Node.js 18+
- React Native CLI
- Android Studio (Android 개발용)
- JDK 17

## 설치

```bash
# 의존성 설치
npm install

# Android 개발 환경 설정
cd android && ./gradlew clean && cd ..
```

## 개발 서버 실행

```bash
# Metro 번들러 시작
npm start

# Android 앱 실행 (에뮬레이터 또는 연결된 기기)
npm run android
```

## 프로젝트 구조

```
frontend/
├── android/                    # Android 네이티브 코드
├── src/
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── TotalTimeDisplay.tsx
│   │   ├── TaskItem.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── FloatingTimer.tsx
│   │   └── ArchiveReceipt.tsx
│   ├── screens/               # 화면 컴포넌트
│   │   ├── HomeScreen.tsx     # 오늘 탭
│   │   ├── PastScreen.tsx     # 지난 탭 (영수증 보관함)
│   │   ├── StudyScreen.tsx    # 공부 탭
│   │   └── CollabScreen.tsx   # 협업 탭
│   ├── navigation/            # 네비게이션 설정
│   │   ├── BottomTabNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── services/              # API 및 스토리지 서비스
│   │   ├── api.ts
│   │   └── storage.ts
│   ├── hooks/                 # 커스텀 훅
│   ├── utils/                 # 유틸리티 함수
│   ├── constants/             # 상수 (색상, 크기 등)
│   │   └── index.ts
│   └── App.tsx                # 앱 진입점
├── index.js                   # React Native 진입점
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

## 주요 기능

### 1. 오늘 탭 (HomeScreen)
- 총 공부 시간 표시 (원형 프로그레스)
- 오늘의 할 일 목록
- 메인 프로젝트 카드
- 플로팅 타이머 위젯

### 2. 지난 탭 (PastScreen)
- 완료된 프로젝트 영수증 형태로 보관
- 바코드 스타일 타임라인
- 통계 요약

### 3. 공부 탭 (StudyScreen)
- 실시간 공부방 참여
- 스터디 세션 생성/참여
- 공부 통계

### 4. 협업 탭 (CollabScreen)
- 팀 프로젝트 관리
- 실시간 멤버 상태
- 초대 기능

## 스타일 가이드

### 색상
- Primary: #6366f1 (Indigo)
- Background: #0a0a0a
- Surface: #1a1a1a
- Text Primary: #ffffff
- Text Secondary: #a1a1aa

### 컴포넌트
- `BORDER_RADIUS`: 8, 12, 16, 24px
- `SPACING`: 4, 8, 12, 16, 20, 24, 32px
- `FONT_SIZES`: 10, 12, 14, 16, 18, 20, 24, 30, 36px

## API 연결

API는 `https://momento.dawoony.com/api`에 연결됩니다.
개발 시 로컬 서버를 사용하려면 `src/constants/index.ts`에서 `API_BASE_URL`을 수정하세요.

## 빌드

### Debug APK
```bash
cd android && ./gradlew assembleDebug
```

### Release APK
```bash
cd android && ./gradlew assembleRelease
```

APK 파일은 `android/app/build/outputs/apk/` 디렉토리에 생성됩니다.

## 테스트 기기

- Galaxy S10e
- Galaxy S22+
