-- Row Level Security (RLS) Policies for MALATH

-- Enable RLS on all tables
alter table cases enable row level security;
alter table case_items enable row level security;
alter table case_shares enable row level security;

-- 1. Cases Policies
create policy "Users can view their own cases"
    on cases for select
    using (auth.uid() = user_id);

create policy "Users can insert their own cases"
    on cases for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own cases"
    on cases for update
    using (auth.uid() = user_id);

create policy "Users can delete their own cases"
    on cases for delete
    using (auth.uid() = user_id);

-- 2. Case Items Policies (Evidence, Analysis, etc)
create policy "Users can view items of their cases"
    on case_items for select
    using (
        auth.uid() = user_id
        or 
        exists (
            select 1 from case_shares 
            where case_shares.case_id = case_items.case_id 
            and case_shares.shared_with_email = auth.jwt()->>'email'
            and case_shares.status = 'active'
            and (case_shares.expires_at is null or case_shares.expires_at > now())
        )
    );

create policy "Users can insert items to their own cases"
    on case_items for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own case items"
    on case_items for delete
    using (auth.uid() = user_id);

-- 3. Case Shares Policies
create policy "Users can manage their own shares"
    on case_shares for all
    using (auth.uid() = owner_id);

create policy "Shared users can view their active shares"
    on case_shares for select
    using (
        shared_with_email = auth.jwt()->>'email'
        and status = 'active'
        and (expires_at is null or expires_at > now())
    );

-- 4. Storage Bucket Policies (Assumes bucket named 'evidence')
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', false) on conflict do nothing;

create policy "Users can view their own evidence files"
    on storage.objects for select
    using (
        bucket_id = 'evidence'
        and (auth.uid() = owner)
    );

create policy "Users can upload evidence files"
    on storage.objects for insert
    with check (
        bucket_id = 'evidence'
        and auth.uid() = owner
    );

create policy "Users can delete their own evidence"
    on storage.objects for delete
    using (
        bucket_id = 'evidence'
        and auth.uid() = owner
    );
