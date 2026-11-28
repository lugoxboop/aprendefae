/*
 * C13 · H10 · Las compuertas de la acequia (gp26-moc-c13-h10-monitorear, Medio, 25 × 2 FP × %).
 * La acequia de piedra que baja por la ladera hacia las casas, con seis
 * compuertas de madera rotuladas con su técnica. Al subir la compuerta
 * correcta el agua avanza un tramo (la lámina pinta agua solo en las ya
 * abiertas); la incorrecta se atasca y no sube. Etapa 2: al pie de la ladera
 * la acequia se divide en tres pozos (lo que entra y lo que sale del
 * monitoreo) y, al final, el camino de la solicitud de cambio.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, Tramos, colocados } from "../comun/lote7.jsx";
import { GP_C13_H10, COMPUERTAS_C13, POZOS_C13 } from "./textos-c13.js";

export const ID = GP_C13_H10.id;

// imagen-pendiente: acequia · pozo (compuerta ya existe)
const ACEQUIA = primero("acequia", "canal-madera");
const COMPUERTA = primero("compuerta");
const POZO = primero("pozo", "tanque-beneficio");

function Ladera(estado) {
  if (!estado.paso.texto) return null;
  const abiertas = colocados(estado).map((x) => x.destino);
  return (
    <Lamina titulo="La acequia · tramos con agua">
      <Tramos tramos={COMPUERTAS_C13} con={abiertas} />
    </Lamina>
  );
}
function Pozos(estado) {
  if (!estado.paso.texto) return null;
  const llenos = colocados(estado).map((x) => x.destino);
  return (
    <Lamina titulo="Los tres pozos">
      <Tramos tramos={POZOS_C13} con={llenos} />
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "acequia", fondo: ["#1d2f2a", "#08110e"], acento: "#8ecae6", luz: "rgba(142,202,230,.16)",
  portada: ACEQUIA,
  mesa: "tu",
  objeto: { id: ACEQUIA, alto: 60 },
  anim: "abre",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Ladera {...e} />,
  destinos: { "*": { objeto: COMPUERTA, alto: 36 } },
  etapas: [{}, { encima: (e) => <Pozos {...e} />, destinos: { "*": { objeto: POZO, alto: 36 } } }],
};

export default function C13H10Acequia({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
