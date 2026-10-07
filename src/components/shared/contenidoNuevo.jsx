import { useEffect, useRef, useState } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL AVISO DE CONTENIDO NUEVO (Xeno, P2; Levi).
 *
 * Una pastilla en la esquina superior derecha de la tarjeta del tema que dice
 * «Actividad nueva» o «2 actividades nuevas». Se apaga, de a una, cuando el
 * estudiante PULSA «EMPEZAR» y entra a la actividad nueva (tocar el nodo o ver
 * su ventana previa no cuenta), y en todo caso a los 14 días de publicada.
 *
 * Este archivo es uno de los tres cambios declarados, y el único que tiene
 * lógica: la lista de novedades, la cuenta, el registro de aperturas y la
 * pastilla. Los otros dos son una propiedad opcional en la tarjeta del tema
 * y una llamada en el «Empezar» del panel del nodo.
 *
 * ═══════════ LO QUE NO TOCA ═══════════
 *
 * No lee ni escribe progreso, puntos, ranking ni base de datos. Lo único que
 * guarda es, en el navegador del estudiante (localStorage, una clave por
 * usuario), qué actividades NUEVAS abrió. Si el navegador lo bloquea, todo
 * sigue igual y la marca se ve hasta el tope de 14 días.
 *
 * Con la lista vacía no pinta nada y no toca el almacenamiento: el sitio
 * queda idéntico píxel por píxel.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ═══════════ LA LISTA DE NOVEDADES, ESCRITA A MANO ═══════════
 *
 * Una entrada por tema:
 *   { materia, tema, tipo: "actividad" | "pieza", ids: [...], publicada: "AAAA-MM-DD" }
 * `publicada` es la fecha del despliegue real (hora de Bogotá). Vacía hasta
 * que se publiquen las actividades nuevas, en su mismo PR.
 */
export const NOVEDADES = [
  /* Las dos de Política Monetaria. La fecha, vacía: se pone la del despliegue aprobado; vacía, no se pinta. */
  { materia: "macroeconomia", tema: "politica-monetaria", tipo: "actividad", ids: ["las-dos-entradas", "por-cual-arteria-entra"], publicada: "" },
];

/*
 * Solo materias donde TODOS los temas abren sus actividades con «Empezar»
 * (el gancho que apaga la marca). En las demás no se muestra marca aunque
 * haya entradas: ninguna quedaría prendida 14 días sin poder apagarse (Levi).
 */
export const MATERIAS_CON_GANCHO = new Set(["macroeconomia"]);

export const DIAS_TOPE = 14;
const ACTIVIDAD = "actividad";
const PIEZA = "pieza";

/* El último instante en que se ve: la fecha de publicación + 14 días, a las 23:59:59 de Bogotá (UTC−5). */
export function finDeLaMarca(publicada) {
  const [a, m, d] = publicada.split("-").map(Number);
  return Date.UTC(a, m - 1, d + DIAS_TOPE, 23 + 5, 59, 59, 999);
}

/* Los textos de la interfaz (Xeno §2). */
export function textoDeMarca(pendientes) {
  const n = pendientes.length;
  if (n === 0) return null;
  const tipos = new Set(pendientes.map((p) => p.tipo));
  if (tipos.size > 1) return "Contenido nuevo";
  if (tipos.has(PIEZA)) return n === 1 ? "Pieza nueva" : `${n} piezas nuevas`;
  return n === 1 ? "Actividad nueva" : `${n} actividades nuevas`;
}

/* ═══════════ EL REGISTRO DE LO ABIERTO, POR USUARIO, EN EL NAVEGADOR ═══════════ */

const PREFIJO = "aprendefae-novedades:";
const almacen = () => globalThis.localStorage;

/* El usuario de la sesión guardada; si no hay o no se puede leer, «anonimo». */
function usuarioActual() {
  try {
    const crudo = almacen()?.getItem("aprendefae-auth");
    const id = crudo ? JSON.parse(crudo)?.user?.id : null;
    return typeof id === "string" && id ? id : "anonimo";
  } catch {
    return "anonimo";
  }
}

/* Lo abierto por este usuario. Si el navegador lo bloquea o el dato está roto: nada abierto. */
export function leerAbiertas(usuario = usuarioActual()) {
  try {
    const crudo = almacen()?.getItem(PREFIJO + usuario);
    const lista = crudo ? JSON.parse(crudo) : [];
    return new Set(Array.isArray(lista) ? lista.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/* ¿Está esta actividad en alguna entrada de la lista? */
export const esNovedad = (actividadId, lista = NOVEDADES) => lista.some((e) => e.ids.includes(actividadId));

/*
 * ═══════════ EL GANCHO DE «EMPEZAR» ═══════════
 *
 * Lo llama el panel del nodo DESPUÉS de abrir la actividad. Nunca puede
 * afectar ese arranque (Levi):
 *   · si la actividad no está en la lista, vuelve sin leer ni escribir nada;
 *   · el registro va diferido (no se espera) y todo va protegido: ningún
 *     error sale de aquí, ni ahora ni después.
 */
export function registrarApertura(actividadId, { lista = NOVEDADES, diferir = (f) => setTimeout(f, 0) } = {}) {
  try {
    if (!esNovedad(actividadId, lista)) return;
    diferir(() => {
      try {
        const usuario = usuarioActual();
        const abiertas = leerAbiertas(usuario);
        if (abiertas.has(actividadId)) return;
        abiertas.add(actividadId);
        almacen()?.setItem(PREFIJO + usuario, JSON.stringify([...abiertas]));
      } catch {
        /* Navegador bloqueado o lleno: la marca se ve hasta el tope. */
      }
    });
  } catch {
    /* Nada de esto puede tocar el arranque de la actividad. */
  }
}

/*
 * ═══════════ LA MARCA DE UN TEMA ═══════════
 *
 * Cuenta por tema, según el tema real de cada entrada. null = no se pinta.
 * Con la lista vacía (o sin entradas para este tema) vuelve antes de mirar
 * el almacenamiento.
 */
export function marcaDeTema(materia, tema, { lista = NOVEDADES, ahora = Date.now(), abiertas = null } = {}) {
  try {
    if (!MATERIAS_CON_GANCHO.has(materia)) return null;
    const entradas = lista.filter((e) => e.materia === materia && e.tema === tema && ahora <= finDeLaMarca(e.publicada));
    if (entradas.length === 0) return null;
    const abiertasYa = abiertas ?? leerAbiertas();
    const pendientes = entradas.flatMap((e) => e.ids.filter((id) => !abiertasYa.has(id)).map((id) => ({ id, tipo: e.tipo })));
    const texto = textoDeMarca(pendientes);
    return texto ? { texto, cuenta: pendientes.length, clave: `${materia}/${tema}/${pendientes.map((p) => p.id).join(",")}` } : null;
  } catch {
    return null;
  }
}

/* ═══════════ LA PASTILLA (Xeno §2, §6 y §9) ═══════════ */

const NAVY = "#1D3557";
const CSS = `
@keyframes fae-novedad-anillo { from { opacity: 0.9; box-shadow: 0 0 0 0 rgba(255,255,255,0.85); } to { opacity: 0; box-shadow: 0 0 0 8px rgba(255,255,255,0); } }
@keyframes fae-novedad-banda { from { transform: translateX(-120%); } to { transform: translateX(220%); } }
@media (prefers-reduced-motion: reduce) { .fae-novedad * { animation: none !important; } }
`;

function useReducido() {
  try { return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
}

/*
 * Un solo destello de 900 ms, una vez por sesión y por marca, 400 ms después
 * de que la tarjeta quede ≥ 60 % visible. Con movimiento reducido, ninguno.
 */
function useDestello(caja, clave, reducido) {
  const [destella, setDestella] = useState(false);
  useEffect(() => {
    if (reducido || typeof IntersectionObserver === "undefined") return undefined;
    const llave = `aprendefae-novedad-destello:${clave}`;
    try { if (globalThis.sessionStorage?.getItem(llave)) return undefined; } catch { /* sin sessionStorage: se permite una vez */ }
    let reloj = null;
    let fin = null;
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.intersectionRatio >= 0.6)) return;
      io.disconnect();
      reloj = setTimeout(() => {
        try { globalThis.sessionStorage?.setItem(llave, "1"); } catch { /* nada */ }
        setDestella(true);
        fin = setTimeout(() => setDestella(false), 900);
      }, 400);
    }, { threshold: [0.6] });
    if (caja.current) io.observe(caja.current);
    return () => { io.disconnect(); clearTimeout(reloj); clearTimeout(fin); };
  }, [clave, reducido, caja]);
  return destella;
}

export function PastillaNovedad({ marca, caja }) {
  const reducido = useReducido();
  const destella = useDestello(caja, marca.clave, reducido);
  /* Con texto grande la pastilla parte en 2 líneas (no se corta) y el radio pasa a 10 px. */
  const pastilla = useRef(null);
  const [dosLineas, setDosLineas] = useState(false);
  useEffect(() => {
    const el = pastilla.current;
    if (!el) return undefined;
    const medir = () => setDosLineas(el.getBoundingClientRect().height > 30);
    medir();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [marca.texto]);
  const radio = dosLineas ? "10px" : "999px";
  return (
    <span className="fae-novedad" data-novedad={marca.cuenta} lang="es" style={{
      position: "absolute", top: "-12px", right: "16px", zIndex: 3, pointerEvents: "none", maxWidth: "calc(100% - 32px)",
      /* Sin caja de línea alrededor: la pastilla mide sus 24 px, 12 dentro y 12 fuera. */
      display: "flex",
    }}>
      <style>{CSS}</style>
      {/* El anillo del destello: se expande 8 px por fuera y se desvanece. */}
      {destella && <span aria-hidden="true" data-destello style={{ position: "absolute", inset: 0, borderRadius: radio, animation: "fae-novedad-anillo 900ms ease-out both" }} />}
      <span ref={pastilla} style={{
        position: "relative", display: "inline-flex", alignItems: "center", gap: "5px", minHeight: "24px", maxWidth: "100%",
        boxSizing: "border-box", padding: "2px 10px 2px 8px", borderRadius: radio, overflow: "hidden",
        /* Sin borde (Levi): lo que delimita la pastilla es el relleno blanco contra la tarjeta. */
        background: "#FFFFFF", color: NAVY,
        fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, lineHeight: 1.2,
      }}>
        {/* La banda tenue que cruza el fondo por detrás del texto; el contraste no cambia. */}
        {destella && (
          <span aria-hidden="true" style={{
            position: "absolute", top: 0, bottom: 0, left: 0, width: "40%",
            background: "linear-gradient(90deg, transparent, rgba(29,53,87,0.12), transparent)",
            animation: "fae-novedad-banda 900ms ease-in-out both",
          }} />
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", position: "relative" }}>
          <path d="M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
        </svg>
        <span style={{ position: "relative" }}>{marca.texto}</span>
      </span>
    </span>
  );
}

/*
 * La envoltura que usa la tarjeta SOLO cuando hay marca: un contenedor nuevo
 * con position: relative (la tarjeta no lo es) y la pastilla antes de la
 * tarjeta, para que se lea primero. Sin marca, la tarjeta no cambia.
 */
export function ConMarca({ marca, children }) {
  const caja = useRef(null);
  return (
    <div ref={caja} data-con-novedad style={{ position: "relative" }}>
      <PastillaNovedad marca={marca} caja={caja} />
      {children}
    </div>
  );
}
