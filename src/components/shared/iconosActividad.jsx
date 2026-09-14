import {
  Radar, Link, Gauge, Scale, Siren,
  Activity, Thermometer, Droplet, Microscope, Cross,
  Stamp, Sheet, FileStack, ToggleLeft,
} from "lucide-react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ICONO DE CADA ACTIVIDAD, para su nodo del camino y su insignia.
 *
 * REUTILIZAR ANTES QUE INVENTAR. El sitio ya dibuja sus iconos con
 * lucide-react, así que catorce de los veintiuno son de ahí. El juego de las
 * medallas (Medalla.jsx) no tenía ninguno que sirviera: sus glifos son de
 * logros —racha, ranking, liga—, no de actividades. Los siete que lucide no
 * tiene se dibujan aquí, con su misma rejilla de 24, trazo de 2 y extremos
 * redondos, para que no se note cuál es de quién:
 *
 *   cinta transportadora · micrófono con onda · bisturí · pantallas múltiples
 *   máquina contadora de billetes · flujo de dinero · agujero en el piso
 *
 * Todos tienen la misma forma que un icono de lucide —size, color,
 * strokeWidth y el resto va al <svg>—, así que el camino y la medalla los
 * usan igual sin saber de dónde vienen.
 *
 * UNA ACTIVIDAD SIN ICONO NO ROMPE NADA: iconoDe() devuelve null y el nodo
 * enseña su número, como antes de esto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

function propio(nombre, dibujo) {
  const Icono = ({ size = 24, color = "currentColor", strokeWidth = 2, ...resto }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      {...resto}
    >
      {dibujo}
    </svg>
  );
  Icono.displayName = nombre;
  return Icono;
}

/* Corriente de titulares: dos cajas sobre una cinta con sus rodillos. */
export const CintaTransportadora = propio("CintaTransportadora", (
  <>
    <rect x="4" y="8" width="6" height="6" rx="1" />
    <rect x="13" y="5" width="7" height="9" rx="1" />
    <path d="M4.5 15.5h15a2.5 2.5 0 0 1 0 5h-15a2.5 2.5 0 0 1 0-5z" />
    <circle cx="4.5" cy="18" r="0.6" />
    <circle cx="12" cy="18" r="0.6" />
    <circle cx="19.5" cy="18" r="0.6" />
  </>
));

/* Explica la política: el micrófono, y la voz saliendo en dos ondas. */
export const MicrofonoOnda = propio("MicrofonoOnda", (
  <>
    <rect x="5.5" y="3" width="5" height="10" rx="2.5" />
    <path d="M3 10a5 5 0 0 0 10 0" />
    <path d="M8 15v4" />
    <path d="M5.5 19h5" />
    <path d="M16 8a4 4 0 0 1 0 5" />
    <path d="M19 5.5a8 8 0 0 1 0 10" />
  </>
));

/* Cirugía de reconstrucción: el bisturí, mango recto y hoja curva. */
export const Bisturi = propio("Bisturi", (
  <>
    <path d="M3.5 20.5 10 14" strokeWidth="2.6" />
    <path d="M10 14 20.5 3.5c.5 4-2.5 9-7.5 12.5z" />
  </>
));

/* Sala de monitores: tres pantallas, dos arriba y una abajo, con su línea de pulso. */
export const PantallasMultiples = propio("PantallasMultiples", (
  <>
    <rect x="2" y="3" width="9" height="7" rx="1.2" />
    <rect x="13" y="3" width="9" height="7" rx="1.2" />
    <rect x="7.5" y="13" width="9" height="7" rx="1.2" />
    <path d="M9.5 16.5h1.5l1-1.5 1 3 1-1.5h1" strokeWidth="1.4" />
  </>
));

/* El clasificador del Tesoro: la máquina, con un billete entrando por arriba. */
export const ContadoraBilletes = propio("ContadoraBilletes", (
  <>
    <path d="M6.5 10V4h11v6" />
    <circle cx="12" cy="7" r="1.4" />
    <rect x="3" y="10" width="18" height="10" rx="2" />
    <path d="M7 14.5h6" />
    <circle cx="16.5" cy="15" r="1" />
  </>
));

/* Flujo de caja: la moneda y la flecha por la que corre el dinero. */
export const FlujoDinero = propio("FlujoDinero", (
  <>
    <circle cx="7" cy="8" r="3.2" />
    <path d="M7 6.8v2.4" />
    <path d="M3 18c6 0 7-8 13-8h5" />
    <path d="m18.5 7.5 2.5 2.5-2.5 2.5" />
  </>
));

/* El agujero fiscal: un hueco abierto en el piso, con sus grietas. */
export const AgujeroPiso = propio("AgujeroPiso", (
  <>
    <path d="M2 15h3.5M18.5 15H22" />
    <ellipse cx="12" cy="15" rx="6.5" ry="3.2" />
    <path d="M7.5 16.2a4.8 1.9 0 0 0 9 0" />
    <path d="m12 11.8-1-2.8 1.5-2.2" />
    <path d="m16.2 12.4 1.6-2.4" />
  </>
));

/* Cada actividad de los tres temas, con su icono. */
export const ICONOS_ACTIVIDAD = {
  /* Política Económica */
  "diagnostico-en-vivo": Radar,
  "arma-grupo-logico": Link,
  "tablero-decisiones": Gauge,
  "quien-gana-quien-pierde": Scale,
  "corriente-titulares": CintaTransportadora,
  "explica-la-politica": MicrofonoOnda,
  "simulador-de-crisis": Siren,
  /* Demanda Agregada */
  "electrocardiograma": Activity,
  "termometro-reacciones": Thermometer,
  "banco-transfusiones": Droplet,
  "biopsia-economica": Microscope,
  "triage-emergencias": Cross,
  "cirugia-reconstruccion": Bisturi,
  "sala-monitores": PantallasMultiples,
  /* Política Fiscal */
  "clasificador-tesoro": ContadoraBilletes,
  "directos-indirectos": Stamp,
  "flujo-de-caja": FlujoDinero,
  "agujero-fiscal": AgujeroPiso,
  "expansiva-contractiva": ToggleLeft,
  "disena-presupuesto": Sheet,
  "deficit-vs-deuda": FileStack,
};

/** El icono de una actividad, o null si no tiene uno declarado: el nodo enseña entonces su número. */
export function iconoDe(actividadId) {
  return ICONOS_ACTIVIDAD[actividadId] ?? null;
}
