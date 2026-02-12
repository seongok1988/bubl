# 🎯 부블 - 5분만에 시작하기!

## ✅ 필수 준비물

1. **Node.js 설치** (https://nodejs.org/ko)
   - LTS 버전 다운로드 → 설치
   - 설치 후 컴퓨터 재시작

2. **VS Code 설치** (https://code.visualstudio.com)
   - 다운로드 → 설치

---

## 🚀 빠른 시작 (3단계)

### 1️⃣ 프로젝트 압축 해제
- `sangablah.zip` 파일을 원하는 위치에 압축 해제
- 예: `C:\projects\sangablah` 또는 `문서\sangablah`

### 2️⃣ VS Code로 열기
1. VS Code 실행
2. `파일` → `폴더 열기`
3. 압축 해제한 `sangablah` 폴더 선택

### 3️⃣ 실행하기
VS Code 하단 터미널에서 다음 명령어를 차례로 입력:

```bash
npm install
```
(3-5분 대기)

```bash
npm run dev
```

✨ 브라우저에서 `http://localhost:3000` 접속!

---

## 📱 현재 구현된 기능

✅ **주소 검색 & 리포트**
- 상가 주소로 임대인 정보 조회
- 평점, 리뷰, 추천/주의 점수 표시
- 긍정/부정 특성 분석

✅ **익명 커뮤니티**
- 경험담, 질문, 주의사항 게시글 작성
- 좋아요 기능
- 실시간 댓글

✅ **상담 신청 폼**
- 전문가 상담 신청
- 중개사 연결 서비스

---

## ⚡ Supabase 연결하기 (실제 데이터 사용)

### 1단계: Supabase 프로젝트 만들기
1. https://supabase.com 접속
2. "New project" 클릭
3. 프로젝트 이름: "sangablah" 입력

### 2단계: 설정 정보 복사
1. 프로젝트 대시보드 → Project Settings → API
2. `Project URL`과 `anon public` 키 복사

### 3단계: 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 만들고 다음 값을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4단계: 테이블 준비
이 프로젝트는 `landlord_reports` 테이블을 사용합니다.
자세한 스키마는 가이드에서 확인하세요.

🎉 완료! 이제 실제 데이터베이스가 연결되었습니다.

---

## 🎨 디자인 수정하기

### 색상 바꾸기
📁 `tailwind.config.js` 파일 열기:

```javascript
colors: {
  primary: '#3B82F6',    // ← 이 값을 원하는 색상 코드로 변경
  secondary: '#10B981',  // ← 초록색
  danger: '#EF4444',     // ← 빨간색
}
```

### 텍스트 바꾸기
- 메인 페이지: `app/page.tsx`
- 검색 섹션: `components/SearchSection.tsx`
- 커뮤니티: `components/CommunitySection.tsx`
- 상담 신청: `components/ConsultSection.tsx`

---

## 🌐 인터넷에 배포하기 (무료)

### Vercel 사용 (추천)
1. GitHub 계정으로 코드 업로드
2. https://vercel.com 접속
3. "Import Project" 클릭
4. 배포 완료! 
   - 예: `sangablah.vercel.app`

---

## ❓ 자주 묻는 질문

**Q: "npm을 찾을 수 없습니다" 오류가 나요**
A: Node.js를 설치하고 컴퓨터를 재시작하세요.

**Q: 화면이 안 바뀌어요**
A: 개발 서버가 실행 중인지 확인하고, 브라우저를 새로고침하세요.

**Q: 코드를 수정했는데 반영이 안 돼요**
A: 파일을 저장했는지 확인하세요 (Ctrl+S). 저장하면 자동으로 반영됩니다.

**Q: Supabase 비용이 걱정돼요**
A: 무료 티어로 충분합니다. 소규모 트래픽은 무료 플랜으로 테스트 가능합니다.

---

## 📞 더 많은 도움이 필요하신가요?

- 📖 **README.md** - 전체 프로젝트 설명서
- ⚡ **SUPABASE_GUIDE.md** - Supabase 상세 가이드
- 🚀 **QUICK_START.md** - VS Code 실행 가이드

---

**제작: 부블 팀 | 버전 1.0.0**
