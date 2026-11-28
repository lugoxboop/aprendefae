/*
 * C11 · H03 · El cable aéreo del riesgo (gp26-pla-c11-h03-cable, Medio, 25 FP × %).
 * El cable aéreo de Manizales: la torre de madera y tres cabinas colgadas
 * del cable (Causa · hoy es cierto, Riesgo · podría pasar, Efecto · sobre un
 * objetivo) y la bandeja «No va en el enunciado». El hurón espera en la
 * estación. Cada cabina muestra solo lo que ya subió en la ronda; al
 * completarla, las cabinas avanzan y se lee la frase entera (en la bandera).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote6, Lamina } from "../comun/lote6.jsx";
import { GP_C11_H03 } from "./textos-c11.js";

export const ID = GP_C11_H03.id;

// imagen-pendiente: torre-cable · cabina-cable · estacion-cable
const TORRE = primero("torre-cable", "estacion-tranvia");
const CABINA = primero("cabina-cable", "tranvia");
const BANDEJA = primero("bandeja-madera");
const sinComillas = (t) => t.replace(/^«|»$/g, "").replace(/\.$/, "");

function Cabinas(estado) {
  const r = estado.paso.ronda;
  const deRonda = colocados(estado).filter((x) => x.paso.ronda === r);
  const en = (k) => deRonda.find((x) => x.destino === k)?.texto ?? null;
  if (estado.paso.bandera) {
    return (
      <Lamina titulo={`Ronda ${r} de 3 · la frase entera`} data-frase-ronda={r}>
        <small style={{ display: "block" }}>Debido a que: {sinComillas(en("causa") ?? "?")}</small>
        <small style={{ display: "block" }}>Podría: {sinComillas(en("riesgo") ?? "?")}</small>
        <small style={{ display: "block" }}>Lo que: {sinComillas(en("efecto") ?? "?")}</small>
      </Lamina>
    );
  }
  return (
    <Lamina titulo={`Ronda ${r} de 3 · las cabinas`} data-cabinas={["causa", "riesgo", "efecto"].map((k) => (en(k) ? 1 : 0)).join("")}>
      <div className="gp5-chips">
        {["Causa", "Riesgo", "Efecto"].map((n) => <span key={n} className="gp5-chip" data-on={en(n.toLowerCase()) ? "1" : undefined}>{n}: {en(n.toLowerCase()) ? "lleno" : "vacío"}</span>)}
        <span className="gp5-chip">Bandeja: {deRonda.filter((x) => x.destino === "nova").length}</span>
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "cable", fondo: ["#20354a", "#0a121b"], acento: "#a8dadc", luz: "rgba(168,218,220,.18)",
  portada: TORRE,
  mesa: "practicante",
  objeto: { id: TORRE, alto: 72, lugar: "detras" },
  anim: "abre",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Cabinas {...e} />,
  destinos: { causa: { objeto: CABINA, alto: 30 }, riesgo: { objeto: CABINA, alto: 30 }, efecto: { objeto: CABINA, alto: 30 }, nova: { objeto: BANDEJA, alto: 22 } },
};

export default function C11H03Cable({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
