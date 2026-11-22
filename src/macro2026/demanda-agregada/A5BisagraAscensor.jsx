/*
 * A5 · Bisagra y ascensor (da26-a5-bisagra-ascensor, Aprender, sin FP).
 * Especificación de Gen §2 A5. La recta DA = (Ā − b·i) + c(1 − t)·Y del modelo
 * común, como una regla con una bisagra en su arranque (gira) y montada en un
 * ascensor (sube y baja). DA₀ queda como fantasma punteado para comparar.
 * Cada pantalla parte del modelo común y solo mueve sus propios controles.
 */
import { useState } from "react";
import { arranque, BASE, fmtDecimal, fmtEntero, modelo, pendiente, produccion } from "../comun/modelo-da.js";
import GraficaDA from "../comun/GraficaDA.jsx";
import { Boton, Deslizador, Interruptor, MarcoAprender, Retro, usePasos } from "../comun/ui.jsx";
import { APRENDER, RETRO_A5_P5 } from "./textos.js";

export const ID = "da26-a5-bisagra-ascensor";
const TX = APRENDER[ID];
const P0 = modelo();
const DA0 = { id: "da0", arranque: arranque(P0), pendiente: pendiente(P0) };

const recta = (p, id = "da") => ({ id, arranque: arranque(p), pendiente: pendiente(p), estilo: "actual" });
const conFantasma = (p) => {
  const igual = Math.abs(arranque(p) - DA0.arranque) < 1e-9 && Math.abs(pendiente(p) - DA0.pendiente) < 1e-9;
  return igual ? [recta(p)] : [{ ...DA0, estilo: "fantasma" }, recta(p)];
};

function Lectura({ p }) {
  return (
    <p className="da26-rotulo da26-mono" style={{ margin: "4px 0 0", textAlign: "center" }} data-lectura-recta>
      DA = {fmtEntero(arranque(p))} + {fmtDecimal(pendiente(p), 2)}·Y
    </p>
  );
}

export default function A5BisagraAscensor({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(6);
  const [Y, setY] = useState(800);
  const [G3, setG3] = useState(BASE.G);
  const [i3, setI3] = useState(BASE.i);
  const [c4, setC4] = useState(BASE.c);
  const [t4, setT4] = useState(25);
  const [apuesta, setApuesta] = useState(null);
  const [i5, setI5] = useState(BASE.i);
  const [ver, setVer] = useState(false);
  const [G6, setG6] = useState(BASE.G);

  let figura;
  let controles = null;
  if (paso === 0) {
    figura = <GraficaDA lineas={[recta(P0)]} punto={{ Y, onCambio: setY }} titulo="Recta de la demanda agregada con un punto que se arrastra" />;
  } else if (paso === 1) {
    figura = <GraficaDA lineas={[recta(P0)]} marcas titulo="La recta con su arranque y su inclinación marcados" />;
  } else if (paso === 2) {
    const p = modelo({ G: G3, i: i3 });
    figura = <><GraficaDA lineas={conFantasma(p)} titulo="Ascensor: la recta se desplaza paralela" /><Lectura p={p} /></>;
    controles = (
      <>
        <Deslizador id="a5-g" etiqueta="G" min={100} max={400} paso={10} valor={G3} onCambio={setG3} formato={fmtEntero} />
        <Deslizador id="a5-i" etiqueta="Tasa i" min={2} max={14} valor={i3} onCambio={setI3} formato={(v) => `${v} %`} />
      </>
    );
  } else if (paso === 3) {
    const p = modelo({ c: c4, t: t4 / 100 });
    figura = <><GraficaDA lineas={conFantasma(p)} titulo="Bisagra: la recta gira sobre su arranque" /><Lectura p={p} /></>;
    controles = (
      <>
        <Deslizador id="a5-c" etiqueta="c" min={0.5} max={0.95} paso={0.05} valor={c4} onCambio={(v) => setC4(Math.round(v * 100) / 100)} formato={(v) => fmtDecimal(v, 2)} />
        <Deslizador id="a5-t" etiqueta="t" min={0} max={40} valor={t4} onCambio={setT4} formato={(v) => `${v} %`} />
      </>
    );
  } else if (paso === 4) {
    const p = modelo({ i: i5 });
    figura = <GraficaDA lineas={conFantasma(p)} titulo="¿La tasa gira o desplaza la recta?" />;
    controles = (
      <>
        <div className="da26-fila" role="group" aria-label="Tu apuesta">
          <Boton aria-pressed={apuesta === "gira"} disabled={apuesta != null} onClick={() => setApuesta("gira")} data-apuesta="gira" style={{ flex: 1 }}>Gira</Boton>
          <Boton aria-pressed={apuesta === "desplaza"} disabled={apuesta != null} onClick={() => setApuesta("desplaza")} data-apuesta="desplaza" style={{ flex: 1 }}>Se desplaza</Boton>
        </div>
        {apuesta && <Retro estado={apuesta === "gira" ? "mal" : "bien"}>{RETRO_A5_P5[apuesta]}</Retro>}
        <Deslizador id="a5-i5" etiqueta="Tasa i" min={2} max={14} valor={i5} onCambio={setI5} formato={(v) => `${v} %`} disabled={!apuesta} />
      </>
    );
  } else {
    const p = modelo({ G: G6 });
    figura = (
      <>
        <GraficaDA lineas={[recta(p)]} bisectriz={ver} y0={ver ? produccion(p) : null} titulo="Equilibrio: el cruce con la recta de 45 grados" />
        {ver && <p className="da26-rotulo da26-mono" style={{ margin: "4px 0 0", textAlign: "center" }} data-y0-valor>Y₀ = {fmtEntero(produccion(p))}</p>}
      </>
    );
    controles = (
      <>
        <Interruptor id="a5-ver" etiqueta="Ver equilibrio" activo={ver} onCambio={setVer} />
        <Deslizador id="a5-g6" etiqueta="G" min={100} max={400} paso={10} valor={G6} onCambio={setG6} formato={fmtEntero} />
      </>
    );
  }

  return (
    <MarcoAprender
      id={ID} paso={paso} total={6} texto={TX[paso]} figura={figura} controles={controles}
      onSiguiente={siguiente} onAnterior={anterior} onTerminar={onTerminar}
    />
  );
}
