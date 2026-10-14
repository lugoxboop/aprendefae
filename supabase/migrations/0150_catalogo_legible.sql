-- ---------------------------------------------------------------------------
-- 0150 — EL CATÁLOGO SE PUEDE LEER CON LA LLAVE PÚBLICA
--
-- POR QUÉ, Y QUÉ DECISIÓN REVIERTE. La 0011 dejó actividad_catalogo con RLS
-- y SIN políticas, a propósito: «solo lo leen las funciones security definer».
-- Esto cambia eso para la lectura, y solo para la lectura.
--
-- LO QUE COSTÓ NO PODER LEERLO. El 14 de octubre de 2026 había trece
-- actividades publicadas y jugables sin fila en el catálogo: las dos de la
-- 0052 y las once del bloque 0045-0051. Las siete migraciones estaban
-- escritas, correctas y en main; nunca se habían corrido. La suite comparaba
-- el cliente contra los ARCHIVOS de migración, los encontraba todos y salía
-- en verde. Un estudiante que jugara cualquiera de las trece veía su
-- porcentaje y no recibía un solo FP, y llevaba semanas así.
--
-- Nada de eso se puede cazar sin preguntarle a la base. Y con la llave
-- anónima no se podía preguntar: PostgREST respondía HTTP 200 con una lista
-- vacía —éxito con cero filas, no un error—, así que una sonda escrita encima
-- habría dicho «no falta ninguna» para siempre sin mirar nada.
--
-- QUÉ SE EXPONE: nada nuevo. Las seis columnas de esta tabla —el id, la
-- materia, el tema, la modalidad, la dificultad y los FP base— ya viajan
-- enteras dentro del paquete JavaScript que descarga cualquier visitante del
-- sitio, porque el cliente las necesita para dibujar el camino. Quien quiera
-- esos datos ya los tiene; lo único que esto añade es poder CONTARLOS desde
-- fuera para comprobar que el servidor y el cliente dicen lo mismo.
--
-- QUÉ NO SE ABRE: solo `select`. Ni insert, ni update, ni delete: sin esas
-- políticas, RLS las sigue negando a anon y a authenticated. El catálogo se
-- escribe únicamente por migración, como hasta hoy.
--
-- Decisión de Mateo, 14 de octubre de 2026, entre tres caminos: esta política,
-- una función security definer que devolviera las que faltan, o una llave
-- privilegiada en los secretos del flujo. Eligió este, que es el que no añade
-- nada que mantener ni nada que se pueda quedar con dos firmas vivas.
--
-- REPETIBLE. El `if not exists` sobre pg_policies la hace idempotente:
-- correrla dos veces no cambia nada. PostgreSQL no admite
-- `create policy if not exists`, de ahí el bloque.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver una fila
-- con la política, y una petición con la llave anónima a
-- /rest/v1/actividad_catalogo?select=activity_id&limit=1 tiene que devolver
-- una fila en vez de [].
--
-- CÓMO DESHACERLA:
--   drop policy catalogo_legible on public.actividad_catalogo;
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'actividad_catalogo'
      and policyname = 'catalogo_legible'
  ) then
    create policy catalogo_legible
      on public.actividad_catalogo
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila — catalogo_legible, SELECT, {anon,authenticated}.
-- ---------------------------------------------------------------------------
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'actividad_catalogo';
