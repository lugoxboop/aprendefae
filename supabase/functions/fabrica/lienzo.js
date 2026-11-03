/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL LIENZO — cuando ninguna de las cinco figuras sirve.
 *
 * Mateo, 3-nov: «eso de ponerle límites a Fermi debemos de quitarlo».
 *
 * Tenía razón en el fondo. Las cinco figuras cubren las relaciones que más se
 * repiten, pero no todas: un plano de oferta y demanda con dos curvas que se
 * desplazan —media macroeconomía— no es un flujo, ni una balanza, ni una
 * pila. Con solo cinco moldes, Fermi descartaba esas actividades enteras.
 *
 * ═══════════ POR QUÉ ESTO Y NO COMPONENTES LIBRES ═══════════
 *
 * La primera idea fue dejar que el modelo escribiera el componente y que el
 * profesor lo revisara antes de publicar. No se hizo, y la razón es concreta:
 * el profesor revisa lo que SE VE, no lo que se ejecuta. Un componente que
 * lee la sesión del estudiante y llama a la base como si fuera él se ve, en
 * la vista previa, igual que un diagrama correcto.
 *
 * Y el código vendría de un PDF de fuera. Una línea en blanco sobre blanco
 * dentro del capítulo —«incluye además este script»— no la ve nadie, y lo
 * que se ejecutaría corre en el navegador de estudiantes reales con su sesión
 * abierta. Eso entra en lo irreversible: datos de estudiantes.
 *
 * Así que se baja un nivel el vocabulario en vez de abrirlo. En vez de cinco
 * figuras armadas, las PIEZAS con las que se arma cualquier figura: ejes,
 * curvas, líneas, cajas, puntos y texto, cada una con su sitio en la lámina.
 * Con eso se dibuja un plano, un flujo circular, un mapa, un organigrama.
 * Sigue siendo una lista de datos que lee un dibujante escrito a mano aquí:
 * no hay nada que ejecutar, y el peor caso posible sigue siendo una figura
 * fea — que para eso está el profesor, que la ve antes de publicarla.
 *
 * El límite que queda no es de temas. Es el de la cuartilla: lo que cabe en
 * un celular de 320 px sin que la letra baje del piso del sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La lámina es la misma de las otras figuras: 360 de ancho. El alto lo elige
 * el modelo porque un plano necesita sitio y una línea no. */
export const LIENZO_ANCHO = 360;
export const LIENZO_ALTO_MIN = 120;
export const LIENZO_ALTO_MAX = 320;
export const LIENZO_ALTO_POR_DEFECTO = 220;

/* Cuántos trazos caben antes de que la figura deje de leerse. No es un tope
 * de lo que se puede contar: es el tope de lo que se puede mirar. */
export const MAX_TRAZOS = 22;
export const MIN_TRAZOS = 2;
export const MAX_PUNTOS_CURVA = 12;

export const TRAZOS = {
  eje: {
    que: "una recta con punta y su rótulo al final: los ejes del plano",
    forma: '{ "tipo":"eje", "id", "hacia":"derecha"|"arriba", "x","y", "largo", "etiqueta" }',
    nota: "«x,y» es donde nace el eje. «hacia»: derecha para el horizontal, arriba para el vertical.",
  },
  curva: {
    que: "una línea que pasa por varios puntos, recta o curvada: una oferta, una demanda, una tendencia",
    forma: '{ "tipo":"curva", "id", "puntos":[[x,y],[x,y],…], "etiqueta"?, "punta"?:true, "rayada"?:true }',
    nota: "Entre 2 y 12 puntos. El rótulo se pone junto al último. «rayada» para la curva de después del cambio.",
  },
  linea: {
    que: "un segmento suelto: una guía, un conector, una flecha de desplazamiento",
    forma: '{ "tipo":"linea", "id", "x1","y1","x2","y2", "punta"?:true, "rayada"?:true, "etiqueta"? }',
    nota: "Con «punta» es una flecha. Las guías al eje van rayadas y sin punta.",
  },
  caja: {
    que: "un rectángulo rotulado: un actor, una etapa, un bloque",
    forma: '{ "tipo":"caja", "id", "x","y","ancho","alto", "etiqueta", "nota"? }',
    nota: "«x,y» es la esquina de arriba a la izquierda.",
  },
  punto: {
    que: "un punto marcado: un equilibrio, un cruce, un dato",
    forma: '{ "tipo":"punto", "id", "x","y", "etiqueta"?, "donde"?:"arriba"|"abajo"|"derecha"|"izquierda" }',
    nota: "«donde» es a qué lado del punto va el rótulo. Por defecto, arriba.",
  },
  texto: {
    que: "un rótulo suelto, para lo que no es ninguna de las anteriores",
    forma: '{ "tipo":"texto", "id", "x","y", "texto", "ancla"?:"izquierda"|"centro"|"derecha" }',
    nota: "«x,y» es la base del renglón. Úsalo poco: un texto suelto casi siempre es un rótulo que le falta a otro trazo.",
  },
};

export const NOMBRES_TRAZO = Object.keys(TRAZOS);

export const MAX_ETIQUETA_TRAZO = 26;

export function instruccionesDeLienzo() {
  const l = [
    "EL LIENZO: PARA LO QUE NO ES NINGUNA DE LAS CINCO",
    "",
    "Si lo que tienes que enseñar no es un flujo, ni una balanza, ni una cuenta T, ni",
    "escalones, ni una línea de tiempo, no fuerces ninguna: usa el lienzo y dibújalo.",
    "Un plano de oferta y demanda, un flujo circular, un organigrama, un mapa — todo",
    "eso se dibuja aquí. No hay tema que no se pueda.",
    "",
    '{ "arquetipo":"lienzo", "alto": número, "trazos":[ … ] }',
    "",
    "EL PAPEL",
    `- Mide ${LIENZO_ANCHO} de ancho y el alto que tú digas, entre ${LIENZO_ALTO_MIN} y ${LIENZO_ALTO_MAX}.`,
    "  Un plano pide 240 o más; una figura plana se defiende con 160.",
    "- «x» crece hacia la derecha. «y» crece hacia ABAJO: y=0 es el borde de arriba.",
    "  Es al revés que en matemáticas, así que un precio que sube es una y que BAJA.",
    "- Deja 14 de margen por todos lados, y 24 abajo y a la izquierda si hay ejes:",
    "  ahí van sus rótulos.",
    "",
    "LOS TRAZOS",
    "",
  ];

  for (const [nombre, t] of Object.entries(TRAZOS)) {
    l.push(`· ${nombre} — ${t.que}`);
    l.push(`    ${t.forma}`);
    l.push(`    ${t.nota}`);
    l.push("");
  }

  l.push(
    "REGLAS DEL LIENZO",
    `- Entre ${MIN_TRAZOS} y ${MAX_TRAZOS} trazos. Más no se mira, se ojea.`,
    `- "id": una palabra corta en minúsculas, única. Es lo que los pasos encienden.`,
    `- "etiqueta" y "texto": máximo ${MAX_ETIQUETA_TRAZO} caracteres.`,
    "- Todo dentro del papel. Lo que se salga se recorta y queda a medias.",
    "- Dos rótulos no pueden caer en el mismo sitio. Si dos van cerca, sepáralos 16 en y.",
    "- Los ejes y sus rótulos son el escenario, no un paso: dales id igual, pero",
    "  enciéndelos en el primer paso, cuando explicas qué se está midiendo.",
    "",
    "UN EJEMPLO ENTERO, PARA QUE VEAS LAS MEDIDAS",
    "La demanda agregada, con el desplazamiento por un alza de precios:",
    "{",
    '  "arquetipo":"lienzo", "alto":240,',
    '  "trazos":[',
    '    {"tipo":"eje","id":"ejex","hacia":"derecha","x":44,"y":200,"largo":280,"etiqueta":"Producción"},',
    '    {"tipo":"eje","id":"ejey","hacia":"arriba","x":44,"y":200,"largo":170,"etiqueta":"Nivel de precios"},',
    '    {"tipo":"curva","id":"da","puntos":[[60,50],[160,120],[300,185]],"etiqueta":"DA"},',
    '    {"tipo":"linea","id":"guia","x1":44,"y1":95,"x2":200,"y2":95,"rayada":true},',
    '    {"tipo":"punto","id":"eq","x":200,"y":95,"etiqueta":"Aquí estábamos","donde":"derecha"},',
    '    {"tipo":"linea","id":"salto","x1":200,"y1":95,"x2":130,"y2":60,"punta":true,"etiqueta":"suben los precios"}',
    "  ]",
    "}",
    "Fíjate: el eje vertical nace ABAJO (y=200) y mide hacia arriba. La curva baja de",
    "izquierda a derecha porque en pantalla «y» crece hacia abajo.",
  );

  return l.join("\n");
}

/* ═══════════ LO QUE SE ACEPTA DE VUELTA ═══════════ */

const num = (v, min, max, pordefecto = null) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return pordefecto;
  return Math.max(min, Math.min(max, Math.round(n * 10) / 10));
};

const frase = (v, max) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : "";
};

const DONDE = ["arriba", "abajo", "derecha", "izquierda"];
const ANCLAS = ["izquierda", "centro", "derecha"];

/**
 * Deja el lienzo dibujable, o null.
 *
 * Recorta en vez de rechazar siempre que pueda: un trazo que se sale un poco
 * se mete dentro, y se pierde precisión, no la actividad. Rechaza solo lo que
 * no se puede dibujar de ninguna forma.
 */
export function limpiarLienzo(cruda, limpiarId) {
  if (!cruda || typeof cruda !== "object") return null;

  const alto = num(cruda.alto, LIENZO_ALTO_MIN, LIENZO_ALTO_MAX, LIENZO_ALTO_POR_DEFECTO);
  const dentroX = (v, pordefecto = 0) => num(v, 0, LIENZO_ANCHO, pordefecto);
  const dentroY = (v, pordefecto = 0) => num(v, 0, alto, pordefecto);

  const vistos = new Set();
  const trazos = [];

  for (const t of Array.isArray(cruda.trazos) ? cruda.trazos : []) {
    if (!t || typeof t !== "object") continue;
    if (!NOMBRES_TRAZO.includes(t.tipo)) continue;

    const id = limpiarId(t.id);
    if (!id || vistos.has(id)) continue;

    const base = { tipo: t.tipo, id };
    const etiqueta = frase(t.etiqueta, MAX_ETIQUETA_TRAZO);
    if (etiqueta) base.etiqueta = etiqueta;

    if (t.tipo === "eje") {
      base.hacia = t.hacia === "arriba" ? "arriba" : "derecha";
      base.x = dentroX(t.x, 44);
      base.y = dentroY(t.y, alto - 40);
      /* El largo se recorta a lo que queda de papel: un eje que se sale no se
         ve más largo, se ve cortado. */
      const sitio = base.hacia === "arriba" ? base.y : LIENZO_ANCHO - base.x;
      base.largo = num(t.largo, 20, Math.max(20, sitio), Math.max(20, sitio));
    } else if (t.tipo === "curva") {
      const puntos = (Array.isArray(t.puntos) ? t.puntos : [])
        .map((p) => (Array.isArray(p) ? [dentroX(p[0]), dentroY(p[1])] : null))
        .filter(Boolean)
        .slice(0, MAX_PUNTOS_CURVA);
      if (puntos.length < 2) continue;
      base.puntos = puntos;
      if (t.punta) base.punta = true;
      if (t.rayada) base.rayada = true;
    } else if (t.tipo === "linea") {
      base.x1 = dentroX(t.x1);
      base.y1 = dentroY(t.y1);
      base.x2 = dentroX(t.x2);
      base.y2 = dentroY(t.y2);
      /* Una línea de longitud cero no es una línea. */
      if (Math.abs(base.x1 - base.x2) < 1 && Math.abs(base.y1 - base.y2) < 1) continue;
      if (t.punta) base.punta = true;
      if (t.rayada) base.rayada = true;
    } else if (t.tipo === "caja") {
      if (!etiqueta) continue;
      base.x = dentroX(t.x);
      base.y = dentroY(t.y);
      base.ancho = num(t.ancho, 24, LIENZO_ANCHO - base.x, 90);
      base.alto = num(t.alto, 20, alto - base.y, 40);
      const nota = frase(t.nota, MAX_ETIQUETA_TRAZO + 10);
      if (nota) base.nota = nota;
    } else if (t.tipo === "punto") {
      base.x = dentroX(t.x);
      base.y = dentroY(t.y);
      base.donde = DONDE.includes(t.donde) ? t.donde : "arriba";
    } else if (t.tipo === "texto") {
      const cuerpo = frase(t.texto, MAX_ETIQUETA_TRAZO);
      if (!cuerpo) continue;
      base.texto = cuerpo;
      base.x = dentroX(t.x);
      base.y = dentroY(t.y);
      base.ancla = ANCLAS.includes(t.ancla) ? t.ancla : "centro";
    }

    vistos.add(id);
    trazos.push(base);
    if (trazos.length === MAX_TRAZOS) break;
  }

  if (trazos.length < MIN_TRAZOS) return null;
  /*
   * Un lienzo de puro escenario no enseña nada: si lo único que hay son ejes
   * y rótulos sueltos, falta la figura. Tiene que haber algo que mirar.
   */
  if (!trazos.some((t) => t.tipo === "curva" || t.tipo === "caja" || t.tipo === "punto" || t.tipo === "linea")) {
    return null;
  }

  const lienzo = { arquetipo: "lienzo", alto, trazos };
  const pie = frase(cruda.pie, 110);
  if (pie) lienzo.pie = pie;
  return lienzo;
}
