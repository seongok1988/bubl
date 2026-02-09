# 🚀 VS Code에서 바로 시작하기

## 1단계: 프로젝트 열기

1. VS Code를 실행합니다
2. 메뉴: `파일` > `폴더 열기` 클릭
3. `sangablah` 폴더를 선택하고 열기

## 2단계: 터미널 열기

VS Code에서 터미널을 여는 방법:
- 메뉴: `보기` > `터미널`
- 단축키: `Ctrl + `` (백틱/물결표 키)
- 또는 `Ctrl + Shift + `` (새 터미널)

## 3단계: 패키지 설치

터미널에 다음 명령어를 입력하고 Enter:

```bash
npm install
```

⏱️ 설치는 3-5분 정도 걸릴 수 있습니다.

## 4단계: 개발 서버 실행

설치가 완료되면:

```bash
npm run dev
```

✅ 성공 메시지가 나타나면:
```
- Local:   http://localhost:3000
```

## 5단계: 브라우저에서 확인

웹 브라우저를 열고 주소창에 입력:
```
http://localhost:3000
```

🎉 부블 웹사이트가 실행됩니다!

---

## ⚠️ 문제 해결

### "npm을 찾을 수 없습니다" 오류

➡️ Node.js가 설치되지 않았습니다.
1. https://nodejs.org/ko 접속
2. LTS 버전 다운로드 및 설치
3. VS Code 재시작
4. 다시 `npm install` 실행

### 포트 3000이 이미 사용 중

➡️ 다른 프로그램이 3000 포트를 사용 중입니다.
- 다른 개발 서버를 종료하거나
- `package.json`에서 포트를 변경하세요:

```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

### 변경사항이 반영되지 않음

➡️ 브라우저 캐시 문제일 수 있습니다.
- `Ctrl + Shift + R` (하드 리프레시)
- 또는 개발 서버를 재시작하세요

---

## 📝 자주 사용하는 명령어

```bash
# 개발 서버 시작
npm run dev

# 개발 서버 중지
Ctrl + C

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

---

## 🎨 코드 수정 팁

### 색상 변경
📁 `tailwind.config.js` > `theme` > `extend` > `colors`

### 텍스트 변경
📁 `app/page.tsx` > 메인 페이지 텍스트
📁 `components/` > 각 섹션별 텍스트

### 스타일 변경
📁 `app/globals.css` > 글로벌 CSS

---

## ⚡ 다음 단계

1. Supabase 설정하기 → `SUPABASE_GUIDE.md` 참고
2. 실제 데이터 연결하기
3. 도메인 연결 및 배포

---

**도움이 필요하면 README.md를 확인하세요!**
