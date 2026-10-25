/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 «LAS CUENTAS, EL DEBE Y EL HABER» EN SECUENCIA — los textos y la bandera.
 *
 * Lote T2-7 (#471, L). Las piezas de Aprender de T2 pasan de CuatroCapas a
 * SecuenciaAprender (#491, uso en #492). Aquí viven los DATOS: la bandera, el
 * alto de figura que se pide y los textos de cada pantalla. Las figuras y el
 * ensamblado de la pieza están en
 * src/components/mecanicas/libros/t2/secuenciaP1.jsx.
 *
 * ═══════════ LA BANDERA ═══════════
 *
 * Hay estudiantes activos en T2: la página vieja (CuatroCapas con
 * PIEZAS_APRENDER) NO se borra. La secuencia entra AL LADO, detrás de esta
 * constante. APAGADA, la vista pinta exactamente lo de main (lo prueba
 * t2-secuencia-p1.test.mjs). Encenderla —o volver a apagarla— es esta línea.
 * La enciende L, no la construcción.
 *
 * ═══════════ DE DÓNDE SALE CADA TEXTO ═══════════
 *
 * Pantallas, tipos y figuras: Watari, c-t2-3-watari-figuras.md §1.
 * Textos: Near v2, c-t2-2-near-lote.md §2 (P1), con el delta
 * c-t2-3-near-delta.md (P1·5, frase de consecuencia; P1·6, el selector).
 * Nada de lo aprobado se reescribe: se reparte en pantallas. Los textos
 * `textual: true` son del libro, letra por letra.
 *
 * Lo que todavía no existe va en PENDIENTES con su marcador
 * (PENDIENTE_DE_NEAR / PENDIENTE_DE_WATARI) y un texto PROVISIONAL marcado.
 * La prueba queda en rojo nombrándolo hasta que llegue el delta T2-7.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ⚑ LA BANDERA. false = producción ve la página vieja, igual que en main. */
export const T2_APRENDER_EN_SECUENCIA = false;

/* El alto de figura que pide la pieza (#513/#524, tope 206 a 320 y 253 a 375). */
export const TOPE_ALTO_FIGURA = { a320: 206, a375: 253 };

/* ───────────────── P1 · De qué está hecha una cuenta ───────────────── */

export const P1_ID = "cu-a1-anatomia-de-una-cuenta";

/*
 * PENDIENTE_DE_WATARI: Watari reservó 213 px a 320 y 213 a 375 con el tope
 * viejo de 220 (#470). El tope nuevo es 206: P1 se pasa en 7 px a 320.
 */
export const P1_ALTO_FIGURA = { a320: 213, a375: 213 };

export const P1_TEXTOS = {
  apertura: {
    /* PENDIENTE_DE_NEAR: el titular de 10 palabras o menos. El objetivo de Near (15 palabras) va al apoyo, tal cual. */
    titular: "Objetivo",
    apoyo: "Al terminar, sabrás leer una cuenta T: sus dos lados, sus movimientos y su saldo.",
  },
  lado: {
    titular: "¿De qué lado?",
    apoyo: "Esta es la cuenta Caja del ejemplo del libro. Entraron $1.000 y $500, y salieron $150. ¿De qué lado pondrías lo que entra?",
    opciones: ["Izquierda", "Derecha"],
    /* PENDIENTE_DE_NEAR: la razón por la que «Siguiente» espera (D11). */
    razon: "PROVISIONAL · Toca un lado para seguir.",
  },
  cuenta: {
    titular: "Qué es una cuenta",
    textual: true,
    apoyo: "Cuenta: «un sistema de registro organizado, de los aumentos o disminuciones que sufre un concepto como consecuencia de las operaciones que realiza un negocio».",
  },
  debeHaber: {
    titular: "Debe y haber",
    apoyo: "La raya parte la cuenta en dos. El lado izquierdo se llama debe y el derecho, haber. Son nombres de lugar: no dicen si algo sube o baja.",
  },
  movimientos: {
    titular: "Movimientos",
    apoyo: "Suma cada lado por separado. En Caja, el debe suma $1.500 y el haber, $150. Cada suma es el movimiento de ese lado.",
  },
  saldo: {
    titular: "El saldo",
    apoyo: "El saldo es la diferencia entre los dos movimientos: $1.350. El último valor que anotaste fue al haber. ¿De qué lado va el saldo?",
    opciones: ["En el debe", "En el haber"],
    pista: "Pista: compara las dos sumas. ¿Cuál es más grande?",
    porque: "Seguiste el último valor. El saldo va del lado del movimiento mayor, y ese es el debe.",
    /* Delta T2-3 de Near, P1·5: va en la zona del mensaje, encima de la pista. */
    consecuencia: "Así el saldo quedaría del lado de $150, el movimiento menor",
    /* PENDIENTE_DE_NEAR */
    razon: "PROVISIONAL · Elige un lado para seguir.",
  },
  debeNoEsSubir: {
    titular: "Debe no es subir",
    apoyo: "El 18 de enero, Lavado de Autos Mateo le paga $250 a un proveedor. Lo anota en el debe de Cuentas por pagar. ¿La deuda sube o baja?",
    opciones: ["Sube", "Baja"],
    pista: "Pista: después de pagar, ¿le debes más o menos al proveedor?",
    porque: "Leíste el debe como aumento. El debe es un lugar: en una deuda, lo que va al debe la baja.",
    /* PENDIENTE_DE_NEAR */
    razon: "PROVISIONAL · Elige una respuesta para seguir.",
  },
  cierre: {
    /* PENDIENTE_DE_NEAR: el titular que resume la pregunta (la pregunta, 21 palabras, pasa al apoyo: decisión de L, T2-7). */
    titular: "Cierre",
    apoyo: "Una cuenta tiene $50 en el debe y $30 en el haber. ¿Cuánto es el saldo y de qué lado va?",
    frase: "$20, en el debe. Es la diferencia entre los dos movimientos, y va del lado del más grande.",
  },
};

/*
 * Lo que falta, con quién lo debe. La prueba lo nombra en rojo mientras esta
 * lista no esté vacía; cada entrada se borra cuando su texto llega.
 */
export const PENDIENTES_P1 = [
  { de: "Near", marcador: "PENDIENTE_DE_NEAR", donde: "P1·0 apertura", que: "titular de ≤ 10 palabras (el objetivo tiene 15 y va al apoyo)" },
  { de: "Near", marcador: "PENDIENTE_DE_NEAR", donde: "P1·1 ¿De qué lado?", que: "razon del Haz" },
  { de: "Near", marcador: "PENDIENTE_DE_NEAR", donde: "P1·5 El saldo", que: "razon del Haz" },
  { de: "Near", marcador: "PENDIENTE_DE_NEAR", donde: "P1·6 Debe no es subir", que: "razon del Haz" },
  { de: "Near", marcador: "PENDIENTE_DE_NEAR", donde: "P1·7 cierre", que: "titular de ≤ 10 palabras (la pregunta tiene 21 y va al apoyo)" },
  { de: "Watari", marcador: "PENDIENTE_DE_WATARI", donde: "P1 figura", que: "reserva de figura ≤ 206 px a 320 (hoy 213)" },
];

/* Los datos de P1·6, del libro: Lavado de Autos Mateo (pp. 98-101) y el pagaré cu6 (p. 89). */
export const P1_SELECTOR_FAMILIA = [
  { cuenta: "Caja", familia: "Activo", lado: "debe", saldo: 1350 },
  { cuenta: "Documentos por pagar", familia: "Pasivo", lado: "haber", saldo: 500 },
];
