/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A3 «El arqueo» COMO SLIDES (Célula D).
 *
 * Contenido: la tabla de A3 del hilo de Katsumi (8 pantallas), sus textos
 * NUEVO de la pantalla 1, el texto literal de la p2 y el porqué del segundo
 * error del lote 4 (orquestador/revisiones/t4-slides/hilo-katsumi.md). Lo
 * demás (aciertos, errores, cifras, cuentas y el caso B) sale de los datos
 * ya aprobados de A3 (contabilidadT4A3.js, paquete d4-t4-a3-v4-rediseno.md).
 * Forma: diseno-hanayama.md §3, A3.
 *
 * Lo que una pantalla dice, por lugar:
 *   titular   la idea arriba (en la 1, el objetivo D2 de la pieza: §16 b)
 *   antes     la banda antes de responder
 *   acierto   la banda al resolver la pantalla bien
 *   errores   la banda tras un error, por opción elegida
 *   porque    la banda tras el segundo error (C2, lote 4)
 *   cierre    en el Cierre: la frase, «Siguiente: «X».» y el pie
 *
 * D8: el caso B usa las mismas plantillas con sus cifras (fondo 600.000,
 * gastado 524.300, quedan 75.700; sobran 2.800 y faltan 5.300) y su persona:
 * Marta en vez de Rosa, Taller Ríos en vez de Sus Servicios.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { DEBE, HABER, pieCasoB } from "./contabilidadT4.js";
import { A3_ID, CUENTAS_A3, DATOS_A3, PIEZA_EL_ARQUEO } from "./contabilidadT4A3.js";

export { A3_ID, CUENTAS_A3, DATOS_A3, DEBE, HABER };

/* La cifra con puntos de miles, como `cifra` de t4/comun.jsx. */
export const cifra = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pesos = (n) => `$${cifra(n)}`;

/* Los rótulos de la regla compacta (§3, A3: «sobra $2.100», «falta $X», «cuadra»; los extremos y «fondo», de la regla de H4). */
export const REGLA_A3 = { sobra: "sobra", falta: "falta", cuadra: "cuadra", fondo: "fondo" };

/* La persona del caso, para las plantillas del lote 4. */
export const PERSONA_A3 = { 1: "Rosa", 2: "Marta" };

const OPCIONES_ZONA = (F) => ["falta", "cuadra", "sobra"].map((id) => ({ id, texto: F.chips[id] }));

function slidesA3(caso) {
  const D = DATOS_A3[caso];
  const F = D.F;
  const pieza = caso === 2 ? PIEZA_EL_ARQUEO.casoB : PIEZA_EL_ARQUEO;
  const P = Object.fromEntries(pieza.pantallas.map((p) => [p.id, p]));
  const persona = PERSONA_A3[caso];
  const queda = D.FONDO - D.GASTADO;
  const sumaSobra = D.GASTADO + D.EFECTIVO_SOBRANTE;
  const cheques = (p) => p.opciones.map((v) => ({ id: String(v), texto: cifra(v) }));
  const errCheque = (p) => Object.fromEntries(Object.entries(p.errores).map(([k, v]) => [String(k), v]));
  return {
    contar: {
      titular: PIEZA_EL_ARQUEO.objetivo,
      antes: ["Toca «Contar la caja». ¿Qué muestra el arqueo?"],
      caja: queda,
      opciones: OPCIONES_ZONA(F),
      correcta: "cuadra",
      acierto: P.contar.despuesConAccion.map((x) => x.texto),
      errores: {
        falta: `Para faltar, la suma tendría que quedar bajo ${pesos(D.FONDO)}.`,
        sobra: `Para sobrar, la suma tendría que pasar de ${pesos(D.FONDO)}.`,
      },
      porque: `Cuadra. Soportes por ${pesos(D.GASTADO)} más ${pesos(queda)} en caja dan ${pesos(D.FONDO)}, justo el fondo.`,
    },
    mover: {
      titular: "Mueve la plata de la caja.",
      antes: ["Si la suma pasa del fondo, sobra; si no llega, falta."],
      control: D.CONTROL_A3,
    },
    sobrante: {
      titular: "¿Qué muestra el arqueo?",
      antes: [P["el-sobrante"].antes[0].replace(" ¿Qué muestra el arqueo?", "")],
      caja: D.EFECTIVO_SOBRANTE,
      opciones: OPCIONES_ZONA(F),
      correcta: "sobra",
      acierto: [P["el-sobrante"].acierto],
      errores: P["el-sobrante"].errores,
      porque: `Sobra. ${pesos(D.GASTADO)} más ${pesos(D.EFECTIVO_SOBRANTE)} dan ${pesos(sumaSobra)}: la suma pasa del fondo por ${pesos(D.SOBRANTE)}.`,
    },
    chequeSobra: {
      titular: P["el-cheque"].antes[0],
      antes: [],
      caja: D.EFECTIVO_SOBRANTE,
      opciones: cheques(P["el-cheque"]),
      correcta: String(P["el-cheque"].correcta),
      acierto: [P["el-cheque"].acierto],
      errores: errCheque(P["el-cheque"]),
      porque: `Sale por ${pesos(D.CHEQUE_SOBRANTE)}. Los ${pesos(D.SOBRANTE)} que sobran ya están en la caja, así que el cheque repone lo gastado menos eso.`,
    },
    asientoSobra: {
      titular: P["el-asiento"].antes[0],
      antes: [],
      rotulo: F.asiento,
      cuentas: P["el-asiento"].cuentas,
      ancha: P["el-asiento"].va.id,
      monto: P["el-asiento"].monto,
      base: P["el-asiento"].base,
      va: P["el-asiento"].va,
      acierto: [P["el-asiento"].acierto],
      errores: P["el-asiento"].errores,
      porque: "Al haber de Ingresos no operacionales – sobrante de caja menor. Es un ingreso, y un ingreso sube por el haber.",
    },
    chequeFalta: {
      titular: P["el-faltante"].antes[0],
      antes: [],
      caja: D.EFECTIVO_FALTANTE,
      opciones: cheques(P["el-faltante"]),
      correcta: String(P["el-faltante"].correcta),
      acierto: [P["el-faltante"].acierto],
      errores: errCheque(P["el-faltante"]),
      porque: `Sale por ${pesos(D.CHEQUE_FALTANTE)}. El cheque repone lo gastado y también los ${pesos(D.FALTANTE)} que faltan en la caja.`,
    },
    asientoFalta: {
      titular: P["camino-1"].antes[0],
      antes: [],
      rotulo: F.asiento,
      cuentas: P["camino-1"].cuentas,
      ancha: P["camino-1"].cuentas[1],
      monto: P["camino-1"].monto,
      base: P["camino-1"].base,
      va: P["camino-1"].va,
      acierto: [P["camino-1"].acierto],
      errores: P["camino-1"].errores,
      porque: `Al debe de Cuentas por cobrar – empleados. ${persona} le queda debiendo a la empresa, y una cuenta por cobrar sube por el debe.`,
    },
    caminos: {
      titular: "Quién paga lo decide la empresa",
      cierre: P["dos-caminos"].cierre,
      siguiente: P["dos-caminos"].siguiente,
      pie: caso === 2 ? pieCasoB("Basado en el libro, pp. 182-186") : "Basado en el libro, pp. 182-186",
      caminos: F.caminos,
    },
  };
}

export const SLIDES_A3 = { 1: slidesA3(1), 2: slidesA3(2) };
