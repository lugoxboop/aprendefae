import { useEffect, useRef, useState } from "react";
import { RotateCcw, FolderClosed } from "lucide-react";
import { FAE } from "../../theme.js";
import { CierreConResumen } from "../shared/PantallaResumen.jsx";
import {
  PROBLEMAS, sortearTitulares, retroalimentacion, textoArchivado,
  PREGUNTA_BRECHA, BRECHAS,
} from "../../data/juegosPolitica.js";
import { barajar } from "../../utils/barajar.js";

/*
 * ACTIVIDAD 1 — "Diagnóstico en vivo".
 *
 * Juego evaluativo. Ocho titulares reales caen uno a uno y hay que clasificar
 * cada uno en su problema antes de que cruce la línea de archivo.
 *
 * NO ES UN EJERCICIO DE MEMORIA, y por eso ningún texto de la interfaz lo
 * llama así. Los ocho botones están a la vista todo el rato, así que lo que se
 * practica es RECONOCIMIENTO rápido —clasificar contra una lista visible— y no
 * recuerdo libre. Es una actividad sólida; solo no es lo que dice la etiqueta
 * de "práctica de recuperación".
 *
 * ─────────────── SE TOCA, NO SE ARRASTRA ───────────────
 *
 * La ficha pedía arrastrar el titular hasta el botón. Aquí no se arrastra, y
 * es deliberado: el arrastre nativo del navegador no funciona con el dedo sin
 * una librería encima, este sitio se ve sobre todo en el teléfono, y todas las
 * mecánicas del proyecto ya resuelven esto tocando (radar, expediente,
 * arquitecto, tribunal). Como además solo hay UN titular activo a la vez, no
 * hace falta ni seleccionarlo: se toca el botón y se clasifica el que está
 * cayendo. Es menos gesto que arrastrar, no más.
 *
 * ─────────────── EL RELOJ LO LLEVA LA ANIMACIÓN ───────────────
 *
 * La caída es una animación CSS y el archivado se dispara con su
 * `animationend`, no con un setTimeout. Si el estudiante cambia de pestaña, la
 * animación se detiene y el titular NO se pierde: el dibujo y el reloj son el
 * mismo, así que no pueden discrepar.
 *
 * ─────────────── DOS ETAPAS, DOS COSAS DISTINTAS ───────────────
 *
 *   Etapa 1 · clasificar los ocho titulares ............ 80% (10% cada uno)
 *   Etapa 2 · comparar el tamaño de las brechas ........ 20%
 *
 * La segunda no es más de lo mismo: clasificar pide reconocer de qué problema
 * habla un titular; comparar brechas pide restar y ordenar. Es la diferencia
 * entre saber qué es cada cosa y saber cuál aprieta más.
 *
 * CUENTA EL PRIMER INTENTO en las dos. Un titular corregido al segundo intento
 * da su explicación pero puntúa como fallo — si no, bastaría con probar dos
 * botones en cada uno.
 *
 * EL BANCO SE SORTEA: dieciséis titulares, dos por problema, y cada ronda toma
 * uno de cada pareja. Los ocho problemas salen siempre, pero no con las mismas
 * palabras.
 */

/*
 * Segundos de caída, de aparición a línea de archivo.
 *
 * ESTUVO EN 6 Y ERA INJUGABLE: no daba tiempo ni a leer el titular, menos a
 * decidir. Los titulares del profesor son frases largas con cifras dentro
 * —"El déficit fiscal se proyecta en 9,4% del PIB para 2027, frente a una meta
 * de 4,5%"— y clasificar exige leerlas enteras.
 *
 * 30 es el suelo acordado, no el número final: sigue siendo un punto de
 * calibración y se ajustará cuando haya estudiantes usándolo.
 */
const SEGUNDOS_CAIDA = 30;

/* La línea de archivo, en % de altura desde abajo. */
const LINEA_ARCHIVO = 15;

/* Alto aproximado del naipe: lo que se descuenta para que cruce con su base. */
const ALTO_NAIPE = 64;

const CSS = `
@keyframes fae-dv-caer { from { transform: translateY(0); } to { transform: translateY(var(--fae-dv-recorrido)); } }
@keyframes fae-dv-acierto { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.12); } }
.fae-dv-acierto { animation: fae-dv-acierto 420ms ease-out forwards; }
@keyframes fae-dv-rebote { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-9px); } 75% { transform: translateX(9px); } }
.fae-dv-rebote { animation: fae-dv-rebote 400ms ease-in-out; }
@keyframes fae-dv-pulso { 0%,100% { box-shadow: 0 0 0 0 rgba(42,157,143,0); } 50% { box-shadow: 0 0 0 6px rgba(42,157,143,0.4); } }
.fae-dv-pulso { animation: fae-dv-pulso 480ms ease-out; }
@keyframes fae-dv-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-dv-entrar { animation: fae-dv-entrar 380ms ease-out both; }
/* La textura de circuito de la consola, muy tenue. */
.fae-dv-consola {
  background-image:
    linear-gradient(rgba(203,220,242,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(203,220,242,0.045) 1px, transparent 1px);
  background-size: 26px 26px;
}
@media (prefers-reduced-motion: reduce) {
  .fae-dv-acierto, .fae-dv-rebote, .fae-dv-pulso, .fae-dv-entrar { animation: none !important; }
}
`;

export default function DiagnosticoEnVivo({ onCompletar }) {
  const [orden, setOrden] = useState(() => barajar(sortearTitulares()));
  /* Etapa 2: null mientras no se ha respondido. */
  const [brecha, setBrecha] = useState(null);
  const [i, setI] = useState(0);
  /* id -> true si acertó al primer intento */
  const [primeros, setPrimeros] = useState({});
  const [intentos, setIntentos] = useState(0);      // del titular actual
  const [aviso, setAviso] = useState(null);         // { ok, texto }
  const [efecto, setEfecto] = useState(null);       // "acierto" | "fallo"
  const [pulsando, setPulsando] = useState(null);   // id de botón que late
  const [historial, setHistorial] = useState([]);
  /*
   * El detalle por ítem, que viaja al servidor al terminar. Se acumula aquí en
   * vez de derivarse de `historial` porque hace falta guardar QUÉ eligió, no
   * solo si acertó: "confunde fiscal con exterior" es lo que un docente puede
   * llevar a clase, y "falló el titular 3" no.
   *
   * Los ids son los del banco —t1a…t8b— más `brecha` para la etapa 2.
   * Verificado que no chocan entre sí: 17 ids, ningún duplicado.
   */
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const pista = useRef(null);
  /*
   * El recorrido se MIDE. En translateY los porcentajes son relativos a la
   * altura del propio elemento, no a la del contenedor, así que calcularlo con
   * porcentajes daba una caída que no llegaba a la línea.
   */
  const [recorrido, setRecorrido] = useState(0);
  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return;
    const medir = () => {
      const alto = nodo.getBoundingClientRect().height;
      /* Del borde superior del naipe (top: 10px) hasta la línea de archivo. */
      setRecorrido(Math.max(0, alto * (1 - LINEA_ARCHIVO / 100) - 10 - ALTO_NAIPE));
    };
    medir();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(nodo);
    return () => ro.disconnect();
  }, []);

  const actual = orden[i];
  const terminado = i >= orden.length;
  /*
   * Se cuenta sobre los OCHO sorteados, no sobre el banco de dieciséis: el
   * estudiante solo vio ocho.
   */
  const aciertos = orden.filter((t) => primeros[t.id]).length;

  /* 80% la clasificación, 20% la comparación de brechas. */
  const pctEtapa1 = (aciertos / orden.length) * 80;
  const pctEtapa2 = brecha && BRECHAS.find((b) => b.id === brecha)?.correcta ? 20 : 0;
  const pct = Math.round(pctEtapa1 + pctEtapa2);

  /* El juego cierra al responder la etapa 2, no al acabar los titulares. */
  useEffect(() => {
    if (!brecha) return;
    /*
     * La etapa 2 es otro ítem más, con otra forma —no es un titular— y por eso
     * esta actividad es la que valida el canal: si el esquema aguanta las dos
     * formas en una sola partida, aguanta las demás.
     */
    const items = [
      ...detalle.current,
      {
        item: "brecha",
        ok: BRECHAS.find((b) => b.id === brecha)?.correcta === true,
        intentos: 1,
        respuesta: brecha,
        orden: detalle.current.length + 1,
      },
    ];
    onCompletar?.(pct, Date.now() - inicio.current, items);
  }, [brecha]);

  /*
   * ═══════════ UN TITULAR SE CIERRA UNA SOLA VEZ ═══════════
   *
   * Fallo visto en producción: `t3a` dos veces en la misma partida, en los
   * órdenes 2 y 3 —la primera con ok:false e intentos:2, la segunda con
   * ok:true e intentos:1—, y uno de los ocho titulares que nunca apareció.
   *
   * No era el sorteo. Entre cerrar un titular y pasar al siguiente hay 260 ms
   * (430 si acertó) en los que ESE MISMO titular sigue en pantalla. Tras un
   * segundo fallo o tras archivarse, nada bloqueaba los botones en ese hueco:
   * un toque más —y el aviso acababa de decir cuál era el problema— lo cerraba
   * OTRA VEZ con ok:true e intentos:1. Cada cierre programa su propio avance,
   * así que el índice saltaba dos y el titular siguiente no salía nunca. Si ese
   * toque de más era un fallo, no duplicaba nada pero dejaba `intentos` en 1, y
   * el titular siguiente empezaba ya con "te queda un intento": acertarlo a la
   * primera se registraba como ok:false, intentos:2.
   *
   * El cierre se apunta POR ID y es idempotente. Mientras el titular cerrado
   * sigue en pantalla, clasificar y archivar no hacen nada y los botones se
   * desactivan. Lo prueba unicidad-partida.test.mjs, que juega la actividad
   * tocando a destiempo a propósito.
   */
  const cerrados = useRef(new Set());
  const cerradoActual = !!actual && cerrados.current.has(actual.id);

  /* Cierra el titular actual y pasa al siguiente. Una sola vez por titular. */
  const cerrar = (idTitular, acertoPrimero, textoAviso, ok, eleccion = null) => {
    if (cerrados.current.has(idTitular)) return;
    cerrados.current.add(idTitular);
    detalle.current.push({
      item: idTitular,
      ok: acertoPrimero,
      intentos: intentos + 1,
      respuesta: eleccion,
      orden: detalle.current.length + 1,
    });
    setPrimeros((p) => ({ ...p, [idTitular]: acertoPrimero }));
    setHistorial((h) => [...h, { id: idTitular, ok, texto: textoAviso }]);
    setAviso({ ok, texto: textoAviso });
    setIntentos(0);
    setEfecto(ok ? "acierto" : null);
    setTimeout(() => { setEfecto(null); setI((n) => n + 1); }, ok ? 430 : 260);
  };

  const clasificar = (problemaId) => {
    /* Un titular ya cerrado sigue en pantalla unos milisegundos: no se vuelve a clasificar. */
    if (!actual || efecto === "acierto" || cerrados.current.has(actual.id)) return;
    const r = retroalimentacion(actual.problema, problemaId);
    setPulsando(problemaId);
    setTimeout(() => setPulsando(null), 500);

    if (r.ok) {
      cerrar(actual.id, intentos === 0, r.texto, true, problemaId);
      return;
    }

    /* Falla: se avisa y se le deja UNA oportunidad más antes de la línea. */
    setAviso(r);
    setEfecto("fallo");
    setTimeout(() => setEfecto(null), 420);
    const siguienteIntento = intentos + 1;
    setIntentos(siguienteIntento);
    if (siguienteIntento >= 2) cerrar(actual.id, false, r.texto, false, problemaId);
  };

  /* El titular cruzó la línea sin clasificar. */
  const archivar = () => {
    if (!actual || cerrados.current.has(actual.id)) return;
    /* Se le fue por la línea: no eligió nada, y eso es dato distinto de fallar. */
    cerrar(actual.id, false, textoArchivado(actual.problema), false, null);
  };

  const reiniciar = () => {
    setOrden(barajar(sortearTitulares()));
    setI(0); setPrimeros({}); setIntentos(0); setAviso(null);
    setEfecto(null); setHistorial([]); setBrecha(null);
    detalle.current = [];
    cerrados.current = new Set();
    inicio.current = Date.now();
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* ───────────────────────── la consola ───────────────────────── */}
      <div
        ref={pista}
        className="fae-dv-consola"
        style={{
          position: "relative", overflow: "hidden",
          height: "clamp(230px, 34vh, 300px)", borderRadius: "18px",
          background: `linear-gradient(160deg, ${FAE.navy}55, rgba(10,20,34,0.75))`,
          border: "1px solid rgba(248,249,250,0.14)", marginBottom: "12px",
        }}
      >
        {/* La línea de archivo. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, right: 0, bottom: `${LINEA_ARCHIVO}%`,
            borderTop: `2px dashed ${FAE.coral}`, opacity: 0.75,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute", right: "10px", bottom: `calc(${LINEA_ARCHIVO}% + 6px)`,
            display: "inline-flex", alignItems: "center", gap: "5px",
            fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700,
            letterSpacing: "0.12em", color: FAE.coral,
          }}
        >
          <FolderClosed size={11} /> ARCHIVO
        </span>

        {actual ? (
          <div
            key={actual.id}
            onAnimationEnd={(e) => { if (e.animationName === "fae-dv-caer") archivar(); }}
            className={efecto === "acierto" ? "fae-dv-acierto" : efecto === "fallo" ? "fae-dv-rebote" : undefined}
            style={{
              position: "absolute", top: "10px", left: "50%",
              width: "min(84%, 420px)", marginLeft: "min(-42%, -210px)",
              padding: "13px 15px", borderRadius: "12px",
              background: "#28313F",
              border: `1px solid ${efecto === "fallo" ? FAE.coral : efecto === "acierto" ? FAE.teal : "rgba(248,249,250,0.22)"}`,
              color: FAE.text, fontSize: "13.5px", lineHeight: 1.45,
              /* La caída es la animación, y su fin es el archivado. */
              "--fae-dv-recorrido": `${recorrido}px`,
              animation:
                efecto === "acierto" || recorrido === 0
                  ? undefined
                  : `fae-dv-caer ${SEGUNDOS_CAIDA}s linear forwards`,
            }}
          >
            {actual.texto}
          </div>
        ) : (
          <div className="fae-dv-entrar" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(26px, 5vw, 36px)", color: FAE.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {aciertos} de {orden.length}
            </p>
          </div>
        )}
      </div>

      {/* El aviso de la jugada. */}
      <div style={{ minHeight: "44px", marginBottom: "12px" }} aria-live="polite">
        {aviso && (
          <p
            className="fae-dv-entrar"
            style={{
              fontSize: "13.5px", lineHeight: 1.55, margin: 0,
              padding: "10px 13px", borderRadius: "12px",
              background: aviso.ok ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
              border: `1px solid ${aviso.ok ? FAE.teal : FAE.coral}55`,
              color: "rgba(248,249,250,0.88)",
            }}
          >
            {aviso.texto}
          </p>
        )}
      </div>

      {/* ───────────────────────── los ocho botones ───────────────────────── */}
      {!terminado ? (
        <>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 9px" }}>
            Titular {i + 1} de {orden.length}
            {intentos === 1 && <span style={{ color: FAE.coral }}> · te queda un intento</span>}
          </p>
          {/*
            En móvil son dos columnas: ocho botones en fila serían ilegibles, y
            con el pulgar hay que poder acertar sin apuntar.
          */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: "8px" }}>
            {PROBLEMAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => clasificar(p.id)}
                /* Mientras el titular ya cerrado sigue en pantalla, ningún botón lo reabre. */
                disabled={cerradoActual}
                className={pulsando === p.id ? "fae-dv-pulso" : undefined}
                aria-label={`Clasificar como ${p.nombre}`}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 13px", borderRadius: "13px", cursor: cerradoActual ? "default" : "pointer",
                  background: "rgba(248,249,250,0.04)",
                  border: "1px solid rgba(248,249,250,0.14)",
                  color: FAE.text, fontFamily: "Sora, sans-serif",
                  fontSize: "12.5px", fontWeight: 600, textAlign: "left", lineHeight: 1.25,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: "15px", flexShrink: 0 }}>{p.icono}</span>
                {p.boton}
              </button>
            ))}
          </div>
        </>
      ) : !brecha ? (
        /* ─────────────── Etapa 2 · comparar las brechas ─────────────── */
        <div className="fae-dv-entrar">
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 6px" }}>
            ETAPA 2 DE 2
          </p>
          <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.55)", margin: "0 0 14px" }}>
            {aciertos} de {orden.length} clasificados bien a la primera. Queda una pregunta.
          </p>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(15px, 2.3vw, 18px)", lineHeight: 1.45, color: FAE.text, margin: "0 0 14px" }}>
            {PREGUNTA_BRECHA}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "9px" }}>
            {BRECHAS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBrecha(b.id)}
                aria-label={`${b.etiqueta}: ${b.detalle}`}
                style={{
                  textAlign: "left", padding: "13px 14px", borderRadius: "13px", cursor: "pointer",
                  background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)",
                  color: FAE.text, fontFamily: "Inter, sans-serif",
                }}
              >
                <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>
                  {b.etiqueta}
                </span>
                <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.6)", lineHeight: 1.4 }}>
                  {b.detalle}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <CierreConResumen
          onReiniciar={reiniciar}
          texto={
            <>
              <p style={{ margin: "0 0 8px" }}>
                {aciertos} de {orden.length} clasificados bien a la primera. Cuenta el primer intento: acertar
                después de fallar enseña igual, pero no es lo mismo que reconocerlo de entrada.
              </p>
              <p style={{ margin: 0 }}>{BRECHAS.find((b) => b.id === brecha)?.feedback}</p>
            </>
          }
        >
        <div className="fae-dv-entrar">
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 12px" }}>
            {aciertos} de {orden.length} clasificados bien a la primera. Cuenta el primer intento: acertar
            después de fallar enseña igual, pero no es lo mismo que reconocerlo de entrada.
          </p>

          {/* El veredicto de la etapa 2, con su texto literal. */}
          <p
            aria-label={`Etapa 2: ${BRECHAS.find((b) => b.id === brecha)?.correcta ? "correcto" : "incorrecto"}`}
            style={{
              fontSize: "13.5px", lineHeight: 1.55, margin: "0 0 16px",
              padding: "10px 13px", borderRadius: "12px",
              background: pctEtapa2 ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
              border: `1px solid ${pctEtapa2 ? FAE.teal : FAE.coral}55`,
              color: "rgba(248,249,250,0.88)",
            }}
          >
            {BRECHAS.find((b) => b.id === brecha)?.feedback}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "16px" }}>
            {historial.filter((h) => !h.ok).map((h, k) => (
              <p key={k} style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.62)", margin: 0, paddingLeft: "11px", borderLeft: `2px solid ${FAE.coral}` }}>
                {h.texto}
              </p>
            ))}
          </div>

          <button
            type="button"
            onClick={reiniciar}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
              padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
              color: "rgba(248,249,250,0.7)",
            }}
          >
            <RotateCcw size={14} /> Otra ronda
          </button>
        </div>
        </CierreConResumen>
      )}
    </div>
  );
}
