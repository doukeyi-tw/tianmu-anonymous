create table if not exists admins (
  id bigserial primary key,
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);
create table if not exists posts (
  id bigserial primary key,
  title varchar(120) not null,
  content varchar(200) not null,
  image_url text,
  image_path text,
  image_content_type varchar(64),
  status varchar(20) not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_created_idx on posts (status, created_at desc);
create index if not exists posts_created_idx on posts (created_at desc);
alter table posts add column if not exists client_ip varchar(64);
alter table posts add column if not exists client_user_agent varchar(512);
create index if not exists posts_client_ip_idx on posts (client_ip);
create table if not exists post_status_history (
  id bigserial primary key,
  post_id bigint not null references posts(id) on delete cascade,
  from_status varchar(20),
  to_status varchar(20) not null,
  admin_id bigint references admins(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists post_status_history_post_idx on post_status_history (post_id, created_at desc);
create table if not exists settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now());
insert into settings (key, value) values ('isPostEnabled', 'true'::jsonb) on conflict (key) do nothing;
create table if not exists audit_logs (id bigserial primary key, admin_id bigint references admins(id) on delete set null, type varchar(20) not null default 'INFO', action text not null, target_id bigint, created_at timestamptz not null default now());
create index if not exists audit_logs_created_idx on audit_logs (created_at desc);
alter table audit_logs add column if not exists request_ip varchar(64);
alter table audit_logs add column if not exists request_user_agent varchar(512);
