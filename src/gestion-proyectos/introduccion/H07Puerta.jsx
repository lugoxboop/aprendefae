/*
 * H07 · La puerta de fase (gp-h07-puerta, Medio, 25 FP × %).
 * El camino termina en el portón de madera con cinco palancas; junto al
 * portón, el tablero con dos barras «Caso de negocio» vs. «Real». Cada
 * palanca anima su consecuencia (se abre, se abre con letrero «ajuste», te
 * quedas, se rebobina, la maqueta se guarda); si no era la mejor, la
 * patrocinadora lo objeta con la retro y se vuelve a decidir sin puntaje.
 */
import Partida from "../comun/Partida.jsx";
import { GP_H07 } from "./textos.js";

export const ID = GP_H07.id;

const CONSECUENCIA = {
  continuar: "El portón se abre",
  cambios: "Se abre con letrero «ajuste»",
  permanecer: "Te quedas en la fase",
  repetir: "El camino se rebobina",
  finalizar: "La maqueta se guarda en caja",
};
const ESTILO = {
  continuar: { transform: "perspective(400px) rotateY(-38deg)" },
  cambios: { transform: "perspective(400px) rotateY(-24deg)" },
  permanecer: { transform: "none" },
  repetir: { transform: "translateX(-18px)", opacity: 0.8 },
  finalizar: { transform: "scale(.6)", opacity: 0.45 },
};

function Tablero({ paso, ultimo }) {
  const [caso, real] = paso.barras ?? [100, 100];
  const fila = (nombre, v, k) => (
    <div key={k} style={{ display: "grid", gridTemplateColumns: "92px 1fr 40px", gap: 6, alignItems: "center" }}>
      <small>{nombre}</small>
      <span className="gp-medidor"><span style={{ transform: `scaleX(${Math.min(1, v / 120)})`, "--gp-relleno": k ? "#f4f5f7" : "#f2c14e" }} /></span>
      <small className="da26-mono">{v} %</small>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
      <div className="gp-escenita" style={{ display: "grid", gap: 6, marginTop: 0 }} data-tablero-fase>
        {fila("Caso de negocio", caso, 0)}
        {fila("Real", real, 1)}
      </div>
      {ultimo && <p className="gp-escenita da26-entra" style={{ margin: 0, justifyContent: "center" }} data-consecuencia={ultimo}>{CONSECUENCIA[ultimo]}</p>}
    </div>
  );
}

export const ESCENA = {
  nombre: "porton", fondo: ["#25351f", "#101a0d"], acento: "#a3d65c", luz: "rgba(163,214,92,.2)",
  portada: "porton-madera",
  mesa: "patrocinadora",
  objeto: { id: "porton-madera", alto: 96 },
  objetoEstilo: ({ ultimo }) => (ultimo ? { ...ESTILO[ultimo], transition: "transform 420ms cubic-bezier(.3,.9,.4,1), opacity 420ms" } : null),
  anim: "abre",
  disposicion: "palancas",
  destinos: { "*": { forma: "palanca" } },
  encima: (e) => <Tablero {...e} />,
};

export default function H07Puerta({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
