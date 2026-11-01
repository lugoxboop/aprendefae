/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FÁBRICA, DEL LADO DEL PANEL
 *
 * Todo lo que no es pintura: leer los archivos que el profesor arrastró,
 * comprobarlos antes de mandarlos, llamar a la función de servidor y pedir
 * los borradores. Separado para poder probarlo con Node, sin navegador.
 *
 * LAS MISMAS COMPROBACIONES ESTÁN EN EL SERVIDOR. Aquí se hacen para que el
 * profesor se entere al instante y no después de subir 8 MB; allá, porque lo
 * que decide de verdad nunca puede ser el navegador.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MAX_ARCHIVOS = 3;
export const MAX_BYTES = 8 * 1024 * 1024;

export const TIPOS = {
  "application/pdf": "PDF",
  "text/plain": "texto",
  "text/markdown": "texto",
  "text/csv": "texto",
};

/* Algunos navegadores no ponen `type` en un .md o un .csv: se mira la extensión. */
export function tipoDe(archivo) {
  const t = String(archivo?.type ?? "").split(";")[0].trim().toLowerCase();
  if (TIPOS[t]) return t;
  const n = String(archivo?.name ?? "").toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".md")) return "text/markdown";
  if (n.endsWith(".csv")) return "text/csv";
  if (n.endsWith(".txt")) return "text/plain";
  return null;
}

export const MOTIVOS = {
  tipo: "Solo acepto PDF o texto por ahora.",
  peso: "Ese archivo pesa más de 8 MB. Sube solo el capítulo o el tema.",
  cuantos: `Máximo ${MAX_ARCHIVOS} archivos por encargo.`,
  vacio: "Escribe qué quieres que haga, o adjunta un archivo.",
};

/** Revisa la lista antes de leer un solo byte. Devuelve el primer motivo que falle. */
export function revisar(archivos) {
  const lista = Array.from(archivos ?? []);
  if (lista.length > MAX_ARCHIVOS) return MOTIVOS.cuantos;
  for (const a of lista) {
    if (!tipoDe(a)) return MOTIVOS.tipo;
    if (Number(a.size) > MAX_BYTES) return MOTIVOS.peso;
  }
  return null;
}

export const formatearPeso = (bytes) => {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

/*
 * De un File a lo que viaja: base64 sin la cabecera `data:...;base64,`.
 *
 * Con FileReader y no con arrayBuffer + btoa a mano: un PDF de varios megas
 * convertido byte a byte en JavaScript bloquea la pestaña varios segundos, y
 * el profesor cree que se colgó.
 */
export function aBase64(archivo, Lector = typeof FileReader !== "undefined" ? FileReader : null) {
  return new Promise((resolver, rechazar) => {
    if (!Lector) return rechazar(new Error("Este navegador no puede leer archivos."));
    const lector = new Lector();
    lector.onload = () => {
      const s = String(lector.result ?? "");
      const coma = s.indexOf(",");
      resolver(coma >= 0 ? s.slice(coma + 1) : s);
    };
    lector.onerror = () => rechazar(new Error("No se pudo leer el archivo."));
    lector.readAsDataURL(archivo);
  });
}

/** Prepara el lote para el servidor. */
export async function empaquetar(archivos, leer = aBase64) {
  const salida = [];
  for (const a of Array.from(archivos ?? [])) {
    salida.push({ nombre: a.name, tipo: tipoDe(a), datos: await leer(a) });
  }
  return salida;
}

/*
 * El encargo. Devuelve siempre un objeto con `ok`, nunca lanza: un fallo de
 * red no puede tumbarle el panel a nadie.
 */
export async function encargar(cliente, { materia, mensaje, archivos } = {}) {
  const texto = String(mensaje ?? "").trim();
  const lista = Array.from(archivos ?? []);
  if (!texto && lista.length === 0) return { ok: false, motivo: MOTIVOS.vacio };
  const malo = revisar(lista);
  if (malo) return { ok: false, motivo: malo };
  if (!cliente) return { ok: false, motivo: "Sin conexión con el servidor." };

  try {
    const { data, error } = await cliente.functions.invoke("fabrica", {
      body: { materia, mensaje: texto, archivos: await empaquetar(lista) },
    });
    if (error) {
      /* La función contesta con su propio motivo en el cuerpo; supabase-js lo
         envuelve en un error genérico, así que se intenta sacar el de dentro. */
      let motivo = "No pude crear las actividades. Inténtalo otra vez.";
      try { motivo = (await error.context?.json?.())?.error ?? motivo; } catch { /* se queda el genérico */ }
      return { ok: false, motivo };
    }
    return { ok: true, creadas: Number(data?.creadas ?? 0), piezas: data?.piezas ?? [], descartadas: Number(data?.descartadas ?? 0) };
  } catch (e) {
    return { ok: false, motivo: String(e?.message ?? "No pude crear las actividades.") };
  }
}

/** Los borradores de este docente en esta materia. */
export async function misBorradores(cliente, materia) {
  if (!cliente) return { ok: false, borradores: [] };
  const { data, error } = await cliente.rpc("mis_borradores", { p_materia: materia });
  if (error) return { ok: false, borradores: [], motivo: error.message };
  return { ok: true, borradores: Array.isArray(data) ? data : [] };
}

/** Publicar o descartar uno. */
export async function cambiarEstado(cliente, id, estado) {
  if (!cliente) return { ok: false };
  const { data, error } = await cliente.rpc("estado_borrador", { p_id: id, p_estado: estado });
  if (error) return { ok: false, motivo: error.message };
  return { ok: data === true };
}
