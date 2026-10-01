import { DEBE, HABER, CRECE_POR, efectoDe } from "../data/contabilidad.js";
import {
  ORDEN_DEL_LIBRO, NOMBRE_EN_EL_CUADRO, ACIERTO_POR_FAMILIA,
  PATRON_POR_FAMILIA, ERRORES,
} from "../data/contabilidadCuadro.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A3 · EL CUADRO DE DINÁMICAS — la aritmética.
 *
 * Doce celdas, y ninguna escrita. Todas salen de efectoDe, que es la regla
 * del capítulo: si un registro en ese lado AUMENTA la cuenta, la celda dice
 * «+»; si la disminuye, «−». Las dos columnas salen de la MISMA función, y por
 * eso el espejo que el estudiante ve al acertar no es un efecto: es que no hay
 * manera de que las dos columnas digan lo mismo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El menos es el signo matemático U+2212, no el guion del teclado. */
export const MAS = "+";
export const MENOS = "−";

/** Qué signo lleva la celda de ese lado, para esa familia. */
export const signoDe = (tipo, lado) => (efectoDe(tipo, lado) === "aumenta" ? MAS : MENOS);

export const SIGNOS = [MAS, MENOS];

/** Las seis filas, en el orden del libro. */
export const FILAS = ORDEN_DEL_LIBRO.map((tipo) => ({
  id: `cu3-fila-${tipo}`,
  tipo,
  nombre: NOMBRE_EN_EL_CUADRO[tipo],
  debito: signoDe(tipo, DEBE),
  credito: signoDe(tipo, HABER),
  /* Por dónde crece: es el ▲, y por eso NO se muestra hasta haber respondido. */
  creceP: CRECE_POR[tipo],
  acierto: ACIERTO_POR_FAMILIA[tipo],
}));

/*
 * ═══════════ LA FILA BASE ═══════════
 *
 * En la actividad, la fila de Activos ya viene resuelta (+ en el debe, − en
 * el haber) y no se puede cambiar: es la regla de la que salen las otras
 * cinco. El estudiante resuelve esas cinco y el puntaje se calcula sobre
 * ellas. La demo de «Así se juega» sí resuelve la de Activos. Pedido de Levi.
 */
export const FILA_BASE = ORDEN_DEL_LIBRO[0];

/** Las filas que el estudiante resuelve: todas menos la base. */
export const FILAS_A_RESOLVER = FILAS.filter((f) => f.tipo !== FILA_BASE);

/*
 * ═══════════ LA LECCIÓN, QUE ES UN filter ═══════════
 *
 * Los dos bloques del final no son una lista escrita a mano: son las filas
 * preguntándole a la regla por dónde crecen. Si alguien cambiara CRECE_POR, el
 * cuadro se reagruparía solo — que es exactamente lo que debe pasar, porque el
 * cuadro no es más que esa regla dibujada.
 */
export const BLOQUES = [DEBE, HABER].map((lado) => ({
  lado,
  filas: FILAS.filter((f) => f.creceP === lado),
}));

/** Las seis filas ya reordenadas: primero las del debe, después las del haber. */
export const FILAS_AGRUPADAS = BLOQUES.flatMap((b) => b.filas);

/*
 * La devolución. El acierto es la regla de ESA fila; el error, la confusión
 * que corresponde a esa familia, con lo que se ve debajo del cuadro mientras
 * dura.
 */
export function evaluarCelda(fila, signo) {
  if (signo === fila.debito) return { ok: true, texto: fila.acierto, patron: null, escena: null };
  const patron = PATRON_POR_FAMILIA[fila.tipo];
  const e = ERRORES[patron];
  if (!e) throw new Error(`no hay devolución para la familia «${fila.tipo}»`);
  return {
    ok: false,
    texto: e.texto,
    patron,
    escena: e.escena,
    /* El patrón C resalta el término de la fila fallada; los demás, el suyo. */
    resaltar: e.resaltar ?? fila.tipo,
    flechaAbajo: e.flechaAbajo ?? false,
  };
}

/* El reintento vale la mitad, como en el resto del tema. */
export const VALOR_SEGUNDO = 0.5;

export function puntuar(respuestas, cuantas = FILAS.length) {
  if (!cuantas) return 0;
  const suma = respuestas.reduce((s, r) => {
    if (r.primeroOk) return s + 1;
    if (r.segundoOk) return s + VALOR_SEGUNDO;
    return s;
  }, 0);
  return (suma / cuantas) * 100;
}

export const pesoDeCadaFila = (cuantas = FILAS.length) => (cuantas ? 100 / cuantas : 0);
