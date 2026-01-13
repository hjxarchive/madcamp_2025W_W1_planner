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
- `nickname` (UNIQUE)

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
| status | ENUM | NOT NULL, DEFAULT 'ACTIVE' | 상태 (ACTIVE/PENDING_REVIEW/COMPLETED) |
| rating | SMALLINT | - | 평점 (1~5), null이면 미평가 |
| completed_at | TIMESTAMP | - | 완료 시각 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정 시각 |

**상태 (status) 설명**
| 상태 | 설명 | 조건 |
|------|------|------|
| ACTIVE | 진행 중 | 체크리스트 미완료 |
| PENDING_REVIEW | 평가 대기 | 체크리스트 완료, 평점 없음 |
| COMPLETED | 완료 | 평점 있음 |

**인덱스**
- `(created_by, status)` - 상태별 프로젝트 조회 최적화
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

### daily_receipts

일일 영수증 정보를 저장합니다. 아카이브 탭에서 사용됩니다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| user_id | UUID | FK → users.id, NOT NULL | 사용자 |
| date | DATE | NOT NULL | 영수증 날짜 |
| image_url | VARCHAR(500) | - | 저장된 영수증 이미지 URL |
| total_minutes | INT | NOT NULL, DEFAULT 0 | 총 작업 시간 (분) |
| completed_tasks_count | INT | NOT NULL, DEFAULT 0 | 완료한 Task 수 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정 시각 |

**인덱스**
- `(user_id, date)` (UNIQUE) - 사용자별 날짜당 하나의 영수증
- `(user_id, date)` - 영수증 조회 최적화

**비즈니스 로직**
- 사용자가 '영수증 추가' 버튼 클릭 시 생성
- 매일 KST 0시에 자동 생성 (서버 스케줄러)
- `total_minutes`와 `completed_tasks_count`는 해당 날짜의 time_logs와 checklists 기반으로 계산

---

## 주요 쿼리 패턴

### 진행 중인 프로젝트 조회 (ACTIVE + PENDING_REVIEW)

```sql
SELECT p.*, 
       COUNT(DISTINCT pm2.id) as member_count
FROM projects p
INNER JOIN project_members pm ON pm.project_id = p.id
LEFT JOIN project_members pm2 ON pm2.project_id = p.id
WHERE pm.user_id = :userId
AND p.status IN ('ACTIVE', 'PENDING_REVIEW')
GROUP BY p.id;
```

> ℹ️ `member_count`로 개인(1명)/협업(2명 이상) 구분 가능
> ℹ️ `status`로 평가 대기 프로젝트 구분 가능

### 완료된 프로젝트 조회 (보고서 탭)

```sql
SELECT p.*, 
       COUNT(DISTINCT pm2.id) as member_count
FROM projects p
INNER JOIN project_members pm ON pm.project_id = p.id
LEFT JOIN project_members pm2 ON pm2.project_id = p.id
WHERE pm.user_id = :userId
AND p.status = 'COMPLETED'
GROUP BY p.id
ORDER BY p.completed_at DESC;
```

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

### 영수증 목록 조회

```sql
SELECT *
FROM daily_receipts
WHERE user_id = :userId
ORDER BY date DESC
LIMIT :limit OFFSET :offset;
```
