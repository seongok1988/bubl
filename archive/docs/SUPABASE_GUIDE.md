# Supabase 데이터베이스 구조 및 사용 가이드

## 📊 테이블 구조

### 1. landlord_reports (임대인 정보)

```sql
create table if not exists landlord_reports (
  id text primary key,
  address text not null,
  landlord_name text,
  rating numeric,
  total_reviews integer,
  positive_traits text[] default '{}',
  negative_traits text[] default '{}',
  recommendations integer default 0,
  warnings integer default 0,
  evaluation jsonb,
  user_notes text,
  reviews jsonb,
  evaluation_scores jsonb default '[]'::jsonb,
  keyword_selections jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 2. posts (커뮤니티 게시글)

```sql
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author text,
  author_id uuid,
  category text,
  likes integer default 0,
  comments integer default 0,
  liked_by uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 3. comments (댓글)

```sql
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  author text,
  author_id uuid,
  likes integer default 0,
  created_at timestamptz default now()
);
```

### 4. consults (상담 신청)

```sql
create table if not exists consults (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  address text,
  consult_type text,
  message text,
  status text default 'pending',
  assigned_to uuid,
  created_at timestamptz default now(),
  completed_at timestamptz
);
```

## 🔧 Supabase 사용 예시

### 임대인 정보 조회

```typescript
import { supabase } from '@/lib/supabase'

async function getLandlordInfo(address: string) {
  const { data, error } = await supabase
    .from('landlord_reports')
    .select('*')
    .ilike('address', `%${address}%`)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(error)
    return null
  }

  return data
}
```

### 평가 점수 추가

```typescript
import { supabase } from '@/lib/supabase'

async function appendEvaluationScore(id: string, score: any) {
  const { data, error } = await supabase
    .from('landlord_reports')
    .select('evaluation_scores')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error

  const current = Array.isArray(data?.evaluation_scores) ? data?.evaluation_scores : []
  const next = [...current, score]

  const { error: upsertError } = await supabase
    .from('landlord_reports')
    .upsert({ id, evaluation_scores: next }, { onConflict: 'id' })

  if (upsertError) throw upsertError
}
```

### 게시글 작성

```typescript
import { supabase } from '@/lib/supabase'

async function createPost(postData: {
  title: string
  content: string
  category: string
  author: string
}) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...postData,
      likes: 0,
      comments: 0,
      liked_by: []
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 실시간 게시글 구독

```typescript
import { supabase } from '@/lib/supabase'

function subscribeToPosts(onChange: () => void) {
  const channel = supabase
    .channel('posts-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      () => onChange()
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
```

## 🔐 RLS 정책 예시

Supabase Dashboard > Database > Policies에서 RLS를 활성화한 뒤 정책을 추가하세요.

```sql
alter table landlord_reports enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table consults enable row level security;

create policy "landlords_read" on landlord_reports
for select using (true);

create policy "landlords_write" on landlord_reports
for insert with check (auth.uid() is not null);

create policy "posts_read" on posts
for select using (true);

create policy "posts_write" on posts
for insert with check (auth.uid() is not null);
```

## 📧 이메일 알림 (선택사항)

상담 신청 알림은 Supabase Edge Functions 또는 외부 이메일 API를 사용하세요.
예: `consults` 테이블 insert 이벤트를 트리거로 처리

## 💡 팁

### 익명 접근

로그인이 없는 공개 조회는 `select` 정책을 `true`로 설정하세요.

### 성능 최적화

- 자주 조회되는 컬럼에 인덱스 추가
- 페이지네이션 사용
- 필요한 필드만 select

---

이 가이드를 참고하여 Supabase를 프로젝트에 통합하세요!
