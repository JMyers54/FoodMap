-- FoodMap · fuentes y moderación (F1-12)

create extension if not exists pg_trgm with schema extensions;

set search_path = public, extensions;

alter table public.restaurante
    add column if not exists estado text not null default 'aprobado',
    add column if not exists creado_por uuid,
    add column if not exists revisado_por uuid,
    add column if not exists revisado_en timestamptz,
    add column if not exists motivo_rechazo text;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'restaurante_estado_check') then
        alter table public.restaurante
            add constraint restaurante_estado_check
            check (estado in ('pendiente', 'aprobado', 'rechazado'));
    end if;
end $$;

create index if not exists restaurante_estado_idx
    on public.restaurante (estado);

create index if not exists restaurante_nombre_trgm_idx
    on public.restaurante using gin (nombre extensions.gin_trgm_ops);

create table if not exists public.restaurante_fuente (
    id uuid primary key default gen_random_uuid(),
    restaurante_id uuid not null references public.restaurante (id) on delete cascade,
    fuente text not null,
    id_externo text not null,
    confianza numeric(3,2) not null default 1.00,
    datos_crudos jsonb not null default '{}'::jsonb,
    actualizado timestamptz not null default now(),

    constraint restaurante_fuente_fuente_check
        check (fuente in ('osm', 'overture', 'foursquare', 'usuario')),
    constraint restaurante_fuente_confianza_check
        check (confianza >= 0 and confianza <= 1),
    constraint restaurante_fuente_unica unique (fuente, id_externo)
);

create index if not exists restaurante_fuente_restaurante_idx
    on public.restaurante_fuente (restaurante_id);

create index if not exists restaurante_fuente_crudos_idx
    on public.restaurante_fuente using gin (datos_crudos);

alter table public.restaurante_fuente enable row level security;

-- Backfill: cada restaurante sembrado queda con su origen OSM registrado.
insert into public.restaurante_fuente
    (restaurante_id, fuente, id_externo, confianza, datos_crudos)
select id, fuente, osm_id::text, 1.00,
       jsonb_build_object('nombre', nombre, 'tipo', tipo)
from public.restaurante
where osm_id is not null
on conflict (fuente, id_externo) do nothing;
