import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { useAuth } from "../../../auth/AuthProvider.jsx";
import { Parte, CSS_MAQUINAS } from "./salaDeMaquinas.jsx";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE, MarcoMaquinas } from "../bloques/marcos.jsx";
import { Encabezado } from "../libros/tema1/encabezado.jsx";
import JuegoConTutorial from "../libros/JuegoConTutorial.jsx";
import {
  ROTULO_SIMULADO, EJEMPLO_JUAN, escaleraDe, EXPLORA_ENCAJES, EXPLORA_VUELTAS,
  CREA_O_CAMBIA, OPCIONES_CREA_O_CAMBIA, HECHOS_CREA_O_CAMBIA, retroCreaOCambia,
  ESCALERA, ESCENARIO_ESCALERA, CASILLAS, opcionesDeCasilla, ERRORES_ESCALERA, ACIERTO_CASILLA,
  OPCIONES_COMPARA, PREGUNTAS_COMPARA, ERRORES_COMPARA, tipoDeErrorCompara,
} from "../../../data/pmFabricaDelDinero.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · LA FÁBRICA DEL DINERO (Célula B).
 *
 * Todo lo nuevo de la pieza y sus dos juegos, en un archivo propio: no se
 * toca salaDeMaquinas.jsx, CuatroCapas.jsx ni PorCualArteria.jsx; de ellos
 * solo se importa (Parte, CSS_MAQUINAS) o se copia el patrón.
 *
 *   EscenaFabrica           la escena de la capa 2, con los 14 ids del encargo
 *   ExploraFabrica          la capa 3: cuánto guarda cada banco y la escalera
 *   CreaOCambia             «¿Crea o Cambia de Manos?», patrón de PorCualArteria
 *   EscaleraDelEncaje       «La Escalera del Encaje», casilla por casilla
 *   CreaOCambiaDeManos,
 *   LaEscaleraDelEncaje     las dos con JuegoConTutorial y MarcoMaquinas
 *
 * La escena es PROVISIONAL hasta el dibujo de Mai: misma lámina de 360, los
 * 14 ids como data-parte y el rótulo «Escenario simulado» siempre a la vista
 * mientras haya cifras del ejemplo. Sin «%» y sin coral.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const LINEA = "rgba(248,249,250,0.72)";
const TENUE = "rgba(248,249,250,0.35)";
const TEXTO = { fontFamily: "Inter, sans-serif", fontSize: "13.5px", fill: "rgba(248,249,250,0.82)" };

/* Las cifras con punto de miles, como en el resto del sitio. */
export const cifra = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* Copias de las piezas de dibujo de salaDeMaquinas.jsx (allí no se exportan y no se tocan). */
function Edificio({ x, y, ancho, alto, cupula = false }) {
  const cols = 3;
  return (
    <g fill="none" stroke={LINEA} strokeWidth="2" strokeLinejoin="round">
      {cupula
        ? <path d={`M${x + ancho * 0.25} ${y} A${ancho * 0.25} ${ancho * 0.22} 0 0 1 ${x + ancho * 0.75} ${y}`} />
        : <path d={`M${x} ${y} L${x + ancho / 2} ${y - ancho * 0.16} L${x + ancho} ${y} Z`} />}
      <rect x={x} y={y} width={ancho} height={alto} rx="2" />
      {Array.from({ length: cols }, (_, k) => {
        const cx = x + (ancho / (cols + 1)) * (k + 1);
        return <line key={k} x1={cx} y1={y + 5} x2={cx} y2={y + alto - 5} />;
      })}
    </g>
  );
}
function Persona({ x, y, escala = 1, color = LINEA }) {
  return (
    <g fill={color}>
      <circle cx={x} cy={y - 9 * escala} r={5 * escala} />
      <path d={`M${x - 9 * escala} ${y + 9 * escala} C${x - 9 * escala} ${y - 2 * escala}, ${x + 9 * escala} ${y - 2 * escala}, ${x + 9 * escala} ${y + 9 * escala} Z`} />
    </g>
  );
}
function Rotulo({ x, y, children, anchor = "middle", peso = 400, tam = null }) {
  return <text x={x} y={y} textAnchor={anchor} style={{ ...TEXTO, fontWeight: peso, ...(tam ? { fontSize: tam } : {}) }}>{children}</text>;
}
const Flecha = ({ x1, x2, y }) => (
  <path d={`M${x1} ${y} H${x2} M${x2 - 5} ${y - 4} L${x2} ${y} L${x2 - 5} ${y + 4}`} fill="none" stroke={TENUE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
);

/* ═══════════════ LA ESCENA DE LA CAPA 2 ═══════════════ */

/* La fila de la creación secundaria: x de cada quien, en el orden del ejemplo. */
const FILA = { juan: 24, "banco-a": 82, ana: 140, pedro: 196, "banco-b": 254, "banco-c": 318 };

export function EscenaFabrica({ resaltar = [] }) {
  const juan = escaleraDe(EJEMPLO_JUAN.deposito, EJEMPLO_JUAN.encaje, EJEMPLO_JUAN.vueltas);
  const alto = (t) => (t / juan.at(-1).total) * 34;
  return (
    <svg viewBox="0 0 360 312" role="img" aria-label="Arriba, el Banco de la República crea pesos nuevos cuando compra TES o dólares, y un banco privado que compra un TES. Abajo, Juan deposita, el Banco A guarda el encaje y presta, el préstamo pasa de Ana a Pedro y al Banco B, y la escalera de los depósitos crece" style={{ width: "100%", display: "block" }}>
      <style>{CSS_MAQUINAS}</style>

      {/* ── Primer piso: la creación primaria ── */}
      <Parte id="gobierno" resaltar={resaltar}>
        <Edificio x={12} y={40} ancho={66} alto={34} />
        <Rotulo x={45} y={92}>Gobierno</Rotulo>
      </Parte>
      <Parte id="tes" resaltar={resaltar}>
        <rect x={98} y={42} width={34} height={28} rx="3" fill="none" stroke={LINEA} strokeWidth="2" />
        <path d="M104 52 H126 M104 58 H126 M104 64 H118" stroke={TENUE} strokeWidth="1.6" />
        <Rotulo x={115} y={92} peso={700}>TES</Rotulo>
      </Parte>
      <Parte id="banco-republica" resaltar={resaltar}>
        <Edificio x={154} y={40} ancho={90} alto={34} cupula />
        <Rotulo x={199} y={92}>Banco de la República</Rotulo>
      </Parte>
      <Parte id="dolares" resaltar={resaltar}>
        <circle cx={306} cy={56} r={16} fill="none" stroke={LINEA} strokeWidth="2" />
        <Rotulo x={306} y={61} peso={700}>US$</Rotulo>
        <Rotulo x={306} y={92}>Dólares</Rotulo>
      </Parte>
      <Parte id="pesos-nuevos" resaltar={resaltar}>
        {[0, 1, 2].map((k) => <rect key={k} x={176 + k * 8} y={104 + k * 3} width={34} height={16} rx="2" fill={FAE.teal} opacity={0.45 + k * 0.2} />)}
        <Rotulo x={199} y={142}>Pesos nuevos</Rotulo>
      </Parte>
      <Parte id="banco-privado" resaltar={resaltar}>
        <Edificio x={34} y={110} ancho={52} alto={22} />
        <Rotulo x={60} y={150}>Banco privado</Rotulo>
      </Parte>

      <line x1={8} y1={160} x2={352} y2={160} stroke={TENUE} strokeWidth="1.2" strokeDasharray="4 4" />
      {/* Siempre a la vista mientras se ven las cifras del ejemplo. */}
      <Rotulo x={352} y={178} anchor="end" tam="11.5px">{ROTULO_SIMULADO}</Rotulo>

      {/* ── Segundo piso: la creación secundaria ── */}
      <Parte id="juan" resaltar={resaltar}>
        <Persona x={FILA.juan} y={214} />
        <Rotulo x={FILA.juan} y={196} peso={700}>{cifra(juan[0].deposita)}</Rotulo>
        <Rotulo x={FILA.juan} y={244}>Juan</Rotulo>
      </Parte>
      <Flecha x1={38} x2={62} y={214} />
      <Parte id="banco-a" resaltar={resaltar}>
        <Edificio x={FILA["banco-a"] - 18} y={206} ancho={36} alto={20} />
        <Rotulo x={FILA["banco-a"]} y={244}>Banco A</Rotulo>
      </Parte>
      <Parte id="encaje" resaltar={resaltar}>
        <rect x={FILA["banco-a"] - 18} y={252} width={36} height={18} rx="3" fill={FAE.teal} opacity="0.75" />
        <Rotulo x={FILA["banco-a"]} y={266} peso={700}>{cifra(juan[0].guarda)}</Rotulo>
        <Rotulo x={FILA["banco-a"]} y={288}>Encaje</Rotulo>
      </Parte>
      <Flecha x1={104} x2={124} y={214} />
      <Parte id="ana" resaltar={resaltar}>
        <Persona x={FILA.ana} y={214} />
        <Rotulo x={FILA.ana} y={196} peso={700}>{cifra(juan[0].presta)}</Rotulo>
        <Rotulo x={FILA.ana} y={244}>Ana</Rotulo>
      </Parte>
      <Flecha x1={154} x2={180} y={214} />
      <Parte id="pedro" resaltar={resaltar}>
        <Persona x={FILA.pedro} y={214} />
        <Rotulo x={FILA.pedro} y={196} peso={700}>{cifra(juan[1].deposita)}</Rotulo>
        <Rotulo x={FILA.pedro} y={244}>Pedro</Rotulo>
      </Parte>
      <Flecha x1={210} x2={234} y={214} />
      <Parte id="banco-b" resaltar={resaltar}>
        <Edificio x={FILA["banco-b"] - 18} y={206} ancho={36} alto={20} />
        <Rotulo x={FILA["banco-b"]} y={244}>Banco B</Rotulo>
      </Parte>
      <Flecha x1={276} x2={298} y={214} />
      <Parte id="banco-c" resaltar={resaltar}>
        <Edificio x={FILA["banco-c"] - 18} y={206} ancho={36} alto={20} />
        <Rotulo x={FILA["banco-c"]} y={196} peso={700}>{cifra(juan[1].presta)}</Rotulo>
        <Rotulo x={FILA["banco-c"]} y={244}>Banco C</Rotulo>
      </Parte>

      <Parte id="escalera" resaltar={resaltar}>
        {juan.map((f, k) => (
          <g key={f.vuelta} data-peldano={f.vuelta}>
            <rect x={150 + k * 44} y={304 - alto(f.total)} width={38} height={alto(f.total)} rx="2" fill={FAE.teal} opacity={0.4 + k * 0.2} />
            <Rotulo x={169 + k * 44} y={300 - alto(f.total) - 4} peso={700}>{cifra(f.total)}</Rotulo>
          </g>
        ))}
        <Rotulo x={352} y={300} anchor="end" tam="11.5px">Total en depósitos</Rotulo>
      </Parte>
    </svg>
  );
}

/* ═══════════════ LA CAPA 3: CUÁNTO GUARDA CADA BANCO ═══════════════ */

const BOTON = (activo) => ({
  padding: "9px 14px", borderRadius: "999px", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
  cursor: "pointer", color: activo ? FAE.bg : FAE.text,
  background: activo ? FAE.teal : "transparent", border: `1px solid ${activo ? FAE.teal : "rgba(248,249,250,0.3)"}`,
});

export function ExploraFabrica() {
  const [encaje, setEncaje] = useState(EJEMPLO_JUAN.encaje);
  const filas = escaleraDe(EJEMPLO_JUAN.deposito, encaje, EXPLORA_VUELTAS);
  const maximo = escaleraDe(EJEMPLO_JUAN.deposito, Math.min(...EXPLORA_ENCAJES), EXPLORA_VUELTAS).at(-1).total;
  return (
    <div data-explora-fabrica>
      <div role="group" aria-label="Cuánto guarda cada banco" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {EXPLORA_ENCAJES.map((e) => (
          <button key={e} type="button" data-encaje={e} aria-pressed={encaje === e} onClick={() => setEncaje(e)} style={BOTON(encaje === e)}>
            Guarda {e} de cada 100
          </button>
        ))}
      </div>
      <p data-rotulo-simulado style={{ margin: "12px 0 6px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.55)" }}>
        {ROTULO_SIMULADO.toUpperCase()}
      </p>
      <div data-escalera-explora style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
        {filas.map((f) => (
          <div key={f.vuelta} data-vuelta={f.vuelta} data-total={f.total} style={{ flex: "1 1 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.8)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{cifra(Math.round(f.total))}</span>
            <span style={{ width: "100%", height: `${(f.total / maximo) * 90}px`, background: FAE.teal, opacity: 0.85, borderRadius: "3px 3px 0 0" }} />
          </div>
        ))}
      </div>
      <p style={{ margin: "6px 0 0", fontSize: "12px", color: "rgba(248,249,250,0.55)" }}>Total en depósitos, vuelta por vuelta</p>
    </div>
  );
}

/* ═══════════════ JUEGO A · ¿CREA O CAMBIA DE MANOS? ═══════════════ */

const ESTILO_REGLA = {
  margin: "0 0 12px", padding: "10px 13px", borderRadius: "12px",
  fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.86)",
  background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.14)",
};

/*
 * El patrón de «¿Por Cuál Arteria Entra?»: un hecho a la vez, las tres
 * opciones a la vista en su orden, un intento por hecho, devolución de acierto
 * del hecho o error de su tipo, la regla fija, la consigna y el cierre.
 * pct = aciertos / hechos × 100. MODO DEMO: `items` trae el ejemplo.
 */
export function CreaOCambia({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const sortear = () => (items ?? barajar(HECHOS_CREA_O_CAMBIA));
  const [hechos, setHechos] = useState(sortear);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const hecho = hechos[i];
  const pct = porcentaje(aciertos, hechos.length);

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (opcion) => {
    if (respondidos.current.has(hecho.id)) return;
    respondidos.current.add(hecho.id);
    const ok = opcion === hecho.respuesta;
    detalle.current.push({ item: hecho.id, ok, intentos: 1, respuesta: ok ? null : opcion, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(opcion);
  };
  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < hechos.length) setI(i + 1);
    else setTerminado(true);
  };
  const reiniciar = () => {
    setHechos(sortear()); setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidos.current = new Set(); detalle.current = []; inicio.current = Date.now();
  };

  if (terminado && !modoDemo) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-cierre-texto style={TEXTO_CIERRE}>{CREA_O_CAMBIA.cierre}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {!modoDemo && <Encabezado consigna={CREA_O_CAMBIA.consigna} onComoSeJuega={onComoSeJuega} />}
      <p data-regla style={ESTILO_REGLA}>{CREA_O_CAMBIA.regla}</p>
      {!modoDemo && (
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={hechos.length} hechos={i + (elegida ? 1 : 0)} enCurso={i + 1} etiqueta="Hecho" />
        </div>
      )}
      <div data-hecho={hecho.id}>
        <Enunciado acento={acento}>{hecho.texto}</Enunciado>
      </div>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {OPCIONES_CREA_O_CAMBIA.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(o.id)}
            estado={!elegida ? null : o.id === elegida ? (o.id === hecho.respuesta ? "correcta" : "incorrecta") : o.id === hecho.respuesta ? "revelada" : null}
          >
            {o.nombre}
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={elegida ? retroCreaOCambia(hecho, elegida) : null} />
      {elegida && !modoDemo && <Avanzar onClick={avanzar}>{i + 1 === hechos.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </Marco>
  );
}

/* ═══════════════ JUEGO B · LA ESCALERA DEL ENCAJE ═══════════════ */

/* Una escalera en tabla: lo ya resuelto se ve; lo que falta, en blanco. */
function TablaEscalera({ filas, encaje, hasta = Infinity, rotuloTabla = null }) {
  return (
    <div data-tabla-escalera={encaje} style={{ flex: "1 1 220px", minWidth: 0 }}>
      {rotuloTabla && <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: FAE.text }}>{rotuloTabla}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", fontVariantNumeric: "tabular-nums" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", fontWeight: 600, color: "rgba(248,249,250,0.6)", padding: "4px 2px" }}>Vuelta</th>
            {CASILLAS.map((c) => <th key={c.id} style={{ textAlign: "right", fontWeight: 600, color: "rgba(248,249,250,0.6)", padding: "4px 2px" }}>{c.nombre}</th>)}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, k) => (
            <tr key={f.vuelta} data-fila={f.vuelta} style={{ borderTop: "1px solid rgba(248,249,250,0.12)" }}>
              <td style={{ padding: "5px 2px", color: "rgba(248,249,250,0.8)" }}>{f.vuelta}</td>
              {CASILLAS.map((c, j) => {
                const visto = k * CASILLAS.length + j < hasta;
                return <td key={c.id} data-celda={`${f.vuelta}:${c.id}`} style={{ padding: "5px 2px", textAlign: "right", color: FAE.text }}>{visto ? cifra(f[c.id]) : "—"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const rotuloEncaje = (e) => `Guarda ${e} de cada 100`;

/* En la demo, cuánto se ve la devolución de una casilla antes de la siguiente (el guion toca cada 2,5 s). */
export const DEMO_AVANCE_MS = 1200;

/*
 * Primero se construye la escalera del primer encaje, casilla por casilla
 * (opción múltiple, un intento, las opciones barajadas). Después se ven las dos
 * escaleras y se responde qué pasa si el Banco sube o baja el encaje.
 * pct = aciertos / (casillas + preguntas) × 100. Ítems: «vuelta:casilla» y
 * «compara:id». MODO DEMO: `items` trae un escenario de una vuelta, sin comparar.
 */
export function EscaleraDelEncaje({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const escenario = items?.[0] ?? ESCENARIO_ESCALERA;
  const encajes = escenario.encajes ?? [escenario.encaje];
  const escaleras = encajes.map((e) => escaleraDe(escenario.deposito, e, escenario.vueltas));
  const filas = escaleras[0];
  const pasosCasilla = filas.flatMap((f, k) => CASILLAS.map((c) => ({ k, casilla: c.id, id: `${f.vuelta}:${c.id}` })));
  const preguntas = encajes.length > 1 ? PREGUNTAS_COMPARA : [];
  const total = pasosCasilla.length + preguntas.length;
  const barajarOpciones = (ops) => (items ? ops : barajar(ops));

  const [n, setN] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [orden, setOrden] = useState(() => pasosCasilla.map((p) => barajarOpciones(opcionesDeCasilla(filas, p.k, p.casilla))));
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const pct = porcentaje(aciertos, total);
  const enCasillas = n < pasosCasilla.length;

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  /* En la demo no hay «Siguiente»: tras cada casilla, la siguiente llega sola. */
  useEffect(() => {
    if (!modoDemo || !elegida || n + 1 >= total) return undefined;
    const reloj = setTimeout(() => { setElegida(null); setN((x) => x + 1); }, DEMO_AVANCE_MS);
    return () => clearTimeout(reloj);
  }, [elegida]); // eslint-disable-line react-hooks/exhaustive-deps

  const anotar = (item, ok, respuesta) => {
    detalle.current.push({ item, ok, intentos: 1, respuesta: ok ? null : respuesta, orden: detalle.current.length + 1 });
    if (ok) setAciertos((x) => x + 1);
  };
  const responderCasilla = (op) => {
    if (elegida) return;
    anotar(pasosCasilla[n].id, op.tipo === null, String(op.valor));
    setElegida(op);
  };
  const responderCompara = (id) => {
    if (elegida) return;
    const p = preguntas[n - pasosCasilla.length];
    anotar(`compara:${p.id}`, id === p.respuesta, id);
    setElegida({ id });
  };
  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (n + 1 < total) setN(n + 1);
    else setTerminado(true);
  };
  const reiniciar = () => {
    setN(0); setElegida(null); setAciertos(0); setTerminado(false);
    setOrden(pasosCasilla.map((p) => barajarOpciones(opcionesDeCasilla(filas, p.k, p.casilla))));
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado && !modoDemo) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-cierre-texto style={TEXTO_CIERRE}>{ESCALERA.cierre}</p>
        </Cierre>
      </Marco>
    );
  }

  let cuerpo;
  if (enCasillas) {
    const paso = pasosCasilla[n];
    const correcta = filas[paso.k][paso.casilla];
    const retro = !elegida ? null : elegida.tipo === null ? `✅ ${ACIERTO_CASILLA}` : `❌ ${ERRORES_ESCALERA[elegida.tipo]}`;
    cuerpo = (
      <>
        <TablaEscalera filas={filas} encaje={encajes[0]} hasta={n + (elegida ? 1 : 0)} rotuloTabla={rotuloEncaje(encajes[0])} />
        <div data-hecho={paso.id} style={{ marginTop: "12px" }}>
          <Enunciado acento={acento}>{`Vuelta ${filas[paso.k].vuelta} · ${CASILLAS.find((c) => c.id === paso.casilla).nombre}`}</Enunciado>
        </div>
        <Opciones columnas="repeat(auto-fit, minmax(90px, 1fr))">
          {orden[n].map((op) => (
            <Opcion
              key={op.valor}
              ancho
              deshabilitada={Boolean(elegida)}
              onClick={() => responderCasilla(op)}
              estado={!elegida ? null : op === elegida ? (op.tipo === null ? "correcta" : "incorrecta") : op.valor === correcta ? "revelada" : null}
            >
              {cifra(op.valor)}
            </Opcion>
          ))}
        </Opciones>
        <Retro texto={retro} />
      </>
    );
  } else {
    const p = preguntas[n - pasosCasilla.length];
    const tipo = elegida ? tipoDeErrorCompara(p, elegida.id) : null;
    const retro = !elegida ? null : tipo === null ? `✅ ${p.acierto}` : `❌ ${ERRORES_COMPARA[tipo]}`;
    cuerpo = (
      <>
        <div data-dos-escaleras style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
          {escaleras.map((f, k) => <TablaEscalera key={encajes[k]} filas={f} encaje={encajes[k]} rotuloTabla={rotuloEncaje(encajes[k])} />)}
        </div>
        <div data-hecho={`compara:${p.id}`} style={{ marginTop: "12px" }}>
          <Enunciado acento={acento}>{p.texto}</Enunciado>
        </div>
        <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
          {OPCIONES_COMPARA.map((o) => (
            <Opcion
              key={o.id}
              ancho
              deshabilitada={Boolean(elegida)}
              onClick={() => responderCompara(o.id)}
              estado={!elegida ? null : o.id === elegida.id ? (o.id === p.respuesta ? "correcta" : "incorrecta") : o.id === p.respuesta ? "revelada" : null}
            >
              {o.nombre}
            </Opcion>
          ))}
        </Opciones>
        <Retro texto={retro} />
      </>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {!modoDemo && <Encabezado consigna={ESCALERA.consigna} onComoSeJuega={onComoSeJuega} />}
      <p data-regla style={ESTILO_REGLA}>{ESCALERA.regla}</p>
      {!modoDemo && (
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={total} hechos={n + (elegida ? 1 : 0)} enCurso={n + 1} etiqueta="Casilla" />
        </div>
      )}
      <p data-rotulo-simulado style={{ margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.55)" }}>
        {ROTULO_SIMULADO.toUpperCase()} · DEPÓSITO INICIAL {cifra(escenario.deposito)}
      </p>
      {cuerpo}
      {elegida && !modoDemo && <Avanzar onClick={avanzar}>{n + 1 === total ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </Marco>
  );
}

/* ═══════════════ LOS DOS JUEGOS CON SU TUTORIAL ═══════════════ */

/* Copia de ConTutorial (monetariaRepaso.jsx), que no se toca. */
function ConTutorial({ id, Mecanica, rotulo, onCompletar }) {
  const { usuario } = useAuth();
  return (
    <JuegoConTutorial
      juego={{ id, Mecanica }}
      usuarioId={usuario?.id ?? null}
      Marco={MarcoMaquinas}
      acento={FAE.teal}
      rotulo={rotulo}
      tituloVisible={false}
      onCompletar={onCompletar}
    />
  );
}

export const CreaOCambiaDeManos = ({ onCompletar }) => (
  <ConTutorial id={CREA_O_CAMBIA.id} Mecanica={CreaOCambia} rotulo="APLICACIÓN" onCompletar={onCompletar} />
);

export const LaEscaleraDelEncaje = ({ onCompletar }) => (
  <ConTutorial id={ESCALERA.id} Mecanica={EscaleraDelEncaje} rotulo="ANÁLISIS" onCompletar={onCompletar} />
);
