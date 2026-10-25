/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · PRUEBA DE ENCAJE EN SecuenciaAprender (Célula E, issue #538, punto 2).
 *
 * Mide los textos PUBLICADOS de las cuatro piezas de Aprender de T3 (P1, P3,
 * P4 y P5) contra los límites de src/components/secuencia/secuencia.js:
 *
 *   · titular ............ MAX_PALABRAS_TITULAR (10)
 *   · texto de pantalla .. MAX_PALABRAS_PANTALLA (60); el apoyo, 25 como objetivo
 *   · pantallas por pieza  MIN_PANTALLAS a MAX_PANTALLAS (4 a 10)
 *   · pasos por pantalla . MAX_PASOS (5)
 *
 * No monta nada ni reescribe nada: lee las constantes y las funciones de paso
 * tal como las pinta la página de hoy (estadoPaso, SEGMENTOS_*, CIERRE_*…) y
 * cuenta con el mismo `palabras` de secuencia.js, para que la cifra sea la
 * que la secuencia va a contar.
 *
 *   node scripts/t3/encaje-secuencia-t3.mjs            tabla en Markdown
 *   node scripts/t3/encaje-secuencia-t3.mjs --json     lo mismo, en JSON
 *
 * CÓMO CUENTA LAS PANTALLAS (Takamura en #550, como la secuencia de Itagaki):
 *   · los pasos de una pantalla («Paso 1 de 2») NO suman pantallas: la capa 2
 *     ocupa los tramos de ≤ MAX_PASOS que necesite, y nada más;
 *   · decisión S3 de Kamogawa: las preguntas «En una frase» (la capa 4) de P1,
 *     P3, P4 y P5 salen de Aprender y pasan al Repaso Diario. No son pantalla
 *     ni texto de la secuencia, y no se cuentan.
 *
 * Sale siempre con 0: es una medición, no una puerta. Lo que se pasa queda
 * escrito en la tabla; decidir cómo se reparte es de diseño y contenido.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  palabras, MAX_PALABRAS_TITULAR, MAX_PALABRAS_PANTALLA, MIN_PANTALLAS, MAX_PANTALLAS, MAX_PASOS,
} from "../../src/components/secuencia/secuencia.js";
import {
  PIEZA_VENDER_NO_ES_COBRAR, CONSIGNA_CAPA_3, AVISO_CAMBIO, BOTON_OTRA_EMPRESA,
  SAN_CALIXTO, COMPANIA_CUALQUIERA, ALTERNATIVOS,
} from "../../src/data/contabilidadTema3.js";
import { estadoPaso, PASOS } from "../../src/contabilidad/dosLineas.js";
import {
  PIEZA_LO_QUE_YA_PASO, SEGMENTOS_P3, CIERRE_P3, CONSIGNA_CAPA_3_P3, ALTERNATIVOS_P3,
} from "../../src/data/contabilidadTema3Pieza3.js";
import {
  PIEZA_LO_QUE_YA_SE_PAGO, SEGMENTOS_P4, CIERRE_P4, CONSIGNA_CAPA_3_P4, ALTERNATIVOS_P4,
} from "../../src/data/contabilidadTema3Pieza4.js";
import {
  PIEZA_CERRAR_EL_PERIODO, SEGMENTOS_CIERRE, CIERRE_TEXTO, CONSIGNA_CAPA_3_CIERRE,
  ALTERNATIVOS_CIERRE,
} from "../../src/data/contabilidadTema3Cierre.js";
import { PASOS_P3 } from "../../src/contabilidad/loQueYaPaso.js";
import { PASOS_P4 } from "../../src/contabilidad/loQueYaSePago.js";
import { PASOS_CIERRE } from "../../src/contabilidad/cerrarElPeriodo.js";

const OBJETIVO_APOYO = 25;

/*
 * Cada fila es un texto que hoy se ve (o se lee en voz alta) en la página.
 * `tope` dice contra qué límite se mide: "titular" (10), "pantalla" (60) o
 * "rotulo" (texto de un botón dentro de la figura: sin tope, solo se informa).
 * La pregunta de la capa 4 se mide como titular: si pasa de 10, no puede
 * serlo y va al apoyo, como decidió L para T2 (lote T2-7).
 * Un término de la capa 1 se mide entero (término + definición + lo del
 * libro), porque hoy se ve junto en la misma carta; la cita plegada se mide
 * también aparte.
 */
function filasDePieza({ clave, pieza, pasos, textosCapa2, capa3, alternativos }) {
  const f = [];
  const add = (capa, que, texto, tope) => f.push({ pieza: clave, capa, que, texto, palabras: palabras(texto), tope });
  add("cabecera", "título de la pieza", pieza.titulo, "titular");
  add("cabecera", "objetivo", pieza.objetivo, "pantalla");
  pieza.nombres.forEach((n, i) => {
    add("capa 1", `término ${i + 1}: «${n.termino}» (rótulo)`, n.termino, "titular");
    add("capa 1", `término ${i + 1}: definición`, n.definicion, "pantalla");
    if (n.delLibro) {
      add("capa 1", `término ${i + 1}: ${n.rotuloDelLibro ?? "del libro"} (plegado)`, n.delLibro, "pantalla");
      add("capa 1", `término ${i + 1}: carta entera`, [n.termino, n.definicion, n.delLibro].join(" "), "pantalla");
    }
  });
  textosCapa2.forEach((t, i) => add("capa 2", `paso ${i + 1} de ${pasos}`, t, "pantalla"));
  Object.entries(alternativos).forEach(([k, t]) => add("capa 2", `alternativo del paso ${Number(k) + (Array.isArray(alternativos) ? 1 : 0)} (lector)`, t, "pantalla"));
  capa3.forEach(([que, t, tope]) => add("capa 3", que, t, tope ?? "pantalla"));
  /* La capa 4 («En una frase») no entra: con S3 pasa al Repaso Diario. */
  return f;
}

const textosP1 = Array.from({ length: PASOS }, (_, i) => estadoPaso(i + 1).textos.join(" "));
const hechosP1 = [SAN_CALIXTO, COMPANIA_CUALQUIERA].flatMap((e) => e.hechos.flatMap((h) => [
  [`${e.nombre} · «${h.id}»: rótulo del botón`, h.titulo, "rotulo"],
  [`${e.nombre} · «${h.id}»: texto al tocarlo`, h.texto],
]));

export const PIEZAS_T3 = [
  {
    clave: "P1", pieza: PIEZA_VENDER_NO_ES_COBRAR, pasos: PASOS, textosCapa2: textosP1, alternativos: ALTERNATIVOS,
    capa3: [["consigna", CONSIGNA_CAPA_3], ["aviso al cambiar de empresa", AVISO_CAMBIO], ["botón «otra empresa»", BOTON_OTRA_EMPRESA, "rotulo"], ...hechosP1],
  },
  {
    clave: "P3", pieza: PIEZA_LO_QUE_YA_PASO, pasos: PASOS_P3, textosCapa2: [...SEGMENTOS_P3, CIERRE_P3], alternativos: ALTERNATIVOS_P3,
    capa3: [["consigna", CONSIGNA_CAPA_3_P3]],
  },
  {
    clave: "P4", pieza: PIEZA_LO_QUE_YA_SE_PAGO, pasos: PASOS_P4, textosCapa2: [...SEGMENTOS_P4, CIERRE_P4], alternativos: ALTERNATIVOS_P4,
    capa3: [["consigna", CONSIGNA_CAPA_3_P4]],
  },
  {
    clave: "P5", pieza: PIEZA_CERRAR_EL_PERIODO, pasos: PASOS_CIERRE, textosCapa2: [...SEGMENTOS_CIERRE, CIERRE_TEXTO], alternativos: ALTERNATIVOS_CIERRE,
    capa3: [["consigna", CONSIGNA_CAPA_3_CIERRE]],
  },
];

/* "rotulo": texto dentro de la figura (un botón); secuencia.js no le pone tope, se informa y nada más. */
const limite = (tope) => (tope === "titular" ? MAX_PALABRAS_TITULAR : tope === "pantalla" ? MAX_PALABRAS_PANTALLA : null);

export function medir() {
  const filas = PIEZAS_T3.flatMap(filasDePieza).map((r) => {
    const max = limite(r.tope);
    return { ...r, max, exceso: max === null ? 0 : Math.max(0, r.palabras - max), sobreApoyo: r.tope === "pantalla" ? Math.max(0, r.palabras - OBJETIVO_APOYO) : 0 };
  });
  /*
   * La cuenta mínima de pantallas, si el contenido se reparte sin reescribirlo
   * (§14.4): es aritmética, no una propuesta de diseño. Supone una pantalla por
   * término, la capa 2 en tramos de MAX_PASOS pasos (los pasos van dentro de
   * su pantalla y no suman), una para la capa 3 y el cierre. Sin la Haz de la
   * capa 4: con S3 pasa al Repaso Diario.
   */
  const piezas = PIEZAS_T3.map(({ clave, pieza, pasos }) => {
    const terminos = pieza.nombres.length;
    const tramosCapa2 = Math.ceil(pasos / MAX_PASOS);
    const total = terminos + tramosCapa2 + 1 + 1;
    return {
      pieza: clave, terminos, pasosCapa2: pasos, pasosSobran: Math.max(0, pasos - MAX_PASOS), tramosCapa2, pantallasMinimas: total,
      dentro: total >= MIN_PANTALLAS && total <= MAX_PANTALLAS,
    };
  });
  return { filas, piezas, limites: { MAX_PALABRAS_TITULAR, MAX_PALABRAS_PANTALLA, OBJETIVO_APOYO, MIN_PANTALLAS, MAX_PANTALLAS, MAX_PASOS } };
}

function markdown({ filas, piezas, limites }) {
  const out = [];
  out.push(`Límites (secuencia.js): titular ≤ ${limites.MAX_PALABRAS_TITULAR} · pantalla ≤ ${limites.MAX_PALABRAS_PANTALLA} (apoyo ${limites.OBJETIVO_APOYO} como objetivo) · ${limites.MIN_PANTALLAS}-${limites.MAX_PANTALLAS} pantallas · ≤ ${limites.MAX_PASOS} pasos por pantalla.`, "");
  out.push("### Pantallas y pasos por pieza", "", "| Pieza | Términos (capa 1) | Pasos de capa 2 | Pasos que sobran en una pantalla | Pantallas de la capa 2 (tramos de ≤5) | Pantallas mínimas sin reescribir | ¿4 a 10? |", "|---|---:|---:|---:|---:|---:|---|");
  for (const p of piezas) out.push(`| ${p.pieza} | ${p.terminos} | ${p.pasosCapa2} | ${p.pasosSobran} | ${p.tramosCapa2} | ${p.pantallasMinimas} | ${p.dentro ? "sí" : "**no**"} |`);
  out.push("", "### Lo que se pasa", "", "| Pieza | Capa | Texto | Palabras | Tope | Se pasa por |", "|---|---|---|---:|---:|---:|");
  const pasan = filas.filter((r) => r.exceso > 0);
  for (const r of pasan) out.push(`| ${r.pieza} | ${r.capa} | ${r.que} | ${r.palabras} | ${r.max} | **+${r.exceso}** |`);
  if (!pasan.length) out.push("| — | — | nada se pasa | — | — | — |");
  out.push("", "### Todos los textos", "", "| Pieza | Capa | Texto | Palabras | Tope | Exceso | Sobre 25 (apoyo) |", "|---|---|---|---:|---:|---:|---:|");
  for (const r of filas) out.push(`| ${r.pieza} | ${r.capa} | ${r.que} | ${r.palabras} | ${r.max ?? "—"} | ${r.max === null ? "—" : r.exceso ? `**+${r.exceso}**` : "0"} | ${r.tope === "pantalla" ? r.sobreApoyo : "—"} |`);
  return out.join("\n");
}

/*
 * ═══════════ --secuencia: LAS PIEZAS MONTADAS (paquete v3, D1) ═══════════
 *
 * Con las piezas ya montadas en SecuenciaAprender (secuencia/index.js), cuenta
 * por ESTADO VISIBLE —titular + lo que dice la zona del apoyo en ese estado—,
 * que es como D1 cuenta el tope de 60. Los estados son los que cada pantalla
 * declara en `medir` (los mismos que mide en Chromium medir-secuencias.mjs).
 * Se carga con el cargador de JSX:
 *   node --import ./scripts/cargador-jsx.mjs scripts/t3/encaje-secuencia-t3.mjs --secuencia
 */
async function medirSecuencia() {
  const { PIEZAS_SECUENCIA_T3 } = await import("../../src/components/mecanicas/libros/tema3/secuencia/index.js");
  const filas = [];
  for (const pz of PIEZAS_SECUENCIA_T3) {
    pz.pantallas.forEach((pt, k) => {
      let max = 0; let cual = "—";
      for (const m of pt.medir ?? []) {
        const zona = pt.zonaDe?.(m.estado ?? pt.estadoInicial ?? null, m.paso ?? 0) ?? [];
        const n = palabras(pt.titular) + palabras(zona.filter((z) => z.texto).map((z) => z.texto).join(" "));
        if (n > max) { max = n; cual = m.nombre; }
      }
      filas.push({ pieza: pz.id, n: k + 1, pantalla: pt.id, tipo: pt.tipo, titular: palabras(pt.titular), maxEstado: max, estado: cual, pasos: pt.pasos ?? 0, pendiente: pt.pendiente ?? null });
    });
  }
  return filas;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--secuencia")) {
    const filas = await medirSecuencia();
    const out = ["| Pieza | n | Pantalla | Tipo | Titular | Máx. por estado visible | Estado | Pasos | ≤ 60 | Pendiente |", "|---|---:|---|---|---:|---:|---|---:|---|---|"];
    for (const f of filas) out.push(`| ${f.pieza} | ${f.n} | ${f.pantalla} | ${f.tipo} | ${f.titular} | ${f.maxEstado} | ${f.estado} | ${f.pasos} | ${f.maxEstado <= MAX_PALABRAS_PANTALLA && f.titular <= MAX_PALABRAS_TITULAR ? "sí" : "**no**"} | ${f.pendiente ?? ""} |`);
    console.log(process.argv.includes("--json") ? JSON.stringify(filas, null, 2) : out.join("\n"));
  } else {
    const m = medir();
    console.log(process.argv.includes("--json") ? JSON.stringify(m, null, 2) : markdown(m));
  }
}
