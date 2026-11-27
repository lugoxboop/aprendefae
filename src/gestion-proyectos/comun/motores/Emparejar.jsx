/*
 * GESTIÓN DE PROYECTOS · MOTOR «EMPAREJAR» (H06, cinco líneas de tiempo).
 *
 * Cinco rieles apilados; en cada uno el celular recorre la línea en bucle de
 * 4 s (diseño H06; con movimiento reducido queda quieto) y unas marcas dicen
 * qué pasa en cada tramo. Las cinco etiquetas esperan en una bandeja abajo y
 * se llevan al riel: arrastrar, tocar-tocar o teclado. Un ítem por riel: vale
 * si la PRIMERA etiqueta que recibe es la suya. Error: retro del par
 * (verdadero → puesta), segundo intento sin puntaje; al segundo error la
 * etiqueta buena va sola.
 */
import { useEffect, useRef, useState } from "react";
import { Retro } from "../../../macro2026/comun/ui.jsx";
import { useArrastre } from "../../../macro2026/comun/arrastre.js";
import { Personaje } from "../elenco.jsx";
import { Objeto } from "../objetos.jsx";

const CSS = `
.gp-rieles { display: grid; gap: 8px; }
.gp-riel { position: relative; display: grid; grid-template-columns: 28px 1fr; gap: 8px; align-items: stretch; min-height: 64px; padding: 6px 8px; border-radius: 12px; border: 2px dashed rgba(244,245,247,.45); background: rgba(8,16,30,.7); color: inherit; text-align: left; font: inherit; cursor: pointer; }
.gp-riel[data-blanco="1"] { border-style: solid; border-color: #f4f5f7; }
.gp-riel[data-estado="mal"] { border-color: #E76F51; border-style: solid; }
.gp-riel[data-estado="bien"] { border-style: solid; border-color: #f4f5f7; }
.gp-riel-letra { display: grid; place-items: center; border-radius: 8px; background: #f4f5f7; color: #121418; font: 800 15px/1 var(--planck-font-mono, monospace); }
.gp-riel-pista { position: relative; display: flex; flex-direction: column; justify-content: center; gap: 4px; min-width: 0; }
.gp-riel-linea { position: relative; height: 26px; }
.gp-riel-linea::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 3px; border-radius: 2px; background: rgba(244,245,247,.35); }
.gp-riel-movil { position: absolute; top: -3px; left: 0; animation: gp-recorre 4s linear infinite; }
@keyframes gp-recorre { from { transform: translateX(0); } to { transform: translateX(calc(var(--gp-ancho, 200px) - 20px)); } }
.gp-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.gp-chip { padding: 1px 6px; border-radius: 6px; background: rgba(244,245,247,.14); font: 500 12px/16px var(--planck-font-sans, system-ui, sans-serif); white-space: nowrap; }
.gp-chip[data-fijo] { background: #f2c14e; color: #121418; }
.gp-riel-puesta { justify-self: start; }
.gp-bandeja { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding: 10px; border-radius: 12px; background: rgba(8,16,30,.78); border: 1px solid rgba(244,245,247,.3); }
.gp-etiqueta { min-height: 44px; padding: 8px 12px; border-radius: 999px; border: 2px solid #f4f5f7; background: #fbf7ee; color: #121418; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; }
.gp-etiqueta[aria-pressed="true"] { box-shadow: 0 0 0 3px #6cc3d5; }
@media (prefers-reduced-motion: reduce) { .gp-riel-movil { animation: none; } }
`;

/* Lo que pasa en cada tramo de cada riel (diseño H06, A–E). */
const TRAMOS = {
  predictivo: [["Plano, reloj y bolsa fijos", true], ["obra"], ["App completa de una vez"]],
  iterativo: [["Plano desde el inicio", true], ["boceto · $ y ⏱ cambian"], ["borrador · cambian"], ["pulida"]],
  incremental: [["+ pago"], ["+ menú"], ["+ envío"], ["completa"]],
  adaptativo: [["plan de esta iteración"], ["prioridad cambia"], ["plan de esta iteración"], ["prioridad cambia"]],
  hibrido: [["pago: una línea fija", true], ["menú: vueltas cortas en paralelo"]],
};

function Riel({ riel, props, estado, puesta, nombre }) {
  const [ancho, setAncho] = useState(200);
  const ref = useRef(null);
  useEffect(() => { const w = ref.current?.getBoundingClientRect().width; if (w) setAncho(Math.round(w)); }, []);
  return (
    <button type="button" className="gp-riel" data-riel={riel.id} data-estado={estado ?? undefined} aria-label={`Línea de tiempo ${riel.letra}`} {...props}>
      <span className="gp-riel-letra" aria-hidden="true">{riel.letra}</span>
      <span className="gp-riel-pista">
        <span className="gp-riel-linea" ref={ref} style={{ "--gp-ancho": `${ancho}px` }}>
          <span className="gp-riel-movil" aria-hidden="true"><Objeto id="celular" alto={30} /></span>
        </span>
        <span className="gp-chips">
          {TRAMOS[riel.clave].map(([t, fijo], k) => <span key={k} className="gp-chip" data-fijo={fijo ? "1" : undefined}>{t}</span>)}
        </span>
        {puesta && <span className="gp-marca gp-riel-puesta">{nombre(puesta)}</span>}
      </span>
    </button>
  );
}

export default function Emparejar({ paso, escena = {}, alTerminar }) {
  const [puestas, setPuestas] = useState({});
  const [intentos, setIntentos] = useState({});
  const [mal, setMal] = useState(null);
  const [retro, setRetro] = useState(null);
  const [golpes, setGolpes] = useState(0);
  const detalle = useRef({});
  const nombre = (id) => paso.etiquetas.find((e) => e.id === id)?.nombre ?? id;

  const cerrarSi = (nuevas) => {
    if (Object.keys(nuevas).length < paso.rieles.length) return;
    const det = paso.rieles.map((r) => detalle.current[r.id]);
    setTimeout(() => alTerminar({ detalle: det, puntos: det.filter((d) => d.ok).length }), 1100);
  };

  const soltar = (etiqueta, rielId) => {
    const riel = paso.rieles.find((r) => r.id === rielId);
    if (!riel || puestas[rielId]) return;
    const n = (intentos[rielId] ?? 0) + 1;
    setIntentos((i) => ({ ...i, [rielId]: n }));
    if (!detalle.current[rielId]) detalle.current[rielId] = { item: rielId, ok: etiqueta === riel.clave, subtemas: ["gp-c1-ciclo-vida"], ...(etiqueta === riel.clave ? {} : { respuesta: etiqueta }) };
    if (etiqueta === riel.clave) {
      setRetro(null);
      const nuevas = { ...puestas, [rielId]: etiqueta };
      setPuestas(nuevas);
      cerrarSi(nuevas);
      return;
    }
    setRetro(paso.retros[riel.clave]?.[etiqueta] ?? null);
    setMal(rielId);
    setGolpes((g) => g + 1);
    setTimeout(() => setMal(null), 320);
    if (n >= 2) {
      const nuevas = { ...puestas, [rielId]: riel.clave };
      setPuestas(nuevas);
      cerrarSi(nuevas);
    }
  };

  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar });
  const usadas = new Set(Object.values(puestas));

  return (
    <div ref={contenedor} data-motor="emparejar">
      <style>{CSS}</style>
      <div className="gp-visual" data-visual="rieles" style={{ "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento }}>
        <div className="gp-mesa" style={{ minHeight: 0, marginBottom: 10 }}>
          <Personaje quien="equipo" alto={120} animo={Object.keys(puestas).length ? "feliz" : "quieta"} />
          <div className="gp-centro gp-sobre" aria-hidden="true">
            {["plano-enrollado", "celular", "reloj-arena", "bolsa-dinero"].map((o) => <Objeto key={o} id={o} alto={o === "celular" ? 72 : 52} />)}
          </div>
        </div>
        <div className="gp-rieles" role="group" aria-label="Líneas de tiempo">
          {paso.rieles.map((r) => (
            <Riel key={r.id} riel={r} props={destino(r.id)} nombre={nombre}
              estado={mal === r.id ? "mal" : puestas[r.id] ? "bien" : null} puesta={puestas[r.id]} />
          ))}
        </div>
        <div className="gp-bandeja" role="group" aria-label="Etiquetas">
          {paso.etiquetas.filter((e) => !usadas.has(e.id)).map((e) => (
            <button key={e.id} type="button" className="gp-etiqueta" data-etiqueta={e.id} aria-label={`${e.nombre}. Tócala y luego una línea de tiempo.`} {...pieza(e.id)}>
              {e.nombre}
            </button>
          ))}
          {usadas.size === paso.etiquetas.length && <span className="da26-rotulo">Todas puestas.</span>}
        </div>
      </div>
      <Retro estado="mal" key={`r${golpes}`}>{retro}</Retro>
    </div>
  );
}
