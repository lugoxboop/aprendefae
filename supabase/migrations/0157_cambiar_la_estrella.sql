/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0157 — PODER CAMBIAR LA ESTRELLA QUE SE ACABA DE DAR
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199), como 0155 y 0156.
 *
 * ═══════════ POR QUÉ ESTO EXISTE, Y POR QUÉ NO EXISTÍA ═══════════
 *
 * En 0156 la estrella se manda al tocarla, con 900 ms de margen por si se
 * cambia de opinión, y después se queda quieta. El razonamiento escrito
 * entonces fue que 900 ms cubrían el resbalón, «que es el caso real».
 *
 * No lo cubren. Mateo se equivocó de estrella y lo notó DESPUÉS de soltar:
 * uno se da cuenta de que puso cuatro cuando ya está leyendo «Muy buena», no
 * en el primer segundo. Un control que no se puede corregir no es un margen
 * ajustado, es un control roto, y además ensucia justo el dato que la
 * función venía a recoger.
 *
 * ═══════════ POR QUÉ UNA FUNCIÓN Y NO OTRA FILA ═══════════
 *
 * Volver a insertar contaría la actividad dos veces y su media mentiría —el
 * mismo motivo por el que el comentario va con vale—. Así que se corrige LA
 * MISMA fila, con el mismo vale: un uuid al azar que el navegador generó para
 * ese envío, que no identifica a nadie y que caduca con la pantalla.
 *
 * ═══════════ EN QUÉ SE PARECE Y EN QUÉ NO A comentar_opinion ═══════════
 *
 * Se parece en los cerrojos: el vale tiene que ser el de esa fila y no puede
 * haber pasado de dos horas. Se diferencia en que NO es de un solo uso.
 * El comentario se escribe una vez porque dos textos distintos en el mismo
 * sitio es una pérdida; la puntuación se puede dudar dos veces y la última
 * es la que vale. Fuera de esas dos horas, y de ese vale, nadie toca nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

begin;

create or replace function public.recalificar_opinion(p_envio uuid, p_puntaje smallint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas integer;
begin
  if p_envio is null then
    return false;
  end if;
  if p_puntaje is null or p_puntaje < 1 or p_puntaje > 5 then
    raise exception 'La puntuación va de 1 a 5' using errcode = '22023';
  end if;

  update public.opiniones
     set puntaje = p_puntaje
   where envio = p_envio
     and creado > now() - interval '2 hours';

  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;

revoke all on function public.recalificar_opinion(uuid, smallint) from public;
grant execute on function public.recalificar_opinion(uuid, smallint) to anon, authenticated;

commit;

/*
 * ═══════════ PARA DESHACERLO ═══════════
 *
 * drop function if exists public.recalificar_opinion(uuid, smallint);
 *
 * No toca ninguna fila ni ninguna columna: solo deja de poder corregirse.
 */
