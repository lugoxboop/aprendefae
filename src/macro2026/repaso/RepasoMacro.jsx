/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · EL REPASO DIARIO — «LA RONDA DEL ECONOMISTA» (diseño de Gen)
 *
 * Diez consultas de los cinco temas, una a la vez:
 *   - arriba, la RUTA DEL DÍA: diez paradas con el lugar de cada consulta
 *     (T1 plaza … T5 puerto); la actual crece, las hechas quedan con ✓ o ✗
 *     (forma y texto, no solo color);
 *   - la consulta: escena completa del tema (fondo, mascota de 180 px, TU
 *     PAPEL y contexto), la consigna, la figura grande y su mecánica;
 *   - la retro propia de lo que eligió, y «Siguiente consulta».
 * Al final, el balance: aciertos por tema y qué conviene repasar.
 *
 * Una consulta = un ítem del historial (clave = id de la plantilla), un
 * intento: así el motor del repaso sabe qué falló y lo trae primero mañana.
 * Puntaje = aciertos / 10.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useMemo, useRef, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { Escenario, TEMAS_ESCENA } from "../comun/Escenario.jsx";
import { Boton, Raiz } from "../comun/ui.jsx";
import { MascotaRol } from "../comun/mascotas.jsx";
import { CSS_MEC, MECANICAS } from "./mecanicas.jsx";
import { TEMAS_REPASO, temaRepaso } from "./plantillas.js";

const CSS = `
.rd-ruta { position: relative; display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 2px; align-items: end; margin: 0 0 12px; padding: 8px 4px 6px; border-radius: 12px; background: rgba(8,16,30,.6); border: 1px solid ${BORDE}; }
.rd-ruta::before { content: ""; position: absolute; left: 6%; right: 6%; top: 21px; border-top: 2px dashed ${BORDE}; }
.rd-parada { position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.rd-parada-punto { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--rd-acento); background: ${FONDO}; color: ${INK}; font: 800 11px/1 var(--planck-font-mono, ui-monospace, monospace); transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.rd-parada[data-actual="1"] .rd-parada-punto { transform: scale(1.3); background: var(--rd-acento); color: #121418; }
.rd-parada[data-res="bien"] .rd-parada-punto { background: ${INK}; border-color: ${INK}; color: #121418; }
.rd-parada[data-res="mal"] .rd-parada-punto { border-color: ${CORAL}; color: ${CORAL}; }
.rd-parada-tema { font: 700 10px/1 var(--planck-font-mono, ui-monospace, monospace); color: ${INK_2}; }
.rd-cab { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 0 0 8px; }
.rd-lugar { font: 700 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .08em; color: var(--rd-acento); }
.rd-consigna { margin: 0 0 6px; font: 700 18px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.rd-balance { display: grid; gap: 8px; margin-top: 12px; }
.rd-tema { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; }
.rd-tema-barra { height: 8px; border-radius: 999px; background: ${BORDE}; overflow: hidden; margin-top: 4px; }
.rd-tema-barra i { display: block; height: 100%; background: var(--rd-acento); }
.rd-portada { text-align: center; }
.rd-portada-elenco { display: flex; justify-content: center; align-items: flex-end; gap: 0; margin: 4px auto 6px; overflow: hidden; }
.rd-portada-elenco figure:not(:first-child) { margin-left: -22px !important; }
.rd-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 10px 0 4px; }
.rd-chip-tema { padding: 4px 10px; border-radius: 999px; border: 1px solid var(--rd-acento); color: ${INK}; font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); background: rgba(8,16,30,.6); }
${CSS_MEC}
`;

const acento = (temaId) => TEMAS_ESCENA[temaRepaso(temaId).escena].acento;

function Ruta({ consultas, actual, resultados }) {
  return (
    <div className="rd-ruta" aria-label={`Consulta ${actual + 1} de ${consultas.length}`} data-ruta>
      {consultas.map((c, k) => {
        const res = resultados[k];
        return (
          <div key={c.id} className="rd-parada" style={{ "--rd-acento": acento(c.tema) }} data-actual={k === actual ? "1" : "0"} data-res={res == null ? "" : res ? "bien" : "mal"} aria-hidden="true">
            <span className="rd-parada-punto">{res == null ? k + 1 : res ? "✓" : "✗"}</span>
            <span className="rd-parada-tema">{temaRepaso(c.tema).corto}</span>
          </div>
        );
      })}
    </div>
  );
}

/** La pantalla de entrada: quién te espera hoy y de qué temas. */
function Portada({ consultas, onEmpezar }) {
  const elenco = [];
  for (const c of consultas) if (c.escena.mascota && !elenco.some((m) => m.id === c.escena.mascota.id) && elenco.length < 4) elenco.push(c.escena.mascota);
  const temas = TEMAS_REPASO.filter((t) => consultas.some((c) => c.tema === t.id));
  return (
    <div className="da26-tarjeta rd-portada" data-portada-repaso>
      <Escenario tema="plaza" hora="manana" lado="izq" mascota={null}
        rol="Hoy eres el economista de guardia de la ciudad."
        contexto={`Diez clientes te esperan en ${temas.length} lugares. Cada consulta trae datos nuevos: ninguna sale igual dos veces.`} />
      <div className="rd-portada-elenco" aria-hidden="true">
        {elenco.map((m) => <MascotaRol key={m.id} id={m.id} pose={m.pose} alto={120} rotulo={false} decorativa />)}
      </div>
      <h2 className="rd-consigna">Atiende las diez consultas del día.</h2>
      <div className="rd-chips">
        {temas.map((t) => <span key={t.id} className="rd-chip-tema" style={{ "--rd-acento": acento(t.id) }}>{t.corto} · {t.nombre}</span>)}
      </div>
      <div className="da26-nav"><span /><Boton primario onClick={onEmpezar} data-empezar>Empezar la ronda</Boton></div>
    </div>
  );
}

function Balance({ consultas, resultados, onOtra, textoOtra }) {
  const bien = resultados.filter(Boolean).length;
  const porTema = TEMAS_REPASO.map((t) => {
    const ks = consultas.map((c, k) => (c.tema === t.id ? k : -1)).filter((k) => k >= 0);
    return { ...t, total: ks.length, bien: ks.filter((k) => resultados[k]).length };
  }).filter((t) => t.total > 0);
  const flojos = porTema.filter((t) => t.bien < t.total);
  return (
    <div className="da26-tarjeta" data-balance-repaso data-aciertos={bien}>
      <Escenario tema="puerto" hora="noche" lado="izq" mascota={{ id: "profesor", pose: "libro" }}
        rol="Fuiste el economista de guardia de hoy."
        contexto={bien === consultas.length ? "Diez de diez: todos los clientes salieron con su respuesta." : `Resolviste ${bien} de ${consultas.length} consultas. Mañana vuelven primero las que fallaste.`} />
      <p className="rd-consigna" style={{ fontSize: 28, textAlign: "center", margin: "4px 0" }} data-puntaje>{bien} de {consultas.length}</p>
      <div className="rd-balance">
        {porTema.map((t) => (
          <div key={t.id} className="rd-tema" style={{ "--rd-acento": acento(t.id) }} data-tema-balance={t.id}>
            <span className="da26-mono" style={{ fontWeight: 800, color: "var(--rd-acento)" }}>{t.corto}</span>
            <span>
              <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{t.nombre}</span>
              <span className="rd-tema-barra" aria-hidden="true" style={{ display: "block" }}><i style={{ width: `${(t.bien / t.total) * 100}%` }} /></span>
            </span>
            <span className="da26-mono" style={{ fontWeight: 700 }}>{t.bien}/{t.total}{t.bien === t.total ? " ✓" : ""}</span>
          </div>
        ))}
      </div>
      {flojos.length > 0 && (
        <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.4, color: INK }} data-sugerencia>
          Para repasar: {flojos.map((t) => t.nombre).join(" · ")}.
        </p>
      )}
      {onOtra && <div className="da26-nav"><span /><Boton primario onClick={onOtra} data-otra-ronda>{textoOtra}</Boton></div>}
    </div>
  );
}

/**
 * `consultas`: la ronda armada (ronda.js · armarRonda). `onTerminar(pct, ms,
 * detalle)`: al cerrar la décima. `onOtra`: botón del balance (práctica sin
 * FP en el sitio; nueva ronda en la vista previa).
 */
export default function RepasoMacro({ consultas, onTerminar = null, onOtra = null, textoOtra = "Otra ronda de práctica", conPortada = true }) {
  const [empezado, setEmpezado] = useState(!conPortada);
  const [i, setI] = useState(0);
  const [resultados, setResultados] = useState(() => Array(consultas.length).fill(null));
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const arriba = useRef(null);
  const c = consultas[i];
  const Mecanica = useMemo(() => MECANICAS[c?.mecanica], [c]);

  if (!empezado) return <Raiz data-repaso-macro><style>{CSS}</style><Portada consultas={consultas} onEmpezar={() => setEmpezado(true)} /></Raiz>;
  if (terminado) return <Raiz data-repaso-macro><style>{CSS}</style><Balance consultas={consultas} resultados={resultados} onOtra={onOtra} textoOtra={textoOtra} /></Raiz>;

  const resuelto = resultados[i] != null;
  const resolver = ({ ok, respuesta }) => {
    if (resuelto) return;
    detalle.current.push({ item: c.clave, ok, intentos: 1, respuesta, orden: i + 1, subtemas: c.subtemas });
    setResultados((r) => { const s = [...r]; s[i] = ok; return s; });
  };
  const seguir = () => {
    if (i + 1 >= consultas.length) {
      const bien = detalle.current.filter((d) => d.ok).length;
      setTerminado(true);
      onTerminar?.(Math.round((bien / consultas.length) * 100), Date.now() - inicio.current, detalle.current);
      return;
    }
    setI(i + 1);
    arriba.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  };
  const T = temaRepaso(c.tema);

  return (
    <Raiz data-repaso-macro>
      <style>{CSS}</style>
      <div ref={arriba} style={{ scrollMarginTop: 12 }} />
      <Ruta consultas={consultas} actual={i} resultados={resultados} />
      <div className="da26-tarjeta" key={c.id} data-consulta={c.id} data-tema={c.tema} data-mecanica-consulta={c.mecanica} style={{ "--rd-acento": acento(c.tema) }}>
        <Escenario {...c.escena} compacto={false} />
        <div className="rd-cab">
          <span className="rd-lugar">{T.corto} · {T.nombre.toUpperCase()}</span>
          <span className="da26-rotulo da26-mono">{i + 1} / {consultas.length}</span>
        </div>
        <h2 className="rd-consigna" data-consigna>{c.consigna}</h2>
        <Mecanica c={c} onResolver={resolver} resuelto={resuelto} />
        {resuelto && (
          <div className="da26-nav">
            <span />
            <Boton primario onClick={seguir} data-siguiente>{i + 1 >= consultas.length ? "Ver el balance" : "Siguiente consulta"}</Boton>
          </div>
        )}
      </div>
    </Raiz>
  );
}

