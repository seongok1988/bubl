# 🎉 부블 v2.0 - 설치 가이드

## ✅ 프로젝트 개요

**부블 (Bubl)** - 부동산 평판 인사이트 플랫폼
- 임대인 평판 조회 & 제보
- 익명 커뮤니티 (댓글/답글/이미지)
- 전문가 상담 신청
- 로그인 시스템 (카카오/구글/이메일)

---

## 🚀 빠른 시작 (3단계)

### 1️⃣ 패키지 설치
```bash
npm install
```

### 2️⃣ 개발 서버 실행
```bash
npm run dev
```

### 3️⃣ 브라우저 접속
```
http://localhost:3000
```

✨ **완료!** 이제 바로 사용할 수 있습니다!

---

## 🗄️ Supabase 설정 (선택사항)

현재는 **LocalStorage**로 작동하므로 Supabase 없이도 테스트 가능합니다.
실제 서비스에는 Supabase 연동이 필요합니다.

### 1단계: 프로젝트 생성
1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트명: "bubl"

### 2단계: 환경 변수 설정
`.env.example` 파일을 `.env.local`로 복사하고 값을 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3단계: 데이터베이스 테이블 생성
SQL Editor에서 다음 쿼리 실행:

```sql
CREATE TABLE landlord_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  landlord_name TEXT,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  evaluation_scores JSONB DEFAULT '[]',
  keyword_selections JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_landlord_reports_address ON landlord_reports(address);
```

---

## 📁 프로젝트 구조

```
bubl/
├── app/
│   ├── page.tsx              # 메인 페이지
│   ├── layout.tsx            # 레이아웃
│   └── globals.css           # 글로벌 스타일
├── components/
│   ├── SearchSection.tsx            # 평판 검색
│   ├── LandlordReportComponent.tsx  # 평판 리포트 (핵심!)
│   ├── GaugeChart.tsx               # 게이지 차트
│   ├── CommunitySection.tsx         # 커뮤니티
│   ├── ConsultSection.tsx           # 상담 신청
│   └── LoginModal.tsx               # 로그인
├── lib/
│   └── supabase.ts           # Supabase 클라이언트
└── public/                   # 정적 파일
```

---

## 🎨 주요 기능

### 1. 평판 조회
- 주소 검색
- 게이지 차트 (4가지 평가 항목)
- 키워드 태그
- 리뷰 목록

### 2. 평판 제보
- 별점 평가 (네고 유연성, 재계약 매너, 간섭 지수, 유지보수)
- 키워드 선택 (1~5개)
- 상세 리뷰 작성

### 3. 커뮤니티
- 익명 게시글
- 이미지 업로드 (최대 5장)
- 댓글/답글 (무한 depth)
- 비밀 댓글
- 좋아요/싫어요

### 4. 상담 신청
- 팔아요/구해요 선택
- 간편한 3가지 입력 (이름, 연락처, 내용)

---

## 💡 테스트 방법

### 샘플 주소로 테스트
다음 주소로 평판 조회 가능:
- `역삼동 123-45` - 평가 있음
- `서교동 456-78` - 리뷰 있음  
- `종로 789-12` - 평가 없음

### 데이터 초기화
평판 제보 폼에서 "테스트 초기화" 버튼 클릭

---

## 🛠 개발 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm start        # 프로덕션 서버
npm run lint     # 린트
```

---

## 📱 배포 (Vercel)

1. GitHub에 코드 푸시
2. https://vercel.com 에서 Import
3. 환경 변수 설정 (Supabase URL, Key)
4. Deploy!

---

## ❓ 문제 해결

### "npm을 찾을 수 없습니다"
→ Node.js 설치: https://nodejs.org

### 포트 3000이 사용 중
→ `package.json`에서 포트 변경:
```json
"dev": "next dev -p 3001"
```

### Supabase 연결 오류
→ `.env.local` 파일 확인
→ Supabase 대시보드에서 URL과 Key 확인

---

## 📚 추가 문서

- `README.md` - 프로젝트 전체 설명
- `SUPABASE_GUIDE.md` - Supabase 상세 가이드
- `SUPABASE_AUTH_SETUP.md` - 로그인 설정
- `DESIGN_CHANGES.md` - 디자인 변경사항

---

**🎉 설치 완료! 이제 부블을 즐겨보세요!**

문의: contact@bubl.com
