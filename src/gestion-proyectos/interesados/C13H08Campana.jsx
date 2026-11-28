/*
 * C13 · H08 · La campana de la capilla (gp26-pla-c13-h08-plan, Fácil, 10 FP × %).
 * La campana de bronce de la capilla veredal en su espadaña, con la cuerda al
 * alcance del zorro. Cada hecho llega como un aviso clavado en la puerta.
 * Tirar de la cuerda = «hay que actualizar»; «Sigue igual» = no. Si suena con
 * razón, una página del plan se reescribe con pluma (la lámina la cuenta); si
 * suena sin razón, da un golpe sordo y aparece la retro.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, cuantos } from "../comun/lote7.jsx";
import { GP_C13_H08 } from "./textos-c13.js";

export const ID = GP_C13_H08.id;

// imagen-pendiente: campana-capilla · puerta-aviso · pluma (la cuerda es la de Macro)
const CAMPANA = primero("campana-capilla", "cuerda");
const CUERDA = primero("cuerda");
const AVISO = primero("puerta-aviso", "puerta-oficina");
const PLUMA = primero("pluma", "libreta-anillada");

function Plan(estado) {
  if (!estado.paso.texto) return null;
  const n = cuantos(estado, "si");
  const sordo = estado.intento > 1 && !estado.encaja && estado.ultimo === "si";
  return (
    <Lamina titulo="El plan de involucramiento" data-plan={n}>
      <small style={{ display: "block" }} data-paginas>{n ? `${"✎ ".repeat(n)}página reescrita` : "Ninguna página reescrita aún"}</small>
      {sordo && <small style={{ display: "block" }} data-golpe-sordo>La campana dio un golpe sordo.</small>}
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "campana", fondo: ["#2b2a33", "#0c0c10"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: CAMPANA,
  mesa: "tu",
  objeto: { id: AVISO, alto: 60 },
  objetos: [PLUMA],
  anim: "sella",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Plan {...e} />,
  destinos: { si: { objeto: CUERDA, alto: 44 } },
};

export default function C13H08Campana({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
