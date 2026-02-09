# Supabase 인증 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "New project" 클릭
3. 프로젝트 이름 입력 (예: "sangablah")
4. 리전 선택 후 생성

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 3. Google 로그인 설정

1. Supabase Dashboard → Authentication → Providers
2. Google 활성화
3. Google Cloud Console에서 OAuth Client 생성
4. 승인된 리다이렉트 URI에 다음 추가:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Supabase에 Client ID/Secret 입력 후 저장

## 4. Kakao 로그인 설정 (선택사항)

1. Kakao Developers에서 앱 생성
2. Redirect URI에 다음 추가:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers에서 Kakao 활성화
4. Client ID/Secret 입력 후 저장

## 5. localhost 테스트 설정

1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: `http://localhost:3000`
3. Additional Redirect URLs:
   - `http://localhost:3000`
   - `http://localhost:3001`

## 6. 테스트하기

1. 개발 서버 시작: `npm run dev`
2. 로그인 버튼 클릭
3. Google 또는 Kakao 로그인 시도

## 문제 해결

### 리다이렉트 오류
- Supabase URL Configuration에 현재 도메인이 포함되어 있는지 확인
- OAuth 제공자 Redirect URI가 정확한지 확인

### 로그인 실패
- Provider가 활성화되어 있는지 확인
- Client ID/Secret 재확인

## 보안 주의사항

⚠️ anon key는 클라이언트 공개용입니다
⚠️ 서비스 키는 클라이언트에 절대 넣지 마세요
⚠️ 프로덕션 환경에서는 환경변수 사용 필수
