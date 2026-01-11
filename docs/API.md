# Momento API 문서

## Base URL

```
Production: http://<SERVER_IP>:3000  # 예: http://172.x.x.x:3000 (사설 IP)
Development: http://localhost:3000
```

> ⚠️ 프로덕션 환경에서는 실제 서버의 사설 IP 주소로 대체하세요.

## 인증

Firebase Authentication을 사용합니다. 모든 API 요청에 Firebase ID Token을 Header에 포함해야 합니다.

```
Authorization: Bearer <firebase-id-token>
```

---

## 📌 Users

### 내 정보 조회
```http
GET /api/users/me
```

**Response**
```json
{
  "id": "uuid",
  "firebaseUid": "firebase-uid",
  "nickname": "사용자닉네임",
  "profileEmoji": "😀",
  "createdAt": "2025-01-10T00:00:00.000Z",
  "updatedAt": "2025-01-10T00:00:00.000Z"
}
```

### 회원가입 (최초 로그인 시)
```http
POST /api/users
```

**Request Body**
```json
{
  "nickname": "사용자닉네임",
  "profileEmoji": "😀"
}
```

> ℹ️ `firebaseUid`는 Authorization 헤더의 Firebase ID Token에서 서버가 자동 추출합니다.
> 이 방식은 토큰 위조를 방지하여 더 안전합니다.

**Response**
```json
{
  "id": "uuid",
  "firebaseUid": "firebase-uid",
  "nickname": "사용자닉네임",
  "profileEmoji": "😀",
  "createdAt": "2025-01-10T00:00:00.000Z",
  "updatedAt": "2025-01-10T00:00:00.000Z"
}
```

### 내 정보 수정
```http
PATCH /api/users/me
```

**Request Body**
```json
{
  "nickname": "새닉네임",
  "profileEmoji": "🎉"
}
```

### 닉네임으로 사용자 검색 (선택사항)
```http
GET /api/users/search?nickname=검색할닉네임
```

> ℹ️ 이 API는 **UI 자동완성/실시간 검증용**으로 사용할 수 있습니다.
> 프로젝트 생성 시 멤버 추가는 `memberNicknames`로 직접 전달하면 되므로, 이 API는 필수가 아닙니다.

**Response (200 OK)**
```json
{
  "id": "uuid",
  "nickname": "검색된사용자",
  "profileEmoji": "😀"
}
```

**Response (404 Not Found)** - 사용자 없음
```json
{
  "statusCode": 404,
  "message": "사용자를 찾을 수 없습니다",
  "error": "Not Found"
}
```

---

## 📌 Projects

### 프로젝트 상태 (status)

| 상태 | 설명 | 조건 |
|------|------|------|
| `ACTIVE` | 진행 중 | 체크리스트 미완료 |
| `PENDING_REVIEW` | 평가 대기 | 체크리스트 완료, 평점 없음 |
| `COMPLETED` | 완료 | 평점 있음 |

### 프로젝트 목록 조회

#### 진행 중인 프로젝트 (ACTIVE + PENDING_REVIEW)
```http
GET /api/projects/current
```
- `status`가 `ACTIVE` 또는 `PENDING_REVIEW`인 프로젝트
- 개인/협업 구분 없이 모두 반환
- 프론트엔드에서 `memberCount`로 필터링 가능 (1명: 개인, 2명 이상: 협업)
- 프론트엔드에서 `status`로 평가 대기 프로젝트 구분 가능

#### 완료된 프로젝트 (보고서 탭)
```http
GET /api/projects/past
```
- `status`가 `COMPLETED`인 프로젝트만 반환
- 평점이 있는 프로젝트

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "프로젝트 제목",
      "coverImageUrl": "https://...",
      "plannedStartDate": "2025-01-01",
      "plannedEndDate": "2025-01-31",
      "status": "COMPLETED",
      "rating": 4,
      "completedAt": "2025-01-10T15:30:00.000Z",
      "memberCount": 3,
      "completedChecklistCount": 5,
      "totalChecklistCount": 10,
      "totalTimeMinutes": 1200,
      "createdAt": "2025-01-10T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

### 프로젝트 생성
```http
POST /api/projects
```

**Request Body**
```json
{
  "title": "프로젝트 제목",
  "coverImageUrl": "https://...",
  "plannedStartDate": "2025-01-01",
  "plannedEndDate": "2025-01-31",
  "memberNicknames": ["팀원A", "팀원B"]  // 선택사항
}
```

> ℹ️ **개인 프로젝트**: `memberNicknames` 생략 또는 빈 배열 → 생성자만 멤버로 추가
> ℹ️ **협업 프로젝트**: `memberNicknames`에 함께할 사용자 닉네임 배열 전달

**Response (201 Created)**
```json
{
  "id": "uuid",
  "title": "프로젝트 제목",
  "coverImageUrl": "https://...",
  "plannedStartDate": "2025-01-01",
  "plannedEndDate": "2025-01-31",
  "rating": null,
  "members": [
    { "userId": "creator-uuid", "nickname": "생성자", "role": "owner" },
    { "userId": "user-uuid-1", "nickname": "팀원A", "role": "member" }
  ],
  "checklists": [],
  "createdAt": "2025-01-10T00:00:00.000Z"
}
```

**Error Response (404 Not Found)** - 존재하지 않는 닉네임
```json
{
  "statusCode": 404,
  "message": "사용자를 찾을 수 없습니다: 팀원C",
  "error": "Not Found"
}
```

### 프로젝트 상세 조회
```http
GET /api/projects/:id
```

**Response**
```json
{
  "id": "uuid",
  "title": "프로젝트 제목",
  "coverImageUrl": "https://...",
  "plannedStartDate": "2025-01-01",
  "plannedEndDate": "2025-01-31",
  "rating": null,
  "members": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "nickname": "닉네임",
      "profileEmoji": "😀",
      "role": "owner"
    }
  ],
  "checklists": [
    {
      "id": "uuid",
      "content": "체크리스트 항목",
      "isCompleted": false,
      "assigneeId": "user-uuid",
      "assigneeNickname": "닉네임",
      "displayOrder": 0,
      "totalTimeMinutes": 120
    }
  ],
  "createdAt": "2025-01-10T00:00:00.000Z"
}
```

### 프로젝트 수정
```http
PATCH /api/projects/:id
```

**Request Body**
```json
{
  "title": "수정된 제목",
  "coverImageUrl": "https://...",
  "plannedStartDate": "2025-01-01",
  "plannedEndDate": "2025-02-28",
  "rating": 9
}
```

### 프로젝트 완료 (보고서 작성)
```http
POST /api/projects/:id/complete
```

프로젝트를 완료 처리하고 보고서(평점)를 저장합니다.
- 모든 체크리스트를 완료 상태로 변경
- 평점(rating) 저장
- 프로젝트가 `/api/projects/past`에서 조회됨

**Request Body**
```json
{
  "rating": 4
}
```

> ℹ️ `rating`은 1~5 사이의 정수 (별점)

**Response (200 OK)**
```json
{
  "id": "uuid",
  "title": "프로젝트 제목",
  "rating": 4,
  "completedAt": "2025-01-10T15:30:00.000Z",
  "totalTimeMinutes": 1200,
  "message": "프로젝트가 완료되었습니다"
}
```

**Error Response (400 Bad Request)** - 이미 완료된 프로젝트
```json
{
  "statusCode": 400,
  "message": "이미 완료된 프로젝트입니다",
  "error": "Bad Request"
}
```

### 프로젝트 삭제
```http
DELETE /api/projects/:id
```

---

## 📌 Project Members

### 멤버 추가 (닉네임으로 검색 후 초대)
```http
POST /api/projects/:projectId/members
```

**Request Body**
```json
{
  "userId": "user-uuid",
  "role": "member"
}
```

> ℹ️ 먼저 `GET /api/users/search?nickname=...`으로 사용자를 검색한 후, 해당 userId로 멤버를 추가합니다.

### 멤버 삭제
```http
DELETE /api/projects/:projectId/members/:userId
```

---

## 📌 Checklists

### 체크리스트 추가
```http
POST /api/projects/:projectId/checklists
```

**Request Body**
```json
{
  "content": "체크리스트 항목 내용",
  "assigneeId": "user-uuid",
  "displayOrder": 0
}
```

### 체크리스트 수정
```http
PATCH /api/checklists/:id
```

**Request Body**
```json
{
  "content": "수정된 내용",
  "isCompleted": true,
  "assigneeId": "user-uuid",
  "displayOrder": 1
}
```

### 체크리스트 삭제
```http
DELETE /api/checklists/:id
```

---

## 📌 Time Logs

### 타이머 시작
```http
POST /api/checklists/:checklistId/time-logs/start
```

**Response**
```json
{
  "id": "uuid",
  "checklistId": "checklist-uuid",
  "userId": "user-uuid",
  "startedAt": "2025-01-10T09:00:00.000Z",
  "endedAt": null
}
```

### 타이머 정지
```http
POST /api/time-logs/:id/stop
```

**Response**
```json
{
  "id": "uuid",
  "checklistId": "checklist-uuid",
  "userId": "user-uuid",
  "startedAt": "2025-01-10T09:00:00.000Z",
  "endedAt": "2025-01-10T11:30:00.000Z",
  "durationMinutes": 150
}
```

### 오늘 활동 요약 조회 (일일 영수증용)
```http
GET /api/time-logs/today
```

오늘의 모든 활동 기록을 조회합니다. 메인 탭 표시 및 일일 영수증 생성에 사용됩니다.

**Response**
```json
{
  "date": "2025-01-10",
  "totalMinutes": 420,
  "completedTasksCount": 5,
  "projects": [
    {
      "projectId": "uuid",
      "projectTitle": "프로젝트 제목",
      "minutes": 180,
      "completedTasksCount": 3
    }
  ],
  "timeLogs": [
    {
      "id": "uuid",
      "checklistId": "checklist-uuid",
      "checklistContent": "체크리스트 항목",
      "projectId": "project-uuid",
      "projectTitle": "프로젝트 제목",
      "startedAt": "2025-01-10T09:00:00.000Z",
      "endedAt": "2025-01-10T11:30:00.000Z",
      "durationMinutes": 150
    }
  ],
  "completedTasks": [
    {
      "id": "checklist-uuid",
      "content": "완료한 체크리스트",
      "projectId": "project-uuid",
      "projectTitle": "프로젝트 제목",
      "completedAt": "2025-01-10T14:00:00.000Z",
      "totalTimeMinutes": 90
    }
  ]
}
```

> ℹ️ `timeLogs`: 오늘 기록된 모든 시간 로그 (시작/종료 시각 포함)
> ℹ️ `completedTasks`: 오늘 완료한 체크리스트 (`updated_at`이 오늘인 항목 중 `is_completed = true`)
```

---

## 📌 Locations

### 장소 목록 조회
```http
GET /api/locations
```

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "N1 도서관"
    }
  ]
}
```

### 장소 생성
```http
POST /api/locations
```

**Request Body**
```json
{
  "name": "새 장소 이름"
}
```

---

## 📌 Study Sessions

### 스터디 세션 참가
```http
POST /api/locations/:locationId/join
```

**Response**
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "locationId": "location-uuid",
  "joinedAt": "2025-01-10T09:00:00.000Z",
  "leftAt": null
}
```

### 스터디 세션 퇴장
```http
POST /api/study-sessions/:id/leave
```

### 특정 장소의 참가자 조회
```http
GET /api/locations/:locationId/participants
```

**Response**
```json
{
  "location": {
    "id": "uuid",
    "name": "N1 도서관"
  },
  "participants": [
    {
      "userId": "user-uuid",
      "nickname": "닉네임",
      "profileEmoji": "😀",
      "currentProject": "프로젝트 제목",
      "todayTotalMinutes": 420,
      "joinedAt": "2025-01-10T09:00:00.000Z"
    }
  ]
}
```

---

## 📌 Daily Receipts (일일 영수증)

### 영수증 목록 조회 (아카이브 탭)
```http
GET /api/receipts
```

사용자의 모든 일일 영수증 목록을 조회합니다.

**Query Parameters**
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 개수 (기본값: 20)

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "date": "2025-01-10",
      "imageUrl": "https://storage.../receipt-2025-01-10.png",
      "totalMinutes": 420,
      "completedTasksCount": 5,
      "createdAt": "2025-01-10T23:59:00.000Z"
    }
  ],
  "meta": {
    "total": 30,
    "page": 1,
    "limit": 20
  }
}
```

### 특정 날짜 영수증 조회
```http
GET /api/receipts/:date
```

특정 날짜의 영수증을 조회합니다.

**Path Parameters**
- `date`: 조회할 날짜 (YYYY-MM-DD 형식)

**Response (200 OK)**
```json
{
  "id": "uuid",
  "date": "2025-01-10",
  "imageUrl": "https://storage.../receipt-2025-01-10.png",
  "totalMinutes": 420,
  "completedTasksCount": 5,
  "createdAt": "2025-01-10T23:59:00.000Z"
}
```

**Response (404 Not Found)** - 영수증 없음
```json
{
  "statusCode": 404,
  "message": "해당 날짜의 영수증이 없습니다",
  "error": "Not Found"
}
```

### 영수증 생성/갱신
```http
POST /api/receipts
```

새 영수증을 생성하거나, 해당 날짜의 영수증이 이미 있으면 갱신합니다.
- 사용자가 수동으로 '영수증 추가' 버튼을 누를 때 호출
- 매일 KST 0시에 자동 생성 (서버 스케줄러)

**Request Body**
```json
{
  "date": "2025-01-10",
  "imageUrl": "https://storage.../receipt-2025-01-10.png"
}
```

> ℹ️ `totalMinutes`와 `completedTasksCount`는 서버에서 해당 날짜의 time_logs와 checklists를 기반으로 자동 계산합니다.

**Response (201 Created / 200 OK)**
```json
{
  "id": "uuid",
  "date": "2025-01-10",
  "imageUrl": "https://storage.../receipt-2025-01-10.png",
  "totalMinutes": 420,
  "completedTasksCount": 5,
  "createdAt": "2025-01-10T23:59:00.000Z"
}
```

### 영수증 삭제
```http
DELETE /api/receipts/:date
```

특정 날짜의 영수증을 삭제합니다.

**Response (204 No Content)**

---

## 에러 응답

```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

| Status Code | 설명 |
|-------------|------|
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 오류 |
