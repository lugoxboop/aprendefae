-- ═══════════════════════════════════════════════════════════════════════════
-- LIMPIEZA PREVIA A LA 0028 — un ítem por partida en fp_detalle.
--
-- Qué son: dos pares de diagnostico-en-vivo (t3a y t6b) en los que el mismo
-- titular se cerró DOS VECES en la misma partida. La primera fila es el cierre
-- de verdad (ok:false, intentos:2); la segunda, un toque fantasma que llegó
-- en los 260 ms en que el titular ya cerrado seguía en pantalla (ok:true,
-- intentos:1 — los dos campos falsos).
--
-- CRITERIO: se conserva la PRIMERA aparición — menor `orden`, y a igualdad,
-- menor `id`—. Es el mismo que aplica la 0028 dentro de registrar_fp.
--
-- fp_history NO se toca. El porcentaje de esas partidas lo calculó el cliente
-- con el fallo dentro, y así queda: los puntos ya se dieron y no se reescriben.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- 1. Lo que se va a borrar. Tienen que salir exactamente 2 filas: las segundas
--    apariciones de t3a y de t6b.
select d.id, d.fp_history_id, d.activity_id, d.item_id, d.acerto, d.intentos, d.respuesta, d.orden
  from public.fp_detalle d
  join (
    select x.id,
           row_number() over (partition by x.fp_history_id, x.item_id order by x.orden nulls last, x.id) as vez
      from public.fp_detalle x
  ) r on r.id = d.id
 where r.vez > 1
 order by d.fp_history_id, d.item_id;

-- 2. El borrado, con guarda: si no son exactamente 2, se aborta y no se toca nada.
do $limpieza$
declare v_borradas integer;
begin
  delete from public.fp_detalle d
   using (
     select x.id,
            row_number() over (partition by x.fp_history_id, x.item_id order by x.orden nulls last, x.id) as vez
       from public.fp_detalle x
   ) r
   where r.id = d.id and r.vez > 1;
  get diagnostics v_borradas = row_count;

  if v_borradas <> 2 then
    raise exception 'Se esperaban 2 filas repetidas y salieron %: no se borra nada.', v_borradas;
  end if;
end
$limpieza$;

-- 3. Comprobación: ningún par repetido. Tiene que dar 0; entonces, la 0028.
select count(*) as pares_repetidos
  from (select 1 from public.fp_detalle group by fp_history_id, item_id having count(*) > 1) x;

commit;
