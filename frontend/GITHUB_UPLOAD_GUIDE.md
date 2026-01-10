# GitHub 업로드 가이드

## 1단계: GitHub에서 새 저장소 생성
1. https://github.com 에 로그인
2. 우측 상단 '+' 버튼 클릭 → 'New repository' 선택
3. 저장소 이름 입력 (예: `momento-app`)
4. Public 또는 Private 선택
5. **README, .gitignore, LICENSE를 추가하지 마세요** (이미 파일이 있으므로)
6. 'Create repository' 클릭
7. 표시되는 HTTPS URL을 복사 (예: `https://github.com/YOUR_USERNAME/momento-app.git`)

## 2단계: 터미널에서 명령어 실행

프로젝트 디렉토리에서 다음 명령어들을 순서대로 실행하세요:

```bash
# 1. Git 저장소 초기화
git init

# 2. 모든 파일을 스테이징 영역에 추가
git add .

# 3. 첫 번째 커밋 생성
git commit -m "Initial commit: Momento app"

# 4. GitHub 저장소를 원격 저장소로 추가
# 아래 URL을 1단계에서 복사한 실제 URL로 변경하세요
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 5. 브랜치를 main으로 설정 (이미 main이면 생략 가능)
git branch -M main

# 6. GitHub에 푸시
git push -u origin main
```

## 인증 문제 발생 시

### HTTPS 사용 시:
- GitHub에서 Personal Access Token 필요
- 토큰 생성: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- 푸시 시 비밀번호 대신 토큰 사용

### SSH 사용 시:
```bash
# SSH URL로 원격 저장소 설정
git remote set-url origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

## 유용한 Git 명령어

```bash
# 현재 상태 확인
git status

# 원격 저장소 확인
git remote -v

# 브랜치 확인
git branch

# 커밋 히스토리 확인
git log --oneline
```
