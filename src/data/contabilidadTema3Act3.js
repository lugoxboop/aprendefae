/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 3 · «EL MISMO HECHO, DOS EMPRESAS» (Gen y Levi; P2 de Xeno).
 *
 * Paquete aprobado por Levi el 2026-10-13, con el inventario por estado.
 * Todos los textos son literales de ese paquete. Aquí solo hay datos: lo que
 * se evalúa lo decide contabilidad/mismoHecho.js.
 *
 * Análisis, 50 FP. Va en el camino de Hacer entre «Arma el ajuste diferido» y
 * «¿Qué le toca a este periodo?».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT3_T3 = {
  id: "t3-mismo-hecho",
  nombre: "El mismo hecho, dos empresas",
  consigna: "Lee el hecho. Arma el asiento de las dos empresas.",
};

export const PASOS_ACT3 = ["Lee el hecho: ¿quién recibió y quién entregó?", "Arma el asiento de la primera empresa.", "Arma el de la otra con su propia cara del hecho."];

export const ESTADO_VACIO = "Un hecho, dos contabilidades. Nunca son iguales.";
export const ALT_INICIAL = "Dos libros abiertos, uno por empresa. Cada uno tiene dos casillas vacías, una en el Debe y otra en el Haber. Al tocar una casilla se abren cinco cuentas para elegir.";
export const ALT_ACIERTO = "Ejemplo: el libro de la izquierda queda con el gasto en el debe y la deuda en el haber. El de la derecha, con lo que le deben en el debe y el ingreso en el haber.";
export const CIERRE_ACT3 = "Cuatro hechos y ocho asientos. En ninguno los dos libros dicen lo mismo, porque un hecho siempre tiene dos caras.";

/* ═══════════ LOS TEXTOS DE INTERFAZ (Xeno; Levi) ═══════════ */
export const UI = {
  eligeLaCuenta: "Elige la cuenta",
  completa: "Completa las 4 casillas",
  comprobar: "Comprobar",
  siguientePar: "Siguiente par",
  verResumen: "Ver mi resumen",
  cancelar: "Cancelar",
  /* El dialecto único del estándar: «Correcto» / «No va aquí» / «Iba aquí»
     (los mismos de r5 y T4). Antes decían «Bien» / «Revisa» / «Va:». */
  bien: "Correcto",
  revisa: "No va aquí",
  va: "Iba aquí",
  elegida: "Elegida",
  estaEnElDebe: "Está en el Debe",
  estaEnElHaber: "Está en el Haber",
  correcto: "Correcto",
  monto: "Monto:",
  debe: "Debe",
  haber: "Haber",
};
export const revisaCasillas = (n) => (n === 1 ? "Revisa 1 casilla" : `Revisa ${n} casillas`);
export const lineaDeCasilla = (empresa, lado, cuenta) => `${empresa} · ${lado}: va ${cuenta}.`;

/* ═══════════ LOS ERRORES POR TIPO, EN SU ORDEN DE PRIORIDAD ═══════════ */
export const IGUALES = "A";
export const CAJA_SENUELO = "D";
export const CONTRARIO = "C";
export const LADOS_CAMBIADOS = "B";
export const DEL_PAR = "par";

export const ERRORES_ACT3 = {
  [IGUALES]: "Los dos asientos quedaron iguales. Un hecho tiene dos caras, y la de una empresa nunca es la copia de la otra.",
  [CAJA_SENUELO]: "Esa cuenta no se mueve. Aquí nadie ha pagado ni cobrado todavía, y por eso es un acumulado.",
  [CONTRARIO]: "Esa cuenta no se mueve en este hecho. Pertenece al otro tipo de ajuste, no a este.",
  [LADOS_CAMBIADOS]: "Una de las dos tiene los lados cambiados. El asiento cuadra, pero esa empresa está anotando al revés.",
};

/* ═══════════ LOS CUATRO PARES (tabla de control de Levi) ═══════════ */
/*
 * Cada empresa: su Debe y su Haber correctos, y sus tres señuelos. Dos de
 * los señuelos son las cuentas correctas de la otra empresa; el tercero es
 * propio (`senueloPropio`): la cuenta del tipo de ajuste contrario, o «Caja»
 * en el par 3. Es lo que separa el error C (o D) del error del par.
 */
const empresa = (id, nombre, debe, haber, senuelos, senueloPropio) => ({ id, nombre, debe, haber, senuelos, senueloPropio });

export const PARES_ACT3 = [
  {
    id: "maquina",
    titulo: "La máquina",
    hecho: "San Calixto usó cinco días una máquina de San Miguel, alquilada a $500 diarios. Son $2.500 y todavía no los ha pagado.",
    monto: 2500,
    pie: "Libro, pp. 140 y 142",
    empresas: [
      empresa("san-calixto", "San Calixto", "Gasto alquiler", "Alquiler por pagar",
        ["Servicios por cobrar", "Ingresos por servicios", "Alquiler pagado por anticipado"], "Alquiler pagado por anticipado"),
      empresa("san-miguel", "San Miguel", "Servicios por cobrar", "Ingresos por servicios",
        ["Gasto alquiler", "Alquiler por pagar", "Servicios recibidos por anticipado"], "Servicios recibidos por anticipado"),
    ],
    acierto: "Las dos anotan los mismos $2.500 y ninguna cuenta se repite. San Calixto usó la máquina y le debe; San Miguel se la alquiló y le deben.",
    errorPar: "Revisa los dos asientos juntos. Si San Calixto tiene un gasto, San Miguel no puede tener otro gasto: lo que para uno es gasto, para el otro es ingreso.",
  },
  {
    id: "arriendo",
    titulo: "El arriendo",
    hecho: "San Calixto le pagó a Arriendos de la Costa tres meses de local por anticipado. Al cerrar junio ya usó un mes: $5.000.",
    monto: 5000,
    pie: "Basado en el libro, pp. 143-144 y 146",
    empresas: [
      empresa("san-calixto", "San Calixto", "Gasto arriendos", "Arriendos pagados por anticipado",
        ["Arriendos recibidos por anticipado", "Ingresos por arriendos", "Arriendos por pagar"], "Arriendos por pagar"),
      empresa("arriendos-de-la-costa", "Arriendos de la Costa", "Arriendos recibidos por anticipado", "Ingresos por arriendos",
        ["Gasto arriendos", "Arriendos pagados por anticipado", "Arriendos por cobrar"], "Arriendos por cobrar"),
    ],
    acierto: "Mismo arriendo, dos lecturas. Para San Calixto, lo que ya pagó se va volviendo gasto; para Arriendos de la Costa, lo que ya cobró se va volviendo ingreso.",
    errorPar: "Revisa los dos asientos juntos. Uno pagó por anticipado y el otro cobró por anticipado, así que sus cuentas no pueden ser las mismas.",
  },
  {
    id: "equipos",
    titulo: "Los equipos",
    hecho: "La Gata Caliente tomó en alquiler unos equipos de Home Mark y los usó quince días a $120.000 diarios. Son $1.800.000 y todavía no los ha pagado.",
    monto: 1800000,
    pie: "Basado en el libro, p. 174",
    empresas: [
      empresa("la-gata-caliente", "La Gata Caliente", "Gasto alquiler", "Alquiler por pagar",
        ["Servicios por cobrar", "Ingresos por servicios", "Caja"], "Caja"),
      empresa("home-mark", "Home Mark", "Servicios por cobrar", "Ingresos por servicios",
        ["Gasto alquiler", "Alquiler por pagar", "Caja"], "Caja"),
    ],
    acierto: "Quince días a $120.000 para las dos. La Gata Caliente usó los equipos y aún no paga; Home Mark se los alquiló y aún no cobra.",
    errorPar: "Revisa los dos asientos juntos. La Gata Caliente recibió los equipos y Home Mark los entregó, así que sus asientos son espejo, no copia.",
  },
  {
    id: "servicio",
    titulo: "El servicio anticipado",
    hecho: "La empresa cliente le pagó por anticipado un servicio a Servicios del Caribe. Al cerrar marzo ya se prestaron $120.000 de ese servicio.",
    monto: 120000,
    pie: "Basado en el libro, p. 172",
    empresas: [
      empresa("servicios-del-caribe", "Servicios del Caribe", "Servicios recibidos por anticipado", "Ingresos por servicios",
        ["Gasto servicios contratados", "Servicios pagados por anticipado", "Servicios por cobrar"], "Servicios por cobrar"),
      empresa("la-empresa-cliente", "La empresa cliente", "Gasto servicios contratados", "Servicios pagados por anticipado",
        ["Servicios recibidos por anticipado", "Ingresos por servicios", "Servicios por pagar"], "Servicios por pagar"),
    ],
    acierto: "Los mismos $120.000 del servicio. Servicios del Caribe ya cumplió una parte de lo que le pagaron; la empresa cliente ya consumió una parte de lo que pagó.",
    errorPar: "Revisa los dos asientos juntos. Quien recibió el pago por anticipado debía un servicio; quien pagó tenía un derecho. No pueden coincidir.",
  },
];

/* Los cinco nombres que estrena esta actividad (confirmados por Levi). */
export const CUENTAS_NUEVAS_ACT3 = [
  "Gasto servicios contratados", "Servicios pagados por anticipado", "Arriendos por pagar", "Arriendos por cobrar", "Servicios por pagar",
];

/* ═══════════ EL TUTORIAL: los intereses de la panadería (Gen; Levi) ═══════════ */
/*
 * El paquete no trae señuelos para el ejemplo: cada hoja ofrece las cuatro
 * cuentas del ejemplo (las dos propias y las dos de la otra empresa). No se
 * escribe ningún nombre que no esté en el paquete.
 */
export const EJEMPLO_ACT3 = {
  id: "ejemplo-panaderia",
  titulo: null,
  hecho: "La panadería le debe al Banco Andino $50.000 de intereses del mes y todavía no los paga.",
  monto: 50000,
  pie: null,
  empresas: [
    empresa("panaderia", "Panadería", "Gasto interés", "Intereses por pagar", ["Intereses por cobrar", "Ingresos por intereses"], null),
    empresa("banco-andino", "Banco Andino", "Intereses por cobrar", "Ingresos por intereses", ["Gasto interés", "Intereses por pagar"], null),
  ],
  acierto: "El hecho es uno solo y los dos libros lo anotan al revés. La panadería tiene un gasto y una deuda. El Banco Andino tiene algo por cobrar y un ingreso.",
  errorPar: null,
};
export const ALT_TUTORIAL_ACT3 = "Ejemplo: en el libro de la panadería va Gasto interés en el debe e Intereses por pagar en el haber. En el del Banco Andino, Intereses por cobrar en el debe e Ingresos por intereses en el haber.";
