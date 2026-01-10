# Momento Frontend

React Native 기반 모바일 애플리케이션

## 시작하기

### 1. 환경 설정

React Native 개발 환경이 필요합니다:
- Node.js 18+
- Watchman (macOS)
- Xcode (iOS 개발)
- Android Studio (Android 개발)

### 2. 의존성 설치

```bash
npm install
```

### 3. iOS 실행

```bash
# iOS 시뮬레이터
npx react-native run-ios

# 특정 시뮬레이터
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### 4. Android 실행

```bash
# Android 에뮬레이터 (미리 실행 필요)
npx react-native run-android
```

## 폴더 구조

```
frontend/
├── src/
│   ├── components/      # 재사용 컴포넌트
│   ├── screens/         # 화면 컴포넌트
│   ├── navigation/      # 네비게이션 설정
│   ├── services/        # API 서비스
│   ├── hooks/           # 커스텀 훅
│   ├── utils/           # 유틸리티 함수
│   └── types/           # TypeScript 타입 정의
├── ios/                 # iOS 네이티브 코드
├── android/             # Android 네이티브 코드
└── .env                 # 환경 변수
```

## 주요 화면

1. **메인 탭**: 오늘의 활동 요약
2. **현재 탭**: 진행 중인 개인 프로젝트
3. **과거 탭**: 완료된 프로젝트 갤러리
4. **협업 탭**: 협업 프로젝트 관리
5. **스터디 탭**: 스터디 장소 공유
