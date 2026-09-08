-- Contexto de liga: lo que hace falta para nombrar el nivel y escribir el
-- mensaje de la semana.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- QUÉ AÑADE, Y QUÉ NO
--
-- AÑADE tres datos que `liga_tablero` no devuelve y que la interfaz necesita
-- para decidir qué decir:
--
--   total_ligas         cuántos niveles hay activos ESTE ciclo en la materia.
--   ciclos_con_niveles  cuántos ciclos van ya con más de un nivel. Es lo que
--                       distingue la semana de estreno de la primera
--                       reordenación y de todas las demás, SIN una bandera que
--                       alguien tenga que acordarse de encender: la condición
--                       es el dato.
--   liga_anterior       en qué nivel estaba quien pregunta el ciclo pasado.
--                       Solo para reconocer un ascenso. Null si no estaba.
--
-- NO TOCA `ligas_sembrar` NI `ligas_para`. El reparto en niveles, sus umbrales
-- y el ascenso/descenso siguen exactamente como los dejó la 0006. Esta
-- migración solo LEE.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- POR QUÉ UNA FUNCIÓN NUEVA Y NO TRES COLUMNAS MÁS EN `liga_tablero`
--
-- Dos razones, y la segunda es la que decide:
--
--   1. `liga_tablero` devuelve una fila POR ESTUDIANTE del podio. Estos tres
--      datos son de la materia y de quien pregunta, uno solo de cada: irían
--      repetidos en cada fila, y con el podio vacío no llegarían nunca.
--
--   2. Ampliar el `returns table` de una función existente obliga a
--      `drop` + `create`, porque `create or replace` no puede cambiar el tipo
--      de retorno. Y un `drop` SE LLEVA LOS GRANTS: la función renacería
--      ejecutable por `public`, que en Supabase incluye a `anon`. Es la trampa
--      que ya está documentada en la 0024. Con una función nueva no hay nada
--      que perder ni que reemitir.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- NOTA SOBRE UN COMENTARIO DE LA 0006 QUE QUEDA VIEJO
--
-- La 0006 dice que la interfaz muestra las ligas como "Grupo 1, 2, 3" sin
-- decir cuál es mejor. Eso deja de ser cierto: a partir de ahora los niveles se
-- llaman Emergente, Intermedio, Avanzado y Élite, de abajo arriba, y sí dicen
-- cuál es cuál. La decisión y sus razones viven en src/ligas/niveles.js.
--
-- El comentario de la 0006 no se edita: es una migración ya aplicada y
-- reescribir su archivo haría que lo que dice el repositorio y lo que se corrió
-- dejaran de ser lo mismo. Se corrige aquí, que es donde el lector va a llegar.
--
-- Idempotente.
-- ---------------------------------------------------------------------------

create or replace function public.liga_contexto(p_subject text)
returns table (
  total_ligas        integer,
  ciclos_con_niveles integer,
  liga_anterior      integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid   uuid := auth.uid();
  v_ciclo date := public.ciclo_actual();
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para ver tu liga' using errcode = '42501';
  end if;

  /*
   * ═══════════ TODAS LAS REFERENCIAS CUALIFICADAS, A PROPÓSITO ═══════════
   *
   * En plpgsql las columnas del `returns table` son parámetros de salida, o
   * sea variables en ámbito. Una columna sin cualificar que se llame igual que
   * una de ellas no es un error de sintaxis: `create function` la acepta, la
   * migración dice "Success", y revienta con 42702 la primera vez que alguien
   * la ejecuta. Es exactamente lo que pasó con `panel_actividad`.
   *
   * Aquí ninguna columna de `liga_membresia` se llama como una de las tres
   * salidas, así que hoy no habría choque igualmente. Se cualifica de todos
   * modos: el día que alguien añada una columna `liga_anterior` a una tabla,
   * la costumbre ya está puesta.
   */
  return query
  with por_ciclo as (
    select m.ciclo as c, max(m.liga) as niveles
      from public.liga_membresia m
     where m.subject_id = p_subject
     group by m.ciclo
  )
  select
    /*
     * Cuántos niveles hay ahora. Cero si nadie ha entrado todavía este ciclo;
     * quien llama lo trata igual que uno —sin nombre— porque un nivel y
     * ninguno se ven igual desde fuera.
     */
    coalesce((select pc.niveles from por_ciclo pc where pc.c = v_ciclo), 0)::integer,
    /*
     * Los ciclos que ya han tenido más de un nivel, este incluido. 1 = esta es
     * la semana de estreno. 2 = esta es la primera reordenación, el día ocho.
     */
    (select count(*) from por_ciclo pc where pc.niveles > 1 and pc.c <= v_ciclo)::integer,
    /*
     * El nivel propio del ciclo anterior. Se busca el más reciente ANTERIOR a
     * este y no "el de hace exactamente siete días": quien se saltó una semana
     * sin ganar FP no tiene fila la semana pasada, y comparar contra un hueco
     * daría null donde sí hay historia.
     */
    (select m2.liga
       from public.liga_membresia m2
      where m2.subject_id = p_subject
        and m2.user_id = v_uid
        and m2.ciclo < v_ciclo
      order by m2.ciclo desc
      limit 1)::integer;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permisos
--
-- Obligatorio aunque la función sea nueva: toda función nace ejecutable por
-- `public`, y en Supabase `public` incluye a `anon`. Sin el revoke, la forma de
-- las ligas de una materia quedaría al alcance de la clave anónima.
-- ---------------------------------------------------------------------------
revoke all on function public.liga_contexto(text) from public, anon;
grant execute on function public.liga_contexto(text) to authenticated;
