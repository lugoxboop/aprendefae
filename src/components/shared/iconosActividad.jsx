import {
  Link, Gauge, Scale, Siren,
  Activity, Thermometer, Droplet, Microscope, Cross,
  Stamp, Sheet, FileStack, ToggleLeft, ArrowRightLeft,
} from "lucide-react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ICONO DE CADA ACTIVIDAD, para su nodo del camino y su insignia.
 *
 * REUTILIZAR ANTES QUE INVENTAR. El sitio ya dibuja sus iconos con
 * lucide-react, así que catorce de los veintiuno son de ahí. El juego de las
 * medallas (Medalla.jsx) no tenía ninguno que sirviera: sus glifos son de
 * logros —racha, ranking, liga—, no de actividades. Los que lucide no tiene
 * se dibujan aquí, con su misma rejilla de 24, trazo de 2 y extremos
 * redondos, para que no se note cuál es de quién.
 *
 * TODOS SE JUZGAN A SU TAMAÑO REAL: 24 px dentro de un nodo de 44 en el
 * teléfono. Tres no se leían y se cambiaron de metáfora, no de dibujo:
 *
 *   El agujero fiscal   un óvalo en el piso se leía como un ojo o un ovni
 *                       → una grieta en zigzag partiendo un rectángulo
 *   Sala de monitores   dos pantallas arriba se leían como la cara de un robot
 *                       → un pulso de alerta: punto y anillos que se abren
 *   Flujo de caja       la moneda con la flecha curva, como un renacuajo
 *                       → ⇄, dos flechas rectas (ArrowRightLeft, de lucide)
 *
 * Y el pulso de Sala de monitores chocaba con el radar de Diagnóstico en
 * vivo: dos pictogramas de ondas concéntricas en el mismo sitio. Se cambió
 * Diagnóstico, que en la ficha es "consola de monitoreo con onda tipo radar":
 * ahora es la consola —una pantalla con su pie— con el radar dentro. La
 * pantalla rectangular es lo que los separa a 24 px.
 *
 * Todos tienen la misma forma que un icono de lucide —size, color,
 * strokeWidth y el resto va al <svg>—, así que el camino y la medalla los
 * usan igual sin saber de dónde vienen.
 *
 * UNA ACTIVIDAD SIN ICONO NO ROMPE NADA: iconoDe() devuelve null y el nodo
 * enseña su número.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* `dibujo` es el contenido del svg, o una función del color para lo que va relleno. */
function propio(nombre, dibujo) {
  const Icono = ({ size = 24, color = "currentColor", strokeWidth = 2, ...resto }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      {...resto}
    >
      {typeof dibujo === "function" ? dibujo(color) : dibujo}
    </svg>
  );
  Icono.displayName = nombre;
  return Icono;
}

/* Diagnóstico en vivo: la consola de monitoreo —pantalla y pie— con el radar dentro. */
export const ConsolaRadar = propio("ConsolaRadar", (c) => (
  <>
    <rect x="2.5" y="2.5" width="19" height="14" rx="2" />
    <path d="M8.5 21h7M12 16.5V21" />
    <circle cx="12" cy="9.5" r="4.3" />
    {/* El barrido, como cuña rellena: con solo la línea, el círculo cruzado se leía como una señal de prohibido. */}
    <path d="M12 9.5 12 5.2A4.3 4.3 0 0 1 15.72 7.35Z" fill={c} fillOpacity="0.45" stroke="none" />
    <path d="M12 9.5 15.72 7.35" strokeWidth="1.6" />
    <circle cx="9.9" cy="11" r="0.9" fill={c} stroke="none" />
  </>
));

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

/*
 * Sala de monitores: un pulso de alerta. El punto, un anillo entero y el de
 * fuera ya abriéndose en dos arcos: irradia, y no es simétrico como las dos
 * pantallas que parecían una cara.
 */
export const PulsoAlerta = propio("PulsoAlerta", (c) => (
  <>
    <circle cx="12" cy="12" r="2.2" fill={c} stroke="none" />
    <circle cx="12" cy="12" r="5.6" />
    <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5" />
    <path d="M12 21.5A9.5 9.5 0 0 1 2.5 12" />
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

/* El agujero fiscal: una grieta en zigzag que parte el rectángulo. Angular: una curva se leía como un ojo. */
export const GrietaFiscal = propio("GrietaFiscal", (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12.5 4 10 8.5l3 3-2.5 3.5 1.5 5" />
  </>
));

/* Cada actividad de los tres temas, con su icono. */
export const ICONOS_ACTIVIDAD = {
  /* Política Económica */
  "diagnostico-en-vivo": ConsolaRadar,
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
  "sala-monitores": PulsoAlerta,
  /* Política Fiscal */
  "clasificador-tesoro": ContadoraBilletes,
  "directos-indirectos": Stamp,
  "flujo-de-caja": ArrowRightLeft,
  "agujero-fiscal": GrietaFiscal,
  "expansiva-contractiva": ToggleLeft,
  "disena-presupuesto": Sheet,
  "deficit-vs-deuda": FileStack,
};

/** El icono de una actividad, o null si no tiene uno declarado: el nodo enseña entonces su número. */
export function iconoDe(actividadId) {
  return ICONOS_ACTIVIDAD[actividadId] ?? null;
}
