# Planner App - 워크플로우 관리 앱

협업과 개인 작업을 효율적으로 관리하는 Android 플래너 애플리케이션

## 📱 주요 기능

### 1. 회원가입 및 인증
- Firebase Authentication 기반 사용자 인증
- 닉네임 및 이모지 설정
- 자동 로그인 기능

### 2. 현재 (Current) - 진행 중인 프로젝트 관리
- **ListView 기반 프로젝트 목록**
  - 프로젝트명
  - Due date (마감일)
  - Progress Bar (진행도)
  - 대분류 Tag
- **정렬 및 필터링**
  - 시간순, 우선순위순, 진행도순 정렬
  - 태그별 필터링
- **개별 프로젝트 상세 화면**
  - Task 세부 목록
  - 메모 및 첨부파일
  - 진행 상황 업데이트

### 3. 과거 (Past) - 월별 아카이브
- **3D 회전 다이얼 갤러리**
  - [FFF.cmiscm.com](https://fff.cmiscm.com/#!/main) 스타일 인터페이스
  - 스큐어모피즘 디자인
  - 월별 잡지 형식 표현
- **월별 기록 조회**
  - 완료된 프로젝트 월별 그룹화
  - 성과 및 통계 시각화

### 4. 미래 (Future) - 협업 관리
- **꽃 모양 협업 인터페이스**
  - 중앙: 협업 목적 및 전체 진행률
  - 꽃잎: 각 참여자 정보 (닉네임, 이모지, 개인 진행률)
- **실시간 동기화**
  - WebSocket 기반 진행률 실시간 업데이트
  - 팀원 상태 실시간 확인
- **협업 기능**
  - 초대 코드를 통한 협업 참여
  - 개인별 업무 할당
  - 회의 일정 관리
  - 전체 진행도 계산 (평균)

### 5. 미래 (Future) - 스터디 모드
- **Nearby Connections API 활용**
  - 근처 디바이스 자동 탐지 및 연결
  - 같은 공간에서 스터디하는 인원 자동 매칭
- **실시간 스터디 세션**
  - 각 참여자의 진행 상황 표시
  - 함께한 시간 타이머
  - 실시간 작업 상태 공유
- **스터디 기록**
  - 세션 기록 저장
  - 통계 및 분석

---

## 🛠️ 기술 스택

### Frontend (Android)
- **UI Framework**: Jetpack Compose + Material3
- **Architecture**: MVVM + Clean Architecture
- **Navigation**: Navigation Compose
- **Dependency Injection**: Hilt
- **Database**: Room Database
- **Preferences**: DataStore
- **Image Loading**: Coil
- **Date/Time**: kotlinx-datetime
- **Gallery**: Accompanist Pager

### Backend & Network
- **API Communication**: Retrofit + OkHttp
- **Real-time Sync**: WebSocket (OkHttp WebSocket)
- **Asynchronous**: Kotlin Coroutines + Flow
- **Authentication**: Firebase Authentication
- **Nearby Detection**: Google Nearby Connections API

### Backend Server (권장)
- **Option 1**: Node.js + Express + MongoDB + Socket.io
- **Option 2**: Spring Boot + PostgreSQL + Spring WebSocket

---

## 📦 주요 Dependencies

```kotlin
// Navigation
implementation("androidx.navigation:navigation-compose:2.7.6")

// Room Database
implementation("androidx.room:room-runtime:2.6.1")
implementation("androidx.room:room-ktx:2.6.1")
kapt("androidx.room:room-compiler:2.6.1")

// Retrofit & OkHttp
implementation("com.squareup.retrofit2:retrofit:2.9.0")
implementation("com.squareup.retrofit2:converter-gson:2.9.0")
implementation("com.squareup.okhttp3:okhttp:4.12.0")
implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

// Hilt (Dependency Injection)
implementation("com.google.dagger:hilt-android:2.48")
kapt("com.google.dagger:hilt-compiler:2.48")
implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

// Coil (Image Loading)
implementation("io.coil-kt:coil-compose:2.5.0")

// DataStore
implementation("androidx.datastore:datastore-preferences:1.0.0")

// Firebase
implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
implementation("com.google.firebase:firebase-auth-ktx")

// Nearby Connections
implementation("com.google.android.gms:play-services-nearby:19.0.0")
implementation("com.google.android.gms:play-services-location:21.0.1")

// Date/Time
implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.5.0")

// Accompanist (Pager for Gallery)
implementation("com.google.accompanist:accompanist-pager:0.32.0")
implementation("com.google.accompanist:accompanist-pager-indicators:0.32.0")

// Permissions
implementation("com.google.accompanist:accompanist-permissions:0.32.0")
```

---

## 🏗️ 프로젝트 구조

```
app/src/main/java/com/madcampone/planner/
├── data/
│   ├── local/
│   │   ├── dao/
│   │   │   ├── ProjectDao.kt
│   │   │   ├── CollabDao.kt
│   │   │   └── StudySessionDao.kt
│   │   ├── entity/
│   │   │   ├── ProjectEntity.kt
│   │   │   ├── TaskEntity.kt
│   │   │   ├── CollabProjectEntity.kt
│   │   │   └── StudySessionEntity.kt
│   │   └── PlannerDatabase.kt
│   ├── remote/
│   │   ├── api/
│   │   │   ├── AuthApi.kt
│   │   │   ├── ProjectApi.kt
│   │   │   ├── CollabApi.kt
│   │   │   └── StudyApi.kt
│   │   ├── dto/
│   │   └── websocket/
│   │       └── WebSocketManager.kt
│   └── repository/
│       ├── AuthRepository.kt
│       ├── ProjectRepository.kt
│       ├── CollabRepository.kt
│       └── StudyRepository.kt
├── domain/
│   ├── model/
│   │   ├── Project.kt
│   │   ├── Task.kt
│   │   ├── CollabProject.kt
│   │   ├── StudySession.kt
│   │   └── User.kt
│   └── usecase/
│       ├── GetProjectsUseCase.kt
│       ├── CreateProjectUseCase.kt
│       ├── UpdateProgressUseCase.kt
│       └── ...
├── ui/
│   ├── auth/
│   │   ├── LoginScreen.kt
│   │   ├── SignUpScreen.kt
│   │   └── AuthViewModel.kt
│   ├── current/
│   │   ├── CurrentScreen.kt
│   │   ├── ProjectListScreen.kt
│   │   ├── ProjectDetailScreen.kt
│   │   └── CurrentViewModel.kt
│   ├── past/
│   │   ├── PastScreen.kt
│   │   ├── DialGalleryView.kt
│   │   ├── MonthDetailScreen.kt
│   │   └── PastViewModel.kt
│   ├── collab/
│   │   ├── CollabScreen.kt
│   │   ├── FlowerLayoutView.kt
│   │   ├── CollabDetailScreen.kt
│   │   └── CollabViewModel.kt
│   ├── study/
│   │   ├── StudyScreen.kt
│   │   ├── NearbyManager.kt
│   │   ├── StudySessionScreen.kt
│   │   └── StudyViewModel.kt
│   ├── navigation/
│   │   └── NavGraph.kt
│   ├── components/
│   │   ├── ProjectCard.kt
│   │   ├── ProgressBar.kt
│   │   └── ...
│   └── theme/
│       ├── Color.kt
│       ├── Theme.kt
│       └── Type.kt
├── di/
│   ├── AppModule.kt
│   ├── DatabaseModule.kt
│   ├── NetworkModule.kt
│   └── RepositoryModule.kt
├── util/
│   ├── Constants.kt
│   ├── Extensions.kt
│   └── DateUtils.kt
└── MainActivity.kt
```

---

## 📊 Database Schema

### Project Entity
```kotlin
@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey val id: String,
    val name: String,
    val dueDate: Long,
    val progress: Float, // 0.0 ~ 1.0
    val tags: List<String>,
    val isCompleted: Boolean,
    val createdAt: Long,
    val completedAt: Long?
)
```

### Task Entity
```kotlin
@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: String,
    val projectId: String,
    val description: String,
    val isDone: Boolean,
    val order: Int
)
```

### CollabProject Entity
```kotlin
@Entity(tableName = "collab_projects")
data class CollabProjectEntity(
    @PrimaryKey val id: String,
    val purpose: String,
    val participants: List<String>, // User IDs
    val schedules: List<Long>, // Meeting timestamps
    val overallProgress: Float,
    val createdAt: Long
)
```

### StudySession Entity
```kotlin
@Entity(tableName = "study_sessions")
data class StudySessionEntity(
    @PrimaryKey val id: String,
    val participants: List<String>,
    val startTime: Long,
    val endTime: Long?,
    val duration: Long, // milliseconds
    val location: String?
)
```

---

## 🔌 Backend API Endpoints

### Authentication
```
POST   /api/auth/signup          - 회원가입
POST   /api/auth/login           - 로그인
POST   /api/auth/refresh         - 토큰 갱신
GET    /api/auth/me              - 내 정보 조회
PUT    /api/auth/profile         - 프로필 수정
```

### Projects
```
GET    /api/projects             - 프로젝트 목록 조회
POST   /api/projects             - 프로젝트 생성
GET    /api/projects/:id         - 프로젝트 상세 조회
PUT    /api/projects/:id         - 프로젝트 수정
DELETE /api/projects/:id         - 프로젝트 삭제
PUT    /api/projects/:id/progress - 진행률 업데이트
```

### Collaboration
```
POST   /api/collab/create        - 협업 생성
POST   /api/collab/join          - 협업 참여 (초대코드)
GET    /api/collab/:id           - 협업 상세 조회
PUT    /api/collab/:id/progress  - 진행률 업데이트
GET    /api/collab/:id/members   - 참여자 목록
POST   /api/collab/:id/schedule  - 일정 추가
```

### Study
```
POST   /api/study/session        - 스터디 세션 생성
PUT    /api/study/session/:id    - 세션 종료
GET    /api/study/history        - 스터디 기록 조회
GET    /api/study/stats          - 통계 조회
```

### WebSocket
```
WS     /ws/collab/:id            - 협업 실시간 동기화
WS     /ws/study/:sessionId      - 스터디 실시간 동기화
```

---

## 🚀 개발 로드맵

### Phase 1: Setup & 기본 구조 (1-2일)
- [ ] Dependencies 추가
- [ ] 프로젝트 구조 생성
- [ ] Database Schema 구현
- [ ] Hilt DI 설정
- [ ] Navigation 설정

### Phase 2: 회원가입/인증 (1일)
- [ ] Firebase Auth 연동
- [ ] 로그인/회원가입 UI
- [ ] 닉네임/이모지 설정
- [ ] 자동 로그인 구현

### Phase 3: 현재 탭 (2-3일)
- [ ] Room Database 구현
- [ ] ProjectRepository 구현
- [ ] 프로젝트 리스트 UI
- [ ] 정렬/필터링 기능
- [ ] 프로젝트 상세 화면
- [ ] CRUD 기능

### Phase 4: 과거 탭 (3-4일)
- [ ] 3D 회전 다이얼 갤러리 UI
- [ ] 월별 아카이브 데이터 처리
- [ ] 애니메이션 구현
- [ ] 월별 상세 화면

### Phase 5: 협업 탭 (3-4일)
- [ ] Backend API 연동
- [ ] WebSocket 실시간 동기화
- [ ] 꽃 모양 커스텀 레이아웃
- [ ] 협업 생성/참여 기능
- [ ] 진행률 동기화

### Phase 6: 스터디 탭 (3-4일)
- [ ] Nearby Connections API 구현
- [ ] 권한 관리 (위치, 블루투스)
- [ ] 스터디 세션 UI
- [ ] 타이머 기능
- [ ] 실시간 상태 공유

### Phase 7: Integration & Polish (2-3일)
- [ ] 전체 Navigation 통합
- [ ] 에러 핸들링
- [ ] 오프라인 모드
- [ ] UI/UX 개선
- [ ] 버그 수정

### Phase 8: Testing & Deployment (2-3일)
- [ ] Unit Test
- [ ] UI Test
- [ ] 성능 최적화
- [ ] 앱 배포 준비

---

## 🔧 개발 환경 설정

### 필수 요구사항
- Android Studio Hedgehog (2023.1.1) 이상
- Kotlin 2.0.21
- minSdk 24 (Android 7.0)
- targetSdk 36 (Android 14)
- JDK 11

### 프로젝트 실행
1. Repository 클론
```bash
git clone [repository-url]
cd madcamp_2025W_W1_planner
```

2. Firebase 설정
- Firebase Console에서 프로젝트 생성
- `google-services.json` 파일을 `app/` 디렉토리에 추가

3. Local Properties 설정
```properties
# local.properties
sdk.dir=[Android SDK Path]
```

4. Build & Run
```bash
./gradlew build
./gradlew installDebug
```

---

## 📱 권한 요구사항

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
```

---

## 🎨 디자인 가이드

### Color Palette
- Primary: Material3 Dynamic Color
- Progress: Gradient (Green → Yellow → Red)
- Background: Surface colors

### Typography
- Headings: Material3 Display/Headline
- Body: Material3 Body
- Tags: Material3 Label

### Components
- Cards: Elevated with shadow
- Progress Bars: Custom gradient
- Buttons: Filled/Outlined variants

---

## 👥 팀 & 기여

### 개발자
- Android Client: [이름]
- Backend Server: [이름]
- UI/UX Design: [이름]

### 기여 방법
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 라이센스

[라이센스 정보 추가]

---

## 📞 연락처

프로젝트 관련 문의: [이메일 주소]

---

## 🙏 감사의 글

- Inspiration: [FFF.cmiscm.com](https://fff.cmiscm.com/#!/main)
- Icons: Material Icons
- UI Framework: Jetpack Compose
