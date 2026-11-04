import { COLORES, V } from "../../vivo/estilo.js";
import { LETRAS } from "../../vivo/datos.js";

/*
 * Las piezas que comparten el tablero y el celular: la pregunta, las opciones
 * (con barras cuando ya hay resultados) y la barra del reloj.
 */

export function Enunciado({ pregunta, grande = false }) {
  if (!pregunta) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: grande ? "12px" : "8px" }}>
      {(pregunta.rotulo || pregunta.subtema) && (
        <span className="vivo-cejilla" style={{ color: V.dato }}>{[pregunta.rotulo, pregunta.subtema].filter(Boolean).join(" · ")}</span>
      )}
      <h2 className="vivo-titulo" data-vivo-enunciado style={{ fontSize: grande ? "clamp(24px, 3.4vw, 40px)" : "clamp(19px, 5vw, 23px)", lineHeight: 1.25 }}>
        {pregunta.enunciado}
      </h2>
      {pregunta.detalle?.texto && (
        <p className="vivo-nota" style={{ fontSize: grande ? "18px" : "14.5px" }}>
          {pregunta.detalle.rotulo ? <b style={{ color: V.texto }}>{pregunta.detalle.rotulo}: </b> : null}{pregunta.detalle.texto}
        </p>
      )}
      {pregunta.pregunta && <p className="vivo-nota" style={{ fontSize: grande ? "17px" : "14px", color: V.dato }}>{pregunta.pregunta}</p>}
    </div>
  );
}

/**
 * Las opciones. Sin `alElegir` son solo para mirar (el tablero). Con `conteo`
 * y `correcta` muestran barras y marcan la correcta.
 */
export function Opciones({ pregunta, alElegir = null, elegida = null, correcta = null, conteo = null, grande = false, bloqueadas = false }) {
  if (!pregunta) return null;
  const total = conteo ? Object.values(conteo).reduce((a, b) => a + b, 0) : 0;
  return (
    <div className="vivo-opciones" role={alElegir ? "group" : undefined} aria-label={alElegir ? "Opciones" : undefined}
      style={grande ? { gap: "14px" } : undefined}>
      {pregunta.opciones.map((o, k) => {
        const color = COLORES[k % COLORES.length];
        const n = conteo?.[o.id] ?? 0;
        const parte = total ? n / total : 0;
        const esCorrecta = correcta != null && o.id === correcta;
        const apagada = (correcta != null && !esCorrecta) || (elegida != null && correcta == null && elegida !== o.id);
        const clase = ["vivo-opcion", "vivo-entra", apagada ? "vivo-opcion--apagada" : "", esCorrecta ? "vivo-opcion--correcta" : ""].filter(Boolean).join(" ");
        const cuerpo = (
          <>
            {conteo && <span className="vivo-barra" aria-hidden="true" style={{ "--parte": parte, background: `${color}${esCorrecta ? "55" : "40"}` }} />}
            <span className="vivo-letra" aria-hidden="true" style={{ background: color, position: "relative", ...(grande ? { width: "52px", height: "52px", fontSize: "24px", borderRadius: "14px" } : null) }}>{LETRAS[k]}</span>
            <span className="vivo-opcion__texto" style={grande ? { fontSize: "clamp(18px, 2vw, 24px)" } : undefined}>
              <span className="sr-solo" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Opción {LETRAS[k]}: </span>
              {o.texto}
              {esCorrecta && <span style={{ display: "block", marginTop: "2px", fontSize: "13px", fontWeight: 700, color: V.teal }}>Respuesta correcta</span>}
              {elegida === o.id && correcta != null && !esCorrecta && <span style={{ display: "block", marginTop: "2px", fontSize: "13px", fontWeight: 600, color: V.coral }}>Tu respuesta</span>}
            </span>
            {conteo && <span className="vivo-cifra" style={{ fontSize: grande ? "22px" : "16px" }} data-vivo-cifra={o.id}>{n}</span>}
          </>
        );
        const estilo = { animationDelay: `${60 + k * 60}ms`, ...(grande ? { minHeight: "84px", padding: "14px 18px" } : null) };
        return alElegir ? (
          <button key={o.id} type="button" className={clase} style={estilo} data-vivo-opcion={o.id}
            disabled={bloqueadas} aria-pressed={elegida === o.id} onClick={() => alElegir(o.id)}>
            {cuerpo}
          </button>
        ) : (
          <div key={o.id} className={clase} style={estilo} data-vivo-opcion={o.id}>{cuerpo}</div>
        );
      })}
    </div>
  );
}

/** La barra del reloj: se vacía de derecha a izquierda. Ámbar en los últimos 5 s. */
export function Reloj({ restante, duracion }) {
  const parte = duracion ? Math.max(0, Math.min(1, restante / (duracion * 1000))) : 0;
  const segundos = Math.ceil(restante / 1000);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div className="vivo-reloj" style={{ flex: 1 }} aria-hidden="true">
        <span style={{ transform: `scaleX(${parte})`, background: segundos <= 5 ? V.ambar : V.teal }} />
      </div>
      <span data-vivo-segundos style={{ minWidth: "3ch", textAlign: "right", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "18px", fontVariantNumeric: "tabular-nums", color: segundos <= 5 ? V.ambar : V.texto }}
        aria-label={`Quedan ${segundos} segundos`}>
        {segundos}
      </span>
    </div>
  );
}

/** Cifra con separador de miles, como se escriben los puntos en el sitio. */
export const miles = (n) => Number(n ?? 0).toLocaleString("es-CO");

export function Podio({ lista }) {
  if (!lista.length) return <p className="vivo-nota">Nadie respondió todavía.</p>;
  const medallas = [V.ambar, "#C9D3E0", "#D79A6B"];
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", maxWidth: "640px", display: "flex", flexDirection: "column", gap: "10px" }} data-vivo-podio>
      {lista.map((p, k) => (
        <li key={k} className="vivo-entra" style={{ animationDelay: `${(lista.length - k) * 140}ms`, display: "flex", alignItems: "center", gap: "14px",
          padding: k === 0 ? "18px 20px" : "12px 18px", borderRadius: "16px", background: k === 0 ? "rgba(233,196,106,0.12)" : V.panel,
          border: `1px solid ${k < 3 ? medallas[k] + "66" : V.linea}` }}>
          <span style={{ flex: "none", width: k === 0 ? "48px" : "38px", height: k === 0 ? "48px" : "38px", borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: k < 3 ? medallas[k] : V.panel2, color: k < 3 ? "#0B1626" : V.texto, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: k === 0 ? "22px" : "17px" }}>{p.puesto}</span>
          <span style={{ flex: 1, minWidth: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: k === 0 ? "24px" : "18px", overflowWrap: "anywhere" }}>{p.apodo}</span>
          <span style={{ flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            <b style={{ fontFamily: "Sora, sans-serif", fontSize: k === 0 ? "22px" : "17px" }}>{miles(p.puntos)}</b>
            <span style={{ display: "block", fontSize: "12.5px", color: V.dato }}>{p.aciertos} {p.aciertos === 1 ? "acierto" : "aciertos"}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

