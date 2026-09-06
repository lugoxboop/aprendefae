import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { CORRIENTE, ANILLOS } from "../../data/icebergActividades.js";
import { barajar } from "../../utils/barajar.js";

/*
 * "Corriente cruzada" — práctica intercalada.
 *
 * QUÉ CAMBIA RESPECTO AL RADAR, QUE POR FUERA SE PARECE. El radar da siete
 * señales de UN caso: una vez metido en el canal de reseñas, clasificar la
 * siguiente frase es más fácil, porque el contexto ya está montado. Aquí las
 * frases vienen de los cuatro casos del tema y NUNCA dos seguidas del mismo. El
 * contexto se cae entre frase y frase, y lo único que queda para decidir es la
 * regla: qué hace que algo sea un patrón y no un evento.
 *
 * Eso es práctica intercalada, y es peor de hacer y mejor de aprender: en el
 * momento se falla más que practicando por bloques, y una semana después se
 * recuerda más. Por eso está clasificada como difícil aunque el contenido sea
 * el mismo que el estudiante ya vio.
 *
 * EL TEXTO NO ES NUEVO. Son las frases ya escritas y ya clasificadas de la
 * tienda, el canal, Blockbuster y el equipo. Lo nuevo es el desorden.
 *
 * LA CORRIENTE APRIETA, PERO NO ES LA ACTIVIDAD. Cada frase cruza en menos
 * tiempo que la anterior. Si se va sin red, cuenta como fallo. Con
 * `prefers-reduced-motion` la corriente se para del todo y la frase espera: se
 * pierde la presión y se queda el intercalado, que es lo que de verdad se está
 * practicando.
 *
 * PUNTUACIÓN: una parte por frase bien clasificada, sin castigo por fallar más
 * allá de perder esa parte. Con dieciséis frases, cada una vale 6.25 y el
 * porcentaje sale del total sin más cuentas.
 */

/* Cuánto tarda una frase en cruzar, en ms: la primera holgada, luego apretando. */
const CRUCE_INICIAL = 9000;
const ACELERA = 350;
const CRUCE_MINIMO = 4500;
const cruceDe = (i) => Math.max(CRUCE_MINIMO, CRUCE_INICIAL - i * ACELERA);

const CSS = `
@keyframes fae-cc-arrastre { from { transform: translateX(-6%); } to { transform: translateX(106%); } }
@keyframes fae-cc-veta { from { transform: translateX(-20%); } to { transform: translateX(120%); } }
.fae-cc-veta { animation: fae-cc-veta 7s linear infinite; }
@keyframes fae-cc-red { 0% { transform: translateY(0); } 40% { transform: translateY(5px); } 100% { transform: translateY(0); } }
.fae-cc-red { animation: fae-cc-red 320ms ease-out; }
@keyframes fae-cc-entrar { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.fae-cc-entrar { animation: fae-cc-entrar 420ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-cc-veta, .fae-cc-red, .fae-cc-entrar { animation: none !important; }
  .fae-cc-pieza { animation: none !important; transform: none !important; }
}
`;

/*
 * Baraja garantizando que no salgan dos frases seguidas del mismo caso. Es la
 * mecánica entera: si se agrupasen, esto sería el radar cuatro veces.
 *
 * Se toma siempre de la pila más alta entre las permitidas, que es lo que evita
 * quedarse al final con tres frases del mismo caso y no tener con qué separarlas.
 */
export function mezclarCorriente(items) {
  const porCaso = new Map();
  for (const it of items) {
    if (!porCaso.has(it.caso)) porCaso.set(it.caso, []);
    porCaso.get(it.caso).push(it);
  }
  const pilas = [...porCaso.values()].map((xs) => barajar(xs));
  const salida = [];
  let ultimo = null;

  while (pilas.some((p) => p.length > 0)) {
    const vivas = pilas.filter((p) => p.length > 0);
    const permitidas = vivas.filter((p) => p[0].caso !== ultimo);
    const fuente = (permitidas.length ? permitidas : vivas)
      .sort((a, b) => b.length - a.length)[0];
    const it = fuente.shift();
    salida.push(it);
    ultimo = it.caso;
  }
  return salida;
}

export default function CorrienteCruzada({ onCompletar }) {
  const [tanda, setTanda] = useState(() => mezclarCorriente(CORRIENTE));
  const [i, setI] = useState(0);
  const [fallos, setFallos] = useState([]);     // { texto, caso, nivel, dado }
  const [aciertos, setAciertos] = useState(0);
  const [redTocada, setRedTocada] = useState(null);
  const inicio = useRef(Date.now());

  const actual = tanda[i];
  const terminado = i >= tanda.length;
  const pct = Math.round((aciertos * 100) / tanda.length);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current);
  }, [terminado]);

  /* Se resuelve la frase actual: `dado` es null cuando se la llevó la corriente. */
  const resolver = (dado) => {
    if (!actual) return;
    if (dado === actual.nivel) setAciertos((a) => a + 1);
    else setFallos((f) => [...f, { ...actual, dado }]);
    setI((n) => n + 1);
  };

  const echarRed = (nivel) => {
    setRedTocada(nivel);
    setTimeout(() => setRedTocada(null), 340);
    resolver(nivel);
  };

  const reiniciar = () => {
    setTanda(mezclarCorriente(CORRIENTE));
    setI(0); setFallos([]); setAciertos(0);
    inicio.current = Date.now();
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* ------------------------------ la corriente ------------------------------ */}
      <div
        style={{
          position: "relative", overflow: "hidden", borderRadius: "18px",
          background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)",
          height: "142px", marginBottom: "12px",
        }}
      >
        {/* Vetas del agua en movimiento, para que se vea de dónde viene el arrastre. */}
        {[26, 68, 112].map((y, k) => (
          <span
            key={y}
            aria-hidden="true"
            className="fae-cc-veta"
            style={{
              position: "absolute", top: `${y}px`, left: 0, width: "34%", height: "1px",
              background: `linear-gradient(to right, transparent, rgba(42,157,143,0.28), transparent)`,
              animationDelay: `${k * 2.1}s`,
            }}
          />
        ))}

        {actual ? (
          <div
            /*
             * La animación es la que manda: si se para —pestaña oculta, motion
             * reducido— la frase no cruza y tampoco se pierde. El reloj y el
             * dibujo son el mismo, así que no pueden discrepar.
             */
            key={actual.id}
            className="fae-cc-pieza"
            onAnimationEnd={() => resolver(null)}
            style={{
              position: "absolute", top: "50%", left: 0, marginTop: "-27px",
              width: "min(74%, 320px)", padding: "12px 15px", borderRadius: "14px",
              background: "rgba(248,249,250,0.06)", border: "1px solid rgba(203,220,242,0.28)",
              color: FAE.text, fontSize: "13.5px", lineHeight: 1.45,
              animation: `fae-cc-arrastre ${cruceDe(i)}ms linear forwards`,
            }}
          >
            {actual.texto}
          </div>
        ) : (
          <div className="fae-cc-entrar" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "32px", color: FAE.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {aciertos} de {tanda.length}
            </p>
          </div>
        )}
      </div>

      <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", margin: "0 0 12px" }}>
        {terminado
          ? "La corriente amainó."
          : `Frase ${i + 1} de ${tanda.length}. Échale la red antes de que se vaya — vienen de los cuatro casos, mezcladas.`}
      </p>

      {/* -------------------------------- las redes -------------------------------- */}
      {!terminado && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(136px, 1fr))", gap: "9px" }}>
          {ANILLOS.map((nivel) => (
            <button
              key={nivel}
              type="button"
              className={redTocada === nivel ? "fae-cc-red" : undefined}
              onClick={() => echarRed(nivel)}
              style={{
                padding: "14px 12px", borderRadius: "14px", cursor: "pointer",
                background: "rgba(42,157,143,0.07)", border: `1px solid rgba(42,157,143,0.4)`,
                color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {nivel}
            </button>
          ))}
        </div>
      )}

      {/* ------------------------------- el balance ------------------------------- */}
      {terminado && (
        <div className="fae-cc-entrar">
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
            {fallos.length === 0
              ? "Las dieciséis, de cuatro casos distintos y sin dos seguidas del mismo. Eso ya no es acordarse de un caso: es tener la regla."
              : "Fallar aquí más que en el radar es lo esperado. Ahí el caso te sostenía entre frase y frase; aquí se cae, y solo queda la regla."}
          </p>

          {fallos.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "16px" }}>
              {fallos.map((f, k) => (
                <div key={k} style={{ paddingLeft: "13px", borderLeft: `2px solid ${FAE.ambar}` }}>
                  <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.85)", margin: "0 0 4px" }}>
                    {f.texto}
                  </p>
                  <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 600, color: "rgba(248,249,250,0.5)", margin: 0 }}>
                    {f.caso} · era {f.nivel} · {f.dado ? `la echaste a ${f.dado}` : "se la llevó la corriente"}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={reiniciar}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "9px 15px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
          >
            <RotateCcw size={14} /> Volver a la corriente
          </button>
        </div>
      )}
    </div>
  );
}
