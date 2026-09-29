import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { Pulsos } from "../corazon/juego.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MEMORAMA — Cimientos, exploratoria. Lo comparten las tres materias.
 *
 * Parejas término-definición boca abajo; se voltean de dos en dos hasta
 * encontrarlas todas. Las posiciones se barajan en cada partida.
 *
 * EXPLORATORIA: paga lo mismo se tarde lo que se tarde. El porcentaje que se
 * envía no mueve los FP —el motor lo ignora en una exploratoria— pero sí llega
 * al panel del docente, así que no se manda un 100 de relleno: se manda la
 * señal de abajo.
 *
 * ═══════════ QUÉ ES UN ÍTEM EN UN JUEGO DE MEMORIA ═══════════
 *
 * Una fila POR PAREJA, cuando se encuentra. No por volteo fallido: al
 * principio todos los volteos son a ciegas —aún no se ha visto ninguna
 * carta— y contarlos como errores mediría la suerte del orden, no lo que el
 * estudiante sabe.
 *
 * Lo que sí dice algo es la CONFUSIÓN INFORMADA: el estudiante voltea una
 * carta y, para acompañarla, elige a propósito otra que YA HABÍA VISTO, y no
 * es su pareja. Eso es decir "esta definición va con este término" y
 * equivocarse. Ese es el error de un repaso de conceptos, y es lo único que
 * se cuenta:
 *
 *   ok          la pareja se encontró sin ninguna confusión informada
 *   intentos    1 + las confusiones informadas en que entró esa pareja
 *   respuesta   con qué otra pareja se confundió la última vez, o null
 *
 * El porcentaje que viaja es el de parejas encontradas sin confusión. Una
 * confusión también puede ser de memoria —recordar mal dónde estaba una
 * carta— y no de concepto; el dato no puede separarlas y no lo pretende.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Lo que tardan dos cartas que no son pareja en volver a su sitio. */
export const VOLTEO_MS = 900;

const CSS_MEMORAMA = `
.fae-mm-rejilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
.fae-mm-carta {
  position: relative; height: 116px; padding: 0; border: none; background: none;
  cursor: pointer; perspective: 700px; font: inherit; color: inherit; border-radius: 12px;
}
.fae-mm-carta:disabled { cursor: default; }
.fae-mm-cara {
  position: absolute; inset: 0; box-sizing: border-box; border-radius: 12px;
  display: grid; place-items: center; padding: 8px 10px; text-align: center;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  transition: transform 320ms cubic-bezier(.3,.8,.4,1);
}
.fae-mm-dorso { background: linear-gradient(155deg, #1C3150, #13233B); border: 1px solid rgba(248,249,250,0.18); }
.fae-mm-frente { transform: rotateY(180deg); background: #16263D; border: 1px solid rgba(248,249,250,0.3); }
.fae-mm-arriba .fae-mm-dorso { transform: rotateY(-180deg); }
.fae-mm-arriba .fae-mm-frente { transform: rotateY(0deg); }
.fae-mm-hecha .fae-mm-frente { background: #173A3F; border-color: ${FAE.teal}; }
@media (prefers-reduced-motion: reduce) { .fae-mm-cara { transition: none !important; } }
`;

const cartasDe = (pares) =>
  barajar(
    pares.flatMap((p) => [
      { clave: `${p.id}:t`, par: p.id, lado: "t", texto: p.termino },
      { clave: `${p.id}:d`, par: p.id, lado: "d", texto: p.definicion },
    ]),
  );

/**
 * @param {object} p
 * @param {Array<{id, termino, definicion}>} p.pares
 * @param {Function} p.Marco  el marco de la materia (ver marcos.jsx)
 */
export default function Memorama({ pares, Marco, rotulo, titulo, acento, onCompletar }) {
  const [cartas, setCartas] = useState(() => cartasDe(pares));
  const [arriba, setArriba] = useState([]);
  const [hechas, setHechas] = useState([]);
  const [turnos, setTurnos] = useState(0);

  /* En refs lo que decide si un toque cuenta: dos toques en el mismo pintado no pueden leer un estado viejo. */
  const arribaRef = useRef([]);
  const hechasRef = useRef([]);
  const vistas = useRef(new Set());
  const confusiones = useRef({});
  const bloqueo = useRef(false);
  const reloj = useRef(null);
  const avisado = useRef(false);
  const inicio = useRef(Date.now());

  const terminado = hechas.length === pares.length;

  useEffect(() => () => clearTimeout(reloj.current), []);

  useEffect(() => {
    if (!terminado || avisado.current) return;
    avisado.current = true;
    const filas = hechasRef.current.map((par, k) => {
      const c = confusiones.current[par];
      return { item: par, ok: !c, intentos: 1 + (c?.n ?? 0), respuesta: c ? c.ultima : null, orden: k + 1 };
    });
    const limpias = filas.filter((f) => f.ok).length;
    onCompletar?.(porcentaje(limpias, pares.length), Date.now() - inicio.current, filas);
  }, [terminado]);

  const ponerArriba = (claves) => {
    arribaRef.current = claves;
    setArriba(claves);
  };

  const voltear = (carta) => {
    if (bloqueo.current || avisado.current) return;
    if (hechasRef.current.includes(carta.par) || arribaRef.current.includes(carta.clave)) return;

    if (arribaRef.current.length === 0) {
      ponerArriba([carta.clave]);
      return;
    }

    const primera = cartas.find((c) => c.clave === arribaRef.current[0]);
    setTurnos((n) => n + 1);
    /* Informada: la segunda carta ya la había visto antes de este turno. */
    const informada = vistas.current.has(carta.clave);
    vistas.current.add(primera.clave);
    vistas.current.add(carta.clave);

    if (primera.par === carta.par) {
      hechasRef.current = [...hechasRef.current, carta.par];
      ponerArriba([]);
      setHechas(hechasRef.current);
      return;
    }

    if (informada) {
      for (const [de, con] of [[primera.par, carta.par], [carta.par, primera.par]]) {
        const c = confusiones.current[de] ?? { n: 0, ultima: null };
        confusiones.current[de] = { n: c.n + 1, ultima: con };
      }
    }
    ponerArriba([primera.clave, carta.clave]);
    bloqueo.current = true;
    reloj.current = setTimeout(() => {
      bloqueo.current = false;
      ponerArriba([]);
    }, VOLTEO_MS);
  };

  const reiniciar = () => {
    clearTimeout(reloj.current);
    setCartas(cartasDe(pares));
    ponerArriba([]);
    hechasRef.current = [];
    setHechas([]);
    setTurnos(0);
    vistas.current = new Set();
    confusiones.current = {};
    bloqueo.current = false;
    avisado.current = false;
    inicio.current = Date.now();
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_MEMORAMA}</style>
      <div style={{ marginBottom: "12px" }}>
        {/* Cuenta las parejas encontradas: «Parejas 0 de N» al empezar, y sube de a una. */}
        <Pulsos total={pares.length} hechos={hechas.length} etiqueta="Parejas" cuenta />
      </div>

      <div className="fae-mm-rejilla">
        {cartas.map((c, k) => {
          const hecha = hechas.includes(c.par);
          const visible = hecha || arriba.includes(c.clave);
          return (
            <button
              key={c.clave}
              type="button"
              className={`fae-mm-carta${visible ? " fae-mm-arriba" : ""}${hecha ? " fae-mm-hecha" : ""}`}
              onClick={() => voltear(c)}
              disabled={hecha || terminado}
              aria-label={visible ? `${c.texto}${hecha ? " · pareja encontrada" : ""}` : `Carta ${k + 1}, boca abajo`}
            >
              <span className="fae-mm-cara fae-mm-dorso" aria-hidden="true">
                <span style={{ width: "16px", height: "16px", borderRadius: "3px", border: "2px solid rgba(248,249,250,0.28)", transform: "rotate(45deg)" }} />
              </span>
              <span className="fae-mm-cara fae-mm-frente" aria-hidden="true">
                <span
                  style={
                    c.lado === "t"
                      ? { fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: 1.25, color: FAE.text }
                      : { fontFamily: "Inter, sans-serif", fontSize: "12.5px", lineHeight: 1.35, color: "rgba(248,249,250,0.9)" }
                  }
                >
                  {c.texto}
                </span>
                {/* Encontrada no es solo un color: lleva su ✓. */}
                {hecha && <span style={{ position: "absolute", top: "6px", right: "9px", fontSize: "13px", color: FAE.teal }}>✓</span>}
              </span>
            </button>
          );
        })}
      </div>

      {terminado && (
        <div className="fae-cz-entrar" role="status" style={{ marginTop: "16px", padding: "15px 17px", borderRadius: "16px", background: "rgba(42,157,143,0.09)", border: `1px solid ${FAE.teal}55` }}>
          <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(248,249,250,0.55)" }}>
            TODAS LAS PAREJAS
          </p>
          <p style={{ margin: "0 0 10px", fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.8)" }}>
            En {turnos} {turnos === 1 ? "turno" : "turnos"}. Estas son, para tenerlas juntas:
          </p>
          <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "5px" }}>
            {pares.map((p) => (
              <li key={p.id} style={{ fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.82)" }}>
                <strong style={{ fontFamily: "Sora, sans-serif", color: FAE.text }}>{p.termino}</strong> — {p.definicion}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={reiniciar}
            style={{
              marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "7px",
              fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
              padding: "9px 15px", borderRadius: "999px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.75)",
            }}
          >
            <RotateCcw size={13} /> Otra vez, con las cartas en otro sitio
          </button>
        </div>
      )}
    </Marco>
  );
}
