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
import t31 from "./conta-t3-1-ingreso-o-cobro.svg?raw";
import t32 from "./conta-t3-2-cuando-se-causa.svg?raw";
import t33 from "./conta-t3-3-arma-el-ajuste-acumulado.svg?raw";
import t34 from "./conta-t3-4-arma-el-ajuste-diferido.svg?raw";
import t35 from "./conta-t3-5-el-mismo-hecho-dos-empresas.svg?raw";
import t36 from "./conta-t3-6-que-le-toca-a-este-periodo.svg?raw";
import t37 from "./conta-t3-7-el-cierre-completo.svg?raw";
import t711 from "./conta-t7-1-1-que-cuenta-se-mueve.svg?raw";
import t712 from "./conta-t7-1-2-arma-la-factura.svg?raw";
import t713 from "./conta-t7-1-3-cuanto-vale-lo-que-sobro.svg?raw";
import t714 from "./conta-t7-1-4-cierra-el-mes.svg?raw";
import t715 from "./conta-t7-1-5-costo-o-gasto.svg?raw";
import t716 from "./conta-t7-1-6-la-devolucion-en-dos-libros.svg?raw";
import t717 from "./conta-t7-1-7-que-control-falta.svg?raw";
import t731 from "./conta-t7-3-1-descuento-en-la-factura.svg?raw";
import t732 from "./conta-t7-3-2-la-cadena-de-descuentos.svg?raw";
import t733 from "./conta-t7-3-3-comercial-o-condicionado.svg?raw";
import t734 from "./conta-t7-3-4-pago-a-tiempo.svg?raw";
import t735 from "./conta-t7-3-5-ajuste-por-conteo.svg?raw";
import t736 from "./conta-t7-3-6-entra-al-costo.svg?raw";
import t737 from "./conta-t7-3-7-costo-o-valor-neto-realizable.svg?raw";
import t721 from "./conta-t7-2-1-debe-o-haber.svg?raw";
import t722 from "./conta-t7-2-2-arma-los-dos-asientos.svg?raw";
import t723 from "./conta-t7-2-3-llena-el-kardex.svg?raw";
import t724 from "./conta-t7-2-4-periodico-o-permanente.svg?raw";
import t725 from "./conta-t7-2-5-flete-y-devolucion.svg?raw";

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
export const IngresoOCobro = icono("IngresoOCobro", t31);
export const CuandoSeCausa = icono("CuandoSeCausa", t32);
export const ArmaElAjusteAcumulado = icono("ArmaElAjusteAcumulado", t33);
export const ArmaElAjusteDiferido = icono("ArmaElAjusteDiferido", t34);
export const ElMismoHechoDosEmpresas = icono("ElMismoHechoDosEmpresas", t35);
export const QueLeTocaAEstePeriodo = icono("QueLeTocaAEstePeriodo", t36);
export const ElCierreCompleto = icono("ElCierreCompleto", t37);
export const QueCuentaSeMueve = icono("QueCuentaSeMueve", t711);
export const ArmaLaFactura = icono("ArmaLaFactura", t712);
export const CuantoValeLoQueSobro = icono("CuantoValeLoQueSobro", t713);
export const CierraElMes = icono("CierraElMes", t714);
export const CostoOGasto = icono("CostoOGasto", t715);
export const LaDevolucionEnDosLibros = icono("LaDevolucionEnDosLibros", t716);
export const QueControlFalta = icono("QueControlFalta", t717);
export const DescuentoEnLaFactura = icono("DescuentoEnLaFactura", t731);
export const LaCadenaDeDescuentos = icono("LaCadenaDeDescuentos", t732);
export const ComercialOCondicionado = icono("ComercialOCondicionado", t733);
export const PagoATiempo = icono("PagoATiempo", t734);
export const AjustePorConteo = icono("AjustePorConteo", t735);
export const EntraAlCosto = icono("EntraAlCosto", t736);
export const CostoOValorNetoRealizable = icono("CostoOValorNetoRealizable", t737);
export const DebeOHaber = icono("DebeOHaber", t721);
export const ArmaLosDosAsientos = icono("ArmaLosDosAsientos", t722);
export const LlenaElKardex = icono("LlenaElKardex", t723);
export const PeriodicoOPermanente = icono("PeriodicoOPermanente", t724);
export const FleteYDevolucion = icono("FleteYDevolucion", t725);
