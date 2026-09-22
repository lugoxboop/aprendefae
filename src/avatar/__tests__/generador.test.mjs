import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PALETTES, SHAPES, verts, fmt, computeAvatarProps, FORMAS, PALETAS, NIVELES,
  PALETA_COMPARACION, NIVEL_COMPARACION, combinacionDe, leyenda, ajustarAlTamano, UMBRAL_DETALLE,
  NAVY_AVATAR, POR_DEFECTO,
} from "../generador.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL GENERADOR, COMPROBADO CONTRA LA ESPECIFICACIÓN Y NO CONTRA SÍ MISMO.
 *
 * Las tablas de abajo son una COPIA INDEPENDIENTE del kit de diseño, escrita a
 * mano en esta prueba. Comparar el módulo con un volcado de su propia salida no
 * demostraría nada: diría que hoy hace lo mismo que hoy. Así, si alguien toca un
 * color, un radio o un umbral de nivel en generador.js, aquí se cae.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PALETAS_ESPERADAS = {
  nocturno:    { c1: "#3D5A80", c2: "#2A9D8F", stroke: "#14263F", node: "#E76F51", ring: "#2A9D8F" },
  marea:       { c1: "#2A9D8F", c2: "#3D5A80", stroke: "#14263F", node: "#F2F5F8", ring: "#2A9D8F" },
  brasa:       { c1: "#E76F51", c2: "#3D5A80", stroke: "#14263F", node: "#2A9D8F", ring: "#E76F51" },
  aurora:      { c1: "#E76F51", c2: "#2A9D8F", stroke: "#3D5A80", node: "#3D5A80", ring: "#E76F51" },
  comparacion: { c1: "#4A5A72", c2: "#7A8798", stroke: "#9AA5B4", node: "#C8D0DA", ring: "#6B7A90" },
};

const FORMAS_ESPERADAS = {
  decaedro: { n: 10, rot: -90, alt: 1, step: 3 },
  prisma:   { n: 6, rot: -90, alt: 1, step: 2 },
  nucleo:   { n: 8, rot: -90, alt: 0.66, step: 3 },
  red:      { n: 12, rot: -90, alt: 1, step: 5 },
  cuna:     { n: 5, rot: -90, alt: 1, step: 2 },
};

test("las cinco paletas y las cinco formas son las del kit, valor por valor", () => {
  assert.deepEqual(PALETTES, PALETAS_ESPERADAS);
  assert.deepEqual(SHAPES, FORMAS_ESPERADAS);
});

test("verts: n vértices sobre el radio, con la punta arriba y el radio alterno de las estrelladas", () => {
  /* Punta arriba: el primer vértice está en (100, 100 - R) porque rot = -90. */
  const d = verts(SHAPES.decaedro, 84)[0];
  assert.ok(Math.abs(d[0] - 100) < 1e-9);
  assert.ok(Math.abs(d[1] - 16) < 1e-9);

  for (const clave of FORMAS) {
    const s = SHAPES[clave];
    const V = verts(s, 84);
    assert.equal(V.length, s.n, clave);
    V.forEach(([x, y], i) => {
      const esperado = 84 * (s.alt !== 1 && i % 2 ? s.alt : 1);
      const radio = Math.hypot(x - 100, y - 100);
      assert.ok(Math.abs(radio - esperado) < 1e-9, `${clave}[${i}]: radio ${radio} en vez de ${esperado}`);
      const angulo = (s.rot + (i * 360) / s.n) * Math.PI / 180;
      assert.ok(Math.abs(x - (100 + esperado * Math.cos(angulo))) < 1e-9);
      assert.ok(Math.abs(y - (100 + esperado * Math.sin(angulo))) < 1e-9);
    });
  }
  /* Núcleo es la única con radio alterno, y el corto es el 66% del largo. */
  const nucleo = verts(SHAPES.nucleo, 100);
  assert.ok(Math.abs(Math.hypot(nucleo[1][0] - 100, nucleo[1][1] - 100) - 66) < 1e-9);
});

test("fmt: un decimal por coordenada, coma entre pares y espacio entre puntos", () => {
  assert.equal(fmt([[1.234, 5.678], [10, 20]]), "1.2,5.7 10.0,20.0");
});

test("los cuatro niveles ponen y quitan exactamente lo que dice el kit", () => {
  for (const forma of FORMAS) {
    const s = SHAPES[forma];
    for (const paleta of PALETAS) {
      const p = PALETTES[paleta];
      const [uno, dos, tres, cuatro] = NIVELES.map((n) => computeAvatarProps(forma, paleta, n));

      /*
       * Nivel I: PRESENCIA. Bitono plano —contorno grueso en c1 y relleno
       * plano en c2 al 20%—, y nada más: sin nodos, radios, cuerdas, facetas,
       * núcleo ni halo.
       */
      assert.deepEqual(uno.nodes, [], `${forma}/${paleta}`);
      assert.deepEqual(uno.spokes, []);
      assert.deepEqual(uno.chords, []);
      assert.deepEqual(uno.facets, []);
      assert.equal(uno.showCore, false);
      assert.equal(uno.showHalo, false);
      assert.equal(uno.showGloss, false);
      assert.equal(uno.bodyFill, false, "el degradado es de III y IV");
      assert.equal(uno.flatFill, p.c2, "pero SÍ tiene relleno: plano, en c2");
      assert.equal(uno.flatFillOp, 0.2);
      assert.equal(uno.stroke, p.c1, "sin facetado el trazo es el color 1, no el de contorno");
      assert.equal(uno.sw, 3, "el trazo del bitono es más grueso: es lo que le da presencia");
      assert.equal(uno.coreR, 4);

      /*
       * Nivel II: + ESTRUCTURA. Hereda el cuerpo del I —mismo trazo, mismo
       * relleno plano— y le suma nodos, radios y núcleo. NO vuelve al
       * wireframe vacío: eso es lo que esta prueba defiende.
       */
      assert.equal(dos.bodyFill, false, "el II sigue en bitono, no en degradado");
      assert.equal(dos.flatFill, uno.flatFill, "el II hereda el relleno plano del I");
      assert.equal(dos.flatFillOp, uno.flatFillOp);
      assert.equal(dos.stroke, uno.stroke, "y el mismo trazo");
      assert.equal(dos.sw, uno.sw, "y el mismo grosor");
      assert.equal(dos.nodes.length, s.n);
      assert.equal(dos.spokes.length, Math.ceil(s.n / 2), "los radios van a los vértices pares");
      assert.deepEqual(dos.chords, []);
      assert.deepEqual(dos.facets, []);
      assert.equal(dos.showCore, true);
      assert.equal(dos.coreR, 4);
      assert.equal(dos.showHalo, false);
      assert.equal(dos.nodes[0].r, s.n > 10 ? 2.4 : 3.2, "en las de muchos lados el nodo es más pequeño");

      /* Nivel III: facetado. Relleno, trazo de contorno, facetas y núcleo mayor. */
      assert.equal(tres.facets.length, s.n);
      assert.equal(tres.bodyFill, true);
      assert.equal(tres.flatFill, null, "a partir del III manda el degradado, no el plano");
      assert.equal(tres.stroke, p.stroke);
      assert.equal(tres.sw, 2.2);
      assert.equal(tres.chordColor, "#FFFFFF");
      assert.equal(tres.insetStroke, "#FFFFFF");
      assert.equal(tres.insetFill, "rgba(255,255,255,0.07)");
      assert.equal(tres.insetOp, 0.38);
      assert.equal(tres.coreR, 5);
      assert.deepEqual(tres.chords, [], "las cuerdas son del IV, no del III");
      assert.equal(tres.showHalo, false);
      assert.equal(tres.showGloss, false);
      tres.facets.forEach((f, i) => assert.equal(f.op, i % 2 ? 0.17 : 0.05));

      /* Nivel IV: cuerdas, halo y lustre. */
      assert.equal(cuatro.chords.length, s.n);
      assert.equal(cuatro.showHalo, true);
      assert.equal(cuatro.showGloss, true);
      assert.equal(cuatro.ring, p.ring);

      /* La geometría no cambia con el nivel: el cuerpo es el mismo polígono. */
      assert.equal(dos.pts, uno.pts);
      assert.equal(cuatro.pts, uno.pts);
      /* Y el interior está al 44% del radio en las estrelladas y al 52% en las demás. */
      assert.equal(uno.insetPts, fmt(verts(s, 84 * (s.alt !== 1 ? 0.44 : 0.52))));
    }
  }
});

test("las cuerdas del nivel IV unen el anillo interior con el salto de cada forma", () => {
  for (const forma of FORMAS) {
    const s = SHAPES[forma];
    const W = verts(s, 84 * 0.8);
    const { chords } = computeAvatarProps(forma, "nocturno", 4);
    chords.forEach((c, i) => {
      const q = W[(i + s.step) % W.length];
      assert.equal(c.x1, +W[i][0].toFixed(1), forma);
      assert.equal(c.y1, +W[i][1].toFixed(1));
      assert.equal(c.x2, +q[0].toFixed(1));
      assert.equal(c.y2, +q[1].toFixed(1));
    });
  }
});

test("las 80 combinaciones se calculan y ninguna sale vacía o con NaN", () => {
  const vistas = new Set();
  for (const forma of FORMAS) {
    for (const paleta of PALETAS) {
      for (const nivel of NIVELES) {
        const a = computeAvatarProps(forma, paleta, nivel);
        assert.ok(a.pts.length > 0 && !a.pts.includes("NaN"), `${forma}/${paleta}/${nivel}`);
        assert.ok(!a.insetPts.includes("NaN"));
        vistas.add(`${a.pts}|${a.c1}|${a.c2}|${a.nodes.length}|${a.chords.length}|${a.facets.length}|${a.showHalo}`);
      }
    }
  }
  assert.equal(FORMAS.length * PALETAS.length * NIVELES.length, 80);
  assert.equal(vistas.size, 80, "cada combinación da una figura distinta de las demás");
});

test("valores fuera de rango caen en el defecto sin lanzar: decaedro, marea, nivel I", () => {
  const raro = computeAvatarProps("triangulo", "fucsia", 99);
  assert.equal(raro.pts, computeAvatarProps("decaedro", "nocturno", 4).pts, "forma desconocida → decaedro");
  assert.equal(raro.c1, PALETTES.marea.c1, "paleta desconocida → marea, el nuevo defecto");
  assert.equal(raro.showHalo, true, "99 se sujeta a 4");
  assert.equal(computeAvatarProps("decaedro", "nocturno", 0).showCore, false, "0 se sujeta a 1");
  assert.equal(computeAvatarProps("decaedro", "nocturno", null).coreR, 4);
});

/* ─────────────────── 'comparacion' no es elegible ─────────────────── */

test("'comparacion' NO está entre las paletas elegibles, y sí existe para las miniaturas", () => {
  assert.ok(!PALETAS.includes("comparacion"), "si se cuela como opción, es un bug");
  assert.equal(PALETAS.length, 4);
  assert.deepEqual(PALETAS, ["nocturno", "marea", "brasa", "aurora"]);
  assert.ok(PALETTES.comparacion, "pero existe: es la gris de las miniaturas de forma");
  assert.equal(PALETA_COMPARACION, "comparacion");
  assert.equal(NIVEL_COMPARACION, 2, "las miniaturas de forma van fijas en nivel II");
});

test("un perfil con la paleta de comparación guardada se lee como el defecto", () => {
  /* La base lo rechaza con un check, pero si llegara igual, no se pinta gris. */
  assert.equal(combinacionDe({ avatar_palette: "comparacion" }).paleta, "marea");
  assert.equal(combinacionDe({ avatar_shape: "octaedro" }).forma, "decaedro");
  assert.equal(combinacionDe({ avatar_level: 9 }).nivel, 1);
  assert.equal(combinacionDe(null).nivel, 1);
  assert.deepEqual(combinacionDe({ avatar_shape: "nucleo", avatar_palette: "marea", avatar_level: 2 }),
    { forma: "nucleo", paleta: "marea", nivel: 2 });
});

test("la leyenda del selector dice forma, paleta y nivel en romano", () => {
  assert.equal(leyenda({ forma: "nucleo", paleta: "marea", nivel: 2 }), "Núcleo · Marea · Nivel II");
  assert.equal(leyenda({ forma: "cuna", paleta: "aurora", nivel: 4 }), "Cuña · Aurora · Nivel IV");
});

/* ─────────────────── el retiro por tamaño ─────────────────── */

test("por debajo de 40 px se retiran halo y cuerdas, y el nivel sigue siendo el que es", () => {
  const iv = computeAvatarProps("decaedro", "nocturno", 4);
  assert.equal(UMBRAL_DETALLE, 40);

  for (const tamano of [24, 36, 39]) {
    const a = ajustarAlTamano(iv, tamano);
    assert.equal(a.showHalo, false, `${tamano} px: el halo no se lee`);
    assert.deepEqual(a.chords, [], `${tamano} px: las cuerdas son ruido`);
    /* Lo que SÍ se queda: el lustre, las facetas, los nodos y el núcleo. */
    assert.equal(a.showGloss, true);
    assert.equal(a.facets.length, 10);
    assert.equal(a.nodes.length, 10);
    assert.equal(a.showCore, true);
  }

  for (const tamano of [40, 56, 96, 176]) {
    const a = ajustarAlTamano(iv, tamano);
    assert.equal(a.showHalo, true, `${tamano} px: el halo sí se lee`);
    assert.equal(a.chords.length, 10);
  }
  /* Y no muta el original: la misma props sirve para los dos tamaños. */
  assert.equal(iv.showHalo, true);
  assert.equal(iv.chords.length, 10);
});

/* ─────────────────── los dos lados de la frontera con SQL ─────────────────── */

test("las formas y paletas del generador son las mismas que acepta la 0035", () => {
  const sql = readFileSync(new URL("../../../supabase/migrations/0035_avatares_y_cristales.sql", import.meta.url), "utf8");

  const formas = `avatar_shape in (${FORMAS.map((f) => `'${f}'`).join(", ")})`;
  assert.ok(sql.includes(formas), `la 0035 debería aceptar exactamente: ${formas}`);

  const paletas = `avatar_palette in (${PALETAS.map((p) => `'${p}'`).join(", ")})`;
  assert.ok(sql.includes(paletas), `la 0035 debería aceptar exactamente: ${paletas}`);

  /* Y en ninguna parte de la migración 'comparacion' es un valor aceptado. */
  assert.ok(!/in \([^)]*'comparacion'/.test(sql), "'comparacion' no puede ser un valor válido en la base");

  /* Los defectos del primer ingreso: Decaedro, Nocturno, nivel I y solo el I comprado. */
  assert.ok(sql.includes("avatar_shape           text      not null default 'decaedro'"));
  /*
   * LA 0035 SIGUE DICIENDO 'nocturno', y tiene que seguir diciendolo: es el
   * registro de lo que de verdad se aplico en produccion. El cambio a 'marea'
   * lo hace la 0038, y se comprueba abajo. Editar la 0035 dejaria CI y
   * produccion construyendo defectos distintos.
   */
  assert.ok(sql.includes("avatar_palette         text      not null default 'nocturno'"));
  assert.ok(sql.includes("avatar_level           integer   not null default 1"));
  assert.ok(sql.includes("avatar_unlocked_levels integer[] not null default '{1}'"));
});

/* ───────────────── lo que decidió Xeno, fijado aquí ───────────────── */

/*
 * El navy de marca no puede volver a las paletas de avatar. Se mira el OBJETO
 * de paletas, no el archivo entero: la cabecera lo nombra a propósito para
 * explicar por qué se fue, y nombrarlo no es usarlo.
 */
test("#1D3557 no aparece en ninguna paleta de avatar", () => {
  for (const [nombre, p] of Object.entries(PALETTES)) {
    for (const [papel, valor] of Object.entries(p)) {
      assert.notEqual(valor.toUpperCase(), "#1D3557",
        `${nombre}.${papel} volvió al navy de marca, que es el fondo del sitio`);
    }
  }
  const fuente = readFileSync(new URL("../generador.js", import.meta.url), "utf8");
  const objeto = fuente.slice(fuente.indexOf("export const PALETTES"), fuente.indexOf("export const SHAPES"));
  assert.ok(!/#1D3557/i.test(objeto), "ni escrito a mano dentro del objeto de paletas");
});

test("el navy de avatar es #3D5A80 y está en las cuatro paletas seleccionables", () => {
  assert.equal(NAVY_AVATAR, "#3D5A80");
  for (const nombre of PALETAS) {
    assert.ok(Object.values(PALETTES[nombre]).includes(NAVY_AVATAR), `${nombre} debería llevarlo`);
  }
  assert.ok(!Object.values(PALETTES.comparacion).includes(NAVY_AVATAR),
    "'comparacion' es gris y no se toca");
});

test("el defecto es Decaedro · Marea · Nivel I, y la base dice lo mismo", () => {
  assert.deepEqual(POR_DEFECTO, { forma: "decaedro", paleta: "marea", nivel: 1 });
  assert.deepEqual(combinacionDe(null), POR_DEFECTO, "un perfil vacío cae en el defecto entero");

  /*
   * Y el otro lado de la frontera. SQL no lee JavaScript, así que el default de
   * la columna está duplicado a la fuerza: esto lee la migración que lo fija.
   */
  const sql = readFileSync(new URL("../../../supabase/migrations/0038_default_de_paleta_marea.sql", import.meta.url), "utf8");
  assert.match(sql, /alter column avatar_palette set default 'marea'/,
    "la 0038 es la que pone el default de la columna");
  assert.ok(sql.includes(`avatar_palette = '${POR_DEFECTO.paleta}'`),
    "y el relleno tiene que mover a la misma paleta que usa el cliente");
});

test("el Nivel I y el Nivel II comparten cuerpo pero no se confunden", () => {
  for (const forma of FORMAS) {
    for (const paleta of PALETAS) {
      const uno = computeAvatarProps(forma, paleta, 1);
      const dos = computeAvatarProps(forma, paleta, 2);

      /* Lo que comparten: el cuerpo entero. El II hereda al I, no lo sustituye. */
      assert.equal(dos.pts, uno.pts, `${forma}/${paleta}`);
      assert.equal(dos.flatFill, uno.flatFill);
      assert.equal(dos.flatFillOp, uno.flatFillOp);
      assert.equal(dos.stroke, uno.stroke);
      assert.equal(dos.sw, uno.sw);

      /* Y lo que los separa: la estructura, que es la cualidad que suma el II. */
      assert.equal(uno.nodes.length, 0);
      assert.ok(dos.nodes.length > 0, "el II tiene nodos y el I no");
      assert.ok(dos.spokes.length > 0, "y radios");
      assert.equal(uno.showCore, false);
      assert.equal(dos.showCore, true);
    }
  }
});
