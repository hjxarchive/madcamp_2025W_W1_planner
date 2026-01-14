# 🕒 Momento
> **"기억하고 싶은 모든 순간을 기록으로, 성장을 성과로."**

개인의 몰입과 팀의 협업을 연결하는 스마트 시간 관리 및 프로젝트 기록 시스템

![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)

---

## 📝 프로젝트 소개
**Momento**는 단순한 타이머를 넘어, 프로젝트의 시작부터 종료까지의 모든 과정을 시각화하고 기록합니다. 
개인의 집중 시간 관리부터 팀 단위의 실시간 협업 상태 공유까지, 더 효율적인 작업 환경을 제공합니다.

<br/>

## 👥 팀원 소개

<img src="./image/profile.png" width="1500">

<br/>

---

## ✨ 주요 기능 (Features)

### 1️⃣ 오늘을 한눈에, 메인 대시보드 (Today)
> **원하는 기록은 대시보드에서 간단하게.**

![Main Page](./image/mainpage.jpg)

* 오늘 진행한 프로젝트의 **총 작업 시간**을 직관적으로 표시합니다.
* 일일 활동 요약을 통해 오늘 어떤 프로젝트에 얼마나 몰입했는지 한눈에 파악할 수 있습니다.

<br/>

### 2️⃣ 실시간 몰입 관리 (Current)
> **내 실력에 맞는 프로젝트와 체크리스트 관리.**

![Project Page](./image/project.jpg)

* **체크리스트 타이머**: 프로젝트 내의 세부 할 일을 체크리스트로 관리하며 실시간으로 시간을 측정합니다.
* 개인 프로젝트 전용 리스트를 통해 현재 내가 집중해야 할 작업에만 몰입할 수 있도록 돕습니다.

<br/>

### 3️⃣ 성취를 기록하는 리포트 (Report & Past)
> **나의 노력이 담긴 보고서와 아카이브.**

| 작업 상세 보고서 | 아카이브 갤러리 |
| :---: | :---: |
| <img src="./image/paper.jpg" width="350"> | <img src="./image/archive.jpg" width="350"> |
| **보고서 페이지**: 프로젝트별 소요 시간, 완료일, 평점을 기록하여 성과를 분석합니다. | **아카이브**: 완료된 프로젝트를 음악 앨범 커버 UI 스타일로 시각화하여 보관합니다. |

<br/>

### 4️⃣ 함께 성취하는 즐거움 (Collaboration & Study)
> **나와 비슷한 목표를 가진 동료와 함께.**

![Study Page](./image/study.jpg)

* **협업 탭**: 팀원별로 담당 업무를 배분하고 전체 진척도를 실시간으로 공유합니다.
* **스터디 탭**: 동일한 장소에서 작업 중인 유저들의 현황을 확인하며 건강한 자극을 받습니다.

<br/>

---

## 📦 설치 및 다운로드
안드로이드 기기에서 Momento를 직접 체험해 보실 수 있습니다.

* **APK 다운로드**: [Momento 설치 파일 (momento.apk)](https://drive.google.com/file/d/1GPNHuKCrWRIxJZNE46zmXO-JCNvN7v24/view?usp=drive_link)
* **테스트 환경**: Galaxy S10e, Galaxy S22+ 검증 완료

---

## 🛠️ 기술 스택

### **Infrastructure & Backend**
- **Hosting**: KCloud (Ubuntu 22.04 LTS)
- **Server**: Node.js (v22.x), NestJS (v10.x)
- **Database**: PostgreSQL (v16.x), Prisma ORM
- **Reverse Proxy**: Nginx, PM2

### **Frontend & Communication**
- **Framework**: React Native (Android)
- **Auth**: Firebase Authentication
- **API**: REST API, Socket.io (실시간 기능)

---

## 📂 프로젝트 구조

```text
momento/
├── app/                     # 배포용 APK 파일
├── backend/                 # NestJS 백엔드 서버
│   ├── prisma/              # DB 스키마 및 마이그레이션
│   └── src/                 # 비즈니스 로직 및 모듈
├── frontend/                # React Native 모바일 앱
│   ├── src/                 # 화면 및 컴포넌트
│   └── android/             # 안드로이드 네이티브 설정
└── image/                   # README용 리소스 이미지
