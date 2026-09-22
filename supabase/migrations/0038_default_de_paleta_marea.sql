-- ═══════════════════════════════════════════════════════════════════════════
-- 0038 — LA PALETA POR DEFECTO PASA A SER 'marea'
--
-- Decisión de Xeno: la combinación por defecto deja de ser
-- Decaedro / Nocturno / Nivel I y pasa a Decaedro / Marea / Nivel I, porque
-- la vieja no se veía sobre el fondo navy del sitio.
--
-- ═══════════ POR QUÉ ESTO ES UNA MIGRACIÓN NUEVA Y NO UNA EDICIÓN DE LA 0035 ═══════════
--
-- El plan era editar la 0035 en el sitio, porque «todavía no se ha corrido en
-- ningún lado». Cuando se fue a hacer, ya se había corrido en producción: se
-- comprobó contra el servidor y la columna existe con default 'nocturno' y
-- todas las filas en 'nocturno'.
--
-- A partir de ahí, editar la 0035 habría dejado DOS VERDADES: producción con
-- 'nocturno' —porque `add column if not exists` no vuelve a tocar una columna
-- que ya está, así que re-correrla no cambiaría nada— y CI construyendo desde
-- cero una base con 'marea'. Las dos verdes, las dos distintas. Es exactamente
-- la forma de fallo que este proyecto ya pagó tres veces.
--
-- Una migración nueva deja la 0035 como el registro de lo que de verdad se
-- aplicó, y hace el cambio donde se puede verificar.
--
-- ═══════════ EL RELLENO, Y POR QUÉ ES SEGURO ═══════════
--
-- Se mueve a 'marea' solo a quien esté EXACTAMENTE en la combinación vieja
-- completa (decaedro + nocturno + nivel 1). Quien haya elegido cualquier otra
-- cosa no se toca.
--
-- Y coincidir con la combinación vieja no es ambiguo, por un motivo concreto:
-- hasta que la 0035 se aplicó, avatar_elegir() NO EXISTÍA en producción
-- —devolvía 404 PGRST202 a todo el mundo, que es el bug que destapó todo esto—
-- así que ningún estudiante pudo elegir nunca ninguna combinación. Todas las
-- filas están en el default porque nacieron ahí, no porque alguien lo quisiera.
--
-- LA SALVEDAD, DICHA EN VOZ ALTA: desde que la 0035 se aplicó, elegir ya
-- funciona. Si entre ese momento y el de correr esta migración algún estudiante
-- eligiera a propósito Decaedro + Nocturno + Nivel I, esto se lo cambiaría a
-- Marea. No hay forma de distinguirlo: profiles no guarda cuándo se editó el
-- avatar. La ventana es de horas y nadie tiene Cristales todavía, así que el
-- riesgo es mínimo — pero es real, y por eso se escribe aquí en vez de
-- presentarlo como imposible.
--
-- Va DESPUÉS de la 0037. Idempotente: correrla dos veces deja lo mismo, porque
-- la segunda vez ya no queda ninguna fila en la combinación vieja.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. El default de la columna ─────────────────────────────────────────────
alter table public.profiles
  alter column avatar_palette set default 'marea';

comment on column public.profiles.avatar_palette is
'Paleta del avatar (0035; default cambiado a ''marea'' en la 0038). NUNCA vale ''comparacion'': esa es la gris interna de las miniaturas de forma del selector, y el check de la 0035 la deja fuera de la tabla a propósito.';

-- ── 2. Quien nació en la combinación vieja, al nuevo default ────────────────
update public.profiles
   set avatar_palette = 'marea'
 where avatar_shape   = 'decaedro'
   and avatar_palette = 'nocturno'
   and avatar_level   = 1;

-- ── 3. Qué pasó, para leerlo en el editor de Supabase ──────────────────────
do $$
declare
  v_default text;
  v_viejos  integer;
  v_marea   integer;
begin
  select column_default into v_default
    from information_schema.columns
   where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_palette';

  select count(*) into v_viejos from public.profiles
   where avatar_shape = 'decaedro' and avatar_palette = 'nocturno' and avatar_level = 1;

  select count(*) into v_marea from public.profiles where avatar_palette = 'marea';

  raise notice '0038 — default de avatar_palette: %', coalesce(v_default, '(ninguno)');
  raise notice '0038 — filas que quedan en la combinación vieja: %  (tiene que ser 0)', v_viejos;
  raise notice '0038 — filas en marea: %', v_marea;

  if v_viejos <> 0 then
    raise exception '0038: quedaron % filas en decaedro/nocturno/1 — el relleno no hizo su trabajo', v_viejos;
  end if;
end $$;

select
  (select column_default from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_palette') as default_de_paleta,
  (select count(*) from public.profiles
    where avatar_shape = 'decaedro' and avatar_palette = 'nocturno' and avatar_level = 1) as quedan_en_la_vieja,
  (select count(*) from public.profiles where avatar_palette = 'marea') as filas_en_marea,
  'PASA' as resultado;
