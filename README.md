# 🕒 Momento
> **"계획적인 당신을 위한, 성장을 증명하는 가장 완벽한 플래너."**
> 개인의 몰입과 팀의 유기적인 협업을 데이터로 기록하고 시각화하는 스마트 시간 관리 시스템

![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)

---

## 📦 설치 및 다운로드
안드로이드 기기에서 Momento를 직접 체험해 보실 수 있습니다.

* **APK 다운로드**: [Momento 설치 파일 (Google Drive)](https://drive.google.com/file/d/1GPNHuKCrWRIxJZNE46zmXO-JCNvN7v24/view?usp=drive_link)
* **테스트 환경**: Galaxy S10e, Galaxy S22+ 검증 완료

---

## 👥 팀원 소개
<img src="./image/profile.png" width="100%">

---

## ❓ 문제 정의 (Problem Definition)
**"평소에 계획을 좋아하지만 어떻게 계획해야 할지 몰랐거나, 세운 계획을 실천하는 과정을 시각화하고 싶으신가요?"**

많은 사람들이 목표를 세우지만, 그 목표를 달성하기 위한 세부 단위(Task)를 어떻게 관리하고 시간을 배분해야 할지 어려움을 겪습니다. **Momento**는 추상적인 계획을 구체적인 시간 기록으로 전환하여, 당신의 성취를 수치와 리포트로 증명합니다.

---

## 🛠️ 기술 스택 및 시스템 아키텍처

### 1. 기술 스택 (Tech Stack)
| 분류 | 기술 스택 | 비고 |
| :--- | :--- | :--- |
| **Infrastructure** | KCloud (Ubuntu 22.04 LTS), Nginx, PM2 | 서버 호스팅 및 프로세스 관리 |
| **Backend** | Node.js (v22.x), NestJS (v10.x), Prisma ORM | 서버 프레임워크 및 데이터베이스 접근 |
| **Database** | PostgreSQL (v16.x) | 메인 관계형 데이터베이스 |
| **Frontend** | React Native (Android) | 크로스 플랫폼 모바일 앱 개발 |
| **Communication** | REST API, Socket.io, Firebase Auth | 데이터 통신 및 사용자 인증 |

### 2. Momento의 구성 요소
* **Task**: 시간을 측정할 수 있는 기본 단위.
* **Project**: 여러 개의 Task로 구성된 장기 목표.
* **Personal Project**: 참여 인원이 1명인 개인용 프로젝트.
* **Team Project**: 참여 인원이 2명 이상인 협업용 프로젝트.

---

## ✨ 주요 기능 (Key Features)

### 1️⃣ 로그인 및 사용자 인증
* **Google Sign-in**: Firebase Auth 기반의 간편 로그인 및 JWT 토큰 보안 서비스.
* **로그인 애니메이션**: 사용자 경험을 높여주는 부드러운 시작 화면.

| 로그인 페이지 | 개인정보 수정 (이모지/닉네임) |
| :---: | :---: |
| <img src="./image/Momento_로그인.mp4" width="300"> | <img src="./image/Momento_개인정보수정모달.mp4" width="300"> |

> **Exception Handler:** 닉네임 수정 시 중복 검사를 수행하여 중복된 경우 수정을 제한합니다.

<br/>

### 2️⃣ 개인 프로젝트 관리 (Personal)
* **프로젝트 생성**: 이름 및 Due Date(마감일) 설정 가능.
* **실시간 진행도**: 프로젝트 내 Task의 완료 여부에 따라 진행률을 자동 계산합니다.
  $$Progress = 100 \times \frac{Completed Tasks}{Total Tasks}$$
* **집중 모드 (뽀모도로)**: 시간 측정 중 파도 모양 시계를 누르면 시간 측정에만 집중할 수 있는 간결한 페이지로 전환됩니다.

| 프로젝트 생성 및 관리 | 집중 모드 (뽀모도로) |
| :---: | :---: |
| <img src="./image/Momento_개인프로젝트.mp4" width="300"> | <img src="./image/Momento_집중모드.mp4" width="300"> |

> **Exception Handler:** > * 프로젝트명 또는 마감일 미입력 시 오류 메시지 발생.
> * 시간 측정 중인 Task는 삭제 버튼이 비활성화되며, 해당 Task를 포함한 프로젝트 삭제 시도 시 오류 메시지가 발생합니다.

<br/>

### 3️⃣ 유기적인 팀 프로젝트 (Collaboration)
* **팀원 관리**: 닉네임 검색을 통해 프로젝트 생성 시 또는 생성 후 상단 버튼으로 팀원을 추가할 수 있습니다.
* **담당자 지정**: Task 생성 시 팀원 중 담당자를 배정하여 역할 분담을 명확히 합니다.
* **실시간 상태 공유**: 상단 MemberCard를 통해 각 팀원의 진행도를 확인하며, 인원이 많을 경우 스크롤을 지원합니다.

| 팀원 추가 및 스크롤 | 팀 프로젝트 관리 |
| :---: | :---: |
| <img src="./image/Momento_팀스크롤.mp4" width="300"> | <img src="./image/Momento_팀 프로젝트.mp4" width="300"> |

> **Exception Handler:** > * 담당자가 아닌 팀원은 해당 Task의 시간을 측정할 수 없습니다.
> * 프로젝트 삭제 권한은 오직 생성자에게만 부여됩니다.

<br/>

### 4️⃣ 보고서 및 아카이브 (Report)
* **데이터 시각화**: 완료된 프로젝트의 Task 기록을 바탕으로 시간 비례 파이 차트 리포트를 생성합니다.
* **성과 기록**: 소요 시간, 완료 Task 리스트, 유저 평점(0~10)을 저장합니다.
* **완료 강조**: 완료된 프로젝트는 메인 페이지에서 초록색으로 강조 표시됩니다.

| 보고서 제작 모달 | 영수증 제작 (작성 중) |
| :---: | :---: |
| <img src="./image/Momento_보고서 제작.mp4" width="300"> | <img src="./image/paper.jpg" width="300"> |

---

## 📂 프로젝트 구조
```text
momento/
├── app/                     # 배포용 APK (momento.apk)
├── backend/                 # NestJS 백엔드 서버
│   ├── prisma/              # DB Schema (PostgreSQL)
│   └── src/                 # Business Logic (Modules)
├── frontend/                # React Native 모바일 앱
│   ├── src/                 # Screens & Components
│   └── android/             # Android Native Settings
└── image/                   # README 리소스 및 데모 mp4
