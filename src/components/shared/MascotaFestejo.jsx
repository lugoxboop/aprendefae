import { useState } from "react";
import Mascota from "../Mascota.jsx";
import { useAuthOpcional } from "../../auth/AuthProvider.jsx";
import { mascotaDe } from "../../mascota/mascotas.js";
import { FESTEJOS } from "../../mascota/marionetas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MASCOTA FESTEJA — el cierre compartido de TODA actividad.
 *
 * Pedido de Mateo (19-nov): al terminar cualquier actividad, la mascota del
 * propio estudiante —su especie, su color, sus accesorios— sale en grande,
 * feliz y felicitándolo. Es el momento de la dopamina: si la mascota no
 * celebra cuando uno termina, no tiene sentido tener mascota.
 *
 * NO SIEMPRE EL MISMO BAILE. Cada cierre elige uno de los festejos
 * (FESTEJOS en mascota/marionetas.js: mover la colita, bailar, cantar,
 * saltitos, saludar, voltereta) y nunca repite el de la vez anterior. Lo
 * sorpresivo engancha más que lo previsible.
 *
 * SIEMPRE FELIZ, sea cual sea el resultado. Con un resultado bajo no cambia
 * el baile, cambia la frase: celebra que terminó y lo anima a seguir. Nunca
 * hay reproche ni retroceso en lo que dice.
 *
 * Quien no tiene cuenta también la ve: mascotaDe() le da la mascota de
 * fábrica. No atrapa nada: es solo dibujo, sin botones ni foco.
 * Con «reducir movimiento» la mascota sale quieta, feliz y con su frase.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Lo que dice la mascota, por festejo. Cortas: se leen de un vistazo. */
export const FRASES = {
  colita: "¡Lo lograste! Mira cómo muevo la colita",
  baila: "¡Esto se celebra bailando!",
  canta: "♪ ¡Lo hiciste, lo hiciste! ♪",
  saltitos: "¡Salto de la emoción!",
  saluda: "¡Bien hecho! Qué orgullo me das",
  celebra: "¡Esto merece una voltereta!",
};

/* Con un resultado bajo: la misma fiesta, otra frase. Celebra el esfuerzo. */
export const FRASES_ANIMO = [
  "¡Terminaste! Estoy feliz de verte aquí",
  "¡Llegaste al final! Vamos por la próxima",
  "¡Terminaste! Cada intento te hace más fuerte",
];

/* sessionStorage y no localStorage: las secuencias de Aprender no tocan almacenamiento duradero (t1-avance). */
const CLAVE = "fae-festejo-ultimo";
let ultimoEnMemoria = null;

const leerUltimo = () => {
  try { return window.sessionStorage.getItem(CLAVE) ?? ultimoEnMemoria; } catch { return ultimoEnMemoria; }
};
const guardarUltimo = (f) => {
  ultimoEnMemoria = f;
  try { window.sessionStorage.setItem(CLAVE, f); } catch { /* sin almacenamiento: queda en memoria */ }
};

/** Un festejo al azar, distinto del último que vio este estudiante. */
export function elegirFestejo(azar = Math.random) {
  const ultimo = leerUltimo();
  const opciones = FESTEJOS.filter((f) => f !== ultimo);
  const f = opciones[Math.floor(azar() * opciones.length) % opciones.length];
  guardarUltimo(f);
  return f;
}

const CSS = `
.fae-mf { position: relative; display: flex; flex-direction: column; align-items: center; padding: 6px 0 0; pointer-events: none; }
.fae-mf-globo {
  position: relative; z-index: 2; max-width: min(260px, 88%); margin: 0 0 14px; padding: 10px 16px; border-radius: 18px;
  background: #F8F9FA; color: #0E1B2E; font-family: Sora, sans-serif; font-weight: 700; font-size: 15px; line-height: 1.3; text-align: center;
  box-shadow: 0 6px 18px rgba(4,10,20,0.35);
  animation: fae-mf-globo 520ms cubic-bezier(.3,1.6,.5,1) 380ms both;
}
.fae-mf-pico { position: absolute; left: 50%; bottom: -7px; width: 14px; height: 14px; margin-left: -7px; background: #F8F9FA; transform: rotate(45deg); border-radius: 0 0 3px 0; }
.fae-mf-escena { position: relative; display: flex; justify-content: center; animation: fae-mf-entra 640ms cubic-bezier(.3,1.5,.5,1) both; }
.fae-mf-halo { position: absolute; left: 50%; top: 55%; width: 128%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%;
  background: radial-gradient(circle, rgba(42,157,143,0.42) 0%, rgba(42,157,143,0.16) 42%, rgba(42,157,143,0) 68%);
  animation: fae-mf-halo 2.4s ease-in-out infinite; }
@keyframes fae-mf-entra { from { opacity: 0; transform: translateY(26px) scale(.35); } }
@keyframes fae-mf-globo { from { opacity: 0; transform: translateY(10px) scale(.6); } }
@keyframes fae-mf-halo { 0%,100% { opacity: .75; transform: translate(-50%, -50%) scale(.94); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); } }
@media (prefers-reduced-motion: reduce) {
  .fae-mf, .fae-mf * { animation: none !important; }
}
`;

/**
 * <MascotaFestejo />            el festejo de cierre, con la mascota del perfil
 *   franja     "alta" | "media" | "baja" (de la pantalla de resumen): con
 *              "baja" la frase anima en vez de felicitar el resultado
 *   frase      una frase propia, que gana sobre las de arriba
 *   variante   fija el festejo (para pruebas y vistas previas)
 *   tamano     ancho de la mascota en px (cuerpo entero)
 */
export default function MascotaFestejo({ franja = null, frase = null, variante = null, tamano = 156, perfil: perfilDado = null }) {
  const auth = useAuthOpcional();
  const perfil = perfilDado ?? auth?.perfil ?? null;
  const [festejo] = useState(() => (variante && FESTEJOS.includes(variante) ? variante : elegirFestejo()));
  const [animo] = useState(() => FRASES_ANIMO[Math.floor(Math.random() * FRASES_ANIMO.length)]);
  const { especie, paleta, ojos, puestos } = mascotaDe(perfil ?? { id: auth?.usuario?.id ?? "" });
  const texto = frase ?? (franja === "baja" ? animo : FRASES[festejo]);

  return (
    <div className="fae-mf" data-mascota-festejo={festejo} data-franja={franja ?? "sin"}>
      <style>{CSS}</style>
      <p className="fae-mf-globo" data-globo>
        {texto}
        <span className="fae-mf-pico" aria-hidden="true" />
      </p>
      <div className="fae-mf-escena" aria-hidden="true">
        <span className="fae-mf-halo" />
        <Mascota
          especie={especie}
          paleta={paleta}
          ojos={ojos}
          puestos={puestos}
          tamano={tamano}
          encuadre="cuerpo"
          animo={festejo}
          style={{ position: "relative" }}
        />
      </div>
    </div>
  );
}
