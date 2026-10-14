/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SONDA DE POSTDESPLIEGUE — que el servidor pueda pagar lo que el sitio ofrece
 *
 * POR QUÉ EXISTE. El 14 de octubre de 2026 había TRECE actividades publicadas
 * y jugables sin fila en actividad_catalogo: las dos de la 0052 y las once del
 * bloque 0045-0051. Las siete migraciones estaban escritas, correctas y en
 * main; nunca se habían corrido. Un estudiante que jugara cualquiera de las
 * trece veía su porcentaje y no recibía un solo FP.
 *
 * Y NINGUNA PRUEBA PODÍA VERLO. catalogo.test.mjs compara el cliente contra
 * los ARCHIVOS de migración, y los archivos estaban todos. Salía en verde.
 * Una migración escrita y nunca corrida es invisible para la suite: lo único
 * que la caza es preguntarle a la base.
 *
 * QUÉ MIRA, EN ESTE ORDEN DE GRAVEDAD:
 *   ROJO    una actividad que el cliente OFRECE y el servidor no tiene. Es el
 *           incidente: el estudiante juega y no le pagan.
 *   ROJO    la misma actividad con distinta modalidad, dificultad o FP en los
 *           dos lados. El sitio promete una cosa y el servidor paga otra.
 *   AVISO   una fila del servidor que el cliente ya no ofrece. Puede ser una
 *           actividad retirada a propósito, así que no tumba el despliegue;
 *           queda dicho para que alguien lo mire.
 *
 * NO ESCRIBE NADA. Una sola petición GET con la llave pública.
 *
 * LA LLAVE PÚBLICA PUEDE LEER EL CATÁLOGO DESDE LA 0150, y antes no: RLS
 * respondía HTTP 200 con una lista vacía. Por eso la sonda EXIGE que el
 * servidor devuelva filas: si vinieran cero, no diría «no falta ninguna»,
 * diría que no pudo leer. Un éxito con cero filas es el fallo que esta sonda
 * tiene que distinguir de la salud, no confundir con ella.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { SUBJECTS, HACER, actividadesDeTipo } from "../src/data/subjects.js";

/** Lo que el sitio ofrece: id → { modalidad, dificultad, fpBase }. */
export function catalogoDelCliente(subjects = SUBJECTS) {
  const m = new Map();
  for (const materia of Object.values(subjects)) {
    for (const tema of materia.topics ?? []) {
      for (const a of actividadesDeTipo(tema, HACER)) {
        if (a.pendiente) continue;
        const c = a.clasificacion;
        m.set(a.id, { modalidad: c.modalidad, dificultad: c.dificultad, fpBase: c.fpBase });
      }
    }
  }
  return m;
}

/**
 * La comparación, pura y sin red para que una prueba la pueda ejercitar.
 *   cliente   Map de id → { modalidad, dificultad, fpBase }
 *   servidor  filas tal como las devuelve PostgREST
 */
export function comparar(cliente, servidor) {
  if (!Array.isArray(servidor) || servidor.length === 0) {
    return { ilegible: true, faltan: [], distintas: [], sobran: [] };
  }
  const porId = new Map(servidor.map((f) => [f.activity_id, f]));
  const faltan = [...cliente.keys()].filter((id) => !porId.has(id));
  const distintas = [];
  for (const [id, c] of cliente) {
    const s = porId.get(id);
    if (!s) continue;
    if (s.modalidad !== c.modalidad || s.dificultad !== c.dificultad || Number(s.fp_base) !== c.fpBase) {
      distintas.push(`${id}: el sitio dice ${c.modalidad}/${c.dificultad}/${c.fpBase} y el servidor ${s.modalidad}/${s.dificultad}/${s.fp_base}`);
    }
  }
  const sobran = [...porId.keys()].filter((id) => !cliente.has(id));
  return { ilegible: false, faltan, distintas, sobran };
}

/* ─────────────────────────── lo que corre en CI ─────────────────────────── */

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.env.VITE_SUPABASE_URL;
  const llave = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !llave) {
    console.log("ROJO  faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY: la sonda no puede preguntar.");
    process.exit(1);
  }

  const r = await fetch(`${url}/rest/v1/actividad_catalogo?select=activity_id,modalidad,dificultad,fp_base`, {
    headers: { apikey: llave, Authorization: `Bearer ${llave}` },
  });
  if (!r.ok) {
    console.log(`ROJO  el servidor respondió HTTP ${r.status} al leer el catálogo.`);
    console.log(`      ${(await r.text()).slice(0, 300)}`);
    process.exit(1);
  }
  const filas = await r.json();
  const { ilegible, faltan, distintas, sobran } = comparar(catalogoDelCliente(), filas);

  if (ilegible) {
    console.log("ROJO  el catálogo vino VACÍO con HTTP 200.");
    console.log("      Eso no significa «no falta ninguna»: significa que no se pudo leer.");
    console.log("      Suele ser la política catalogo_legible (la 0150) ausente o revertida.");
    process.exit(1);
  }

  let fallo = 0;
  if (faltan.length) {
    console.log(`ROJO  ${faltan.length} actividad(es) que el sitio OFRECE y el servidor no puede pagar:`);
    for (const id of faltan) console.log(`        ${id}`);
    console.log("      Un estudiante que las termine recibe 22023 en vez de sus FP.");
    console.log("      Arreglo: correr su migración en el Editor SQL. Está escrita y no corrida.");
    fallo = 1;
  }
  if (distintas.length) {
    console.log(`ROJO  ${distintas.length} actividad(es) con distinta clasificación en los dos lados:`);
    for (const d of distintas) console.log(`        ${d}`);
    console.log("      El sitio promete una cosa y el servidor paga otra.");
    fallo = 1;
  }
  if (sobran.length) {
    console.log(`AVISO ${sobran.length} fila(s) del servidor que el sitio ya no ofrece: ${sobran.join(", ")}`);
    console.log("      Si están retiradas a propósito, está bien. Si no, alguien las dejó colgando.");
  }
  if (!fallo) {
    console.log(`OK    las ${catalogoDelCliente().size} actividades que ofrece el sitio tienen con qué pagarse,`);
    console.log(`      con la misma modalidad, dificultad y FP en los dos lados. ${filas.length} filas leídas del servidor.`);
  }
  process.exit(fallo);
}
