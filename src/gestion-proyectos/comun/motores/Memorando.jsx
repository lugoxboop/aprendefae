/*
 * GESTIÓN DE PROYECTOS · MOTOR «MEMORANDO» (H13, encontrar el error).
 *
 * El memorando de papel ilustrado ocupa la pantalla; las frases son HTML
 * encima. Tocar una frase con error la tacha y ofrece tres correcciones; la
 * buena se escribe a mano en azul. Tocar una frase correcta la subraya en
 * gris con la retro de por qué está bien, y cuenta en contra.
 * Puntaje (diseño H13): (errores corregidos al primer intento − frases
 * correctas tocadas, mínimo 0) / número de errores.
 */
import { useRef, useState } from "react";
import { Boton, Retro } from "../../../macro2026/comun/ui.jsx";
import { Personaje } from "../elenco.jsx";
import { fuenteObjeto } from "../objetos.jsx";

const CSS = `
.gp-memo { position: relative; margin: 0 auto; max-width: 460px; padding: 54px 22px 26px; border-radius: 14px; background-size: 100% 100%; background-repeat: no-repeat; color: #121418; cursor: zoom-in; }
.gp-memo-membrete { margin: 0 0 8px; font: 800 13px/18px var(--planck-font-mono, monospace); letter-spacing: .08em; color: #1d3557; }
.gp-frase { display: block; width: 100%; margin: 0 0 6px; padding: 6px 8px; border: 0; border-radius: 8px; background: rgba(255,255,255,.55); color: #121418; font: 500 15px/1.4 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: zoom-in; }
.gp-frase:hover, .gp-frase:focus-visible { background: rgba(255,233,160,.85); }
.gp-frase[data-estado="tachada"] { text-decoration: line-through 2px #121418; background: rgba(255,255,255,.75); }
.gp-frase[data-estado="corregida"] { text-decoration: line-through 1px rgba(18,20,24,.5); color: rgba(18,20,24,.6); }
.gp-frase[data-estado="gris"] { text-decoration: underline 3px #8e94a0; text-underline-offset: 4px; }
.gp-mano { display: block; margin: 2px 0 8px 8px; color: #1f4fd1; font: italic 700 15px/1.35 "Segoe Print", "Comic Sans MS", cursive; }
.gp-mano::before { content: "✓ "; font-style: normal; }
.gp-opciones { display: grid; gap: 6px; margin: 4px 0 10px; }
.gp-opcion { min-height: 44px; padding: 8px 10px; border-radius: 10px; border: 2px solid #1d3557; background: #fff; color: #121418; font: 600 14px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; }
.gp-opcion[data-estado="mal"] { border-color: #E76F51; }
.gp-memo-pie { display: flex; justify-content: space-between; align-items: flex-end; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
`;

export default function Memorando({ paso, escena = {}, alTerminar }) {
  const [estados, setEstados] = useState({});
  const [malas, setMalas] = useState({});
  const [retro, setRetro] = useState(null);
  const [tipoRetro, setTipoRetro] = useState("mal");
  const [golpes, setGolpes] = useState(0);
  const primeras = useRef({});
  const tocadasBien = useRef(new Set());
  const errores = paso.frases.filter((f) => f.error);
  const corregidas = errores.filter((f) => estados[f.id] === "corregida").length;
  const papel = fuenteObjeto("memorando-clip");

  const tocar = (f) => {
    if (estados[f.id] === "corregida") return;
    if (f.error) {
      setEstados((e) => ({ ...e, [f.id]: "tachada" }));
      setRetro(null);
      return;
    }
    if (!tocadasBien.current.has(f.id)) tocadasBien.current.add(f.id);
    setEstados((e) => ({ ...e, [f.id]: "gris" }));
    setTipoRetro("info");
    setRetro(f.retro);
    setGolpes((g) => g + 1);
  };

  const elegir = (f, o, k) => {
    if (!(f.id in primeras.current)) primeras.current[f.id] = Boolean(o.buena);
    if (o.buena) {
      setEstados((e) => ({ ...e, [f.id]: "corregida" }));
      setRetro(null);
      return;
    }
    setMalas((m) => ({ ...m, [f.id]: k }));
    setTipoRetro("mal");
    setRetro(o.retro);
    setGolpes((g) => g + 1);
  };

  const terminar = () => {
    const det = [
      ...errores.map((f) => ({ item: f.id, ok: primeras.current[f.id] === true, subtemas: [f.subtema] })),
      ...[...tocadasBien.current].map((id) => ({ item: id, ok: false, subtemas: [paso.frases.find((f) => f.id === id).subtema] })),
    ];
    const buenas = errores.filter((f) => primeras.current[f.id] === true).length;
    alTerminar({ detalle: det, puntos: Math.max(0, buenas - tocadasBien.current.size) });
  };

  return (
    <div data-motor="memorando">
      <style>{CSS}</style>
      <div className="gp-visual" data-visual="memorando" style={{ "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento }}>
        <div className="gp-memo-pie">
          <Personaje quien="practicante" alto={120} />
          <span className="da26-rotulo da26-mono" data-corregidas>{corregidas} / {errores.length} errores corregidos</span>
          <Personaje quien="pmo" alto={120} animo={corregidas === errores.length ? "feliz" : "quieta"} />
        </div>
        <div className="gp-memo" data-memo style={{ backgroundImage: papel ? `url(${papel.src})` : undefined, background: papel ? undefined : "#fbf7ee" }}>
          <p className="gp-memo-membrete">ALTAMIRA · MEMORANDO DE INDUCCIÓN</p>
          {paso.frases.map((f) => (
            <div key={f.id}>
              <button type="button" className="gp-frase" data-frase={f.id} data-estado={estados[f.id] ?? undefined} onClick={() => tocar(f)} aria-pressed={Boolean(estados[f.id])}>
                {f.texto}
              </button>
              {f.error && estados[f.id] === "tachada" && (
                <div className="gp-opciones da26-entra" role="group" aria-label="Elige la corrección">
                  {f.opciones.map((o, k) => (
                    <button key={k} type="button" className="gp-opcion" data-opcion={o.buena ? "buena" : "mala"} data-estado={malas[f.id] === k ? "mal" : undefined} onClick={() => elegir(f, o, k)}>
                      {o.texto}
                    </button>
                  ))}
                </div>
              )}
              {f.error && estados[f.id] === "corregida" && <span className="gp-mano da26-entra" data-corregida={f.id}>{f.buena}</span>}
            </div>
          ))}
        </div>
      </div>
      <Retro estado={tipoRetro} key={`r${golpes}`}>{retro}</Retro>
      {corregidas === errores.length && (
        <div className="gp-pie"><Boton primario onClick={terminar} data-terminar-memo>Entregar el memorando</Boton></div>
      )}
    </div>
  );
}
