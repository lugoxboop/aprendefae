/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H4 DE HACER — «El arqueo de caja menor» (Célula D), con H5 DENTRO.
 * REDISEÑO DE ENGANCHE: el sobre y la regla del fondo.
 *
 * Diseño: Hanayama (celula-d/hanayama-h4-rediseno.md). Textos: Katsumi
 * (celula-d/katsumi-texto-hacer.md), aprobados por Yujiro el 15 oct 2026.
 * Copia en el canon: orquestador/conocimiento/paquetes/d4-t4-h4-v2-
 * rediseno.md. Una prueba compara cada texto de aquí contra ella.
 *
 * H5 «¿Al empleado o al gasto?» se FUNDE aquí (corte de Yujiro): sus cuatro
 * casos pasan a ser rondas de esta pieza, y la pregunta 4 («¿A qué cuenta va
 * la diferencia?») es la suya. El activity_id sigue siendo
 * `t4-el-arqueo-de-rosa`; el nombre pasa a «El arqueo de caja menor».
 *
 * Hacer · evaluativa · DIFÍCIL · 50 FP (antes medio · 25). Su fila del
 * catálogo (0203) la sube la migración 0209, con un upsert.
 *
 * CUATRO RONDAS POR INTENTO, una de cada tipo, al azar entre sus dos, en
 * orden barajado (el orden no delata el tipo): cuadra (H4-1 o H4-6),
 * sobrante (H4-2 o H4-4), faltante que se le cobra al encargado (H5-1 o
 * H5-3) y faltante que asume la empresa (H5-2 o H5-4). H4-3 y H4-5 salen.
 * Cada tarjeta trae la regla de la empresa para el caso de que falte plata,
 * en las ocho y condicional (Katsumi, decisión 7): la tarjeta no responde la
 * pregunta 1.
 *
 * Preguntas: 1 ¿falta, cuadra o sobra? · 2 ¿de cuánto es la diferencia? (si
 * no cuadra) · 3 ¿por cuánto sale el reembolso? · 4 ¿a qué cuenta va la
 * diferencia? (si no cuadra). Un intento por pregunta; si falla una, las
 * siguientes se juegan igual con la verdad ya dibujada. 2 + 4 + 4 + 4 = 14.
 *
 * Los ítems: «ronda:pregunta» (h4-2:diferencia, h5-1:cuenta).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { DEBE, HABER, cifra, pesos } from "./contabilidadT4Hacer.js";

export { DEBE, HABER };

export const H4_ID = "t4-el-arqueo-de-rosa";

export const H4 = {
  id: H4_ID,
  nombre: "El arqueo de caja menor",
  objetivo: "Hacer el arqueo de un fondo de caja menor: ver si falta, cuadra o sobra, de cuánto, por cuánto sale el reembolso y a qué cuenta va la diferencia.",
  consigna: "Compara el sobre con el fondo y mira en la regla lo que decides.",
};

export const CUADRA = "cuadra";
export const SOBRA = "sobra";
export const FALTA = "falta";
export const COBRA = "cobra";
export const ASUME = "asume";
export const SUBTEMAS_H4 = {
  [CUADRA]: "Fondo que cuadra",
  [SOBRA]: "Sobrante de caja menor",
  [`${FALTA}:${COBRA}`]: "Faltante de caja menor cobrado al encargado",
  [`${FALTA}:${ASUME}`]: "Faltante de caja menor asumido por la empresa",
};

/* Las preguntas y sus ids (el ítem es «ronda:pregunta»). */
export const ARQUEO = "arqueo";
export const DIFERENCIA = "diferencia";
export const CHEQUE = "cheque";
export const CUENTA = "cuenta";
export const PREGUNTAS_H4 = {
  [ARQUEO]: "¿Qué muestra el arqueo?",
  [DIFERENCIA]: "¿De cuánto es la diferencia?",
  [CHEQUE]: "¿Por cuánto sale el reembolso?",
  [CUENTA]: "¿A qué cuenta va la diferencia?",
};
/* El paso dentro de la ronda (prompt maestro §4.3: «Paso» es para los pasos de un solo caso). N = 2 si cuadra, 4 si no. */
export const rotuloPasoH4 = (n, total) => `Paso ${n} de ${total}`;
/* Las zonas de la pregunta 1, siempre en el orden de la regla. */
export const ZONAS_H4 = [[FALTA, "Falta"], [CUADRA, "Cuadra"], [SOBRA, "Sobra"]];

/* Las cuatro cuentas de la pregunta 4, en renglones fijos (Hanayama §4). */
export const CXC = "cxc-empleados";
export const GNO = "gno-faltante";
export const INO = "ino-sobrante";
export const CM = "caja-menor";
export const CUENTAS_H4 = [
  { id: CXC, renglones: ["Cuentas por", "cobrar", "– empleados"] },
  { id: GNO, renglones: ["Gastos no", "operacionales", "– faltante de", "caja menor"] },
  { id: INO, renglones: ["Ingresos no", "operacionales", "– sobrante de", "caja menor"] },
  { id: CM, renglones: ["Caja menor"] },
];
export const NOMBRE_CUENTA_H4 = {
  [CXC]: "Cuentas por cobrar – empleados",
  [GNO]: "Gastos no operacionales – faltante de caja menor",
  [INO]: "Ingresos no operacionales – sobrante de caja menor",
  [CM]: "Caja menor",
};
/* Los renglones de la cuenta de la diferencia en el asiento del reembolso. */
export const RENGLONES_ASIENTO_H4 = {
  [CXC]: ["Cuentas por cobrar", "– empleados"],
  [GNO]: ["Gastos no operacionales", "– faltante de caja menor"],
  [INO]: ["Ingresos no operacionales", "– sobrante de caja menor"],
};

/* Interfaz (Katsumi). */
/* Sin «Comprobar»: la pregunta 4 califica al tocar la mitad (P2 de Hanayama, §5.2). Dentro de la ronda, «Siguiente paso» (sigue al rótulo «Paso n de N»); entre rondas, «Siguiente ronda» (sigue al contador «Ronda n de 4»). */
export const BOTON_H4 = { siguientePaso: "Siguiente paso", siguienteRonda: "Siguiente ronda", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const SOBRE_H4 = { gastos: "Soportes de gastos", caja: "En la caja" };
export const REGLA_H4 = {
  fondo: "fondo", suman: "suman", sumanFuera: "suman, fuera de la regla", tuDiferencia: "tu diferencia", era: "era",
  tuCheque: "caja + tu cheque", chequeCorrecto: "con el cheque correcto", falta: "falta", sobra: "sobra", escala: "cada marca: 2.000",
};
export const ASIENTO_H4 = { debe: "DEBE", haber: "HABER", gastos: "Gastos generales", bancos: "Bancos" };
export const resumenH4 = (bien) => `${bien} de 14 respuestas al primer intento.`;
export const ALT_FIGURA_H4 = "El sobre del arqueo y una regla alrededor del fondo, donde se dibujan la suma, la diferencia y el cheque.";
export const CIERRE_H4 = {
  texto: "Si el arqueo cuadra, el cheque repone lo gastado. Si sobra plata, sale por menos, y la diferencia es un ingreso. Si falta, sale por más, y la diferencia la paga el encargado o la asume la empresa.",
  pie: "Basado en el libro, pp. 182-186. Cifras construidas",
};

/* La regla del fondo: ±10.000 alrededor del fondo, una muesca cada 2.000 (Hanayama §4). */
export const RANGO_H4 = 10_000;

/* ═══════════ LAS RONDAS ═══════════ */

/*
 * Una ronda: las cifras construidas de Katsumi. Lo demás SE CALCULA: la suma,
 * la diferencia, el tipo, el cheque y las opciones equivocadas (las del
 * paquete: «fondo − gastos» y «la suma» en la 2; «gastos» y «gastos ±
 * diferencia» en la 3, o «el fondo» y «la caja» si cuadra).
 */
function ronda(id, titulo, encargado, fondo, gastos, caja, politica) {
  const suma = gastos + caja;
  const dif = Math.abs(fondo - suma);
  const tipo = suma === fondo ? CUADRA : suma > fondo ? SOBRA : FALTA;
  const cheque = gastos + (fondo - suma);
  const regla = politica === COBRA ? "Si falta plata, se la cobran." : "Si falta plata, la empresa la asume.";
  const r = {
    id, titulo, encargado, fondo, gastos, caja, suma, dif, tipo, cheque, politica,
    subtema: SUBTEMAS_H4[tipo === FALTA ? `${FALTA}:${politica}` : tipo],
    tarjeta: `Fondo de ${pesos(fondo)}. ${regla}`,
  };
  const P = [];
  if (tipo === CUADRA) {
    r.pagina = "Basado en el libro, pp. 182-184. Cifras construidas";
    P.push({ id: ARQUEO, correcta: CUADRA, opciones: ZONAS_H4.map((z) => z[0]),
      acierto: `${pesos(gastos)} más ${pesos(caja)} dan ${pesos(fondo)}, justo el fondo.`,
      errores: { [SOBRA]: `Suma los dos: dan ${pesos(fondo)}, justo el fondo. No sobra nada.`, [FALTA]: `Suma los dos: dan ${pesos(fondo)}, justo el fondo. No falta nada.` } });
    P.push({ id: CHEQUE, correcta: gastos, opciones: [gastos, fondo, caja],
      acierto: `Si el arqueo cuadra, el cheque repone justo lo gastado: ${pesos(gastos)}.`,
      errores: { [fondo]: `El cheque no repone el fondo entero, porque en la caja quedan ${pesos(caja)}. Repone lo gastado: ${pesos(gastos)}.`, [caja]: `Eso es lo que queda en la caja. El cheque repone lo que se gastó: ${pesos(gastos)}.` } });
  } else {
    const mas = tipo === SOBRA;
    P.push({ id: ARQUEO, correcta: tipo, opciones: ZONAS_H4.map((z) => z[0]),
      acierto: `${pesos(gastos)} más ${pesos(caja)} dan ${pesos(suma)}: ${mas ? "más" : "menos"} que el fondo de ${pesos(fondo)}.`,
      errores: {
        [mas ? FALTA : SOBRA]: `Al revés: la suma da ${pesos(suma)}, ${mas ? "más" : "menos"} que el fondo. ${mas ? "Sobra" : "Falta"} plata.`,
        [CUADRA]: `La suma da ${pesos(suma)}, y el fondo es de ${pesos(fondo)}. No da exacto: ${mas ? "sobra" : "falta"} plata.`,
      } });
    P.push({ id: DIFERENCIA, correcta: dif, opciones: [dif, fondo - gastos, suma],
      acierto: mas ? `${pesos(suma)} menos ${pesos(fondo)} da ${pesos(dif)}.` : `${pesos(fondo)} menos ${pesos(suma)} da ${pesos(dif)}.`,
      errores: {
        [fondo - gastos]: `Eso es lo que debería quedar en la caja: el fondo menos los gastos. La diferencia compara la suma con el fondo: ${pesos(dif)}.`,
        [suma]: `Esa es la suma de gastos y caja. La diferencia es cuánto se aleja esa suma del fondo: ${pesos(dif)}.`,
      } });
    if (mas) {
      r.pagina = "Basado en el libro, pp. 183 y 185. Cifras construidas";
      P.push({ id: CHEQUE, correcta: cheque, opciones: [cheque, gastos, gastos + dif],
        acierto: `Los ${pesos(dif)} de más ya están en la caja, así que el cheque sale por menos de lo gastado: ${pesos(cheque)}.`,
        errores: {
          [gastos]: `Ese es el total de los gastos. Con un sobrante de caja menor, el cheque sale por menos: ${pesos(cheque)}.`,
          [gastos + dif]: `Eso suma la diferencia en vez de restarla. La plata de más ya está en la caja: el cheque es de ${pesos(cheque)}.`,
        } });
      P.push({ id: CUENTA, correcta: { cuenta: INO, lado: HABER },
        acierto: "El sobrante de caja menor es un ingreso no operacional, y un ingreso va al haber. El asiento lleva los gastos al debe y el cheque a Bancos.",
        errores: {
          [CM]: "Pensaste que la plata de más vuelve al fondo, pero Caja menor no se mueve en el reembolso. Es un ingreso.",
          [CXC]: "Nadie le debe nada a la empresa: aquí no falta plata, sobra. El sobrante de caja menor es un ingreso.",
          [GNO]: "Esa cuenta es para cuando falta plata. Aquí sobra, y el sobrante de caja menor es un ingreso.",
          lado: "La cuenta es esa, pero la pusiste con los gastos. Un ingreso va al haber.",
        } });
    } else {
      r.pagina = "Basado en el libro, pp. 183, 185 y 186. Cifras construidas";
      P.push({ id: CHEQUE, correcta: cheque, opciones: [cheque, gastos, gastos - dif],
        acierto: `El cheque repone los gastos y los ${pesos(dif)} que faltan: ${pesos(cheque)}.`,
        errores: {
          [gastos]: `El cheque no es solo lo gastado. También repone los ${pesos(dif)} que faltan: ${pesos(cheque)}.`,
          [gastos - dif]: `Falta plata, así que el cheque sale por más de lo gastado, no por menos: ${pesos(cheque)}.`,
        } });
      const comun = {
        [CM]: "Pensaste que lo que falta se descuenta del fondo, pero Caja menor no se mueve en el reembolso. Mira la p. 186.",
        [INO]: `Esa cuenta es para cuando sobra plata. Aquí falta: la suma da ${pesos(suma)}, menos que el fondo.`,
        lado: "La cuenta es esa, pero la pusiste con el cheque, al haber. Va al debe, junto a los gastos.",
      };
      if (politica === COBRA) {
        P.push({ id: CUENTA, correcta: { cuenta: CXC, lado: DEBE },
          acierto: `Se la cobran a ${encargado}, así que le queda debiendo ${pesos(dif)} a la empresa: Cuentas por cobrar – empleados, al debe.`,
          errores: { ...comun, [GNO]: `Esa sería si la empresa asumiera la pérdida. Aquí se la cobran a ${encargado}: le queda debiendo ${pesos(dif)}.` } });
      } else {
        P.push({ id: CUENTA, correcta: { cuenta: GNO, lado: DEBE },
          acierto: `La empresa asume la pérdida, y una pérdida es un gasto. Los ${pesos(dif)} van al debe, en la cuenta del faltante de caja menor.`,
          errores: { ...comun, [CXC]: `Esa sería si se la cobraran a ${encargado}. Aquí la empresa asume la pérdida, y una pérdida es un gasto.` } });
      }
    }
  }
  r.preguntas = P.map((p, k) => ({ ...p, n: k + 1, pregunta: PREGUNTAS_H4[p.id] }));
  return r;
}

/* Las ocho rondas de Katsumi (H4-3 y H4-5 salen, corte de Yujiro). Cifras construidas. */
export const RONDAS_H4 = [
  ronda("h4-1", "Rosa · Sus Servicios, junio", "Rosa", 500_000, 463_750, 36_250, ASUME),
  ronda("h4-6", "Rosa · Sus Servicios, noviembre", "Rosa", 500_000, 287_450, 212_550, COBRA),
  ronda("h4-2", "Rosa · Sus Servicios, julio", "Rosa", 500_000, 391_800, 112_500, COBRA),
  ronda("h4-4", "Rosa · Sus Servicios, septiembre", "Rosa", 500_000, 456_300, 45_200, ASUME),
  ronda("h5-1", "Julián · Ferretería La Tuerca", "Julián", 400_000, 352_800, 41_700, COBRA),
  ronda("h5-3", "Camilo · Panadería El Trigal", "Camilo", 250_000, 197_300, 48_900, COBRA),
  ronda("h5-2", "Marta · Agencia Rumbo", "Marta", 600_000, 518_450, 77_350, ASUME),
  ronda("h5-4", "Diana · Taller Rueda Libre", "Diana", 500_000, 431_600, 59_400, ASUME),
];
/* El sorteo: una de cada par. */
export const PARES_H4 = [["h4-1", "h4-6"], ["h4-2", "h4-4"], ["h5-1", "h5-3"], ["h5-2", "h5-4"]];

/* ═══════════ «ASÍ SE JUEGA» ═══════════ */

export const PASOS_H4 = ["Suma soportes y caja.", "¿Falta, cuadra o sobra?", "Luego, la diferencia y el reembolso."];
export const ALT_H4 = "Los soportes y la caja suman $322.700, más que el fondo de $320.000. Sobra plata, así que la aguja queda a la derecha de la marca del fondo.";
/* Ronda construida, fuera del banco (vivero, 320.000): solo la pregunta 1; la mano toca «Sobra». */
const DEMO = ronda("demo", "Iván · un vivero", "Iván", 320_000, 268_400, 54_300, ASUME);
export const EJEMPLO_H4 = { ...DEMO, preguntas: DEMO.preguntas.slice(0, 1) };

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/*
 * Cuatro rondas por intento: una de cada par, en orden barajado. Las
 * opciones de las preguntas 2 y 3 se barajan por ronda; las zonas de la 1 van
 * siempre en el orden de la regla.
 */
export function sortearH4(barajar, azar = Math.random) {
  const una = ([a, b]) => { const id = azar() < 0.5 ? a : b; return RONDAS_H4.find((r) => r.id === id); };
  return barajar(PARES_H4.map(una)).map((r) => ({
    ...r,
    preguntas: r.preguntas.map((p) => (p.id === DIFERENCIA || p.id === CHEQUE ? { ...p, opciones: barajar(p.opciones) } : p)),
  }));
}

/* Una pregunta de opción (1, 2 y 3): acierto o el error de esa opción. */
export function evaluarH4(p, elegida) {
  const ok = elegida === p.correcta;
  return { ok, texto: ok ? p.acierto : p.errores[elegida] ?? null };
}
/* La pregunta 4: la cuenta y su lado. La cuenta buena en el lado contrario tiene su mensaje («lado»). */
export function evaluarCuentaH4(p, cuenta, lado) {
  const ok = cuenta === p.correcta.cuenta && lado === p.correcta.lado;
  if (ok) return { ok, texto: p.acierto };
  return { ok, texto: cuenta === p.correcta.cuenta ? p.errores.lado : p.errores[cuenta] ?? null };
}

/* La desviación del fondo con la que se dibuja algo en la regla, y su posición (en % del ancho). */
export const desvio = (r, valor) => valor - r.fondo;
export const xDeH4 = (desv) => Math.max(2, Math.min(98, 50 + (desv / RANGO_H4) * 46));
export const fueraH4 = (desv) => Math.abs(desv) > RANGO_H4;

/* Evaluativa: el motor escala los 50 FP con este porcentaje (preguntas acertadas de las 14). */
export const puntuarH4 = (aciertos, cuantas) => (cuantas ? (aciertos / cuantas) * 100 : 0);

/* Para el panel docente: el ítem es «ronda:pregunta». Las rondas que salieron (h4-3, h4-5) se siguen leyendo. */
export const itemH4 = (rondaId, preguntaId) => `${rondaId}:${preguntaId}`;
const RONDAS_ANTERIORES = { "h4-3": "Rosa · Sus Servicios, agosto", "h4-5": "Rosa · Sus Servicios, octubre" };
const PREGUNTA_ANTERIOR = { [ARQUEO]: PREGUNTAS_H4[ARQUEO], [DIFERENCIA]: PREGUNTAS_H4[DIFERENCIA], [CHEQUE]: "¿Por cuánto sale el cheque del reembolso?" };
export function preguntaDeItemH4(item) {
  const [rid, pid] = String(item).split(":");
  const r = RONDAS_H4.find((x) => x.id === rid);
  if (r) { const p = r.preguntas.find((x) => x.id === pid); return p ? `${r.titulo} · ${p.pregunta}` : null; }
  return RONDAS_ANTERIORES[rid] && PREGUNTA_ANTERIOR[pid] ? `${RONDAS_ANTERIORES[rid]} · ${PREGUNTA_ANTERIOR[pid]}` : null;
}

export { cifra, pesos };
