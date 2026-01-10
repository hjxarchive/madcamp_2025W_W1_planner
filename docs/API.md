# Momento API 문서

## Base URL

```
Production: https://api.momento.app
Development: http://localhost:3000
```

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

---

## 📌 Projects

### 프로젝트 목록 조회

#### 현재 탭 (개인 프로젝트)
```http
GET /api/projects/current
```
- member가 1명인 프로젝트
- 체크리스트가 모두 완료되지 않은 프로젝트

#### 과거 탭 (완료된 프로젝트)
```http
GET /api/projects/past
```
- 체크리스트가 모두 완료된 프로젝트

#### 협업 탭 (협업 프로젝트)
```http
GET /api/projects/collab
```
- member가 2명 이상인 프로젝트
- 체크리스트가 모두 완료되지 않은 프로젝트

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
      "rating": 8,
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
  "plannedEndDate": "2025-01-31"
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

### 프로젝트 삭제
```http
DELETE /api/projects/:id
```

---

## 📌 Project Members

### 멤버 추가 (개인 → 협업 전환)
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

### 오늘 작업 시간 조회 (메인 탭)
```http
GET /api/time-logs/today
```

**Response**
```json
{
  "totalMinutes": 420,
  "projects": [
    {
      "projectId": "uuid",
      "projectTitle": "프로젝트 제목",
      "minutes": 180
    }
  ]
}
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
