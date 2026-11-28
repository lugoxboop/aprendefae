/*
 * C11 · H10 · El espejo de las estrategias (gp26-pla-c11-h10-espejo, Medio, 25 × 2 FP × %).
 * El espejo de pie con marco de madera: delante, las cinco estrategias para
 * amenazas; en el espejo, cinco huecos reflejados (en columna a 320 px). Al
 * acertar, el reflejo se aclara y muestra la ficha con ✓; los huecos que
 * faltan quedan en «?». El zorro se mira en el espejo. Etapa 2: el reflejo
 * muestra la planta iluminada y cada respuesta cae en una ficha del marco.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote6, Lamina } from "../comun/lote6.jsx";
import { GP_C11_H10 } from "./textos-c11.js";

export const ID = GP_C11_H10.id;

// imagen-pendiente: espejo-pie (ficha-madera ya existe)
const ESPEJO = primero("espejo-pie", "marco-pizarra");
const FICHA = primero("ficha-madera");
const NOMBRE = { explotar: "Explotar", compartir: "Compartir", mejorar: "Mejorar", escalar: "Escalar", aceptar: "Aceptar" };

function Reflejo(estado) {
  const hechos = colocados(estado).filter((x) => x.texto?.startsWith("Amenaza:"));
  if (!estado.paso.texto?.startsWith("Amenaza:")) return null;
  return (
    <Lamina titulo="El espejo · amenaza ↔ oportunidad" data-reflejo={hechos.length}>
      {["Evitar", "Transferir", "Mitigar", "Escalar", "Aceptar"].map((a) => {
        const h = hechos.find((x) => x.texto === `Amenaza: ${a}`);
        return <small key={a} style={{ display: "block" }} data-par={a}>{a} ↔ {h ? `✓ ${NOMBRE[h.destino]}` : "?"}</small>;
      })}
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "espejo", fondo: ["#2d2233", "#0e0a11"], acento: "#cdb4db", luz: "rgba(205,180,219,.18)",
  portada: ESPEJO,
  mesa: "tu",
  objeto: { id: ESPEJO, alto: 76, lugar: "detras" },
  anim: "abre",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Reflejo {...e} />,
  destinos: { "*": { objeto: FICHA, alto: 24 } },
};

export default function C11H10Espejo({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
