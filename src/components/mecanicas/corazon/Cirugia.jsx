import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { CASOS_CIRUGIA } from "../../../data/demandaAgregadaHacer.js";
import { Camaraseccion } from "./circulatorio.jsx";
import { CSS_JUEGO, Opcion, Opciones, Retro, Cierre, Enunciado } from "./juego.jsx";

/*
 * ACTIVIDAD 6 — "Cirugía de reconstrucción". Crear · Experto.
 *
 * Un golpe a la economía y dos casillas: por dónde entra primero y qué se
 * arrastra después. Reconstruir la cadena, no reconocerla.
 *
 * ═══════════ EL CASTIGO ES SOLO POR SEÑUELO ═══════════
 *
 * Poner el componente de segundo orden en la casilla de primero es un error de
 * secuencia DENTRO de la cadena correcta: el estudiante ya identificó los dos
 * canales y se equivocó de orden. Tocar el tipo de cambio en una helada es
 * salirse de la cadena. Lo segundo cuesta cinco puntos; lo primero, ninguno.
 *
 * Con las dos casillas siempre acabadas de llenar, el techo real es
 * 100 − 5 × señuelos. El reparto 60/40 se conserva porque es la definición del
 * puntaje y dice cuánto pesa cada casilla, aunque hoy no haya forma de
 * terminar la actividad con solo una puesta.
 *
 * ═══════════ LOS ids LLEVAN EL CASO DELANTE ═══════════
 *
 *   a:primero · a:segundo   (la helada)
 *   b:primero · b:segundo   (el puente)
 *
 * "Primer orden" en la helada es XN y en el puente es Ḡ: son dos preguntas
 * distintas y sin el prefijo compartirían fila.
 */

const PESO_PRIMERO = 60;
const PESO_SEGUNDO = 40;
const CASTIGO_SENUELO = 5;

const CASILLAS = [
  { papel: "primero", rotulo: "PRIMER ORDEN", ayuda: "Por dónde entra el golpe, directo." },
  { papel: "segundo", rotulo: "SEGUNDO ORDEN", ayuda: "Lo que se arrastra después, en un segundo momento." },
];

export default function Cirugia({ onCompletar }) {
  const [caso, setCaso] = useState(() => barajar(CASOS_CIRUGIA)[0]);
  const [opciones, setOpciones] = useState(() => barajar(caso.opciones));
  const [puestas, setPuestas] = useState({});
  const [aviso, setAviso] = useState(null);
  const [senuelos, setSenuelos] = useState(0);

  const detalle = useRef([]);
  const intentos = useRef({});
  const primerFallo = useRef({});
  const inicio = useRef(Date.now());

  const casillaActual = CASILLAS.find((c) => !puestas[c.papel]);
  const completa = !casillaActual;

  const pct = Math.max(
    0,
    (puestas.primero ? PESO_PRIMERO : 0) + (puestas.segundo ? PESO_SEGUNDO : 0) - CASTIGO_SENUELO * senuelos
  );

  useEffect(() => {
    if (completa) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [completa]);

  const tocar = (opcion) => {
    if (completa) return;
    const papel = casillaActual.papel;
    setAviso(opcion.retro);

    const n = (intentos.current[papel] ?? 0) + 1;
    intentos.current[papel] = n;

    if (opcion.papel === papel) {
      detalle.current.push({
        item: `${caso.id}:${papel}`,
        ok: n === 1,
        intentos: n,
        respuesta: primerFallo.current[papel] ?? null,
        orden: detalle.current.length + 1,
      });
      setPuestas((p) => ({ ...p, [papel]: opcion }));
      return;
    }

    if (!primerFallo.current[papel]) primerFallo.current[papel] = opcion.id;
    /* Solo los señuelos cuestan: salirse de la cadena, no equivocarse de orden. */
    if (opcion.papel === "senuelo") setSenuelos((s) => s + 1);
  };

  const reiniciar = () => {
    const otro = CASOS_CIRUGIA.find((c) => c.id !== caso.id) ?? caso;
    setCaso(otro);
    setOpciones(barajar(otro.opciones));
    setPuestas({}); setAviso(null); setSenuelos(0);
    detalle.current = [];
    intentos.current = {};
    primerFallo.current = {};
    inicio.current = Date.now();
  };

  const puestaId = (papel) => puestas[papel]?.id;

  return (
    <Camaraseccion rotulo="CIRUGÍA DE RECONSTRUCCIÓN" titulo="¿Por dónde entra y qué arrastra?" acento={FAE.ambar}>
      <style>{CSS_JUEGO}</style>

      <Enunciado rotulo="EL GOLPE" acento={FAE.ambar}>{caso.caso}</Enunciado>

      {/* Las dos casillas, siempre visibles: la cadena que hay que reconstruir. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "14px" }}>
        {CASILLAS.map((c) => {
          const puesta = puestas[c.papel];
          const activa = !puesta && casillaActual?.papel === c.papel;
          return (
            <div
              key={c.papel}
              style={{
                padding: "13px 15px", borderRadius: "14px",
                background: puesta ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.03)",
                border: `1px ${puesta ? "solid" : "dashed"} ${puesta ? FAE.teal : activa ? FAE.ambar : "rgba(248,249,250,0.18)"}`,
              }}
            >
              <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: puesta ? FAE.teal : activa ? FAE.ambar : "rgba(248,249,250,0.4)" }}>
                {c.rotulo}{activa ? " · TE TOCA" : ""}
              </p>
              <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.45, color: puesta ? FAE.text : "rgba(248,249,250,0.45)" }}>
                {puesta ? puesta.texto : c.ayuda}
              </p>
            </div>
          );
        })}
      </div>

      {!completa && (
        <Opciones>
          {opciones.map((o) => {
            const yaPuesta = puestaId("primero") === o.id || puestaId("segundo") === o.id;
            return (
              <Opcion
                key={o.id}
                ancho
                deshabilitada={yaPuesta}
                onClick={() => tocar(o)}
                estado={yaPuesta ? "correcta" : null}
              >
                {o.texto}
              </Opcion>
            );
          })}
        </Opciones>
      )}

      <Retro texto={aviso} />

      {completa && (
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="El otro golpe">
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.68)" }}>
            Primer orden {PESO_PRIMERO}% y segundo orden {PESO_SEGUNDO}%.{" "}
            {senuelos > 0
              ? `${senuelos} ${senuelos === 1 ? "toque" : "toques"} fuera de la cadena: −${CASTIGO_SENUELO * senuelos} puntos.`
              : "Ni un toque fuera de la cadena."}
          </p>
        </Cierre>
      )}
    </Camaraseccion>
  );
}
