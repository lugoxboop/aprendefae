import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * FERMI, TRABAJANDO — la espera deja de ser una pantalla muerta.
 *
 * Encargo de Mateo (3-nov): «el profesor no sabe si Fermi está trabajando o
 * no». Tenía razón y el problema iba a empeorar: la generación buena tarda
 * minutos, no segundos, y un botón que dice «Creando…» durante nueve minutos
 * se lee como un bloqueo, no como trabajo.
 *
 * ═══════════ POR QUÉ UN TESERACTO Y NO UN SPINNER ═══════════
 *
 * Un spinner dice «espere». El teseracto dice «esto es AprendeFAE»: es la
 * misma figura de la racha, ya construida y ya medida, girando en 4D. No se
 * dibuja otra: se reusa la que hay (regla del canon — nada de dos figuras
 * parecidas en el mismo sitio).
 *
 * Va con `dia = 60`: la figura completa y en su punto de brillo máximo. Aquí
 * no cuenta ninguna racha, así que no hay nada que revelar a medias.
 *
 * ═══════════ LAS FASES SON LAS DE VERDAD ═══════════
 *
 * No son frases de relleno que giran al azar. Son, en orden, los pasos que
 * da la fábrica, y cada una pesa lo que de verdad tarda. Mientras el servidor
 * no informe su fase, se estiman por tiempo; el día que la informe, entra por
 * la prop `fase` y lo único que cambia es de dónde sale el número.
 *
 * La barra nunca llega al final sola: se detiene en 92 %. Una barra que llega
 * a 100 y sigue esperando miente dos veces.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Teseracto = lazy(() => import("../racha/Teseracto.jsx"));

/* Lo que de verdad hace la fábrica, en orden, y cuánto pesa cada paso. Los
 * pesos salen de dónde se va el tiempo: escribir y dibujar son el grueso. */
export const FASES = [
  {
    peso: 8,
    titulo: "Leyendo tu material",
    notas: ["Abriendo el archivo", "Buscando de qué trata", "Separando lo que sirve de lo que no"],
  },
  {
    peso: 12,
    titulo: "Eligiendo qué enseñar",
    notas: ["Sacando los términos que hay que nombrar", "Descartando lo que ya está en el sitio", "Ordenando de lo simple a lo difícil"],
  },
  {
    peso: 40,
    titulo: "Escribiendo las actividades",
    notas: ["Buscando un ejemplo en pesos", "Un paso, una idea nueva", "Diciéndolo con nuestras palabras", "Escribiendo la pregunta del final"],
  },
  {
    peso: 28,
    titulo: "Dibujando cada escena",
    notas: ["Decidiendo qué se ve en cada paso", "Encendiendo una cosa y apagando el resto", "Cuadrando que entre en un celular"],
  },
  {
    peso: 12,
    titulo: "Revisando una por una",
    notas: ["¿Algún paso repite al anterior?", "¿Se entiende sin leerlo dos veces?", "Última pasada"],
  },
];

/* Cuánto suele tardar un encargo completo. Solo mueve la barra: si tarda más,
 * la barra se queda quieta en su tope y el reloj sigue, que es lo honesto.
 *
 * Es una prop y no una constante a propósito. Hoy la fábrica es una sola
 * llamada de minuto y pico; cuando pase a varias pasadas tardará diez veces
 * más, y una barra calibrada para el encargo equivocado se queda en el 11 %
 * justo cuando termina. Quien llama sabe qué fábrica está usando. */
export const DURACION_UNA_PASADA_MS = 75 * 1000;
const TOPE = 0.92;
const MS_POR_NOTA = 4200;
/* Cuándo se le dice que puede irse: pasado lo que se esperaba. Antes sería
 * alarmista; después de eso, callarse sería dejarlo mirando una pantalla. */
const AVISO_LARGO = 1.1;

const acumulado = FASES.reduce((suma, f) => suma + f.peso, 0);

/** En qué fase cae un avance de 0 a 1, y cuánto lleva recorrido dentro de ella. */
export function faseDe(avance) {
  const objetivo = Math.max(0, Math.min(1, avance)) * acumulado;
  let piso = 0;
  for (let i = 0; i < FASES.length; i += 1) {
    const techo = piso + FASES[i].peso;
    if (objetivo < techo || i === FASES.length - 1) {
      return { indice: i, dentro: FASES[i].peso ? (objetivo - piso) / FASES[i].peso : 0 };
    }
    piso = techo;
  }
  return { indice: 0, dentro: 0 };
}

export function relojDe(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * @param {object}  p
 * @param {number}  [p.fase]      fase informada por el servidor, si algún día la informa
 * @param {number}  [p.duracion]  cuánto se espera que tarde, en ms
 * @param {number}  [p.tamano]    lado del teseracto en px
 */
export default function FermiTrabajando({ fase, duracion = DURACION_UNA_PASADA_MS, tamano = 128 }) {
  const [ms, setMs] = useState(0);
  const [sinWebGL, setSinWebGL] = useState(false);
  const arranque = useRef(Date.now());

  useEffect(() => {
    arranque.current = Date.now();
    const t = setInterval(() => setMs(Date.now() - arranque.current), 500);
    return () => clearInterval(t);
  }, []);

  const avance = Math.min(TOPE, ms / Math.max(1, duracion));
  const porTiempo = faseDe(avance);
  const indice = Number.isInteger(fase) ? Math.max(0, Math.min(FASES.length - 1, fase)) : porTiempo.indice;
  const actual = FASES[indice];
  const nota = actual.notas[Math.floor(ms / MS_POR_NOTA) % actual.notas.length];

  return (
    <div className="fermi" role="status" aria-live="polite" data-fermi-trabajando>
      <div className="fermi__figura" style={{ width: tamano, height: tamano }} aria-hidden="true">
        {sinWebGL ? (
          <span className="fermi__anillo" />
        ) : (
          <Suspense fallback={<span className="fermi__anillo" />}>
            <Teseracto dia={60} onSinWebGL={() => setSinWebGL(true)} />
          </Suspense>
        )}
      </div>

      <div className="fermi__texto">
        <p className="fermi__titulo">
          {actual.titulo}
          <span className="fermi__puntos" aria-hidden="true"><i />
            <i />
            <i />
          </span>
        </p>
        {/* La clave hace que React rehaga el nodo, y el nodo nuevo entra con
            su propia animación: el cambio se nota sin que nada parpadee. */}
        <p className="fermi__nota" key={nota}>{nota}</p>

        <div className="fermi__barra">
          <span className="fermi__barra-llena" style={{ width: `${Math.round(avance * 100)}%` }} />
        </div>

        <p className="fermi__pie">
          <span className="fermi__reloj">{relojDe(ms)}</span>
          {ms > duracion * AVISO_LARGO
            ? " · Tarda unos minutos. Puedes dejar esta pestaña abierta e irte."
            : " · Fermi está trabajando"}
        </p>
      </div>
    </div>
  );
}

export const CSS_FERMI = `
.fermi {
  display: flex; align-items: center; gap: 18px;
  padding: 18px; margin: 14px 0 0;
  border: 1px solid rgba(42,157,143,0.28); border-radius: 16px;
  background:
    radial-gradient(120% 140% at 0% 50%, rgba(42,157,143,0.14), transparent 62%),
    rgba(6,32,42,0.55);
}
.fermi__figura { flex-shrink: 0; position: relative; display: grid; place-items: center; }
.fermi__figura canvas { width: 100%; height: 100%; display: block; }

/* El relevo sin WebGL: dos anillos facetados que giran. No imita al teseracto
   —imitarlo mal sería peor—, solo mantiene vivo el mismo lenguaje. */
.fermi__anillo {
  width: 62%; height: 62%; border-radius: 50%;
  border: 2px solid rgba(42,157,143,0.22); border-top-color: ${FAE.teal};
  animation: fermi-gira 1.5s linear infinite;
}

.fermi__texto { min-width: 0; flex: 1; }
.fermi__titulo {
  margin: 0; font-family: Sora, sans-serif; font-size: 15px; font-weight: 700;
  color: ${FAE.text}; display: flex; align-items: baseline; gap: 2px;
}
.fermi__puntos { display: inline-flex; gap: 3px; margin-left: 2px; }
.fermi__puntos i {
  width: 3px; height: 3px; border-radius: 50%; background: ${FAE.teal};
  animation: fermi-late 1.4s ease-in-out infinite;
}
.fermi__puntos i:nth-child(2) { animation-delay: 0.18s; }
.fermi__puntos i:nth-child(3) { animation-delay: 0.36s; }

.fermi__nota {
  margin: 5px 0 0; font-size: 13px; line-height: 1.5;
  color: rgba(248,249,250,0.74);
  animation: fermi-entra 420ms cubic-bezier(.3,.9,.4,1) both;
}

.fermi__barra {
  margin-top: 12px; height: 3px; border-radius: 2px; overflow: hidden;
  background: rgba(248,249,250,0.10);
}
.fermi__barra-llena {
  display: block; height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, rgba(42,157,143,0.55), ${FAE.teal});
  transition: width 500ms linear;
}

.fermi__pie { margin: 8px 0 0; font-size: 12px; color: rgba(248,249,250,0.58); }
.fermi__reloj { font-variant-numeric: tabular-nums; color: rgba(248,249,250,0.78); }

@keyframes fermi-gira { to { transform: rotate(360deg); } }
@keyframes fermi-late {
  0%, 100% { opacity: 0.25; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-2px); }
}
@keyframes fermi-entra {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 420px) {
  .fermi { gap: 14px; padding: 14px; }
  .fermi__figura { width: 84px !important; height: 84px !important; }
}

@media (prefers-reduced-motion: reduce) {
  .fermi__anillo, .fermi__puntos i { animation: none; }
  .fermi__nota { animation: none; }
  .fermi__barra-llena { transition: none; }
  .fermi__puntos i { opacity: 0.7; }
}
`;
