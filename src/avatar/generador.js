/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL GENERADOR PARAMÉTRICO DE AVATARES — la parte que no dibuja.
 *
 * Portado TAL CUAL del kit de diseño: paletas, formas, verts(), fmt() y
 * computeAvatarProps(). No se rediseña ni se aproxima nada aquí; quien quiera
 * cambiar el aspecto de un avatar cambia el kit y se vuelve a portar. Lo que
 * este archivo añade son las listas de lo SELECCIONABLE y los nombres que se
 * enseñan, que el kit no tenía porque allí no había estudiante.
 *
 * 5 formas × 4 paletas × 4 niveles = 80 combinaciones, todas calculadas, ninguna
 * dibujada a mano.
 *
 * ═══════════ 'comparacion' NO ES UNA PALETA DEL ESTUDIANTE ═══════════
 *
 * Es el gris de las miniaturas de la pestaña «Forma»: allí lo que se compara es
 * la geometría, y pintar las cinco con la paleta puesta haría que se eligiera
 * por color. Nunca aparece como opción —PALETAS es la lista de lo elegible y no
 * la incluye— y avatar.test.mjs lo comprueba leyendo este archivo y el selector.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ═══════════ EL NAVY DE AVATAR, Y POR QUÉ NO ES EL DE MARCA ═══════════
 *
 * #3D5A80 sustituye en las cuatro paletas seleccionables a #1D3557, el navy de
 * marca. El de marca es también el fondo del sitio, así que una figura que lo
 * usaba como relleno o como trazo desaparecía sobre él: el Nivel I se veía como
 * un contorno flotando en el vacío. Este es el mismo navy, subido lo justo para
 * despegarse del fondo.
 *
 * SE USA EXCLUSIVAMENTE EN EL RENDER DE AVATARES. No entra en theme.js ni en
 * ninguna otra superficie de la interfaz: fuera de estas figuras, el navy del
 * sitio sigue siendo #1D3557.
 *
 * 'comparacion' —el gris de las miniaturas de la pestaña «Forma»— no llevaba
 * navy de marca y no se toca.
 */
export const NAVY_AVATAR = '#3D5A80';

export const PALETTES = {
  nocturno:    { c1: NAVY_AVATAR, c2: '#2A9D8F', stroke: '#14263F', node: '#E76F51', ring: '#2A9D8F' },
  /*
   * El nodo de Marea era blanco y pasa a coral. La regla de las paletas es que
   * el nodo lleva el color de marca que NO está en el par: Marea es teal+navy,
   * así que le toca coral. Las otras tres ya la cumplían.
   *
   * Esto le cambia también el color al núcleo, que lee el mismo `node`. Es
   * intencional: el nodo y el núcleo son la misma idea visual a dos tamaños, y
   * separarlos aquí sería inventar un quinto color por paleta.
   *
   * Y no, esto no contradice que el coral signifique error: dentro de las
   * figuras de avatar el coral es parte del kit aprobado, igual que en Brasa y
   * en Aurora.
   */
  marea:       { c1: '#2A9D8F', c2: NAVY_AVATAR, stroke: '#14263F', node: '#E76F51', ring: '#2A9D8F' },
  brasa:       { c1: '#E76F51', c2: NAVY_AVATAR, stroke: '#14263F', node: '#2A9D8F', ring: '#E76F51' },
  aurora:      { c1: '#E76F51', c2: '#2A9D8F', stroke: NAVY_AVATAR, node: NAVY_AVATAR, ring: '#E76F51' },
  comparacion: { c1: '#4A5A72', c2: '#7A8798', stroke: '#9AA5B4', node: '#C8D0DA', ring: '#6B7A90' },
};

export const SHAPES = {
  decaedro: { n: 10, rot: -90, alt: 1,    step: 3 },
  prisma:   { n: 6,  rot: -90, alt: 1,    step: 2 },
  nucleo:   { n: 8,  rot: -90, alt: 0.66, step: 3 },
  red:      { n: 12, rot: -90, alt: 1,    step: 5 },
  cuna:     { n: 5,  rot: -90, alt: 1,    step: 2 },
};

export function verts(s, R) {
  const out = [];
  for (let i = 0; i < s.n; i++) {
    const a = (s.rot + i * 360 / s.n) * Math.PI / 180;
    const r = R * (s.alt !== 1 && i % 2 ? s.alt : 1);
    out.push([100 + r * Math.cos(a), 100 + r * Math.sin(a)]);
  }
  return out;
}

export const fmt = (pts) => pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

export function computeAvatarProps(shapeKey, paletteKey, level) {
  const s = SHAPES[shapeKey] ?? SHAPES.decaedro;
  const p = PALETTES[paletteKey] ?? PALETTES.marea;
  const lvl = Math.max(1, Math.min(4, +level || 1));
  const R = 84;
  const V = verts(s, R);
  const W = verts(s, R * 0.8);

  /*
   * ═══════════ LOS DOS MODOS DE CUERPO ═══════════
   *
   * La progresión es acumulativa: cada nivel suma UNA cualidad.
   *
   *   I    presencia            bitono plano
   *   II   + estructura         bitono plano + nodos, radios y núcleo
   *   III  + profundidad        degradado y facetas
   *   IV   + luz                halo, lustre y cuerdas
   *
   * De ahí que el corte sea `lvl < 3` y no `lvl < 2`: el Nivel II NO vuelve al
   * wireframe transparente, hereda el cuerpo del I y le pone estructura encima.
   * Antes los dos modos se decidían con `rich = lvl >= 3` y el grupo de abajo
   * era «sin relleno»; ahora ese grupo tiene relleno propio y por eso tiene
   * nombre: bitono.
   */
  const bitono = lvl < 3;
  const rich = !bitono;

  return {
    c1: p.c1, c2: p.c2, node: p.node, ring: p.ring,
    pts: fmt(V),
    insetPts: fmt(verts(s, R * (s.alt !== 1 ? 0.44 : 0.52))),
    stroke: rich ? p.stroke : p.c1,
    /*
     * El trazo del bitono sube a 3 sobre el lienzo de 200. Es lo que le da la
     * «presencia» del Nivel I: con el trazo fino de antes, un contorno sin
     * relleno sobre el navy del sitio no se leía. III y IV se quedan en 2.2,
     * que es el que va con el degradado.
     */
    sw: bitono ? 3 : 2.2,
    /*
     * Dos rellenos que NO son el mismo estado, a propósito:
     *
     *   bodyFill  el degradado c1→c2 de los niveles III y IV.
     *   flatFill  el relleno PLANO del bitono: c2 al 20%. No es un degradado
     *             apagado ni un bodyFill con menos opacidad — es otra cosa, y
     *             se guarda aparte para que nadie los funda al tocar uno.
     */
    bodyFill: rich,
    flatFill: bitono ? p.c2 : null,
    /*
     * 0,5 y no 0,2. El relleno al 20% dejaba el Nivel I casi tan vacío como el
     * wireframe que vino a sustituir: sobre el navy del sitio no se leía como
     * cuerpo. Vale igual para el I y para el II, que siguen compartiéndolo.
     */
    flatFillOp: bitono ? 0.5 : 0,
    chordColor: rich ? '#FFFFFF' : p.c2,
    insetStroke: rich ? '#FFFFFF' : p.c2,
    insetFill: rich ? 'rgba(255,255,255,0.07)' : 'none',
    insetOp: rich ? 0.38 : 0.55,
    facets: rich ? V.map((v, i) => ({
      pts: fmt([[100, 100], v, V[(i + 1) % V.length]]),
      op: i % 2 ? 0.17 : 0.05,
    })) : [],
    spokes: lvl >= 2 ? V.filter((_, i) => i % 2 === 0).map((v) => ({ x: +v[0].toFixed(1), y: +v[1].toFixed(1) })) : [],
    chords: lvl >= 4 ? W.map((v, i) => {
      const q = W[(i + s.step) % W.length];
      return { x1: +v[0].toFixed(1), y1: +v[1].toFixed(1), x2: +q[0].toFixed(1), y2: +q[1].toFixed(1) };
    }) : [],
    /*
     * ═══════════ LOS NODOS BAJAN AL NIVEL I, HUECOS ═══════════
     *
     * El reparto de ideas visuales estaba desigual: el I tenía UNA —el cuerpo—
     * y el II tenía TRES —nodos, radios y núcleo—. No era cuestión de subir
     * opacidades: era que al I le faltaba algo que enseñar. Así que los
     * vértices se marcan desde el primer nivel.
     *
     *   Nivel I      hueco: solo contorno, r 3, trazo 1,5
     *   Niveles II+  sólido: relleno, r 4,5
     *
     * El radio SÓLIDO ES FIJO. Antes valía 2,4 en las formas de muchos lados y
     * 3,2 en el resto; ese condicional se retira, el nodo ya no depende de la
     * forma. Los radios y el núcleo siguen siendo del II en adelante: la
     * progresión no cambia, solo se reparte mejor.
     */
    nodes: V.map((v) => ({ x: +v[0].toFixed(1), y: +v[1].toFixed(1), r: lvl >= 2 ? 4.5 : 3 })),
    nodoHueco: lvl < 2,
    nodoTrazo: 1.5,
    showCore: lvl >= 2,
    coreR: lvl >= 3 ? 5 : 4,
    showHalo: lvl >= 4,
    showGloss: lvl >= 4,
  };
}

/*
 * ═══════════ LO QUE UN ESTUDIANTE PUEDE ELEGIR ═══════════
 *
 * Las cinco formas, las CUATRO paletas —'comparacion' no está— y los cuatro
 * niveles. El orden es el que se enseña en las pestañas del selector.
 */
export const FORMAS = ["decaedro", "prisma", "nucleo", "red", "cuna"];
export const PALETAS = ["nocturno", "marea", "brasa", "aurora"];

/** La paleta interna de las miniaturas de «Forma». Nunca elegible. Ver la cabecera. */
export const PALETA_COMPARACION = "comparacion";
/** Y el nivel fijo de esas miniaturas: se comparan geometrías, no niveles. */
export const NIVEL_COMPARACION = 2;

export const NOMBRE_FORMA = {
  decaedro: "Decaedro",
  prisma: "Prisma",
  nucleo: "Núcleo",
  red: "Red",
  cuna: "Cuña",
};

export const NOMBRE_PALETA = {
  nocturno: "Nocturno",
  marea: "Marea",
  brasa: "Brasa",
  aurora: "Aurora",
};

/* Los cuatro niveles del avatar, con su número romano y su palabra. */
export const NIVELES = [1, 2, 3, 4];
export const ROMANO = { 1: "I", 2: "II", 3: "III", 4: "IV" };
export const NOMBRE_NIVEL = { 1: "Línea", 2: "Nodos", 3: "Facetado", 4: "Brillo" };
export const ETIQUETA_NIVEL = (n) => `Nivel ${ROMANO[n] ?? "I"}`;

/*
 * Lo que no viene de la base o viene roto: Decaedro · Marea · Nivel I.
 *
 * La paleta por defecto era Nocturno y se cambió porque su c1 era el navy de
 * marca, el mismo del fondo del sitio: un Nivel I por defecto no se veía. El
 * mismo cambio va en la columna avatar_palette de la base (migración 0038), y
 * los dos lados tienen que decir lo mismo — hay una prueba que lo comprueba
 * leyendo la migración.
 */
export const POR_DEFECTO = { forma: "decaedro", paleta: "marea", nivel: 1 };

/** La combinación del perfil, saneada: nunca 'comparacion', nunca un nivel fuera de 1-4. */
export function combinacionDe(perfil) {
  const forma = FORMAS.includes(perfil?.avatar_shape) ? perfil.avatar_shape : POR_DEFECTO.forma;
  const paleta = PALETAS.includes(perfil?.avatar_palette) ? perfil.avatar_palette : POR_DEFECTO.paleta;
  const n = Math.floor(Number(perfil?.avatar_level));
  const nivel = n >= 1 && n <= 4 ? n : POR_DEFECTO.nivel;
  return { forma, paleta, nivel };
}

/** El pie del selector: «Núcleo · Marea · Nivel II». */
export const leyenda = ({ forma, paleta, nivel }) =>
  `${NOMBRE_FORMA[forma] ?? ""} · ${NOMBRE_PALETA[paleta] ?? ""} · ${ETIQUETA_NIVEL(nivel)}`;

/*
 * ═══════════ EL HALO Y LAS CUERDAS SE RETIRAN POR DEBAJO DE 40 px ═══════════
 *
 * A 36 y a 24 —ranking y liga— los dos anillos del halo y las cuerdas internas
 * no se leen: se convierten en una sombra sucia alrededor de la figura y en
 * ruido dentro. El nivel SIGUE SIENDO el que es; lo que se retira es su adorno
 * más fino, igual que un sello pequeño no lleva la filigrana del grande.
 */
export const UMBRAL_DETALLE = 40;

export function ajustarAlTamano(props, tamano) {
  if (Number(tamano) >= UMBRAL_DETALLE) return props;
  return { ...props, showHalo: false, chords: [] };
}
