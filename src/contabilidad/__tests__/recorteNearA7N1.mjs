import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * Ayudante de pruebas: el recorte B2 de Near para T7-1 A7 «El viaje de una
 * caja» y T5 N1 (orquestador/conocimiento/paquetes/a7-n1-recorte.md).
 *
 * El paquete queda como llegó. Este ayudante lee sus tablas, falla si falta
 * o sobra una fila de las que trae (o si una no se entiende), y da:
 *
 *   leerRecorte(md?)        las tablas, las cuentas y los totales de Near
 *   aplicarRecorteA7(ref)   las estaciones y las pantallas de referencia (las
 *                           de a7.js de la v6) con el recorte encima
 *   recorteN1(md?)          los campos nuevos de N1, por ítem
 *   palabras(t)             el contador de Near: entre espacios, con al menos
 *                           una letra o cifra («·» suelto no cuenta)
 *   b2A7(pantalla, est)     «todo lo que se ve a la vez» en A7: el texto, la
 *                           ficha más larga, el mensaje más largo y los
 *                           rótulos de las cinco estaciones (nombre, control
 *                           y marca)
 *   b2N1(ítem)              lo mismo en N1: el caso, las opciones y el
 *                           mensaje más largo
 *
 * Lo que este paquete deja pendiente (la entrega «N1: lo que pidió Mello»:
 * bonos-de-compania, la intro del bloque 2, los aciertos «volverlos
 * efectivo» del caso 4) no está aquí: no se construye.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
export const RUTA_RECORTE = "orquestador/conocimiento/paquetes/a7-n1-recorte.md";
export const leerPaquete = () => readFileSync(new URL(RUTA_RECORTE, RAIZ), "utf8");

export const palabras = (t) => String(t).split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;

const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const celdas = (l) => l.replace(/^\| | \|$/g, "").split(" | ");
const falla = (msg) => { throw new Error(`recorte A7/N1: ${msg}`); };
const numero = (s) => (s.trim() === "—" ? null : Number(s.trim().replace(",", ".")));

/* Las filas que el paquete tiene que traer, ni una más ni una menos. */
const ESTACIONES_CAMBIAN = ["recepcion", "contabilidad", "conteos"];
const CAMPOS_A7 = [
  "p1 texto",
  "p2 texto", "p2 bien", "p2 pista", "p2 mal.contabilidad", "p2 mal.bodega", "p2 mal.conteos", "p2 mal.salida",
  "p3 texto", "p3 bien", "p3 pista", "p3 mal.recepcion", "p3 mal.contabilidad", "p3 mal.bodega", "p3 mal.conteos",
  "p4 texto", "p4 ficha", "p4 bien", "p4 pista", "p4 mal.recepcion", "p4 mal.contabilidad", "p4 mal.bodega", "p4 mal.salida",
  "p5 texto",
];
const CAMPOS_N1 = [
  "enunciado[0]", "enunciado[1]",
  "ritmo-del-negocio · pregunta", "ritmo-del-negocio · error", "ritmo-del-negocio · acierto",
  "la-intencion · pregunta", "la-intencion · correcta", "la-intencion · opción", "la-intencion · opción",
  "la-intencion · error", "la-intencion · acierto",
];

export function leerRecorte(md = leerPaquete()) {
  const iA7 = md.indexOf("## T7-1 A7 (`contabilidadT7_1_a7_viaje.js`)");
  const iN1 = md.indexOf("## T5 N1 (`contabilidadT5_n1.js`)");
  if (iA7 < 0 || iN1 < iA7) falla("no están las secciones de A7 y de N1");
  const a7 = md.slice(iA7, iN1);
  const n1 = md.slice(iN1);
  const tablas = (s) => s.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| ---"));

  /* La cuenta de main, de la cabecera. */
  const main = md.match(/en main A7 da (\d+), (\d+), (\d+), (\d+) y (\d+) palabras y N1, (\d+), (\d+) y (\d+) en el enunciado/);
  if (!main) falla("no está la cuenta de main");

  /* A7 · estaciones. */
  const est = a7.match(/\*\*Estaciones\*\*: pasan de (\d+) a (\d+) palabras/) ?? falla("no está la cuenta de las estaciones");
  const filasEst = tablas(a7).map(celdas).filter((c) => c.length === 3 && c[0] !== "Estación");
  const estaciones = {};
  for (const [id, control] of filasEst) {
    if (estaciones[id]) falla(`estación repetida: ${id}`);
    const [nuevo, marca] = citas(control);
    if (!nuevo) falla(`estación ${id} sin control`);
    estaciones[id] = marca ? { control: nuevo, marca } : { control: nuevo };
  }
  if (JSON.stringify(Object.keys(estaciones)) !== JSON.stringify(ESTACIONES_CAMBIAN)) falla(`estaciones: ${Object.keys(estaciones)}`);
  const iguales = a7.match(/Bodega \(«([^»]+)»\) y Salida \(«([^»]+)», con su «solo»\) quedan igual\./) ?? falla("no está la línea de Bodega y Salida");

  /* A7 · pantallas. */
  const camposA7 = tablas(a7).map(celdas).filter((c) => c.length === 5 && /^p\d$/.test(c[0])).map(([pantalla, campo, nuevo, pal, inflesz]) => {
    const [texto] = citas(nuevo);
    if (!texto) falla(`${pantalla} ${campo} sin texto`);
    return { pantalla, campo, texto, palabras: Number(pal), inflesz: numero(inflesz) };
  });
  const clavesA7 = camposA7.map((f) => `${f.pantalla} ${f.campo}`);
  if (JSON.stringify(clavesA7) !== JSON.stringify(CAMPOS_A7)) falla(`faltan o sobran filas de A7: ${clavesA7.join(", ")}`);
  const tot = a7.match(/\*\*Totales a la vista:\*\* (.+)/) ?? falla("no están los totales de A7");
  const totalesA7 = Object.fromEntries([...tot[1].matchAll(/(p\d) (\d+)/g)].map((m) => [m[1], Number(m[2])]));
  if (Object.keys(totalesA7).join() !== "p0,p1,p2,p3,p4,p5") falla("totales de A7 incompletos");

  /* N1. */
  const camposN1 = tablas(n1).map(celdas).filter((c) => c.length === 4 && c[0] !== "Campo").map(([campo, nuevo, pal, inflesz]) => {
    const [texto] = citas(nuevo);
    if (!texto) falla(`${campo} sin texto`);
    return { campo, texto, palabras: Number(pal), inflesz: numero(inflesz) };
  });
  if (JSON.stringify(camposN1.map((f) => f.campo)) !== JSON.stringify(CAMPOS_N1)) falla(`faltan o sobran filas de N1: ${camposN1.map((f) => f.campo).join(", ")}`);
  const totN1 = n1.match(/\*\*Totales:\*\* enunciado (\d+) \(antes (\d+)\) · ritmo-del-negocio (\d+) \(antes (\d+)\) · la-intencion (\d+) \(antes (\d+)\)\. Los demás ítems ya estaban en (\d+) o menos\./)
    ?? falla("no están los totales de N1");

  return {
    a7: {
      estaciones, iguales: { bodega: iguales[1], salida: iguales[2] },
      palabrasEstaciones: { antes: Number(est[1]), ahora: Number(est[2]) },
      campos: camposA7, totales: totalesA7,
      main: { p1: +main[1], p2: +main[2], p3: +main[3], p4: +main[4], p5: +main[5] },
    },
    n1: {
      campos: camposN1,
      totales: { enunciado: +totN1[1], "ritmo-del-negocio": +totN1[3], "la-intencion": +totN1[5] },
      antes: { enunciado: +totN1[2], "ritmo-del-negocio": +totN1[4], "la-intencion": +totN1[6] },
      demasHasta: +totN1[7],
    },
  };
}

/* Las estaciones y las pantallas de referencia, con el recorte encima. No toca la referencia. */
export function aplicarRecorteA7(ref, recorte = leerRecorte()) {
  const r = structuredClone(ref);
  for (const e of r.ESTACIONES) {
    const nuevo = recorte.a7.estaciones[e.id];
    if (nuevo) {
      if (nuevo.marca !== undefined && nuevo.marca !== e.marca) falla(`la marca de ${e.id} no es la de la referencia`);
      e.control = nuevo.control;
    } else if (recorte.a7.iguales[e.id] !== e.control) falla(`${e.id}: el paquete dice que queda igual y no casa con la referencia`);
  }
  for (const { pantalla, campo, texto } of recorte.a7.campos) {
    const p = r.PANTALLAS.find((x) => x.id === pantalla) ?? falla(`no hay pantalla ${pantalla}`);
    if (campo === "texto") { p.texto = texto; continue; }
    if (!p.caso) falla(`${pantalla} no es un caso`);
    const [k, sub] = campo.split(".");
    if (sub) {
      if (!(sub in p.caso.mal)) falla(`${pantalla}: no hay error en ${sub}`);
      p.caso.mal[sub] = texto;
    } else {
      if (!(k in p.caso)) falla(`${pantalla}: no hay ${k}`);
      p.caso[k] = texto;
    }
  }
  return r;
}

/* Los campos de N1, por ítem. Las opciones de la-intencion, en el orden del paquete: la correcta y las dos de la tabla. */
export function recorteN1(recorte = leerRecorte()) {
  const de = (c) => recorte.n1.campos.filter((f) => f.campo === c).map((f) => f.texto);
  const [correcta] = de("la-intencion · correcta");
  return {
    enunciado: [de("enunciado[0]")[0], de("enunciado[1]")[0]],
    "ritmo-del-negocio": { pregunta: de("ritmo-del-negocio · pregunta")[0], error: de("ritmo-del-negocio · error")[0], acierto: de("ritmo-del-negocio · acierto")[0] },
    "la-intencion": {
      pregunta: de("la-intencion · pregunta")[0], correcta, opciones: [correcta, ...de("la-intencion · opción")],
      error: de("la-intencion · error")[0], acierto: de("la-intencion · acierto")[0],
    },
  };
}

/* Todo lo que se ve a la vez, con la cuenta de Near. */
export function b2A7(p, estaciones) {
  const rotulos = estaciones.reduce((n, e) => n + palabras(e.nombre) + palabras(e.control) + (e.marca ? palabras(e.marca) : 0), 0);
  const c = p.caso;
  const ficha = c ? Math.max(0, ...[c.ficha, c.fichaBien].filter(Boolean).map(palabras)) : 0;
  const mensaje = c ? Math.max(...[c.bien, c.pista, ...Object.values(c.mal)].map(palabras)) : 0;
  return palabras(p.texto) + ficha + mensaje + rotulos;
}
export const b2N1 = (it) => palabras(it.pregunta) + it.opciones.reduce((n, o) => n + palabras(o), 0) + Math.max(palabras(it.error), palabras(it.acierto));
