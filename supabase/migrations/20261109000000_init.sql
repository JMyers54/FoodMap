-- FoodMap · esquema inicial (Supabase / PostgreSQL + PostGIS)

create extension if not exists postgis with schema extensions;

set search_path = public, extensions;

create table if not exists public.restaurante (
    id           uuid primary key default gen_random_uuid(),
    osm_id       bigint unique,

    nombre       text not null,
    tipo         text not null default 'restaurant',
    cocinas      text[] not null default '{}',

    ubicacion    geography(Point, 4326) not null,
    direccion    text,
    telefono     text,
    web          text,
    horarios     jsonb,

    fuente       text not null default 'osm',
    verificado   boolean not null default false,
    actualizado  timestamptz not null default now()
);

create index if not exists restaurante_ubicacion_idx
    on public.restaurante using gist (ubicacion);

create index if not exists restaurante_tipo_idx
    on public.restaurante (tipo);

create index if not exists restaurante_cocinas_idx
    on public.restaurante using gin (cocinas);

alter table public.restaurante enable row level security;