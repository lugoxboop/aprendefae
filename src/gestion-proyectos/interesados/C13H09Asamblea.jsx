/*
 * C13 · H09 · La asamblea del salón comunal (gp26-eje-c13-h09-gestionar, Medio, 25 FP × %).
 * El interior del salón comunal: filas de sillas plásticas, el megáfono sobre
 * la mesa y la cartelera al fondo; el zorro con el megáfono, el hámster toma
 * notas, la panda al fondo. El medidor está en la escena: las sillas. Cada
 * momento bien resuelto llena dos sillas más («el apoyo sube»); una mala
 * decisión vacía dos («el apoyo baja», forma + texto), se ve la retro y se
 * repite sin puntaje.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, Sillas } from "../comun/lote7.jsx";
import { GP_C13_H09 } from "./textos-c13.js";

export const ID = GP_C13_H09.id;

// imagen-pendiente: salon-comunal · silla-plastica · megafono (tablero-corcho ya existe)
const SALON = primero("salon-comunal", "silla-plastica", "silla-oficina");
const MEGAFONO = primero("megafono", "grabadora");
const CARTELERA = primero("tablero-corcho");
const BASE = 4;

function Salon(estado) {
  const hechos = (estado.etapa?.hechos ?? []).length;
  const fallo = estado.intento > 1 && !estado.encaja;
  const llenas = Math.max(0, BASE + 2 * hechos + (estado.encaja && estado.intento === 1 ? 2 : 0) - (fallo ? 2 : 0));
  const texto = fallo ? "El apoyo baja: se vacían dos sillas." : estado.encaja && estado.intento === 1 ? "El apoyo sube: se llenan dos sillas." : null;
  return (
    <Lamina titulo="El salón comunal · sillas ocupadas" data-salon={llenas}>
      <Sillas n={14} llenas={Math.min(14, llenas)} texto={texto} />
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "asamblea", fondo: ["#1f2b33", "#0a0e11"], acento: "#8ecae6", luz: "rgba(142,202,230,.14)",
  portada: SALON,
  mesa: "tu",
  objeto: { id: MEGAFONO, alto: 56 },
  objetos: [CARTELERA],
  anim: "abre",
  disposicion: "columna",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Salon {...e} />,
};

export default function C13H09Asamblea({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
