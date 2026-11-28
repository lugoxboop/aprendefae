/*
 * C10 · H03 · Dos radios, un precio torcido (gp26-eje-c10-h03-radios, Medio, 25 × 2 FP × %).
 * Dos radios de muelle: la del escritorio del zorro (Manizales) y la del
 * mostrador de la tienda de Cartagena. Entre ambas, el mar con nubes de ruido.
 * Las cinco tarjetas del viaje se ordenan en la cinta y, al quedar en orden,
 * la onda va y vuelve. Etapa 2: dos bandejas, Emisor (tú) y Receptor (la
 * tienda).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C10_H03 } from "./textos-c10.js";

export const ID = GP_C10_H03.id;

// imagen-pendiente: radio-escritorio · radio-mostrador · mar-ondas · nube-estatica
const RADIO_A = primero("radio-escritorio", "dial-radio");
const RADIO_B = primero("radio-mostrador", "telefono-antiguo");
const RUIDO = primero("nube-estatica", "nube-polvo");

function Onda({ puestas, bien }) {
  return (
    <Lamina titulo="Manizales ⇄ Cartagena" data-onda={bien ? "ida-y-vuelta" : puestas.length}>
      <small>{bien ? "La onda viaja a Cartagena y vuelve con la respuesta." : `Tramos puestos en la cinta: ${puestas.length} de 5.`}</small>
    </Lamina>
  );
}

function Bandejas(estado) {
  if (!estado.paso.texto) return null;
  return (
    <p className="gp2-pista" data-bandejas={`${cuantos(estado, "emisor")}-${cuantos(estado, "receptor")}`}>
      Bandeja del emisor: {cuantos(estado, "emisor")} · del receptor: {cuantos(estado, "receptor")}
    </p>
  );
}

export const ESCENA = {
  nombre: "radios", fondo: ["#13283a", "#060d14"], acento: "#8ecae6", luz: "rgba(142,202,230,.18)",
  portada: RADIO_A,
  mesa: "tu",
  objetos: [RADIO_A, RUIDO, RADIO_B],
  encimaOrden: (e) => <><EstiloLote5 /><Onda {...e} /></>,
  objeto: { id: RUIDO, alto: 56 },
  anim: "cae",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Bandejas {...e} />,
  etapas: [{}, { objeto: { id: RADIO_B, alto: 64 }, destinos: { emisor: { objeto: RADIO_A, alto: 36 }, receptor: { objeto: RADIO_B, alto: 36 } } }],
};

export default function C10H03Radios({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
