/*
 * C13 · H02 · Las cinco tinajas (gp26-ini-c13-h02-intereses, Medio, 25 FP × %).
 * Cinco tinajas de barro en el corredor de una casa campesina, rotuladas con
 * su tipo de interés (Interés · Derechos · Propiedad · Conocimiento ·
 * Contribución). El hurón (Practicante) trae cada tarjeta en una jarra: al
 * acertar, la tinaja sube una marca de agua (la lámina cuenta solo lo ya
 * vertido); al errar, la jarra se inclina y no vierte.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, cuantos } from "../comun/lote7.jsx";
import { GP_C13_H02, TINAJAS_C13 } from "./textos-c13.js";

export const ID = GP_C13_H02.id;

// imagen-pendiente: tinaja · corredor-casa · jarra-barro
const TINAJA = primero("tinaja", "balde");
const CORREDOR = primero("corredor-casa", "casa-anden");

function Niveles(estado) {
  return (
    <Lamina titulo="El corredor · nivel de cada tinaja">
      <div className="gp5-chips" data-niveles>
        {TINAJAS_C13.map((t) => {
          const n = cuantos(estado, t.id);
          return <span key={t.id} className="gp5-chip" data-on={n > 0 ? "1" : undefined} data-tinaja={t.id}>{t.nombre} {"▮".repeat(n) || "· vacía"}</span>;
        })}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "tinajas", fondo: ["#3a2618", "#120b06"], acento: "#e9a96b", luz: "rgba(233,169,107,.16)",
  portada: TINAJA,
  mesa: "practicante",
  objeto: { id: CORREDOR, alto: 60 },
  anim: "gotea",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Niveles {...e} />,
  destinos: { "*": { objeto: TINAJA, alto: 40 } },
};

export default function C13H02Tinajas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
