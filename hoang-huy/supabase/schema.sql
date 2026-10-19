-- Run in Supabase SQL Editor. Safe to rerun; existing products are preserved.
begin;
create table if not exists public.products (
 id text primary key, name text not null check (length(trim(name)) > 0),
 category text not null, price bigint not null check (price >= 0 and price <= 9007199254740991),
 unit text not null, detail text not null default '', tag text not null default '', image text not null default ''
);
create table if not exists public.orders (
 id uuid primary key, name text not null, phone text not null, address text not null,
 note text not null default '', items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30),
 total bigint not null check (total >= 0),
 status text not null default 'Chờ xác nhận' check (status in ('Chờ xác nhận','Đang chuẩn bị','Đang giao','Hoàn tất','Hủy')),
 "adminNote" text not null default '', "createdAt" timestamptz not null default now(), "updatedAt" timestamptz
);
create index if not exists orders_created_at_idx on public.orders ("createdAt" desc);
alter table public.products enable row level security;
alter table public.orders enable row level security;
revoke all on public.products, public.orders from anon, authenticated;
grant select, insert, update, delete on public.products, public.orders to service_role;
insert into public.products (id,name,category,price,unit,detail,tag,image) values
('tom-su','Tôm sú','Tôm',320000,'kg','Thịt chắc, ngọt · 20–30 con/kg','ĐƯỢC YÊU THÍCH','https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=85'),
('cua-bien','Cua biển','Cua & ghẹ',450000,'kg','Đậm vị biển · 3–4 con/kg','LỰA CHỌN HÔM NAY','https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=900&q=85'),
('ca-hoi','Phi lê cá hồi','Cá',520000,'kg','Béo mềm · Phù hợp áp chảo','DỄ CHẾ BIẾN','https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=900&q=85'),
('muc-ong','Mực ống','Mực & bạch tuộc',280000,'kg','Giòn ngọt · 6–8 con/kg','VỊ BIỂN TỰ NHIÊN','https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=85'),
('so-diep','Sò điệp','Ốc & sò',220000,'kg','Ngọt thanh · Nướng mỡ hành','CHO BỮA TIỆC','https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=85'),
('tom-hum','Tôm hùm','Tôm',1250000,'kg','Thịt thơm, chắc · 400–600 g/con','ĐẶC BIỆT','https://images.unsplash.com/photo-1553247407-23251ce81f59?auto=format&fit=crop&w=900&q=85')
on conflict (id) do nothing;
commit;
