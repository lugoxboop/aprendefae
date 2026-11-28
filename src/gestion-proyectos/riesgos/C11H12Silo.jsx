/*
 * C11 · H12 · El silo de la reserva (gp26-moc-c11-h12-silo, Difícil, 50 FP × %).
 * El silo metálico de granos con su ventana de nivel: los granos son la
 * reserva para contingencias (cifra y nivel en vivo). Hasta resolver la
 * semana 3a el silo marca la reserva inicial ($300); después, lo que queda
 * ($120) bajo la línea punteada del riesgo abierto ($150). Al lado, la
 * tarjeta de la semana y su mascota; una decisión que no es la mejor muestra
 * su retro y se vuelve a decidir sin puntaje.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina, Silo, resuelto } from "../comun/lote6.jsx";
import { GP_C11_H12, AMPLIACION_C11 } from "./textos-c11.js";

export const ID = GP_C11_H12.id;

// imagen-pendiente: silo (deposito-reservas de Macro ya existe)
const SILO = primero("silo", "deposito-reservas");
const R = AMPLIACION_C11.reserva;
const ORDEN = ["c11h12-1", "c11h12-2", "c11h12-3a", "c11h12-3b", "c11h12-4", "c11h12-5"];

function Nivel(estado) {
  const k = ORDEN.indexOf(estado.paso.id);
  const usada = k > 2 || resuelto(estado, "c11h12-3a");
  const linea = k >= 2 ? -R.abiertas : null;
  return (
    <Lamina titulo={`Revisión ${k + 1} de ${ORDEN.length} · el silo`} data-nivel={usada ? R.queda : R.inicial}>
      <Silo valor={usada ? R.queda : R.inicial} max={R.inicial} linea={linea} texto={linea != null ? "línea punteada: riesgo abierto" : null} />
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "silo", fondo: ["#2a2d33", "#0b0c0e"], acento: "#e9c46a", luz: "rgba(233,196,106,.14)",
  portada: SILO,
  mesa: "tu",
  objeto: { id: SILO, alto: 64 },
  anim: "abre",
  disposicion: "columna",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Nivel {...e} />,
};

export default function C11H12Silo({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H12} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
