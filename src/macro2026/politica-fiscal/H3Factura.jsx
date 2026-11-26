/*
 * H3 · La factura con lupa (pf26-h3-factura, Hacer, Medio, 25 × 3 = 75 FP × %).
 * Especificación de Gen, t3 §2 H3; corregida el 25-nov por pedido de Mateo.
 * El estudiante es asesor tributario: cada documento llega con su cliente
 * (DOCUMENTOS_H3[].cliente) y su pregunta en la franja de escena. Un
 * documento con aspecto de recibo real (papel, renglones, montos), sin logos.
 * Tocar una línea la resalta y abre, PEGADA debajo de ella, una pestaña con
 * cinco fichas (3 + 2) y, si fallas, la retro del par ahí mismo; nunca una
 * ventana que tape el documento. Correcto: la línea se pinta del color de su
 * tributo con ✓ y un papelito con su monto cae en su BUZÓN ilustrado
 * (impuestos, tasas o contribuciones: los mismos tres de A2). Los buzones
 * suman en vivo lo que es tributo; «No es tributo» se queda en el papel.
 * Incorrecto: coral breve y la línea queda abierta para reintentar (ya no
 * puntúa). Partida: 3 documentos de 4 (3 etapas). Puntaje = líneas
 * correctas al primer intento / total de líneas.
 */
import { useMemo, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { tonoTributo } from "../comun/tributos.js";
import { IconoDirecto, IconoIndirecto } from "../comun/iconos-pf.jsx";
import { Objeto } from "../comun/kit.jsx";
import { BuzonIlustrado } from "../comun/ilustrados.jsx";
import { BUZONES_H3, CONSIGNAS, DOCUMENTOS_H3, FICHAS_H3, H3, PARTIDA_H3, RETRO_H3, ESCENAS } from "./textos.js";

export const ID = "pf26-h3-factura";
export const prepararH3 = (rng = Math.random) => sortear(DOCUMENTOS_H3, PARTIDA_H3, rng);
const ficha = (id) => FICHAS_H3.find((f) => f.id === id);
const esTributo = (clave) => clave !== "no";
const buzonDe = (clave) => BUZONES_H3.find((b) => b.claves.includes(clave))?.id ?? null;
/* «$1.400.280» → 1400280; «≈ US$ 38» o null → null (no se suma). */
export const pesos = (monto) => (monto && /^\$[\d.]+$/.test(monto) ? Number(monto.slice(1).replaceAll(".", "")) : null);
export const formatoPesos = (n) => `$${n.toLocaleString("es-CO").replaceAll(",", ".").replaceAll("\u00a0", ".")}`;
/* Un documento se suma en pesos solo si TODOS sus tributos traen monto exacto. */
export const sumable = (doc) => doc.lineas.filter((l) => esTributo(l.clave)).every((l) => pesos(l.monto) !== null);

const PAPEL = "#f4f1ea", TINTA = "#1c2230";
const CSS = `
.pf26-h3-papel { position: relative; padding: 10px 8px 8px; border-radius: 6px; background: ${PAPEL}; color: ${TINTA}; box-shadow: 0 2px 0 rgba(0,0,0,.25); }
.pf26-h3-titulo { display: flex; align-items: center; gap: 8px; margin: 0 0 4px; padding-bottom: 6px; border-bottom: 2px dashed rgba(28,34,48,.35); font: 700 15px/1.25 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); }
.pf26-h3-renglon { border-bottom: 1px dashed rgba(28,34,48,.2); padding: 3px 0; }
.pf26-h3-linea { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 48px; padding: 6px 8px; border-radius: 6px; border: 2px solid transparent; background: transparent; color: ${TINTA}; font: 500 14px/1.25 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); text-align: left; cursor: pointer; touch-action: manipulation; }
.pf26-h3-linea[aria-expanded="true"] { background: #fff6d8; border-color: ${TINTA}; border-radius: 6px 6px 0 0; }
.pf26-h3-linea[data-estado="mal"] { border-color: ${CORAL}; }
.pf26-h3-linea[data-hecha="1"] { cursor: default; border-color: var(--tono); background: var(--tono); color: ${TINTA_SOBRE_COLOR}; }
.pf26-h3-linea[data-hecha="1"][data-no="1"] { background: transparent; color: #4a5160; border-color: rgba(28,34,48,.3); border-style: dashed; }
.pf26-h3-monto { flex: none; font-weight: 700; font-variant-numeric: tabular-nums; }
.pf26-h3-marca { display: inline-flex; align-items: center; gap: 4px; font: 700 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-h3-pestana { margin: 0 0 4px; padding: 8px; border: 2px solid ${TINTA}; border-top: 0; border-radius: 0 0 10px 10px; background: #e6e0d2; }
.pf26-h3-fichas { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
.pf26-h3-fichas > :nth-child(-n+3) { grid-column: span 2; }
.pf26-h3-fichas > :nth-child(n+4) { grid-column: span 3; }
.pf26-h3-ficha { min-height: 44px; min-width: 0; padding: 4px 6px; border-radius: 999px; border: 2px solid var(--tono, ${BORDE}); background: ${SUPERFICIE_2}; color: ${INK}; font: 600 13px/1.15 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-h3-pestana .da26-retro { margin-top: 8px; font-size: 14px; }
.pf26-h3-pie { display: flex; justify-content: space-between; gap: 8px; margin-top: 6px; padding: 6px 8px 0; border-top: 2px solid rgba(28,34,48,.6); font: 700 15px/1.25 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); }
.pf26-h3-buzones-tit { margin: 14px 0 6px; font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; text-align: center; }
.pf26-h3-buzones { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.pf26-h3-buzon { position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 22px 2px 8px; border-radius: 12px; border: 2px solid var(--tono); background: ${FONDO}; color: ${INK}; text-align: center; }
.pf26-h3-buzon[data-vacio="1"] { border-style: dashed; border-color: ${BORDE}; }
.pf26-h3-buzon-nombre { max-width: 100%; hyphens: auto; overflow-wrap: anywhere; font: 700 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-h3-buzon-valor { font: 700 12px/1.2 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); font-variant-numeric: tabular-nums; }
.pf26-h3-buzon-cuenta { font: 500 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
.pf26-h3-papelito { position: absolute; top: 2px; left: 50%; max-width: 96%; padding: 2px 4px; border-radius: 3px; background: ${PAPEL}; color: ${TINTA}; font: 700 10px/1.3 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 1px 0 rgba(0,0,0,.3); transform: translateX(-50%); }
@keyframes pf26-h3-cae { 0% { transform: translate(-50%, -46px) rotate(-8deg); opacity: 0; } 60% { opacity: 1; } 100% { transform: translate(-50%, 0) rotate(0); opacity: 1; } }
.pf26-h3-papelito { animation: pf26-h3-cae 520ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes ilu-salta { 0%, 100% { transform: none; } 40% { transform: translateY(-6px) scale(1.06); } }
.ilu-salta { animation: ilu-salta 420ms cubic-bezier(.3,.9,.4,1) 1; }
.pf26-h3-suma { margin: 8px 0 0; text-align: center; font: 600 14px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pf26-h3-suma b { font-family: var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .pf26-h3-papelito, .ilu-salta { animation: none; } }
`;

function Marca({ clave }) {
  const f = ficha(clave);
  return (
    <span className="pf26-h3-marca">
      {clave === "directo" && <IconoDirecto size={16} />}
      {clave === "indirecto" && <IconoIndirecto size={16} />}
      {f.nombre} ✓
    </span>
  );
}

export default function H3Factura({ onTerminar, rng = null }) {
  const docs = useMemo(() => prepararH3(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [abierta, setAbierta] = useState(null);
  const [hechas, setHechas] = useState([]);
  const [falladas, setFalladas] = useState(new Set());
  const [retro, setRetro] = useState(null);
  const [rojo, setRojo] = useState(null);
  const [mal, setMal] = useState(0);
  const [detalle, setDetalle] = useState([]);
  const doc = docs[n];
  const enPesos = sumable(doc);
  const hecha = (id) => hechas.includes(id);
  const completo = doc.lineas.every((l) => hecha(l.id));
  /* Lo que ya cayó en cada buzón, en el orden en que cayó. */
  const enBuzon = (b) => hechas.map((id) => doc.lineas.find((l) => l.id === id)).filter((l) => buzonDe(l.clave) === b);
  const sumados = enPesos ? hechas.map((id) => doc.lineas.find((l) => l.id === id)).filter((l) => esTributo(l.clave)).reduce((a, l) => a + pesos(l.monto), 0) : null;

  const elegir = (l, eleccion) => {
    const item = `${doc.id}-${l.id}`;
    const primera = !falladas.has(l.id);
    if (eleccion === l.clave) {
      if (primera) setDetalle((d) => [...d, { item, ok: true, subtemas: l.subtemas }]);
      setHechas((s) => [...s, l.id]);
      setAbierta(null);
      setRetro(null);
      return;
    }
    if (primera) setDetalle((d) => [...d, { item, ok: false, subtemas: l.subtemas }]);
    setFalladas((s) => new Set(s).add(l.id));
    setRetro(RETRO_H3[l.clave][eleccion]);
    setMal((m) => m + 1);
    setRojo(l.id);
    setTimeout(() => setRojo((r) => (r === l.id ? null : r)), 300);
  };

  const tocar = (id) => { setAbierta(abierta === id ? null : id); setRetro(null); };

  const seguir = () => {
    if (n + 1 >= docs.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setHechas([]);
    setFalladas(new Set());
    setAbierta(null);
    setRetro(null);
  };

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${docs.length}`}
      mini={{ etiqueta: ESCENAS[ID].porRonda.etiqueta, texto: doc.pregunta, mascota: doc.cliente, datos: { "data-pregunta": doc.id } }}>
      <style>{CSS}</style>
      <div className="pf26-h3-papel da26-entra" key={doc.id} data-figura data-documento={doc.id}>
        <p className="pf26-h3-titulo"><Objeto id="recibo" alto={36} />{doc.titulo}</p>
        {doc.lineas.map((l) => {
          const ya = hecha(l.id);
          const f = ficha(l.clave);
          return (
            <div key={l.id} className="pf26-h3-renglon">
              <button
                type="button"
                className="pf26-h3-linea"
                data-linea={l.id}
                data-hecha={ya ? "1" : "0"}
                data-no={l.clave === "no" ? "1" : undefined}
                data-estado={rojo === l.id ? "mal" : undefined}
                aria-expanded={abierta === l.id}
                disabled={ya}
                style={ya && f.tributo ? { "--tono": tonoTributo(f.tributo) } : undefined}
                onClick={() => tocar(l.id)}
              >
                <span>{l.texto}{ya && <><br /><Marca clave={l.clave} /></>}</span>
                {l.monto && <span className="pf26-h3-monto">{l.monto}</span>}
              </button>
              {abierta === l.id && (
                <div className="pf26-h3-pestana da26-entra">
                  <div className="pf26-h3-fichas" role="group" aria-label={`¿Qué es «${l.texto}»?`}>
                    {FICHAS_H3.map((x) => (
                      <button key={x.id} type="button" className="pf26-h3-ficha" data-ficha={x.id}
                        style={x.tributo ? { "--tono": tonoTributo(x.tributo) } : undefined} onClick={() => elegir(l, x.id)}>
                        {x.nombre}
                      </button>
                    ))}
                  </div>
                  <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
                </div>
              )}
            </div>
          );
        })}
        {doc.pie && <p className="pf26-h3-pie"><span>{doc.pie.rotulo}</span><span>{doc.pie.monto}</span></p>}
      </div>
      <p className="pf26-h3-buzones-tit">{H3.buzones}</p>
      <div className="pf26-h3-buzones" data-buzones>
        {BUZONES_H3.map((b) => {
          const dentro = enBuzon(b.id);
          const ultima = dentro[dentro.length - 1];
          const total = enPesos ? dentro.reduce((a, l) => a + pesos(l.monto), 0) : null;
          return (
            <div key={b.id} lang="es" className="pf26-h3-buzon" data-buzon={b.id} data-vacio={dentro.length ? "0" : "1"} data-lineas={dentro.length}
              style={{ "--tono": tonoTributo(b.id) }}>
              {ultima && <span className="pf26-h3-papelito" key={ultima.id} aria-hidden="true">{ultima.monto ?? ultima.texto}</span>}
              <BuzonIlustrado tributo={b.id} alto={64} abierto={dentro.length > 0} key={`${b.id}-${dentro.length}`} />
              <span className="pf26-h3-buzon-nombre">{b.nombre}</span>
              {enPesos && <span className="pf26-h3-buzon-valor">{formatoPesos(total)}</span>}
              <span className="pf26-h3-buzon-cuenta">{H3.papel(dentro.length)}</span>
            </div>
          );
        })}
      </div>
      {enPesos && <p className="pf26-h3-suma" role="status" aria-live="polite" data-sumados={sumados}>{H3.sumados} <b>{formatoPesos(sumados)}</b></p>}
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!completo} data-siguiente>{n + 1 >= docs.length ? H3.terminar : H3.siguiente}</Boton>
      </div>
    </MarcoHacer>
  );
}
