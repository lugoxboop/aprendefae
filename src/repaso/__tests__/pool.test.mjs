import { test } from "node:test";
import assert from "node:assert/strict";
import { SUBJECTS, HACER } from "../../data/subjects.js";
import { POOL, ACTIVIDADES_DEL_POOL, ACTIVIDADES_FUERA_DEL_POOL, poolDe } from "../items.js";
import { SUBTEMA_FIJO, SUBTEMA_REGLA } from "../subtemas.js";
import { MATERIAS_DEL_POOL } from "../repaso.js";
import { etiquetaDeItem } from "../../docente/etiquetasItem.js";
import { CAMBIOS_ACERCA } from "../../data/bloquesAvanzados.js";
import { REZAGO_REPASO, retroEscala } from "../../data/politicaMonetaria.js";

/*
 * El pool del Repaso Diario (B2, B2b, B2c): qué entra, cuánto, con qué clave,
 * con qué subtema y con qué devolución.
 */

const porClave = (clave) => {
  const x = POOL.find((i) => i.clave === clave);
  assert.ok(x, `no está en el pool: ${clave}`);
  return x;
};
const textos = (bloques) => bloques.map((b) => b.texto);

/* Las 30 de B2, literal: las once clasificaciones, tres predicciones, cuatro repartos, cuatro preguntas únicas, cuatro duelos, una línea de tiempo y tres de varias etapas. */
const B2 = [
  "caja-de-herramientas", "quien-decide-esto", "corriente-de-decisiones", "sala-monitores", "corriente-titulares",
  "que-rama-es", "cual-componente", "clasificador-tesoro", "directos-indirectos", "deficit-vs-deuda", "cobra-gasta-o-pide",
  "volante-de-la-tasa", "termometro-reacciones", "se-acerca-o-se-aleja",
  "a-quien-le-pega-la-tasa", "quien-gana-quien-pierde", "quien-afecta-ajuste", "quien-beneficia-auge",
  "dilema-banquero-central", "biopsia-economica", "agujero-fiscal", "expediente-gabinete",
  "duelo-de-instrumentos", "triage-emergencias", "consejo-ministros", "expansiva-contractiva",
  "el-rezago",
  "diagnostico-en-vivo", "electrocardiograma", "flujo-de-caja",
];

const hacerDeMacro = () =>
  SUBJECTS.macroeconomia.topics
    .filter((t) => MATERIAS_DEL_POOL.includes(t.id))
    .flatMap((t) => (t.actividades ?? []).filter((a) => a.clasificacion?.tipo === HACER)
      .map((a) => ({ id: a.id, tema: t.id, desafio: Boolean(a.clasificacion.desafio) })));

test("tamaño real del pool por materia: PE 84, DA 86, PF 72, PM 83", () => {
  const cuenta = {};
  for (const x of POOL) cuenta[x.materia] = (cuenta[x.materia] ?? 0) + 1;
  assert.deepEqual(cuenta, { "politica-economica": 84, "demanda-agregada": 86, "politica-fiscal": 72, "politica-monetaria": 83 });
});

test("aportan exactamente las 30 actividades de B2", () => {
  assert.deepEqual([...ACTIVIDADES_DEL_POOL].sort(), [...B2].sort());
});

test("ninguna actividad Hacer de Macro queda sin decidir: o aporta, o está en la lista de las que no", () => {
  const todas = hacerDeMacro().map((a) => a.id);
  const sinDecidir = todas.filter((id) => !ACTIVIDADES_DEL_POOL.includes(id) && !ACTIVIDADES_FUERA_DEL_POOL.includes(id));
  assert.deepEqual(sinDecidir, []);
  assert.deepEqual(ACTIVIDADES_DEL_POOL.filter((id) => ACTIVIDADES_FUERA_DEL_POOL.includes(id)), [], "ninguna en las dos listas");
  assert.deepEqual([...ACTIVIDADES_FUERA_DEL_POOL, ...ACTIVIDADES_DEL_POOL].sort(), [...todas].sort(), "y ninguna de más");
});

test("la clave es `actividad:item_id` con el item_id de la actividad de origen, y el panel docente la sabe leer", () => {
  for (const x of POOL) {
    assert.equal(x.clave, `${x.actividad}:${x.itemId}`);
    assert.ok(x.clave.length <= 120, `${x.clave}: registrar_fp recorta item_id a 120`);
    assert.ok(etiquetaDeItem(x.actividad, x.itemId), `el origen no reconoce ${x.clave}`);
    assert.ok(etiquetaDeItem("repaso-diario", x.clave), `el panel no lee ${x.clave} dentro del Repaso`);
  }
  /* La forma exacta que emiten los componentes, para las de varias partes. */
  for (const clave of [
    "diagnostico-en-vivo:brecha", "diagnostico-en-vivo:t1a", "quien-gana-quien-pierde:tasa:directo",
    "electrocardiograma:def:renta-disp", "electrocardiograma:frag:c-barra", "biopsia-economica:biopsia:a",
    "triage-emergencias:a:b-vs-c", "flujo-de-caja:multiplicador", "agujero-fiscal:por-que-renta",
    "el-rezago:sube-enero:interbancario", "a-quien-le-pega-la-tasa:sube-a-12:cdt-renovar",
    "dilema-banquero-central:dilema", "duelo-de-instrumentos:frenar:a-vs-c", "consejo-ministros:a-vs-b",
  ]) porClave(clave);
});

test("la única clave compartida es la de las dos lecturas de un término del Electrocardiograma", () => {
  const cuenta = new Map();
  for (const x of POOL) cuenta.set(x.clave, (cuenta.get(x.clave) ?? 0) + 1);
  const repetidas = [...cuenta].filter(([, n]) => n > 1);
  assert.equal(repetidas.length, 8);
  for (const [clave, n] of repetidas) {
    assert.match(clave, /^electrocardiograma:def:/);
    assert.equal(n, 2);
  }
});

test("cada ítem: su respuesta está entre las opciones, y cada opción tiene devolución con texto", () => {
  for (const x of POOL) {
    assert.ok(x.opciones.some((o) => o.id === x.correcta), `${x.clave}: sin la correcta`);
    assert.ok(x.enunciado, `${x.clave}: sin enunciado`);
    for (const o of x.opciones) {
      const b = x.devolucion(o.id);
      assert.ok(b.length > 0 && b.every((k) => k.texto), `${x.clave} · ${o.id}`);
      const franja = b.find((k) => k.tipo === "retro");
      if (franja && franja.texto.startsWith("❌")) assert.notEqual(o.id, x.correcta, `${x.clave}: ❌ en la correcta`);
      if (franja && o.id !== x.correcta) assert.ok(!franja.texto.startsWith("✅"), `${x.clave}: ✅ en una incorrecta`);
    }
  }
});

test("la devolución es la de la actividad de origen, literal", () => {
  assert.deepEqual(textos(porClave("sala-monitores:hospital").devolucion("I")), ["❌ Esto afecta Gasto público, no Inversión."]);
  assert.deepEqual(textos(porClave("sala-monitores:hospital").devolucion("G")), ["✅ Gasto público — bien identificado."]);
  assert.deepEqual(textos(porClave("triage-emergencias:a:b-vs-c").devolucion("C")), [
    "REVISA · VA PRIMERO AUMENTAR GASTO PÚBLICO EN INFRAESTRUCTURA",
    "El gasto público entra directo a G — el recorte de impuestos depende de que la gente realmente gaste, y parte se ahorra.",
  ]);
  /* Monetaria no trae franja de acierto en el reparto: solo la tarjeta. */
  assert.deepEqual(textos(porClave("a-quien-le-pega-la-tasa:sube-a-12:cdt-renovar").devolucion("gana")), [
    "GANA", "Le van a pagar más interés por el mismo dinero guardado.",
  ]);
  assert.deepEqual(textos(porClave("a-quien-le-pega-la-tasa:sube-a-12:cdt-renovar").devolucion("pierde")), [
    "GANA · ✗ te equivocaste", "Le van a pagar más interés por el mismo dinero guardado.",
    "❌ Revise el efecto real sobre su situación: Persona con un CDT a punto de renovar gana porque le van a pagar más interés por el mismo dinero guardado.",
  ]);
  assert.deepEqual(textos(porClave("electrocardiograma:frag:c-barra").devolucion("c-barra")).length, 1);
  assert.deepEqual(textos(porClave("duelo-de-instrumentos:frenar:a-vs-c").devolucion("c")), [
    "❌ La tasa es la señal que el mercado entiende y que mueve expectativas; las OMA sostienen esa señal, pero por sí solas no comunican una postura de política.",
  ]);
  assert.deepEqual(textos(porClave("volante-de-la-tasa:recesion-desempleo").devolucion("subir")), [
    "❌ En este escenario el Banco haría lo contrario. Recuerde la regla base: se sube para frenar precios, se baja para reactivar.",
  ]);
});

test("Parte C: ¿Se acerca o se aleja? y el Consejo de Ministros con el texto oficial", () => {
  const fila = porClave("se-acerca-o-se-aleja:gasto-sin-ingresos");
  assert.equal(fila.enunciado, "Sube el gasto público sin recaudar más");
  assert.deepEqual(textos(fila.devolucion("aleja")), ["✅ Se aleja — gastar más sin recaudar más agranda exactamente el hueco que se quería cerrar."]);
  assert.deepEqual(textos(fila.devolucion("acerca")), ["❌ Al revés — este cambio aleja al objetivo. Gastar más sin recaudar más agranda exactamente el hueco que se quería cerrar."]);
  assert.equal(porClave("se-acerca-o-se-aleja:sube-tasa").detalle.texto, "Controlar la inflación");
  assert.equal(porClave("se-acerca-o-se-aleja:peso-deprecia").detalle.texto, "Aumentar las exportaciones");

  const consejo = porClave("consejo-ministros:a-vs-b");
  assert.ok(consejo.opciones.some((o) => o.texto === "B · Mixto (gasto público + baja leve de tasa)"));
  assert.deepEqual(textos(consejo.devolucion("a")), ["❌ Gana el paquete mixto. Apostar todo al gasto público deja el resultado a merced de una sola palanca, y además una lenta de ejecutar."]);
});

/* B2b, literal de la ficha. */
const B2B = [
  ["sube-enero", "interbancario", "dias", "✅ Días — es el mercado donde los bancos se prestan entre sí, reacciona casi de inmediato."],
  ["sube-enero", "creditos-nuevos", "semanas", "✅ Semanas — cada banco necesita ajustar sus productos y contratos."],
  ["sube-enero", "solicitudes", "meses", "✅ Meses — la gente reacciona cuando ve las nuevas cuotas, no el mismo día del anuncio."],
  ["sube-enero", "consumo-hogares", "meses", "✅ Meses — primero se posterga la compra, después se nota en las cifras agregadas."],
  ["sube-enero", "inflacion-cede", "trimestres", "✅ Trimestres — es el último eslabón de toda la cadena y el más lento de todos."],
  ["baja-marzo", "fondeo", "dias", "✅ Días — es lo primero que cambia después de la decisión de la Junta."],
  ["baja-marzo", "creditos-baratos", "semanas", "✅ Semanas — los bancos tienen que rediseñar y publicar su oferta."],
  ["baja-marzo", "proyectos", "meses", "✅ Meses — requiere comités, decisiones internas y presupuesto. No es automático."],
  ["baja-marzo", "maquinaria-contratacion", "meses", "✅ Meses — entre aprobar un proyecto y ejecutarlo pasa un buen rato."],
  ["baja-marzo", "pib", "trimestres", "✅ Trimestres — es el resultado agregado final de toda la cadena."],
];

test("B2b: los diez hechos de El Rezago, con escala y acierto literales y la regla de error dinámica", () => {
  assert.equal(REZAGO_REPASO.flatMap((c) => c.hechos).length, 10);
  for (const [caso, hecho, escala, acierto] of B2B) {
    const x = porClave(`el-rezago:${caso}:${hecho}`);
    assert.equal(x.correcta, escala);
    assert.deepEqual(x.opciones.map((o) => o.texto), ["Días", "Semanas", "Meses", "Trimestres"]);
    assert.deepEqual(textos(x.devolucion(escala)), [acierto]);
  }
  const h = REZAGO_REPASO[0].hechos[0];
  assert.equal(
    retroEscala(h, "meses"),
    "❌ Esto tarda días, no meses. La regla gruesa: lo financiero reacciona en días, las decisiones de bancos en semanas, las decisiones de la gente y las empresas en meses, y los precios y el crecimiento en trimestres.",
  );
});

/*
 * LOS DESAFÍOS NO ENTRAN EN ESTA CUENTA, y conviene decir por qué en vez de
 * subir el número. Esta prueba comprueba que cada actividad tenga SU subtema,
 * uno; un desafío de cuatro etapas tiene cuatro, uno por etapa, y no viven en
 * el registro del Repaso porque no aportan ni un ítem al pool. Los suyos los
 * comprueba nova.test.mjs. Si algún día un desafío alimenta el pool, se quita
 * este filtro y la prueba pedirá su etiqueta como a cualquier otra.
 */
test("B2c: las 33 actividades de PE, DA y PF (sin Memoramas ni desafíos) tienen su subtema etiquetado", () => {
  const las33 = hacerDeMacro()
    .filter((a) => a.tema !== "politica-monetaria" && !a.id.startsWith("memorama-") && !a.desafio)
    .map((a) => a.id);
  assert.equal(las33.length, 33);
  const etiquetadas = new Set([...Object.keys(SUBTEMA_REGLA), ...Object.keys(SUBTEMA_FIJO).map((k) => k.split(":")[0])]);
  assert.deepEqual(las33.filter((id) => !etiquetadas.has(id)), []);
  for (const x of POOL) assert.ok(typeof x.subtema === "string" && x.subtema.length > 0, x.clave);
});

test("B2c: el vocabulario, con las dos decisiones de Mateo y los objetivos nuevos de la Parte C", () => {
  assert.equal(porClave("termometro-reacciones:sube-y").subtema, "Consumo (C)");
  const g = POOL.filter((x) => x.actividad === "termometro-reacciones" && x.enunciado.includes("Gasto público"));
  assert.ok(g.length > 0 && g.every((x) => x.subtema === "Gasto Público (G)"), "Ḡ → G");
  assert.ok(POOL.filter((x) => x.clave === "electrocardiograma:def:renta-disp").every((x) => x.subtema === "Consumo (C)"), "Renta disponible → C");
  assert.deepEqual(
    [...new Set(POOL.filter((x) => x.actividad === "se-acerca-o-se-aleja").map((x) => x.subtema))].sort(),
    CAMBIOS_ACERCA.map((f) => f.objetivo).sort(),
  );
  assert.equal(porClave("diagnostico-en-vivo:brecha").subtema, "Problemas macroeconómicos — magnitud de brechas");
  assert.equal(porClave("flujo-de-caja:multiplicador").subtema, "Multiplicador del gasto");
  assert.equal(porClave("clasificador-tesoro:mi-casa-ya").subtema, "Gasto de inversión");
  assert.equal(porClave("volante-de-la-tasa:recesion-desempleo").subtema, "Tipos de política monetaria");
});

test("poolDe: solo los ítems de lo completado", () => {
  assert.deepEqual(poolDe(new Set()), []);
  const uno = poolDe(new Set(["agujero-fiscal", "modelo-iceberg", "memorama-tesoro"]));
  assert.deepEqual(uno.map((x) => x.clave), ["agujero-fiscal:por-que-renta"]);
});
