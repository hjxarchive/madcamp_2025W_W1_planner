# Momento Frontend

React Native 기반 Android 모바일 애플리케이션

## 테스트 환경

| 기기 | 비고 |
|------|------|
| Galaxy S10e | 검증 완료 |
| Galaxy S22+ | 검증 완료 |

## 시작하기

### 1. 환경 설정

Android 개발 환경이 필요합니다:
- Node.js 18+
- JDK 17
- Android Studio (Hedgehog 이상)
- Android SDK 33+ (API Level 33)

### 2. Android Studio 설정

1. Android Studio 설치
2. SDK Manager에서 설치:
   - Android 13 (API 33) 이상
   - Android SDK Build-Tools
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM)

3. 에뮬레이터 생성 (AVD Manager):
   - Galaxy S10e: 1080x2280, 5.8"
   - Galaxy S22+: 1080x2340, 6.6"

### 3. 의존성 설치

```bash
npm install
```

### 4. 실행

```bash
# Android 에뮬레이터 또는 실제 기기 연결 후
npx react-native run-android

# 연결된 기기 목록 확인
adb devices

# 특정 기기로 실행
npx react-native run-android --deviceId=<device-id>

# Release 빌드
cd android && ./gradlew assembleRelease
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
├── android/             # Android 네이티브 코드
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   └── build.gradle
└── .env                 # 환경 변수
```

## 주요 화면

1. **메인 탭**: 오늘의 활동 요약
2. **현재 탭**: 진행 중인 개인 프로젝트
3. **과거 탭**: 완료된 프로젝트 갤러리
4. **협업 탭**: 협업 프로젝트 관리
5. **스터디 탭**: 스터디 장소 공유

## 디버깅

```bash
# Metro 번들러 실행
npx react-native start

# 로그 확인
npx react-native log-android

# React Native Debugger
# 앱에서 흔들기 → Debug 선택
```

## APK 빌드

```bash
cd android

# Debug APK
./gradlew assembleDebug

# Release APK
./gradlew assembleRelease

# APK 위치: android/app/build/outputs/apk/
```
