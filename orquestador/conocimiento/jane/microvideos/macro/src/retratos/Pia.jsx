/* Retratos fijos de Pía (hámster con gorra) para el simulador «Arma tu acta»: fondo transparente. */
import { Mascota, ESTILO } from "../comun/base.jsx";
export const POSES = {
  tranquila: { cara: "tranquila", bi: 0, bd: 0, cab: 0 },
  feliz: { cara: "feliz", bi: 0, bd: -60, cab: 4 },
  estrellas: { cara: "estrellas", bi: -50, bd: -50, cab: -4 },
  piensa: { cara: "tranquila", bi: 0, bd: -95, cab: -8 },
};
export function Pia({ pose = "tranquila" }) {
  const p = POSES[pose];
  return <div style={{ position: "absolute", inset: 0 }}><style>{ESTILO}</style><Mascota esp="hamster-gorra" x={300} y={780} alto={700} t={0.5} semilla={3} {...p} /></div>;
}
