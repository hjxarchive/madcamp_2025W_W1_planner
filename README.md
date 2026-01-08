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

## 🚀 Quick Start (개발자용)

### 사전 요구사항

- Android Studio Ladybug (2024.2.1) 이상
- JDK 17 이상
- Android SDK 35
- Kotlin 2.0.21

### 프로젝트 설정

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-repo/planner.git
cd planner

# 2. Android Studio에서 열기
# File > Open > planner 폴더 선택

# 3. Gradle Sync
# Android Studio가 자동으로 sync 시작
# 또는 File > Sync Project with Gradle Files
```

### 빌드 및 실행

```bash
# 빌드 (터미널)
./gradlew assembleDebug

# 또는 Android Studio에서
# Run > Run 'app' (Shift+F10)
```

### 현재 구현 상태

| Phase | 상태 | 설명 |
|-------|------|------|
| Phase 1 | ✅ 완료 | 프로젝트 구조, DB 스키마, Navigation, Repository |
| Phase 2 | 🔜 예정 | Firebase 인증 |
| Phase 3 | 🔜 예정 | 현재 탭 UI + 백엔드 API |
| Phase 4 | 🔜 예정 | 과거 탭 (3D 갤러리) |
| Phase 5 | 🔜 예정 | 협업 탭 (꽃 UI + WebSocket) |
| Phase 6 | 🔜 예정 | 스터디 탭 (Nearby API) |

### 분업 개발 시작하기

1. **README.md** 하단의 "분업 개발 가이드" 섹션 확인
2. 담당 Phase 확인 후 해당 명세서 참고
3. Stub 파일들이 이미 생성되어 있으므로 해당 파일에 구현 추가
4. Repository 인터페이스 기반으로 데이터 계층 구현

### 주요 파일 위치

| 용도 | 경로 |
|------|------|
| 화면 Composable | `ui/{feature}/` |
| ViewModel | `ui/{feature}/{Feature}ViewModel.kt` (생성 필요) |
| Repository 인터페이스 | `domain/repository/` |
| Repository 구현체 | `data/repository/` |
| Entity | `data/local/entity/` |
| DAO | `data/local/dao/` |
| API (예정) | `data/remote/api/` |
| 공통 컴포넌트 | `ui/components/` |

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

### 현재 구현 상태 (Phase 1 완료)

```
app/src/main/java/com/madcampone/planner/
├── MainActivity.kt                    # 앱 진입점 (@AndroidEntryPoint)
├── PlannerApplication.kt              # Hilt Application
│
├── data/
│   ├── local/
│   │   ├── PlannerDatabase.kt         # Room Database (4 entities)
│   │   ├── converter/
│   │   │   └── Converters.kt          # Room TypeConverters (List<String>, List<Long>)
│   │   ├── dao/
│   │   │   ├── ProjectDao.kt          # ✅ 구현됨
│   │   │   ├── TaskDao.kt             # ✅ 구현됨
│   │   │   ├── CollabDao.kt           # ✅ 구현됨
│   │   │   └── StudySessionDao.kt     # ✅ 구현됨
│   │   └── entity/
│   │       ├── ProjectEntity.kt       # ✅ 구현됨
│   │       ├── TaskEntity.kt          # ✅ 구현됨 (ForeignKey → Project)
│   │       ├── CollabProjectEntity.kt # ✅ 구현됨
│   │       └── StudySessionEntity.kt  # ✅ 구현됨
│   │
│   ├── remote/                        # 🔜 Phase 2 이후 구현
│   │   ├── api/                       # Retrofit API interfaces
│   │   ├── dto/                       # Data Transfer Objects
│   │   └── websocket/                 # WebSocket client
│   │
│   └── repository/                    # Repository 구현체
│       ├── ProjectRepositoryImpl.kt   # ✅ 구현됨 (Local DB)
│       ├── TaskRepositoryImpl.kt      # ✅ 구현됨 (Local DB)
│       ├── CollabRepositoryImpl.kt    # ✅ 구현됨 (Local DB)
│       └── StudyRepositoryImpl.kt     # ✅ 구현됨 (Local DB)
│
├── domain/
│   ├── model/                         # Domain Models
│   │   ├── Project.kt                 # ✅ 구현됨
│   │   ├── Task.kt                    # ✅ 구현됨
│   │   ├── CollabProject.kt           # ✅ 구현됨
│   │   ├── StudySession.kt            # ✅ 구현됨
│   │   └── User.kt                    # ✅ 구현됨
│   │
│   ├── repository/                    # Repository 인터페이스
│   │   ├── ProjectRepository.kt       # ✅ 구현됨
│   │   ├── TaskRepository.kt          # ✅ 구현됨
│   │   ├── CollabRepository.kt        # ✅ 구현됨
│   │   ├── StudyRepository.kt         # ✅ 구현됨
│   │   └── AuthRepository.kt          # ✅ 인터페이스 정의됨
│   │
│   └── usecase/                       # 🔜 선택적 구현 (필요시)
│
├── ui/
│   ├── MainScreen.kt                  # ✅ Bottom Navigation + Scaffold
│   │
│   ├── auth/
│   │   ├── LoginScreen.kt             # ✅ Stub
│   │   └── SignUpScreen.kt            # ✅ Stub
│   │
│   ├── current/
│   │   ├── CurrentScreen.kt           # ✅ Stub (프로젝트 목록)
│   │   ├── ProjectDetailScreen.kt     # ✅ Stub (프로젝트 상세)
│   │   ├── CreateProjectScreen.kt     # ✅ Stub (프로젝트 생성)
│   │   └── EditProjectScreen.kt       # ✅ Stub (프로젝트 수정)
│   │
│   ├── past/
│   │   ├── PastScreen.kt              # ✅ Stub (3D 다이얼 갤러리)
│   │   └── MonthDetailScreen.kt       # ✅ Stub (월별 상세)
│   │
│   ├── collab/
│   │   ├── CollabScreen.kt            # ✅ Stub (꽃 모양 UI)
│   │   ├── CollabDetailScreen.kt      # ✅ Stub (협업 상세)
│   │   ├── CreateCollabScreen.kt      # ✅ Stub (협업 생성)
│   │   └── JoinCollabScreen.kt        # ✅ Stub (협업 참여)
│   │
│   ├── study/
│   │   ├── StudyScreen.kt             # ✅ Stub (Nearby 스터디)
│   │   └── StudySessionScreen.kt      # ✅ Stub (스터디 세션)
│   │
│   ├── navigation/
│   │   ├── Screen.kt                  # ✅ 모든 라우트 정의
│   │   ├── NavGraph.kt                # ✅ Navigation 설정
│   │   └── BottomNavItem.kt           # ✅ Bottom Nav 아이템
│   │
│   ├── components/                    # 공통 UI 컴포넌트
│   │   ├── LoadingIndicator.kt        # ✅ 구현됨
│   │   ├── ErrorView.kt               # ✅ 구현됨
│   │   ├── EmptyView.kt               # ✅ 구현됨
│   │   ├── PlannerTopBar.kt           # ✅ 구현됨
│   │   └── ProgressBar.kt             # ✅ 구현됨
│   │
│   └── theme/
│       ├── Color.kt                   # ✅ 구현됨
│       ├── Theme.kt                   # ✅ 구현됨
│       └── Type.kt                    # ✅ 구현됨
│
├── di/                                # Hilt DI Modules
│   ├── AppModule.kt                   # ✅ 구현됨
│   ├── DatabaseModule.kt              # ✅ 구현됨 (Room DB, DAOs)
│   ├── NetworkModule.kt               # ✅ 구현됨 (Retrofit, OkHttp)
│   └── RepositoryModule.kt            # ✅ 구현됨 (Repository bindings)
│
└── util/
    └── Constants.kt                   # ✅ 구현됨
```

### 파일 통계

| 카테고리 | 파일 수 | 상태 |
|---------|--------|------|
| Data Layer | 13 | ✅ 완료 |
| Domain Layer | 10 | ✅ 완료 |
| UI Layer | 21 | ✅ Stub 완료 |
| DI | 4 | ✅ 완료 |
| Util | 1 | ✅ 완료 |
| **총계** | **56** | **Phase 1 완료** |

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

### Phase 1: Setup & 기본 구조 (1-2일) ✅ 완료
- [x] Dependencies 추가
- [x] 프로젝트 구조 생성
- [x] Database Schema 구현
- [x] Hilt DI 설정
- [x] Navigation 설정

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

---

## 📝 개발 로그

### Phase 1: Setup & 기본 구조 (2025-01-08)

#### 1. Dependencies 추가

**`gradle/libs.versions.toml`** - Version Catalog 설정
```toml
# 주요 버전
kotlin = "2.0.21"
ksp = "2.0.21-1.0.27"
composeBom = "2024.12.01"
room = "2.6.1"
hilt = "2.53.1"
navigationCompose = "2.8.5"
retrofit = "2.11.0"
firebaseBom = "33.7.0"
```

**`app/build.gradle.kts`** - 추가된 Dependencies
- Navigation Compose
- Room Database + KSP
- Hilt + Hilt Navigation Compose
- Retrofit + OkHttp + Logging Interceptor
- Coil (Image Loading)
- DataStore Preferences
- Firebase Auth
- Nearby Connections API
- kotlinx-datetime
- Accompanist (Pager, Permissions)
- Material Icons Extended

#### 2. 프로젝트 구조 생성

```
app/src/main/java/com/madcampone/planner/
├── MainActivity.kt                    # @AndroidEntryPoint
├── PlannerApplication.kt              # @HiltAndroidApp
├── data/
│   └── local/
│       ├── PlannerDatabase.kt         # Room Database
│       ├── converter/Converters.kt    # TypeConverter
│       ├── dao/                       # ProjectDao, TaskDao, CollabDao, StudySessionDao
│       └── entity/                    # 4개 Entity 클래스
├── di/
│   ├── AppModule.kt                   # DataStore
│   ├── DatabaseModule.kt              # Room + DAOs
│   └── NetworkModule.kt               # OkHttp + Retrofit
├── domain/model/                      # User, Project, Task, CollabProject, StudySession
├── ui/
│   ├── MainScreen.kt                  # BottomNavigation
│   ├── navigation/                    # Screen, BottomNavItem, NavGraph
│   ├── auth/                          # Login, SignUp
│   ├── current/                       # Current, ProjectDetail, Create, Edit
│   ├── past/                          # Past, MonthDetail
│   ├── collab/                        # Collab, CollabDetail, Create, Join
│   └── study/                         # Study, StudySession
└── util/Constants.kt                  # BASE_URL, Tags, SortOrder
```

#### 3. Database Schema 구현

**Room Entity 4개 생성:**

| Entity | 테이블명 | 주요 필드 |
|--------|----------|-----------|
| `ProjectEntity` | projects | id, name, dueDate, progress, tags, isCompleted |
| `TaskEntity` | tasks | id, projectId (FK), description, isDone, order |
| `CollabProjectEntity` | collab_projects | id, purpose, participants, schedules, overallProgress |
| `StudySessionEntity` | study_sessions | id, participants, startTime, endTime, duration |

**DAO 4개 생성:**
- `ProjectDao`: 활성/완료 프로젝트 조회, 월별 필터링, CRUD
- `TaskDao`: 프로젝트별 태스크, 완료 개수 카운트
- `CollabDao`: 협업 프로젝트 CRUD
- `StudySessionDao`: 세션 관리, 통계 (총 시간, 세션 수)

**TypeConverter:**
- `List<String>` ↔ JSON
- `List<Long>` ↔ JSON

#### 4. Hilt DI 설정

**3개 Module 생성:**

| Module | 제공하는 의존성 |
|--------|----------------|
| `AppModule` | DataStore<Preferences> |
| `DatabaseModule` | PlannerDatabase, ProjectDao, TaskDao, CollabDao, StudySessionDao |
| `NetworkModule` | OkHttpClient, Retrofit, HttpLoggingInterceptor |

**Application 클래스:**
```kotlin
@HiltAndroidApp
class PlannerApplication : Application()
```

**MainActivity:**
```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity()
```

#### 5. Navigation 설정

**Screen Routes 정의:**
```kotlin
sealed class Screen(val route: String) {
    // Auth
    data object Login : Screen("login")
    data object SignUp : Screen("signup")

    // Main Tabs
    data object Current : Screen("current")
    data object Past : Screen("past")
    data object Collab : Screen("collab")
    data object Study : Screen("study")

    // Detail Screens (with arguments)
    data object ProjectDetail : Screen("project/{projectId}")
    data object MonthDetail : Screen("month/{yearMonth}")
    // ...
}
```

**Bottom Navigation:**
- Current (DateRange 아이콘)
- Past (History 아이콘)
- Collab (Groups 아이콘)
- Study (School 아이콘)

**NavGraph:**
- 모든 화면 Composable 연결
- NavArgument 설정 (projectId, yearMonth, collabId, sessionId)

#### 6. AndroidManifest.xml 업데이트

**추가된 권한:**
```xml
<!-- Internet -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Location -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Bluetooth -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- Nearby -->
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
```

**Application 클래스 등록:**
```xml
<application android:name=".PlannerApplication" ...>
```

#### 7. Repository Pattern 구현 (Clean Architecture)

**Domain Layer - Repository 인터페이스 (5개):**

| Interface | 주요 메서드 |
|-----------|------------|
| `ProjectRepository` | getAllProjects(), getCurrentProject(), getProjectsByMonth() |
| `TaskRepository` | getTasksByProjectId(), toggleTaskCompletion() |
| `CollabRepository` | joinCollabProject(), leaveCollabProject() |
| `StudyRepository` | getActiveStudySessions(), endStudySession() |
| `AuthRepository` | signIn(), signUp(), signOut() |

**Data Layer - Repository 구현체 (4개):**

| Implementation | 설명 |
|----------------|------|
| `ProjectRepositoryImpl` | Room DB 기반, currentProjectId 관리 |
| `TaskRepositoryImpl` | Room DB 기반, 태스크 완료 토글 |
| `CollabRepositoryImpl` | Room DB 기반, Remote API 연동 예정 |
| `StudyRepositoryImpl` | Room DB 기반, 세션 종료 시 duration 계산 |

**DI Module 추가:**
```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds abstract fun bindProjectRepository(impl: ProjectRepositoryImpl): ProjectRepository
    @Binds abstract fun bindTaskRepository(impl: TaskRepositoryImpl): TaskRepository
    @Binds abstract fun bindCollabRepository(impl: CollabRepositoryImpl): CollabRepository
    @Binds abstract fun bindStudyRepository(impl: StudyRepositoryImpl): StudyRepository
}
```

#### 8. 공통 UI 컴포넌트 구현

| Component | 설명 | 사용처 |
|-----------|------|--------|
| `LoadingIndicator` | 전체 화면 로딩, 작은 로딩 버전 | 모든 화면 |
| `ErrorView` | 에러 메시지 + 재시도 버튼 | 데이터 로딩 실패 시 |
| `EmptyView` | 빈 상태 표시 (아이콘 + 메시지) | 리스트 비어있을 때 |
| `PlannerTopBar` | 공통 상단 앱바 (뒤로가기 + 액션) | Detail 화면들 |
| `ProgressBar` | 프로젝트 진행률 표시 (색상 변화) | Project 관련 화면 |

---

#### 생성된 파일 목록 (56개)

| 카테고리 | 파일 수 | 주요 파일 |
|----------|---------|-----------|
| Gradle 설정 | 3 | libs.versions.toml, build.gradle.kts (root, app) |
| Application | 2 | MainActivity.kt, PlannerApplication.kt |
| Data/Local | 10 | Database, Converters, 4 DAOs, 4 Entities |
| Data/Repository | 4 | ProjectRepositoryImpl, TaskRepositoryImpl, CollabRepositoryImpl, StudyRepositoryImpl |
| Domain/Model | 5 | User, Project, Task, CollabProject, StudySession |
| Domain/Repository | 5 | ProjectRepository, TaskRepository, CollabRepository, StudyRepository, AuthRepository |
| DI Modules | 4 | AppModule, DatabaseModule, NetworkModule, RepositoryModule |
| UI Screens | 14 | MainScreen + 13 화면 Composables |
| UI Components | 5 | LoadingIndicator, ErrorView, EmptyView, PlannerTopBar, ProgressBar |
| Navigation | 3 | Screen, BottomNavItem, NavGraph |
| Theme | 3 | Color, Theme, Type |
| Util | 1 | Constants |
| Config | 2 | AndroidManifest.xml, .gitignore |

---

#### 다음 단계: Phase 2

Phase 2에서는 **회원가입/인증**을 구현합니다:
- Firebase Auth 연동
- 로그인/회원가입 UI 완성
- 닉네임/이모지 설정
- 자동 로그인 구현

---

## 👥 분업 개발 가이드

### Phase 의존성 분석

```
Phase 1 (완료) ─┬─> Phase 2 (인증) ───> 모든 Phase에서 사용자 정보 필요
               │
               ├─> Phase 3 (현재) ───> Phase 4 (과거)에서 완료된 프로젝트 표시
               │        │              Phase 5, 6에서 현재 진행 상황 공유
               │        │
               │        └─> 백엔드 서버 필요 (프로젝트 동기화)
               │
               ├─> Phase 5 (협업) ───> 백엔드 서버 필요
               │        │              Phase 3의 프로젝트 정보 참조
               │        │
               │        └─> Phase 3 API 의존
               │
               └─> Phase 6 (스터디) ─> Nearby API 사용
                        │              Phase 3의 현재 작업 정보 공유
                        │
                        └─> Phase 3 API 의존
```

**데이터 흐름:**
```
┌─────────────────────────────────────────────────────────────┐
│                        Backend Server                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Projects   │  │   Collab    │  │   Study     │          │
│  │    API      │←─│    API      │  │    API      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
         ↑                 ↑                 ↑
         │                 │                 │
    ┌────┴────┐       ┌────┴────┐       ┌────┴────┐
    │ Phase 3 │       │ Phase 5 │       │ Phase 6 │
    │ 현재 탭 │──────→│ 협업 탭 │       │스터디 탭│
    └─────────┘       └─────────┘       └─────────┘
         │                 ↑                 ↑
         └─────────────────┴─────────────────┘
              현재 진행 중인 프로젝트 정보 공유
```

### 병렬 개발 가능 여부

| Phase | 독립성 | 백엔드 필요 | 특수 API | 병렬 개발 |
|-------|--------|-------------|----------|-----------|
| Phase 2 (인증) | 중간 | Firebase | - | ⚠️ 우선 개발 권장 |
| Phase 3 (현재) | 중간 | **필수** | - | ⚠️ API 우선 정의 필요 |
| Phase 4 (과거) | 높음 | Phase 3 API 사용 | - | ✅ 가능 |
| Phase 5 (협업) | 중간 | **필수** | WebSocket | Phase 3 API 의존 |
| Phase 6 (스터디) | 중간 | Phase 3 API 사용 | Nearby API | Phase 3 API 의존 |

> **중요**: Phase 3의 Projects API가 Phase 5(협업), Phase 6(스터디)에서 사용됩니다.
> 협업/스터디 시 상대방의 현재 진행 중인 프로젝트 정보를 공유하기 위함입니다.

---

### 권장 분업 구조

#### Option A: 4명 개발자

| 담당자 | Phase | 역할 | 예상 기간 |
|--------|-------|------|-----------|
| **개발자 A** | Phase 2 + 공통 | 인증 + UserRepository + 공통 컴포넌트 | 2일 |
| **개발자 B** | Phase 3 + 4 | 현재 탭 + 과거 탭 (프로젝트 CRUD + 아카이브) | 4일 |
| **개발자 C** | Phase 5 | 협업 탭 + 백엔드 연동 | 4일 |
| **개발자 D** | Phase 6 | 스터디 탭 + Nearby API | 3일 |

#### Option B: 3명 개발자

| 담당자 | Phase | 역할 |
|--------|-------|------|
| **개발자 A** | Phase 2 + 3 | 인증 + 현재 탭 (핵심 기능) |
| **개발자 B** | Phase 4 + 5 | 과거 탭 + 협업 탭 (UI 중심) |
| **개발자 C** | Phase 6 | 스터디 탭 (독립 기능) |

#### Option C: 2명 개발자

| 담당자 | Phase | 역할 |
|--------|-------|------|
| **개발자 A** | Phase 2 + 3 + 4 | 인증 + 개인 작업 관리 (현재/과거) |
| **개발자 B** | Phase 5 + 6 | 협업 기능 (협업/스터디) |

---

### 분업 전 준비 상태 체크리스트

#### ✅ 이미 완료된 항목 (Phase 1)

- [x] 프로젝트 구조 생성 완료 (56개 파일)
- [x] 모든 화면 Stub 파일 생성 완료 (14개 Screen)
- [x] Navigation 설정 완료 (Screen routes, NavGraph, BottomNavItem)
- [x] Room Database 스키마 정의 완료 (4 Entity, 4 DAO)
- [x] Hilt DI 모듈 설정 완료 (4 Module)
- [x] Domain Model 정의 완료 (5 Model)
- [x] Repository 인터페이스 정의 완료 (5 Interface)
- [x] Repository 구현체 생성 완료 (4 Implementation)
- [x] 공통 UI 컴포넌트 생성 완료 (5 Component)
- [x] .gitignore 정리 완료

#### ⚠️ 분업 전 합의 필요 사항

- [ ] Git 브랜치 전략 결정 (feature/phase-2, feature/phase-3, ...)
- [ ] 코드 스타일 가이드 합의
- [ ] PR/코드 리뷰 프로세스 결정
- [ ] 공통 컴포넌트 담당자 지정

#### 🔴 API 명세 우선 정의 필요 (중요!)

Phase 3, 5, 6이 서버 API에 의존하므로, **개발 시작 전 API 명세를 먼저 확정**해야 합니다.

| API | 담당 | 의존하는 Phase | 우선순위 |
|-----|------|----------------|----------|
| **Projects API** | Phase 3 담당자 + 백엔드 | Phase 3, 4, 5, 6 | 🔴 최우선 |
| **Collab API** | Phase 5 담당자 + 백엔드 | Phase 5 | 높음 |
| **Auth API** | Phase 2 담당자 + Firebase | 전체 | 높음 |

**권장 개발 순서:**
```
1일차: API 명세 확정 (Projects API, Collab API)
       ↓
2일차: Phase 2 (인증) 시작 + 백엔드 Projects API 개발
       ↓
3일차~: Phase 3, 4, 5, 6 병렬 개발 시작
```

**Projects API가 중요한 이유:**
- Phase 5 (협업): 참여자의 현재 프로젝트를 꽃잎에 표시
- Phase 6 (스터디): 참여자의 현재 작업을 실시간 공유
- 모두 `GET /api/projects?userId={userId}` 엔드포인트에 의존

---

### 각 Phase별 개발 명세

---

#### Phase 2: 회원가입/인증 명세

**담당 파일:**
```
ui/auth/
├── LoginScreen.kt          # 수정
├── SignUpScreen.kt         # 수정
└── AuthViewModel.kt        # 신규 생성

data/repository/
└── AuthRepository.kt       # 신규 생성

data/remote/api/
└── AuthApi.kt              # 신규 생성 (선택)
```

**구현 항목:**

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| Firebase 초기화 | google-services.json 연동 | 필수 |
| 이메일/비밀번호 로그인 | FirebaseAuth.signInWithEmailAndPassword | 필수 |
| 회원가입 | FirebaseAuth.createUserWithEmailAndPassword | 필수 |
| 닉네임/이모지 설정 | DataStore에 저장 | 필수 |
| 자동 로그인 | FirebaseAuth.currentUser 체크 | 필수 |
| 로그아웃 | FirebaseAuth.signOut | 필수 |
| Google 로그인 | OAuth 연동 | 선택 |

**AuthRepository 인터페이스:**
```kotlin
interface AuthRepository {
    val currentUser: Flow<User?>
    val isLoggedIn: Flow<Boolean>

    suspend fun signIn(email: String, password: String): Result<User>
    suspend fun signUp(email: String, password: String, nickname: String, emoji: String): Result<User>
    suspend fun signOut()
    suspend fun updateProfile(nickname: String, emoji: String): Result<Unit>
}
```

**다른 Phase에 제공할 것:**
- `currentUser: Flow<User?>` - 현재 로그인된 사용자 정보
- `isLoggedIn: Flow<Boolean>` - 로그인 상태

---

#### Phase 3: 현재 탭 명세

> **⚠️ 중요**: Phase 3의 프로젝트 데이터는 **서버에서 관리**됩니다.
> 협업(Phase 5)과 스터디(Phase 6)에서 상대방의 현재 진행 상황을 공유하기 위함입니다.

**담당 파일:**
```
ui/current/
├── CurrentScreen.kt        # 수정
├── ProjectDetailScreen.kt  # 수정
├── CreateProjectScreen.kt  # 수정
├── EditProjectScreen.kt    # 수정
└── CurrentViewModel.kt     # 신규 생성

ui/components/
├── ProjectCard.kt          # 신규 생성
├── ProgressBar.kt          # 신규 생성
├── TagChip.kt              # 신규 생성
└── SortFilterBar.kt        # 신규 생성

data/repository/
└── ProjectRepository.kt    # 신규 생성 (Remote + Local 캐싱)

data/remote/api/
└── ProjectApi.kt           # 신규 생성
```

**구현 항목:**

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 프로젝트 목록 표시 | API GET + LazyColumn | 필수 |
| 프로젝트 생성 | API POST → 로컬 캐시 | 필수 |
| 프로젝트 수정 | API PUT → 로컬 캐시 | 필수 |
| 프로젝트 삭제 | API DELETE + 확인 다이얼로그 | 필수 |
| 태스크 CRUD | API 연동 태스크 관리 | 필수 |
| 진행률 자동 계산 | 서버에서 계산 또는 클라이언트 계산 후 동기화 | 필수 |
| 정렬 기능 | 마감일순, 진행률순, 생성일순 | 필수 |
| 태그 필터링 | Work, Personal, Study, Health, Other | 필수 |
| 프로젝트 완료 처리 | API PUT (isCompleted, completedAt) | 필수 |
| **오프라인 지원** | Room 캐싱 + 네트워크 복구 시 동기화 | 권장 |
| **Pull-to-Refresh** | 서버에서 최신 데이터 가져오기 | 필수 |

**Backend API (ProjectApi.kt):**
```kotlin
interface ProjectApi {
    @GET("projects")
    suspend fun getProjects(
        @Query("status") status: String? = null,  // "active" | "completed"
        @Query("userId") userId: String
    ): Response<List<ProjectDto>>

    @GET("projects/{id}")
    suspend fun getProjectById(@Path("id") id: String): Response<ProjectDto>

    @POST("projects")
    suspend fun createProject(@Body project: CreateProjectRequest): Response<ProjectDto>

    @PUT("projects/{id}")
    suspend fun updateProject(
        @Path("id") id: String,
        @Body project: UpdateProjectRequest
    ): Response<ProjectDto>

    @DELETE("projects/{id}")
    suspend fun deleteProject(@Path("id") id: String): Response<Unit>

    @PUT("projects/{id}/progress")
    suspend fun updateProgress(
        @Path("id") id: String,
        @Body progress: UpdateProgressRequest
    ): Response<ProjectDto>

    // Task API
    @GET("projects/{projectId}/tasks")
    suspend fun getTasks(@Path("projectId") projectId: String): Response<List<TaskDto>>

    @POST("projects/{projectId}/tasks")
    suspend fun createTask(
        @Path("projectId") projectId: String,
        @Body task: CreateTaskRequest
    ): Response<TaskDto>

    @PUT("tasks/{taskId}")
    suspend fun updateTask(
        @Path("taskId") taskId: String,
        @Body task: UpdateTaskRequest
    ): Response<TaskDto>

    @DELETE("tasks/{taskId}")
    suspend fun deleteTask(@Path("taskId") taskId: String): Response<Unit>
}
```

**ProjectRepository 인터페이스:**
```kotlin
interface ProjectRepository {
    // 서버에서 가져오기 (캐싱 포함)
    fun getActiveProjects(): Flow<List<Project>>
    fun getCompletedProjects(): Flow<List<Project>>
    fun getProjectById(id: String): Flow<Project?>

    // 서버로 CRUD
    suspend fun createProject(project: Project): Result<Project>
    suspend fun updateProject(project: Project): Result<Project>
    suspend fun deleteProject(id: String): Result<Unit>
    suspend fun markAsCompleted(id: String): Result<Project>
    suspend fun updateProgress(id: String, progress: Float): Result<Project>

    // Task 관련
    fun getTasksByProjectId(projectId: String): Flow<List<Task>>
    suspend fun createTask(task: Task): Result<Task>
    suspend fun updateTaskStatus(taskId: String, isDone: Boolean): Result<Task>
    suspend fun deleteTask(taskId: String): Result<Unit>

    // 동기화
    suspend fun syncProjects(): Result<Unit>
    suspend fun refreshProjects(): Result<Unit>

    // Phase 5, 6에서 사용할 API
    suspend fun getProjectsByUserId(userId: String): Result<List<Project>>
    fun getCurrentProjectFlow(userId: String): Flow<Project?>  // 현재 작업 중인 프로젝트
}
```

**Repository 구현 전략 (Remote + Local 캐싱):**
```kotlin
class ProjectRepositoryImpl @Inject constructor(
    private val projectApi: ProjectApi,
    private val projectDao: ProjectDao,
    private val taskDao: TaskDao
) : ProjectRepository {

    override fun getActiveProjects(): Flow<List<Project>> = flow {
        // 1. 먼저 로컬 캐시 emit
        emitAll(projectDao.getActiveProjects().map { entities ->
            entities.map { it.toDomainModel() }
        })
    }.onStart {
        // 2. 백그라운드에서 서버 동기화
        try {
            val response = projectApi.getProjects(status = "active", userId = currentUserId)
            if (response.isSuccessful) {
                response.body()?.let { dtos ->
                    projectDao.insertProjects(dtos.map { it.toEntity() })
                }
            }
        } catch (e: Exception) {
            // 네트워크 에러 시 로컬 캐시 사용
        }
    }

    // ... 나머지 구현
}
```

**UI 컴포넌트 명세:**

```kotlin
// ProjectCard.kt
@Composable
fun ProjectCard(
    project: Project,
    onClick: () -> Unit,
    onLongClick: () -> Unit = {}
)

// ProgressBar.kt
@Composable
fun GradientProgressBar(
    progress: Float,  // 0.0 ~ 1.0
    modifier: Modifier = Modifier
)

// TagChip.kt
@Composable
fun TagChip(
    tag: String,
    isSelected: Boolean = false,
    onClick: () -> Unit = {}
)
```

**Phase 4에 제공할 것:**
- `getCompletedProjects(): Flow<List<Project>>` - 완료된 프로젝트 목록
- `getProjectsByMonth(startOfMonth, endOfMonth)` - 월별 필터링

---

#### Phase 4: 과거 탭 명세

**담당 파일:**
```
ui/past/
├── PastScreen.kt           # 수정
├── MonthDetailScreen.kt    # 수정
├── DialGalleryView.kt      # 신규 생성 (3D 갤러리)
├── MonthCoverCard.kt       # 신규 생성
└── PastViewModel.kt        # 신규 생성
```

**구현 항목:**

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 3D 회전 다이얼 갤러리 | 월별 잡지 스타일 표현 | 필수 |
| 월별 그룹화 | completedAt 기준 그룹화 | 필수 |
| 월 커버 카드 | 완료 프로젝트 수, 대표 이미지 | 필수 |
| 월별 상세 화면 | 해당 월 완료 프로젝트 목록 | 필수 |
| 통계 시각화 | 월별 완료 수, 태그 분포 | 선택 |
| 스와이프 애니메이션 | 부드러운 3D 전환 | 필수 |

**3D 갤러리 구현 가이드:**

```kotlin
// DialGalleryView.kt
@Composable
fun DialGalleryView(
    months: List<MonthArchive>,
    onMonthClick: (String) -> Unit,  // "2025-01" 형식
    modifier: Modifier = Modifier
)

data class MonthArchive(
    val yearMonth: String,           // "2025-01"
    val projectCount: Int,
    val topTags: List<String>,
    val coverImageUrl: String?
)
```

**참고 디자인:**
- [FFF.cmiscm.com](https://fff.cmiscm.com/#!/main) 스타일
- 스큐어모피즘 디자인 적용
- Canvas API 또는 graphicsLayer 활용

**Phase 3에서 받을 것:**
- `getCompletedProjects()` 또는 `getProjectsByMonth()`

---

#### Phase 5: 협업 탭 명세

> **Phase 3 연동**: 협업 시 각 참여자의 **현재 진행 중인 프로젝트**를 꽃잎에 표시합니다.
> `ProjectRepository.getCurrentProjectFlow(userId)`를 사용하여 실시간으로 가져옵니다.

**담당 파일:**
```
ui/collab/
├── CollabScreen.kt         # 수정
├── CollabDetailScreen.kt   # 수정
├── CreateCollabScreen.kt   # 수정
├── JoinCollabScreen.kt     # 수정
├── FlowerLayoutView.kt     # 신규 생성 (꽃 UI)
└── CollabViewModel.kt      # 신규 생성

data/repository/
└── CollabRepository.kt     # 신규 생성

data/remote/
├── api/CollabApi.kt        # 신규 생성
└── websocket/
    └── WebSocketManager.kt # 신규 생성
```

**구현 항목:**

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 협업 생성 | 목적 입력, 초대코드 생성 | 필수 |
| 협업 참여 | 초대코드 입력으로 참여 | 필수 |
| 꽃 모양 UI | 중앙(목적) + 꽃잎(참여자) | 필수 |
| 실시간 진행률 | WebSocket 연동 | 필수 |
| 참여자 목록 | 닉네임, 이모지, 개인 진행률 | 필수 |
| 전체 진행률 계산 | 참여자 진행률 평균 | 필수 |
| **참여자 현재 프로젝트 표시** | Phase 3 API로 현재 작업 중인 프로젝트 조회 | 필수 |
| 회의 일정 추가 | 날짜/시간 선택 | 선택 |

**꽃 모양 UI 명세:**

```kotlin
// FlowerLayoutView.kt
@Composable
fun FlowerLayoutView(
    center: FlowerCenter,
    petals: List<FlowerPetal>,
    modifier: Modifier = Modifier
)

data class FlowerCenter(
    val purpose: String,
    val overallProgress: Float
)

data class FlowerPetal(
    val userId: String,
    val nickname: String,
    val emoji: String,
    val progress: Float,
    val isOnline: Boolean,
    val currentProject: Project?  // Phase 3에서 가져온 현재 작업 중인 프로젝트
)
```

**Phase 3 연동 예시:**
```kotlin
// CollabViewModel.kt
@HiltViewModel
class CollabViewModel @Inject constructor(
    private val collabRepository: CollabRepository,
    private val projectRepository: ProjectRepository  // Phase 3 Repository 주입
) : ViewModel() {

    fun getParticipantWithCurrentProject(userId: String): Flow<FlowerPetal> {
        return combine(
            collabRepository.getParticipant(userId),
            projectRepository.getCurrentProjectFlow(userId)  // Phase 3 API 사용
        ) { participant, currentProject ->
            FlowerPetal(
                userId = participant.userId,
                nickname = participant.nickname,
                emoji = participant.emoji,
                progress = participant.progress,
                isOnline = participant.isOnline,
                currentProject = currentProject
            )
        }
    }
}
```

**레이아웃 계산:**
```
참여자 수에 따른 꽃잎 배치:
- 2명: 180° 간격
- 3명: 120° 간격
- 4명: 90° 간격
- 5명: 72° 간격
- n명: 360°/n 간격
```

**WebSocket 메시지 형식:**
```kotlin
// 보내기
data class ProgressUpdateMessage(
    val collabId: String,
    val userId: String,
    val progress: Float
)

// 받기
data class CollabStateMessage(
    val collabId: String,
    val participants: List<ParticipantState>
)
```

**백엔드 API 필요:**
```
POST   /api/collab/create        - 협업 생성 → 초대코드 반환
POST   /api/collab/join          - 초대코드로 참여
GET    /api/collab/:id           - 협업 상세
PUT    /api/collab/:id/progress  - 내 진행률 업데이트
WS     /ws/collab/:id            - 실시간 동기화
```

---

#### Phase 6: 스터디 탭 명세

> **Phase 3 연동**: 스터디 시 각 참여자가 **현재 작업 중인 프로젝트**를 실시간으로 공유합니다.
> Nearby Connections로 연결 후 `ProjectRepository.getCurrentProjectFlow()`를 사용합니다.

**담당 파일:**
```
ui/study/
├── StudyScreen.kt          # 수정
├── StudySessionScreen.kt   # 수정
├── NearbyManager.kt        # 신규 생성
├── StudyTimerView.kt       # 신규 생성
├── ParticipantCard.kt      # 신규 생성 (참여자 + 현재 프로젝트 표시)
└── StudyViewModel.kt       # 신규 생성

data/repository/
└── StudyRepository.kt      # 신규 생성
```

**구현 항목:**

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| Nearby 디바이스 탐색 | Nearby Connections API | 필수 |
| 자동 연결 | 같은 공간 사용자 매칭 | 필수 |
| 스터디 세션 생성 | 세션 시작/종료 | 필수 |
| 함께한 시간 타이머 | 실시간 카운트업 | 필수 |
| 참여자 상태 표시 | 닉네임, 이모지, 현재 작업 | 필수 |
| **참여자 현재 프로젝트 공유** | Phase 3 API로 현재 작업 중인 프로젝트 표시 | 필수 |
| 세션 기록 저장 | Room DB + 서버 동기화 | 필수 |
| 스터디 통계 | 총 시간, 세션 수 | 선택 |

**Phase 3 연동 - 현재 작업 공유:**
```kotlin
// StudyParticipant 확장
data class StudyParticipantWithProject(
    val id: String,
    val nickname: String,
    val emoji: String,
    val isActive: Boolean,
    val currentProject: Project?,      // Phase 3에서 가져온 현재 프로젝트
    val currentTask: Task?             // 현재 진행 중인 태스크
)

// ParticipantCard.kt
@Composable
fun ParticipantCard(
    participant: StudyParticipantWithProject,
    modifier: Modifier = Modifier
) {
    Card(modifier = modifier) {
        Row {
            // 이모지 + 닉네임
            Text("${participant.emoji} ${participant.nickname}")

            // 현재 작업 중인 프로젝트 표시
            participant.currentProject?.let { project ->
                Column {
                    Text(project.name, style = MaterialTheme.typography.bodyMedium)
                    LinearProgressIndicator(progress = project.progress)
                    participant.currentTask?.let { task ->
                        Text("📝 ${task.description}", style = MaterialTheme.typography.bodySmall)
                    }
                }
            } ?: Text("현재 작업 없음", color = Color.Gray)
        }
    }
}
```

**Nearby를 통한 프로젝트 정보 공유 흐름:**
```
1. Nearby로 상대방 userId 수신
2. ProjectRepository.getCurrentProjectFlow(userId) 호출
3. 서버에서 상대방의 현재 프로젝트 정보 조회
4. ParticipantCard에 실시간 표시
```

**Nearby Connections 구현:**

```kotlin
// NearbyManager.kt
class NearbyManager @Inject constructor(
    private val context: Context
) {
    private val connectionsClient: ConnectionsClient =
        Nearby.getConnectionsClient(context)

    // 광고 시작 (다른 기기에게 보이기)
    fun startAdvertising(
        nickname: String,
        onConnectionInitiated: (endpointId: String, info: ConnectionInfo) -> Unit,
        onConnectionResult: (endpointId: String, result: ConnectionResolution) -> Unit
    )

    // 탐색 시작 (주변 기기 찾기)
    fun startDiscovery(
        onEndpointFound: (endpointId: String, info: DiscoveredEndpointInfo) -> Unit,
        onEndpointLost: (endpointId: String) -> Unit
    )

    // 연결 요청
    fun requestConnection(endpointId: String, nickname: String)

    // 메시지 전송
    fun sendPayload(endpointId: String, payload: Payload)

    // 정리
    fun stopAll()
}
```

**필요 권한 (이미 AndroidManifest에 추가됨):**
```xml
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
```

**런타임 권한 처리:**
```kotlin
// Accompanist Permissions 사용
val permissions = listOf(
    Manifest.permission.BLUETOOTH_SCAN,
    Manifest.permission.BLUETOOTH_ADVERTISE,
    Manifest.permission.BLUETOOTH_CONNECT,
    Manifest.permission.ACCESS_FINE_LOCATION
)
```

**StudyRepository 인터페이스:**
```kotlin
interface StudyRepository {
    fun getStudySessions(): Flow<List<StudySession>>
    fun getActiveSession(): Flow<StudySession?>

    suspend fun startSession(): Result<StudySession>
    suspend fun endSession(sessionId: String): Result<Unit>
    suspend fun addParticipant(sessionId: String, participant: StudyParticipant): Result<Unit>
    suspend fun removeParticipant(sessionId: String, participantId: String): Result<Unit>

    // 통계
    suspend fun getTotalStudyTime(): Long
    suspend fun getSessionCount(): Int
}
```

---

### 공통 컴포넌트 (모든 개발자 공유)

**`ui/components/` 에 생성할 공통 컴포넌트:**

| 컴포넌트 | 사용처 | 담당자 제안 |
|----------|--------|-------------|
| `LoadingIndicator.kt` | 전체 | Phase 2 담당자 |
| `ErrorDialog.kt` | 전체 | Phase 2 담당자 |
| `ConfirmDialog.kt` | 삭제 확인 등 | Phase 3 담당자 |
| `EmptyStateView.kt` | 목록 비어있을 때 | Phase 3 담당자 |
| `UserAvatar.kt` | 닉네임 + 이모지 표시 | Phase 2 담당자 |

---

### Git 브랜치 전략 (권장)

```
main
  └── develop
        ├── feature/phase-2-auth        (개발자 A)
        ├── feature/phase-3-current     (개발자 B)
        ├── feature/phase-4-past        (개발자 B)
        ├── feature/phase-5-collab      (개발자 C)
        └── feature/phase-6-study       (개발자 D)
```

**머지 순서:**
1. `feature/phase-2-auth` → `develop` (인증 먼저)
2. `feature/phase-3-current` → `develop`
3. 나머지 Phase는 순서 무관하게 머지 가능

---

### 개발 시작 전 체크리스트

각 개발자는 시작 전 다음을 확인하세요:

- [ ] Android Studio에서 프로젝트 Sync 성공
- [ ] 에뮬레이터 또는 실제 기기에서 앱 실행 확인
- [ ] 담당 Phase의 Stub 파일 위치 확인
- [ ] 필요한 Repository 인터페이스 이해
- [ ] 의존하는 다른 Phase와 인터페이스 합의
- [ ] Git 브랜치 생성 및 push

---

### 일일 싱크업 체크포인트

매일 다음 항목을 공유하세요:

1. **완료한 작업**: 어떤 기능을 구현했는지
2. **블로커**: 다른 Phase에 의존하는 부분
3. **변경된 인터페이스**: Repository, ViewModel 시그니처 변경
4. **공통 컴포넌트 추가**: 다른 개발자도 사용할 수 있는 컴포넌트

---
---

## 🖥️ 백엔드 서버 개발 가이드

### 기술 스택 선택

#### Option A: Node.js + Express (권장 - 빠른 개발)

| 구성요소 | 기술 | 버전 |
|----------|------|------|
| Runtime | Node.js | 20.x LTS |
| Framework | Express.js | 4.x |
| Database | MongoDB | 7.x |
| ODM | Mongoose | 8.x |
| WebSocket | Socket.io | 4.x |
| Authentication | Firebase Admin SDK | 12.x |
| Validation | Joi / Zod | - |

#### Option B: Spring Boot (대규모 / 타입 안전성)

| 구성요소 | 기술 | 버전 |
|----------|------|------|
| Framework | Spring Boot | 3.2.x |
| Language | Kotlin | 1.9.x |
| Database | PostgreSQL | 16.x |
| ORM | Spring Data JPA | - |
| WebSocket | Spring WebSocket | - |
| Authentication | Firebase Admin SDK | - |
| Validation | Jakarta Validation | - |

---

### 백엔드 프로젝트 구조 (Node.js)

```
planner-backend/
├── src/
│   ├── config/
│   │   ├── database.js         # MongoDB 연결
│   │   ├── firebase.js         # Firebase Admin 초기화
│   │   └── socket.js           # Socket.io 설정
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Collab.js
│   │   └── StudySession.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── collab.js
│   │   └── study.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── collabController.js
│   │   └── studyController.js
│   │
│   ├── middlewares/
│   │   ├── auth.js             # Firebase 토큰 검증
│   │   ├── errorHandler.js
│   │   └── validation.js
│   │
│   ├── services/
│   │   ├── projectService.js
│   │   ├── collabService.js
│   │   └── notificationService.js
│   │
│   ├── socket/
│   │   ├── collabSocket.js     # 협업 실시간 동기화
│   │   └── studySocket.js      # 스터디 실시간 동기화
│   │
│   ├── utils/
│   │   ├── inviteCode.js       # 초대코드 생성
│   │   └── helpers.js
│   │
│   └── app.js                  # Express 앱 진입점
│
├── .env.example
├── package.json
└── README.md
```

---

### Database Schema (MongoDB)

#### User Collection
```javascript
// models/User.js
const userSchema = new Schema({
  _id: String,                    // Firebase UID
  email: { type: String, required: true, unique: true },
  nickname: { type: String, required: true },
  emoji: { type: String, default: '😊' },
  currentProjectId: String,       // 현재 작업 중인 프로젝트 (Phase 5, 6에서 사용)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

#### Project Collection
```javascript
// models/Project.js
const projectSchema = new Schema({
  _id: { type: String, default: () => new ObjectId().toString() },
  userId: { type: String, required: true, index: true },  // 소유자
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  progress: { type: Number, default: 0, min: 0, max: 1 },
  tags: [{ type: String, enum: ['Work', 'Personal', 'Study', 'Health', 'Other'] }],
  isCompleted: { type: Boolean, default: false },
  isCurrentlyWorking: { type: Boolean, default: false },  // 현재 작업 중 여부
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  updatedAt: { type: Date, default: Date.now }
});

// 인덱스
projectSchema.index({ userId: 1, isCompleted: 1 });
projectSchema.index({ userId: 1, completedAt: -1 });
```

#### Task Collection
```javascript
// models/Task.js
const taskSchema = new Schema({
  _id: { type: String, default: () => new ObjectId().toString() },
  projectId: { type: String, required: true, index: true },
  description: { type: String, required: true },
  isDone: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
```

#### Collab Collection
```javascript
// models/Collab.js
const participantSchema = new Schema({
  userId: { type: String, required: true },
  nickname: String,
  emoji: String,
  progress: { type: Number, default: 0, min: 0, max: 1 },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const scheduleSchema = new Schema({
  title: String,
  datetime: Date,
  createdBy: String
}, { _id: true });

const collabSchema = new Schema({
  _id: { type: String, default: () => new ObjectId().toString() },
  purpose: { type: String, required: true },
  inviteCode: { type: String, unique: true, required: true },
  ownerId: { type: String, required: true },
  participants: [participantSchema],
  schedules: [scheduleSchema],
  overallProgress: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 인덱스
collabSchema.index({ inviteCode: 1 });
collabSchema.index({ 'participants.userId': 1 });
```

#### StudySession Collection
```javascript
// models/StudySession.js
const studyParticipantSchema = new Schema({
  userId: { type: String, required: true },
  nickname: String,
  emoji: String,
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date
}, { _id: false });

const studySessionSchema = new Schema({
  _id: { type: String, default: () => new ObjectId().toString() },
  hostId: { type: String, required: true },
  participants: [studyParticipantSchema],
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: { type: Number, default: 0 },  // milliseconds
  location: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 인덱스
studySessionSchema.index({ hostId: 1 });
studySessionSchema.index({ 'participants.userId': 1 });
```

---

### API 명세 (RESTful)

#### Base URL
```
Development: http://localhost:8080/api
Production:  https://api.planner-app.com/api
```

#### 공통 헤더
```
Authorization: Bearer <Firebase ID Token>
Content-Type: application/json
```

#### 공통 응답 형식
```json
// 성공
{
  "success": true,
  "data": { ... }
}

// 에러
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "프로젝트 이름은 필수입니다."
  }
}
```

---

### 1. Authentication API

#### POST /api/auth/register
사용자 등록 (Firebase 인증 후 서버에 프로필 저장)

**Request:**
```json
{
  "nickname": "홍길동",
  "emoji": "🚀"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "firebase-uid-123",
    "email": "user@example.com",
    "nickname": "홍길동",
    "emoji": "🚀",
    "createdAt": "2025-01-08T12:00:00Z"
  }
}
```

#### GET /api/auth/me
현재 사용자 정보 조회

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "firebase-uid-123",
    "email": "user@example.com",
    "nickname": "홍길동",
    "emoji": "🚀",
    "currentProjectId": "project-456",
    "createdAt": "2025-01-08T12:00:00Z"
  }
}
```

#### PUT /api/auth/profile
프로필 수정

**Request:**
```json
{
  "nickname": "김철수",
  "emoji": "💻"
}
```

**Response:** `200 OK`

---

### 2. Projects API

#### GET /api/projects
프로젝트 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| status | string | N | `active` \| `completed` |
| userId | string | N | 다른 사용자의 프로젝트 조회 (Phase 5, 6용) |
| sortBy | string | N | `dueDate` \| `progress` \| `createdAt` |
| order | string | N | `asc` \| `desc` |
| tag | string | N | 태그 필터 |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "project-123",
      "name": "앱 개발 프로젝트",
      "dueDate": "2025-01-31T23:59:59Z",
      "progress": 0.65,
      "tags": ["Work", "Study"],
      "isCompleted": false,
      "isCurrentlyWorking": true,
      "taskCount": 10,
      "completedTaskCount": 6,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/projects/:id
프로젝트 상세 조회

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "project-123",
    "name": "앱 개발 프로젝트",
    "dueDate": "2025-01-31T23:59:59Z",
    "progress": 0.65,
    "tags": ["Work", "Study"],
    "isCompleted": false,
    "isCurrentlyWorking": true,
    "tasks": [
      {
        "id": "task-1",
        "description": "UI 디자인",
        "isDone": true,
        "order": 0
      },
      {
        "id": "task-2",
        "description": "API 연동",
        "isDone": false,
        "order": 1
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### POST /api/projects
프로젝트 생성

**Request:**
```json
{
  "name": "새 프로젝트",
  "dueDate": "2025-02-28T23:59:59Z",
  "tags": ["Work"]
}
```

**Response:** `201 Created`

#### PUT /api/projects/:id
프로젝트 수정

**Request:**
```json
{
  "name": "수정된 프로젝트명",
  "dueDate": "2025-03-15T23:59:59Z",
  "tags": ["Work", "Personal"]
}
```

**Response:** `200 OK`

#### DELETE /api/projects/:id
프로젝트 삭제

**Response:** `204 No Content`

#### PUT /api/projects/:id/progress
진행률 업데이트

**Request:**
```json
{
  "progress": 0.75
}
```

**Response:** `200 OK`

#### PUT /api/projects/:id/complete
프로젝트 완료 처리

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "project-123",
    "isCompleted": true,
    "completedAt": "2025-01-08T15:30:00Z"
  }
}
```

#### PUT /api/projects/:id/set-current
현재 작업 중인 프로젝트로 설정 (Phase 5, 6에서 공유됨)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "project-123",
    "isCurrentlyWorking": true
  }
}
```

#### GET /api/projects/current/:userId
특정 사용자의 현재 작업 중인 프로젝트 조회 (Phase 5, 6용)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "project-123",
    "name": "앱 개발 프로젝트",
    "progress": 0.65,
    "currentTask": {
      "id": "task-2",
      "description": "API 연동"
    }
  }
}
```

---

### 3. Tasks API

#### GET /api/projects/:projectId/tasks
프로젝트의 태스크 목록

**Response:** `200 OK`

#### POST /api/projects/:projectId/tasks
태스크 생성

**Request:**
```json
{
  "description": "새 태스크",
  "order": 0
}
```

**Response:** `201 Created`

#### PUT /api/tasks/:taskId
태스크 수정

**Request:**
```json
{
  "description": "수정된 태스크",
  "isDone": true
}
```

**Response:** `200 OK`

#### DELETE /api/tasks/:taskId
태스크 삭제

**Response:** `204 No Content`

#### PUT /api/tasks/:taskId/toggle
태스크 완료 상태 토글 (진행률 자동 재계산)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-1",
      "isDone": true
    },
    "project": {
      "id": "project-123",
      "progress": 0.7
    }
  }
}
```

---

### 4. Collaboration API

#### POST /api/collab
협업 생성

**Request:**
```json
{
  "purpose": "앱 개발 프로젝트 협업"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "collab-123",
    "purpose": "앱 개발 프로젝트 협업",
    "inviteCode": "ABC123",
    "ownerId": "user-456",
    "participants": [
      {
        "userId": "user-456",
        "nickname": "홍길동",
        "emoji": "🚀",
        "progress": 0
      }
    ],
    "overallProgress": 0,
    "createdAt": "2025-01-08T12:00:00Z"
  }
}
```

#### POST /api/collab/join
초대코드로 협업 참여

**Request:**
```json
{
  "inviteCode": "ABC123"
}
```

**Response:** `200 OK`

#### GET /api/collab
내가 참여 중인 협업 목록

**Response:** `200 OK`

#### GET /api/collab/:id
협업 상세 조회 (참여자의 현재 프로젝트 포함)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "collab-123",
    "purpose": "앱 개발 프로젝트 협업",
    "inviteCode": "ABC123",
    "participants": [
      {
        "userId": "user-456",
        "nickname": "홍길동",
        "emoji": "🚀",
        "progress": 0.7,
        "isOnline": true,
        "currentProject": {
          "id": "project-789",
          "name": "UI 개발",
          "progress": 0.5
        }
      },
      {
        "userId": "user-789",
        "nickname": "김철수",
        "emoji": "💻",
        "progress": 0.4,
        "isOnline": false,
        "currentProject": null
      }
    ],
    "schedules": [
      {
        "id": "schedule-1",
        "title": "주간 미팅",
        "datetime": "2025-01-10T14:00:00Z"
      }
    ],
    "overallProgress": 0.55,
    "createdAt": "2025-01-08T12:00:00Z"
  }
}
```

#### PUT /api/collab/:id/progress
내 진행률 업데이트

**Request:**
```json
{
  "progress": 0.8
}
```

**Response:** `200 OK`

#### POST /api/collab/:id/schedule
일정 추가

**Request:**
```json
{
  "title": "주간 미팅",
  "datetime": "2025-01-15T14:00:00Z"
}
```

**Response:** `201 Created`

#### DELETE /api/collab/:id/leave
협업 나가기

**Response:** `204 No Content`

---

### 5. Study API

#### POST /api/study/sessions
스터디 세션 생성

**Request:**
```json
{
  "location": "카페 스타벅스"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "session-123",
    "hostId": "user-456",
    "participants": [
      {
        "userId": "user-456",
        "nickname": "홍길동",
        "emoji": "🚀"
      }
    ],
    "startTime": "2025-01-08T14:00:00Z",
    "location": "카페 스타벅스",
    "isActive": true
  }
}
```

#### POST /api/study/sessions/:id/join
스터디 세션 참여

**Response:** `200 OK`

#### POST /api/study/sessions/:id/leave
스터디 세션 나가기

**Response:** `200 OK`

#### PUT /api/study/sessions/:id/end
스터디 세션 종료

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "session-123",
    "endTime": "2025-01-08T17:00:00Z",
    "duration": 10800000,
    "isActive": false
  }
}
```

#### GET /api/study/sessions
스터디 기록 조회

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| limit | number | 개수 제한 |
| offset | number | 오프셋 |

**Response:** `200 OK`

#### GET /api/study/stats
스터디 통계

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSessions": 15,
    "totalDuration": 54000000,
    "averageDuration": 3600000,
    "thisWeekSessions": 3,
    "thisWeekDuration": 10800000
  }
}
```

---

### WebSocket API

#### 연결
```javascript
// 클라이언트
const socket = io('wss://api.planner-app.com', {
  auth: {
    token: '<Firebase ID Token>'
  }
});
```

#### Namespace: /collab

**Events (Client → Server):**

| Event | Payload | 설명 |
|-------|---------|------|
| `join_room` | `{ collabId: string }` | 협업 방 입장 |
| `leave_room` | `{ collabId: string }` | 협업 방 퇴장 |
| `update_progress` | `{ collabId: string, progress: number }` | 진행률 업데이트 |
| `update_current_project` | `{ collabId: string, projectId: string }` | 현재 작업 프로젝트 변경 |

**Events (Server → Client):**

| Event | Payload | 설명 |
|-------|---------|------|
| `participant_joined` | `{ userId, nickname, emoji }` | 참여자 입장 |
| `participant_left` | `{ userId }` | 참여자 퇴장 |
| `progress_updated` | `{ userId, progress, overallProgress }` | 진행률 변경 |
| `current_project_updated` | `{ userId, project }` | 현재 작업 프로젝트 변경 |
| `schedule_added` | `{ schedule }` | 일정 추가됨 |
| `online_status_changed` | `{ userId, isOnline }` | 온라인 상태 변경 |

#### Namespace: /study

**Events (Client → Server):**

| Event | Payload | 설명 |
|-------|---------|------|
| `join_session` | `{ sessionId: string }` | 세션 참여 |
| `leave_session` | `{ sessionId: string }` | 세션 퇴장 |
| `update_current_task` | `{ sessionId: string, taskId: string }` | 현재 작업 태스크 변경 |
| `ping` | `{ sessionId: string }` | 활성 상태 유지 |

**Events (Server → Client):**

| Event | Payload | 설명 |
|-------|---------|------|
| `participant_joined` | `{ userId, nickname, emoji, currentProject }` | 참여자 입장 |
| `participant_left` | `{ userId }` | 참여자 퇴장 |
| `current_task_updated` | `{ userId, task }` | 현재 작업 변경 |
| `session_ended` | `{ sessionId, duration }` | 세션 종료 |
| `timer_sync` | `{ duration }` | 타이머 동기화 (30초마다) |

---

### 인증 미들웨어

```javascript
// middlewares/auth.js
const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' }
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다.' }
    });
  }
};

module.exports = authMiddleware;
```

---

### 에러 코드

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `INVALID_TOKEN` | 401 | 유효하지 않은 토큰 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 요청 데이터 오류 |
| `DUPLICATE_ERROR` | 409 | 중복 데이터 |
| `INVITE_CODE_INVALID` | 400 | 유효하지 않은 초대코드 |
| `COLLAB_FULL` | 400 | 협업 인원 초과 |
| `SESSION_ENDED` | 400 | 이미 종료된 세션 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

### 백엔드 개발 환경 설정

#### 1. 프로젝트 초기화
```bash
mkdir planner-backend && cd planner-backend
npm init -y
npm install express mongoose socket.io firebase-admin cors helmet dotenv joi
npm install -D nodemon typescript @types/node @types/express
```

#### 2. 환경 변수 (.env)
```env
# Server
PORT=8080
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/planner

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### 3. 실행 스크립트 (package.json)
```json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "test": "jest"
  }
}
```

#### 4. 기본 앱 설정
```javascript
// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');

require('dotenv').config();
require('./config/firebase');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/collab', require('./routes/collab'));
app.use('/api/study', require('./routes/study'));

// Socket.io
require('./socket/collabSocket')(io);
require('./socket/studySocket')(io);

// Error Handler
app.use(require('./middlewares/errorHandler'));

// Database & Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
```

---

### 백엔드 개발 로드맵

| 단계 | 작업 | 담당 | 의존성 |
|------|------|------|--------|
| 1 | 프로젝트 초기화 + DB 연결 | 백엔드 | - |
| 2 | Auth API (Firebase 연동) | 백엔드 | Phase 2와 협업 |
| 3 | **Projects API (CRUD)** | 백엔드 | 🔴 Phase 3, 5, 6 블로커 |
| 4 | Tasks API | 백엔드 | Projects API |
| 5 | Collab API + WebSocket | 백엔드 | Phase 5와 협업 |
| 6 | Study API | 백엔드 | Phase 6와 협업 |
| 7 | 테스트 + 배포 | 백엔드 | 전체 완료 후 |

---

### 서버 배포

#### KAIST KCloud

본 프로젝트의 백엔드 서버는 **KAIST KCloud**를 사용하여 배포합니다.

| 항목 | 내용 |
|------|------|
| **플랫폼** | KAIST KCloud |
| **서버 주소** | *추후 추가 예정* |
| **포트** | *추후 추가 예정* |
| **SSH 접속** | *추후 추가 예정* |

> ⚠️ **Note**: 서버 상세 정보(IP, 포트, 접속 방법 등)는 KCloud 인스턴스 생성 후 업데이트될 예정입니다.

#### 서버 환경 설정 (예정)

```bash
# KCloud 서버 접속 후 환경 설정
# (상세 내용 추후 추가)

# Node.js 설치
# MongoDB 설치 또는 외부 MongoDB 연결
# PM2를 통한 프로세스 관리
# Nginx 리버스 프록시 설정 (선택)
```

#### 환경 변수 설정

서버에서 사용할 환경 변수:

```env
# .env (KCloud 서버)
PORT=3000
MONGODB_URI=mongodb://localhost:27017/planner
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project-id
```

#### MongoDB 옵션

| 옵션 | 설명 |
|------|------|
| **로컬 설치** | KCloud 서버에 직접 MongoDB 설치 |
| **MongoDB Atlas** | 클라우드 MongoDB 서비스 연결 (512MB 무료) |
