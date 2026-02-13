# API 레퍼런스

## 인증

### `POST /api/auth`

회원가입 (서버 측 관리자 API 사용).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{ "success": true, "data": { "user": { "id": "...", "email": "..." } } }
```

**Error (400):**
```json
{ "error": "User already registered" }
```

---

## 게시글 (Posts)

### `GET /api/posts`

전체 게시글 목록 조회 (최신순).

**Response:**
```json
{ "data": [{ "id": "...", "title": "...", "content": "...", "created_at": "..." }] }
```

### `POST /api/posts`

게시글 작성. **인증 필수** (`Authorization: Bearer <token>`).

**Request Body:**
```json
{
  "community_id": "uuid",
  "title": "제목",
  "content": "본문"
}
```

---

## 댓글 (Comments)

### `GET /api/comments?post_id=<id>&report_id=<id>`

댓글 조회. `post_id` 또는 `report_id`로 필터링.

### `POST /api/comments`

댓글 작성. **인증 필수**.

**Request Body:**
```json
{
  "post_id": "uuid (선택)",
  "report_id": "uuid (선택)",
  "content": "댓글 내용",
  "is_secret": false
}
```

---

## 설문 (Surveys)

### `GET /api/survey`

설문 목록 조회 (최신순).

### `POST /api/survey`

설문 등록. **인증 필수**.

**Request Body:**
```json
{
  "answers": { "q1": "answer1", "q2": "answer2" }
}
```

---

## 카카오 주소 검색

### `GET /api/kakao-address?query=<주소>`

카카오 주소 검색 프록시. 서버 측 API 키를 사용하여 클라이언트에 키를 노출하지 않습니다.

**Query Parameters:**
- `query` (필수): 검색할 주소 문자열

**Response:** 카카오 주소 API 응답 그대로 반환.
