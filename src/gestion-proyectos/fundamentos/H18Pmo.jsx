/*
 * H18 · Tres empresas, tres PMO (gp26-fun-h18-pmo, Medio, 25 FP × %).
 * El edificio de la empresa aliada con su ventana iluminada; tres insignias
 * para arrastrar: De apoyo (caja de herramientas), De control (portapapeles
 * con lista), Directiva (timón). Al recibir la insignia se enciende el
 * medidor sobre el edificio: control reducido / moderado / elevado (con
 * palabra). La PMO acompaña. 2 rondas de 3, una de cada tipo por ronda.
 */
import Partida from "../comun/Partida.jsx";
import { GP_H18 } from "./textos-c2.js";

export const ID = GP_H18.id;
const NIVEL = { apoyo: [1, "Control reducido"], control: [2, "Control moderado"], directiva: [3, "Control elevado"] };

function Medidor({ encaja }) {
  const [n, palabra] = encaja ? NIVEL[encaja] : [0, "Control: ?"];
  return (
    <div className="gp-escenita" data-control={encaja ?? "ninguno"}>
      <small>Medidor del edificio</small>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "flex", gap: 3 }} aria-hidden="true">
          {[1, 2, 3].map((k) => <span key={k} style={{ width: 14, height: 8 + k * 5, borderRadius: 3, background: k <= n ? "#ffc978" : "rgba(244,245,247,.2)", alignSelf: "flex-end" }} />)}
        </span>
        <span className={encaja ? "gp-chip-c da26-entra" : undefined}>{palabra}</span>
      </span>
    </div>
  );
}

export const ESCENA = {
  nombre: "edificios", fondo: ["#1b2b45", "#0b1322"], acento: "#8fd3f2", luz: "rgba(143,211,242,.2)",
  portada: "edificio-oficinas",
  mesa: "pmo",
  objeto: { id: "edificio-oficinas", alto: 96 },
  anim: "sella", sale: false,
  destinos: { apoyo: { objeto: "caja-herramientas", alto: 40 }, control: { objeto: "portapapeles", alto: 40 }, directiva: { objeto: "timon", alto: 40 } },
  encima: (e) => <Medidor {...e} />,
};

export default function H18Pmo({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H18} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
