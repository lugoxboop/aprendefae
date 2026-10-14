import { useRef, useState, useEffect } from "react";
import { FAE } from "../../../theme.js";
import { DATOS_VERIFICADOS } from "../../../data/politicaMonetaria.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA SALA DE MÁQUINAS — el cuarto de Política Monetaria.
 *
 * Tercer cuarto del edificio. La Tesorería tiene tres mecanismos; aquí hay UN
 * volante central —la tasa de intervención— y de él salen TRES correas:
 * crédito, ahorro y cambiario. Girar el volante mueve las tres, cada una a su
 * velocidad y con su retraso: el rezago de la transmisión, dibujado.
 *
 * VELOCIDADES Y RETRASOS DE LAS CORREAS: la ficha pide que sean distintos, no
 * cuáles. Los de CORREAS son una elección visual [ESCRITO POR CLAUDE, NO POR
 * LA FICHA], no un dato: no dicen qué canal transmite antes, y ninguna pantalla
 * lo afirma con cifras.
 *
 * Paleta de siempre: navy, teal, ámbar para lo que se mueve hacia "más débil".
 * El coral no aparece: nada de esto es un error.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CORREAS = [
  { id: "credito", nombre: "Crédito", velocidad: 1.1, retardo: 0.6 },
  { id: "ahorro", nombre: "Ahorro", velocidad: 1.8, retardo: 1.2 },
  { id: "cambiario", nombre: "Cambiario", velocidad: 0.7, retardo: 0.2 },
];

export const CSS_MAQUINAS = `
@keyframes fae-sm-avanza { to { stroke-dashoffset: -24; } }
@keyframes fae-sm-retrocede { to { stroke-dashoffset: 24; } }
.fae-sm-correa { stroke-dasharray: 8 4; }
.fae-sm-parte { transition: opacity 320ms ease; }
.fae-sm-apagada { opacity: .18; }
.fae-sm-gira { transition: transform 700ms cubic-bezier(.3,.8,.4,1); }
@keyframes fae-sm-aguja { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .fae-sm-correa { animation: none !important; }
  .fae-sm-gira { transition: none !important; }
  .fae-sm-aguja-gira { animation: none !important; }
}
`;

const LINEA = "rgba(248,249,250,0.72)";
const TENUE = "rgba(248,249,250,0.35)";
/*
 * 13,5 unidades de la lámina de 360: a 375 px de pantalla la escena mide unos
 * 292 px y la letra queda en ~11 px, por encima del piso de 10,5 del sitio.
 * Con 12 se quedaba en 9,7 —medido—.
 */
const TEXTO = { fontFamily: "Inter, sans-serif", fontSize: "13.5px", fill: "rgba(248,249,250,0.82)" };

/** Una parte de la escena: se apaga cuando hay algo resaltado y no es ella. */
export function Parte({ id, resaltar = [], children }) {
  const apagada = resaltar.length > 0 && !resaltar.includes(id);
  return (
    <g data-parte={id} data-resaltada={resaltar.includes(id) || undefined} className={`fae-sm-parte${apagada ? " fae-sm-apagada" : ""}`}>
      {children}
    </g>
  );
}

/** El volante. `giro` en grados; positivo es apretar (subir la tasa). */
export function Volante({ cx, cy, r, giro = 0, color = FAE.teal }) {
  const rayos = Array.from({ length: 6 }, (_, k) => (k * Math.PI) / 3);
  return (
    <g>
      <g className="fae-sm-gira" style={{ transform: `rotate(${giro}deg)`, transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={r * 0.14} />
        {rayos.map((a) => (
          <line key={a} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke={color} strokeWidth={r * 0.08} strokeLinecap="round" />
        ))}
        <circle cx={cx + r} cy={cy} r={r * 0.16} fill={color} />
      </g>
      <circle cx={cx} cy={cy} r={r * 0.22} fill={FAE.bg} stroke={color} strokeWidth={r * 0.08} />
    </g>
  );
}

/**
 * Una correa entre dos poleas. Se mueve si `activa`; `sentido` 1 hacia la
 * polea de destino, −1 al revés.
 */
export function Correa({ de, a, r1 = 10, r2 = 10, activa = false, velocidad = 1, retardo = 0, sentido = 1, color = LINEA }) {
  const anim = activa
    ? { animation: `${sentido >= 0 ? "fae-sm-avanza" : "fae-sm-retrocede"} ${velocidad}s linear ${retardo}s infinite` }
    : undefined;
  return (
    <g>
      <path
        className="fae-sm-correa"
        style={anim}
        d={`M${de.x} ${de.y - r1} L${a.x} ${a.y - r2} A${r2} ${r2} 0 0 1 ${a.x} ${a.y + r2} L${de.x} ${de.y + r1} A${r1} ${r1} 0 0 1 ${de.x} ${de.y - r1}`}
        fill="none" stroke={color} strokeWidth="2.2"
      />
      <circle cx={a.x} cy={a.y} r={r2 * 0.55} fill="none" stroke={TENUE} strokeWidth="2" />
    </g>
  );
}

/* Un edificio: cuerpo, columnas y, si se pide, cúpula. */
function Edificio({ x, y, ancho, alto, cupula = false }) {
  const cols = 4;
  return (
    <g fill="none" stroke={LINEA} strokeWidth="2" strokeLinejoin="round">
      {cupula
        ? <path d={`M${x + ancho * 0.25} ${y} A${ancho * 0.25} ${ancho * 0.22} 0 0 1 ${x + ancho * 0.75} ${y}`} />
        : <path d={`M${x} ${y} L${x + ancho / 2} ${y - ancho * 0.16} L${x + ancho} ${y} Z`} />}
      <rect x={x} y={y} width={ancho} height={alto} rx="2" />
      {Array.from({ length: cols }, (_, k) => {
        const cx = x + (ancho / (cols + 1)) * (k + 1);
        return <line key={k} x1={cx} y1={y + 6} x2={cx} y2={y + alto - 6} />;
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

function Rotulo({ x, y, children, anchor = "middle", peso = 400 }) {
  return <text x={x} y={y} textAnchor={anchor} style={{ ...TEXTO, fontWeight: peso }}>{children}</text>;
}

/* ═══════════════ ESCENA 1 · ¿QUIÉN MANDA AQUÍ? ═══════════════ */

export function EscenaQuienManda({ resaltar = [] }) {
  const correaActiva = resaltar.includes("correa");
  return (
    <svg viewBox="0 0 360 266" role="img" aria-label="El gobierno y el Banco de la República, la Junta, el volante de la tasa y la correa que llega al banco comercial y a usted" style={{ width: "100%", display: "block" }}>
      <style>{CSS_MAQUINAS}</style>
      <Parte id="casa-narino" resaltar={resaltar}>
        <Edificio x={22} y={42} ancho={96} alto={46} />
        <Rotulo x={70} y={106}>Casa de Nariño</Rotulo>
        <Rotulo x={70} y={121}>(gobierno)</Rotulo>
      </Parte>
      <Parte id="banco-republica" resaltar={resaltar}>
        <Edificio x={196} y={42} ancho={128} alto={46} cupula />
        <Rotulo x={260} y={106}>Banco de la República</Rotulo>
      </Parte>
      <Parte id="junta" resaltar={resaltar}>
        {Array.from({ length: 7 }, (_, k) => <Persona key={k} x={206 + k * 18} y={136} escala={0.62} color={FAE.teal} />)}
        <Rotulo x={260} y={162}>Junta Directiva</Rotulo>
      </Parte>
      <line x1={180} y1={20} x2={180} y2={128} stroke={TENUE} strokeWidth="1.5" strokeDasharray="4 4" />
      {/*
        * La fila de abajo, con cada rótulo fuera del paso de la correa: la tasa
        * encima del volante y su nombre debajo; el banco comercial con su
        * nombre encima, y usted con el suyo debajo.
        */}
      <Parte id="volante" resaltar={resaltar}>
        <Volante cx={48} cy={212} r={24} giro={resaltar.includes("volante") ? 60 : 0} />
        <Rotulo x={48} y={178} peso={700}>{DATOS_VERIFICADOS.tasaIntervencion}</Rotulo>
        <Rotulo x={6} y={258} anchor="start">tasa de intervención</Rotulo>
      </Parte>
      <Parte id="correa" resaltar={resaltar}>
        <Correa de={{ x: 48, y: 212 }} a={{ x: 232, y: 212 }} r1={8} r2={8} activa={correaActiva} velocidad={1.2} />
      </Parte>
      <Parte id="banco-comercial" resaltar={resaltar}>
        <Edificio x={246} y={200} ancho={40} alto={26} />
        <Rotulo x={266} y={188}>Banco comercial</Rotulo>
      </Parte>
      <Parte id="persona" resaltar={resaltar}>
        <path d="M294 213 H312 M306 207 L312 213 L306 219" fill="none" stroke={LINEA} strokeWidth="2" strokeLinecap="round" />
        <Persona x={336} y={214} />
        <Rotulo x={336} y={258}>Usted</Rotulo>
      </Parte>
    </svg>
  );
}

/* ═══════════════ ESCENA 2 · LOS CUATRO INSTRUMENTOS ═══════════════ */

export function EscenaInstrumentos({ resaltar = [] }) {
  const cambia = resaltar.includes("cambiaria");
  const direcciones = resaltar.includes("direcciones");
  return (
    <svg viewBox="0 0 360 262" role="img" aria-label="El volante de la tasa en el centro; alrededor, las operaciones de mercado abierto, el encaje y la intervención cambiaria con las reservas" style={{ width: "100%", display: "block" }}>
      <style>{CSS_MAQUINAS + `
@keyframes fae-sm-flujo { 0% { transform: translateX(-18px); opacity: 0; } 20%, 80% { opacity: 1; } 100% { transform: translateX(18px); opacity: 0; } }
.fae-sm-flujo { animation: fae-sm-flujo 1.6s linear infinite; transform-box: fill-box; }
@keyframes fae-sm-flujo-vuelta { 0% { transform: translateX(18px); opacity: 0; } 20%, 80% { opacity: 1; } 100% { transform: translateX(-18px); opacity: 0; } }
.fae-sm-flujo-vuelta { animation: fae-sm-flujo-vuelta 1.6s linear .8s infinite; transform-box: fill-box; }
@media (prefers-reduced-motion: reduce) { .fae-sm-flujo, .fae-sm-flujo-vuelta { animation: none !important; } }
`}</style>
      <Parte id="volante" resaltar={resaltar.includes("direcciones") ? [...resaltar, "volante"] : resaltar}>
        <Volante cx={180} cy={120} r={resaltar.includes("volante") || direcciones ? 46 : 40} giro={direcciones ? 45 : 0} />
        <Rotulo x={180} y={190} peso={700}>Tasa de intervención</Rotulo>
      </Parte>
      <Parte id="direcciones" resaltar={resaltar}>
        <path d="M122 70 A70 70 0 0 1 180 44" fill="none" stroke={FAE.teal} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M172 38 L181 44 L172 50" fill="none" stroke={FAE.teal} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <Rotulo x={176} y={30}>Apretar (subir)</Rotulo>
        <path d="M238 170 A70 70 0 0 1 180 196" fill="none" stroke={FAE.ambar} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M188 190 L179 196 L188 202" fill="none" stroke={FAE.ambar} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <Rotulo x={184} y={222}>Soltar (bajar)</Rotulo>
      </Parte>
      <Parte id="oma" resaltar={resaltar}>
        <rect x={14} y={36} width={82} height={50} rx="8" fill="none" stroke={LINEA} strokeWidth="2" />
        <rect className="fae-sm-flujo" x={46} y={48} width={18} height={12} rx="2" fill={FAE.teal} />
        <rect className="fae-sm-flujo-vuelta" x={46} y={64} width={18} height={12} rx="2" fill="rgba(248,249,250,0.55)" />
        <Rotulo x={55} y={104}>OMA</Rotulo>
      </Parte>
      <Parte id="encaje" resaltar={resaltar}>
        <rect x={270} y={30} width={62} height={60} rx="6" fill="none" stroke={LINEA} strokeWidth="2" />
        <rect x={272} y={72} width={58} height={16} rx="3" fill={FAE.teal} opacity="0.75" />
        <Rotulo x={301} y={108}>Encaje</Rotulo>
      </Parte>
      <Parte id="cambiaria" resaltar={resaltar}>
        <rect x={262} y={150} width={48} height={40} rx="6" fill="none" stroke={LINEA} strokeWidth="2" />
        <circle cx={286} cy={170} r={9} fill="none" stroke={LINEA} strokeWidth="2" />
        <Rotulo x={286} y={208}>Reservas</Rotulo>
        <rect x={322} y={140} width={10} height={56} rx="4" fill="none" stroke={TENUE} strokeWidth="1.5" />
        <rect className="fae-sm-gira" x={323} y={cambia ? 170 : 150} width={8} height={cambia ? 25 : 45} rx="3" fill={cambia ? FAE.ambar : FAE.teal} style={{ transition: "all 900ms ease" }} />
        <Rotulo x={327} y={226}>Peso</Rotulo>
        <Rotulo x={356} y={250} anchor="end">Intervención cambiaria</Rotulo>
      </Parte>
    </svg>
  );
}

/* ═══════════════ ESCENA 3 · LAS TRES TRANSMISIONES ═══════════════ */

const POLEAS = { credito: 38, ahorro: 102, cambiario: 166 };

export function EscenaTransmisiones({ resaltar = [], sentido = 1, giro = null, conReloj = true }) {
  const volanteGira = giro ?? (resaltar.length ? 70 * sentido : 0);
  const reloj = resaltar.includes("reloj");
  return (
    <svg viewBox="0 0 360 250" role="img" aria-label="El volante de la tasa mueve tres correas: crédito, ahorro y cambiario; un reloj cuenta trimestres" style={{ width: "100%", display: "block" }}>
      <style>{CSS_MAQUINAS + `
.fae-sm-aguja-gira { animation: fae-sm-aguja 6s linear infinite; transform-box: view-box; transform-origin: 318px 214px; }
`}</style>
      <Parte id="volante" resaltar={resaltar}>
        <Volante cx={56} cy={102} r={34} giro={volanteGira} />
        <Rotulo x={56} y={160}>Tasa</Rotulo>
      </Parte>
      {CORREAS.map((c) => (
        <Parte key={c.id} id={c.id} resaltar={resaltar}>
          <Correa de={{ x: 56, y: 102 }} a={{ x: 236, y: POLEAS[c.id] }} r1={6} r2={11} activa={resaltar.includes(c.id)} velocidad={c.velocidad} retardo={c.retardo} sentido={sentido} />
          <Rotulo x={254} y={POLEAS[c.id] + 4} anchor="start">{c.nombre}</Rotulo>
        </Parte>
      ))}
      {conReloj && <Parte id="reloj" resaltar={resaltar}>
        <circle cx={318} cy={214} r={22} fill="none" stroke={LINEA} strokeWidth="2" />
        {[0, 1, 2, 3].map((k) => {
          const a = (k * Math.PI) / 2 - Math.PI / 2;
          return <line key={k} x1={318 + Math.cos(a) * 16} y1={214 + Math.sin(a) * 16} x2={318 + Math.cos(a) * 22} y2={214 + Math.sin(a) * 22} stroke={LINEA} strokeWidth="2" />;
        })}
        <line className={reloj ? "fae-sm-aguja-gira" : undefined} x1={318} y1={214} x2={318} y2={198} stroke={FAE.teal} strokeWidth="2.6" strokeLinecap="round" />
        <Rotulo x={250} y={219} anchor="end">Trimestres</Rotulo>
      </Parte>}
    </svg>
  );
}

/* ═══════════════ CAPA 3 · LAS EXPLORACIONES ═══════════════ */

const BOTON = (activo) => ({
  padding: "9px 12px", borderRadius: "999px", cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
  background: activo ? "rgba(42,157,143,0.16)" : "transparent",
  border: `1px solid ${activo ? FAE.teal : "rgba(248,249,250,0.22)"}`,
  color: activo ? FAE.text : "rgba(248,249,250,0.72)",
});

/*
 * ¿Quién manda aquí? y Las tres transmisiones: el volante se arrastra (o se
 * mueve con la barra, que es lo mismo para teclado) y las tres correas
 * reaccionan en el momento. La tasa de hoy se LEE de DATOS_VERIFICADOS y no
 * volante dice hacia dónde, no a cuánto. Así no sale ninguna cifra inventada.
 */
export function ExploraVolante({ conReloj = false }) {
  const [giro, setGiro] = useState(0);
  const [trimestre, setTrimestre] = useState(0);
  const svg = useRef(null);
  const arrastrando = useRef(false);

  const direccion = giro > 10 ? "apretar" : giro < -10 ? "soltar" : null;
  /*
   * Hacia dónde van consumo e inversión: soltar (+1) los sube, apretar (-1)
   * los baja. SOLO EL SENTIDO, nunca una magnitud: la ficha no trae cuánto, y
   * el reloj tampoco dice en qué trimestre llega cada canal.
   */
  const signo = direccion === "soltar" ? 1 : direccion === "apretar" ? -1 : 0;

  /* El reloj corre solo mientras el volante está fuera del centro. */
  useEffect(() => {
    if (!conReloj) return undefined;
    if (!direccion) { setTrimestre(0); return undefined; }
    const t = setInterval(() => setTrimestre((q) => (q >= 8 ? 8 : q + 1)), 1500);
    return () => clearInterval(t);
  }, [conReloj, direccion]);

  const desdePuntero = (e) => {
    const caja = svg.current?.getBoundingClientRect();
    if (!caja) return;
    const x = ((e.clientX - caja.left) / caja.width) * 360 - 56;
    const y = ((e.clientY - caja.top) / caja.height) * 250 - 102;
    const a = (Math.atan2(y, x) * 180) / Math.PI;
    setGiro(Math.max(-90, Math.min(90, Math.round(a))));
  };

  /*
   * Las tres correas se mueven en cuanto el volante sale del centro, cada una
   * con su velocidad y su retraso de CORREAS. El reloj solo cuenta trimestres:
   * no dice en cuál llega cada canal, porque la ficha no lo dice.
   */
  const activas = direccion ? ["volante", ...CORREAS.map((c) => c.id)] : [];

  return (
    <div>
      <div
        ref={svg}
        onPointerDown={(e) => { arrastrando.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); desdePuntero(e); }}
        onPointerMove={(e) => arrastrando.current && desdePuntero(e)}
        onPointerUp={() => { arrastrando.current = false; }}
        style={{ touchAction: "none", cursor: "grab" }}
      >
        <EscenaTransmisiones resaltar={[...activas, ...(conReloj && direccion ? ["reloj"] : [])]} sentido={giro >= 0 ? 1 : -1} giro={giro} conReloj={conReloj} />
      </div>
      <label style={{ display: "block", marginTop: "10px", fontSize: "13px", color: "rgba(248,249,250,0.75)" }}>
        Gire el volante (o use esta barra)
        <input type="range" min={-90} max={90} step={5} value={giro} onChange={(e) => setGiro(Number(e.target.value))} style={{ display: "block", width: "100%", marginTop: "6px", accentColor: FAE.teal }} aria-label="Giro del volante: a la derecha aprieta, a la izquierda suelta" />
      </label>
      <Barra nombre="CONSUMO" valor={signo} izquierda="Baja" derecha="Sube" />
      <Barra nombre="INVERSIÓN" valor={signo} izquierda="Baja" derecha="Sube" />
      <Barra nombre="COSTO DE LA DEUDA · SU CUOTA Y LA DEL GOBIERNO" valor={-signo} izquierda="Más barata" derecha="Más cara" />
      <p data-estado-volante style={{ margin: "8px 0 0", fontSize: "13.5px", lineHeight: 1.5, color: FAE.text }}>
        {direccion === "apretar" ? "Apretando: subir la tasa." : direccion === "soltar" ? "Soltando: bajar la tasa." : "Volante quieto."}
        {conReloj && direccion && ` Trimestre ${trimestre}.`}
        {direccion === "apretar" ? " El crédito se encarece: bajan el consumo y la inversión, y sube lo que cuesta la deuda que ya existe —su cuota y los intereses que paga el Gobierno por sus TES—." : direccion === "soltar" ? " El crédito se abarata: suben el consumo y la inversión, y baja lo que cuesta la deuda que ya existe —su cuota y los intereses que paga el Gobierno por sus TES—." : ""}
        {conReloj && direccion && trimestre < 8 ? " Y esto todavía no se ve completo: las tres correas giran a ritmos distintos." : ""}
        {" "}Hoy la tasa está en {DATOS_VERIFICADOS.tasaIntervencion}.
      </p>
    </div>
  );
}

/*
 * Los cuatro instrumentos manipulables, con su efecto sobre la liquidez del
 * sistema y sobre el tipo de cambio. Sin cifras: dos barras que dicen hacia
 * dónde, con las reglas que enseña la pieza —comprar títulos mete plata,
 * subir el encaje la quita, subir la tasa la quita y atrae capital, comprar
 * dólares debilita el peso—.
 */
const CONTROLES = [
  { id: "tasa", nombre: "Tasa de intervención", opciones: [["subir", "Subir"], ["no", "Mantener"], ["bajar", "Bajar"]] },
  { id: "oma", nombre: "Operaciones de Mercado Abierto", opciones: [["comprar", "Comprar títulos"], ["no", "Nada"], ["vender", "Vender títulos"]] },
  { id: "encaje", nombre: "Encaje bancario", opciones: [["subir", "Subir"], ["no", "Mantener"], ["bajar", "Bajar"]] },
  { id: "dolares", nombre: "Intervención cambiaria", opciones: [["comprar", "Comprar dólares"], ["no", "Nada"], ["vender", "Vender dólares"]] },
];

export function efectosInstrumentos(e) {
  const s = (v, mas, menos) => (v === mas ? 1 : v === menos ? -1 : 0);
  const liquidez = -s(e.tasa, "subir", "bajar") + s(e.oma, "comprar", "vender") - s(e.encaje, "subir", "bajar");
  const peso = s(e.tasa, "subir", "bajar") - s(e.dolares, "comprar", "vender");
  return { liquidez, peso };
}

function Barra({ valor, izquierda, derecha, nombre }) {
  const pos = 50 + Math.max(-3, Math.min(3, valor)) * (50 / 3);
  return (
    <div style={{ marginTop: "12px" }}>
      <p style={{ margin: "0 0 5px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.6)" }}>{nombre}</p>
      <div style={{ position: "relative", height: "10px", borderRadius: "999px", background: "rgba(248,249,250,0.1)" }}>
        <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-3px", width: "2px", height: "16px", background: "rgba(248,249,250,0.35)" }} />
        <span aria-hidden="true" style={{ position: "absolute", top: "-4px", left: `calc(${pos}% - 9px)`, width: "18px", height: "18px", borderRadius: "999px", background: FAE.teal, transition: "left 400ms ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", fontSize: "12px", color: "rgba(248,249,250,0.65)" }}>
        <span>{izquierda}</span><span>{derecha}</span>
      </div>
    </div>
  );
}

export function ExploraInstrumentos() {
  const [estado, setEstado] = useState({ tasa: "no", oma: "no", encaje: "no", dolares: "no" });
  const { liquidez, peso } = efectosInstrumentos(estado);
  const texto = (v, neg, pos) => (v > 0 ? pos : v < 0 ? neg : "sin cambio");
  return (
    <div>
      {CONTROLES.map((c) => (
        <fieldset key={c.id} style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
          <legend style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: FAE.text, marginBottom: "7px" }}>{c.nombre}</legend>
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {c.opciones.map(([v, etiqueta]) => (
              <button key={v} type="button" aria-pressed={estado[c.id] === v} onClick={() => setEstado((s) => ({ ...s, [c.id]: v }))} style={BOTON(estado[c.id] === v)}>
                {etiqueta}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <Barra nombre="LIQUIDEZ DEL SISTEMA" valor={liquidez} izquierda="Menos plata" derecha="Más plata" />
      <Barra nombre="EL PESO" valor={peso} izquierda="Más débil" derecha="Más fuerte" />
      <p data-efectos role="status" style={{ margin: "10px 0 0", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.8)" }}>
        Liquidez: {texto(liquidez, "menos plata", "más plata")}. Peso: {texto(peso, "más débil", "más fuerte")}.
      </p>
    </div>
  );
}

/*
 * ═══════════════ EXPLORACIÓN DE LA PIEZA 1 · EL MARGEN ═══════════════
 *
 * POR QUÉ EXISTE. La capa 3 de «¿Quién Manda Aquí?» pintaba la máquina de las
 * transmisiones: la misma de la pieza 3, con sus tres correas. Un estudiante
 * que apenas va en la primera pieza jugaba con poleas que nadie le ha
 * explicado, y la capa 2 y la capa 3 de la MISMA pieza le mostraban dos
 * máquinas distintas. Esta exploración usa la escena de su propia pieza.
 *
 * QUÉ ENSEÑA. El remate del paso 4, que es lo que más se confunde del tema:
 * la tasa de intervención NO es la que usted paga. Es lo que le cuesta al
 * banco conseguir plata; el banco le suma su margen y le cobra a usted más.
 *
 * SIN MAGNITUDES, A PROPÓSITO. Se mueve el sentido —sube, quieta, baja— y la
 * única cifra en pantalla es la de DATOS_VERIFICADOS. El margen de un banco
 * concreto no está verificado, así que no se dibuja un número: se nombra.
 */
const ESLABONES = [
  { id: "volante", titulo: "La Junta mueve la tasa de intervención", sube: "Sube. Es la decisión, y es lo único que hace el Banco.", baja: "Baja. Es la decisión, y es lo único que hace el Banco." },
  { id: "correa", titulo: "Al banco comercial le cuesta más conseguir plata", sube: "Sube. Pedirle prestado al Banco de la República le sale más caro.", baja: "Baja. Conseguir plata le sale más barato." },
  { id: "banco-comercial", titulo: "El banco le suma su margen", sube: "El margen sigue ahí: el banco no presta al costo.", baja: "El margen sigue ahí: bajar la tasa no lo borra." },
  { id: "persona", titulo: "Lo que usted paga por su crédito", sube: "Sube, y queda por encima de la tasa de intervención.", baja: "Baja, y sigue por encima de la tasa de intervención." },
];

export function ExploraMargen() {
  const [mov, setMov] = useState("quieta");
  const activo = mov !== "quieta";
  const resaltar = activo ? ESLABONES.map((e) => e.id) : [];
  return (
    <div>
      <EscenaQuienManda resaltar={resaltar} />
      <fieldset style={{ border: "none", padding: 0, margin: "12px 0 0" }}>
        <legend style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: FAE.text, marginBottom: "7px" }}>
          Qué hace la Junta con la tasa
        </legend>
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
          {[["baja", "La baja"], ["quieta", "La deja quieta"], ["sube", "La sube"]].map(([v, etiqueta]) => (
            <button key={v} type="button" aria-pressed={mov === v} onClick={() => setMov(v)} style={BOTON(mov === v)}>{etiqueta}</button>
          ))}
        </div>
      </fieldset>
      <ol data-eslabones style={{ margin: "14px 0 0", padding: 0, listStyle: "none" }}>
        {ESLABONES.map((e, k) => (
          <li key={e.id} style={{ display: "flex", gap: "11px", padding: "9px 0", borderTop: k ? "1px solid rgba(248,249,250,0.1)" : "none" }}>
            <span aria-hidden="true" style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: activo ? FAE.teal : "rgba(248,249,250,0.35)", paddingTop: "2px" }}>
              {String(k + 1).padStart(2, "0")}
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, color: FAE.text }}>{e.titulo}</span>
              <span style={{ display: "block", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.75)" }}>
                {activo ? (mov === "sube" ? e.sube : e.baja) : "Quieta."}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p data-remate-margen role="status" style={{ margin: "12px 0 0", fontSize: "13.5px", lineHeight: 1.55, color: FAE.text }}>
        {activo
          ? `Los cuatro eslabones se mueven juntos, y ese es el punto: la tasa de intervención mueve su crédito sin ser su crédito. Hoy está en ${DATOS_VERIFICADOS.tasaIntervencion} —y eso no es lo que usted paga.`
          : `Hoy la tasa de intervención está en ${DATOS_VERIFICADOS.tasaIntervencion}. Muévala y siga la cadena hasta su bolsillo.`}
      </p>
    </div>
  );
}
