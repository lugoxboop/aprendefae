import { itemDeRepaso, subtemaPorRegla, retro } from "./forma.js";
import { itemsVigentesT4 } from "../../data/contabilidadT4Subtemas.js";
import { H1, H1_ID, ITEMS_H1, DESTINOS_H1, evaluarH1 } from "../../data/contabilidadT4H1.js";
import { H3_ID } from "../../data/contabilidadT4H3.js";
import {
  H4_ID, RONDAS_H4, ZONAS_H4, CUENTAS_H4, NOMBRE_CUENTA_H4, ASIENTO_H4, SOBRE_H4,
  ARQUEO, CHEQUE, CUENTA, DEBE, HABER, evaluarH4, evaluarCuentaH4, itemH4, cifra, pesos,
} from "../../data/contabilidadT4H4.js";
import { H7, H7_ID, SERIES_H7, SECCIONES_H7, ROTULOS_H7, evaluarPartidaH7 } from "../../data/contabilidadT4H7.js";
import { H8_ID } from "../../data/contabilidadT4H8.js";

/*
 * EL REPASO DE CONTABILIDAD — T4 · efectivo-caja-menor-bancos (Efectivo, caja menor y bancos).
 *
 * DUEÑA: Célula D (general Yujiro). Etiquetado de Katsumi, aprobado por
 * Yujiro tal cual: entran 31 ítems (H1 8, H4 8, H7 15); H3 y H8 quedan fuera.
 *
 * ═══════════ NI UNA COPIA DE CONTENIDO ═══════════
 *
 * Cada ítem LEE el banco de su pieza (contabilidadT4H1/H4/H7.js) y su
 * devolución llama a la misma función de veredicto de la actividad
 * (evaluarH1, evaluarH4, evaluarCuentaH4, evaluarPartidaH7), con debajo la
 * página que la actividad enseña en su Mensaje. Corregir el banco corrige el
 * Repaso sin tocar este archivo. Lo único que se ensambla aquí:
 *   - H4: el enunciado une `r.tarjeta` con los rótulos del sobre
 *     (SOBRE_H4.gastos, SOBRE_H4.caja) y sus cifras con `pesos()`; solo se
 *     añaden «: » y «. ».
 *   - H4 (cuenta) y H7: cada opción une dos rótulos del banco con « · ».
 *   - H4: `etiqueta: "Escenario simulado"`, el rótulo de la regla de cifras
 *     (el mismo literal de Macro). H1 y H7 no muestran cifras y no lo llevan.
 *
 * ═══════════ SUBTEMA [regla] E itemId ═══════════
 *
 * El subtema es el de cada ítem en contabilidadT4Subtemas.js (#475), leído
 * como regla `clave → subtema` de los ítems VIGENTES: un ítem retirado o sin
 * nombre lanza al cargar. El itemId es exactamente el que la pieza manda a
 * fp_detalle con `t.anotar`: `x.id` en H1, `itemH4(r.id, p.id)` en H4 y
 * `p.id` en H7. Nunca un índice.
 *
 * ═══════════ H4: UNA PREGUNTA POR RONDA ═══════════
 *
 * Las cuatro preguntas de una ronda comparten enunciado y la devolución de una
 * responde a las otras (el acierto del arqueo fija la cuenta, la diferencia da
 * el cheque, el error del arqueo nombra el sobrante). En la actividad eso es a
 * propósito; en el Repaso serían dos tarjetas iguales regalándose la
 * respuesta, sobre todo a quien más falló, porque las de una ronda se anotan
 * con segundos de diferencia. Por eso cada par del sorteo (PARES_H4) aporta
 * dos preguntas distintas:
 *
 *   h4-1 → arqueo   h4-6 → cheque     (Fondo que cuadra)
 *   h4-2 → cheque   h4-4 → cuenta     (Sobrante de caja menor)
 *   h5-1 → cheque   h5-3 → cuenta     (Faltante cobrado al encargado)
 *   h5-2 → cheque   h5-4 → cuenta     (Faltante asumido por la empresa)
 *
 * Las otras 20 claves vigentes de H4 (28 − 8; las rondas que cuadran solo
 * tienen arqueo y cheque) quedan fuera a propósito: las seis `:diferencia`
 * (una cifra que la devolución del cheque ya da) y las demás preguntas de cada
 * ronda, por el regalo de arriba. Las de h4-3 y h4-5 están retiradas y no
 * entran nunca.
 *
 * ═══════════ H7: FASE 1, SIN LOS TEXTOS REPETIDOS ═══════════
 *
 * Entran s1-1…s1-9 y s2-1…s2-5 y s2-9. Fuera: s2-6, s2-7 y s2-8, que tienen
 * el mismo texto que s1-6, s1-7 y s1-8 (dos tarjetas idénticas, la primera
 * respondería la segunda), y `saldo-banco`/`saldo-libros`, que son cifras
 * escritas que dependen de las nueve partidas puestas.
 */
const SUBTEMA_T4 = Object.fromEntries(itemsVigentesT4().map((x) => [x.clave, x.subtema]));
const subtema = (actividad, itemId) => subtemaPorRegla(SUBTEMA_T4, `${actividad}:${itemId}`, "contabilidadT4Subtemas.js");

const conPagina = (texto, pagina) => [...retro(texto), ...(pagina ? [{ tipo: "nota", texto: pagina }] : [])];

/* H1 · ¿Entra o sale de caja?: los ocho hechos, opciones en el orden del cajón. */
const OPCIONES_H1 = DESTINOS_H1.map((d) => ({ id: d.id, texto: d.nombre }));
const itemsH1 = ITEMS_H1.map((x) => itemDeRepaso(H1_ID, x.id, {
  subtema: subtema(H1_ID, x.id),
  rotulo: H1.nombre.toUpperCase(),
  enunciado: x.texto,
  opciones: OPCIONES_H1,
  correcta: x.respuesta,
  devolucion: (e) => { const v = evaluarH1(x, e); return conPagina(v.texto, v.pagina); },
}));

/* H4 · El arqueo de Rosa: { rondaId: preguntaId }, ver la cabecera. */
export const PREGUNTA_H4 = {
  "h4-1": ARQUEO, "h4-6": CHEQUE,
  "h4-2": CHEQUE, "h4-4": CUENTA,
  "h5-1": CHEQUE, "h5-3": CUENTA,
  "h5-2": CHEQUE, "h5-4": CUENTA,
};
const OPCIONES_ARQUEO_H4 = ZONAS_H4.map(([id, nombre]) => ({ id, texto: nombre }));
const OPCIONES_CUENTA_H4 = CUENTAS_H4.flatMap((c) => [DEBE, HABER].map((l) => ({ id: `${c.id}:${l}`, texto: `${NOMBRE_CUENTA_H4[c.id]} · ${ASIENTO_H4[l]}` })));
const itemsH4 = RONDAS_H4.filter((r) => PREGUNTA_H4[r.id]).map((r) => {
  const p = r.preguntas.find((q) => q.id === PREGUNTA_H4[r.id]);
  if (!p) throw new Error(`${H4_ID}: la ronda ${r.id} no tiene la pregunta «${PREGUNTA_H4[r.id]}»`);
  const id = itemH4(r.id, p.id);
  const base = {
    subtema: subtema(H4_ID, id),
    rotulo: r.titulo.toUpperCase(),
    enunciado: `${r.tarjeta} ${SOBRE_H4.gastos}: ${pesos(r.gastos)}. ${SOBRE_H4.caja}: ${pesos(r.caja)}.`,
    etiqueta: "Escenario simulado",
    pregunta: p.pregunta,
  };
  if (p.id === ARQUEO) return itemDeRepaso(H4_ID, id, { ...base,
    opciones: OPCIONES_ARQUEO_H4,
    correcta: p.correcta,
    devolucion: (e) => conPagina(evaluarH4(p, e).texto, r.pagina) });
  if (p.id === CHEQUE) return itemDeRepaso(H4_ID, id, { ...base,
    opciones: p.opciones.map((v) => ({ id: String(v), texto: cifra(v) })),
    correcta: String(p.correcta),
    barajarOpciones: true,
    devolucion: (e) => conPagina(evaluarH4(p, Number(e)).texto, r.pagina) });
  return itemDeRepaso(H4_ID, id, { ...base,
    opciones: OPCIONES_CUENTA_H4,
    correcta: `${p.correcta.cuenta}:${p.correcta.lado}`,
    devolucion: (e) => { const [c, l] = e.split(":"); return conPagina(evaluarCuentaH4(p, c, l).texto, r.pagina); } });
});

/* H7 · Concilia la cuenta: las partidas de la fase 1, sin los tres textos repetidos de la serie 2. */
export const REPETIDAS_H7 = ["s2-6", "s2-7", "s2-8"];
const OPCIONES_H7 = SECCIONES_H7.map((s) => { const [lib, signo] = s.split(":"); return { id: s, texto: `${ROTULOS_H7[lib]} · ${ROTULOS_H7[signo]}` }; });
const itemsH7 = SERIES_H7.flatMap((s) => s.partidas).filter((p) => !REPETIDAS_H7.includes(p.id)).map((p) => itemDeRepaso(H7_ID, p.id, {
  subtema: subtema(H7_ID, p.id),
  rotulo: H7.nombre.toUpperCase(),
  enunciado: p.texto,
  pregunta: H7.consigna,
  opciones: OPCIONES_H7,
  correcta: p.va,
  devolucion: (e) => conPagina(evaluarPartidaH7(p, e).texto, p.pagina),
}));

export const ITEMS_T4 = [...itemsH1, ...itemsH4, ...itemsH7];

/*
 * Las actividades del tema que NO aportan al pool, cada una con su razón. La
 * prueba exige que cada actividad de Hacer del tema esté en uno de los dos
 * lados.
 *
 * H3: convertir el asiento en opciones de pareja obligaría a elegir a mano qué
 * parejas equivocadas salen (los ERRORES_* son funciones, no datos que se
 * puedan leer), y el reembolso, el aumento y la disminución dicen «el fondo» o
 * «Lucía» sin decir de cuánto ni de quién.
 * H8: «Los libros · Más» de H7 y «Se asienta» de H8 son la misma decisión vista
 * desde dos lados; se queda H7 porque pide más (quién no la tiene y con qué
 * signo, entre cuatro y no entre dos). Si algún día el motor junta claves de
 * actividades distintas en una unidad, la etapa 1 de H8 puede entrar como
 * variante de H7.
 */
export const FUERA_T4 = [
  { id: H3_ID, razon: "Cada operación se responde con un asiento de dos fichas, una cuenta al debe y otra al haber, y tres de sus cuatro enunciados se apoyan en la vida del fondo que la serie va contando, que en el Repaso no está." },
  { id: H8_ID, razon: "Su etapa 1 pregunta por las mismas partidas de «Concilia la cuenta», con el mismo texto, y la devolución de una responde a la otra; la etapa 2 es un asiento de dos fichas y la 3, una cifra escrita." },
];
