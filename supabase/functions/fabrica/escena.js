/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ESCENA — lo que se ve, escrito como datos.
 *
 * Encargo de Mateo (3-nov), punto 2: «las actividades que se crean son muy
 * toscas, lo que veo son puros textos, no tiene nada que ver con las
 * animaciones de calidad que teníamos».
 *
 * Tenía razón y la causa era de molde, no de modelo: la pieza generada traía
 * `titulo`, `nombres`, `pasos`, `pregunta` — todo prosa— y CuatroCapas pinta
 * la capa 2 con un componente `Escena` que en las piezas de verdad está
 * escrito a mano, SVG a SVG. Una pieza sin `Escena` es una pieza sin capa 2:
 * párrafos uno detrás de otro. No había nada que encender.
 *
 * Aquí se arregla por el lado correcto: no se le pide al modelo que escriba
 * componentes —eso sería ejecutar código salido de un PDF ajeno, que es
 * justo lo que la fábrica no hace nunca—, se le da un vocabulario cerrado de
 * cinco figuras y él las llena con datos.
 *
 * ═══════════ POR QUÉ CINCO Y NO QUINCE ═══════════
 *
 * Se catalogaron las nueve escenas escritas a mano del sitio y salieron seis
 * familias. Entran cinco. La sexta —la tabla de renglones con su columna de
 * marcas— se queda fuera a propósito: es la que peor se defiende en un
 * celular de 320 px y la que más se parece a lo que Mateo llamó «puro texto».
 *
 * Un vocabulario corto no es una limitación, es la pieza del diseño que hace
 * que esto funcione: con quince opciones el modelo elige mal y cada actividad
 * se ve distinta; con cinco elige bien y todas se ven del sitio.
 *
 * ═══════════ UNA COSA ENCENDIDA POR PASO ═══════════
 *
 * «No se guía a la persona con la mirada, tiene que esforzarse». La regla que
 * lo resuelve ya existía en las escenas a mano y aquí se vuelve obligatoria:
 * cada paso enciende al menos una parte y apaga el resto. Un paso que no
 * enciende nada no se corrige al pintarlo — se rechaza aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El largo del rótulo de una parte. No es una preferencia: a 320 px la lámina
 * de 360 unidades se ve a 0,89, y más de esto se sale de su caja o encoge la
 * letra por debajo del piso de 10,5 px del sitio. */
export const MAX_ETIQUETA = 24;
/*
 * Dos figuras llevan la cifra en el mismo renglón que el rótulo, y ahí no
 * caben 24 caracteres: medido, «Venta de contado 1.200.000» en media cuenta T
 * se corta a «Venta de…». La respuesta correcta no es encoger la letra hasta
 * que entre —el suelo del sitio es 10,5 px— sino pedirle al modelo un rótulo
 * más corto. Así que el tope lo pone la figura.
 */
export const MAX_ETIQUETA_POR_ARQUETIPO = { cuentaT: 15, balanza: 18 };
export const topeEtiqueta = (arquetipo) => MAX_ETIQUETA_POR_ARQUETIPO[arquetipo] ?? MAX_ETIQUETA;
export const MAX_NOTA = 48;
export const MAX_PARTES = 7;
export const MIN_PARTES = 2;

/*
 * Las cinco figuras. `campos` es lo que el modelo tiene que llenar y lo que
 * `limpiarEscena` exige; el texto es lo que se le explica en el encargo.
 */
export const ARQUETIPOS = {
  flujo: {
    cuando: "una cosa causa otra, o algo recorre un camino de un sitio a otro",
    forma: '{ "arquetipo":"flujo", "partes":[{"id","etiqueta","fila":0-2,"col":0-3,"nota"?}], "enlaces":[{"de","a","etiqueta"?}] }',
    nota: "fila 0 es arriba. Dos o tres filas; nunca más de cuatro columnas.",
  },
  balanza: {
    cuando: "dos lados que tienen que dar lo mismo, o una presión que se inclina a un lado",
    forma: '{ "arquetipo":"balanza", "titulos":{"izq","der"}, "partes":[{"id","etiqueta","valor":número,"lado":"izq"|"der"}] }',
    nota: "«valor» es un número sin puntos ni símbolo: el peso de esa ficha. El rótulo va pegado a la cifra: máximo 18 caracteres.",
  },
  cuentaT: {
    cuando: "movimientos de UNA cuenta: lo que entra por un lado y sale por el otro",
    forma: '{ "arquetipo":"cuentaT", "cuenta":"nombre de la cuenta", "partes":[{"id","etiqueta","valor":número,"lado":"debe"|"haber"}] }',
    nota: "«etiqueta» es el concepto del movimiento, no la cifra: la cifra va en «valor». Aquí el rótulo va pegado a la cifra, así que máximo 15 caracteres: «Venta de contado» no cabe, «Venta contado» sí.",
  },
  escalones: {
    cuando: "niveles que se apilan uno sobre otro, o cantidades que se comparan de mayor a menor",
    forma: '{ "arquetipo":"escalones", "modo":"pila"|"barras", "partes":[{"id","etiqueta","valor":número,"nota"?}] }',
    nota: "En «pila» van de abajo (el primero) hacia arriba. En «barras», de mayor a menor.",
  },
  linea: {
    cuando: "momentos en orden: antes, durante, después",
    forma: '{ "arquetipo":"linea", "partes":[{"id","etiqueta","momento"?,"nota"?}] }',
    nota: "«momento» es un rótulo corto de cuándo: «día 1», «al cierre», «enero».",
  },
};

export const NOMBRES_ARQUETIPO = Object.keys(ARQUETIPOS);

/* ═══════════ EL TROZO DE ENCARGO QUE EXPLICA TODO ESTO ═══════════ */

export function instruccionesDeEscena() {
  const lineas = [
    "LA ESCENA: LO QUE SE VE MIENTRAS SE EXPLICA",
    "",
    "Cada actividad lleva una figura que se dibuja sola a partir de tus datos. No es",
    "un adorno: es la capa 2, donde el estudiante MIRA lo que acaba de leer. Una",
    "actividad sin escena es una actividad de puro texto, y eso no se publica aquí.",
    "",
    "Elige UNA de estas cinco. Elige por lo que estás enseñando, no por variar:",
    "",
  ];

  for (const [nombre, a] of Object.entries(ARQUETIPOS)) {
    lineas.push(`· ${nombre} — ${a.cuando}`);
    lineas.push(`    ${a.forma}`);
    lineas.push(`    ${a.nota}`);
    lineas.push("");
  }

  lineas.push(
    "REGLAS DE LA ESCENA",
    `- Entre ${MIN_PARTES} y ${MAX_PARTES} partes. Menos no cuenta nada; más no cabe en un celular.`,
    `- "id": una palabra corta en minúsculas, sin espacios ni tildes. Única dentro de la escena.`,
    `- "etiqueta": máximo ${MAX_ETIQUETA} caracteres, y menos en las figuras que lo dicen arriba.`,
    "  Es un rótulo, no una frase. Lo que no cabe se corta, y un rótulo cortado no enseña nada.",
    `- "nota": opcional, máximo ${MAX_NOTA} caracteres. La letra chica debajo del rótulo.`,
    "- Nada de cifras dentro de la etiqueta cuando el arquetipo ya tiene «valor».",
    "",
    "Y LO QUE AMARRA LA ESCENA CON EL TEXTO",
    '- Cada paso de "pasos" lleva "resaltar": un array con los ids de las partes que se',
    "  ENCIENDEN en ese paso. Todo lo demás se apaga solo.",
    "- Enciende UNA parte por paso, o dos cuando el paso trata justamente de la relación",
    "  entre ellas. Tres ya no guía la mirada: la reparte.",
    "- Ningún paso puede llevar el array vacío. Si un paso no tiene nada que encender,",
    "  es que ese paso sobra o que la escena está mal elegida.",
    "- Los pasos tienen que recorrer la escena entera: ninguna parte se queda sin su paso.",
  );

  return lineas.join("\n");
}

/* ═══════════ LO QUE SE ACEPTA DE VUELTA ═══════════ */

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const numero = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/** Un id utilizable: minúsculas, sin tildes, sin espacios. */
export function limpiarId(v) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16);
}

/**
 * Deja la escena utilizable, o devuelve null si no hay nada que salvar.
 * Null no es un fallo silencioso: quien llama decide si descarta la pieza
 * entera o la manda a reescribir. Una pieza sin escena no se publica.
 */
export function limpiarEscena(cruda) {
  if (!cruda || typeof cruda !== "object") return null;

  const arquetipo = NOMBRES_ARQUETIPO.includes(cruda.arquetipo) ? cruda.arquetipo : null;
  if (!arquetipo) return null;

  const vistos = new Set();
  const partes = [];
  for (const p of Array.isArray(cruda.partes) ? cruda.partes : []) {
    if (!p || typeof p !== "object") continue;
    const id = limpiarId(p.id);
    const etiqueta = texto(p.etiqueta, topeEtiqueta(arquetipo));
    if (!id || !etiqueta || vistos.has(id)) continue;
    vistos.add(id);

    const parte = { id, etiqueta };
    const nota = texto(p.nota, MAX_NOTA);
    if (nota) parte.nota = nota;

    const valor = numero(p.valor);
    if (valor !== null) parte.valor = valor;

    if (arquetipo === "flujo") {
      parte.fila = Math.max(0, Math.min(3, Math.round(numero(p.fila) ?? 0)));
      parte.col = Math.max(0, Math.min(3, Math.round(numero(p.col) ?? 0)));
    }
    if (arquetipo === "balanza") parte.lado = p.lado === "der" ? "der" : "izq";
    if (arquetipo === "cuentaT") parte.lado = p.lado === "haber" ? "haber" : "debe";
    if (arquetipo === "linea") {
      const momento = texto(p.momento, MAX_ETIQUETA);
      if (momento) parte.momento = momento;
    }

    partes.push(parte);
    if (partes.length === MAX_PARTES) break;
  }

  if (partes.length < MIN_PARTES) return null;

  const escena = { arquetipo, partes };

  if (arquetipo === "flujo") {
    /* Un enlace a una parte que no existe no se dibuja: se cae. Mejor
       perderlo aquí que pintar una flecha al vacío. */
    escena.enlaces = (Array.isArray(cruda.enlaces) ? cruda.enlaces : [])
      .map((e) => ({ de: limpiarId(e?.de), a: limpiarId(e?.a), etiqueta: texto(e?.etiqueta, MAX_ETIQUETA) }))
      .filter((e) => e.de && e.a && e.de !== e.a && vistos.has(e.de) && vistos.has(e.a))
      .map((e) => (e.etiqueta ? e : { de: e.de, a: e.a }))
      .slice(0, MAX_PARTES + 2);
  }

  if (arquetipo === "balanza") {
    escena.titulos = {
      izq: texto(cruda.titulos?.izq, MAX_ETIQUETA) || "Izquierda",
      der: texto(cruda.titulos?.der, MAX_ETIQUETA) || "Derecha",
    };
    /* Una balanza con un solo platillo no es una balanza. */
    if (!partes.some((p) => p.lado === "izq") || !partes.some((p) => p.lado === "der")) return null;
  }

  if (arquetipo === "cuentaT") {
    escena.cuenta = texto(cruda.cuenta, MAX_ETIQUETA) || "Cuenta";
  }

  if (arquetipo === "escalones") {
    escena.modo = cruda.modo === "barras" ? "barras" : "pila";
    /* En barras la cifra es la figura: sin cifras no hay nada que comparar. */
    if (escena.modo === "barras" && !partes.every((p) => typeof p.valor === "number")) {
      escena.modo = "pila";
    }
  }

  const pie = texto(cruda.pie, MAX_NOTA);
  if (pie) escena.pie = pie;

  return escena;
}

/**
 * Amarra los pasos a la escena. Devuelve los pasos con `resaltar` ya limpio,
 * o null si la pieza no se sostiene: aquí es donde se cae «puro texto».
 */
export function amarrarPasos(pasos, escena) {
  if (!escena) return null;
  const ids = new Set(escena.partes.map((p) => p.id));

  const limpios = [];
  for (const p of Array.isArray(pasos) ? pasos : []) {
    const textoPaso = texto(p?.texto, 400);
    if (!textoPaso) continue;

    const crudos = Array.isArray(p.resaltar) ? p.resaltar : [p?.resaltar];
    const resaltar = [...new Set(crudos.map(limpiarId).filter((id) => ids.has(id)))];
    /* La regla de Mateo, aplicada: un paso que no enciende nada no guía la
       mirada, y un paso que lo enciende todo tampoco. Dos es el tope —y solo
       cuando el paso trata justamente de la relación entre esas dos—; a
       partir de tres el foco deja de ser foco y vuelve a ser una lámina
       plana, que es de donde veníamos. */
    if (resaltar.length === 0 || resaltar.length > 2) continue;

    limpios.push({ texto: textoPaso, resaltar });
  }

  if (limpios.length < 3) return null;

  /* Una parte que ningún paso enciende es una parte que el estudiante nunca
     mira: o sobra en la escena, o falta el paso que la explica. */
  const encendidas = new Set(limpios.flatMap((p) => p.resaltar));
  if (encendidas.size < escena.partes.length) return null;

  return limpios;
}
