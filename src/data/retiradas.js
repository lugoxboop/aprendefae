/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL NOMBRE DE LAS ACTIVIDADES RETIRADAS.
 *
 * Retirar una actividad es dejar su fila en el servidor como lápida
 * (`retirada = true`) y quitarla del cliente. Lo que el FP ya ganado NO
 * pierde es su valor; lo que pierde es su NOMBRE, y eso se ve en un sitio
 * concreto: el panel docente.
 *
 * `alertas.js` recoge las actividades completadas que ya no están en el
 * catálogo para que el trabajo del estudiante no desaparezca del panel —eso
 * está bien pensado—, pero las pinta con el id crudo como título. Al profesor
 * le sale `t7-2-debe-o-haber` en vez de «¿Debe o haber?».
 *
 * Esta tabla es solo para eso: que una lápida siga teniendo nombre.
 *
 * ═══════════ CÓMO SE MANTIENE ═══════════
 *
 * Cuando retires una actividad, añade aquí su id y el nombre con el que la
 * vio el estudiante — el que tenía en `subjects.js` antes de salir, no uno
 * nuevo. El panel es un registro de lo que pasó, y el estudiante no jugó un
 * nombre distinto del que vio.
 *
 * SÍ HAY GUARDIA, Y ESTE PÁRRAFO DECÍA LO CONTRARIO. Lo cambio y digo por qué,
 * porque el razonamiento viejo no era tonto: decía que una prueba que fallara
 * al retirar algo bloquearía a la célula que retira por un asunto del panel
 * docente, que es de otro.
 *
 * Lo que lo tumbó fue ver el coste del olvido. La Célula D retiró tres
 * actividades, puso sus nombres aquí y no tocó la lista del paso 2 de
 * `supabase/tests/retiro_test.sql` —la otra mitad del mismo trabajo—. Se
 * enteró por un rojo de una prueba que solo corre sobre Postgres limpio, con
 * un mensaje que no dice qué archivo editar, y costó una ronda de mensajes
 * entre células averiguarlo.
 *
 * Así que `retiradas-en-sincronia.test.mjs` compara las dos listas y, cuando
 * no cuadran, DICE qué ids faltan y en qué archivo. No bloquea a nadie por un
 * asunto ajeno: bloquea por media tarea. Quien retira ya está editando dos
 * cadenas del SQL; la tercera línea es esta, y la prueba se la nombra.
 *
 * Y sigue habiendo la otra prueba, la de que lo que está aquí SIGA retirado de
 * verdad: una entrada para algo que volvió al catálogo es basura que engaña.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const NOMBRE_DE_RETIRADA = {
  /* 0015 · retiro de la política monetaria. Cero filas en fp_history al
     retirarla, así que hoy no hay ningún estudiante a quien le salga. Entra
     igual: la tabla vale por las que vengan, y empezar vacía invita a no
     usarla. */
  "dashboard-economico": "El Tablero Económico",
  /* 0076 · Célula B: sus decisiones ya están en a4 y en la capa 3 de T6 · A2 (Shoko, C6). */
  "b5-t6-a7": "¿Qué método y cuándo?",
  /* 0077 · Célula B: se fundió en b5-t6-a2 «La provisión de El Torito» (lote 6b, hoja de Mai). */
  "b5-t6-a5": "La cuenta de la provisión",
  /* 0208 · corte de calidad de los Hacer de T4 (Célula D, 15 oct 2026). H2
     sale; H5 se funde en H4 «El arqueo de caja menor» y H6 en H7 «Concilia
     la cuenta». Los nombres son los que tenían en subjects.js antes de salir,
     y los mismos de sus paquetes (d4-t4-h2-v1, -h5-v1, -h6-v1). */
  "t4-el-control-que-se-saltaron": "El control que se saltaron",
  "t4-al-empleado-o-al-gasto": "¿Al empleado o al gasto?",
  "t4-quien-se-entero-primero": "¿Quién se enteró primero?",
  /* 0115 · Célula C: lo que preguntan ya lo piden otras de su mismo tema. */
  "t7-2-debe-o-haber": "¿Debe o haber?",
  "t7-2-periodico-o-permanente": "¿Periódico o permanente?",
  "t7-3-comercial-o-condicionado": "¿Comercial o condicionado?",
  "t7-3-que-entra-al-costo": "¿Entra al costo?",
  /* 0258 · retiro de TODO Macroeconomía (orden de Mateo, 22 nov 2026): se
     rehace desde cero con material nuevo. Las 59 que tenían fila; las 12 de
     Aprender no la tenían y no hacen falta aquí. Tabla completa y commit de
     respaldo en orquestador/conocimiento/macro-2026/respaldo-retiro.md. */
  /* Demanda Agregada */
  "memorama-corazon": "Memorama del Corazón",
  "cual-componente": "¿Cuál componente?",
  "electrocardiograma": "Lectura de electrocardiograma",
  "termometro-reacciones": "El termómetro de reacciones",
  "banco-transfusiones": "Banco de transfusiones",
  "biopsia-economica": "Biopsia económica",
  "triage-emergencias": "Triage de emergencias",
  "cirugia-reconstruccion": "Cirugía de reconstrucción",
  "sala-monitores": "Sala de monitores",
  "quien-beneficia-auge": "¿A quién beneficia el auge?",
  "explica-paciente": "Explícaselo a un paciente nuevo",
  "sala-espera-llena": "La sala de espera llena",
  /* Política Económica */
  "memorama-tesoro": "Memorama del Tesoro",
  "que-rama-es": "¿Qué rama es?",
  "diagnostico-en-vivo": "Diagnóstico en vivo",
  "arma-grupo-logico": "Arma el grupo lógico",
  "quien-gana-quien-pierde": "¿Quién gana, quién pierde?",
  "corriente-titulares": "Corriente de titulares",
  "explica-la-politica": "Explica la política",
  "tablero-decisiones": "El tablero de decisiones",
  "simulador-de-crisis": "El simulador de crisis",
  "se-acerca-o-se-aleja": "¿Se acerca o se aleja?",
  "expediente-gabinete": "El expediente del gabinete",
  "consejo-ministros": "El consejo de ministros",
  /* Política Fiscal */
  "memorama-tesoreria": "Memorama de la Tesorería",
  "cobra-gasta-o-pide": "¿Cobra, gasta o pide prestado?",
  "clasificador-tesoro": "El clasificador del Tesoro",
  "directos-indirectos": "Directos e indirectos",
  "flujo-de-caja": "Flujo de caja: ¿a quién afecta?",
  "agujero-fiscal": "El agujero fiscal",
  "expansiva-contractiva": "Expansiva o contractiva",
  "disena-presupuesto": "Diseña el presupuesto",
  "deficit-vs-deuda": "Déficit vs deuda",
  "quien-afecta-ajuste": "¿A quién afecta el ajuste?",
  "explica-contribuyente": "Explícaselo a un contribuyente",
  "comite-presupuesto": "El comité de presupuesto",
  "comite-nova": "El Comité de NOVA",
  /* Política Monetaria */
  "memorama-banco-central": "Memorama del Banco Central",
  "quien-decide-esto": "¿Quién Decide Esto?",
  "en-que-talla-va": "¿En Qué Talla Va?",
  "volante-de-la-tasa": "El Volante de la Tasa",
  "la-tasa-que-muerde": "La Tasa que Muerde",
  "caja-de-herramientas": "La Caja de Herramientas",
  "crea-o-cambia-de-manos": "¿Crea o Cambia de Manos?",
  "el-freno-del-encaje": "El Freno del Encaje",
  "a-quien-le-pega-la-tasa": "¿A Quién Le Pega la Tasa?",
  "las-dos-entradas": "Las Dos Entradas",
  "que-toco-el-banco": "¿Qué Tocó el Banco?",
  "cadena-de-transmision": "La Cadena de Transmisión",
  "por-cual-arteria-entra": "¿Por Cuál Arteria Entra?",
  "explicaselo-a-un-deudor": "Explícaselo a un Deudor",
  "corriente-de-decisiones": "Corriente de Decisiones",
  "el-rezago": "El Rezago",
  "la-escalera-del-encaje": "La Escalera del Encaje",
  "repo-o-definitiva": "¿Repo o Definitiva?",
  "dilema-banquero-central": "El Dilema del Banquero Central",
  "duelo-de-instrumentos": "Duelo de Instrumentos",
  "disena-respuesta-monetaria": "Diseña la Respuesta Monetaria",
  /* El Repaso Diario de Macro. El nombre es el que vio el estudiante; la materia
     la pone el panel, que ya sabe de cuál es. */
  "repaso-diario": "El Repaso Diario",
};

/**
 * El nombre con el que el estudiante vio una actividad que ya no está en el
 * catálogo. Devuelve el id si no se conoce — sin inventar y sin romper.
 */
export const nombreDeRetirada = (id) => NOMBRE_DE_RETIRADA[id] ?? id;
