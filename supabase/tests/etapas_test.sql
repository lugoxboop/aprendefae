-- ---------------------------------------------------------------------------
-- Prueba de la regla de desafíos de varias etapas (migración 0014), contra la
-- función REALMENTE desplegada.
--
-- POR QUÉ EXISTE. La 0014 hace dos cosas que no se ven mirando el archivo:
-- añade una columna a una tabla que ya tenía filas, y reemplaza registrar_fp
-- por una versión derivada. Lo primero puede dejar filas viejas con un valor
-- que no esperábamos; lo segundo, si la derivación hubiera salido mal, cambiaría
-- en silencio cómo pagan TODAS las actividades, no solo el desafío. Los dos
-- riesgos se comprueban aquí, y el segundo es el que de verdad importa.
--
-- QUIÉN ES QUIÉN. Solo se cambia a `authenticated` para llamar a registrar_fp,
-- que es lo único que necesita sesión porque usa auth.uid(). Todo lo demás
-- —crear el usuario, sembrar filas de catálogo inventadas, anotar resultados—
-- se hace como dueño. Así las tablas temporales nunca se tocan desde otro rol y
-- no hace falta ni un grant, que fue lo que rompió racha_test la primera vez.
--
-- No toca a nadie real: usuario propio, actividades inventadas con prefijo zzz,
-- y ROLLBACK al final. La única actividad real que se usa es 'proyecto-arca',
-- y su fila del catálogo no se modifica: solo se lee.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-etapas@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(uid) select id from auth.users where email = 'zzz-etapas@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzetapasprueba' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- Filas de catálogo inventadas. Se meten como dueño; RLS forzado no le aplica
-- al rol postgres del editor SQL porque tiene BYPASSRLS.
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('zzz-desafio-parcial', 'zzz-materia', 'zzz-tema', 'evaluativa', 'experto', 90, 4),
  ('zzz-desafio-piso',    'zzz-materia', 'zzz-tema', 'evaluativa', 'experto', 90, 4),
  ('zzz-desafio-rapido',  'zzz-materia', 'zzz-tema', 'evaluativa', 'experto', 90, 4),
  ('zzz-desafio-nueve',   'zzz-materia', 'zzz-tema', 'evaluativa', 'experto', 90, 9);

-- Esta se inserta SIN la columna, a propósito: comprueba el valor por defecto.
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('zzz-normal-sin-etapas', 'zzz-materia', 'zzz-tema', 'evaluativa', 'dificil', 50);

-- ── 1. La columna existe y su defecto es 1 ─────────────────────────────────
insert into res select 1, 'una fila sin etapas declaradas vale 1', '1',
  (select etapas::text from public.actividad_catalogo where activity_id = 'zzz-normal-sin-etapas'),
  (select etapas = 1 from public.actividad_catalogo where activity_id = 'zzz-normal-sin-etapas');

-- ── 2. Ninguna actividad vieja quedó con etapas raras ──────────────────────
-- La columna se añadió a una tabla que ya tenía filas. Si el default no hubiera
-- aplicado, alguna actividad de siempre pagaría de más sin que nadie lo note.
--
-- Se excluyen las filas zzz que siembra esta misma prueba: sin ese filtro el
-- chequeo se contaba a sí mismo y fallaba siempre.
--
-- Y se excluyen los desafíos, que son los únicos que declaran más de una etapa
-- a propósito. La lista es explícita y no un `etapas > 1` cualquiera: así,
-- cuando alguien le ponga etapas a una actividad normal por error, esto lo
-- caza igual que el día que se escribió. El desafío nuevo que llegue hay que
-- añadirlo aquí a mano, que es exactamente la fricción que se busca.
insert into res select 2, 'las actividades reales que no son desafío siguen en 1 etapa', '0 con etapas>1',
  (select count(*)::text || ' con etapas>1'
     from public.actividad_catalogo
    where etapas > 1 and activity_id not in ('proyecto-arca', 'comite-nova', 'ciclo-completo', 'da26-h2-arma-formula', 'da26-h6-meta', 'pe26-h2-grupo-logico', 'pf26-h3-factura', 'pm26-h2-cascada-meta', 'gp26-fun-h04-puente', 'gp26-fun-h05-portafolio', 'gp26-fun-h08-calendario', 'gp26-fun-h11-caso-puente', 'gp26-fun-h12-balanzas', 'gp26-fun-h15-control', 'gp26-fun-c03-h01-orquesta', 'gp26-fun-c03-h03-taburete', 'gp26-fun-c03-h05-moneda', 'gp26-fun-c03-h06-comandas', 'gp26-fun-c03-h07-mosaico', 'gp26-ini-c04-h01-acta', 'gp26-ini-c04-h02-expositor', 'gp26-pla-c04-h03-portaplanos', 'gp26-eje-c04-h05-bitacora', 'gp26-eje-c04-h06-recetario', 'gp26-moc-c04-h07-camara', 'gp26-moc-c04-h08-turnero', 'gp26-cie-c04-h09-breakers', 'gp26-cie-c04-h10-beneficiadero', 'gp26-pla-c05-h05-urna', 'gp26-pla-c05-h06-alacena', 'gp26-pla-c05-h08-mapa', 'gp26-pla-c05-h09-movil', 'gp26-pla-c05-h10-caja-fuerte', 'gp26-moc-c05-h11-embarque', 'gp26-pla-c06-h01-semaforo', 'gp26-pla-c06-h02-linterna', 'gp26-pla-c06-h03-rompecabezas', 'gp26-pla-c06-h05-sumadora', 'gp26-pla-c06-h06-alcancias', 'gp26-pla-c06-h07-metro', 'gp26-pla-c06-h09-relevos', 'gp26-pla-c06-h10-bloques', 'gp26-moc-c06-h11-rotafolio', 'gp26-pla-c07-h01-plan-costos', 'gp26-pla-c07-h03-tres-valores', 'gp26-pla-c07-h04-embudo', 'gp26-pla-c07-h05-reservas', 'gp26-pla-c07-h06-polea', 'gp26-pla-c07-h07-curva-s', 'gp26-moc-c07-h09-termometros', 'gp26-moc-c07-h10-telescopio', 'gp26-pla-c08-h01-gondola', 'gp26-pla-c08-h02-cubetas', 'gp26-pla-c08-h03-ascensor', 'gp26-pla-c08-h04-plano', 'gp26-eje-c08-h05-casilleros', 'gp26-eje-c08-h06-espina', 'gp26-moc-c08-h07-hoja', 'gp26-moc-c08-h08-monitor', 'gp26-eje-c08-h11-cadena', 'gp26-moc-c08-h12-despacho', 'gp26-pla-c09-h01-puertas', 'gp26-pla-c09-h02-gafete', 'gp26-pla-c09-h03-raci', 'gp26-pla-c09-h04-pendon', 'gp26-pla-c09-h05-sumadora', 'gp26-pla-c09-h06-rama', 'gp26-eje-c09-h07-catacion', 'gp26-eje-c09-h08-torre', 'gp26-eje-c09-h09-consola', 'gp26-eje-c09-h10-microfonos', 'gp26-moc-c09-h11-estibas', 'gp26-eje-c10-h01-casillero', 'gp26-eje-c10-h03-radios', 'gp26-pla-c10-h04-playa', 'gp26-pla-c10-h08-tablero', 'gp26-moc-c10-h10-ecosonda', 'gp26-pla-c11-h01-fichero', 'gp26-pla-c11-h02-movil', 'gp26-pla-c11-h04-muro', 'gp26-pla-c11-h05-cata', 'gp26-pla-c11-h06-burbujas', 'gp26-pla-c11-h07-montana', 'gp26-pla-c11-h08-galton', 'gp26-pla-c11-h10-espejo', 'gp26-pla-c11-h11-libro', 'gp26-pla-c12-h01-hacer-comprar', 'gp26-pla-c12-h02-contratos', 'gp26-pla-c12-h03-sobrecosto', 'gp26-pla-c12-h05-sow', 'gp26-eje-c12-h07-puntajes', 'gp26-moc-c12-h10-controlar', 'gp26-moc-c12-h11-cierre', 'gp26-pla-c12-h12-taller', 'gp26-ini-c13-h01-identificar', 'gp26-ini-c13-h03-registro', 'gp26-ini-c13-h04-poder-interes', 'gp26-ini-c13-h06-prominencia', 'gp26-pla-c13-h07-matriz-evaluacion', 'gp26-moc-c13-h10-monitorear', 'gp26-moc-c13-h11-taller') and activity_id not like 'zzz-%'),
  (select count(*) = 0 from public.actividad_catalogo
    where etapas > 1 and activity_id not in ('proyecto-arca', 'comite-nova', 'ciclo-completo', 'da26-h2-arma-formula', 'da26-h6-meta', 'pe26-h2-grupo-logico', 'pf26-h3-factura', 'pm26-h2-cascada-meta', 'gp26-fun-h04-puente', 'gp26-fun-h05-portafolio', 'gp26-fun-h08-calendario', 'gp26-fun-h11-caso-puente', 'gp26-fun-h12-balanzas', 'gp26-fun-h15-control', 'gp26-fun-c03-h01-orquesta', 'gp26-fun-c03-h03-taburete', 'gp26-fun-c03-h05-moneda', 'gp26-fun-c03-h06-comandas', 'gp26-fun-c03-h07-mosaico', 'gp26-ini-c04-h01-acta', 'gp26-ini-c04-h02-expositor', 'gp26-pla-c04-h03-portaplanos', 'gp26-eje-c04-h05-bitacora', 'gp26-eje-c04-h06-recetario', 'gp26-moc-c04-h07-camara', 'gp26-moc-c04-h08-turnero', 'gp26-cie-c04-h09-breakers', 'gp26-cie-c04-h10-beneficiadero', 'gp26-pla-c05-h05-urna', 'gp26-pla-c05-h06-alacena', 'gp26-pla-c05-h08-mapa', 'gp26-pla-c05-h09-movil', 'gp26-pla-c05-h10-caja-fuerte', 'gp26-moc-c05-h11-embarque', 'gp26-pla-c06-h01-semaforo', 'gp26-pla-c06-h02-linterna', 'gp26-pla-c06-h03-rompecabezas', 'gp26-pla-c06-h05-sumadora', 'gp26-pla-c06-h06-alcancias', 'gp26-pla-c06-h07-metro', 'gp26-pla-c06-h09-relevos', 'gp26-pla-c06-h10-bloques', 'gp26-moc-c06-h11-rotafolio', 'gp26-pla-c07-h01-plan-costos', 'gp26-pla-c07-h03-tres-valores', 'gp26-pla-c07-h04-embudo', 'gp26-pla-c07-h05-reservas', 'gp26-pla-c07-h06-polea', 'gp26-pla-c07-h07-curva-s', 'gp26-moc-c07-h09-termometros', 'gp26-moc-c07-h10-telescopio', 'gp26-pla-c08-h01-gondola', 'gp26-pla-c08-h02-cubetas', 'gp26-pla-c08-h03-ascensor', 'gp26-pla-c08-h04-plano', 'gp26-eje-c08-h05-casilleros', 'gp26-eje-c08-h06-espina', 'gp26-moc-c08-h07-hoja', 'gp26-moc-c08-h08-monitor', 'gp26-eje-c08-h11-cadena', 'gp26-moc-c08-h12-despacho', 'gp26-pla-c09-h01-puertas', 'gp26-pla-c09-h02-gafete', 'gp26-pla-c09-h03-raci', 'gp26-pla-c09-h04-pendon', 'gp26-pla-c09-h05-sumadora', 'gp26-pla-c09-h06-rama', 'gp26-eje-c09-h07-catacion', 'gp26-eje-c09-h08-torre', 'gp26-eje-c09-h09-consola', 'gp26-eje-c09-h10-microfonos', 'gp26-moc-c09-h11-estibas', 'gp26-eje-c10-h01-casillero', 'gp26-eje-c10-h03-radios', 'gp26-pla-c10-h04-playa', 'gp26-pla-c10-h08-tablero', 'gp26-moc-c10-h10-ecosonda', 'gp26-pla-c11-h01-fichero', 'gp26-pla-c11-h02-movil', 'gp26-pla-c11-h04-muro', 'gp26-pla-c11-h05-cata', 'gp26-pla-c11-h06-burbujas', 'gp26-pla-c11-h07-montana', 'gp26-pla-c11-h08-galton', 'gp26-pla-c11-h10-espejo', 'gp26-pla-c11-h11-libro', 'gp26-pla-c12-h01-hacer-comprar', 'gp26-pla-c12-h02-contratos', 'gp26-pla-c12-h03-sobrecosto', 'gp26-pla-c12-h05-sow', 'gp26-eje-c12-h07-puntajes', 'gp26-moc-c12-h10-controlar', 'gp26-moc-c12-h11-cierre', 'gp26-pla-c12-h12-taller', 'gp26-ini-c13-h01-identificar', 'gp26-ini-c13-h03-registro', 'gp26-ini-c13-h04-poder-interes', 'gp26-ini-c13-h06-prominencia', 'gp26-pla-c13-h07-matriz-evaluacion', 'gp26-moc-c13-h10-monitorear', 'gp26-moc-c13-h11-taller') and activity_id not like 'zzz-%');

-- ── 13. Y los tres desafíos declaran sus cuatro etapas ─────────────────────
-- El complemento del chequeo de arriba: excluirlos de la cuenta no puede
-- significar dejar de mirarlos.
insert into res select 13, 'los tres desafíos declaran 4 etapas y base 90', '3 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where activity_id in ('proyecto-arca', 'comite-nova', 'ciclo-completo') and etapas = 4 and fp_base = 90),
  (select count(*) = 3 from public.actividad_catalogo
    where activity_id in ('proyecto-arca', 'comite-nova', 'ciclo-completo') and etapas = 4 and fp_base = 90);

-- ── 14. Macro 2026: las dos Hacer por etapas de Demanda agregada ──────────
-- «Arma la fórmula» y «Lleva la economía a la meta» son Medio (25) × 3 etapas
-- por diseño de Gen (macro-2026/disenos/t1-demanda-agregada.md). Se excluyen
-- de la cuenta del chequeo 2 y se miran aquí, igual que los desafíos.
insert into res select 14, 'las dos Hacer por etapas de Macro 2026 declaran 3 etapas y base 25', '2 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where activity_id in ('da26-h2-arma-formula', 'da26-h6-meta') and etapas = 3 and fp_base = 25),
  (select count(*) = 2 from public.actividad_catalogo
    where activity_id in ('da26-h2-arma-formula', 'da26-h6-meta') and etapas = 3 and fp_base = 25);

-- ── 15. Macro 2026: la Hacer por etapas de Política económica ─────────────
-- «Arma el grupo lógico» es Difícil (50) × 3 etapas (3 grupos lógicos) por
-- diseño de Gen (macro-2026/disenos/t2-politica-economica.md). Se excluye de
-- la cuenta del chequeo 2 y se mira aquí, igual que las de Demanda agregada.
insert into res select 15, 'la Hacer por etapas de Política económica declara 3 etapas y base 50', '1 fila',
  (select count(*)::text || ' fila'
     from public.actividad_catalogo
    where activity_id = 'pe26-h2-grupo-logico' and etapas = 3 and fp_base = 50),
  (select count(*) = 1 from public.actividad_catalogo
    where activity_id = 'pe26-h2-grupo-logico' and etapas = 3 and fp_base = 50);

-- ── 16. Macro 2026: la Hacer por etapas de Política fiscal ────────────────
-- «La factura con lupa» es Medio (25) × 3 etapas (3 documentos) por diseño
-- de Gen (macro-2026/disenos/t3-politica-fiscal.md). Se excluye de la cuenta
-- del chequeo 2 y se mira aquí, igual que las de T1 y T2.
insert into res select 16, 'la Hacer por etapas de Política fiscal declara 3 etapas y base 25', '1 fila',
  (select count(*)::text || ' fila'
     from public.actividad_catalogo
    where activity_id = 'pf26-h3-factura' and etapas = 3 and fp_base = 25),
  (select count(*) = 1 from public.actividad_catalogo
    where activity_id = 'pf26-h3-factura' and etapas = 3 and fp_base = 25);

-- ── 17. Macro 2026: la Hacer por etapas de Política monetaria ─────────────
-- «Ajusta la cascada» es Fácil (10) × 3 etapas (3 metas) por diseño de Gen
-- (macro-2026/disenos/t4-politica-monetaria.md). Se excluye de la cuenta del
-- chequeo 2 y se mira aquí, igual que las de T1, T2 y T3.
insert into res select 17, 'la Hacer por etapas de Política monetaria declara 3 etapas y base 10', '1 fila',
  (select count(*)::text || ' fila'
     from public.actividad_catalogo
    where activity_id = 'pm26-h2-cascada-meta' and etapas = 3 and fp_base = 10),
  (select count(*) = 1 from public.actividad_catalogo
    where activity_id = 'pm26-h2-cascada-meta' and etapas = 3 and fp_base = 10);

-- ── 18. Gestión de Proyectos: las seis Hacer por etapas de los caps. 1 y 2 ─
-- Diseño de Gen (gestion-proyectos/disenos/c1-c2-hacer.md §1): «El puente al
-- estado futuro» Fácil (10) × 2; «Arma el mapa», «La trampa del calendario»,
-- «¿Éxito o fracaso?» y «¿Lo controlas o te controla?» Medio (25) × 2; «El
-- caso de negocio del puente» Difícil (50) × 3. Migración 0276. Se excluyen
-- de la cuenta del chequeo 2 y se miran aquí, igual que las de Macro 2026.
insert into res select 18, 'las seis Hacer por etapas de Gestión de Proyectos declaran sus etapas y su base', '6 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where (activity_id = 'gp26-fun-h04-puente' and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-fun-h05-portafolio', 'gp26-fun-h08-calendario', 'gp26-fun-h12-balanzas', 'gp26-fun-h15-control') and etapas = 2 and fp_base = 25)
       or (activity_id = 'gp26-fun-h11-caso-puente' and etapas = 3 and fp_base = 50)),
  (select count(*) = 6 from public.actividad_catalogo
    where (activity_id = 'gp26-fun-h04-puente' and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-fun-h05-portafolio', 'gp26-fun-h08-calendario', 'gp26-fun-h12-balanzas', 'gp26-fun-h15-control') and etapas = 2 and fp_base = 25)
       or (activity_id = 'gp26-fun-h11-caso-puente' and etapas = 3 and fp_base = 50));

-- ── 19. Gestión de Proyectos: las catorce Hacer por etapas de los caps. 3 y 4 ─
-- Diseño de Gen (gestion-proyectos/disenos/c03-hacer.md y c04-hacer.md §1),
-- migración 0277: una Fácil (10) × 2; ocho Medio (25) × 2; una Medio × 3; tres
-- Difícil (50) × 2 y una Difícil × 3. Se excluyen de la cuenta del chequeo 2
-- y se miran aquí, igual que las del lote 1 (chequeo 18).
insert into res select 19, 'las catorce Hacer por etapas de los caps. 3 y 4 de Gestión de Proyectos declaran sus etapas y su base', '14 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where (activity_id = 'gp26-fun-c03-h01-orquesta' and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-fun-c03-h03-taburete', 'gp26-fun-c03-h05-moneda', 'gp26-fun-c03-h06-comandas', 'gp26-ini-c04-h02-expositor', 'gp26-pla-c04-h03-portaplanos', 'gp26-eje-c04-h05-bitacora', 'gp26-moc-c04-h07-camara', 'gp26-cie-c04-h09-breakers') and etapas = 2 and fp_base = 25)
       or (activity_id = 'gp26-eje-c04-h06-recetario' and etapas = 3 and fp_base = 25)
       or (activity_id in ('gp26-fun-c03-h07-mosaico', 'gp26-ini-c04-h01-acta', 'gp26-moc-c04-h08-turnero') and etapas = 2 and fp_base = 50)
       or (activity_id = 'gp26-cie-c04-h10-beneficiadero' and etapas = 3 and fp_base = 50)),
  (select count(*) = 14 from public.actividad_catalogo
    where (activity_id = 'gp26-fun-c03-h01-orquesta' and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-fun-c03-h03-taburete', 'gp26-fun-c03-h05-moneda', 'gp26-fun-c03-h06-comandas', 'gp26-ini-c04-h02-expositor', 'gp26-pla-c04-h03-portaplanos', 'gp26-eje-c04-h05-bitacora', 'gp26-moc-c04-h07-camara', 'gp26-cie-c04-h09-breakers') and etapas = 2 and fp_base = 25)
       or (activity_id = 'gp26-eje-c04-h06-recetario' and etapas = 3 and fp_base = 25)
       or (activity_id in ('gp26-fun-c03-h07-mosaico', 'gp26-ini-c04-h01-acta', 'gp26-moc-c04-h08-turnero') and etapas = 2 and fp_base = 50)
       or (activity_id = 'gp26-cie-c04-h10-beneficiadero' and etapas = 3 and fp_base = 50));

-- ── 20. Gestión de Proyectos: las 15 Hacer por etapas de los caps. 5 y 6 ──
-- Diseño de Gen (gestion-proyectos/disenos/c05-hacer.md y c06-hacer.md §1),
-- migración 0278. Se excluyen de la cuenta del chequeo 2 y se miran aquí,
-- igual que las de los lotes 1 y 2 (chequeos 18 y 19).
insert into res select 20, 'las 15 Hacer por etapas de los caps. 5 y 6 de Gestión de Proyectos declaran sus etapas y su base', '15 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where (activity_id in ('gp26-pla-c06-h02-linterna') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-pla-c05-h05-urna', 'gp26-pla-c05-h06-alacena', 'gp26-pla-c05-h08-mapa', 'gp26-pla-c05-h10-caja-fuerte', 'gp26-moc-c05-h11-embarque', 'gp26-pla-c06-h01-semaforo', 'gp26-pla-c06-h03-rompecabezas', 'gp26-pla-c06-h06-alcancias', 'gp26-pla-c06-h10-bloques', 'gp26-moc-c06-h11-rotafolio') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c06-h05-sumadora', 'gp26-pla-c06-h09-relevos') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-pla-c05-h09-movil', 'gp26-pla-c06-h07-metro') and etapas = 3 and fp_base = 50)),
  (select count(*) = 15 from public.actividad_catalogo
    where (activity_id in ('gp26-pla-c06-h02-linterna') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-pla-c05-h05-urna', 'gp26-pla-c05-h06-alacena', 'gp26-pla-c05-h08-mapa', 'gp26-pla-c05-h10-caja-fuerte', 'gp26-moc-c05-h11-embarque', 'gp26-pla-c06-h01-semaforo', 'gp26-pla-c06-h03-rompecabezas', 'gp26-pla-c06-h06-alcancias', 'gp26-pla-c06-h10-bloques', 'gp26-moc-c06-h11-rotafolio') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c06-h05-sumadora', 'gp26-pla-c06-h09-relevos') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-pla-c05-h09-movil', 'gp26-pla-c06-h07-metro') and etapas = 3 and fp_base = 50));

-- ── 21. Gestión de Proyectos: las 18 Hacer por etapas de los caps. 7 y 8 ──
-- Diseño de Gen (gestion-proyectos/disenos/c07-hacer.md y c08-hacer.md §1),
-- migración 0279. Se excluyen de la cuenta del chequeo 2 y se miran aquí,
-- igual que las de los lotes 1 a 3 (chequeos 18 a 20).
insert into res select 21, 'las 18 Hacer por etapas de los caps. 7 y 8 de Gestión de Proyectos declaran sus etapas y su base', '18 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where (activity_id in ('gp26-pla-c07-h04-embudo', 'gp26-pla-c08-h01-gondola', 'gp26-pla-c08-h03-ascensor') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-pla-c07-h01-plan-costos', 'gp26-pla-c07-h03-tres-valores', 'gp26-pla-c07-h05-reservas', 'gp26-pla-c08-h02-cubetas', 'gp26-pla-c08-h04-plano', 'gp26-eje-c08-h05-casilleros', 'gp26-eje-c08-h06-espina', 'gp26-moc-c08-h07-hoja') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c07-h06-polea', 'gp26-pla-c07-h07-curva-s', 'gp26-moc-c07-h09-termometros', 'gp26-moc-c08-h08-monitor') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-eje-c08-h11-cadena') and etapas = 3 and fp_base = 25)
       or (activity_id in ('gp26-moc-c07-h10-telescopio', 'gp26-moc-c08-h12-despacho') and etapas = 3 and fp_base = 50)),
  (select count(*) = 18 from public.actividad_catalogo
    where (activity_id in ('gp26-pla-c07-h04-embudo', 'gp26-pla-c08-h01-gondola', 'gp26-pla-c08-h03-ascensor') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-pla-c07-h01-plan-costos', 'gp26-pla-c07-h03-tres-valores', 'gp26-pla-c07-h05-reservas', 'gp26-pla-c08-h02-cubetas', 'gp26-pla-c08-h04-plano', 'gp26-eje-c08-h05-casilleros', 'gp26-eje-c08-h06-espina', 'gp26-moc-c08-h07-hoja') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c07-h06-polea', 'gp26-pla-c07-h07-curva-s', 'gp26-moc-c07-h09-termometros', 'gp26-moc-c08-h08-monitor') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-eje-c08-h11-cadena') and etapas = 3 and fp_base = 25)
       or (activity_id in ('gp26-moc-c07-h10-telescopio', 'gp26-moc-c08-h12-despacho') and etapas = 3 and fp_base = 50));

-- ── 22. Gestión de Proyectos: las 16 Hacer por etapas de los caps. 9 y 10 ─
-- Diseño de Gen (gestion-proyectos/disenos/c09-hacer.md y c10-hacer.md §1),
-- migración 0280. Se excluyen de la cuenta del chequeo 2 y se miran aquí,
-- igual que las de los lotes 1 a 4 (chequeos 18 a 21).
insert into res select 22, 'las 16 Hacer por etapas de los caps. 9 y 10 de Gestión de Proyectos declaran sus etapas y su base', '16 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where (activity_id in ('gp26-pla-c09-h01-puertas') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-pla-c09-h02-gafete', 'gp26-pla-c09-h04-pendon', 'gp26-pla-c09-h06-rama', 'gp26-eje-c09-h08-torre', 'gp26-eje-c09-h09-consola', 'gp26-eje-c10-h03-radios', 'gp26-pla-c10-h04-playa') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c09-h03-raci', 'gp26-pla-c09-h05-sumadora', 'gp26-eje-c09-h07-catacion', 'gp26-pla-c10-h08-tablero', 'gp26-moc-c10-h10-ecosonda') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-eje-c10-h01-casillero') and etapas = 3 and fp_base = 10)
       or (activity_id in ('gp26-eje-c09-h10-microfonos', 'gp26-moc-c09-h11-estibas') and etapas = 3 and fp_base = 50)),
  (select count(*) = 16 from public.actividad_catalogo
    where (activity_id in ('gp26-pla-c09-h01-puertas') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-pla-c09-h02-gafete', 'gp26-pla-c09-h04-pendon', 'gp26-pla-c09-h06-rama', 'gp26-eje-c09-h08-torre', 'gp26-eje-c09-h09-consola', 'gp26-eje-c10-h03-radios', 'gp26-pla-c10-h04-playa') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c09-h03-raci', 'gp26-pla-c09-h05-sumadora', 'gp26-eje-c09-h07-catacion', 'gp26-pla-c10-h08-tablero', 'gp26-moc-c10-h10-ecosonda') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-eje-c10-h01-casillero') and etapas = 3 and fp_base = 10)
       or (activity_id in ('gp26-eje-c09-h10-microfonos', 'gp26-moc-c09-h11-estibas') and etapas = 3 and fp_base = 50));

-- ── 23. Gestión de Proyectos: las 17 Hacer por etapas de los caps. 11 y 12 ─
-- Diseño de Gen (gestion-proyectos/disenos/c11-hacer.md y c12-hacer.md §1),
-- migración 0281. Se excluyen de la cuenta del chequeo 2 y se miran aquí,
-- igual que las de los lotes 1 a 5 (chequeos 18 a 22).
insert into res select 23, 'las 17 Hacer por etapas de los caps. 11 y 12 de Gestión de Proyectos declaran sus etapas y su base', '17 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where (activity_id in ('gp26-pla-c11-h02-movil') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-pla-c11-h01-fichero', 'gp26-pla-c11-h04-muro', 'gp26-pla-c11-h05-cata', 'gp26-pla-c11-h06-burbujas', 'gp26-pla-c11-h10-espejo', 'gp26-pla-c12-h01-hacer-comprar', 'gp26-pla-c12-h02-contratos', 'gp26-pla-c12-h05-sow', 'gp26-moc-c12-h10-controlar', 'gp26-moc-c12-h11-cierre') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c11-h08-galton', 'gp26-pla-c11-h11-libro', 'gp26-pla-c12-h03-sobrecosto', 'gp26-eje-c12-h07-puntajes') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-pla-c11-h07-montana', 'gp26-pla-c12-h12-taller') and etapas = 3 and fp_base = 50)),
  (select count(*) = 17 from public.actividad_catalogo
    where (activity_id in ('gp26-pla-c11-h02-movil') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-pla-c11-h01-fichero', 'gp26-pla-c11-h04-muro', 'gp26-pla-c11-h05-cata', 'gp26-pla-c11-h06-burbujas', 'gp26-pla-c11-h10-espejo', 'gp26-pla-c12-h01-hacer-comprar', 'gp26-pla-c12-h02-contratos', 'gp26-pla-c12-h05-sow', 'gp26-moc-c12-h10-controlar', 'gp26-moc-c12-h11-cierre') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c11-h08-galton', 'gp26-pla-c11-h11-libro', 'gp26-pla-c12-h03-sobrecosto', 'gp26-eje-c12-h07-puntajes') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-pla-c11-h07-montana', 'gp26-pla-c12-h12-taller') and etapas = 3 and fp_base = 50));

-- ── 24. Gestión de Proyectos: las 7 Hacer por etapas del cap. 13 ──────────
-- Diseño de Gen (gestion-proyectos/disenos/c13-hacer.md §1), migración 0282.
-- Se excluyen de la cuenta del chequeo 2 y se miran aquí, igual que las de
-- los lotes 1 a 6 (chequeos 18 a 23).
insert into res select 24, 'las 7 Hacer por etapas del cap. 13 de Gestión de Proyectos declaran sus etapas y su base', '7 filas',
  (select count(*)::text || ' filas'
     from public.actividad_catalogo
    where (activity_id in ('gp26-ini-c13-h01-identificar') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-ini-c13-h03-registro', 'gp26-ini-c13-h04-poder-interes', 'gp26-ini-c13-h06-prominencia', 'gp26-moc-c13-h10-monitorear') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c13-h07-matriz-evaluacion') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-moc-c13-h11-taller') and etapas = 3 and fp_base = 50)),
  (select count(*) = 7 from public.actividad_catalogo
    where (activity_id in ('gp26-ini-c13-h01-identificar') and etapas = 2 and fp_base = 10)
       or (activity_id in ('gp26-ini-c13-h03-registro', 'gp26-ini-c13-h04-poder-interes', 'gp26-ini-c13-h06-prominencia', 'gp26-moc-c13-h10-monitorear') and etapas = 2 and fp_base = 25)
       or (activity_id in ('gp26-pla-c13-h07-matriz-evaluacion') and etapas = 2 and fp_base = 50)
       or (activity_id in ('gp26-moc-c13-h11-taller') and etapas = 3 and fp_base = 50));

-- ── 3. Lo de siempre sigue pagando lo de siempre ───────────────────────────
-- EL CHEQUEO MÁS IMPORTANTE DEL ARCHIVO. registrar_fp se reemplazó entera; si
-- la derivación hubiera salido mal, esto es lo que lo delata.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-normal-sin-etapas', 200000, 100);
reset role;

insert into res select 3, 'una evaluativa difícil al 100% sigue pagando su base', '50',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-normal-sin-etapas'),
  (select fp_awarded = 50 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-normal-sin-etapas');

-- ── 4. El desafío real está en el catálogo con sus cuatro etapas ───────────
insert into res select 4, 'proyecto-arca existe y declara 4 etapas', 'experto/90/4',
  coalesce((select dificultad || '/' || fp_base || '/' || etapas
              from public.actividad_catalogo where activity_id = 'proyecto-arca'),
           'NO ESTÁ'),
  (select dificultad = 'experto' and fp_base = 90 and etapas = 4
     from public.actividad_catalogo where activity_id = 'proyecto-arca');

-- ── 5. El desafío al 100% paga 360 ─────────────────────────────────────────
-- 90 de base × 4 etapas. Duración por encima del mínimo de experto (150 s)
-- para que no entre la defensa de tiempo.
set local role authenticated;
select fp_awarded from public.registrar_fp('proyecto-arca', 600000, 100);
reset role;

insert into res select 5, 'el desafío completo al 100% paga base × 4', '360',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'proyecto-arca'),
  (select fp_awarded = 360 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'proyecto-arca');

-- ── 6. Repetir el desafío no paga ──────────────────────────────────────────
set local role authenticated;
select fp_awarded from public.registrar_fp('proyecto-arca', 600000, 100);
reset role;

insert into res select 6, 'repetir el desafío paga 0', '0',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'proyecto-arca' and repeat_index = 1),
  (select fp_awarded = 0 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'proyecto-arca' and repeat_index = 1);

-- ── 7. Un desempeño parcial escala sobre los 360 ───────────────────────────
-- El 68% es el resultado de la partida imperfecta que se jugó en el navegador:
-- 243 de 360 puntos repartidos entre las cuatro etapas. round(360 × 0.68) = 245.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-desafio-parcial', 600000, 68);
reset role;

insert into res select 7, 'un desafío al 68% paga 245', '245',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-parcial'),
  (select fp_awarded = 245 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-parcial');

-- ── 8. El piso del 50% también se multiplica ───────────────────────────────
-- Decisión confirmada: un desafío fallado entero paga 180. Está aquí escrito
-- como número para que, si algún día se cambia, se vea qué se está cambiando.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-desafio-piso', 600000, 0);
reset role;

insert into res select 8, 'un desafío al 0% cae al piso: la mitad de 360', '180',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-piso'),
  (select fp_awarded = 180 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-piso');

-- ── 9. El tope de cuatro etapas lo aplica el servidor ──────────────────────
-- La fila declara 9. Si el tope viviera en la fila y no en el cálculo, esto
-- pagaría 810 y sería la forma de inflar puntos partiendo una actividad.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-desafio-nueve', 600000, 100);
reset role;

insert into res select 9, 'una fila que declara 9 etapas paga como 4', '360',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-nueve'),
  (select fp_awarded = 360 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-nueve');

-- ── 10. La defensa de tiempo se aplica sobre el total ya multiplicado ──────
-- 360 × 100% × 0.6 = 216. Y el mínimo NO escala con las etapas: es una decisión
-- tomada, no un descuido —escalarlo a diez minutos penalizaría una demostración
-- en clase— así que 1 s basta para dispararla en un desafío de cuatro etapas.
set local role authenticated;
select fp_awarded from public.registrar_fp('zzz-desafio-rapido', 1000, 100);
reset role;

insert into res select 10, 'terminar demasiado rápido recorta el total al 60%', '216',
  (select fp_awarded::text from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-rapido'),
  (select fp_awarded = 216 from public.fp_history
    where user_id = (select uid from ids) and activity_id = 'zzz-desafio-rapido');

-- ── 11. La escritura directa sigue cerrada ─────────────────────────────────
-- La 0012 la cerró; la 0014 reemplaza la función y no debería reabrirla.
--
-- El resultado sale del bloque por set_config y NO escribiendo en `res`: `res`
-- es del dueño, y escribirla siendo `authenticated` es exactamente el error
-- "permission denied for table res" que rompió racha_test la primera vez.
set local role authenticated;
do $puerta$
begin
  insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded,
                                 difficulty, modality, repeat_index)
  values (auth.uid(), 'zzz-a-mano', 'zzz-materia', 99999, 'experto', 'evaluativa', 0);
  perform set_config('prueba.puerta', 'ABIERTA', true);
exception when others then
  perform set_config('prueba.puerta', 'rechazado', true);
end;
$puerta$;
reset role;

insert into res select 11, 'insertar en el historial a mano queda rechazado', 'rechazado',
  current_setting('prueba.puerta', true),
  current_setting('prueba.puerta', true) = 'rechazado';

-- ── 12. El total del perfil cuadra con el historial ────────────────────────
insert into res select 12, 'points del perfil = suma del historial',
  (select coalesce(sum(fp_awarded), 0)::text from public.fp_history where user_id = (select uid from ids)),
  (select points::text from public.profiles where user_id = (select uid from ids)),
  (select p.points = (select coalesce(sum(fp_awarded), 0) from public.fp_history where user_id = p.user_id)
     from public.profiles p where p.user_id = (select uid from ids));

-- ── Resumen. Única consulta que devuelve filas. ────────────────────────────
select
  n::text as n, paso, esperado, obtenido,
  case when ok then 'OK' else 'FALLA' end as estado
from res
union all
select
  'TOTAL',
  (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res),
  '', '',
  (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
