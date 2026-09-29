import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { retroActor } from "../../../data/bloquesAvanzados.js";
import { Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE, RotuloEscenario } from "./marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REPARTO DE ACTORES — Medio. Lo comparten Demanda Agregada («¿A quién
 * beneficia el auge?») y Política Fiscal («¿A quién afecta el ajuste?»).
 *
 * Tres rondas, cuatro personajes: se toca un personaje y luego GANA o
 * PIERDE. La explicación real sale acierte o falle: la lección es por qué, no
 * si se adivinó.
 *
 * NO SE PUEDE DEDUCIR POR CUPOS. Las dos zonas no tienen capacidad ni
 * cuentan cuántos van: en la ronda del IVA hay tres PIERDE y un GANA, y una
 * zona que dijera "quedan 1" regalaría la respuesta. Tampoco por posición:
 * los personajes se barajan al entrar en cada ronda.
 *
 *   pct = aciertos / 12 × 100, sin redondear por el camino (12 × 8,33 no es 100)
 *
 * Ítem = `<ronda>:<personaje>`: el mismo personaje puede salir en dos rondas
 * —el trabajador de la construcción está en la de Mi Casa Ya y, en Demanda
 * Agregada, en la de la inversión— y son preguntas distintas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * PIERDE va en ámbar, no en coral. Perder con una medida no es un error del
 * estudiante, y el coral es el error en todo el sitio: aquí solo sale para
 * decir "te equivocaste". ¿Quién gana, quién pierde? usa los mismos colores:
 * dos actividades hermanas no pueden pintar lo mismo de dos formas.
 */
const COLOR = { gana: FAE.teal, pierde: FAE.ambar };

const ZONAS = [
  { id: "gana", nombre: "GANA", color: COLOR.gana, Icono: TrendingUp },
  { id: "pierde", nombre: "PIERDE", color: COLOR.pierde, Icono: TrendingDown },
];

function Silueta({ color = "rgba(203,220,242,0.5)" }) {
  return (
    <svg width="20" height="24" viewBox="0 0 22 26" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="7" r="5" fill={color} />
      <path d="M2 26 C2 17, 20 17, 20 26 Z" fill={color} />
    </svg>
  );
}

/*
 * `retro` (opcional): la devolución de la actividad, (personaje, zona) → texto
 * o null. Política Monetaria trae la suya. `ronda.etiqueta` se pinta bajo la
 * medida: «Escenario simulado» o «Escenario real, julio 2026».
 */
export default function RolDeActores({ rondas, Marco, rotulo, titulo, acento, onCompletar, retro = retroActor }) {
  const total = rondas.reduce((n, r) => n + r.personajes.length, 0);
  const [ronda, setRonda] = useState(0);
  const [orden, setOrden] = useState(() => barajar(rondas[0].personajes));
  const [puestos, setPuestos] = useState({});
  const [elegido, setElegido] = useState(null);
  const [ultimo, setUltimo] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const colocados = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const r = rondas[ronda];
  const completa = r && Object.keys(puestos).length === r.personajes.length;
  const pct = porcentaje(aciertos, total);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const colocar = (zona) => {
    if (!elegido) return;
    const p = r.personajes.find((x) => x.id === elegido);
    const item = `${r.id}:${p.id}`;
    if (colocados.current.has(item)) return;
    colocados.current.add(item);
    const ok = p.resultado === zona;
    detalle.current.push({ item, ok, intentos: 1, respuesta: zona, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setPuestos((s) => ({ ...s, [p.id]: zona }));
    setUltimo({ p, zona });
    setElegido(null);
  };

  const siguiente = () => {
    if (!completa) return;
    setUltimo(null);
    if (ronda + 1 < rondas.length) {
      setRonda(ronda + 1);
      setOrden(barajar(rondas[ronda + 1].personajes));
      setPuestos({});
    } else {
      setTerminado(true);
    }
  };

  const reiniciar = () => {
    setRonda(0); setOrden(barajar(rondas[0].personajes)); setPuestos({}); setElegido(null); setUltimo(null);
    setAciertos(0); setTerminado(false);
    colocados.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vuelta">
          <p style={TEXTO_CIERRE}>
            {aciertos} de {total} personajes en su sitio. Casi ningún cambio deja a todos igual: siempre hay alguien del otro lado.
          </p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={rondas.length} hechos={ronda + (completa ? 1 : 0)} enCurso={ronda + 1} etiqueta="Ronda" />
      </div>
      <Enunciado rotulo={`RONDA ${ronda + 1} DE ${rondas.length}`} acento={acento}>{r.medida}</Enunciado>
      {r.etiqueta && <RotuloEscenario texto={r.etiqueta} />}

      {!completa && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "14px 0" }}>
          {ZONAS.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => colocar(z.id)}
              disabled={!elegido}
              aria-label={`Clasificar en ${z.nombre}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "15px 12px", borderRadius: "14px", cursor: elegido ? "pointer" : "default",
                background: elegido ? `${z.color}1a` : "rgba(248,249,250,0.03)",
                border: `2px ${elegido ? "solid" : "dashed"} ${elegido ? z.color : "rgba(248,249,250,0.18)"}`,
                color: elegido ? z.color : "rgba(248,249,250,0.45)",
                fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: "0.06em",
              }}
            >
              <z.Icono size={17} /> {z.nombre}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "9px", marginTop: completa ? "14px" : 0 }}>
        {orden.map((p) => {
          const puesto = puestos[p.id];
          const acerto = puesto && puesto === p.resultado;
          const color = !puesto ? null : COLOR[p.resultado];
          return (
            <div key={p.id}>
              <button
                type="button"
                onClick={() => !puesto && setElegido(elegido === p.id ? null : p.id)}
                disabled={Boolean(puesto)}
                aria-pressed={elegido === p.id}
                aria-label={puesto ? `${p.nombre}: ${p.resultado === "gana" ? "gana" : "pierde"}. ${acerto ? "Acertaste" : "Fallaste"}.` : `Elegir ${p.nombre}`}
                style={{
                  width: "100%", textAlign: "left", padding: "12px 13px", borderRadius: "13px",
                  cursor: puesto ? "default" : "pointer",
                  background: puesto ? `${color}14` : elegido === p.id ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.04)",
                  border: `1px solid ${puesto ? color : elegido === p.id ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                  color: FAE.text, fontFamily: "Inter, sans-serif", display: "flex", gap: "10px", alignItems: "flex-start",
                }}
              >
                <Silueta color={puesto ? color : undefined} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "13px", lineHeight: 1.45 }}>{p.nombre}</span>
                  {puesto && (
                    <span style={{ display: "block", marginTop: "5px", fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.06em", color }}>
                      {p.resultado === "gana" ? "GANA" : "PIERDE"}
                      {acerto ? " · ✓" : <span style={{ color: FAE.coral }}> · ✗ te equivocaste</span>}
                    </span>
                  )}
                </span>
              </button>
              {puesto && (
                <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.65)", margin: "6px 0 0", paddingLeft: "11px", borderLeft: `2px solid ${color}` }}>
                  {p.explicacion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Retro texto={ultimo ? retro(ultimo.p, ultimo.zona) : null} />

      {!completa && (
        <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.55)", margin: "12px 0 0" }}>
          {elegido ? "Ahora toca GANA o PIERDE." : "Toca un personaje."}
        </p>
      )}
      {completa && <Avanzar onClick={siguiente}>{ronda + 1 === rondas.length ? "Ver resultado" : "Siguiente ronda"}</Avanzar>}
    </Marco>
  );
}
