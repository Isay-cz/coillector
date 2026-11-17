-- Ubicación confirmada en mapa: coordenadas + referencias para usuarios y solicitudes.
-- Columnas opcionales: las solicitudes antiguas siguen siendo válidas sin coordenadas.

alter table public.users
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists referencias text;

alter table public.solicitudes
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists referencias text;

-- Ambas coordenadas o ninguna, y dentro del Valle de México (CDMX y zona conurbada).
alter table public.users drop constraint if exists users_coords_check;
alter table public.users add constraint users_coords_check check (
  (lat is null and lng is null)
  or (lat between 18.9 and 20.0 and lng between -99.6 and -98.6)
);
alter table public.users drop constraint if exists users_referencias_len;
alter table public.users add constraint users_referencias_len check (referencias is null or length(referencias) <= 140);

alter table public.solicitudes drop constraint if exists solicitudes_coords_check;
alter table public.solicitudes add constraint solicitudes_coords_check check (
  (lat is null and lng is null)
  or (lat between 18.9 and 20.0 and lng between -99.6 and -98.6)
);
alter table public.solicitudes drop constraint if exists solicitudes_referencias_len;
alter table public.solicitudes add constraint solicitudes_referencias_len check (referencias is null or length(referencias) <= 140);

-- La vista agrega las columnas nuevas al final (CREATE OR REPLACE solo permite añadir al final).
create or replace view public.solicitudes_estado with (security_invoker = true) as
 select s.id,
    s.vendedor_id,
    s.nombre_comercio,
    s.direccion,
    s.zona,
    s.litros_estimados,
    s.created_at,
        case
            when c.id is null then 'Pendiente de recolección'::text
            else 'Recolectada'::text
        end as estado_recoleccion,
    c.id as confirmacion_id,
    c.recolector_id,
    c.litros_reales,
    c.calidad_apta,
    c.estado_pago,
        case c.estado_pago
            when 'simulado_ok'::text then 'Pago simulado completado'::text
            when 'error'::text then 'Error en el pago simulado'::text
            when 'pendiente'::text then 'Pago simulado pendiente'::text
            else 'Sin pago (aún no se recolecta)'::text
        end as estado_pago_texto,
    c.importe_mxn,
    c.referencia_pago,
    c.error_pago,
    s.telefono_contacto,
    s.notas,
    c.created_at as confirmada_at,
    s.lat,
    s.lng,
    s.referencias
   from public.solicitudes s
     left join public.confirmaciones c on c.solicitud_id = s.id;
