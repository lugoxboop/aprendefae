import { BOTON, DEBE, HABER, FRASE_TARIFAS } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A2 DE APRENDER — «Descuentos en cadena» (Célula C).
 *
 * Fuente: la v1 de Near y los cambios de su plan reordenado por la regla 9
 * (capa 3), con el PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-a2-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra. Cuando dos capas chocan, manda
 * la más nueva:
 *
 *   · pantalla 5: «…no aparecen en el asiento, y el asiento es igual en los
 *     dos sistemas…» (opcional de Mello, regla 4)
 *   · pantalla 7: «Siguiente: practica con varios descuentos seguidos.»
 *
 * Ejemplo H-2 del libro (pp. 249-250), resuelto: A2 es la dueña de sus
 * cifras y ninguna pieza de Hacer las pide. El factor va bien escrito
 * (0,7866): la pantalla no menciona la errata C7-2. La suma del asiento
 * (3.832.315) es de Near: el libro no imprime sumas.
 *
 * Lo que la v1 no trae y se toma de A1 de T7-3: los botones y mensajes, los
 * rótulos de la ficha y el pie de cada pantalla, con las páginas de la
 * columna «Fuente» de sus textos (el del asiento, «Basado en el libro, p.
 * 250», sí lo da la v1).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A2_ID = "t7-3-descuentos-en-cadena";

/* Las cifras de H-2 (pp. 249-250). Una prueba las recalcula desde la lista, los tres descuentos y las tarifas. */
export const H2_LIBRO = {
  lista: 4_200_000, d1: 210_000, s1: 3_990_000, d2: 319_200, s2: 3_670_800, d3: 367_080, factura: 3_303_720,
  rebaja: 896_280, rebaja23: 966_000, factor: 0.7866, iva: 528_595, retencion: 115_630, cliente: 3_716_685, sumas: 3_832_315,
};
const C = H2_LIBRO;

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás cómo se calculan varios descuentos seguidos, y cuánto se rebaja en total.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 249-250",
};

const EN_CADENA = {
  id: "en-cadena",
  tipo: "lectura",
  parrafos: [
    "En la pieza anterior viste el descuento comercial: se resta del precio de lista, y el asiento va por el valor a facturar.",
    "A veces la empresa da varios descuentos, uno detrás de otro. El libro los llama descuentos en cadena.",
    "Cada descuento se calcula sobre el saldo que dejó el anterior, no sobre el precio de lista.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 248-249",
};

const EJEMPLO = {
  id: "ejemplo",
  tipo: "eleccion",
  parrafos: ["Mira el ejemplo del libro. San Calixto Ltda. le vende mercancía a crédito a un cliente. El precio de lista es de $4.200.000, más el IVA, y le da tres descuentos comerciales: del 5 %, del 8 % y del 10 %."],
  /* La ficha de la v1, en su orden. «A crédito» sale del asiento de la p. 250, igual que en A1. */
  ficha: [
    { dato: "Quién entrega", texto: "San Calixto" },
    { dato: "Quién recibe", texto: "Un cliente" },
    { dato: "Monto", texto: "$4.200.000 de lista, con 5 %, 8 % y 10 %" },
    { dato: "Tipo", texto: "A crédito" },
    { dato: "Clase de hecho", texto: "Venta de mercancía" },
  ],
  /* Sin puntaje. */
  pregunta: "5 % más 8 % más 10 % suman 23 %. ¿San Calixto le rebaja el 23 % del precio de lista?",
  opciones: [
    { id: "si", texto: "Sí", devolucion: "Parece que sí, pero no. Cada descuento se calcula sobre un saldo más pequeño, así que la rebaja total es menor." },
    { id: "no", texto: "No", correcta: true },
  ],
  acierto: { texto: "Así es: la rebaja es menor. Cada descuento se calcula sobre un saldo más pequeño, así que el total no llega al 23 %.", pie: "Basado en el libro, pp. 249-250" },
  error: { pie: "Basado en el libro, pp. 249-250" },
  pie: "Basado en el libro, pp. 249-250",
};

const PASOS = {
  id: "pasos",
  tipo: "eleccion",
  parrafos: ["El primer descuento es el 5 % del precio de lista: $4.200.000 × 5 % = $210.000. Queda un saldo de $3.990.000."],
  pregunta: "¿Sobre qué valor se calcula el segundo descuento, el del 8 %?",
  opciones: [
    { id: "lista", texto: "$4.200.000", devolucion: "En una cadena, cada descuento va sobre el saldo que dejó el anterior. Aquí es $3.990.000, no el precio de lista." },
    { id: "saldo", texto: "$3.990.000", correcta: true },
  ],
  acierto: {
    texto: "Así es. Se calcula sobre el saldo que dejó el primero: $3.990.000 × 8 % = $319.200.",
    parrafos: [
      "Queda un saldo de $3.670.800. El tercer descuento es el 10 % de ese saldo: $367.080.",
      "El valor a facturar es $3.670.800 − $367.080 = $3.303.720.",
      "En total, San Calixto rebajó $896.280. Es el 21,34 % del precio de lista. Con el 23 %, la rebaja habría sido de $966.000.",
    ],
    pie: "Basado en el libro, pp. 249-250",
  },
  error: { pie: "Basado en el libro, pp. 249-250" },
  pie: "Basado en el libro, pp. 249-250",
};

const ATAJO = {
  id: "atajo",
  tipo: "lectura",
  parrafos: [
    "El libro enseña un atajo. A cada descuento se le halla su complemento: lo que le falta para llegar al 100 %.",
    "Los complementos se multiplican entre sí, y sale un factor. El factor por el precio de lista da el valor a facturar.",
    "Aquí los complementos son 0,95, 0,92 y 0,90. Si los multiplicas entre sí, el factor que sale es 0,7866.",
    /* Con la C7-2 resuelta: el libro escribe 0,7688 en esta línea. La pantalla no la menciona. */
    "Y $4.200.000 × 0,7866 = $3.303.720: el mismo valor a facturar, con menos pasos.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 250",
};

const ASIENTO = {
  id: "asiento",
  tipo: "lectura",
  parrafos: [
    "En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor a facturar.",
    FRASE_TARIFAS,
    "Sobre $3.303.720, el IVA es de $528.595 y la retención, de $115.630. El libro redondea al peso.",
    "El cliente queda debiendo $3.303.720 + $528.595 − $115.630 = $3.716.685.",
  ],
  /* Sin fecha: el libro pone «xxxx». «Ventas» va como «Ingresos por ventas» (regla 8). Las sumas son de Near. */
  asientos: [{
    fecha: null,
    lineas: [
      { cuenta: "Cuentas por cobrar – clientes", lado: DEBE, monto: C.cliente },
      { cuenta: "Anticipo fiscal", lado: DEBE, monto: C.retencion },
      { cuenta: "IVA por pagar", lado: HABER, monto: C.iva },
      { cuenta: "Ingresos por ventas", lado: HABER, monto: C.factura },
    ],
    sumas: true,
  }],
  /* Capa 3 (opcional de Mello, regla 4). */
  tras: ["Como en la pieza anterior, los descuentos no aparecen en el asiento, y el asiento es igual en los dos sistemas. Ingresos por ventas va por el valor a facturar."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, p. 250",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "En una cadena, cada descuento se calcula sobre el saldo que dejó el anterior.",
    "Por eso la rebaja total es menor que la suma de los porcentajes.",
    "El atajo: multiplica los complementos y aplica el factor al precio de lista.",
  ],
  /* Capa 3: ahora lleva a H2. */
  siguiente: "Siguiente: practica con varios descuentos seguidos.",
  pie: "Basado en el libro, pp. 249-250",
};

export const PIEZA_DESCUENTOS_EN_CADENA = {
  id: A2_ID,
  numero: 2,
  titulo: "Descuentos en cadena",
  pantallas: [PORTADA, EN_CADENA, EJEMPLO, PASOS, ATAJO, ASIENTO, RESUMEN],
};
