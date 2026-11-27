/*
 * GESTIÓN DE PROYECTOS · MOTOR «CASILLAS» (lote 3, caps. 5 y 6): llenar una o
 * varias casillas y comprobar.
 *
 * Es la mecánica que faltaba: escribir el resultado de un cálculo (la urna, la
 * regla del 100 %, el semáforo, la cinta métrica, la sumadora, el metro de la
 * ruta crítica, la torre de bloques, el rotafolio) o elegir varias cosas que
 * van juntas (una fila del telar: objetivo, entregable y prueba). Cada casilla
 * es un número (teclado numérico del teléfono, `inputMode="decimal"`, acepta
 * coma; con `flechas`, ◀ ▶ para mover de a uno) o un grupo de botones.
 *
 * El paso vale UN ítem: cuenta si todas las casillas están bien al primer
 * intento (diseño c06 H07: «una estación cuenta solo si todas sus casillas
 * están bien»). Error: coral en las casillas que fallan, la retro (y la
 * fórmula, si el paso la trae) y segundo intento sin puntaje; si el segundo
 * también yerra, se muestran las respuestas y se sigue con «Seguir».
 * La escena es la misma de Decidir (antes / encima / despues / objeto / mesa).
 *
 * Lote 4 (caps. 7 y 8), todo opcional y por casilla:
 *   salto       las flechas mueven de a `salto` (el imán cada 20 del embudo).
 *   signo       un botón «− / +» que cambia el signo (el teclado decimal del
 *               teléfono no siempre trae el menos: CV −75, VAC −300).
 *   tolerancia  acepta la clave ± tolerancia (±1 en enteros, ±0,01 en índices).
 *   retro       la retro propia de la casilla; se lee la de cada casilla que
 *               falla (si el paso no trae una común).
 *   trampas     [{ valor, retro }]: el error típico con su retro (el CPI
 *               invertido, 1,25).
 *   marcar      varias opciones a la vez (tocar las que son); `clave` es la
 *               lista de las que van. Cada opción puede traer su `retro`.
 */
import { useEffect, useRef, useState } from "react";
import { Boton, Retro } from "../../../macro2026/comun/ui.jsx";
import { Personaje } from "../elenco.jsx";
import { Objeto } from "../objetos.jsx";

const ESPERA_BIEN = 900;

const CSS = `
.gp-casillas { display: grid; gap: 10px; margin-top: 12px; }
.gp-casilla { display: grid; gap: 6px; padding: 8px 10px; border-radius: 12px; border: 2px solid rgba(244,245,247,.4); background: rgba(8,16,30,.72); }
.gp-casilla[data-estado="mal"] { border-color: #E76F51; }
.gp-casilla[data-estado="bien"] { border-color: #f4f5f7; }
.gp-casilla-nombre { font: 700 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); }
.gp-casilla-fila { display: flex; align-items: center; gap: 8px; }
.gp-casilla input { flex: 1 1 auto; min-width: 0; width: 100%; min-height: 48px; padding: 6px 10px; border-radius: 10px; border: 2px solid #f4f5f7; background: #fbf7ee; color: #121418;
  font: 700 22px/1.1 var(--planck-font-mono, ui-monospace, monospace); text-align: center; }
.gp-casilla input:focus-visible { outline: 3px solid var(--gp-acento, #a7bbff); outline-offset: 2px; }
.gp-casilla-unidad { flex: none; font: 600 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); color: #d7dbe2; }
.gp-flecha { flex: none; min-width: 48px; min-height: 48px; border-radius: 10px; border: 2px solid rgba(244,245,247,.55); background: rgba(31,50,80,.92); color: #f4f5f7; font: 800 18px/1 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.gp-opciones { display: grid; gap: 6px; grid-template-columns: repeat(var(--gp-cols, 2), minmax(0, 1fr)); }
.gp-opcion { min-height: 48px; padding: 6px 8px; border-radius: 10px; border: 2px solid rgba(244,245,247,.45); background: rgba(31,50,80,.6); color: #f4f5f7; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; text-align: center; touch-action: manipulation; }
.gp-opcion[aria-pressed="true"] { border-color: #f4f5f7; background: #fbf7ee; color: #121418; }
.gp-opcion[aria-pressed="true"]::before { content: "● "; }
.gp-signo { flex: none; min-width: 48px; min-height: 48px; border-radius: 10px; border: 2px solid rgba(244,245,247,.55); background: rgba(31,50,80,.92); color: #f4f5f7; font: 800 17px/1 var(--planck-font-mono, monospace); cursor: pointer; touch-action: manipulation; }
.gp-casilla-sol { font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: #d7dbe2; }
.gp-formula { margin: 6px 0 0; padding: 6px 10px; border-radius: 10px; background: rgba(8,16,30,.8); font: 600 14px/1.35 var(--planck-font-mono, ui-monospace, monospace); color: #f4f5f7; }
@media (max-width: 359px) { .gp-opciones { --gp-cols: 1; } }
`;

/* «7,5» o «7.5» → 7.5; vacío o basura → null. */
export const numeroDe = (v) => {
  const t = String(v ?? "").trim().replace(/\s/g, "").replace(/\u2212/g, "-").replace(",", ".");
  if (t === "" || !/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
};

/* ¿La respuesta de una casilla es buena? */
export function casillaBien(c, valor) {
  if (c.marcar) {
    const puestas = new Set(String(valor ?? "").split(",").filter(Boolean));
    return puestas.size === c.clave.length && c.clave.every((k) => puestas.has(k));
  }
  if (c.opciones) return valor === c.clave;
  const n = numeroDe(valor);
  if (n == null) return false;
  const tol = (c.tolerancia ?? 0) + 1e-9;
  return [c.clave, ...(c.aceptadas ?? [])].some((k) => Math.abs(Number(k) - n) <= tol);
}

/* La retro de una casilla que falla: la trampa que cayó, la de la opción marcada mal, o la suya. */
export function retroDeCasilla(c, valor) {
  if (c.marcar) {
    const puestas = new Set(String(valor ?? "").split(",").filter(Boolean));
    const malas = c.opciones.filter((o) => puestas.has(o.id) !== c.clave.includes(o.id));
    const propias = malas.map((o) => o.retro).filter(Boolean);
    return propias.length ? propias.join(" ") : c.retro ?? null;
  }
  const n = numeroDe(valor);
  const trampa = n == null ? null : (c.trampas ?? []).find((t) => Math.abs(Number(t.valor) - n) <= (c.tolerancia ?? 0) + 1e-9);
  return trampa?.retro ?? c.retro ?? null;
}

const coma = (v) => String(v).replace(".", ",").replace(/^-/, "−");
const textoClave = (c) => (c.marcar ? c.opciones.filter((o) => c.clave.includes(o.id)).map((o) => o.nombre).join(" · ")
  : c.opciones ? c.opciones.find((o) => o.id === c.clave)?.nombre : coma(c.clave));
const valorClave = (c) => (c.marcar ? c.clave.join(",") : c.opciones ? c.clave : String(c.clave));

export default function Casillas({ paso, escena = {}, estadoEtapa = null, alTerminar }) {
  const [valores, setValores] = useState(() => Object.fromEntries(paso.casillas.map((c) => [c.id, c.inicial != null ? String(c.inicial) : ""])));
  const [intento, setIntento] = useState(1);
  const [malas, setMalas] = useState(new Set());
  const [retro, setRetro] = useState(null);
  const [golpes, setGolpes] = useState(0);
  const [resuelto, setResuelto] = useState(null);
  const [listo, setListo] = useState(null);
  const detalle = useRef([]);
  const reloj = useRef(null);
  useEffect(() => () => clearTimeout(reloj.current), []);

  /* Una casilla de marcar puede quedar vacía a propósito (ninguna va); las demás, no. */
  const lleno = paso.casillas.every((c) => c.marcar || String(valores[c.id] ?? "").trim() !== "");
  const poner = (id, v) => { if (resuelto) return; setValores((x) => ({ ...x, [id]: v })); setMalas(new Set()); };
  const mover = (c, d) => {
    const n = numeroDe(valores[c.id]) ?? c.inicial ?? c.min ?? 0;
    const v = Math.max(c.min ?? -Infinity, Math.min(c.max ?? Infinity, n + d * (c.salto ?? 1)));
    poner(c.id, String(v));
  };
  const cambiarSigno = (c) => {
    const t = String(valores[c.id] ?? "").trim();
    poner(c.id, t.startsWith("-") ? t.slice(1) : `-${t}`);
  };
  const alternar = (c, id) => {
    const puestas = new Set(String(valores[c.id] ?? "").split(",").filter(Boolean));
    if (puestas.has(id)) puestas.delete(id); else puestas.add(id);
    poner(c.id, c.opciones.map((o) => o.id).filter((x) => puestas.has(x)).join(","));
  };

  const comprobar = () => {
    const fallan = paso.casillas.filter((c) => !casillaBien(c, valores[c.id]));
    const ok = fallan.length === 0;
    if (intento === 1) {
      detalle.current = [{ item: paso.id, ok, subtemas: paso.subtemas ?? null, ...(ok ? {} : { respuesta: paso.casillas.map((c) => valores[c.id]).join(" · ") }) }];
    }
    if (ok) {
      setRetro(null);
      setResuelto("bien");
      const res = { detalle: detalle.current, puntos: intento === 1 ? 1 : 0, destino: "bien" };
      if (paso.despues) { setListo(res); return; }
      reloj.current = setTimeout(() => alTerminar(res), ESPERA_BIEN);
      return;
    }
    const propias = fallan.map((c) => retroDeCasilla(c, valores[c.id])).filter(Boolean);
    /* La trampa que cayó manda sobre la retro común del paso. */
    const trampa = fallan.map((c) => { const n = numeroDe(valores[c.id]); return n == null ? null : (c.trampas ?? []).find((t) => Math.abs(Number(t.valor) - n) <= (c.tolerancia ?? 0) + 1e-9)?.retro; }).find(Boolean);
    setRetro(trampa ?? paso.retro ?? (propias.length ? [...new Set(propias)].join(" ") : null));
    setMalas(new Set(fallan.map((c) => c.id)));
    setGolpes((g) => g + 1);
    if (intento === 1) { setIntento(2); return; }
    setResuelto("visto");
    setValores(Object.fromEntries(paso.casillas.map((c) => [c.id, valorClave(c)])));
    setListo({ detalle: detalle.current, puntos: 0, destino: "visto" });
  };

  const encaja = resuelto ? "bien" : null;
  const estado = { paso, encaja, intento, mal: malas.size > 0, valores, revelado: Boolean(resuelto), etapa: estadoEtapa };
  const obj = paso.objeto ? { id: paso.objeto } : escena.objetoDe?.(paso) ?? escena.objeto ?? null;
  const quien = escena.mesa === false ? null : paso.mesa ?? escena.mesa ?? "tu";

  return (
    <div data-paso-id={paso.id} data-motor="casillas">
      <style>{CSS}</style>
      <div className="gp-visual" data-visual={escena.nombre ?? "escena"} data-anim={escena.anim ?? "cae"}
        style={{ "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento, "--gp-luz": escena.luz }}>
        {escena.antes?.(estado)}
        <div className="gp-mesa">
          {quien && <Personaje quien={quien} alto={124} animo={encaja && intento === 1 ? "feliz" : "quieta"} />}
          <div className="gp-centro">
            {paso.contexto && <p className="gp-contexto" data-contexto-paso>{paso.contexto}</p>}
            {paso.texto && <div className="gp-tarjeta" data-tarjeta-casillas={paso.id} style={{ cursor: "default" }}>{paso.texto}</div>}
            {obj?.id && (
              <div className="gp-protagonista" data-lugar={obj.lugar ?? "bajo"} style={escena.objetoEstilo?.(estado) ?? undefined}>
                <Objeto id={obj.id} alto={obj.alto ?? 84} />
              </div>
            )}
          </div>
        </div>
        {escena.encima?.(estado)}
        <div className="gp-casillas" role="group" aria-label="Respuesta">
          {paso.casillas.map((c) => {
            const est = malas.has(c.id) ? "mal" : resuelto === "bien" ? "bien" : undefined;
            const etq = `${paso.id}-${c.id}`;
            return (
              <div key={c.id} className="gp-casilla" data-casilla-caja={c.id} data-estado={est}>
                <label className="gp-casilla-nombre" htmlFor={c.opciones ? undefined : etq} id={`${etq}-n`}>{c.nombre}</label>
                {c.marcar ? (
                  <div className="gp-opciones" role="group" aria-labelledby={`${etq}-n`} style={{ "--gp-cols": c.columnas ?? 2 }}>
                    {c.opciones.map((o) => {
                      const puesta = String(valores[c.id] ?? "").split(",").includes(o.id);
                      return (
                        <button key={o.id} type="button" className="gp-opcion" data-casilla={c.id} data-marca-casilla={o.id}
                          aria-pressed={puesta} disabled={Boolean(resuelto)} onClick={() => alternar(c, o.id)}>
                          {o.nombre}
                        </button>
                      );
                    })}
                  </div>
                ) : c.opciones ? (
                  <div className="gp-opciones" role="group" aria-labelledby={`${etq}-n`} style={{ "--gp-cols": c.columnas ?? (c.opciones.length === 3 ? 3 : 2) }}>
                    {c.opciones.map((o) => (
                      <button key={o.id} type="button" className="gp-opcion" data-casilla={c.id} data-opcion-casilla={o.id}
                        aria-pressed={valores[c.id] === o.id} disabled={Boolean(resuelto)} onClick={() => poner(c.id, o.id)}>
                        {o.nombre}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="gp-casilla-fila">
                    {c.flechas && <button type="button" className="gp-flecha" aria-label="Uno menos" disabled={Boolean(resuelto)} onClick={() => mover(c, -1)} data-menos={c.id}>◀</button>}
                    <input id={etq} data-casilla={c.id} inputMode="decimal" autoComplete="off" enterKeyHint="done" value={valores[c.id] ?? ""}
                      disabled={Boolean(resuelto)} aria-invalid={malas.has(c.id) || undefined}
                      onChange={(ev) => poner(c.id, ev.target.value)}
                      onKeyDown={(ev) => { if (ev.key === "Enter" && lleno && !resuelto) comprobar(); }} />
                    {c.signo && <button type="button" className="gp-signo" aria-label="Cambiar el signo" disabled={Boolean(resuelto)} onClick={() => cambiarSigno(c)} data-signo={c.id}>− / +</button>}
                    {c.flechas && <button type="button" className="gp-flecha" aria-label="Uno más" disabled={Boolean(resuelto)} onClick={() => mover(c, 1)} data-mas={c.id}>▶</button>}
                    {c.unidad && <span className="gp-casilla-unidad">{c.unidad}</span>}
                  </div>
                )}
                {resuelto === "visto" && <span className="gp-casilla-sol" data-solucion={c.id}>Era: {textoClave(c)}{c.unidad && !c.opciones ? ` ${c.unidad}` : ""}</span>}
              </div>
            );
          })}
        </div>
        {escena.despues?.(estado)}
      </div>
      <Retro estado="mal" key={`r${golpes}`}>{retro}</Retro>
      {retro && paso.formula && <p className="gp-formula" data-formula>{paso.formula}</p>}
      {!resuelto && (
        <div className="gp-pie"><Boton primario onClick={comprobar} disabled={!lleno} data-comprobar-casillas>Comprobar</Boton></div>
      )}
      {listo && (
        <>
          {paso.despues && resuelto === "bien" && <p className="da26-retro da26-entra" data-estado="bien" data-despues>{paso.despues}</p>}
          <div className="gp-pie"><Boton primario onClick={() => alTerminar(listo)} data-seguir>Seguir</Boton></div>
        </>
      )}
    </div>
  );
}
