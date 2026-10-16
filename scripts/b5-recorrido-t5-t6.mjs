/*
 * ═══════════════════════════════════════════════════════════════════════════
 * RECORRIDO DEL ESTUDIANTE · T5 Y T6 DE CONTABILIDAD (Célula B).
 *
 * Genera orquestador/conocimiento/paquetes/b5-recorrido-t5-t6.md con TODO el
 * texto visible de las piezas de Aprender y del camino de Hacer de los Temas
 * 5 y 6, en el orden en que la vista los muestra. Para Shoko: auditoría de
 * punta a punta.
 *
 * Nada se copia a mano: cada texto sale de los módulos de datos de main (y,
 * donde el texto se arma al vuelo, de las mismas funciones que usa el juego:
 * el segundo fallo, las devoluciones de la clasificación, el formato de
 * pesos del diario). Los rótulos fijos de los componentes (las capas de
 * CuatroCapas, los botones de la mesa) se leen de su código fuente con una
 * expresión regular, sin escribirlos aquí.
 *
 * No toca nada de src/: solo lee. Se corre con:
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5-recorrido-t5-t6.mjs
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } from "../src/data/subjects.js";
import { bloqueDeDificultad } from "../src/hacer/bloques.js";
import { ASI_SE_JUEGA } from "../src/data/asiSeJuega.js";
import { DEBE, pesos } from "../src/data/contabilidad.js";
import { segundoFalloDe } from "../src/contabilidad/b5SegundoFallo.js";
import { evaluarT5Act1 } from "../src/contabilidad/t5Act1.js";
import { evaluarT6Act1 } from "../src/contabilidad/t6Act1.js";

import { PIEZAS as PIEZAS_T5, JUEGOS as JUEGOS_T5, TEMA as TEMA_T5 } from "../src/components/ContabilidadTema5View.jsx";
import { PIEZAS as PIEZAS_T6, JUEGOS as JUEGOS_T6, TEMA as TEMA_T6 } from "../src/components/ContabilidadTema6View.jsx";

import * as P51 from "../src/data/contabilidadT5Pieza1.js";
import * as P52 from "../src/data/contabilidadT5Pieza2.js";
import * as P61 from "../src/data/contabilidadT6Pieza1.js";
import * as P62 from "../src/data/contabilidadT6Pieza2.js";
import * as P63 from "../src/data/contabilidadT6Pieza3.js";
import * as P64 from "../src/data/contabilidadT6Pieza4.js";
import * as P65 from "../src/data/contabilidadT6Pieza5.js";
import * as H51 from "../src/data/contabilidadT5Act1.js";
import * as H52 from "../src/data/contabilidadT5Act2.js";
import * as H61 from "../src/data/contabilidadT6Act1.js";
import * as H62 from "../src/data/contabilidadT6Act2.js";
import * as H63 from "../src/data/contabilidadT6Act3.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = join(RAIZ, "orquestador/conocimiento/paquetes/b5-recorrido-t5-t6.md");
const MATERIA = "contabilidad";

/* ═══════════ LA SALIDA Y EL REGISTRO DE TEXTOS (para la tabla de cuentas) ═══════════ */

const lineas = [];
const textos = []; // { pieza, texto }
let piezaActual = null;

const md = (s = "") => lineas.push(s);
/* Un texto que ve el estudiante: se registra con su pieza y se devuelve tal cual. */
const lit = (s) => {
  if (typeof s !== "string") throw new Error(`se esperaba un texto y llegó ${typeof s}`);
  textos.push({ pieza: piezaActual, texto: s });
  return s;
};
/* Una línea de la lista: etiqueta en negrita (nuestra) y el texto literal (del juego). */
const item = (etiqueta, texto, nivel = 0) => md(`${"  ".repeat(nivel)}- **${etiqueta}:** ${lit(texto)}`);
const conPie = (texto, pie) => `${lit(texto)} *[${lit(pie)}]*`;

/* ═══════════ LOS RÓTULOS FIJOS, LEÍDOS DEL CÓDIGO FUENTE ═══════════ */

const fuente = (ruta) => readFileSync(join(RAIZ, ruta), "utf8");
const CUATRO_CAPAS = fuente("src/components/mecanicas/maquinas/CuatroCapas.jsx");
const NOMBRES_CAPAS = Object.fromEntries([...CUATRO_CAPAS.matchAll(/<Capa numero=\{(\d)\} nombre="([^"]+)"/g)].map((m) => [m[1], m[2]]));
const ROTULO_DEL_LIBRO = CUATRO_CAPAS.match(/const ROTULO_DEL_LIBRO = "([^"]+)"/)[1];
for (const n of ["1", "2", "3", "4"]) if (!NOMBRES_CAPAS[n]) throw new Error(`no encontré el nombre de la capa ${n} en CuatroCapas`);

/*
 * Los rótulos de botón de los componentes de la célula: props de texto, las
 * frases de los ternarios, los hijos de <Responder> y «Paso N de M». Lo que
 * va en SOLO_LECTOR se marca; los valores de data-* no se leen.
 */
function rotulosFijos(ruta) {
  const s = fuente(ruta);
  const out = [];
  for (const linea of s.split("\n")) {
    if (/^\s*(\*|\/\/|\/\*)/.test(linea)) continue;
    const lector = linea.includes("SOLO_LECTOR") ? " *(solo lector de pantalla)*" : "";
    for (const m of linea.matchAll(/(textoReiniciar|etiqueta)="([^"]+)"/g)) out.push(m[2]);
    if (linea.includes('? "') && !/data-[\w-]+=\{/.test(linea)) {
      for (const m of linea.matchAll(/"([A-ZÁÉÍÓÚ¿][^"]*)"/g)) out.push(`${m[1].trim()}${lector}`);
    }
    for (const m of linea.matchAll(/<Responder[^>]*>([^<{]+)<\/Responder>/g)) out.push(m[1].trim());
  }
  if (/Paso \{[^}]+\} de \{/.test(s)) out.push("Paso N de M");
  return [...new Set(out)];
}
const COMPONENTES = ["tema5", "tema6", "b5"].flatMap((d) => readdirSync(join(RAIZ, "src/components/mecanicas/libros", d))
  .filter((f) => f.endsWith(".jsx")).map((f) => `src/components/mecanicas/libros/${d}/${f}`));
const ENCABEZADO = fuente("src/components/mecanicas/libros/tema1/encabezado.jsx").match(/(¿Cómo se juega\?)/)[1];
const ASI_COMPONENTE = fuente("src/components/mecanicas/libros/AsiSeJuega.jsx");
const ASI_EJEMPLO = ASI_COMPONENTE.match(/`(Ejemplo: )\$\{asi\.alt\}`/)[1];

/* ═══════════ PIEZAS DE APRENDER ═══════════ */

/* Lo que cada pieza pasa a sus capas 2, 3 y 4: los mismos módulos que importan sus componentes. */
const CAPAS = {
  [P51.PIEZA_DEL_EFECTIVO.id]: {
    escena: { ...P51.ROTULOS_ESCENA, titulos: P51.TITULOS.map(({ id, ...t }) => t) },
    pasos: P51.PASOS_CAPA_2.map((texto, k) => ({ texto, pie: P51.PIES_CAPA_2[k] })),
    cierre: { texto: P51.CIERRE_CAPA_2, pie: P51.PIE_CIERRE_CAPA_2 },
    consigna: P51.CONSIGNA_CAPA_3,
    contexto: P51.CONTEXTO_CAPA_3,
    cajas: P51.PAQUETES,
    final: P51.FINAL_CAPA_3.map((texto) => ({ texto })),
    piefinal: P51.PIE_FINAL_CAPA_3,
    pregunta: P51.PREGUNTA_FINAL_T5,
    opciones: P51.OPCIONES_FINAL_T5,
  },
  [P52.PIEZA_TRES_MOMENTOS.id]: {
    escena: P52.ESCENA_T5_A2,
    pasos: P52.PASOS_T5_A2,
    cierre: P52.CIERRE_T5_A2,
    consigna: P52.CONSIGNA_CAPA_3_T5_A2,
    cajas: P52.VENTAS_T5_A2,
    final: [P52.FINAL_CAPA_3_T5_A2],
    pregunta: P52.PREGUNTA_FINAL_T5_A2,
    opciones: P52.OPCIONES_FINAL_T5_A2,
  },
  [P61.PIEZA_LO_QUE_LE_DEBEN.id]: {
    escena: P61.ESCENA_T6,
    pasos: P61.PASOS_T6,
    cierre: P61.CIERRE_T6,
    consigna: P61.CONSIGNA_CAPA_3_T6,
    cajas: P61.HECHOS_T6,
    final: [P61.FINAL_CAPA_3_T6],
    pregunta: P61.PREGUNTA_FINAL_T6,
    opciones: P61.OPCIONES_FINAL_T6,
  },
  [P62.PIEZA_NO_VA_A_PAGAR.id]: {
    escena: P62.ESCENA_T6_A2,
    pasos: P62.PASOS_T6_A2,
    cierre: P62.CIERRE_T6_A2,
    consigna: P62.CONSIGNA_CAPA_3_T6_A2,
    cajas: P62.METODOS_T6_A2,
    final: [P62.FINAL_CAPA_3_T6_A2],
    pregunta: P62.PREGUNTA_FINAL_T6_A2,
    opciones: P62.OPCIONES_FINAL_T6_A2,
  },
  [P63.PIEZA_LA_PROVISION.id]: {
    escena: P63.ESCENA_T6_A3,
    pasos: P63.PASOS_T6_A3,
    cierre: P63.CIERRE_T6_A3,
    consigna: P63.CONSIGNA_CAPA_3_T6_A3,
    tablero: [P63.CUENTA_T_T6_A3.nombre, P63.CUENTA_T_T6_A3.debe, P63.CUENTA_T_T6_A3.haber],
    cajas: P63.MOMENTOS_T6_A3,
    final: [P63.FINAL_CAPA_3_T6_A3],
    pregunta: P63.PREGUNTA_FINAL_T6_A3,
    opciones: P63.OPCIONES_FINAL_T6_A3,
  },
  [P64.PIEZA_SI_PAGA.id]: {
    escena: P64.ESCENA_T6_A4,
    pasos: P64.PASOS_T6_A4,
    cierre: P64.CIERRE_T6_A4,
    consigna: P64.CONSIGNA_CAPA_3_T6_A4,
    tablero: [P64.TABLERO_T6_A4.revive, P64.TABLERO_T6_A4.entran],
    cajas: P64.CASOS_T6_A4,
    final: [P64.FINAL_CAPA_3_T6_A4],
    pregunta: P64.PREGUNTA_FINAL_T6_A4,
    opciones: P64.OPCIONES_FINAL_T6_A4,
  },
  [P65.PIEZA_COMO_SE_CALCULA.id]: {
    escena: { rotulo: P65.ROTULO_SIMULADO_T6_A5, ...P65.ESCENA_T6_A5 },
    pasos: P65.PASOS_T6_A5,
    cierre: P65.CIERRE_T6_A5,
    consigna: P65.CONSIGNA_CAPA_3_T6_A5,
    tablero: [P65.ROTULO_SIMULADO_T6_A5, P65.TABLERO_T6_A5.cabecera, ...P65.TABLERO_T6_A5.celdas, P65.TABLERO_T6_A5.total, P65.TABLERO_T6_A5.suma],
    /* Cerrada, cada caja dice «nombre · monto» (CuatroGrupos.jsx). */
    cajas: P65.GRUPOS_T6_A5.map((g) => ({ nombre: `${g.nombre} · ${g.monto}`, revela: g.revela, pie: g.pie })),
    final: [P65.FINAL_CAPA_3_T6_A5],
    pregunta: P65.PREGUNTA_FINAL_T6_A5,
    opciones: P65.OPCIONES_FINAL_T6_A5,
  },
};

const DATOS_PIEZAS = [
  P51.PIEZA_DEL_EFECTIVO, P52.PIEZA_TRES_MOMENTOS,
  P61.PIEZA_LO_QUE_LE_DEBEN, P62.PIEZA_NO_VA_A_PAGAR, P63.PIEZA_LA_PROVISION, P64.PIEZA_SI_PAGA, P65.PIEZA_COMO_SE_CALCULA,
];
/* Lo que está en los datos y el estudiante no ve. */
const SIN_PINTAR = [];

/* Los rótulos de una escena, aplanados en «clave: texto», en el orden del archivo. */
function aplanar(obj, prefijo = "") {
  return Object.entries(obj).flatMap(([k, v]) => {
    const clave = prefijo ? `${prefijo}.${k}` : k;
    if (typeof v === "string") return [[clave, v]];
    if (Array.isArray(v)) {
      return v.flatMap((x, i) => (typeof x === "string" ? [[`${clave}[${i + 1}]`, x]] : aplanar(x, `${clave}[${i + 1}]`)));
    }
    if (v && typeof v === "object") return aplanar(v, clave);
    return [];
  });
}

/* Lo visible de cada caja de la capa 3, en este orden. Los ids, letras y lados no se leen. */
const CAMPOS_CAJA = [
  ["descripcion", "Dice"], ["cifras", "Cifras"], ["hecho", "Hecho"], ["revela", "Al tocarla"],
  ["monto", "En la T"], ["saldo", "Saldo"], ["revive", "Se revive"], ["entran", "A Caja entran"],
];

function piezaDeAprender(tema, pieza, k, total) {
  const c = CAPAS[pieza.id];
  if (!c) throw new Error(`la pieza ${pieza.id} no tiene sus capas en el script`);
  piezaActual = `${tema.corto} · Aprender ${k + 1}`;
  const rotulo = `${tema.title.toUpperCase()} · APRENDER`;

  md(`### Pieza ${k + 1} de ${total} · ${lit(pieza.titulo)}`);
  md();
  md(`*Encima del panel:* PIEZA ${k + 1} DE ${total} · *rótulo del panel:* ${lit(rotulo)}`);
  md();
  item("Objetivo", pieza.objetivo);
  md();

  md(`#### Capa 1 · ${lit(NOMBRES_CAPAS[1])}`);
  md();
  /* Los textos, de los datos: la vista puede traer la cita ya pintada con su nota (b5/NotaDebajo.jsx). */
  const datos = DATOS_PIEZAS.find((x) => x.id === pieza.id);
  datos.nombres.forEach((n, i) => {
    md(`${i + 1}. **${lit(n.termino)}.** ${lit(n.definicion)}`);
    if (n.delLibro) md(`   - *${lit(n.rotuloDelLibro ?? ROTULO_DEL_LIBRO)}:* ${lit(n.delLibro)}`);
    if (n.notaDebajo) md(`   - *${lit(n.notaDebajo.rotulo)}* (debajo de la cita, en el mismo bloque): ${lit(n.notaDebajo.texto)}`);
    /* La vista pinta el pie si le pasa la definición ya compuesta con él (tema6/PiesDeTermino.jsx). */
    const pintado = typeof pieza.nombres[i].definicion !== "string";
    if (n.pie && pintado) md(`   - *Pie de fuente (bajo la definición):* ${lit(n.pie)}`);
    if (n.pie && !pintado) {
      md(`   - *Pie de fuente, en datos y sin pintar (CuatroCapas no pinta pies en la capa 1):* ${n.pie}`);
      SIN_PINTAR.push(`${piezaActual}, término ${i + 1}: el pie de fuente «${n.pie}».`);
    }
    if (n.pieDelLibro) md(`   - *Pie de la ${(n.rotuloDelLibro ?? ROTULO_DEL_LIBRO).toLowerCase()} (dentro de su caja):* ${lit(n.pieDelLibro)}`);
  });
  md();

  md(`#### Capa 2 · ${lit(NOMBRES_CAPAS[2])}`);
  md();
  md("Rótulos de la escena:");
  md();
  for (const [clave, texto] of aplanar(c.escena)) md(`- \`${clave}\` ${lit(texto)}`);
  md();
  md("Pasos:");
  md();
  c.pasos.forEach((p, i) => md(`${i + 1}. ${conPie(p.texto, p.pie)}`));
  md();
  md(`**Cierre:** ${conPie(c.cierre.texto, c.cierre.pie)}`);
  md();

  md(`#### Capa 3 · ${lit(NOMBRES_CAPAS[3])}`);
  md();
  item("Consigna", c.consigna);
  if (c.contexto) item("Contexto", c.contexto);
  if (c.tablero) item("Tablero", c.tablero.map(lit).join(" · "));
  c.cajas.forEach((x) => {
    md(`- **${lit(x.nombre ?? x.hecho)}**`);
    for (const [campo, etiqueta] of CAMPOS_CAJA) {
      if (x[campo] === undefined || (campo === "hecho" && !x.nombre)) continue;
      const v = x[campo];
      const texto = Array.isArray(v) ? v.map(lit).join(" · ") : typeof v === "object" ? lit(v.texto) : lit(v);
      const columna = campo === "monto" && x.lado ? `, columna ${x.lado.toUpperCase()}` : "";
      md(`  - *${etiqueta}${columna}:* ${texto}`);
    }
    if (x.pie) md(`  - *Pie:* ${lit(x.pie)}`);
  });
  md();
  md("**Al abrir todas:**");
  md();
  c.final.forEach((f) => md(`- ${f.pie ? conPie(f.texto, f.pie) : lit(f.texto)}`));
  if (c.piefinal) md(`- *Pie:* ${lit(c.piefinal)}`);
  md();

  md(`#### Capa 4 · ${lit(NOMBRES_CAPAS[4])}`);
  md();
  item("Pregunta", c.pregunta);
  md();
  md("Opciones (en el orden del archivo; el juego las baraja una vez al cargar):");
  md();
  c.opciones.forEach((o) => {
    md(`- ${o.correcta ? "✔︎" : "✘"} ${lit(o.texto)}`);
    md(`  - *Devolución:* ${lit(o.feedback)}`);
  });
  md();
}

/* ═══════════ EL CAMINO DE HACER ═══════════ */

/* Las fichas a un nivel (lote 6a): los tres cajones son las opciones; cada marca equivocada pasa por el evaluador del juego. */
const CLASIFICACIONES = {
  [H51.T5_ACT1.id]: {
    datos: H51.T5_ACT1, fichas: H51.FICHAS_T5_ACT1, alt: H51.ALT_T5_ACT1, grupo: H51.GRUPO_T5_ACT1, reglas: H51.REGLAS_T5_ACT1,
    resumen: H51.resumenT5Act1,
    marcas: H51.CAJONES_T5_ACT1.map((k) => ({ rotulo: k.rotulo, m: { renta: k.renta, tipo: k.tipo }, clave: k.tipo ? `${k.renta}/${k.tipo}` : k.renta })),
    evaluar: evaluarT5Act1,
    porPartida: H51.T5_ACT1.porPartida,
  },
  [H61.T6_ACT1.id]: {
    datos: H61.T6_ACT1, fichas: H61.FICHAS_T6_ACT1, alt: H61.ALT_T6_ACT1, grupo: H61.GRUPO_T6_ACT1, reglas: H61.REGLAS_T6_ACT1,
    resumen: H61.resumenT6Act1,
    marcas: H61.CAJONES_T6_ACT1.map((k) => ({ rotulo: k.rotulo, m: { cuenta: k.cuenta, lado: k.lado }, clave: k.lado ? `${k.cuenta}/${k.lado}` : k.cuenta })),
    evaluar: evaluarT6Act1,
    porPartida: H61.T6_ACT1.porPartida,
  },
};

/* La mesa de asientos: sus partes, su estante, su diario y su ejemplo resuelto. */
const MESAS = {
  [H52.T5_ACT2.id]: {
    datos: H52.T5_ACT2, partes: H52.PARTES_T5_ACT2, estante: H52.ESTANTE_T5_ACT2, diario: H52.DIARIO_T5_ACT2,
    inicial: H52.COMPRA_T5_ACT2, resumen: H52.RESUMEN_T5_ACT2, alt: H52.ALT_T5_ACT2, agrupar: false,
  },
  [H62.T6_ACT2.id]: {
    datos: H62.T6_ACT2, partes: H62.PARTES_T6_ACT2, estante: H62.ESTANTE_T6_ACT2, diario: H62.DIARIO_T6_ACT2,
    inicial: H62.PROVISION_2007_T6_ACT2, resumen: H62.RESUMEN_T6_ACT2, alt: H62.ALT_T6_ACT2, agrupar: false,
  },
  [H63.T6_ACT3.id]: {
    datos: H63.T6_ACT3, partes: H63.PARTES_T6_ACT3, estante: H63.ESTANTE_T6_ACT3, diario: H63.DIARIO_T6_ACT3,
    inicial: H63.CASTIGO_T6_ACT3, resumen: H63.RESUMEN_T6_ACT3, alt: H63.ALT_T6_ACT3, agrupar: true,
  },
};

const ladoDe = (m) => (m.lado === DEBE ? "Debe" : "Haber");
function asientoEnLineas(asiento, nivel = 1) {
  for (const m of asiento) md(`${"  ".repeat(nivel)}- ${ladoDe(m)} · ${lit(m.cuenta)} · ${pesos(m.valor)}`);
}

function asiSeJuega(id) {
  const asi = ASI_SE_JUEGA[id];
  md(`#### «Así se juega» (la primera vez que se abre)`);
  md();
  if (!asi) {
    md("*No tiene. Tampoco se ve el botón «¿Cómo se juega?».*");
    md();
    return false;
  }
  item("Título", asi.titulo);
  item("Consigna", asi.consigna);
  md(`- **Pasos:**`);
  asi.pasos.forEach((p, i) => md(`  ${i + 1}. ${lit(p)}`));
  for (const demo of asi.demo.items) {
    if (!demo.asiento) {
      /* La clasificación: la ficha, lo que toca la mano y el acierto que queda. */
      item("Ficha del ejemplo", demo.texto);
      const c = CLASIFICACIONES[id];
      const rotuloDe = (sel) => c.marcas.find((x) => x.clave === sel.match(/"([^"]+)"/)[1]).rotulo;
      md(`- **La mano toca:** ${asi.guion.toques.map((t) => t.texto ?? rotuloDe(t.en)).join(" → ")}`);
      item("Queda escrito", demo.acierto);
      continue;
    }
    item("Hecho del ejemplo", demo.hecho);
    md(`- **La mano arma el asiento:**`);
    asientoEnLineas(demo.asiento);
    md(`- **Explicación al confirmar:**`);
    demo.resolucion.forEach((r) => md(`  - ${lit(r)}`));
  }
  item("Para lector de pantalla", `${ASI_EJEMPLO}${asi.alt}`);
  md();
  return true;
}

function clasificacion(c) {
  md(`#### La partida`);
  md();
  item("Objetivo", c.datos.objetivo);
  item("Consigna", c.datos.consigna);
  item("Cajones (tocar uno coloca la ficha)", c.marcas.map((x) => lit(x.rotulo)).join(" · "));
  item("Grupo (lector de pantalla)", c.grupo);
  md(`- **Fichas por partida:** ${c.porPartida} de ${c.fichas.length}`);
  md();
  md("Fichas, con lo que se lee al acertar y al fallar (las devoluciones las calcula el mismo evaluador del juego):");
  md();
  c.fichas.forEach((f, i) => {
    md(`${i + 1}. **${lit(f.texto)}**`);
    md(`   - *Al acertar:* ${lit(f.acierto)}`);
    const vistas = new Map();
    for (const { rotulo, m } of c.marcas) {
      const r = c.evaluar(f, m, 1);
      if (r.ok) continue;
      vistas.set(r.texto, [...(vistas.get(r.texto) ?? []), rotulo]);
    }
    for (const [texto, rotulos] of vistas) md(`   - *Primer fallo (${rotulos.join(" / ")}):* ${lit(texto)}`);
    md(`   - *Segundo fallo:* ${lit(segundoFalloDe(f.acierto))}`);
  });
  md();
  item("Resumen", c.resumen("{bien}", "{cuantas}"));
  item("Para lector de pantalla", c.alt);
  md();
}

function mesa(c) {
  md(`#### La partida`);
  md();
  item("Objetivo", c.datos.objetivo);
  item("Consigna", c.datos.consigna);
  item("Estante", c.estante.map(lit).join(" · "));
  md(`- **Libro diario:** ${[c.diario.cabecera, c.diario.cuenta(1), c.diario.cuenta(2), c.diario.ver, c.diario.ocultar, c.diario.debe, c.diario.haber].map(lit).join(" · ")}`);
  md(`- **Ya anotado en el diario al empezar:** ${lit(c.inicial.fecha)}`);
  asientoEnLineas(c.inicial.asiento);
  if (c.agrupar) md("- *El diario agrupa los asientos seguidos de la misma fecha bajo una sola etiqueta.*");
  md();
  c.partes.forEach((p) => {
    md(`**${lit(p.rotulo)} · ${lit(p.instruccion)}**`);
    md();
    item("Fecha en el diario", p.fecha);
    item("Hecho", p.hecho);
    md(`- **Asiento correcto:**`);
    asientoEnLineas(p.asiento);
    md(`- **Devoluciones de error** (prioridad D > C > A > B):`);
    const e = p.errores;
    for (const clave of ["D", "C", "A"]) if (e[clave]) md(`  - *${clave}:* ${lit(e[clave])}`);
    if (e.C7) md(`  - *B · C7 (Inversiones – títulos con un valor que no es su costo):* ${lit(e.C7)}`);
    for (const x of e.especificas ?? []) md(`  - *B · ${x.clave} (alguna cuenta con ${pesos(x.valor)}):* ${lit(x.texto)}`);
    if (e.B) md(`  - *B:* ${lit(e.B)}`);
    md();
  });
  item("Resumen", c.resumen("{bien}", "{total}"));
  item("Para lector de pantalla", c.alt);
  md();
}

function actividad(tema, a, juegos) {
  const juego = juegos.find((j) => j.id === a.id);
  if (!juego) throw new Error(`${a.id} está en el camino y no en JUEGOS de la vista`);
  piezaActual = a.id;
  const clas = clasificacionDe(MATERIA, tema.id, a.id);
  const bloque = bloqueDeDificultad(clas?.dificultad);
  md(`### ${a.id} · ${lit(juego.titulo)}`);
  md();
  md(`*Rótulo del bloque:* ${bloque ? lit(bloque.nombre.toUpperCase()) : "—"} · *dificultad:* ${clas?.dificultad} · *FP base:* ${clas?.fpBase}`);
  md();
  const conAsi = asiSeJuega(a.id);
  if (CLASIFICACIONES[a.id]) {
    clasificacion(CLASIFICACIONES[a.id]);
    if (!conAsi) {
      md(`*En datos y sin pintar (no hay «${ENCABEZADO}» sin «Así se juega»):*`);
      md();
      CLASIFICACIONES[a.id].reglas.forEach((r, i) => md(`${i + 1}. ${r}`));
      md();
      SIN_PINTAR.push(`${a.id}: las reglas de «${ENCABEZADO}».`);
    }
  } else if (MESAS[a.id]) {
    mesa(MESAS[a.id]);
  } else {
    throw new Error(`${a.id}: no sé qué mecánica tiene`);
  }
}

/* ═══════════ EL DOCUMENTO ═══════════ */

const TEMAS = [
  { id: TEMA_T5, corto: "T5", piezas: PIEZAS_T5, juegos: JUEGOS_T5 },
  { id: TEMA_T6, corto: "T6", piezas: PIEZAS_T6, juegos: JUEGOS_T6 },
];

const sha = execSync("git rev-parse --short HEAD", { cwd: RAIZ }).toString().trim();

md("# Recorrido del estudiante · Temas 5 y 6 de Contabilidad (Célula B)");
md();
md(`> Documento generado por \`scripts/b5-recorrido-t5-t6.mjs\` desde los archivos de datos del commit \`${sha}\`. No se edita a mano: si cambia un texto, se cambia en su archivo de datos y se vuelve a generar.`);
md(">");
md("> Orden: el de la vista. Primero Aprender (las piezas en el orden de `PIEZAS`, cada una con sus cuatro capas). Después el camino de Hacer (el orden de `subjects.js`), cada actividad con su «Así se juega» y su partida.");
md(">");
md("> Convenciones: el texto que ve el estudiante va **literal**. Las etiquetas en negrita o cursiva al inicio de cada línea son de este documento, no del juego. Los pies de fuente van entre corchetes y en cursiva. En la capa 4, ✔︎ marca la opción correcta. En los asientos, los valores van con el mismo formato del diario. En las clasificaciones, el ✅ y el ❌ del inicio de cada devolución están en los datos; el componente los pinta como ícono, separados del texto.");
md();

for (const t of TEMAS) {
  const tema = { ...SUBJECTS[MATERIA].topics.find((x) => x.id === t.id), corto: t.corto };
  md(`## ${t.corto} · ${tema.title} · Aprender`);
  md();
  t.piezas.forEach(({ pieza }, k) => piezaDeAprender(tema, pieza, k, t.piezas.length));
  md(`## ${t.corto} · ${tema.title} · Hacer (camino)`);
  md();
  const camino = actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente);
  md(`Orden del camino: ${camino.map((a) => `\`${a.id}\``).join(" → ")}.`);
  md();
  camino.forEach((a) => actividad(tema, a, t.juegos));
}

/* ═══════════ RÓTULOS FIJOS DE LOS COMPONENTES ═══════════ */

piezaActual = null;
md("## Rótulos fijos de los componentes");
md();
md("Leídos del código fuente, no de los datos. Valen para todas las piezas y actividades de arriba.");
md();
md(`- **CuatroCapas:** ${Object.values(NOMBRES_CAPAS).join(" · ")} · ${ROTULO_DEL_LIBRO}`);
for (const ruta of COMPONENTES) {
  const r = rotulosFijos(ruta);
  if (r.length) md(`- **\`${ruta.replace("src/components/mecanicas/libros/", "")}\`:** ${r.join(" · ")}`);
}
md(`- **Encabezado de las actividades:** ${ENCABEZADO}`);
md();

/* ═══════════ TEXTOS EN DATOS QUE HOY NO SE VEN ═══════════ */

md("## En datos, pero sin pintar");
md();
if (!SIN_PINTAR.length) md("Nada.");
for (const x of SIN_PINTAR) md(`- ${x}`);
md();

/* ═══════════ LA TABLA DE CUENTAS ═══════════ */

/*
 * Los nombres de cuenta salen de los estantes de las mesas y de las cuentas
 * que nombran las escenas y la T. Los de «otra cuenta por cobrar» de
 * b5-t6-a1 solo viven dentro de sus aciertos: se buscan con su patrón.
 */
const ESCENA_CUENTAS = [
  P52.ESCENA_T5_A2.inversiones, P52.ESCENA_T5_A2.bancos, P52.ESCENA_T5_A2.caja, P52.ESCENA_T5_A2.ingresos,
  P52.ESCENA_T5_A2.ganancia, P52.ESCENA_T5_A2.perdida,
  P61.ESCENA_T6.ingresos, P61.ESCENA_T6.clientes, P61.ESCENA_T6.caja,
  P62.ESCENA_T6_A2.clientes, P62.ESCENA_T6_A2.ingresos, P62.ESCENA_T6_A2.gasto,
  P63.ESCENA_T6_A3.gasto, P63.ESCENA_T6_A3.provision, P63.ESCENA_T6_A3.clientes, P63.CUENTA_T_T6_A3.nombre,
  P64.ESCENA_T6_A4.provision, P64.ESCENA_T6_A4.clientes, P64.ESCENA_T6_A4.caja,
];
const EN_PROSA = [...new Set(textos.flatMap(({ texto }) => [...texto.matchAll(/(Cuentas por cobrar a [a-záéíóúñ ]+?|Préstamos a particulares)(?=[.,:;]|$)/g)].map((m) => m[1])))];
const CUENTAS = [...new Set([
  ...Object.values(MESAS).flatMap((m) => m.estante),
  ...ESCENA_CUENTAS,
  ...EN_PROSA,
])].sort((a, b) => b.length - a.length);

const ORDEN_PIEZAS = [...new Set(textos.map((t) => t.pieza).filter(Boolean))];
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Cuenta las apariciones exactas; un nombre más largo que contiene a otro no cuenta para el corto. */
function apariciones(nombre) {
  const largos = CUENTAS.filter((c) => c !== nombre && c.includes(nombre));
  const porPieza = new Map();
  for (const { pieza, texto } of textos) {
    if (!pieza) continue;
    let s = texto;
    for (const l of largos) s = s.split(l).join("§");
    const n = (s.match(new RegExp(`(?<![\\p{L}])${escapar(nombre)}(?![\\p{L}])`, "gu")) ?? []).length;
    if (n) porPieza.set(pieza, (porPieza.get(pieza) ?? 0) + n);
  }
  return porPieza;
}

md("## Tabla de cuentas");
md();
md("Cada nombre de cuenta que aparece, en qué piezas y cuántas veces (nombre exacto, con su guion y sus mayúsculas; cuenta los rótulos, los pasos, las devoluciones, los estantes y los asientos). Las piezas van en el orden del recorrido.");
md();
md("| Cuenta | Piezas (apariciones) | Total |");
md("|---|---|---|");
for (const nombre of [...CUENTAS].sort((a, b) => a.localeCompare(b, "es"))) {
  const mapa = apariciones(nombre);
  const lista = ORDEN_PIEZAS.filter((p) => mapa.has(p)).map((p) => `${p} (${mapa.get(p)})`).join(" · ");
  const total = [...mapa.values()].reduce((a, b) => a + b, 0);
  md(`| ${nombre}${EN_PROSA.includes(nombre) ? " *(solo en prosa)*" : ""} | ${lista || "—"} | ${total} |`);
}
md();

/* Las formas cortas: no son error por sí solas, pero Shoko las quiere ver juntas. */
const FORMAS_CORTAS = [
  ["«Clientes» suelto (sin «Cuentas por cobrar –» delante)", /(?<!– )\bClientes\b/gu],
  ["«la provisión» / «La provisión»", /\b[Ll]a provisión\b/gu],
  ["«el gasto» / «El gasto»", /\b[Ee]l gasto\b/gu],
  ["«Inversiones» sin «– títulos»", /\bInversiones\b(?! – títulos)/gu],
  ["«cartera»", /\bcartera\b/giu],
  ["«la ganancia» / «la pérdida»", /\bla (ganancia|pérdida)\b/gu],
];
md("### Formas cortas y variantes");
md();
md("| Forma | Piezas (apariciones) | Total |");
md("|---|---|---|");
for (const [etiqueta, re] of FORMAS_CORTAS) {
  const mapa = new Map();
  for (const { pieza, texto } of textos) {
    if (!pieza) continue;
    const n = (texto.match(re) ?? []).length;
    if (n) mapa.set(pieza, (mapa.get(pieza) ?? 0) + n);
  }
  const lista = ORDEN_PIEZAS.filter((p) => mapa.has(p)).map((p) => `${p} (${mapa.get(p)})`).join(" · ");
  md(`| ${etiqueta} | ${lista || "—"} | ${[...mapa.values()].reduce((a, b) => a + b, 0)} |`);
}
md();

writeFileSync(SALIDA, `${lineas.join("\n")}\n`);
const palabras = lineas.join(" ").split(/\s+/).filter(Boolean).length;
console.log(`${SALIDA}: ${lineas.length} líneas, ${palabras} palabras, ${textos.length} textos registrados.`);
