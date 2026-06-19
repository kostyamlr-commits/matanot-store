-- הרץ את זה ב-Supabase SQL Editor

create table if not exists products (
  id          text primary key,
  title       text not null,
  price_ils   numeric(10,2),
  original_price_ils numeric(10,2),
  rating      numeric(3,1),
  orders      integer default 0,
  image       text,
  affiliate_url text,
  category    text,
  active      boolean default true,
  created_at  timestamptz default now(),
  last_checked timestamptz default now(),
  removed_at  timestamptz
);

-- אינדקסים לביצועים
create index if not exists idx_products_active on products(active);
create index if not exists idx_products_orders on products(orders desc);

-- Row Level Security
alter table products enable row level security;

-- כולם יכולים לקרוא מוצרים פעילים
create policy "products are publicly readable"
  on products for select
  using (active = true);
