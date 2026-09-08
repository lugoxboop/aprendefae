-- ---------------------------------------------------------------------------
-- 0022 — Los siete juegos de Demanda Agregada entran al catálogo, y el
--        simulador DA-Learn sale de él.
--
-- ADITIVA SALVO UNA FILA, Y REPETIBLE. Mete siete filas y borra una. No toca
-- funciones, ni políticas, ni columnas, NI UNA SOLA FILA DE fp_history.
-- Correrla dos veces deja lo mismo que correrla una.
--
-- ═══════════ QUÉ ENTRA ═══════════
--
--   electrocardiograma       Recordar. Ocho definiciones de un banco de
--                            dieciséis y cuatro fragmentos de la fórmula de
--                            seis. Medio, 25 FP.
--   termometro-reacciones    Comprender. Doce cambios en el banco, seis por
--                            partida. Medio, 25 FP.
--   banco-transfusiones      Aplicar. Ejemplos que se desvanecen: el cálculo
--                            del Consumo resuelto, guiado y solo.
--                            Difícil, 50 FP.
--   biopsia-economica        Analizar. Dos fuerzas opuestas y una decisión,
--                            todo o nada. Difícil, 50 FP.
--   triage-emergencias       Evaluar. Duelos por parejas: cuál va primero.
--                            Experto, 90 FP.
--   cirugia-reconstruccion   Crear. Reconstruir la cadena de un golpe, primer
--                            y segundo orden. Experto, 90 FP.
--   sala-monitores           Aplicar, intercalado. Doce alertas de
--                            veinticuatro, mezcladas. Difícil, 50 FP.
--
-- Las siete son evaluativas: se contesta una vez por ítem y el porcentaje mide
-- desempeño. La dificultad la fija el servidor y estas filas SON esa decisión;
-- el cliente declara lo mismo en src/data/subjects.js porque necesita dibujar
-- la interfaz, y catalogo.test.mjs compara los dos y falla si se separan.
--
-- ═══════════ POR QUÉ ESTA VEZ ES UN DELETE Y NO UNA LÁPIDA ═══════════
--
-- El proyecto retira en blando: la 0015 dejó dashboard-economico marcado con
-- `retirada = true` en vez de borrarlo. Aquí se hace lo contrario a propósito,
-- y conviene dejar dicho por qué la excepción no contradice la regla.
--
-- La lápida servía para dos cosas: documentar un id que pudiera aparecer en
-- filas históricas, y evitar que un cliente con caché vieja reventara al
-- llamar a la actividad. Aquí:
--
--   · Las siete filas de fp_history de simulador-da son pruebas del propio
--     Mateo, no trabajo de estudiantes. Están confirmadas como tales.
--   · Y el simulador no se retira de la interfaz: se borra del repositorio
--     entero —seis vistas, once componentes compartidos y la mitad de App—.
--     No queda cliente que pueda llamarlo, ni con caché: el hash #/dashboard
--     tampoco es ya una ruta.
--
-- Con eso, la lápida solo serviría para que registrar_fp siguiera PAGANDO por
-- una actividad que nadie puede jugar. Borrando la fila, una llamada con ese
-- id levanta "Actividad desconocida", que es la respuesta correcta.
--
-- ═══════════ LO QUE ESTO NO TOCA, Y ES DELIBERADO ═══════════
--
-- fp_history NO SE TOCA. Sus siete filas de simulador-da quedan huérfanas del
-- catálogo y son inofensivas:
--
--   · Ninguna clave foránea apunta a actividad_catalogo. Las únicas del
--     esquema van a auth.users y a fp_history. Borrar aquí no cascadea nada.
--   · Ninguna función de lectura junta con el catálogo. Se comprobó: los
--     únicos `from actividad_catalogo` del esquema están dentro de
--     registrar_fp (0011, 0014 y 0017), que lo consulta al ESCRIBIR.
--   · profiles.points es acumulativo, no recalculado, así que nadie pierde
--     puntos por esto.
--
-- Las filas de fp_detalle de esas partidas cuelgan de fp_history por
-- fp_history_id, no del catálogo, así que también se quedan donde están.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. Los siete juegos nuevos.
-- ---------------------------------------------------------------------------
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('electrocardiograma', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'medio', 25),
  ('termometro-reacciones', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'medio', 25),
  ('banco-transfusiones', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'dificil', 50),
  ('biopsia-economica', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'dificil', 50),
  ('triage-emergencias', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'experto', 90),
  ('cirugia-reconstruccion', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'experto', 90),
  ('sala-monitores', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'dificil', 50)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base;

-- ---------------------------------------------------------------------------
-- 2. El simulador sale del catálogo.
--
-- Se escribe con `in (...)` aunque hoy sea un solo id: es la forma que lee
-- catalogo.test.mjs para saber qué actividades se borraron y no marcarlas como
-- deriva del cliente. Borrar otra en el futuro es añadirla a esta lista.
-- ---------------------------------------------------------------------------
delete from public.actividad_catalogo
 where activity_id in ('simulador-da');
