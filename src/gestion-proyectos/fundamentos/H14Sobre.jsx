/*
 * H14 · El sobre del proveedor (gp26-fun-h14-sobre, Medio, 25 FP exploratorio).
 * El sobre con el boleto de avión asomando, sobre el escritorio; arriba los
 * cuatro medidores del código del PMI (Responsabilidad, Respeto,
 * Imparcialidad, Honestidad). Cada decisión los mueve (flecha + «sube» o
 * «baja»). Sin calificación: FP completo. Efectos: criterio de Gen.
 */
import Partida from "../comun/Partida.jsx";
import { GP_H14, VALORES } from "./textos-c1.js";

export const ID = GP_H14.id;
export const ESCENA = {
  nombre: "sobre", fondo: ["#2a2440", "#120f1f"], acento: "#e879b9", luz: "rgba(232,121,185,.18)", portada: "sobre-boleto",
  final: (res) => (
    <div className="gp-escenita" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px 12px" }} data-final-dilema>
      {VALORES.map((v) => (
        <span key={v.id} style={{ display: "grid", gap: 4 }}>
          <span>{v.nombre}</span>
          <span className="gp-medidor" aria-hidden="true"><span style={{ transform: `scaleX(${res?.ultimo?.medidores?.[v.id] ?? 0.5})` }} /></span>
        </span>
      ))}
    </div>
  ),
};

export default function H14Sobre({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H14} escena={ESCENA} onTerminar={onTerminar} rng={rng} valores={VALORES} />;
}
