/*
 * MACRO 2026 · el hueco de una mascota (lote 4, orden de Mateo).
 * Los personajes humanos se van: las explicaciones las harán las mascotas
 * chibi de la plataforma, una por rol. Mientras Gen trae las imágenes, este
 * componente reserva el lugar (mismo tamaño que tendrá la mascota) y muestra
 * el ícono de respaldo. Cuando lleguen, solo cambia este archivo.
 */
import { DISCO } from "./personajes.jsx";
import { IconoTrazo } from "./iconos-pf.jsx";
import { INK } from "./colores-da.js";

/* Rol → ícono de respaldo (trazo) y nombre para el lector de pantalla. */
export const ROLES = {
  familia: { nombre: "Familia", icono: "nomina" },
  inversionista: { nombre: "Inversionista", icono: "crecimiento" },
  profesor: { nombre: "El profesor", icono: "escuela" },
};

export default function Mascota({ rol, alto = 120, style = null, ...resto }) {
  const r = ROLES[rol];
  return (
    <span
      role="img"
      aria-label={r.nombre}
      data-mascota-rol={rol}
      style={{ display: "inline-grid", placeItems: "center", flex: "none", width: alto, height: alto, borderRadius: 16, background: DISCO, ...style }}
      {...resto}
    >
      <IconoTrazo id={r.icono} size={Math.round(alto * 0.55)} color={INK} />
    </span>
  );
}
