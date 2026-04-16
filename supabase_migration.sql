-- ============================================================
-- 1. apartData 검색 인덱스
-- ============================================================
create index if not exists idx_apartdata_sido_sigungu
  on "apartData"(sido, sigungu);

create index if not exists idx_apartdata_sigungu_dong
  on "apartData"(sigungu, "donglee");

create index if not exists idx_apartdata_danjiname
  on "apartData"("danjiName");

-- ============================================================
-- 2. 투표 본체 테이블
-- ============================================================
create table if not exists polls (
  id         uuid default gen_random_uuid() primary key,
  title      text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. 투표 선택지(아파트) 테이블
-- ============================================================
create table if not exists poll_options (
  id           uuid default gen_random_uuid() primary key,
  poll_id      uuid references polls(id) on delete cascade not null,
  apartment_id text references "apartData"("danjiCode") not null,
  vote_count   int default 0 not null
);

create index if not exists idx_poll_options_poll_id on poll_options(poll_id);

-- ============================================================
-- 4. 댓글 테이블
-- ============================================================
create table if not exists poll_comments (
  id          uuid default gen_random_uuid() primary key,
  poll_id     uuid references polls(id) on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now(),
  author_name text not null
);

create index if not exists idx_poll_comments_poll_id on poll_comments(poll_id);

-- ============================================================
-- 5. RLS 정책 (익명 읽기/쓰기 허용)
-- ============================================================
alter table polls         enable row level security;
alter table poll_options  enable row level security;
alter table poll_comments enable row level security;

create policy "public read polls"         on polls         for select using (true);
create policy "public insert polls"       on polls         for insert with check (true);

create policy "public read poll_options"  on poll_options  for select using (true);
create policy "public insert poll_options" on poll_options for insert with check (true);
create policy "public update vote_count"  on poll_options  for update using (true) with check (true);

create policy "public read poll_comments"   on poll_comments for select using (true);
create policy "public insert poll_comments" on poll_comments for insert with check (true);
