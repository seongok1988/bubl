# 부블 - 상가 임대인 리포트 & 커뮤니티

임차인을 위한 상가 임대인 성향 분석 및 익명 커뮤니티 플랫폼

## 🚀 빠른 시작

### 1. 필수 설치 프로그램

먼저 다음 프로그램들을 설치해주세요:

1. **Node.js** (v18 이상)
   - https://nodejs.org/ko 에서 다운로드
   - LTS 버전 추천

2. **VS Code**
   - https://code.visualstudio.com/ 에서 다운로드

### 2. 프로젝트 설치

VS Code에서 터미널을 열고 다음 명령어를 실행하세요:

```bash
# 프로젝트 폴더로 이동
cd sangablah

# 패키지 설치
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열면 웹사이트를 볼 수 있습니다!

## 📁 프로젝트 구조

```
sangablah/
├── app/                    # Next.js 앱 라우터
│   ├── page.tsx           # 메인 페이지
│   ├── layout.tsx         # 레이아웃
│   └── globals.css        # 전역 스타일
├── components/            # 재사용 컴포넌트
│   ├── SearchSection.tsx  # 주소 검색 섹션
│   ├── CommunitySection.tsx # 커뮤니티 섹션
│   └── ConsultSection.tsx # 상담 신청 섹션
├── lib/                   # 유틸리티 & 설정
│   └── supabase.ts        # Supabase 설정
└── public/                # 정적 파일 (이미지 등)
```

## ⚡ Supabase 설정하기

### 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "New project" 클릭
3. 프로젝트 이름: "sangablah" 입력
4. 리전 선택 (예: Seoul)

### 2. 프로젝트 키 확인

1. 프로젝트 대시보드 > Project Settings > API
2. `Project URL`과 `anon public` 키 복사

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 다음 값을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. 데이터 테이블 준비

이 프로젝트는 `landlord_reports` 테이블을 사용합니다.
자세한 스키마는 가이드에서 확인하세요.

### 5. Authentication 활성화 (선택사항)

1. Supabase Dashboard > Authentication > Providers
2. Google/Kakao 등 필요한 로그인 제공자 활성화
3. 리다이렉트 URL 설정

## 🎨 디자인 수정하기

### 색상 변경

`tailwind.config.js` 파일에서 색상을 변경할 수 있습니다:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',    // 메인 파란색
      secondary: '#10B981',  // 보조 초록색
      danger: '#EF4444',     // 경고 빨간색
    },
  },
}
```

### 글꼴 변경

`app/layout.tsx` 또는 `app/globals.css`에서 글꼴을 변경할 수 있습니다.

## 📝 주요 기능

### 1. 주소 검색 & 리포트
- 상가 주소로 임대인 정보 검색
- 평점, 리뷰, 긍정/부정 특성 표시
- 추천/주의 점수 시각화

### 2. 익명 커뮤니티
- 경험담, 질문, 주의사항 게시글 작성
- 좋아요 및 댓글 기능
- 카테고리별 필터링

### 3. 상담 신청
- 전문가 상담 신청 폼
- 이메일 알림 (설정 필요)
- 중개사 연결 서비스

## 🛠 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 검사
npm run lint
```

## 📱 배포하기

### Vercel 배포 (추천)

1. GitHub에 코드 업로드
2. https://vercel.com 접속
3. "Import Project" 클릭
4. GitHub 저장소 선택
5. 환경 변수 설정 (Supabase 설정)
6. "Deploy" 클릭

### 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 추가하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### GitHub Actions (CI)용 Secrets 설정 🔐

이 저장소의 GitHub Actions 워크플로우에서 Supabase에 접근하려면 다음 **Repository secrets**를 추가해야 합니다.

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase 익명(퍼블릭) 키
- `SUPABASE_SERVICE_ROLE_KEY` — (선택적이지만 권장) 서비스 롤 키 (관리자 작업이나 테스트 데이터 생성에 사용)

설정 방법 (빠른 가이드):
1. GitHub에서 저장소로 이동 → Settings → Secrets and variables → Actions
2. **New repository secret** 클릭하고 위 키와 값을 추가

안전 권장 사항:
- CI에서는 **테스트 전용 Supabase 프로젝트**를 사용하세요(운영 DB에 직접 접근하지 않도록 주의). ⚠️
- `.env.local`을 절대 커밋하지 마세요. CI에서는 GitHub Secrets로만 값을 주입합니다.

로컬에서 테스트 실행 예시:

PowerShell 예:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://your.supabase.co"; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"; $env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"; node ./scripts/test-ownership.js
```

CI가 Secrets을 사용해 정상 동작하는지 확인하려면 PR을 열어 워크플로우가 실행되는 것을 확인하세요. (실패하면 `ownership-test-logs` artifact에 로그가 업로드됩니다.)

## ✅ 운영 체크리스트

- `npm run lint`로 코드 검사 통과 확인
- `npm run build` 성공 여부 확인
- Supabase RLS 정책 확인
- 환경 변수(Vercel/호스팅)에 Supabase 키 설정
- 테스트용 경고/알림 메시지는 운영 전 점검

## 🤝 도움이 필요하신가요?

- Supabase 공식 문서: https://supabase.com/docs
- Next.js 공식 문서: https://nextjs.org/docs
- Tailwind CSS 문서: https://tailwindcss.com/docs

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

---

**제작:** 부블 팀
**버전:** 1.0.0
**최종 업데이트:** 2024-02-06
