-- Initial Schema for MALATH

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enum types
create type risk_level as enum ('low', 'medium', 'high', 'critical');
create type confidence_level as enum ('low', 'medium', 'high');
create type case_status as enum ('open', 'closed', 'archived');
create type item_type as enum ('evidence', 'analysis', 'url_scan', 'note');

-- 1. Cases Table
create table cases (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    category text,
    risk_level risk_level,
    status case_status default 'open',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Case Items (Polymorphic content for timeline)
create table case_items (
    id uuid default uuid_generate_v4() primary key,
    case_id uuid not null references cases(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    type item_type not null,
    content jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Trusted Shares
create table case_shares (
    id uuid default uuid_generate_v4() primary key,
    case_id uuid not null references cases(id) on delete cascade,
    owner_id uuid not null references auth.users(id) on delete cascade,
    shared_with_email text not null,
    permissions jsonb not null default '{"view_summary": true, "view_evidence": false}'::jsonb,
    status text not null default 'active',
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    revoked_at timestamp with time zone
);

-- Indexes for performance
create index idx_cases_user_id on cases(user_id);
create index idx_case_items_case_id on case_items(case_id);
create index idx_case_items_user_id on case_items(user_id);
create index idx_case_shares_owner_id on case_shares(owner_id);
create index idx_case_shares_case_id on case_shares(case_id);

-- Update trigger for cases
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_cases_updated_at
    before update on cases
    for each row
    execute function update_updated_at_column();
