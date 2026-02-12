# API 명세

## 인증
- POST /auth/login
  - body: { email, password }
  - response: { token, user }
- POST /auth/signup
  - body: { email, password, nickname }
  - response: { user }

## 임대인 리포트
- GET /landlord-report?name=임대인명
  - response: { report, score, comments }
- POST /landlord-report
  - body: { name, building, score, comment }
  - response: { success }

## 커뮤니티
- GET /community/posts
  - response: [ { id, title, content, author, createdAt } ]
- POST /community/posts
  - body: { title, content }
  - response: { success }
- GET /community/comments?postId=글ID
  - response: [ { id, postId, content, author, createdAt } ]

## 상담
- POST /consult
  - body: { userId, question }
  - response: { success, answer }

## 기타
- GET /user/profile
  - response: { user, reports, posts }
