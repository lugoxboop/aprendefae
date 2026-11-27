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
.gp-casilla-sol { font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: #d7dbe2; }
.gp-formula { margin: 6px 0 0; padding: 6px 10px; border-radius: 10px; background: rgba(8,16,30,.8); font: 600 14px/1.35 var(--planck-font-mono, ui-monospace, monospace); color: #f4f5f7; }
@media (max-width: 359px) { .gp-opciones { --gp-cols: 1; } }
`;

/* «7,5» o «7.5» → 7.5; vacío o basura → null. */
export const numeroDe = (v) => {
  const t = String(v ?? "").trim().replace(/\s/g, "").replace(",", ".");
  if (t === "" || !/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
};

/* ¿La respuesta de una casilla es buena? */
export function casillaBien(c, valor) {
  if (c.opciones) return valor === c.clave;
  const n = numeroDe(valor);
  if (n == null) return false;
  return [c.clave, ...(c.aceptadas ?? [])].some((k) => Math.abs(Number(k) - n) < 1e-9);
}

const textoClave = (c) => (c.opciones ? c.opciones.find((o) => o.id === c.clave)?.nombre : String(c.clave).replace(".", ","));

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

  const lleno = paso.casillas.every((c) => String(valores[c.id] ?? "").trim() !== "");
  const poner = (id, v) => { if (resuelto) return; setValores((x) => ({ ...x, [id]: v })); setMalas(new Set()); };
  const mover = (c, d) => {
    const n = numeroDe(valores[c.id]) ?? c.inicial ?? c.min ?? 0;
    const v = Math.max(c.min ?? -Infinity, Math.min(c.max ?? Infinity, n + d));
    poner(c.id, String(v));
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
    setRetro(paso.retro ?? null);
    setMalas(new Set(fallan.map((c) => c.id)));
    setGolpes((g) => g + 1);
    if (intento === 1) { setIntento(2); return; }
    setResuelto("visto");
    setValores(Object.fromEntries(paso.casillas.map((c) => [c.id, c.opciones ? c.clave : String(c.clave)])));
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
                {c.opciones ? (
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
