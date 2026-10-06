import { createElement } from "react";
import t11 from "./conta-t1-1-desde-donde-preguntan.svg?raw";
import t12 from "./conta-t1-2-que-entro-y-que-salio.svg?raw";
import t14 from "./conta-t1-4-que-le-pasa-a-cada-uno.svg?raw";
import t15 from "./conta-t1-5-la-ecuacion-en-movimiento.svg?raw";
import t16 from "./conta-t1-6-en-cual-estado-aparece.svg?raw";
import t17 from "./conta-t1-7-la-articulacion.svg?raw";
import t18 from "./conta-t1-8-donde-se-rompio.svg?raw";
import t21 from "./conta-t2-1-izquierda-o-derecha.svg?raw";
import t22 from "./conta-t2-2-de-que-familia-es.svg?raw";
import t23 from "./conta-t2-3-el-cuadro-de-dinamicas.svg?raw";
import t24 from "./conta-t2-4-debe-o-haber.svg?raw";
import t25 from "./conta-t2-5-el-saldo-de-la-cuenta.svg?raw";
import t26 from "./conta-t2-6-arma-el-asiento.svg?raw";
import t27 from "./conta-t2-7-el-asiento-compuesto.svg?raw";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ÍCONOS DE ACTIVIDAD DE CONTABILIDAD.
 *
 * Los .svg de esta carpeta son los archivos de Xeno, byte a byte: no se
 * retocan aquí. Este módulo los lee como texto y los pinta EN LÍNEA, como
 * elementos SVG de React —no como <img>, que no hereda currentColor—, con los
 * mismos elementos y los mismos atributos. Solo cambian dos cosas, que no son
 * de dibujo:
 *
 *   · width y height: el tamaño del sitio donde va (nodo o ventana previa);
 *     el viewBox de 24 no cambia, así que el dibujo escala entero.
 *   · aria-hidden="true" y focusable="false": siempre va junto al título de
 *     la actividad, que es su nombre accesible.
 *
 * Sin rellenos, opacidad ni colores: el trazo es currentColor y el color lo
 * pone quien lo pinta, según el estado del nodo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ATRIBUTO = /([a-zA-Z:-]+)="([^"]*)"/g;
const PIEZA = /<(path|rect|circle)\s([^>]*?)\/>/g;

const atributos = (texto) => Object.fromEntries([...texto.matchAll(ATRIBUTO)].map((m) => [m[1], m[2]]));
/* stroke-width → strokeWidth: los nombres que React espera. */
const aReact = (attrs) => Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k.replace(/-([a-z])/g, (_, l) => l.toUpperCase()), v]));

/** El .svg de Xeno, desarmado: los atributos de la raíz y sus piezas en orden. */
export function leerSvg(texto) {
  const raiz = texto.match(/<svg\s([^>]*)>/);
  return {
    raiz: raiz ? atributos(raiz[1]) : {},
    piezas: [...texto.matchAll(PIEZA)].map((m) => [m[1], atributos(m[2])]),
  };
}

function icono(nombre, texto) {
  const { raiz, piezas } = leerSvg(texto);
  const Icono = ({ size = 24 }) => createElement(
    "svg",
    { ...aReact(raiz), width: size, height: size, "aria-hidden": "true", focusable: "false" },
    piezas.map(([tag, attrs], i) => createElement(tag, { key: i, ...aReact(attrs) })),
  );
  Icono.displayName = nombre;
  Icono.svg = texto;
  return Icono;
}

export const DesdeDondePreguntan = icono("DesdeDondePreguntan", t11);
export const QueEntroYQueSalio = icono("QueEntroYQueSalio", t12);
export const QueLePasaACadaUno = icono("QueLePasaACadaUno", t14);
export const LaEcuacionEnMovimiento = icono("LaEcuacionEnMovimiento", t15);
export const EnCualEstadoAparece = icono("EnCualEstadoAparece", t16);
export const LaArticulacion = icono("LaArticulacion", t17);
export const DondeSeRompio = icono("DondeSeRompio", t18);
export const IzquierdaODerecha = icono("IzquierdaODerecha", t21);
export const DeQueFamiliaEs = icono("DeQueFamiliaEs", t22);
export const CuadroDeDinamicas = icono("CuadroDeDinamicas", t23);
export const SeDebitaOSeAcredita = icono("SeDebitaOSeAcredita", t24);
export const ElSaldoDeLaCuenta = icono("ElSaldoDeLaCuenta", t25);
export const ArmaElAsiento = icono("ArmaElAsiento", t26);
export const ElAsientoCompuesto = icono("ElAsientoCompuesto", t27);
