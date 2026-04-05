-- Supabase 대시보드 > SQL Editor에서 실행하세요

create table comments (
  id bigint generated always as identity primary key,
  post_slug text not null,
  nickname text not null check (char_length(nickname) between 1 and 20),
  content text not null check (char_length(content) between 1 and 1000),
  password_hash text not null,  -- bcrypt 해시 (서버에서 처리)
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

-- 글별 댓글 조회 인덱스
create index comments_post_slug_idx on comments (post_slug, created_at desc);

-- RLS 활성화
alter table comments enable row level security;

-- 익명 사용자도 조회 가능
create policy "Anyone can read comments"
  on comments for select
  using (is_deleted = false);

-- 익명 사용자도 댓글 작성 가능
create policy "Anyone can insert comments"
  on comments for insert
  with check (true);

-- 서비스 롤만 수정/삭제 가능 (API Route에서 service role key 사용)
create policy "Service role can update"
  on comments for update
  using (auth.role() = 'service_role');
