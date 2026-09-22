-- ---------------------------------------------------------------------------
-- 0041 — El Comité de NOVA: el desafío de Política Fiscal entra al catálogo.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do update`. Correrla dos
-- veces deja exactamente lo mismo que correrla una. No toca ninguna función,
-- ninguna tabla y ninguna fila de ningún estudiante.
--
-- NO DEPENDE DE LA 0040. La 0040 (asistente_uso) está en el repositorio sin
-- correr, en pausa. Esta no la necesita ni la toca: lo único que hace falta
-- para que corra es que exista actividad_catalogo con su columna `etapas`, o
-- sea, la 0011 y la 0014, que llevan aplicadas desde hace tiempo. Se puede
-- correr la 0041 con la 0040 todavía pendiente.
--
-- QUÉ REGLA APLICA, Y POR QUÉ NO HAY CÓDIGO NUEVO. El Kit dice que un nodo de
-- desafío compuesto vale su base × su número de etapas, con tope en cuatro.
-- Esa regla entró en la 0014 como COLUMNA del catálogo, precisamente para que
-- el segundo desafío fuera una fila y no un cambio de función. Este es el
-- segundo desafío, y en efecto es una fila:
--
--   experto (fp_base 90) × 4 etapas = 360 FP
--
-- El reparto entre las cuatro etapas —20 / 25 / 25 / 30— lo pondera el
-- navegador y llega aquí ya combinado en un solo porcentaje de aciertos, igual
-- que en cualquier otra actividad. El servidor solo necesita saber que son
-- cuatro etapas para fijar el techo.
--
-- SIN `guarda_progreso`, A PROPÓSITO. Esa columna (0028) la tiene solo el
-- Proyecto del Arca, y el módulo del navegador que la usa rechaza cualquier
-- otra actividad por su nombre. Darle partida guardada al Comité es una
-- decisión aparte, con su propia migración; nadie la ha pedido y este desafío
-- se juega de una sentada.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver una fila
-- con etapas = 4 y fp_base = 90.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('comite-nova', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'experto', 90, 4)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: una sola fila, y los 360 FP calculados como los calcula el servidor.
-- ---------------------------------------------------------------------------
select
  activity_id,
  subject_id,
  topic_id,
  dificultad,
  fp_base,
  etapas,
  fp_base * least(etapas, 4) as fp_maximo
from public.actividad_catalogo
where activity_id = 'comite-nova';
