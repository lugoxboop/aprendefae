/*
 * C06 · H04 · La cinta métrica (gp26-pla-c06-h04-cinta, Medio, 25 FP × %).
 * La cinta métrica de sastre cruza la pantalla con los días marcados. Encima,
 * la barra de la predecesora ya puesta; debajo, la sucesora que se mueve con
 * ◀ ▶ (o escribiendo el día). A 320 px la cinta hace zoom a 8 días alrededor
 * del día elegido, con números de 14 px o más. Al acertar, aparece la etiqueta
 * del vínculo (FS + 3, FS − 2…) sobre la cinta. Nota fija: el día 0 es el inicio.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { numeroDe } from "../comun/motores/Casillas.jsx";
import { GP_C6_H04 } from "./textos-c6.js";

export const ID = GP_C6_H04.id;

function Cinta({ paso, encaja, valores }) {
  if (paso.tipo !== "casillas") return null;
  const c = paso.casillas[0];
  const dia = numeroDe(valores?.dia) ?? c.inicial;
  const desde = Math.max(c.min, Math.min(c.max - 7, Math.round(dia) - 4));
  const dias = Array.from({ length: 8 }, (_, k) => desde + k);
  return (
    <div className="gp2-caja" data-cinta={dia} style={{ marginTop: 10 }}>
      <Objeto id="cinta-metrica" alto={34} />
      <div className="gp2-rejilla" style={{ "--gp2-cols": 8, gap: 2, marginTop: 4 }} aria-hidden="true">
        {dias.map((d) => (
          <span key={d} className="da26-mono" data-dia={d} style={{ fontSize: 14, textAlign: "center", padding: "4px 0", borderRadius: 6, background: d === dia ? "#f2c14e" : d === c.inicial ? "rgba(244,245,247,.25)" : "transparent", color: d === dia ? "#121418" : undefined }}>{d}</span>
        ))}
      </div>
      <p style={{ margin: "6px 0 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
        <small>Referencia: día {c.inicial}</small>
        {encaja ? <span className="gp-chip-c gp2-entra" data-vinculo>{paso.vinculo}</span> : <small>El día 0 es el inicio</small>}
      </p>
    </div>
  );
}

export const ESCENA = {
  nombre: "cinta", fondo: ["#33261c", "#140e09"], acento: "#f4a261", luz: "rgba(244,162,97,.2)",
  portada: "cinta-metrica",
  anim: "cae",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Cinta {...e} />,
};

export default function C06H04Cinta({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
