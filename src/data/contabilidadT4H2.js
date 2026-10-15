/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H2 DE HACER — «El control que se saltaron» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, d4-t4-h2-v1.md, en main (con la
 * póliza nueva de A1 v4: «se queda con su plata»). Copia en
 * orquestador/conocimiento/paquetes/, el mismo blob. Una prueba compara cada
 * texto de aquí contra él, letra por letra.
 *
 * Hacer · evaluativa · fácil · 10 FP. El motor compartido escala los FP con
 * los aciertos. Su fila del servidor es la migración 0201, que corre Erwin.
 *
 * Siete casos construidos, uno por cada control de las pp. 179-180. Cada caso
 * trae tres opciones —su control y dos distractores, cada uno con su
 * retroalimentación—, barajadas por caso. Un intento por caso.
 *
 * La página va en la devolución: la del control correcto (Hanayama v1 §1).
 * Mientras se pregunta, la tarjeta solo dice «Caso construido», que es igual
 * en los siete y no delata nada (PH8-2).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H2_ID = "t4-el-control-que-se-saltaron";

export const H2 = {
  id: H2_ID,
  nombre: "El control que se saltaron",
  objetivo: "Reconocer, en un caso, cuál de los controles del efectivo no se está cumpliendo.",
  consigna: [
    "Cada caso muestra un problema con la plata de una empresa. Elige el control del libro que no se está cumpliendo.",
    "Tienes un intento por caso. Después verás por qué, con la página del libro.",
  ],
};

/* Los siete controles: los textos de A1 (paráfrasis), con su página. */
export const CONTROLES_H2 = [
  { id: "c1", texto: "Anotar cada día cuánto efectivo entró y cuánto salió.", pagina: 179 },
  { id: "c2", texto: "Llevar al banco, cada día, el efectivo que se recibió.", pagina: 179 },
  { id: "c3", texto: "Poner un tope a los pagos que se hacen en efectivo.", pagina: 180 },
  { id: "c4", texto: "Separar a quien recibe el dinero de quien lo registra.", pagina: 180 },
  { id: "c5", texto: "Contar la caja seguido y sin avisar: eso es un arqueo.", pagina: 180 },
  { id: "c6", texto: "Tener una póliza de manejo sobre quienes manejan la plata.", pagina: 180 },
  { id: "c7", texto: "Apartar una caja menor para los pagos pequeños.", pagina: 180 },
];
export const controlH2 = (id) => CONTROLES_H2.find((c) => c.id === id) ?? null;

export const SUBTEMAS_H2 = ["Registro diario", "Consignación diaria", "Tope de pagos", "Separación de funciones", "Arqueo sin aviso", "Póliza de manejo", "Caja menor"];

/*
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] Textos de interfaz que el
 * paquete no trae. El pie de la tarjeta y la pregunta son de la pantalla de
 * Hanayama (H2 v1 §1); los botones y «Correcto.», la convención de los Hacer
 * de la materia; el resumen, el de H1.
 */
export const PIE_CASO_H2 = "Caso construido";
export const PREGUNTA_H2 = "¿Qué control no se está cumpliendo?";
export const BOTON_H2 = { siguiente: "Siguiente caso", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const CORRECTO = "Correcto.";
export const resumenH2 = (bien, cuantos) => `${bien} de ${cuantos} al primer toque.`;
export const lectorErrorH2 = (control) => `Incorrecto. El control que no se cumple es: ${control}`;
export const paginaH2 = (n) => `Basado en el libro, p. ${n}`;

/*
 * Los siete casos, en el orden del paquete. `correcta` es el control que
 * falla; `distractores`, los otros dos, cada uno con su retroalimentación.
 */
export const CASOS_H2 = [
  {
    id: "h2-1",
    subtema: "Registro diario",
    caso: "En un restaurante nadie anota, día a día, la plata que entra y la que sale. A fin de mes nadie sabe en qué se fue.",
    correcta: "c1",
    acierto: "Así es. El libro pide anotar cada día lo que entra y lo que sale en efectivo. Sin eso, no hay forma de saber a dónde fue la plata.",
    distractores: {
      c6: "La póliza cubre a la empresa si alguien se queda con su plata. Aquí el problema es otro: nadie anota lo que entra y lo que sale.",
      c7: "La caja menor es un fondo para pagos pequeños. No resuelve que nadie anote, cada día, lo que entra y lo que sale.",
    },
  },
  {
    id: "h2-2",
    subtema: "Consignación diaria",
    caso: "Una tienda guarda en la caja todo el efectivo que recibe en la semana. Solo lo lleva al banco los lunes.",
    correcta: "c2",
    acierto: "Así es. El libro pide llevar al banco, cada día, el efectivo que se recibe. Una semana de ventas guardada en la caja es mucha plata en riesgo.",
    distractores: {
      c3: "Aquí no hay ningún pago grande en efectivo. El problema es que la plata recibida se queda días en la caja en vez de ir al banco.",
      c6: "La póliza cubre a la empresa si alguien se queda con su plata. Pero el control que falta es otro: llevar al banco cada día lo que se recibe.",
    },
  },
  {
    id: "h2-3",
    subtema: "Tope de pagos",
    caso: "Un empleado le paga en billetes a un proveedor una compra de varios millones. La empresa no tiene ninguna regla sobre eso.",
    correcta: "c3",
    acierto: "Así es. El libro pide poner un tope a los pagos en efectivo. Un pago tan grande en billetes es justo lo que ese tope evita.",
    distractores: {
      c2: "Llevar la plata al banco cada día es sobre la plata que se recibe. Aquí la plata sale, y sale en un pago que nadie limitó.",
      c7: "La caja menor es para pagos pequeños, y este es enorme. Lo que falta es un tope para lo que se paga en efectivo.",
    },
  },
  {
    id: "h2-4",
    subtema: "Separación de funciones",
    caso: "En una droguería, el cajero que recibe la plata de las ventas es también quien la anota en los libros de la empresa.",
    correcta: "c4",
    acierto: "Así es. El libro pide que quien recibe el dinero no sea quien lo registra. Si una sola persona hace las dos cosas, nadie más revisa las cifras.",
    distractores: {
      c1: "Aquí sí se anota la plata. El problema es quién la anota: la misma persona que la recibe.",
      c7: "La caja menor es un fondo para pagos pequeños. El problema de este caso es que una sola persona recibe la plata y la registra.",
    },
  },
  {
    id: "h2-5",
    subtema: "Arqueo sin aviso",
    caso: "En una cafetería, el dueño cuenta la caja siempre el último viernes del mes, y todos los empleados lo saben.",
    correcta: "c5",
    acierto: "Así es. El libro pide contar la caja seguido y sin avisar. Si todos saben cuándo se cuenta, el conteo pierde su sorpresa.",
    distractores: {
      c1: "Aquí el problema no es anotar. La caja sí se cuenta, pero una vez al mes y con fecha conocida.",
      c6: "La póliza cubre a la empresa si alguien se queda con su plata. El control que falla aquí es el conteo: muy de vez en cuando y anunciado.",
    },
  },
  {
    id: "h2-6",
    subtema: "Póliza de manejo",
    caso: "Un empleado que maneja la plata de una empresa se queda con una parte. Los registros y los conteos están al día, pero la empresa no tiene ningún seguro que la cubra.",
    correcta: "c6",
    acierto: "Así es. El libro pide una póliza de manejo sobre quienes manejan el dinero. Es el seguro que le faltó a esta empresa.",
    distractores: {
      c4: "Separar funciones ayuda a notar que falta plata, y aquí ya se notó. Lo que el caso dice que falta es un seguro.",
      c5: "Un arqueo sirve para notar que falta plata, y aquí los conteos están al día. Lo que falta es el seguro.",
    },
  },
  {
    id: "h2-7",
    subtema: "Caja menor",
    caso: "Cada vez que hay que comprar café o pagar un domicilio, alguien tiene que pedir un cheque o sacar plata de la caja principal.",
    correcta: "c7",
    acierto: "Así es. El libro pide apartar una caja menor para los pagos pequeños. Es justo el fondo que le falta a esta empresa.",
    distractores: {
      c3: "El tope sirve para frenar los pagos grandes en efectivo. Aquí los pagos son pequeños: el problema es de dónde sale la plata para pagarlos.",
      c2: "Llevar la plata al banco cada día es sobre la plata que se recibe. Aquí la plata sale, en pagos pequeños, y cada vez hay que buscarla.",
    },
  },
];

export const CIERRE_H2 = {
  texto: "Los controles cuidan la plata desde que entra hasta que sale. Se anota, se consigna, se pone un tope y se separan tareas. También se cuenta sin avisar, se asegura y se aparta un fondo para lo pequeño.",
  pie: "Basado en el libro, pp. 179-180",
};

/* «Así se juega» (d4-t4-asi-se-juega-v1.md, H2). La mano toca el control 2. */
export const ALT_H2 = "El caso dice que la floristería guarda quince días de efectivo en la caja. El control que no se cumple es llevar al banco, cada día, el efectivo que se recibe.";
export const PASOS_H2 = [
  "Lee el caso.",
  "Busca qué se hace mal con la plata.",
  "Elige el control que no se cumple. Tienes un intento por caso.",
];
export const EJEMPLO_H2 = {
  id: "demo",
  subtema: "Consignación diaria",
  caso: "Una floristería guarda en la caja el efectivo de quince días antes de llevarlo al banco.",
  correcta: "c2",
  /*
   * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] El paquete solo trae el caso,
   * el control correcto y el texto alternativo. Los dos distractores son los
   * de H2-2 (el mismo control), sin retroalimentación propia: la demo nunca
   * falla. El acierto es el texto alternativo de Katsumi.
   */
  acierto: ALT_H2,
  distractores: { c3: null, c6: null },
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/* Los casos en orden nuevo, y las tres opciones de cada uno barajadas por caso. */
export const sortearH2 = (barajar) => barajar(CASOS_H2).map((c) => ({ ...c, opciones: barajar([c.correcta, ...Object.keys(c.distractores)]) }));
export const opcionesEnOrden = (c) => c.opciones ?? [c.correcta, ...Object.keys(c.distractores)];

export function evaluarH2(caso, elegida) {
  const ok = elegida === caso.correcta;
  return {
    ok,
    correcta: caso.correcta,
    textos: ok ? [CORRECTO, caso.acierto] : [caso.distractores[elegida]],
    pagina: paginaH2(controlH2(caso.correcta).pagina),
  };
}

/* Evaluativa: el motor escala los 10 FP con este porcentaje. */
export const puntuarH2 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

/* Para el panel docente: el ítem se lee por su caso. */
export const casoDeItemH2 = (id) => CASOS_H2.find((x) => x.id === id)?.caso ?? null;
