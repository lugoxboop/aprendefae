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
  ROTULO_SIMULADO, APRENDER_FABRICA, EJEMPLO_JUAN, escaleraDe, CIFRAS_ESCENA, PELDANOS_ESCENA, PASO_SIGUE, EXPLORA,
  CREA_O_CAMBIA, OPCIONES_CREA_O_CAMBIA, HECHOS_CREA_O_CAMBIA, retroCreaOCambia,
  ESCALERA, ESCENARIO_ESCALERA, CASILLAS, CASILLAS_ESCALERA, PREGUNTAS_COMPARA, ERRORES_ESCALERA,
  ENUNCIADO_ESCALERA_A, TEXTO_ESCALERA_B, rotuloEscalera,
} from "../../../data/pmFabricaDelDinero.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · LA FÁBRICA DEL DINERO (Célula B).
 *
 * Todo lo nuevo de la pieza y sus dos juegos, en un archivo propio: no se
 * toca salaDeMaquinas.jsx, CuatroCapas.jsx ni PorCualArteria.jsx; de ellos
 * solo se importa (Parte, CSS_MAQUINAS) o se copia el patrón.
 *
 *   EscenaFabrica           la escena de la capa 2 (anexo v2 de Mai)
 *   ExploraFabrica          la capa 3: el encaje como freno
 *   CreaOCambia             «¿Crea o Cambia de Manos?», patrón de PorCualArteria
 *   EscaleraDelEncaje       «La Escalera del Encaje», casilla por casilla
 *   CreaOCambiaDeManos,
 *   LaEscaleraDelEncaje     las dos con JuegoConTutorial y MarcoMaquinas
 *
 * REGLAS DEL TEMA QUE MANDAN SOBRE LA GUÍA (Sakuta): las partes son la Parte
 * de salaDeMaquinas.jsx, con su apagado (fae-sm-apagada); teal como acento;
 * sin coral; sin «%». Y las decisiones de Sakuta: ninguna correa une al
 * Gobierno con el Banco de la República; ninguna animación en bucle (no hay
 * punto viajero: la guía v2 lo quitó); cada cifra con su paso; «Escenario
 * simulado» siempre a la vista en el segundo piso; ningún texto bajo 12 px.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las cifras como se leen en español: punto de miles y coma decimal (343,9). */
export function cifra(n) {
  const [entero, decimales] = String(n).split(".");
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimales ? `${conPuntos},${decimales}` : conPuntos;
}

const NEUTRO = "#B8C4D4";
const SECUNDARIO = "#A8B6C8";
const TEAL_CLARO = "#7FD1C7";
const FONDO_CAJA = "rgba(10,20,34,.45)";
/*
 * 13,2 unidades: a 320 la capa 2 deja 236 px para la lámina de 258, y la letra
 * queda en 12,07 px. Con los 12,5 de la guía bajaba a 11,4 (medido).
 */
const TEXTO = { fontFamily: "Inter, sans-serif", fontSize: "13.2px", fill: "#F8F9FA" };
const ROTULO_PISO = { fontFamily: "Inter, sans-serif", fontSize: "13.2px", fontWeight: 600, fill: SECUNDARIO };

/* ═══════════════ LA ESCENA DE LA CAPA 2 ═══════════════ */

/*
 * El paso en que va la pieza. CuatroCapas no se toca y solo le pasa a la
 * escena el `resaltar` del paso: ese arreglo ES el de la pieza, así que se
 * busca por identidad. Fuera de la pieza (sin paso), todo se ve.
 */
const pasoDe = (resaltar) => {
  const k = APRENDER_FABRICA.pasos.findIndex((p) => p.resaltar === resaltar);
  return k < 0 ? Infinity : k + 1;
};

function Caja({ x, y, w, h, encendida, chip = false, children }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={chip ? h / 2 : 10}
        fill={encendida ? "rgba(42,157,143,.16)" : FONDO_CAJA}
        stroke={encendida ? FAE.teal : NEUTRO} strokeWidth={encendida ? 2 : 1} />
      {children}
    </g>
  );
}
const Texto = ({ x, y, children, anchor = "middle", peso = 400 }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...TEXTO, fontWeight: peso }}>{children}</text>
);

/*
 * Una correa. `une` son alternativas separadas por «|»: se enciende si TODAS
 * las partes de alguna alternativa están resaltadas (anexo v2 de Mai, §3).
 */
const encendidaPor = (une, resaltar) => une.split("|").some((alt) => alt.trim().split(/\s+/).every((id) => resaltar.includes(id)));
function Correa({ id, d, une, resaltar, children = null }) {
  const encendida = encendidaPor(une, resaltar);
  const apagada = resaltar.length > 0 && !encendida;
  return (
    <g data-correa={id} data-une={une} data-encendida={encendida || undefined} className={apagada ? "fae-sm-apagada" : undefined}>
      <path d={d} fill="none" stroke={encendida ? FAE.teal : NEUTRO} strokeOpacity={encendida ? 1 : 0.55} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {children}
    </g>
  );
}

/* Los tres bancos de la fila de abajo, con su cajita de encaje. */
const BANCOS = [
  { id: "banco-a", nombre: "Banco A", x: 0, w: 80, encaje: "encaje-a" },
  { id: "banco-b", nombre: "Banco B", x: 88, w: 80, encaje: "encaje-b" },
  { id: "banco-c", nombre: "Banco C", x: 177, w: 81, encaje: "encaje-c" },
];
const Y_BANCOS = 280;

export function EscenaFabrica({ resaltar = [] }) {
  const paso = pasoDe(resaltar);
  const on = (id) => resaltar.includes(id);
  const cifraDe = (id) => CIFRAS_ESCENA.find((c) => c.id === id);
  const ve = (id) => paso >= cifraDe(id).paso;
  const Cifra = ({ id, x, y, anchor = "start" }) => (ve(id)
    ? <text data-cifra={id} x={x} y={y} textAnchor={anchor} style={{ ...TEXTO, fontWeight: 700, fill: TEAL_CLARO, fontVariantNumeric: "tabular-nums" }}>{cifra(cifraDe(id).valor)}</text>
    : null);
  /* La cajita de un banco se enciende con encaje y su banco, o con encaje sin ningún banco A/B/C. */
  const sinBanco = !BANCOS.some((b) => on(b.id));
  const cajitaEncendida = (b) => on("encaje") && (on(b.id) || sinBanco);

  const juan = escaleraDe(EJEMPLO_JUAN.partida, EJEMPLO_JUAN.encaje, EJEMPLO_JUAN.vueltas);
  const totales = [EJEMPLO_JUAN.partida, ...juan.map((f) => f.total)];
  const largo = (t) => (t / totales.at(-1)) * 196;

  return (
    <svg viewBox="0 0 258 540" aria-hidden="true" style={{ width: "100%", maxWidth: "300px", display: "block", margin: "0 auto" }}>
      <style>{CSS_MAQUINAS}</style>

      {/* ── Creación primaria ── */}
      <text x={0} y={12} style={ROTULO_PISO}>Creación primaria</text>
      <Correa id="gobierno-tes" d="M55 55 V74" une="gobierno tes" resaltar={resaltar} />
      <Correa id="dolares-banco" d="M193 51 V66" une="dolares banco-republica" resaltar={resaltar} />
      <Correa id="tes-banco" d="M55 103 V174" une="tes banco-privado" resaltar={resaltar} />
      {/*
        * El mercado: el banco le vende el TES al Banco de la República. Sube por
        * el hueco entre columnas y entra al Banco por DEBAJO, lejos del chip del
        * TES: si subiera hasta su altura, Gobierno–TES y esta correa encendidas
        * se leerían como Gobierno → TES → Banco (medido en el paso 20).
        */}
      <Correa id="mercado" d="M120 174 V124 H137 V117" une="tes banco-republica" resaltar={resaltar} />
      <Correa id="pesos-banco" d="M193 159 V174" une="pesos-nuevos banco-privado" resaltar={resaltar} />

      <Parte id="gobierno" resaltar={resaltar}>
        <Caja x={0} y={22} w={111} h={33} encendida={on("gobierno")}><Texto x={55.5} y={43}>Gobierno</Texto></Caja>
      </Parte>
      <Parte id="dolares" resaltar={resaltar}>
        <Caja x={130} y={22} w={127} h={29} chip encendida={on("dolares")}><Texto x={193.5} y={41}>Dólares</Texto></Caja>
      </Parte>
      <Parte id="tes" resaltar={resaltar}>
        <Caja x={0} y={74} w={111} h={29} chip encendida={on("tes")}><Texto x={55.5} y={93} peso={700}>TES</Texto></Caja>
      </Parte>
      <Parte id="banco-republica" resaltar={resaltar}>
        <Caja x={130} y={66} w={127} h={51} encendida={on("banco-republica")}>
          <Texto x={193.5} y={88}>Banco de la</Texto>
          <Texto x={193.5} y={105}>República</Texto>
        </Caja>
      </Parte>
      <Parte id="pesos-nuevos" resaltar={resaltar}>
        <Caja x={130} y={130} w={127} h={29} chip encendida={on("pesos-nuevos")}><Texto x={193.5} y={149}>Pesos nuevos</Texto></Caja>
      </Parte>

      <line x1={0} y1={166} x2={258} y2={166} stroke={NEUTRO} strokeOpacity="0.4" strokeDasharray="4 4" />
      <Parte id="banco-privado" resaltar={resaltar}>
        <Caja x={0} y={174} w={258} h={30} encendida={on("banco-privado")}><Texto x={129} y={194}>Un banco</Texto></Caja>
      </Parte>

      {/* ── Creación secundaria ── */}
      <text x={0} y={226} style={ROTULO_PISO}>Creación secundaria</text>
      {/* Siempre a la vista, fuera de toda parte: el resaltado no lo apaga. */}
      <g data-rotulo-simulado>
        <rect x={120} y={238} width={138} height={24} rx={12} fill="none" stroke={NEUTRO} strokeWidth="1" />
        <text x={189} y={254.5} textAnchor="middle" style={{ ...TEXTO, fill: SECUNDARIO }}>{ROTULO_SIMULADO}</text>
      </g>

      <Correa id="juan-a" d={`M41 263 V${Y_BANCOS}`} une="juan banco-a" resaltar={resaltar}>
        <Cifra id="juan-a" x={50} y={276} />
      </Correa>
      <Correa id="a-ana" d={`M40 ${Y_BANCOS + 70} V366`} une="banco-a ana|ana" resaltar={resaltar}>
        <Cifra id="a-ana" x={48} y={363} />
      </Correa>
      <Correa id="ana-pedro" d="M71 379.5 H97" une="ana pedro" resaltar={resaltar}>
        <Cifra id="ana-pedro" x={84} y={374} anchor="middle" />
      </Correa>
      <Correa id="pedro-b" d={`M128 366 V${Y_BANCOS + 70}`} une="pedro banco-b" resaltar={resaltar}>
        <Cifra id="pedro-b" x={136} y={363} />
      </Correa>
      <Correa id="b-c" d={`M150 ${Y_BANCOS + 70} V360 H217 V${Y_BANCOS + 70}`} une="banco-b encaje|banco-c" resaltar={resaltar}>
        <Cifra id="b-c" x={183} y={376} anchor="middle" />
      </Correa>
      <Correa id="c-sale" d={`M237 ${Y_BANCOS + 70} V366`} une="banco-c encaje" resaltar={resaltar}>
        <Cifra id="c-sale" x={237} y={381} anchor="middle" />
      </Correa>

      <Parte id="juan" resaltar={resaltar}>
        <Caja x={10} y={236} w={62} h={27} chip encendida={on("juan")}><Texto x={41} y={254}>Juan</Texto></Caja>
      </Parte>
      {BANCOS.map((b) => (
        <Parte key={b.id} id={b.id} resaltar={resaltar}>
          <Caja x={b.x} y={Y_BANCOS} w={b.w} h={70} encendida={on(b.id)}><Texto x={b.x + b.w / 2} y={Y_BANCOS + 16}>{b.nombre}</Texto></Caja>
        </Parte>
      ))}
      {/* El encaje: una sola parte con las tres cajitas (data-parte no es id). */}
      <Parte id="encaje" resaltar={resaltar}>
        {BANCOS.map((b) => {
          const encendida = cajitaEncendida(b);
          return (
            <g key={b.encaje} data-cajita={b.id} className={on("encaje") && !encendida ? "fae-sm-apagada" : undefined}>
              <rect x={b.x + 7} y={Y_BANCOS + 24} width={b.w - 14} height={38} rx={8}
                fill="rgba(184,196,212,.10)" stroke={encendida ? TEAL_CLARO : NEUTRO} strokeWidth={encendida ? 2 : 1} />
              <Texto x={b.x + b.w / 2} y={Y_BANCOS + 39}>Encaje</Texto>
              <Cifra id={b.encaje} x={b.x + b.w / 2} y={Y_BANCOS + 56} anchor="middle" />
            </g>
          );
        })}
      </Parte>
      <Parte id="ana" resaltar={resaltar}>
        <Caja x={9} y={366} w={62} h={27} chip encendida={on("ana")}><Texto x={40} y={384}>Ana</Texto></Caja>
      </Parte>
      <Parte id="pedro" resaltar={resaltar}>
        <Caja x={97} y={366} w={62} h={27} chip encendida={on("pedro")}><Texto x={128} y={384}>Pedro</Texto></Caja>
      </Parte>

      {/* ── La escalera: la partida y tres vueltas, cada peldaño desde su paso ── */}
      <Parte id="escalera" resaltar={resaltar}>
        <text x={0} y={420} style={ROTULO_PISO}>Total en depósitos</text>
        {PELDANOS_ESCENA.map((p, k) => (paso >= p.paso ? (
          <g key={p.id} data-peldano={p.id}>
            <rect x={0} y={430 + k * 24} width={largo(Math.min(totales[k], EJEMPLO_JUAN.partida))} height={16} rx={3} fill="rgba(184,196,212,.35)" />
            {totales[k] > EJEMPLO_JUAN.partida && (
              <rect x={largo(EJEMPLO_JUAN.partida)} y={430 + k * 24} width={largo(totales[k] - EJEMPLO_JUAN.partida)} height={16} rx={3} fill="rgba(42,157,143,.30)" stroke={FAE.teal} strokeWidth="1" />
            )}
            <text x={largo(totales[k]) + 6} y={443 + k * 24} style={{ ...TEXTO, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{cifra(totales[k])}</text>
          </g>
        ) : null))}
        {paso >= PASO_SIGUE && <text data-peldano="sigue" x={0} y={538} style={{ ...TEXTO, fill: SECUNDARIO }}>…</text>}
      </Parte>
    </svg>
  );
}

/* ═══════════════ LA CAPA 3: EL ENCAJE COMO FRENO ═══════════════ */

const BOTON_CONTROL = (activo) => ({
  width: "44px", height: "44px", borderRadius: "12px", fontFamily: "Sora, sans-serif", fontSize: "20px", fontWeight: 700,
  cursor: activo ? "pointer" : "default", background: "transparent",
  border: `2px solid ${activo ? NEUTRO : "rgba(184,196,212,.3)"}`, color: activo ? FAE.text : "rgba(248,249,250,.3)",
});
const CHIP_SIMULADO = {
  display: "inline-block", margin: "10px 0 0", padding: "2px 10px", borderRadius: "999px",
  border: `1px solid ${NEUTRO}`, fontSize: "12px", color: SECUNDARIO,
};

export function ExploraFabrica() {
  const niveles = EXPLORA.posiciones.map((p) => p.encaje);
  const [k, setK] = useState(niveles.indexOf(EXPLORA.inicial));
  const [movido, setMovido] = useState(false);
  const pos = EXPLORA.posiciones[k];
  const filas = escaleraDe(EJEMPLO_JUAN.partida, pos.encaje, EXPLORA.vueltas);
  const totales = [EJEMPLO_JUAN.partida, ...filas.map((f) => f.total)];
  /* Escala fija: la escalera más larga posible, la del encaje más bajo. */
  const maximo = escaleraDe(EJEMPLO_JUAN.partida, Math.min(...niveles), EXPLORA.vueltas).at(-1).total;
  const mover = (d) => { setK((x) => Math.max(0, Math.min(niveles.length - 1, x + d))); setMovido(true); };
  return (
    <div data-explora-fabrica>
      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: FAE.text }}>{EXPLORA.consigna}</p>
      <span data-rotulo-simulado style={CHIP_SIMULADO}>{ROTULO_SIMULADO}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "12px" }}>
        <button type="button" data-bajar aria-label="Bajar el encaje" disabled={k === 0} onClick={() => mover(-1)} style={BOTON_CONTROL(k > 0)}>−</button>
        <div aria-live="polite" style={{ textAlign: "center", minWidth: "96px" }}>
          <span data-encaje-actual={pos.encaje} style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "22px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: FAE.text }}>{pos.encaje}</span>
          <span style={{ fontSize: "12px", color: SECUNDARIO }}>de cada 100</span>
        </div>
        <button type="button" data-subir aria-label="Subir el encaje" disabled={k === niveles.length - 1} onClick={() => mover(1)} style={BOTON_CONTROL(k < niveles.length - 1)}>+</button>
      </div>
      <p data-texto-posicion aria-live="polite" style={{ margin: "12px 0 0", fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,.88)" }}>{pos.texto}</p>
      <div data-escalera-explora style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
        {totales.map((t, j) => (
          <div key={j} data-vuelta={j} data-total={t} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", flex: `0 0 ${(t / maximo) * 72}%`, height: "22px" }}>
              <span style={{ flex: `0 0 ${(EJEMPLO_JUAN.partida / t) * 100}%`, background: "rgba(184,196,212,.35)", borderRadius: "3px 0 0 3px" }} />
              {t > EJEMPLO_JUAN.partida && <span style={{ flex: "1 1 auto", background: "rgba(42,157,143,.30)", border: `1px solid ${FAE.teal}`, borderRadius: "0 3px 3px 0" }} />}
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: FAE.text, whiteSpace: "nowrap" }}>{cifra(t)}</span>
          </div>
        ))}
      </div>
      {movido && (
        <p data-texto-final aria-live="polite" style={{ margin: "12px 0 0", padding: "11px 13px", borderRadius: "12px", background: FAE.navy, fontSize: "14px", lineHeight: 1.55, color: FAE.text }}>
          {EXPLORA.final}
        </p>
      )}
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
 * opciones a la vista en su orden y sin color propio, un intento por hecho,
 * el acierto del hecho o el error de su tipo, la regla fija, la consigna y el
 * cierre. pct = aciertos / hechos × 100. MODO DEMO: `items` trae el ejemplo.
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

/* Una escalera en tabla: «Vuelta N» por fila; lo que todavía no se resolvió va en blanco. */
function TablaEscalera({ filas, encaje, vistas = Infinity }) {
  return (
    <div data-tabla-escalera={encaje} style={{ flex: "1 1 220px", minWidth: 0 }}>
      <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, color: FAE.text }}>{rotuloEscalera(encaje)}</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontVariantNumeric: "tabular-nums" }}>
        <thead>
          <tr>
            <th aria-label="Vuelta" />
            {CASILLAS.map((c) => <th key={c.id} style={{ textAlign: "right", fontWeight: 600, color: SECUNDARIO, padding: "4px 2px" }}>{c.nombre}</th>)}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, k) => (
            <tr key={f.vuelta} data-fila={f.vuelta} style={{ borderTop: "1px solid rgba(248,249,250,0.12)" }}>
              <td style={{ padding: "5px 2px", color: SECUNDARIO, whiteSpace: "nowrap" }}>Vuelta {f.vuelta}</td>
              {CASILLAS.map((c, j) => (
                <td key={c.id} data-celda={`${f.vuelta}:${c.id}`} style={{ padding: "5px 2px", textAlign: "right", color: FAE.text }}>
                  {k * CASILLAS.length + j < vistas ? cifra(f[c.id]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* En la demo, cuánto se ve la casilla resuelta antes de la siguiente (el guion toca cada 2,5 s). */
export const DEMO_AVANCE_MS = 1200;

/* Las opciones de cada casilla y de cada pregunta, barajadas al cargar (Shoko: la posición no puede delatar). */
const ordenar = (lista, conBarajar) => lista.map((x) => (conBarajar ? barajar(x.opciones) : x.opciones));

/*
 * Primero se construye la escalera A, casilla por casilla: opción múltiple,
 * un intento, la devolución del tipo de error y el valor correcto revelado en
 * la tabla, para que la vuelta siguiente parta de él. Después se ve la
 * escalera B ya armada y se responden las tres decisiones.
 * pct = aciertos / 12 × 100 (la regla de «¿Por Cuál Arteria Entra?»).
 * Ítems: «vuelta:casilla» y «compara:id».
 * MODO DEMO: `items` trae el ejemplo de Juan (una vuelta, sin comparar), las
 * casillas avanzan solas y al final se lee la resolución de Futaba.
 */
export function EscaleraDelEncaje({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const ejemplo = items?.[0] ?? null;
  const escenario = ejemplo ?? ESCENARIO_ESCALERA;
  const casillas = ejemplo ? ejemplo.casillas : CASILLAS_ESCALERA;
  const preguntas = ejemplo ? [] : PREGUNTAS_COMPARA;
  const escaleras = escenario.encajes.map((e) => escaleraDe(escenario.partida, e, escenario.vueltas));
  const total = casillas.length + preguntas.length;

  const [n, setN] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const barajarTodo = () => [...ordenar(casillas, !ejemplo), ...ordenar(preguntas, !ejemplo)];
  const [orden, setOrden] = useState(barajarTodo);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const pct = porcentaje(aciertos, total);
  const enCasillas = n < casillas.length;
  const actual = enCasillas ? casillas[n] : preguntas[n - casillas.length];
  const itemId = enCasillas ? actual.id : `compara:${actual.id}`;

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  /* En la demo no hay «Siguiente»: tras cada casilla, la siguiente llega sola. */
  useEffect(() => {
    if (!modoDemo || !elegida || n + 1 >= total) return undefined;
    const reloj = setTimeout(() => { setElegida(null); setN((x) => x + 1); }, DEMO_AVANCE_MS);
    return () => clearTimeout(reloj);
  }, [elegida]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (op) => {
    if (elegida) return;
    const ok = op.tipo === null;
    detalle.current.push({ item: itemId, ok, intentos: 1, respuesta: ok ? null : String(op.valor ?? op.id), orden: detalle.current.length + 1 });
    if (ok) setAciertos((x) => x + 1);
    setElegida(op);
  };
  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (n + 1 < total) setN(n + 1);
    else setTerminado(true);
  };
  const reiniciar = () => {
    setN(0); setElegida(null); setAciertos(0); setTerminado(false); setOrden(barajarTodo());
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

  const retro = elegida && elegida.tipo ? `❌ ${ERRORES_ESCALERA[elegida.tipo]}` : null;
  const correcta = actual.opciones.find((o) => o.tipo === null);
  const opciones = orden[n];
  const partida = `Punto de partida: ${cifra(escenario.partida)}.`;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {!modoDemo && <Encabezado consigna={ESCALERA.consigna} onComoSeJuega={onComoSeJuega} />}
      <p data-regla style={ESTILO_REGLA}>{ESCALERA.regla}</p>
      {!modoDemo && (
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={total} hechos={n + (elegida ? 1 : 0)} enCurso={n + 1} etiqueta="Casilla" />
        </div>
      )}
      <span data-rotulo-simulado style={{ ...CHIP_SIMULADO, margin: "0 0 10px" }}>{ROTULO_SIMULADO}</span>

      {enCasillas ? (
        <>
          {!ejemplo && <p data-enunciado-escalera style={{ margin: "0 0 8px", fontSize: "14px", lineHeight: 1.55, color: FAE.text }}>{ENUNCIADO_ESCALERA_A}</p>}
          <p data-partida style={{ margin: "0 0 8px", fontSize: "13px", color: SECUNDARIO }}>{partida}</p>
          {/* La cifra correcta entra a la tabla en cuanto se responde, acierte o falle. */}
          <TablaEscalera filas={escaleras[0]} encaje={escenario.encajes[0]} vistas={n + (elegida ? 1 : 0)} />
          <div data-hecho={itemId} style={{ marginTop: "12px" }}>
            <Enunciado acento={acento}>{`Vuelta ${actual.vuelta} · ${CASILLAS.find((c) => c.id === actual.casilla).nombre}`}</Enunciado>
          </div>
        </>
      ) : (
        <>
          <p data-texto-b style={{ margin: "0 0 8px", fontSize: "14px", lineHeight: 1.55, color: FAE.text }}>{TEXTO_ESCALERA_B}</p>
          <p data-partida style={{ margin: "0 0 8px", fontSize: "13px", color: SECUNDARIO }}>{partida}</p>
          <div data-dos-escaleras style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
            {escaleras.map((f, k) => <TablaEscalera key={escenario.encajes[k]} filas={f} encaje={escenario.encajes[k]} />)}
          </div>
          <div data-hecho={itemId} style={{ marginTop: "12px" }}>
            <Enunciado acento={acento}>{actual.texto}</Enunciado>
          </div>
        </>
      )}

      <Opciones columnas={enCasillas ? "repeat(3, minmax(0, 1fr))" : "repeat(auto-fit, minmax(150px, 1fr))"}>
        {opciones.map((op) => (
          <Opcion
            key={op.id ?? op.valor}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(op)}
            estado={!elegida ? null : op === elegida ? (op.tipo === null ? "correcta" : "incorrecta") : op === correcta ? "revelada" : null}
          >
            {enCasillas ? cifra(op.valor) : op.nombre}
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={retro} />
      {ejemplo && elegida && n + 1 === total && (
        <p data-resolucion style={{ margin: "12px 0 0", padding: "11px 13px", borderRadius: "12px", background: "rgba(184,196,212,0.13)", fontSize: "15px", lineHeight: "22px", color: FAE.text }}>
          {ejemplo.resolucion}
        </p>
      )}
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
