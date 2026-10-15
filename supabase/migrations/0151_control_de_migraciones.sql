-- ---------------------------------------------------------------------------
-- 0151 — LA TABLA QUE LLEVA LA CUENTA DE LO QUE YA SE APLICÓ
--
-- Hasta hoy las migraciones se corrían a mano, pegándolas en el editor SQL.
-- Eso puso una fila delante de cinco células: una mañana había doce esperando
-- y cuatro células paradas. A partir de aquí las aplica el despliegue, y esta
-- tabla es lo que le permite saber cuáles faltan.
--
-- POR QUÉ UNA TABLA Y NO LA DEL CLI DE SUPABASE: porque las 80 migraciones
-- que ya existen se aplicaron a mano y el CLI no las tiene registradas. Si se
-- usara su tabla, el primer despliegue automático intentaría aplicarlas todas
-- desde la 0001, y las de esquema fallarían con «ya existe». Así que se siembra
-- esta con todo lo que ya está aplicado, y desde mañana solo entra lo nuevo.
--
-- ADITIVA. Crea una tabla que no existe y la siembra. No toca ninguna tabla de
-- estudiantes y no cambia ninguna fila existente.
--
-- GUARDIAN: cambio de esquema a proposito
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final devuelve 93 filas.
-- ---------------------------------------------------------------------------

create table if not exists public.migraciones_aplicadas (
  archivo     text primary key,
  aplicada_en timestamptz not null default now()
);

alter table public.migraciones_aplicadas enable row level security;

-- Nadie la lee desde el navegador: solo la toca el despliegue, que entra con
-- credenciales de servidor y se salta RLS. Sin políticas, a propósito.

insert into public.migraciones_aplicadas (archivo) values
  ('0001_profiles.sql'),
  ('0002_cerrar_rpc_a_anonimos.sql'),
  ('0003_fp_history.sql'),
  ('0004_ranking_fp.sql'),
  ('0005_panel_docente.sql'),
  ('0006_ligas.sql'),
  ('0007_racha.sql'),
  ('0008_animo_medallas_resumen.sql'),
  ('0009_logros.sql'),
  ('0010_racha_animacion.sql'),
  ('0011_fp_en_el_servidor.sql'),
  ('0012_cerrar_fp_viejo.sql'),
  ('0013_iceberg_evaluar_protege_intercalada.sql'),
  ('0014_desafios_de_varias_etapas.sql'),
  ('0015_retiro_j3_y_juegos_politica.sql'),
  ('0016_juegos_politica_economica.sql'),
  ('0017_detalle_por_item.sql'),
  ('0018_cerrar_firma_de_tres.sql'),
  ('0019_panel_resumen_e_historial.sql'),
  ('0020_cuentas_de_prueba.sql'),
  ('0021_panel_por_actividad.sql'),
  ('0022_juegos_demanda_agregada.sql'),
  ('0023_ambiguedad_en_el_panel_por_actividad.sql'),
  ('0024_quien_es_quien_en_una_actividad.sql'),
  ('0025_contexto_de_liga.sql'),
  ('0026_techo_y_particion_de_ligas.sql'),
  ('0027_la_razon_de_las_medallas.sql'),
  ('0028_partida_en_curso_del_arca.sql'),
  ('0029_juegos_politica_fiscal.sql'),
  ('0030_cimientos_y_bloques_completos.sql'),
  ('0031_politica_monetaria.sql'),
  ('0032_perfil_solo_apodo_y_nombre.sql'),
  ('0033_repaso_diario.sql'),
  ('0034_racha_momento.sql'),
  ('0035_avatares_y_cristales.sql'),
  ('0036_cierre_semanal_y_podio.sql'),
  ('0037_avatar_en_ranking_y_liga.sql'),
  ('0038_default_de_paleta_marea.sql'),
  ('0039_niveles_de_avatar_de_mateo.sql'),
  ('0040_asistente_uso.sql'),
  ('0041_desafio_comite_de_nova.sql'),
  ('0042_cuentas_debe_y_haber.sql'),
  ('0043_siete_actividades_de_cuentas.sql'),
  ('0044_tema1_primeras_dos.sql'),
  ('0045_tema1_las_otras_cuatro.sql'),
  ('0046_tema1_donde_se_rompio.sql'),
  ('0047_tema3_ingreso_o_cobro.sql'),
  ('0048_tema3_cuando_se_causa.sql'),
  ('0049_tema3_que_le_toca.sql'),
  ('0050_tema3_arma_el_ajuste.sql'),
  ('0051_tema3_cierre_completo.sql'),
  ('0052_monetaria_dos_actividades.sql'),
  ('0053_tema3_mismo_hecho.sql'),
  ('0070_tema5_que_renta_da.sql'),
  ('0071_tema6_clientes_o_otra.sql'),
  ('0072_tema5_cierre_santa_pacha.sql'),
  ('0073_monetaria_fabrica_del_dinero.sql'),
  ('0074_tema6_mesa_de_asientos.sql'),
  ('0075_tema6_cuatro_hacer.sql'),
  ('0090_t7_1_que_cuenta_se_mueve.sql'),
  ('0091_monetaria_agregados.sql'),
  ('0092_t7_1_arma_la_factura.sql'),
  ('0093_t7_1_cuanto_vale_lo_que_sobro.sql'),
  ('0094_t7_1_cierra_el_mes.sql'),
  ('0095_t7_1_costo_o_gasto.sql'),
  ('0096_t7_1_devolucion_dos_libros.sql'),
  ('0097_t7_1_que_control_falta.sql'),
  ('0098_t7_2_debe_o_haber.sql'),
  ('0099_t7_2_dos_asientos.sql'),
  ('0100_t7_2_llena_el_kardex.sql'),
  ('0101_t7_2_periodico_o_permanente.sql'),
  ('0102_t7_2_flete_y_devolucion.sql'),
  ('0103_t7_3_descuento_en_factura.sql'),
  ('0104_t7_3_cadena_de_descuentos.sql'),
  ('0105_t7_3_comercial_o_condicionado.sql'),
  ('0106_t7_3_pago_a_tiempo.sql'),
  ('0107_t7_3_ajuste_por_conteo.sql'),
  ('0108_t7_3_que_entra_al_costo.sql'),
  ('0109_t7_3_costo_o_vnr.sql'),
  ('0110_t5_temporal_o_largo_plazo.sql'),
  ('0111_t5_revision_que_falta.sql'),
  ('0112_t5_el_interes_del_periodo.sql'),
  ('0150_catalogo_legible.sql'),
  ('0151_control_de_migraciones.sql'),
  ('0200_t4_entra_o_sale_de_caja.sql'),
  ('0201_t4_el_control_que_se_saltaron.sql'),
  ('0202_t4_se_mueve_la_caja_menor.sql'),
  ('0203_t4_el_arqueo_de_rosa.sql'),
  ('0204_t4_al_empleado_o_al_gasto.sql'),
  ('0205_t4_quien_se_entero_primero.sql'),
  ('0206_t4_concilia_la_cuenta.sql'),
  ('0250_r5_1_repaso_cruzado.sql'),
  ('0251_r5_2_el_toro_negro.sql')
on conflict (archivo) do nothing;

select count(*) as registradas from public.migraciones_aplicadas;
