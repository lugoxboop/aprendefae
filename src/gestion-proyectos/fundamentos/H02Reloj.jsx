/*
 * H02 · ¿Se acaba o sigue? (gp26-fun-h02-reloj, Fácil, 10 FP × %).
 * Escena: el reloj de arena gigante; se apuesta «Termina» (bandera a cuadros)
 * o «Sigue» (flecha). Revelar: si termina, la arena se detiene (el reloj se
 * apaga) y cae una placa con la causa al estante; si sigue, el reloj se
 * ilumina. Las causas se coleccionan como placas (resumen, no medallas).
 */
import { ArrowRight, Flag } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { GP_H02 } from "./textos-c1.js";

export const ID = GP_H02.id;

function Estante({ etapa, paso, encaja }) {
  const placas = (etapa?.hechos ?? []).filter((h) => h.destino === "termina" && h.paso.placa).map((h) => h.paso.placa);
  if (encaja === "termina" && paso.placa) placas.push(paso.placa);
  return (
    <div className="gp-escenita" data-estante aria-label="Estante de causas">
      <small>Estante de causas</small>
      <span style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end" }}>
        {placas.length ? placas.map((t) => <span key={t} className="gp-chip-c da26-entra" data-placa>{t}</span>) : <small>—</small>}
      </span>
    </div>
  );
}

export const ESCENA = {
  nombre: "reloj", fondo: ["#2b2540", "#121022"], acento: "#f2c14e", luz: "rgba(242,193,78,.2)",
  portada: "reloj-arena",
  objeto: { id: "reloj-arena", alto: 120 },
  objetoEstilo: ({ encaja }) => (encaja === "termina" || encaja === "desaparece"
    ? { filter: "grayscale(.7) brightness(.8)", transition: "filter 400ms" }
    : encaja ? { filter: "drop-shadow(0 0 14px rgba(255,201,120,.85))", transition: "filter 400ms" } : null),
  anim: "pesa",
  destinos: { termina: { icono: Flag }, sigue: { icono: ArrowRight }, "sigue-en-uso": { icono: ArrowRight }, desaparece: { icono: Flag } },
  encima: (e) => <Estante {...e} />,
};

export default function H02Reloj({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
