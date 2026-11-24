/*
 * A2 · La ventanilla del BanRep (pm26-a2-ventanilla, Aprender).
 * Especificación de Gen, t4 §2 A2. Una ventanilla de dos lados con el
 * edificio del Banco de la República (objeto del kit): por la izquierda entra
 * un activo; por la derecha sale un fajo de pesos. Arriba, el contador
 * «Base monetaria».
 * P1 la autoridad económica (el panda, pose «grifo», 180 px: protagoniza).
 * P2 el dólar se arrastra (o se toca) a la ventanilla: sale un fajo y el
 * contador sube; arriba, la escena «viajero-banco-central».
 * P3 el pagaré. P4 «El BanRep vende»: el activo vuelve y el fajo regresa.
 * P5 el estante con billetes quietos. P6 el contador se rotula.
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { useArrastre } from "../comun/arrastre.js";
import { Objeto } from "../comun/kit.jsx";
import { EscenaMascotas } from "../comun/mascotas.jsx";
import { fmtEntero } from "../comun/modelo-da.js";
import { CALIDO, CSS_PM, MONETARIA } from "./comun-pm.jsx";
import { A2, APRENDER, ESCENAS } from "./textos.js";

export const ID = "pm26-a2-ventanilla";
const TEXTOS = APRENDER[ID];
const BASE_INICIAL = 1000;

export const CSS_VENTANILLA = `
.pm26-vent { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 6px; }
.pm26-vent-lado { display: grid; place-items: center; min-height: 76px; border-radius: 12px; border: 1px dashed ${BORDE}; background: ${FONDO}; overflow: hidden; }
.pm26-vent-banco { cursor: pointer; display: grid; justify-items: center; gap: 2px; padding: 6px; border-radius: 14px; border: 2px solid ${MONETARIA}; background: ${FONDO}; color: ${INK}; font: 600 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); text-align: center; min-width: 96px; }
.pm26-vent-banco[data-blanco="1"] { box-shadow: 0 0 0 3px ${MONETARIA}; }
@keyframes pm26-entra-izq { from { transform: translateX(-60px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pm26-sale-der { from { transform: translateX(-50px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pm26-vuelve-izq { from { transform: translateX(60px); opacity: 0; } to { transform: none; opacity: 1; } }
.pm26-entra-izq { animation: pm26-entra-izq 480ms cubic-bezier(.3,.9,.4,1) both 1; }
.pm26-sale-der { animation: pm26-sale-der 480ms cubic-bezier(.3,.9,.4,1) 240ms both 1; }
.pm26-vuelve-izq { animation: pm26-vuelve-izq 480ms cubic-bezier(.3,.9,.4,1) both 1; }
.pm26-activos { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 10px; }
.pm26-activo { display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 4px 12px; border-radius: 999px; border: 2px solid ${INK}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.pm26-activo[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK_2}; }
@media (prefers-reduced-motion: reduce) { .pm26-entra-izq, .pm26-sale-der, .pm26-vuelve-izq { animation: da26-funde 120ms linear both 1; } }
`;

export function Lingote({ alto = 36 }) {
  return (
    <svg viewBox="0 0 60 36" width={(alto * 60) / 36} height={alto} style={{ width: (alto * 60) / 36, height: alto, flex: "none" }} aria-hidden="true">
      <path d="M6 32l10-26h28l10 26Z" fill={CALIDO} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
export function IconoActivo({ id, alto = 36 }) {
  const a = A2.activos.find((x) => x.id === id);
  if (id === "oro") return <Lingote alto={alto} />;
  return <Objeto id={a?.objeto ?? "recibo"} alto={alto} />;
}

/**
 * La ventanilla. `mov`: { activo, sentido: "entra" | "vuelve", n } — el activo
 * que acaba de pasar, para animarlo (n reinicia la animación).
 */
export function Ventanilla({ mov = null, contador = null, rotulo = A2.contador, destino = null }) {
  const Banco = destino ? "button" : "div";
  return (
    <div>
      {contador != null && (
        <div className="pm26-contador" style={{ marginBottom: 8 }} data-contador-bm={contador}>
          <span data-rotulo-contador>{rotulo}</span><b className="da26-mono">{fmtEntero(contador)}</b>
        </div>
      )}
      <div className="pm26-vent">
        <div className="pm26-vent-lado" data-lado="izquierdo">
          {mov?.sentido === "vuelve" && <div key={`v${mov.n}`} className="pm26-vuelve-izq" data-activo-vuelve={mov.activo}><IconoActivo id={mov.activo} /></div>}
        </div>
        <Banco className="pm26-vent-banco" {...(destino ? { type: "button", ...destino } : {})} data-ventanilla aria-label={destino ? `Entregar en la ventanilla del ${A2.banco}` : undefined}>
          <Objeto id="banco-central" alto={64} />
          <span>{A2.banco}</span>
          {mov?.sentido === "entra" && <span key={`e${mov.n}`} className="pm26-entra-izq" data-activo-entra={mov.activo}><IconoActivo id={mov.activo} alto={24} /></span>}
        </Banco>
        <div className="pm26-vent-lado" data-lado="derecho">
          {mov && <div key={`f${mov.n}`} className={mov.sentido === "entra" ? "pm26-sale-der" : "pm26-vuelve-izq"} data-fajo={mov.sentido}><Objeto id="billetes" alto={40} /></div>}
        </div>
      </div>
    </div>
  );
}

export default function A2Ventanilla({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [bm, setBm] = useState(BASE_INICIAL);
  const [mov, setMov] = useState(null);
  const [hechos, setHechos] = useState(new Set());
  const entregar = (activo) => {
    setBm((b) => b + A2.paso);
    setMov((m) => ({ activo, sentido: "entra", n: (m?.n ?? 0) + 1 }));
    setHechos((h) => new Set(h).add(activo));
  };
  const { contenedor, pieza, destino } = useArrastre({ alSoltar: (id) => entregar(id), activo: paso === 1 || paso === 2 });
  const vender = () => {
    setBm((b) => b - A2.paso);
    setMov((m) => ({ activo: "oro", sentido: "vuelve", n: (m?.n ?? 0) + 1 }));
    setHechos((h) => new Set(h).add("vende"));
  };
  const deEstaPantalla = paso === 1 ? ["dolar", "oro", "tes"] : paso === 2 ? ["pagare"] : [];

  let figura;
  if (paso === 0) {
    figura = (
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10 }}>
        {/* Rediseño lote 3: la autoridad de 180 subió a la franja de escena. */}
        <Objeto id="banco-central" alto={110} nombre={A2.banco} />
      </div>
    );
  } else if (paso === 4) {
    figura = (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }} data-estante>
        <Objeto id="banco-central" alto={96} />
        <div style={{ display: "grid", gap: 4, justifyItems: "center" }}>
          <svg viewBox="0 0 120 70" style={{ width: 120, height: 70 }} aria-hidden="true">
            <path d="M6 30h108M6 64h108" stroke={INK_2} strokeWidth="3" />
            {[12, 40, 68].map((x) => <rect key={x} x={x} y="8" width="24" height="20" rx="2" fill={SUPERFICIE_2} stroke={INK} strokeWidth="2" />)}
            {[26, 60].map((x) => <rect key={x} x={x} y="42" width="24" height="20" rx="2" fill={SUPERFICIE_2} stroke={INK} strokeWidth="2" />)}
          </svg>
          <span className="pm26-contador" style={{ padding: "4px 10px" }} data-rotulo-estante>{A2.estante}</span>
        </div>
      </div>
    );
  } else {
    figura = (
      <div ref={contenedor}>
        {paso === 1 && <div style={{ display: "grid", placeItems: "center", marginBottom: 8 }}><EscenaMascotas id="viajero-banco-central" alto={120} perezosa={false} /></div>}
        <Ventanilla mov={mov} contador={bm} rotulo={paso === 5 ? A2.contadorFinal : A2.contador}
          destino={paso === 1 || paso === 2 ? destino("ventanilla", deEstaPantalla.length === 1 ? deEstaPantalla[0] : null) : null} />
        {deEstaPantalla.length > 0 && (
          <div className="pm26-activos" role="group" aria-label="Lo que se entrega">
            {deEstaPantalla.map((a) => (
              <button key={a} type="button" className="pm26-activo" data-activo={a} aria-label={`${A2.activos.find((x) => x.id === a).nombre}. Arrástralo a la ventanilla o tócalo y toca la ventanilla.`} {...pieza(a)}>
                <IconoActivo id={a} alto={28} />{A2.activos.find((x) => x.id === a).nombre}
              </button>
            ))}
          </div>
        )}
        {paso === 3 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
            <Boton onClick={vender} data-vende>{A2.vende}</Boton>
          </div>
        )}
      </div>
    );
  }

  const puede = paso === 1 ? hechos.has("dolar") : paso === 2 ? hechos.has("pagare") : paso === 3 ? hechos.has("vende") : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PM}{CSS_VENTANILLA}</style>{figura}</>}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
