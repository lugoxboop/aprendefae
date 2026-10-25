-- ---------------------------------------------------------------------------
-- DESHACER LA 0153 — una pieza de Aprender queda como hecha.
--
-- NO SE APLICA SOLA: vive fuera de supabase/migrations a propósito. Se pega a
-- mano en el editor SQL de Supabase solo si hay que volver atrás (lo pidió
-- Levi en #600: la reversión de una migración de datos de estudiantes existe
-- escrita antes de fusionar, aunque no se use).
--
-- QUÉ SE PIERDE AL CORRERLA: las filas de aprender_hecho, es decir, qué piezas
-- de Aprender vio cada estudiante. Nada más: ni FP, ni historial, ni medallas,
-- porque la 0153 no tocó nada de eso. El Repaso vuelve a contar solo lo que
-- dio FP (leerHechas() ya sigue funcionando si aprender_hechas() no existe).
--
-- Antes de borrar, la primera consulta guarda una copia de las filas por si
-- hubiera que volver a ponerlas.
-- ---------------------------------------------------------------------------

begin;

-- 1. La copia, por si acaso (se borra a mano cuando ya no haga falta).
create table if not exists public.aprender_hecho_copia_0153 as
  select * from public.aprender_hecho;

-- 2. Lo que añadió la 0153, en orden inverso.
drop function if exists public.aprender_hechas();
drop function if exists public.registrar_aprender(text, text);
drop table if exists public.aprender_hecho;

commit;

-- COMPROBACIÓN: las tres primeras columnas tienen que salir false y la última,
-- el número de filas que había (las de la copia).
select to_regclass('public.aprender_hecho') is not null                                  as queda_la_tabla,
       exists (select 1 from pg_proc where proname = 'registrar_aprender')               as queda_registrar,
       exists (select 1 from pg_proc where proname = 'aprender_hechas')                  as queda_lectura,
       (select count(*) from public.aprender_hecho_copia_0153)                           as filas_copiadas;
