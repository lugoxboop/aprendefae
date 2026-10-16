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
import t51 from "./conta-t5-1-que-renta-da-este-titulo.svg?raw";
import t52 from "./conta-t5-2-el-cierre-completo-de-santa-pacha.svg?raw";
import t61 from "./conta-t6-1-clientes-o-otra-cuenta-por-cobrar.svg?raw";
import t62 from "./conta-t6-2-la-provision-de-el-torito.svg?raw";
import t63 from "./conta-t6-3-cuando-la-deuda-castigada-vuelve.svg?raw";
import r51 from "./conta-r5-1-repaso-cruzado.svg?raw";
import r52 from "./conta-r5-2-el-toro-negro.svg?raw";
import r54 from "./conta-r5-4-septiembre-en-barranquilla.svg?raw";
import r55 from "./conta-r5-5-septiembre-en-permanente.svg?raw";
import t4ec from "./conta-t4-entra-o-sale-de-caja.svg?raw";
/* Los cinco de T5 sin número propio en el nombre: su id tampoco lo tiene. */
import t5tl from "./conta-t5-temporal-o-largo-plazo.svg?raw";
import t5rf from "./conta-t5-revision-que-falta.svg?raw";
import t5ip from "./conta-t5-el-interes-del-periodo.svg?raw";
import t5gp from "./conta-t5-gano-o-perdio.svg?raw";
import t5cv from "./conta-t5-a-que-cuenta-va.svg?raw";
import t64 from "./conta-t6-4-que-se-debita.svg?raw";
import t66 from "./conta-t6-6-provision-por-edades.svg?raw";
import r53 from "./conta-r5-3-marzo-en-comercializadora-mate.svg?raw";

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
export const QueRentaDaEsteTitulo = icono("QueRentaDaEsteTitulo", t51);
export const ElCierreCompletoDeSantaPacha = icono("ElCierreCompletoDeSantaPacha", t52);
export const ClientesOOtraCuentaPorCobrar = icono("ClientesOOtraCuentaPorCobrar", t61);
export const LaProvisionDeElTorito = icono("LaProvisionDeElTorito", t62);
export const CuandoLaDeudaCastigadaVuelve = icono("CuandoLaDeudaCastigadaVuelve", t63);
export const RepasoCruzado = icono("RepasoCruzado", r51);

/*
 * r5-2 «El Toro Negro» · provisión, castigo y recuperación de UNA misma
 * deuda. El ciclo lo dice la flecha que da la vuelta entera y vuelve a
 * empezar; que sea el MISMO dinero el que da esa vuelta lo dice el peso
 * quieto en el centro. No es un toro: el nombre es de la empresa del caso, y
 * un toro no le enseñaría nada a nadie.
 */
export const ElToroNegro = icono("ElToroNegro", r52);

/*
 * r5-4 «Septiembre en Barranquilla» · diez asientos de un mes que termina
 * CUADRANDO dos registros: el de la empresa y el del banco. Eso dibuja: dos
 * libros, cada uno con sus renglones, y entre ellos el signo de igual. No
 * dibuja Barranquilla ni un mes: el nombre es del caso, y una palmera no le
 * enseñaría nada a nadie.
 *
 * No repite a «Cierra el mes» (una bandera) ni a «Qué control falta».
 */
export const SeptiembreEnBarranquilla = icono("SeptiembreEnBarranquilla", r54);

/*
 * r5-5 «Septiembre en permanente» · el MISMO septiembre llevado en kárdex: el
 * saldo se recalcula renglón por renglón y el costo final no es el que da el
 * periódico. Eso dibuja: la tarjeta del kárdex con su encabezado, los
 * renglones que se van llenando, y la línea del saldo subiendo por escalones
 * —uno por renglón—.
 *
 * No repite a «Llena el kárdex» (un cajón que se llena) ni a «Periódico o
 * permanente» (un interruptor): aquí lo que se enseña es que el saldo se mueve
 * con cada renglón.
 */
export const SeptiembreEnPermanente = icono("SeptiembreEnPermanente", r55);

/* Las nueve que esperaban su dibujo (16 de octubre): T4 H1, los cinco de T5,
   dos de T6 y r5-3. Mismo estilo de la casa: 24, trazo de 2, currentColor. */
export const EntraOSaleDeCajaIcono = icono("EntraOSaleDeCajaIcono", t4ec);
export const TemporalOLargoPlazo = icono("TemporalOLargoPlazo", t5tl);
export const QueRevisionFalta = icono("QueRevisionFalta", t5rf);
export const ElInteresDelPeriodo = icono("ElInteresDelPeriodo", t5ip);
export const GanoOPerdio = icono("GanoOPerdio", t5gp);
export const AQueCuentaVa = icono("AQueCuentaVa", t5cv);
export const QueSeDebita = icono("QueSeDebita", t64);
export const ProvisionPorEdades = icono("ProvisionPorEdades", t66);
export const MarzoEnComercializadoraMate = icono("MarzoEnComercializadoraMate", r53);
