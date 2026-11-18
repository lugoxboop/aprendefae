import { useState, useEffect, useCallback } from "react";
import { FAE } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import BotonAnimo from "../social/BotonAnimo.jsx";
import { estadoDeAnimos } from "../../social/animo.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { TAMANOS } from "../avatar/Avatar.jsx";
import AvatarEstudiante from "../avatar/AvatarEstudiante.jsx";
import { TARJETA_TABLA, ATENUADO_TABLA } from "./tarjeta.js";
import BandaDecoracion from "../decoracion/BandaDecoracion.jsx";
import { estadoRanking } from "../decoracion/poses.js";

/*
 * Tabla de posiciones de FP. Sirve a los dos emplazamientos: por materia
 * (pasando `subjectId`) y general (sin él).
 *
 * Los datos salen de la función ranking_fp, que agrega sobre todo el historial;
 * desde el cliente no se puede, porque RLS solo deja ver las filas propias.
 *
 * Se consulta al entrar y al cambiar de pestaña, sin suscripción en vivo.
 *
 * ═══════════ EL REDISEÑO DEL 18-NOV: PODIO Y MASCOTAS GRANDES ═══════════
 *
 * Mateo: «lo del plan piloto; que se vea mucho mejor y los animalitos más
 * grandes». La tabla era una lista plana con la mascota a 36 px: la cara del
 * estudiante —lo que más quiere ver— era lo más pequeño de la fila. Cambia:
 *
 *   · Los tres primeros suben a un PODIO: la mascota a 96 px dentro de un
 *     disco con aro de su puesto, y un pedestal escalonado (1.º al centro,
 *     más alto). Es forma, no iconografía: sin trofeos, coronas ni medallas
 *     (kit, «iconografía cliché de gamificación»). La jerarquía la siguen
 *     marcando el número y el color del puesto.
 *   · Del 4.º al 10.º, filas en ficha, con la mascota a 48 px en su círculo.
 *   · Tu fila brilla en teal con una pastilla «Tú», estés donde estés.
 *   · Mientras carga, un esqueleto con la forma del podio, no un «Cargando…»
 *     suelto (el texto sigue ahí para el lector de pantalla).
 *
 * Coherente con el Repaso Diario (#682): tarjeta con halo teal, rótulo en
 * versalitas y pastillas. Lo que se mueve —el podio que sube al llegar y el
 * realce al pasar el puntero— se apaga con reducir movimiento.
 */

/*
 * «Semestre» y no «De semestre» (#556): a 320 las tres pestañas medían 262 px
 * en un hueco de 238 y «De semestre» se partía en dos renglones. El periodo es
 * el mismo; solo cambia la palabra que no cabía.
 */
const PERIODOS = [
  { id: "diario", etiqueta: "Diario" },
  { id: "semanal", etiqueta: "Semanal" },
  { id: "semestre", etiqueta: "Semestre" },
];

/*
 * El color de cada puesto del podio. El primero va en ámbar, no en coral
 * (#546): coral es SOLO error en el kit, y aquí marcaba al que va ganando. El
 * oro es la lectura universal de un podio. El 2.º en el azul claro de la marca
 * (FAE.node, la «plata» de la paleta) y el 3.º en teal. El color va en aros,
 * pedestales y halos; como texto solo el ámbar y el node, que pasan 4,5:1
 * sobre la tarjeta. El número del 3.º va en blanco (#573: teal no es texto).
 */
const ACENTO_PODIO = [
  { aro: FAE.ambar, rgb: "233,196,106", texto: FAE.ambar },
  { aro: FAE.node, rgb: "203,220,242", texto: FAE.node },
  { aro: FAE.teal, rgb: "42,157,143", texto: FAE.text },
];

/* El orden visual del podio: 2.º a la izquierda, 1.º al centro, 3.º a la derecha. */
const ORDEN_PODIO = [1, 0, 2];
/* La altura del pedestal por escalón (1.º, 2.º, 3.º). */
const ALTURA_PEDESTAL = ["58px", "42px", "30px"];

const TEAL_RGB = "42,157,143";

const CSS = `
.fae-rk {
  position: relative;
  overflow: hidden;
  box-shadow: 0 18px 40px -22px rgba(${TEAL_RGB}, 0.55), inset 0 1px 0 rgba(248, 249, 250, 0.08);
}
/* El halo de arriba: el mismo teal del Repaso, opaco porque va sobre la tarjeta opaca. */
.fae-rk::before {
  content: ""; position: absolute; inset: 0 0 auto 0; height: 220px; pointer-events: none;
  background: radial-gradient(120% 100% at 50% -10%, rgba(${TEAL_RGB}, 0.20), rgba(${TEAL_RGB}, 0) 70%);
}
.fae-rk > * { position: relative; }

.fae-rk__pestana { transition: background-color 160ms ease, color 160ms ease, box-shadow 200ms ease; }
.fae-rk__pestana:focus-visible, .fae-rk__entrar:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
.fae-rk__pestana[aria-pressed="false"]:hover { background-color: rgba(248, 249, 250, 0.07) !important; color: ${FAE.text} !important; }

/* ── El podio ── */
/*
 * Dos renglones de rejilla compartidos por las tres columnas (subgrid): arriba
 * la mascota sobre su pedestal, alineados abajo para que se lea el escalón;
 * abajo el apodo, los FP y el ánimo, alineados arriba. Así un apodo largo que
 * se parte en tres renglones no levanta su mascota por encima de la del 1.º.
 */
.fae-rk__podio {
  display: grid;
  grid-template-columns: 1fr 1.22fr 1fr;
  grid-template-rows: auto auto;
  column-gap: 8px;
  margin: 4px 0 18px;
}
.fae-rk__puesto { display: grid; grid-row: span 2; grid-template-rows: subgrid; min-width: 0; text-align: center; }
.fae-rk__base { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
.fae-rk__datos { display: flex; flex-direction: column; align-items: center; padding-top: 10px; min-width: 0; }
.fae-rk__disco {
  position: relative; box-sizing: border-box; border-radius: 999px; aspect-ratio: 1 / 1;
  display: flex; align-items: center; justify-content: center;
  transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fae-rk__puesto:hover .fae-rk__disco { transform: translateY(-3px) scale(1.03); }
.fae-rk__pedestal {
  width: 100%; box-sizing: border-box; margin-top: 12px;
  border-radius: 14px 14px 6px 6px;
  display: flex; align-items: flex-start; justify-content: center; padding-top: 6px;
  font-family: Sora, sans-serif; font-weight: 800; font-size: 22px; line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* ── Las filas del 4.º en adelante ── */
.fae-rk__fila { transition: background-color 160ms ease, border-color 160ms ease, transform 200ms ease; }
.fae-rk__fila--ajena:hover { background-color: rgba(248, 249, 250, 0.06) !important; border-color: rgba(248, 249, 250, 0.14) !important; }

/* ── Entrada: el podio sube, las filas aparecen en cascada ── */
@keyframes fae-rk-sube { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.fae-rk__entra { animation: fae-rk-sube 420ms cubic-bezier(0.22, 1, 0.36, 1) both; }

/* ── El esqueleto de carga ── */
@keyframes fae-rk-brillo { from { background-position: -200px 0; } to { background-position: 200px 0; } }
.fae-rk__hueso {
  background-color: rgba(248, 249, 250, 0.06);
  background-image: linear-gradient(90deg, rgba(248,249,250,0) 0, rgba(248,249,250,0.07) 50%, rgba(248,249,250,0) 100%);
  background-size: 200px 100%; background-repeat: no-repeat;
  animation: fae-rk-brillo 1.3s ease-in-out infinite;
}

.fae-rk__oculto { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) {
  .fae-rk__entra, .fae-rk__hueso { animation: none; }
  .fae-rk__disco, .fae-rk__fila, .fae-rk__pestana { transition: none; }
  .fae-rk__puesto:hover .fae-rk__disco { transform: none; }
}
`;

/* La pastilla «Tú»: teal de fondo y texto oscuro, como el «Listo hoy» del Repaso. */
function PastillaTu() {
  return (
    <span
      style={{
        display: "inline-block", verticalAlign: "middle", marginLeft: "6px",
        padding: "2px 8px", borderRadius: "999px",
        fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.02em",
        backgroundColor: FAE.teal, color: FAE.bg,
      }}
    >
      Tú
    </span>
  );
}

/* Los FP: la cifra grande en Sora y la unidad más chica y atenuada. */
function Puntos({ fp, destacada, grande = false }) {
  return (
    <span
      data-fp
      style={{
        fontFamily: "Sora, sans-serif",
        fontSize: grande ? "15px" : "14px",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: destacada ? FAE.text : "rgba(248,249,250,0.85)",
        whiteSpace: "nowrap",
      }}
    >
      {Number(fp).toLocaleString("es-CO")}
      <span style={{ fontSize: "11px", fontWeight: 600, color: ATENUADO_TABLA, marginLeft: "3px" }}>FP</span>
    </span>
  );
}

/*
 * ═══════════ UN PUESTO DEL PODIO ═══════════
 *
 * Columna de dos pisos: arriba la mascota en su disco sobre el pedestal con
 * el número; abajo el apodo (que se parte antes que cortarse: nunca «…»,
 * #556), los FP y el ánimo. El apodo va solo en su bloque: ni el botón ni la
 * cifra le roban ancho.
 *
 * A 320 la columna de los lados mide unos 70 px: el disco es `min(100%, …)` y
 * la mascota llena el 80 % del disco, así que encoge con la columna sin
 * desbordar. Se dibuja a 96 para que a cualquier tamaño salga nítida.
 */
function PuestoPodio({ entrada, escalon, animo, retardo }) {
  const acento = ACENTO_PODIO[escalon];
  const destacada = entrada.es_tuyo;
  const conAnimo = !destacada && animo;
  const primero = escalon === 0;
  return (
    <div
      data-fila-ranking
      data-podio-puesto={escalon + 1}
      className="fae-rk__puesto fae-rk__entra"
      style={{ animationDelay: `${retardo}ms` }}
    >
      <div className="fae-rk__base">
        <div
          className="fae-rk__disco"
          style={{
            width: primero ? "min(100%, 112px)" : "min(100%, 84px)",
            padding: primero ? "9px" : "7px",
            background: `radial-gradient(circle at 50% 35%, rgba(${acento.rgb},0.30), rgba(${acento.rgb},0.06) 70%)`,
            border: `${primero ? 3 : 2}px solid ${acento.aro}`,
            boxShadow: `0 0 0 ${primero ? 6 : 4}px rgba(${acento.rgb},0.10), 0 12px 28px -10px rgba(${acento.rgb},${primero ? 0.6 : 0.4})${destacada ? `, 0 0 0 ${primero ? 9 : 7}px rgba(${TEAL_RGB},0.55)` : ""}`,
          }}
        >
          <AvatarEstudiante perfil={entrada} tamano={TAMANOS.podio} style={{ width: "100%", height: "auto", maxHeight: "100%" }} />
        </div>
        <div
          aria-hidden="true"
          className="fae-rk__pedestal"
          style={{
            height: ALTURA_PEDESTAL[escalon],
            color: acento.texto,
            background: `linear-gradient(180deg, rgba(${acento.rgb},0.38), rgba(${acento.rgb},0.08))`,
            borderTop: `2px solid ${acento.aro}`,
            boxShadow: `inset 0 1px 0 rgba(248,249,250,0.10)`,
          }}
        >
          {entrada.posicion}
        </div>
      </div>
      <div className="fae-rk__datos">
        <div style={{ width: "100%" }}>
          <span
            data-apodo
            style={{
              display: "block",
              fontSize: primero ? "14.5px" : "13.5px",
              lineHeight: 1.25,
              fontWeight: 600,
              color: FAE.text,
              /* Se parte antes que cortarse; nunca «…». */
              overflowWrap: "anywhere",
            }}
          >
            {entrada.nickname}
          </span>
          {destacada && <div style={{ marginTop: "4px" }}><PastillaTu /></div>}
        </div>

        <div style={{ marginTop: "4px" }}>
          <Puntos fp={entrada.fp} destacada={destacada} grande={primero} />
        </div>

        {/* Nunca en la fila propia: no se puede dar ánimo a uno mismo. */}
        {conAnimo && (
          <div style={{ marginTop: "8px" }}>
            <BotonAnimo apodo={entrada.nickname} recibidos={animo.recibidos} yaLeDi={animo.yaLeDi} />
          </div>
        )}
      </div>
      <span className="fae-rk__oculto">Puesto {entrada.posicion}</span>
    </div>
  );
}

/*
 * ═══════════ LA FILA (#556 y #546) ═══════════
 *
 * Del 4.º en adelante. Dos renglones dentro de su columna de texto:
 *   1. el apodo, con todo el ancho que queda tras el puesto y la mascota, y
 *      que puede partirse en dos renglones antes que cortarse;
 *   2. el ánimo a la izquierda y los FP a la derecha.
 * Así el ancho del apodo no depende de cuánto mida el botón ni la cifra.
 *
 * La mascota sube de 36 a 48 px y va en un círculo suave: se reconoce el
 * animalito de un vistazo, que era lo que pedía Mateo.
 */
function Fila({ entrada, destacada, animo, retardo = 0 }) {
  const conAnimo = !destacada && animo;
  return (
    <div
      data-fila-ranking
      className={`fae-rk__fila fae-rk__entra${destacada ? "" : " fae-rk__fila--ajena"}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px 8px 8px",
        borderRadius: "16px",
        animationDelay: `${retardo}ms`,
        backgroundColor: destacada ? `rgba(${TEAL_RGB},0.14)` : "rgba(248,249,250,0.03)",
        border: destacada ? `1px solid ${FAE.teal}` : "1px solid rgba(248,249,250,0.07)",
        boxShadow: destacada ? `0 10px 26px -14px rgba(${TEAL_RGB},0.8)` : "none",
      }}
    >
      <span
        aria-label={`Puesto ${entrada.posicion}`}
        style={{
          width: "30px", flexShrink: 0, textAlign: "center",
          fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: destacada ? FAE.text : ATENUADO_TABLA,
        }}
      >
        {entrada.posicion}
      </span>
      {/*
        La mascota de cada fila, a 48 px, en su círculo. La fila trae la
        mascota desde ranking_fp; sin ella, la de fábrica (mascotaDe).
      */}
      <span
        aria-hidden="true"
        style={{
          width: "56px", height: "56px", flexShrink: 0, borderRadius: "999px",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: destacada ? `rgba(${TEAL_RGB},0.22)` : "rgba(248,249,250,0.06)",
        }}
      >
        <AvatarEstudiante perfil={entrada} tamano={TAMANOS.fila} style={{ flexShrink: 0 }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div>
          <span
            data-apodo
            style={{
              display: "block",
              fontSize: "14.5px",
              lineHeight: 1.3,
              color: FAE.text,
              fontWeight: destacada ? 700 : 500,
              /* Se parte antes que cortarse; nunca «…». */
              overflowWrap: "anywhere",
            }}
          >
            {entrada.nickname}
            {destacada && <PastillaTu />}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: conAnimo ? "space-between" : "flex-end", gap: "8px", marginTop: "2px", minHeight: conAnimo ? undefined : "26px" }}>
          {/* Nunca en la fila propia: no se puede dar ánimo a uno mismo. */}
          {conAnimo && <BotonAnimo apodo={entrada.nickname} recibidos={animo.recibidos} yaLeDi={animo.yaLeDi} />}
          <Puntos fp={entrada.fp} destacada={destacada} />
        </div>
      </div>
    </div>
  );
}

/* Mientras carga: la silueta del podio y tres filas, con un brillo que pasa. */
function Esqueleto() {
  return (
    <div aria-busy="true">
      <span className="fae-rk__oculto" role="status">Cargando…</span>
      <div aria-hidden="true" className="fae-rk__podio">
        {ORDEN_PODIO.map((escalon) => (
          <div key={escalon} className="fae-rk__puesto">
            <div className="fae-rk__base">
              <div className="fae-rk__hueso" style={{ width: escalon === 0 ? "min(100%, 112px)" : "min(100%, 84px)", aspectRatio: "1 / 1", borderRadius: "999px" }} />
              <div className="fae-rk__hueso" style={{ width: "100%", height: ALTURA_PEDESTAL[escalon], borderRadius: "14px 14px 6px 6px", marginTop: "12px" }} />
            </div>
            <div className="fae-rk__datos">
              <div className="fae-rk__hueso" style={{ width: "70%", height: "12px", borderRadius: "6px" }} />
            </div>
          </div>
        ))}
      </div>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[0, 1, 2].map((k) => <div key={k} className="fae-rk__hueso" style={{ height: "64px", borderRadius: "16px" }} />)}
      </div>
    </div>
  );
}

/* Un mensaje de estado (sin cuenta, vacío, error) en su ficha suave. */
function Aviso({ children }) {
  return (
    <div style={{ padding: "18px 16px", borderRadius: "16px", background: "rgba(248,249,250,0.05)", border: "1px dashed rgba(248,249,250,0.16)" }}>
      {children}
    </div>
  );
}

/*
 * La consulta, aparte e inyectable: la de verdad va contra ranking_fp, y la
 * prueba de la lista larga de avatares la sustituye por filas de mentira con la
 * misma forma. Mismo trato que onGuardar en el selector de avatar.
 */
export async function pedirRanking({ subjectId, periodo }) {
  if (!supabase) return { data: [], error: null };
  return supabase.rpc("ranking_fp", { p_subject: subjectId, p_periodo: periodo });
}

/*
 * `decoracion` (opcional, #547): { piezas, bucle, fae }. Con ella va la banda
 * de vida-visual-v1 entre la cabecera y las pestañas; sin ella, nada cambia.
 */
export default function RankingFP({ subjectId = null, titulo = "Ranking", nota, pedir = pedirRanking, decoracion = null }) {
  const { session, perfil, pedirCuenta } = useAuth();
  const [periodo, setPeriodo] = useState("semestre");
  const [estado, setEstado] = useState({ cargando: false, filas: null, error: null });
  const [animos, setAnimos] = useState({});

  const consultar = useCallback(async () => {
    if (!session) return;
    setEstado({ cargando: true, filas: null, error: null });
    const { data, error } = await pedir({ subjectId, periodo });
    if (error) {
      setEstado({ cargando: false, filas: null, error: error.message });
      return;
    }
    setEstado({ cargando: false, filas: data ?? [], error: null });

    /*
     * Los ánimos van en una segunda consulta, no dentro de ranking_fp: esa
     * función ya está cerrada y verificada, y meterle mano por una insignia
     * social sería reabrir algo que costó asegurar.
     */
    const ajenos = (data ?? []).filter((f) => !f.es_tuyo).map((f) => f.nickname);
    setAnimos(await estadoDeAnimos(ajenos));
  }, [subjectId, periodo, session, pedir]);

  /* Se consulta al entrar y cada vez que cambia la pestaña. */
  useEffect(() => { consultar(); }, [consultar]);

  /* Tarjeta opaca, la misma de la liga (#571): sobre el ajedrez de Estratégico no se leía. */
  const contenedor = {
    borderRadius: "22px",
    ...TARJETA_TABLA,
    border: `1px solid rgba(${TEAL_RGB},0.35)`,
    padding: "clamp(16px, 2.5vw, 22px)",
  };

  const filas = estado.filas ?? [];
  const top = filas.filter((f) => f.posicion <= 10);
  /* Los tres primeros de la lista suben al podio; el resto del top, en filas. */
  const podio = top.slice(0, 3);
  const resto = top.slice(3);
  const propia = filas.find((f) => f.es_tuyo);
  const propiaFueraDelTop = propia && propia.posicion > 10;

  return (
    <div data-ranking className="fae-rk" style={contenedor}>
      <style>{CSS}</style>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px 12px", flexWrap: "wrap", marginBottom: "16px" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ATENUADO_TABLA, marginBottom: "4px" }}>
            Tabla de posiciones
          </span>
          <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "19px", lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, color: FAE.text }}>
            {titulo}
          </h3>
        </div>
        {nota && (
          <span style={{ fontSize: "12px", fontWeight: 600, color: ATENUADO_TABLA, padding: "5px 10px", borderRadius: "999px", border: "1px solid rgba(248,249,250,0.14)", background: "rgba(248,249,250,0.05)", whiteSpace: "nowrap" }}>
            {nota}
          </span>
        )}
      </div>

      {decoracion && (() => {
        const { fae, quieta } = estadoRanking({ session, ...estado });
        return <BandaDecoracion piezas={decoracion.piezas} bucle={decoracion.bucle && !quieta} fae={decoracion.fae ? fae : null} />;
      })()}

      <div
        role="group"
        aria-label="Periodo del ranking"
        style={{
          /* Cabe a 320 (#556): las tres pestañas reparten el ancho y ninguna se parte. */
          display: "flex", gap: "4px", padding: "4px", borderRadius: "999px", maxWidth: "100%", boxSizing: "border-box",
          background: "rgba(14,27,46,0.55)", border: "1px solid rgba(248,249,250,0.10)",
          marginBottom: "20px",
        }}
      >
        {PERIODOS.map((p) => {
          const activo = p.id === periodo;
          return (
            <button
              key={p.id}
              type="button"
              className="fae-rk__pestana"
              onClick={() => setPeriodo(p.id)}
              aria-pressed={activo}
              style={{
                fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700,
                padding: "7px 10px", borderRadius: "999px", border: "none", cursor: "pointer",
                flex: "1 1 auto", whiteSpace: "nowrap",
                /*
                 * 44 px, y la medida que lo destapó: a 375 estos tres medían
                 * 33 de alto. A 320 daban 52 y parecían bien, pero era porque
                 * el rótulo se partía en dos líneas. Un control que pasa solo
                 * cuando su texto se parte no pasa: pasa por accidente.
                 */
                minHeight: "44px",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                backgroundColor: activo ? FAE.teal : "transparent",
                backgroundImage: activo ? "linear-gradient(180deg, rgba(248,249,250,0.16), rgba(248,249,250,0))" : "none",
                boxShadow: activo ? `0 6px 16px -6px rgba(${TEAL_RGB},0.9)` : "none",
                /* Lo inactivo, en sólido y sin opacity (kit.md, 16 oct.). */
                color: activo ? FAE.bg : "#A8B6C8",
              }}
            >
              {p.etiqueta}
            </button>
          );
        })}
      </div>

      {!session ? (
        <Aviso>
          <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.75)", margin: "0 0 12px" }}>
            El ranking es entre estudiantes con cuenta. Entra para ver tu posición.
          </p>
          <button
            type="button"
            className="fae-rk__entrar"
            onClick={() => pedirCuenta("ver el ranking")}
            style={{
              fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700,
              padding: "10px 22px", borderRadius: "999px", border: "none",
              /* 44 px: medido a 320 daba 76×40. Es el «Entrar» del ranking, no el
                 de Google —por eso sobrevivió al arreglo de aquel—. */
              minHeight: "44px",
              cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg,
              boxShadow: `0 8px 20px -8px rgba(${TEAL_RGB},0.9)`,
            }}
          >
            Entrar
          </button>
        </Aviso>
      ) : estado.cargando ? (
        <Esqueleto />
      ) : estado.error ? (
        <Aviso>
          <p style={{ fontSize: "14px", lineHeight: 1.55, color: FAE.coral, margin: 0 }}>
            No se pudo cargar el ranking: {estado.error}
          </p>
        </Aviso>
      ) : top.length === 0 ? (
        /* Estado vacío honesto: todavía no hay actividad, no es un fallo. */
        <Aviso>
          <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.75)", margin: 0, textAlign: "center" }}>
            {subjectId
              ? "Aún no hay actividad registrada en esta materia."
              : "Aún no hay actividad registrada en este periodo."}
          </p>
        </Aviso>
      ) : (
        <div>
          <div data-podio className="fae-rk__podio">
            {ORDEN_PODIO.map((escalon) => {
              const f = podio[escalon];
              if (!f) return <div key={`vacio-${escalon}`} aria-hidden="true" style={{ gridRow: "span 2" }} />;
              return (
                <PuestoPodio
                  key={`${f.posicion}-${f.nickname}`}
                  entrada={f}
                  escalon={escalon}
                  animo={animos[f.nickname]}
                  retardo={[120, 0, 220][escalon]}
                />
              );
            })}
          </div>

          {resto.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {resto.map((f, i) => (
                <Fila key={`${f.posicion}-${f.nickname}`} entrada={f} destacada={f.es_tuyo} animo={animos[f.nickname]} retardo={260 + Math.min(i, 8) * 40} />
              ))}
            </div>
          )}

          {propiaFueraDelTop && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 2px 10px" }}>
                <span aria-hidden="true" style={{ flex: 1, height: "1px", background: "rgba(248,249,250,0.12)" }} />
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ATENUADO_TABLA }}>
                  Tu posición
                </span>
                <span aria-hidden="true" style={{ flex: 1, height: "1px", background: "rgba(248,249,250,0.12)" }} />
              </div>
              <Fila entrada={propia} destacada retardo={600} />
            </>
          )}

          {!propia && perfil && (
            <p style={{ fontSize: "13px", lineHeight: 1.5, color: ATENUADO_TABLA, margin: "14px 2px 0", textAlign: "center" }}>
              Todavía no tienes FP en este periodo, así que no apareces en la tabla.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
