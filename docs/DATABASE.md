# Momento Database 문서

## 개요

PostgreSQL 16.x를 사용하며, Prisma ORM을 통해 데이터베이스에 접근합니다.

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │   locations     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ firebase_uid    │       │ name            │
│ nickname        │       │ created_at      │
│ profile_emoji   │       └────────┬────────┘
│ created_at      │                │
│ updated_at      │                │
└────────┬────────┘                │
         │                         │
         │ 1:N                     │ 1:N
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ project_members │       │ study_sessions  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ project_id (FK) │       │ user_id (FK)    │
│ user_id (FK)    │       │ location_id (FK)│
│ role            │       │ joined_at       │
│ joined_at       │       │ left_at         │
└────────┬────────┘       └─────────────────┘
         │
         │ N:1
         ▼
┌─────────────────┐
│    projects     │
├─────────────────┤
│ id (PK)         │
│ title           │
│ cover_image_url │
│ planned_start_  │
│ planned_end_    │
│ created_by (FK) │
│ rating          │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│   checklists    │
├─────────────────┤
│ id (PK)         │
│ project_id (FK) │
│ content         │
│ is_completed    │
│ assignee_id(FK) │
│ display_order   │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│   time_logs     │
├─────────────────┤
│ id (PK)         │
│ checklist_id(FK)│
│ user_id (FK)    │
│ started_at      │
│ ended_at        │
└─────────────────┘
```

---

## 테이블 상세

### users

사용자 정보를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| firebase_uid | VARCHAR(128) | UNIQUE, NOT NULL | Firebase Auth UID |
| nickname | VARCHAR(50) | NOT NULL | 사용자 닉네임 |
| profile_emoji | VARCHAR(10) | - | 프로필 이모지 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정 시각 |

**인덱스**
- `firebase_uid` (UNIQUE)

---

### locations

스터디 장소 정보를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| name | VARCHAR(100) | NOT NULL | 장소명 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 시각 |

---

### projects

프로젝트 정보를 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| title | VARCHAR(200) | NOT NULL | 프로젝트 제목 |
| cover_image_url | VARCHAR(500) | - | 갤러리용 커버 이미지 URL |
| planned_start_date | DATE | - | 계획 시작일 |
| planned_end_date | DATE | - | 계획 종료일 |
| created_by | UUID | FK → users.id, NOT NULL | 프로젝트 생성자 |
| rating | SMALLINT | - | 평점 (0~10), null이면 미평가 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정 시각 |

**인덱스**
- `created_by`
- `created_at`

---

### project_members

프로젝트-사용자 다대다 관계를 관리합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| project_id | UUID | FK → projects.id, NOT NULL | 프로젝트 ID |
| user_id | UUID | FK → users.id, NOT NULL | 사용자 ID |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'member' | 역할 (owner/member) |
| joined_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 참가 시각 |

**인덱스**
- `(project_id, user_id)` (UNIQUE)
- `user_id`

**비즈니스 로직**
- `member_count = 1`: 개인 프로젝트 → 현재 탭
- `member_count >= 2`: 협업 프로젝트 → 협업 탭

---

### checklists

프로젝트의 체크리스트 항목을 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| project_id | UUID | FK → projects.id, NOT NULL | 프로젝트 ID |
| content | VARCHAR(500) | NOT NULL | 체크리스트 내용 |
| is_completed | BOOLEAN | NOT NULL, DEFAULT FALSE | 완료 여부 |
| assignee_id | UUID | FK → users.id | 담당자 (1명) |
| display_order | INT | NOT NULL, DEFAULT 0 | 정렬 순서 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정 시각 |

**인덱스**
- `project_id`
- `assignee_id`
- `(project_id, is_completed)`

**비즈니스 로직**
- 프로젝트 완료 조건: 해당 프로젝트의 **모든** 체크리스트가 `is_completed = true`
- 완료된 프로젝트 → 과거 탭으로 이동

---

### time_logs

체크리스트별 작업 시간을 기록합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| checklist_id | UUID | FK → checklists.id, NOT NULL | 체크리스트 ID |
| user_id | UUID | FK → users.id, NOT NULL | 시간 기록자 |
| started_at | TIMESTAMP | NOT NULL | 시작 시각 |
| ended_at | TIMESTAMP | - | 종료 시각 (null이면 진행 중) |

**인덱스**
- `checklist_id`
- `user_id`
- `(user_id, started_at)`

**비즈니스 로직**
- 시작/정지 버튼 클릭 시마다 기록
- 총 진행 시간 = `SUM(ended_at - started_at)`

---

### study_sessions

스터디 세션 참가 기록을 저장합니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| user_id | UUID | FK → users.id, NOT NULL | 참가자 |
| location_id | UUID | FK → locations.id, NOT NULL | 장소 |
| joined_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 참가 시각 |
| left_at | TIMESTAMP | - | 퇴장 시각 (null이면 현재 참여 중) |

**인덱스**
- `location_id`
- `user_id`
- `(location_id, left_at)`

---

## 주요 쿼리 패턴

### 진행 중인 프로젝트 조회 (개인 + 협업 모두)

```sql
SELECT p.*, 
       COUNT(DISTINCT pm2.id) as member_count
FROM projects p
INNER JOIN project_members pm ON pm.project_id = p.id
LEFT JOIN project_members pm2 ON pm2.project_id = p.id
WHERE pm.user_id = :userId
AND EXISTS (
    SELECT 1 FROM checklists c 
    WHERE c.project_id = p.id AND c.is_completed = false
)
GROUP BY p.id;
```

> ℹ️ `member_count`로 개인(1명)/협업(2명 이상) 구분 가능

### 완료된 프로젝트 조회

```sql
SELECT p.* 
FROM projects p
INNER JOIN project_members pm ON pm.project_id = p.id
WHERE pm.user_id = :userId
AND NOT EXISTS (

### 오늘 작업 시간 집계

```sql
SELECT 
    p.id as project_id,
    p.title as project_title,
    SUM(EXTRACT(EPOCH FROM (COALESCE(tl.ended_at, NOW()) - tl.started_at)) / 60) as minutes
FROM time_logs tl
INNER JOIN checklists c ON c.id = tl.checklist_id
INNER JOIN projects p ON p.id = c.project_id
WHERE tl.user_id = :userId
AND DATE(tl.started_at) = CURRENT_DATE
GROUP BY p.id, p.title;
```
