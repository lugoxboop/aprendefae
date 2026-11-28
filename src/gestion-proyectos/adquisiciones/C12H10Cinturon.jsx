/*
 * C12 · H10 · El cinturón del supervisor (gp26-moc-c12-h10-controlar, Medio, 25 × 2 FP × %).
 * El cinturón de herramientas de cuero en primer plano, con cinco bolsillos
 * rotulados: Inspección (casco) · Auditoría (carpeta con sello) · Revisión del
 * desempeño (regla) · Valor ganado y tendencias (calculadora) · Reclamaciones
 * (apretón de manos). El hámster pasa con la tarea y el zorro saca la
 * herramienta; si acierta, la herramienta hace su gesto. Etapa 2: los índices
 * del contrato y la forma de pagar lo que falta.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina, resuelto } from "../comun/lote6.jsx";
import { GP_C12_H10, TOSTADORA_C12 } from "./textos-c12.js";

export const ID = GP_C12_H10.id;

// imagen-pendiente: cinturon-herramientas · calculadora (regla-madera, casco-electricista, carpeta-documento, sumadora ya existen)
const CINTURON = primero("cinturon-herramientas", "caja-herramientas");
const GESTO = {
  inspeccion: "El casco: revisas el trabajo en el lugar.",
  auditoria: "La carpeta con sello: revisas el proceso.",
  revision: "La regla mide contra lo acordado.",
  valor: "La calculadora suma los índices.",
  reclamaciones: "El apretón de manos: se negocia el desacuerdo.",
};

function Gesto(estado) {
  if (estado.paso.texto && estado.encaja && GESTO[estado.encaja]) return <p className="gp2-pista" style={{ textAlign: "left" }} data-gesto={estado.encaja}>{GESTO[estado.encaja]}</p>;
  if (estado.paso.texto) return null;
  const V = TOSTADORA_C12.valorGanado;
  return (
    <Lamina titulo="Contrato de instalación" data-indices>
      <small style={{ display: "block" }}>CPI: {resuelto(estado, "c12h10-11") || estado.etapa?.hechos?.length ? "0,89" : "?"} · SPI: {resuelto(estado, "c12h10-11") || estado.etapa?.hechos?.length ? "0,80" : "?"}</small>
      <small style={{ display: "block" }}>VP ${V.vp} M · VG ${V.vg} M · CR ${V.cr} M</small>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "cinturon", fondo: ["#35261a", "#110c08"], acento: "#f4a261", luz: "rgba(244,162,97,.16)",
  portada: CINTURON,
  mesa: "equipo",
  objeto: { id: CINTURON, alto: 64 },
  anim: "abre",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Gesto {...e} />,
  destinos: {
    inspeccion: { objeto: primero("casco-electricista"), alto: 28 },
    auditoria: { objeto: primero("carpeta-documento"), alto: 28 },
    revision: { objeto: primero("regla-madera"), alto: 28 },
    valor: { objeto: primero("calculadora", "sumadora"), alto: 28 },
    reclamaciones: { objeto: primero("apreton-manos", "sello-goma"), alto: 28 },
  },
  etapas: [{}, { mesa: "tu", disposicion: "columna", destinos: {} }],
};

export default function C12H10Cinturon({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
