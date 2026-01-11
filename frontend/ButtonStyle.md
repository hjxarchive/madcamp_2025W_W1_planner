# MomentoApp 버튼 위치 및 글씨체 가이드

## 목차
1. [메인 페이지 (MainPage)](#메인-페이지)
2. [프로젝트 페이지](#프로젝트-페이지)
3. [모달 컴포넌트](#모달-컴포넌트)
4. [아카이브 페이지](#아카이브-페이지)
5. [보고서 페이지](#보고서-페이지)
6. [하단 네비게이션](#하단-네비게이션)

---

## 메인 페이지 (MainPage)

### 1. 프로필 버튼 (우상단)
- **위치**: 헤더 우측 (`px-4 py-4` 영역)
- **스타일**: `p-2 hover:bg-gray-100 rounded-full transition-colors`
- **아이콘**: User (size={24}, text-gray-600)
- **텍스트**: 없음 (아이콘만)

### 2. 메인 타이머 버튼 (중앙)
- **위치**: 페이지 상단 중앙 (`py-8`)
- **크기**: `w-48 h-48` (192px × 192px)
- **스타일**: `rounded-full border-4 flex items-center justify-center`
- **테두리**:
    - 실행 중: `border-[#7CB9E8]`
    - 대기 중: `border-gray-300`
- **내부 텍스트**:
    - 시간 표시: `text-3xl font-mono font-bold text-gray-900`
    - 작업명: `text-xs text-gray-500` (실행 중일 때만)

### 3. Daily Todo 체크 버튼
- **위치**: Daily Todo 섹션 내 각 Task 항목 좌측
- **스타일**: 아이콘 버튼 (Circle 컴포넌트)
- **아이콘**: Circle (size={18}, text-gray-400)
- **텍스트**: 없음

### 4. Daily Todo 재생 버튼
- **위치**: Daily Todo 섹션 내 각 Task 항목 우측
- **스타일**: `p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full`
- **아이콘**: Play (size={14})
- **텍스트**: 없음

### 5. 프로젝트 카드 버튼
- **위치**: 프로젝트 목록 영역 (`px-4 py-3`)
- **스타일**: `w-full bg-white border rounded-lg p-3 text-left hover:bg-gray-50 transition-colors`
- **텍스트**:
    - 프로젝트명: `font-medium text-gray-900`
    - 시간: `font-mono text-sm text-gray-600` (실행 중: `text-gray-900`)
    - 진행률: `text-xs text-gray-500` (완료: `text-green-600 font-medium`)
- **상태별 배경**:
    - 일반: `border-gray-200`
    - 실행 중: `border-[#7CB9E8] bg-[#E8F4FD]`
    - 완료: `border-green-300 bg-green-50`

### 6. 새 프로젝트 버튼
- **위치**: 프로젝트 목록 하단
- **스타일**: `w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600`
- **아이콘**: Plus (size={18})
- **텍스트**: `text-gray-500` → hover: `text-gray-600`

### 7. 오늘의 영수증 보기 버튼
- **위치**: 메인 페이지 하단 (`px-4 py-3`)
- **스타일**: `w-full py-3 border-2 rounded-xl font-medium flex items-center justify-center gap-2`
- **상태별 스타일**:
    - 활성: `border-gray-300 bg-white text-gray-700 hover:bg-gray-50`
    - 비활성: `border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed`
- **아이콘**: FileText (size={20})
- **텍스트**: `font-medium`

### 8. 오늘의 아카이브 저장 버튼
- **위치**: 오늘의 영수증 보기 버튼 하단
- **스타일**: `w-full py-3 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg`
- **아이콘**: Download (size={20})
- **텍스트**: `font-medium text-white`

### 9. 시간 측정 시작 버튼 (고정)
- **위치**: 화면 하단 고정 (`fixed bottom-20`)
- **스타일**: `w-full py-4 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg`
- **아이콘**: Play (size={20})
- **텍스트**: `font-medium text-white`
- **조건**: 타이머 실행 중이 아니고 프로젝트가 있을 때만 표시

### 10. 영수증 다운로드 버튼 (영수증 카드 내)
- **위치**: 영수증 카드 우상단 (`absolute top-4 right-4`)
- **스타일**: `p-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors`
- **아이콘**: Download (size={18})
- **텍스트**: 없음

---

## 프로젝트 페이지

### PersonalProjectPage / TeamProjectPage

### 1. 뒤로가기 버튼
- **위치**: 헤더 좌측 (`px-4 py-3`)
- **스타일**: 아이콘 버튼
- **아이콘**: ChevronLeft (size={24}, text-gray-600)
- **텍스트**: 없음

### 2. Task 체크 버튼
- **위치**: 각 Task 항목 좌측
- **스타일**: 아이콘 버튼
- **아이콘**:
    - 완료: CheckCircle2 (size={20}, text-gray-800)
    - 미완료: Circle (size={20}, text-gray-300)
- **텍스트**: 없음

### 3. Task 재생 버튼
- **위치**: 각 Task 항목 우측 (미완료 상태일 때)
- **스타일**: `p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200`
- **아이콘**: Play (size={16})
- **텍스트**: 없음

### 4. Task 추가 버튼
- **위치**: Task 목록 하단 (`mt-3`)
- **스타일**: `w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600`
- **아이콘**: Plus (size={16})
- **텍스트**: `text-gray-500` → hover: `text-gray-600`

### 5. 보고서 작성하기 버튼
- **위치**: 프로젝트 완료 시 하단 (`px-4 py-4`)
- **스타일**: `w-full py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg`
- **아이콘**: FileText (size={18})
- **텍스트**: `font-medium text-white`

### 6. 팀원 추가 버튼 (TeamProjectPage 전용)
- **위치**: 헤더 우측 (`px-4 py-3`)
- **스타일**: `text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded`
- **텍스트**: `text-xs text-gray-600` ("+ 팀원")

---

## 모달 컴포넌트

### TimerSelectModal (시간 측정 시작 모달)

### 1. 닫기 버튼
- **위치**: 모달 헤더 우측 (`p-4`)
- **스타일**: 아이콘 버튼
- **아이콘**: X (size={24}, text-gray-400)
- **텍스트**: 없음

### 2. Task 선택 버튼
- **위치**: 모달 내 Task 목록 (`space-y-2`)
- **스타일**: `w-full p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 flex items-center justify-between`
- **아이콘**: Play (size={18}, text-gray-400, 우측)
- **텍스트**: `text-sm font-medium text-gray-900`

### TimerFullModal (타이머 전체화면 모달)

### 1. 닫기 버튼 (접기)
- **위치**: 모달 상단 좌측 (`p-4`)
- **스타일**: `p-2`
- **아이콘**: ChevronDown (size={24}, text-gray-600)
- **텍스트**: 없음

### 2. 측정 종료 버튼
- **위치**: 모달 하단 중앙 (`mt-12`)
- **스타일**: `px-12 py-4 bg-gray-900 text-white rounded-xl font-medium flex items-center gap-2`
- **아이콘**: Square (size={20})
- **텍스트**: `font-medium text-white`

### CreateProjectModal (프로젝트 생성 모달)

### 1. 닫기 버튼
- **위치**: 모달 헤더 우측 (`mb-6`)
- **스타일**: 아이콘 버튼
- **아이콘**: X (size={24}, text-gray-400)
- **텍스트**: 없음

### 2. 멤버 제거 버튼
- **위치**: 멤버 목록 내 각 항목 우측
- **스타일**: `text-gray-400 hover:text-gray-600`
- **아이콘**: X (size={16})
- **텍스트**: 없음

### 3. 멤버 추가 버튼
- **위치**: 멤버 입력 필드 우측
- **스타일**: `px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed`
- **텍스트**: `text-sm font-medium text-white` ("추가")

### 4. 취소 버튼
- **위치**: 모달 하단 좌측 (`mt-6`)
- **스타일**: `flex-1 py-3 border border-gray-300 rounded-xl text-gray-600`
- **텍스트**: `text-gray-600` (기본 폰트)

### 5. 생성 버튼
- **위치**: 모달 하단 우측 (`mt-6`)
- **스타일**: `flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:bg-gray-300`
- **텍스트**: `text-white` (기본 폰트)

### AddTaskModal (Task 추가 모달)

### 1. 닫기 버튼
- **위치**: 모달 헤더 우측 (`mb-6`)
- **스타일**: 아이콘 버튼
- **아이콘**: X (size={24}, text-gray-400)
- **텍스트**: 없음

### 2. 취소 버튼
- **위치**: 모달 하단 좌측
- **스타일**: `flex-1 py-3 border border-gray-300 rounded-xl text-gray-600`
- **텍스트**: `text-gray-600` (기본 폰트)

### 3. 추가 버튼
- **위치**: 모달 하단 우측
- **스타일**: `flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:bg-gray-300`
- **텍스트**: `text-white` (기본 폰트)

### WriteReportModal (보고서 작성 모달)

### 1. 닫기 버튼
- **위치**: 모달 헤더 우측 (`mb-6`)
- **스타일**: 아이콘 버튼
- **아이콘**: X (size={24}, text-gray-400)
- **텍스트**: 없음

### 2. 나중에 버튼
- **위치**: 모달 하단 좌측
- **스타일**: `flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium`
- **텍스트**: `font-medium text-gray-600`

### 3. 저장하기 버튼
- **위치**: 모달 하단 우측
- **스타일**: `flex-1 py-3 bg-green-600 text-white rounded-xl font-medium`
- **텍스트**: `font-medium text-white`

### ProfileModal (개인정보 모달)

### 1. 닫기 버튼
- **위치**: 모달 헤더 우측 (`px-2 mb-6`)
- **스타일**: `p-1 hover:bg-gray-100 rounded-full`
- **아이콘**: X (size={24}, text-gray-400)
- **텍스트**: 없음

### 2. 수정 버튼
- **위치**: 닉네임 하단
- **스타일**: `px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors`
- **텍스트**: `text-sm text-gray-600` → hover: `text-gray-900`

### 3. 저장 버튼 (편집 모드)
- **위치**: 입력 필드 하단 (`mt-2`)
- **스타일**: `px-4 py-2 bg-gray-900 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800`
- **텍스트**: `font-medium text-white`

### 4. 취소 버튼 (편집 모드)
- **위치**: 저장 버튼 옆
- **스타일**: `px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50`
- **텍스트**: `font-medium text-gray-600`

### ReceiptPreviewModal (영수증 미리보기 모달)

### 1. 닫기 버튼
- **위치**: 모달 헤더 우측 (`px-4 py-3`)
- **스타일**: `p-1 hover:bg-gray-100 rounded-full`
- **아이콘**: X (size={24}, text-gray-400)
- **텍스트**: 없음

### 2. 닫기 버튼 (하단)
- **위치**: 모달 하단 좌측 (`px-4 py-4`)
- **스타일**: `flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium`
- **텍스트**: `font-medium text-gray-600`

### 3. 저장하기 버튼 (하단)
- **위치**: 모달 하단 우측 (`px-4 py-4`)
- **스타일**: `flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2`
- **상태별 스타일**:
    - 활성: `bg-gray-900 text-white hover:bg-gray-800`
    - 비활성: `bg-gray-200 text-gray-400 cursor-not-allowed`
- **아이콘**: Download (size={18})
- **텍스트**: `font-medium`

### FloatingTimer (플로팅 타이머)

### 1. 확장 버튼 (좌측)
- **위치**: 플로팅 타이머 좌측 (`flex-1`)
- **스타일**: `flex items-center gap-3 flex-1 min-w-0`
- **텍스트**:
    - 작업명: `text-sm font-medium truncate` (text-white)
    - 프로젝트명: `text-xs text-gray-400 truncate`

### 2. 정지 버튼 (우측)
- **위치**: 플로팅 타이머 우측
- **스타일**: `p-2 bg-[#7CB9E8] rounded-full hover:bg-[#6BA8D8]`
- **아이콘**: Square (size={16}, text-white)
- **텍스트**: 없음

---

## 아카이브 페이지

### WeeklyArchivePage (주간 아카이브)

### 1. 뒤로가기 버튼
- **위치**: 헤더 좌측 (`px-4 py-3`)
- **스타일**: 아이콘 버튼
- **아이콘**: ChevronLeft (size={24}, text-gray-600)
- **텍스트**: 없음

### 2. 날짜 네비게이션 버튼
- **위치**: 요약 섹션 하단 (`px-2 py-3`)
- **스타일**: `flex flex-col items-center px-2 py-1 rounded-lg transition-all`
- **상태별 스타일**:
    - 선택됨: `bg-gray-900 text-white`
    - 비선택: `text-gray-600 hover:bg-gray-100`
- **텍스트**:
    - 요일: `text-xs`
    - 날짜: `text-sm font-medium` (선택: `text-white`)

### 3. 페이지 인디케이터 버튼
- **위치**: 영수증 카드 하단 (`py-2`)
- **스타일**: `h-1.5 rounded-full transition-all`
- **상태별 스타일**:
    - 선택: `w-6 bg-gray-900`
    - 비선택: `w-1.5 bg-gray-300`
- **텍스트**: 없음

### 4. 현재 영수증 이미지 저장 버튼
- **위치**: 페이지 하단 (`px-4 pt-2`)
- **스타일**: `w-full py-3 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2`
- **아이콘**: Download (size={18})
- **텍스트**: `font-medium text-white`

### 5. 월간 아카이브 보기 버튼
- **위치**: 저장 버튼 하단
- **스타일**: `w-full py-3 border border-gray-300 bg-white rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2`
- **아이콘**: Calendar (size={18})
- **텍스트**: `font-medium text-gray-700`

### MonthlyArchivePage (월간 아카이브)

### 1. 뒤로가기 버튼
- **위치**: 헤더 좌측 (`px-4 py-3`)
- **스타일**: 아이콘 버튼
- **아이콘**: ChevronLeft (size={24}, text-gray-600)
- **텍스트**: 없음

### 2. 이전 달 버튼
- **위치**: 월 선택 영역 좌측 (`py-4`)
- **스타일**: `p-2 hover:bg-gray-100 rounded-full`
- **아이콘**: ChevronLeft (size={20}, text-gray-600)
- **텍스트**: 없음

### 3. 다음 달 버튼
- **위치**: 월 선택 영역 우측 (`py-4`)
- **스타일**: `p-2 hover:bg-gray-100 rounded-full`
- **아이콘**: ChevronRight (size={20}, text-gray-600)
- **텍스트**: 없음

### 4. 날짜 버튼 (캘린더)
- **위치**: 캘린더 그리드 내 (`grid-cols-7`)
- **스타일**: `aspect-square rounded flex flex-col items-center justify-center text-xs transition-all`
- **상태별 스타일**:
    - 선택: `bg-gray-900 text-white` (텍스트: `font-bold`)
    - 오늘: `bg-blue-50 text-blue-700 font-medium border border-blue-200`
    - 일반: `hover:bg-gray-100 text-gray-700`
- **텍스트**: `text-xs` (선택: `font-bold`)

### 5. 상세 기록 보기 버튼
- **위치**: 선택된 날짜 데이터가 있을 때 하단 (`px-4`)
- **스타일**: `w-full py-3 border border-gray-300 bg-white rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50`
- **아이콘**: FileText (size={18})
- **텍스트**: `font-medium text-gray-700`

---

## 보고서 페이지

### ReportPage (보고서 목록)

### 1. 뒤로가기 버튼
- **위치**: 헤더 좌측 (`px-4 py-3`)
- **스타일**: 아이콘 버튼
- **아이콘**: ChevronLeft (size={24}, text-gray-600)
- **텍스트**: 없음

### 2. 보고서 카드 버튼
- **위치**: 보고서 목록 (`px-4 py-4`)
- **스타일**: `w-full bg-gray-50 rounded-xl p-4 mb-4 text-left hover:bg-gray-100 transition-colors`
- **텍스트**:
    - 제목: `font-semibold text-gray-900`
    - 정보: `text-sm text-gray-600`

### ReportDetailPage (보고서 상세)

### 1. 뒤로가기 버튼
- **위치**: 헤더 좌측 (`px-4 py-3`)
- **스타일**: 아이콘 버튼
- **아이콘**: ChevronLeft (size={24}, text-gray-600)
- **텍스트**: 없음

### 2. Task 정보 모달 닫기 버튼
- **위치**: 모달 헤더 우측 (`mb-4`)
- **스타일**: 아이콘 버튼
- **아이콘**: X (size={24}, text-gray-400)
- **텍스트**: 없음

### 3. Task 정보 모달 닫기 버튼 (하단)
- **위치**: 모달 하단 (`mt-6`)
- **스타일**: `w-full py-3 bg-gray-900 text-white rounded-xl font-medium`
- **텍스트**: `font-medium text-white`

---

## 하단 네비게이션

### BottomNav

### 1. 메인 탭 버튼
- **위치**: 하단 네비게이션 좌측 (`fixed bottom-0`)
- **스타일**: `flex flex-col items-center px-4 py-1`
- **아이콘**: Clock (size={22})
- **텍스트**: `text-xs mt-1`
- **상태별 색상**:
    - 활성: `text-gray-900`
    - 비활성: `text-gray-400`

### 2. 보고서 탭 버튼
- **위치**: 하단 네비게이션 중앙
- **스타일**: `flex flex-col items-center px-4 py-1`
- **아이콘**: BarChart3 (size={22})
- **텍스트**: `text-xs mt-1`
- **상태별 색상**:
    - 활성: `text-gray-900`
    - 비활성: `text-gray-400`

### 3. 아카이브 탭 버튼
- **위치**: 하단 네비게이션 우측
- **스타일**: `flex flex-col items-center px-4 py-1`
- **아이콘**: Calendar (size={22})
- **텍스트**: `text-xs mt-1`
- **상태별 색상**:
    - 활성: `text-gray-900`
    - 비활성: `text-gray-400`

---

## 공통 스타일 정리

### 글씨체 및 크기

#### 제목/헤더
- 대제목: `text-xl font-light` 또는 `text-xl font-semibold`
- 중제목: `text-lg font-semibold`
- 소제목: `text-sm font-semibold` 또는 `text-sm font-medium`

#### 본문 텍스트
- 기본: `text-sm` (기본 폰트, font-normal)
- 강조: `font-medium` 또는 `font-semibold`
- 작은 텍스트: `text-xs`
- 큰 텍스트: `text-2xl`, `text-3xl`, `text-4xl`

#### 시간 표시
- 기본: `font-mono` (고정폭 폰트)
- 크기: `text-sm`, `text-lg`, `text-2xl`, `text-3xl`, `text-4xl`
- 굵기: `font-bold`, `font-medium`

#### 색상
- 기본 텍스트: `text-gray-900`, `text-gray-800`, `text-gray-700`, `text-gray-600`
- 보조 텍스트: `text-gray-500`, `text-gray-400`
- 강조 색상: `text-[#7CB9E8]`, `text-green-600`, `text-orange-600`
- 버튼 텍스트: `text-white` (배경색이 있는 경우)

### 버튼 패턴

#### 주요 액션 버튼
- 배경: `bg-gray-900`
- 텍스트: `text-white font-medium`
- 패딩: `py-3` 또는 `py-4`
- 모서리: `rounded-xl`

#### 보조 액션 버튼
- 배경: `bg-white` 또는 `bg-gray-50`
- 테두리: `border border-gray-300`
- 텍스트: `text-gray-600` 또는 `text-gray-700 font-medium`
- 패딩: `py-3`
- 모서리: `rounded-xl`

#### 아이콘 버튼
- 패딩: `p-1`, `p-1.5`, `p-2`
- 모서리: `rounded-full` 또는 `rounded-lg`
- 호버: `hover:bg-gray-100`

#### 비활성 버튼
- 배경: `bg-gray-200` 또는 `bg-gray-300`
- 텍스트: `text-gray-400`
- 커서: `cursor-not-allowed`
- 상태: `disabled`

---

## 요약 표

| 버튼 유형 | 위치 | 글씨체 | 크기 | 색상 |
|---------|------|--------|------|------|
| 메인 타이머 | 페이지 상단 중앙 | font-mono font-bold | text-3xl | text-gray-900 |
| 프로젝트 카드 | 프로젝트 목록 | font-medium (제목) | text-base | text-gray-900 |
| 새 프로젝트 | 프로젝트 목록 하단 | 기본 | 기본 | text-gray-500 |
| 시간 측정 시작 | 화면 하단 고정 | font-medium | 기본 | text-white |
| Task 추가 | Task 목록 하단 | 기본 | 기본 | text-gray-500 |
| 보고서 작성 | 프로젝트 완료 시 | font-medium | 기본 | text-white |
| 모달 주요 버튼 | 모달 하단 | font-medium | 기본 | text-white (bg-gray-900) |
| 모달 취소 버튼 | 모달 하단 | 기본/font-medium | 기본 | text-gray-600 |
| 네비게이션 탭 | 하단 고정 | 기본 | text-xs | text-gray-900/400 |
