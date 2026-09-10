import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Waves, ChevronRight, RotateCcw } from "lucide-react";
import { FAE } from "../../../theme.js";
import { PDF_CASO } from "../../../data/arca.js";
import {
  ETAPAS, PUNTOS_POR_ETAPA, TOTAL_PUNTOS, puntuarDesafio, nivelDelAgua,
} from "../../../arca/puntuacion.js";
import {
  estadoParaGuardar, filasDelDesafio, guardarPartida, leerPartida, borrarPartida, haceCuanto,
} from "../../../arca/partida.js";
import NivelDelAgua from "./NivelDelAgua.jsx";
import EtapaExpediente from "./EtapaExpediente.jsx";
import EtapaIcebergArca from "./EtapaIcebergArca.jsx";
import EtapaDecision from "./EtapaDecision.jsx";
import EtapaDiluvio from "./EtapaDiluvio.jsx";

/*
 * "El Proyecto del Arca" — el desafío legendario del Modelo del Iceberg.
 *
 * Cuatro etapas encadenadas sobre un solo caso, con un reloj compartido a la
 * vista. Es el nodo especial del tema, no una de sus ocho actividades: vale
 * base × etapas (90 × 4 = 360) por la regla del Kit para desafíos compuestos,
 * y esa regla vive en el motor y en el catálogo del servidor, no aquí.
 *
 * LO QUE ESTE COMPONENTE HACE Y LO QUE NO. Aquí se guarda el resultado de cada
 * etapa, se calcula el nivel del agua y, al terminar las cuatro, se llama UNA
 * vez al motor central con el porcentaje combinado. Los puntos no se calculan
 * aquí: se calculan en arca/puntuacion.js —para poder medirlos sin interfaz— y
 * el número final lo vuelve a calcular el servidor, que es quien manda.
 *
 * EL CASO NO SE REPRODUCE. Se lee antes de clase en papel; el PDF queda
 * descargable en la portada y nada más. Lo que se evalúa es la aplicación del
 * modelo, no la lectura.
 *
 * ═══════════ LA PARTIDA SOBREVIVE A UNA RECARGA (0028) ═══════════
 *
 * Al TERMINAR cada etapa se guarda en el servidor lo sellado: resultados,
 * detalle y tiempo jugado. Recargar a mitad de la etapa 3 devuelve —al
 * elegirlo— al principio de la 3, con la 1 y la 2 como quedaron, fallos
 * incluidos. Recargar deja de ser una estrategia porque deja de ser una
 * ventaja. Las reglas y su porqué, en src/arca/partida.js.
 *
 * Volver NUNCA es silencioso: la portada dice que hay una partida, por qué
 * etapa iba y cuándo se guardó, y el estudiante elige continuar o empezar de
 * nuevo.
 */

const CSS = `
@keyframes fae-pa-entrar { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.fae-pa-entrar { animation: fae-pa-entrar 480ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-pa-latido {
  0%,100% { box-shadow: 0 0 0 0 rgba(233,196,106,0.34), 0 0 30px rgba(233,196,106,0.1); }
  50%     { box-shadow: 0 0 0 7px rgba(233,196,106,0), 0 0 42px rgba(233,196,106,0.22); }
}
.fae-pa-latido { animation: fae-pa-latido 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-pa-entrar, .fae-pa-latido { animation: none !important; } }
`;

const COMPONENTES = [EtapaExpediente, EtapaIcebergArca, EtapaDecision, EtapaDiluvio];

export default function ProyectoArca({ onCompletar }) {
  /* null = portada. 0..3 = etapa en curso. 4 = balance final. */
  const [paso, setPaso] = useState(null);
  const [resultados, setResultados] = useState([null, null, null, null]);
  const yaAvisado = useRef(false);

  /*
   * ═══════════ EL DETALLE POR ÍTEM DEL DESAFÍO ═══════════
   *
   * Cada etapa emite sus propias filas con sus ids nativos, y al registrar se
   * les pone el prefijo `etN:` (filasDelDesafio, en arca/partida.js).
   *
   * HOY NO CHOCARÍAN SIN ÉL, y conviene decirlo en vez de inventar un motivo:
   * las citas de la etapa 1 son e1..e8, las ranuras de la 2 son los nombres de
   * nivel, la 3 emite par:* y la 4 un solo "momento". Ninguno coincide.
   *
   * El prefijo se queda por tres razones reales. Una, que son cuatro juegos
   * distintos dentro de una sola actividad y sin él nada impide que añadir un
   * ítem a una etapa colisione en silencio con otra —el fallo que ya apareció
   * tres veces en este tema, y que nunca lanza un error—. Dos, que con él la
   * etapa se lee directamente en el panel sin tener que conocer el catálogo. Y
   * tres, desde la 0028: es lo que hace EXACTA la sustitución al retomar.
   *
   * Se guarda POR ÍNDICE DE ETAPA y no acumulando, y eso ya no es un "si algún
   * día se permite": al retomar una partida, la etapa reabierta empieza vacía
   * y rehacerla REEMPLAZA sus filas en vez de duplicarlas. El servidor lo
   * garantiza además por su cuenta —un ítem, una fila—.
   */
  const detallePorEtapa = useRef([null, null, null, null]);

  /* ═══════════ la partida guardada ═══════════ */

  /* Lo que había en el servidor al abrir el desafío: se ofrece, nunca se aplica solo. */
  const [guardada, setGuardada] = useState(null);
  /* Mientras se pregunta, "Empezar" espera: empezar encima reemplazaría la guardada sin haberla ofrecido. */
  const [comprobando, setComprobando] = useState(true);
  /* La identidad que el servidor le dio a esta partida en su primer guardado. */
  const iniciadaEn = useRef(null);
  /* TIEMPO JUGADO, no de reloj: la suma de las etapas selladas. Ver arca/partida.js. */
  const jugadoMs = useRef(0);
  const inicioTramo = useRef(null);
  /* Los guardados van en fila: el segundo necesita la identidad que devuelve el primero. */
  const guardando = useRef(Promise.resolve());
  /* El servidor dijo que esta partida ya no existe: no se vuelve a intentar guardar. */
  const cerrada = useRef(false);

  useEffect(() => {
    let vivo = true;
    leerPartida()
      .then((p) => {
        if (!vivo) return;
        setGuardada(p);
        setComprobando(false);
      })
      .catch(() => vivo && setComprobando(false));
    return () => { vivo = false; };
  }, []);

  const hechas = resultados.filter((r) => typeof r === "number");
  const promedio = hechas.length ? hechas.reduce((s, r) => s + r, 0) / hechas.length : null;
  const agua = nivelDelAgua(hechas.length, promedio);
  const total = useMemo(() => puntuarDesafio(resultados), [resultados]);

  const empezar = () => {
    setResultados([null, null, null, null]);
    detallePorEtapa.current = [null, null, null, null];
    yaAvisado.current = false;
    iniciadaEn.current = null;
    jugadoMs.current = 0;
    cerrada.current = false;
    inicioTramo.current = Date.now();
    setGuardada(null);
    setPaso(0);
  };

  /* "Empezar de nuevo": la guardada se borra antes, para que nadie la retome después. */
  const empezarDeNuevo = async () => {
    await borrarPartida();
    empezar();
  };

  /*
   * Cierra el desafío y avisa al motor UNA vez. Espera a que termine el
   * guardado pendiente —el de la etapa 4— antes de registrar: si llegara
   * después, el servidor lo rechazaría igual (la partida ya estaría cerrada),
   * pero así ni siquiera se intenta.
   */
  const cerrarDesafio = (finales) => {
    setPaso(ETAPAS.length);
    if (yaAvisado.current) return;
    yaAvisado.current = true;
    const filas = filasDelDesafio(detallePorEtapa.current);
    const duracion = jugadoMs.current;
    const pct = puntuarDesafio(finales).pct;
    guardando.current.finally(() => onCompletar?.(pct, duracion, filas));
  };

  const continuarGuardada = () => {
    const g = guardada;
    if (!g) return;
    setResultados(g.resultados);
    detallePorEtapa.current = g.detalle;
    jugadoMs.current = g.jugadoMs;
    iniciadaEn.current = g.iniciadaEn;
    cerrada.current = false;
    yaAvisado.current = false;
    inicioTramo.current = Date.now();
    setGuardada(null);
    /* Si ya estaban las cuatro, lo que faltaba era el balance: ahí se registra. */
    if (g.siguiente >= ETAPAS.length) {
      cerrarDesafio(g.resultados);
      return;
    }
    setPaso(g.siguiente);
  };

  /*
   * Una etapa terminó: su resultado queda SELLADO aquí y en el servidor. Se
   * guarda al terminarla y no al pulsar "Siguiente": quien recargara con el
   * resultado ya en pantalla podría rehacerla, y eso es justo lo que la regla
   * impide.
   */
  const guardar = (indice, pct, filas = null) => {
    detallePorEtapa.current[indice] = filas ?? [];
    const siguientes = [...resultados];
    siguientes[indice] = pct;
    setResultados(siguientes);

    if (inicioTramo.current !== null) {
      jugadoMs.current += Date.now() - inicioTramo.current;
      inicioTramo.current = null;
    }

    if (cerrada.current) return;
    const estado = estadoParaGuardar({
      resultados: siguientes,
      detallePorEtapa: detallePorEtapa.current,
      jugadoMs: jugadoMs.current,
    });
    guardando.current = guardando.current
      .then(() => guardarPartida(estado, iniciadaEn.current))
      .then((r) => {
        if (r?.ok) iniciadaEn.current = r.iniciadaEn;
        else if (r?.motivo === "cerrada") cerrada.current = true;
      })
      .catch(() => {});
  };

  const continuar = () => {
    if (paso < ETAPAS.length - 1) {
      setPaso(paso + 1);
      inicioTramo.current = Date.now();
      return;
    }
    /* Última etapa: se cierra el desafío y se avisa al motor una sola vez. */
    cerrarDesafio(resultados);
  };

  /* --------------------------------- portada --------------------------------- */
  if (paso === null) {
    return (
      <div className="fae-pa-entrar">
        <style>{CSS}</style>

        {/*
          La partida a medias, antes que nada. Dice por qué etapa iba y CUÁNDO
          se guardó: "continuar" sobre algo de hace tres días sorprende si no se
          dice.
        */}
        {guardada && (
          <div
            style={{
              borderRadius: "18px", padding: "16px 18px", marginBottom: "14px",
              background: "rgba(42,157,143,0.10)", border: `1px solid ${FAE.teal}66`,
            }}
          >
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color: FAE.text, margin: "0 0 4px" }}>
              Tienes el Proyecto del Arca a medias.
            </p>
            <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.75)", margin: "0 0 4px" }}>
              {guardada.siguiente >= ETAPAS.length
                ? "Terminaste las cuatro etapas y te faltó ver el balance"
                : `Ibas por la etapa ${guardada.siguiente + 1} de ${ETAPAS.length}`}{" "}
              (guardado {haceCuanto(Date.now() - new Date(guardada.actualizadoEn).getTime())}).
            </p>
            <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.5)", margin: "0 0 12px" }}>
              Las etapas que terminaste quedan como las dejaste; la que estaba a medias empieza desde el principio.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <button
                type="button"
                onClick={continuarGuardada}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "11px 18px", borderRadius: "12px", cursor: "pointer",
                  background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg,
                  fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
                }}
              >
                Continuar <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={empezarDeNuevo}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "11px 18px", borderRadius: "12px", cursor: "pointer",
                  background: "transparent", border: "1px solid rgba(248,249,250,0.24)",
                  color: "rgba(248,249,250,0.8)", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
                }}
              >
                <RotateCcw size={14} /> Empezar de nuevo
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            borderRadius: "22px", padding: "clamp(18px, 3vw, 28px)",
            background: "linear-gradient(155deg, rgba(233,196,106,0.09), rgba(10,20,34,0.6) 55%)",
            border: `1px solid ${FAE.ambar}55`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "12px" }}>
            <Waves size={16} color={FAE.ambar} />
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: FAE.ambar, margin: 0 }}>
              DESAFÍO LEGENDARIO · 4 ETAPAS · {TOTAL_PUNTOS} FP
            </p>
          </div>

          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.78)", margin: "0 0 8px" }}>
            Absalón tiene cuatro meses, 1200 personas y el encargo de construir un arca. Tiene también
            un ingeniero naval al que ascendió a «elemento técnico» y seis gerencias para vigilarlo.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.78)", margin: "0 0 18px" }}>
            Cuatro etapas sobre un solo caso. El agua sube mientras respondes, y sube más rápido si
            fallas: el plazo corre igual que en el caso.
          </p>

          {/* Las etapas, de un vistazo. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "9px", marginBottom: "20px" }}>
            {PUNTOS_POR_ETAPA.map((e) => (
              <div key={e.id} style={{ padding: "11px 13px", borderRadius: "13px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)" }}>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.teal, margin: "0 0 4px" }}>
                  ETAPA {e.id}
                </p>
                <p style={{ fontSize: "13px", lineHeight: 1.4, color: FAE.text, margin: "0 0 5px" }}>{e.nombre}</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, color: "rgba(248,249,250,0.45)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                  {e.puntos} FP
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            {/* Con una partida guardada, las dos opciones están arriba y son explícitas. */}
            {!guardada && (
              <button
                type="button"
                onClick={empezar}
                disabled={comprobando}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "13px 22px", borderRadius: "14px", cursor: comprobando ? "wait" : "pointer",
                  background: FAE.ambar, border: `1px solid ${FAE.ambar}`, color: "#08111d",
                  fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
                  opacity: comprobando ? 0.6 : 1,
                }}
              >
                Empezar el desafío <ChevronRight size={16} />
              </button>
            )}

            {/*
              El caso completo. Se lee en papel antes de clase; el enlace está
              para quien lo perdió o quiere volver a mirarlo a mitad de una etapa.
            */}
            <a
              href={PDF_CASO}
              download="caso_el_proyecto_del_arca.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 18px", borderRadius: "14px", textDecoration: "none",
                background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
                color: "rgba(248,249,250,0.78)", fontFamily: "Sora, sans-serif",
                fontSize: "13.5px", fontWeight: 600,
              }}
            >
              <Download size={15} /> Descargar el caso (PDF)
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------- balance --------------------------------- */
  if (paso >= ETAPAS.length) {
    return (
      <div className="fae-pa-entrar">
        <style>{CSS}</style>
        <div style={{ borderRadius: "22px", padding: "clamp(18px, 3vw, 26px)", background: "rgba(248,249,250,0.04)", border: `1px solid ${FAE.ambar}44` }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: FAE.ambar, margin: "0 0 10px" }}>
            DESAFÍO COMPLETADO
          </p>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(30px, 5vw, 42px)", color: FAE.text, margin: "0 0 4px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {total.puntos} <span style={{ fontSize: "0.5em", color: "rgba(248,249,250,0.45)" }}>/ {TOTAL_PUNTOS}</span>
          </p>
          <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 20px" }}>
            {total.pct}% del desafío · los FP los calcula el servidor con este porcentaje
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "20px" }}>
            {total.porEtapa.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, color: "rgba(248,249,250,0.4)", width: "16px", flexShrink: 0 }}>
                  {e.id}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: "13px", color: "rgba(248,249,250,0.75)" }}>
                  {e.nombre}
                </span>
                <span style={{ width: "84px", height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.08)", overflow: "hidden", flexShrink: 0 }}>
                  <span style={{ display: "block", height: "100%", width: `${e.pct ?? 0}%`, background: FAE.teal, borderRadius: "999px" }} />
                </span>
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: FAE.text, width: "76px", textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(e.obtenidos)} / {e.puntos}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPaso(null)}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "10px 16px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
          >
            <RotateCcw size={14} /> Volver a intentarlo
          </button>
          <p style={{ fontSize: "12px", color: "rgba(248,249,250,0.38)", margin: "10px 0 0" }}>
            Repetir sirve para repasar; los FP se otorgan una sola vez.
          </p>
        </div>
      </div>
    );
  }

  /* --------------------------------- etapa --------------------------------- */
  const Etapa = COMPONENTES[paso];
  const ficha = PUNTOS_POR_ETAPA[paso];
  const resultado = resultados[paso];
  const hecha = typeof resultado === "number";

  return (
    <div>
      <style>{CSS}</style>

      {/* Cabecera de la etapa, con el agua siempre a la vista. */}
      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center",
          justifyContent: "space-between", marginBottom: "18px",
        }}
      >
        <div style={{ minWidth: "180px", flex: 1 }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.ambar, margin: "0 0 5px" }}>
            ETAPA {ficha.id} DE {ETAPAS.length} · {ficha.puntos} FP
          </p>
          <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.8vw, 23px)", letterSpacing: "-0.02em", color: FAE.text, margin: 0, lineHeight: 1.2 }}>
            {ficha.nombre}
          </h3>
        </div>
        <NivelDelAgua
          altura={agua}
          etapa={ficha.id}
          total={ETAPAS.length}
          apremia={typeof promedio === "number" && promedio < 60}
        />
      </div>

      <Etapa key={paso} onTerminar={(pct, filas) => guardar(paso, pct, filas)} />

      {hecha && (
        <button
          type="button"
          onClick={continuar}
          className="fae-pa-entrar"
          style={{
            marginTop: "20px", width: "100%", padding: "14px", borderRadius: "14px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: FAE.ambar, border: `1px solid ${FAE.ambar}`, color: "#08111d",
            fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
          }}
        >
          {paso < ETAPAS.length - 1 ? "Siguiente etapa" : "Ver el balance"} <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
