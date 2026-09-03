import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { FUERZAS, CASOS, CIERRE, PUNTOS_TOTALES, puntajeRonda } from "../../data/asedio.js";

/*
 * "Asedio Estratégico — Defiende tu Margen".
 *
 * Tres casos reales. En cada uno el estudiante reparte 10 puntos de defensa
 * entre las cinco fuerzas SIN VER todavía cuál es la amenaza real, despliega, y
 * el pentágono le muestra por dónde le entraron.
 *
 * Dos decisiones de diseño que no son adorno:
 *
 *   · No se puede desplegar con puntos sin gastar. Repartir 10 entre 5 fuerzas
 *     obliga a decidir qué NO se defiende, que es justo el ejercicio. Si
 *     sobraran puntos, "por si acaso" sería una respuesta válida y no lo es.
 *
 *   · El daño es PROPORCIONAL, no acierto/fallo. Un flanco que falló por dos
 *     puntos no se ve igual que uno que falló por cinco: el dibujo tiene que
 *     comunicar CUÁNTO te desviaste, porque en Porter la pregunta no es si
 *     acertaste sino cuánto te alejaste de dónde estaba la presión.
 *
 * El tercer caso es el que sostiene el ejercicio: la amenaza no es la
 * competencia sino el comprador. Es el que rompe el reflejo de aplicar la misma
 * plantilla a todo.
 */

/* Geometría del pentágono. Vértice arriba y flancos cada 72°. */
const R_NUCLEO = 30;
const R_ESCUDO = 74;
const CENTRO = 110;

const rad = (grados) => ((grados - 90) * Math.PI) / 180;
const punto = (grados, radio) => ({
  x: CENTRO + Math.cos(rad(grados)) * radio,
  y: CENTRO + Math.sin(rad(grados)) * radio,
});

/* Arco de un flanco: 56° de los 72 que le tocan, para que queden separados. */
function arcoFlanco(i, radio) {
  const centro = i * 72;
  const a = punto(centro - 28, radio);
  const b = punto(centro + 28, radio);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radio} ${radio} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/*
 * Cuánto se agrietó un flanco.
 *   diferencia ≤ 1  aguanta
 *   diferencia ≥ 2  se agrieta, con intensidad creciente hasta el máximo
 */
function estadoFlanco(asignado, ideal) {
  const dif = Math.abs(asignado - ideal);
  if (dif <= 1) return { aguanta: true, intensidad: 0, dif };
  return { aguanta: false, intensidad: Math.min(1, (dif - 1) / 4), dif };
}

const boton = {
  fontFamily: "Sora, sans-serif",
  fontWeight: 600,
  borderRadius: "999px",
  cursor: "pointer",
  border: "none",
};

export default function AsedioEstrategico({ onCompletar }) {
  const [ronda, setRonda] = useState(0);
  const [asignacion, setAsignacion] = useState({});
  const [fase, setFase] = useState("asignar");
  /* Cuántos flancos han reaccionado ya durante el revelado. */
  const [revelados, setRevelados] = useState(0);
  const [historial, setHistorial] = useState([]);
  const inicio = useRef(Date.now());

  const caso = CASOS[ronda];
  const usados = FUERZAS.reduce((s, f) => s + (asignacion[f.id] ?? 0), 0);
  const restantes = PUNTOS_TOTALES - usados;
  const listo = restantes === 0;

  const resultado = useMemo(() => {
    if (fase === "asignar") return null;
    return puntajeRonda(asignacion, caso.ideal);
  }, [fase, asignacion, caso]);

  /* Revelado: los flancos reaccionan de uno en uno, no todos a la vez. */
  useEffect(() => {
    if (fase !== "revelar") return;
    if (revelados >= FUERZAS.length) {
      const t = setTimeout(() => setFase("resultado"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevelados((n) => n + 1), revelados === 0 ? 420 : 380);
    return () => clearTimeout(t);
  }, [fase, revelados]);

  const mover = (id, delta) => {
    setAsignacion((prev) => {
      const actual = prev[id] ?? 0;
      const siguiente = actual + delta;
      if (siguiente < 0) return prev;
      if (delta > 0 && usados >= PUNTOS_TOTALES) return prev;
      return { ...prev, [id]: siguiente };
    });
  };

  const desplegar = () => {
    if (!listo) return;
    setRevelados(0);
    setFase("revelar");
  };

  const siguiente = () => {
    const nuevo = [...historial, { caso: caso.id, pct: resultado.pct, asignacion }];
    setHistorial(nuevo);

    if (ronda < CASOS.length - 1) {
      setRonda(ronda + 1);
      setAsignacion({});
      setRevelados(0);
      setFase("asignar");
      return;
    }

    /* Última ronda: el promedio es lo que va al motor de FP. */
    const promedio = nuevo.reduce((s, r) => s + r.pct, 0) / nuevo.length;
    setFase("final");
    onCompletar?.(promedio, Date.now() - inicio.current);
  };

  const promedioFinal =
    historial.length > 0 ? historial.reduce((s, r) => s + r.pct, 0) / historial.length : 0;

  /* Vuelve a la ronda 1, con los casos en el mismo orden. */
  const reiniciar = () => {
    setHistorial([]);
    setRonda(0);
    setAsignacion({});
    setRevelados(0);
    setFase("asignar");
    inicio.current = Date.now();
  };

  /* Daño acumulado de la ronda, para encoger y apagar el núcleo. */
  const danoNormalizado = resultado ? Math.min(1, resultado.diferencia / 20) : 0;
  const mostrandoDano = fase === "revelar" || fase === "resultado";

  if (fase === "final") {
    return (
      <div style={{ borderRadius: "18px", background: promedioFinal >= 60 ? "rgba(42,157,143,0.07)" : "rgba(231,111,81,0.07)", border: `1px solid ${promedioFinal >= 60 ? FAE.teal : FAE.coral}`, padding: "clamp(20px, 3vw, 30px)" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: promedioFinal >= 60 ? FAE.teal : FAE.coral, margin: "0 0 10px" }}>
          {promedioFinal >= 60 ? "ASEDIO SUPERADO" : "MARGEN COMPROMETIDO"}
        </p>
        <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(30px, 6vw, 44px)", letterSpacing: "-0.03em", margin: "0 0 4px", color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(promedioFinal)}%
        </p>
        <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 18px" }}>
          Margen defendido en promedio, sobre las tres rondas.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {historial.map((r, i) => (
            <div key={r.caso} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13.5px" }}>
              <span style={{ color: "rgba(248,249,250,0.5)", minWidth: "68px" }}>Ronda {i + 1}</span>
              <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden" }}>
                <div style={{ width: `${r.pct}%`, height: "100%", background: r.pct >= 60 ? FAE.teal : FAE.coral, borderRadius: "999px" }} />
              </div>
              <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: FAE.text, minWidth: "44px", textAlign: "right" }}>
                {Math.round(r.pct)}%
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "15px", lineHeight: 1.6, margin: 0, color: "rgba(248,249,250,0.85)", paddingTop: "16px", borderTop: "1px solid rgba(42,157,143,0.28)" }}>
          {CIERRE}
        </p>

        <button
          onClick={reiniciar}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "18px", padding: "10px 16px", borderRadius: "999px", border: "1px solid rgba(248,249,250,0.22)", background: "transparent", color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}
        >
          <RotateCcw size={15} strokeWidth={2.2} />
          Volver a defender
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ---------------- el caso ---------------- */}
      <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)", padding: "16px 18px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: 0 }}>
            RONDA {ronda + 1} DE {CASOS.length}
          </p>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", margin: 0 }}>{caso.titulo}</p>
        </div>
        <p style={{ fontSize: "15.5px", lineHeight: 1.55, margin: 0, color: FAE.text }}>{caso.texto}</p>
      </div>

      {/* ---------------- el pentágono ---------------- */}
      <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.03)", border: "1px solid rgba(248,249,250,0.1)", padding: "12px", marginBottom: "16px" }}>
        <svg viewBox="0 0 220 220" width="100%" style={{ display: "block", maxHeight: "300px", margin: "0 auto" }} role="img"
          aria-label={fase === "asignar" ? "Pentágono de defensa, sin desplegar" : `Resultado: ${Math.round(resultado?.pct ?? 0)}% de margen defendido`}>
          {FUERZAS.map((f, i) => {
            const asignado = asignacion[f.id] ?? 0;
            const yaReveló = mostrandoDano && i < revelados;
            const est = yaReveló ? estadoFlanco(asignado, caso.ideal[f.id]) : null;

            /* Sin desplegar, el grosor del flanco ya adelanta cuánto pusiste ahí. */
            const grosor = 4 + asignado * 1.5;
            const color = !yaReveló ? "rgba(203,220,242,0.4)" : est.aguanta ? FAE.teal : FAE.coral;
            /* Agrietado: el trazo se parte, y cuanto más lejos estuviste, más huecos. */
            const guiones = yaReveló && !est.aguanta
              ? `${Math.max(2, 10 - est.intensidad * 8)} ${3 + est.intensidad * 9}`
              : undefined;
            /* Un flanco roto además cede hacia fuera. */
            const empuje = yaReveló && !est.aguanta ? est.intensidad * 7 : 0;

            const etiqueta = punto(i * 72, R_ESCUDO + 30);

            return (
              <g key={f.id}>
                <path
                  d={arcoFlanco(i, R_ESCUDO + empuje)}
                  fill="none"
                  stroke={color}
                  strokeWidth={grosor}
                  strokeLinecap="round"
                  strokeDasharray={guiones}
                  style={{
                    opacity: yaReveló && !est.aguanta ? 0.45 + (1 - est.intensidad) * 0.5 : 1,
                    filter: yaReveló && est.aguanta ? `drop-shadow(0 0 6px ${FAE.teal})` : "none",
                    transition: "all 420ms cubic-bezier(0.2,0.8,0.3,1)",
                  }}
                />
                <text
                  x={etiqueta.x}
                  y={etiqueta.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "8.5px", fill: yaReveló ? color : "rgba(248,249,250,0.5)", transition: "fill 420ms ease" }}
                >
                  {f.corto}
                </text>
                {yaReveló && (
                  <text
                    x={etiqueta.x}
                    y={etiqueta.y + 10}
                    textAnchor="middle"
                    style={{ fontFamily: "Sora, sans-serif", fontSize: "8px", fontWeight: 700, fill: "rgba(248,249,250,0.55)" }}
                  >
                    {asignado} / {caso.ideal[f.id]}
                  </text>
                )}
              </g>
            );
          })}

          {/* Núcleo: encoge y se apaga con el daño total de la ronda. */}
          <circle
            cx={CENTRO}
            cy={CENTRO}
            r={R_NUCLEO * (1 - (mostrandoDano ? danoNormalizado * (revelados / FUERZAS.length) : 0) * 0.45)}
            fill="rgba(42,157,143,0.16)"
            stroke={FAE.teal}
            strokeWidth="2"
            style={{
              opacity: 1 - (mostrandoDano ? danoNormalizado * (revelados / FUERZAS.length) : 0) * 0.55,
              transition: "all 500ms cubic-bezier(0.2,0.8,0.3,1)",
            }}
          />
          <text x={CENTRO} y={CENTRO - 4} textAnchor="middle" style={{ fontFamily: "Sora, sans-serif", fontSize: "8px", fontWeight: 700, fill: FAE.text }}>
            Rentabilidad
          </text>
          <text x={CENTRO} y={CENTRO + 7} textAnchor="middle" style={{ fontFamily: "Inter, sans-serif", fontSize: "7px", fill: "rgba(248,249,250,0.6)" }}>
            de la empresa
          </text>
        </svg>
      </div>

      {/* ---------------- reparto o resultado ---------------- */}
      {fase === "asignar" ? (
        <>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
            <p style={{ fontSize: "14px", color: "rgba(248,249,250,0.7)", margin: 0 }}>
              Reparte 10 puntos de defensa.
            </p>
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, margin: 0, color: listo ? FAE.teal : FAE.ambar }}>
              {restantes === 0 ? "Listo" : `Quedan ${restantes}`}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
            {FUERZAS.map((f) => {
              const v = asignacion[f.id] ?? 0;
              return (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "12px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.1)" }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: "14px", color: FAE.text }}>{f.nombre}</span>
                  <button type="button" onClick={() => mover(f.id, -1)} disabled={v === 0} aria-label={`Quitar un punto a ${f.nombre}`}
                    style={{ ...boton, width: "30px", height: "30px", fontSize: "17px", background: "rgba(248,249,250,0.08)", color: v === 0 ? "rgba(248,249,250,0.25)" : FAE.text, cursor: v === 0 ? "default" : "pointer" }}>
                    −
                  </button>
                  <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", minWidth: "18px", textAlign: "center", fontVariantNumeric: "tabular-nums", color: v > 0 ? FAE.teal : "rgba(248,249,250,0.35)" }}>
                    {v}
                  </span>
                  <button type="button" onClick={() => mover(f.id, 1)} disabled={restantes === 0} aria-label={`Dar un punto a ${f.nombre}`}
                    style={{ ...boton, width: "30px", height: "30px", fontSize: "17px", background: restantes === 0 ? "rgba(248,249,250,0.05)" : "rgba(42,157,143,0.2)", color: restantes === 0 ? "rgba(248,249,250,0.25)" : FAE.teal, cursor: restantes === 0 ? "default" : "pointer" }}>
                    +
                  </button>
                </div>
              );
            })}
          </div>

          {/*
            Deshabilitado mientras sobren puntos. No es una validación de más:
            repartir los 10 obliga a decidir qué no se defiende.
          */}
          <button type="button" onClick={desplegar} disabled={!listo}
            style={{ ...boton, width: "100%", fontSize: "15px", padding: "14px", backgroundColor: listo ? FAE.teal : "rgba(248,249,250,0.08)", color: listo ? FAE.bg : "rgba(248,249,250,0.4)", cursor: listo ? "pointer" : "default" }}>
            {listo ? "Desplegar defensas" : `Reparte los ${restantes} puntos que quedan`}
          </button>
        </>
      ) : fase === "revelar" ? (
        <p style={{ textAlign: "center", fontSize: "14px", color: "rgba(248,249,250,0.6)", margin: "8px 0 0" }}>
          Midiendo la presión sobre cada flanco…
        </p>
      ) : (
        <>
          <div style={{ borderRadius: "16px", background: resultado.pct >= 60 ? "rgba(42,157,143,0.09)" : "rgba(231,111,81,0.09)", border: `1px solid ${resultado.pct >= 60 ? "rgba(42,157,143,0.35)" : "rgba(231,111,81,0.35)"}`, padding: "16px 18px", marginBottom: "14px" }}>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px", margin: "0 0 2px", color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(resultado.pct)}%
            </p>
            <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.65)", margin: 0 }}>
              del margen defendido en esta ronda.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
            {FUERZAS.map((f) => {
              const asignado = asignacion[f.id] ?? 0;
              const ideal = caso.ideal[f.id];
              const est = estadoFlanco(asignado, ideal);
              return (
                <div key={f.id} style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(248,249,250,0.03)", borderLeft: `3px solid ${est.aguanta ? FAE.teal : FAE.coral}` }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, color: FAE.text }}>{f.nombre}</span>
                    <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: est.aguanta ? FAE.teal : FAE.coral, whiteSpace: "nowrap" }}>
                      pusiste {asignado} · real {ideal}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", lineHeight: 1.5, margin: 0, color: "rgba(248,249,250,0.62)" }}>{caso.porque[f.id]}</p>
                </div>
              );
            })}
          </div>

          <button type="button" onClick={siguiente}
            style={{ ...boton, width: "100%", fontSize: "15px", padding: "14px", backgroundColor: FAE.teal, color: FAE.bg }}>
            {ronda < CASOS.length - 1 ? `Siguiente caso (${ronda + 2} de ${CASOS.length})` : "Ver resultado del asedio"}
          </button>
        </>
      )}
    </div>
  );
}
