/*
 * C06 · H05 · La sumadora de duraciones (gp26-pla-c06-h05-sumadora, Difícil, 50 × 2 FP × %).
 * La sumadora de manivela antigua, grande, con teclado y rollo de papel. Una
 * placa dice la técnica de la estación; el estudiante escribe el resultado y,
 * al comprobar, el rollo imprime el cálculo completo. Al terminar la etapa, el
 * rollo muestra que 10, 8 y 7 son las duraciones de D, C y G en la red.
 */
import { Calculator, Ruler, Sigma, Layers } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C6_H05 } from "./textos-c6.js";

export const ID = GP_C6_H05.id;

function Rollo({ paso, encaja, etapa }) {
  if (paso.tipo !== "casillas") return null;
  const impresos = (etapa?.hechos ?? []).filter((h) => h.paso.red).map((h) => `${h.paso.red} = ${h.paso.casillas[0].clave} días`);
  if (encaja && paso.red) impresos.push(`${paso.red} = ${paso.casillas[0].clave} días`);
  return (
    <div className="gp2-caja" data-rollo style={{ marginTop: 10 }}>
      <span className="gp-chip-c" data-placa-tecnica>{paso.tecnica}</span>
      {paso.nota && <small style={{ display: "block", marginTop: 4 }} data-nota-beta>{paso.nota}</small>}
      {encaja && <p className="da26-mono gp2-entra" style={{ margin: "6px 0 0" }} data-impreso>{paso.retro}</p>}
      {impresos.length > 0 && <small className="da26-mono" style={{ display: "block", marginTop: 4 }} data-red>En la red de la tienda: {impresos.join(" · ")}</small>}
    </div>
  );
}

export const ESCENA = {
  nombre: "sumadora", fondo: ["#2e2a24", "#100e0b"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: "sumadora",
  mesa: "equipo",
  objeto: { id: "sumadora", alto: 84 },
  anim: "cae",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Rollo {...e} />,
  destinos: { analoga: { icono: Ruler }, parametrica: { icono: Calculator }, tres: { icono: Sigma }, ascendente: { icono: Layers } },
};

export default function C06H05Sumadora({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
