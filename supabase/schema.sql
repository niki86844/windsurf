-- Table des baux (contrats de location)
create table if not exists leases (
  id bigint primary key generated always as identity,
  property_id bigint references properties(id) not null,
  tenant_id bigint references tenants(id) not null,
  loyer numeric not null,
  date_debut date not null,
  frequence text default 'Mensuel' not null,
  payment_gateway text,
  gateway_customer_id text,
  gateway_price_id text,
  mandate_url text,
  owner_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS : chaque row appartient à l'utilisateur connecté
alter table leases enable row level security;
drop policy if exists "OwnerOnly" on leases;
create policy "OwnerOnly" on leases
  for all using (auth.uid() = owner_id);

-- Table documents pour quittances
create table if not exists documents (
  id bigint primary key generated always as identity,
  lease_id bigint references leases(id),
  url text,
  filename text,
  created_at timestamp with time zone default now()
);
