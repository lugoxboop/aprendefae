/*
 * C13 · H01 · La vereda desde el aire (gp26-ini-c13-h01-identificar, Fácil, 10 × 2 FP × %).
 * La vista aérea de la vereda: cada zona (casas, lote con cerca, pancarta,
 * antena, maletín, la quebrada, la vía, la vaca…) llega como tarjeta y se
 * decide si es interesada. Al lado, la lista del acta: Patrocinadora ·
 * Alcaldía · Junta de Acción Comunal; cada interesado encontrado se suma a la
 * lista SOLO después de acertar (los que faltan no se adelantan). Etapa 2: las
 * cinco carpetas finas sobre la mesa del salón; la ficha va a su documento.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, colocados } from "../comun/lote7.jsx";
import { GP_C13_H01, ACTA_C13 } from "./textos-c13.js";

export const ID = GP_C13_H01.id;

// imagen-pendiente: vereda-aerea · casa-campesina · colegio · salon-comunal · lote-cerca · antena · pancarta · vaca · arbol (maleta y carpeta-documento ya existen)
const MAPA = primero("vereda-aerea", "mapa-plegable");
const CARPETA = primero("carpeta-documento");
const MALETA = primero("maletin", "maleta");

function Lista(estado) {
  const nuevos = colocados(estado).filter((x) => x.destino === "si").map((x) => x.paso.nombre);
  return (
    <Lamina titulo="La lista del acta" data-lista-acta={ACTA_C13.length + nuevos.length}>
      <div className="gp5-chips">
        {ACTA_C13.map((t) => <span key={t} className="gp5-chip">{t}</span>)}
        {nuevos.map((t) => <span key={t} className="gp5-chip" data-on="1" data-encontrado>+ {t}</span>)}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "vereda", fondo: ["#20331f", "#0a1208"], acento: "#a3d977", luz: "rgba(163,217,119,.16)",
  portada: MAPA,
  mesa: "tu",
  objeto: { id: MAPA, alto: 64 },
  objetos: [MALETA],
  anim: "cae",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Lista {...e} />,
  destinos: { si: { objeto: CARPETA, alto: 36 } },
  etapas: [{}, { encima: null, objeto: { id: CARPETA, alto: 56 }, destinos: { "*": { objeto: CARPETA, alto: 32 } } }],
};

export default function C13H01Vereda({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
