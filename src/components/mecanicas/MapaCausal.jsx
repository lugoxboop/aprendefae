import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { FAE } from "../../theme.js";

/*
 * Constructor de mapa causal.
 *
 * El estudiante arma la red completa desde cero: toca un nodo, toca otro, y se
 * dibuja una flecha dirigida. Una sola verificación, sin reintento.
 *
 * Nota de color: la guía de marca reserva el navy para texto y nodos sin
 * resolver, pero el sitio tiene fondo navy, así que sobre este tema el papel
 * de "tinta neutra" lo hace el neutro claro. Teal para acertado y coral para
 * errado se mantienen tal cual.
 *
 * Los nodos son HTML en una rejilla y las flechas un SVG superpuesto: así el
 * texto largo envuelve y se lee bien en móvil, cosa que el texto dentro de SVG
 * no permite. Las posiciones no se arrastran, las decide la rejilla.
 */

const ORIGEN = { id: "N0", texto: "Baja el precio de las hamburguesas" };

const BANCO = [
  { id: "N1", texto: "Aumentan las ventas diarias" },
  { id: "N2", texto: "El margen de ganancia por unidad se reduce" },
  { id: "N3", texto: "Se necesita comprar más insumos por día" },
  { id: "N4", texto: "Aumenta el tiempo de espera en caja y cocina" },
  { id: "N5", texto: "Baja la calidad percibida del servicio" },
  { id: "N6", texto: "Clientes antiguos se quejan y reducen su frecuencia de visita" },
  { id: "N7", texto: "Aparecen reseñas negativas en redes sociales" },
  { id: "N8", texto: "Contratan personal temporal con poca experiencia" },
  { id: "N9", texto: "Aumenta el costo de nómina" },
  { id: "N10", texto: "Las ventas empiezan a bajar de nuevo" },
  { id: "D1", texto: "El clima en Bogotá cambia" },
  { id: "D2", texto: "Sube el precio internacional de la carne" },
];

const NODOS = [ORIGEN, ...BANCO];
const TEXTO = Object.fromEntries(NODOS.map((n) => [n.id, n.texto]));

/* Nodos fuera de la frontera del sistema: no tienen ninguna conexión correcta. */
const SENUELOS = new Set(["D1", "D2"]);

const LOOP = { de: "N10", a: "N1" };

/* Mapa de referencia. El cierre del loop va aparte por su peso pedagógico. */
const REFERENCIA = [
  { de: "N0", a: "N1" },
  { de: "N0", a: "N2" },
  { de: "N1", a: "N3" },
  { de: "N1", a: "N4" },
  { de: "N4", a: "N5" },
  { de: "N5", a: "N6" },
  { de: "N5", a: "N7" },
  { de: "N4", a: "N8" },
  { de: "N8", a: "N9" },
  { de: "N6", a: "N10" },
  { de: "N7", a: "N10" },
  LOOP,
];

const clave = (de, a) => `${de}->${a}`;
const REFERENCIA_SET = new Set(REFERENCIA.map((c) => clave(c.de, c.a)));
const esLoop = (c) => c.de === LOOP.de && c.a === LOOP.a;

const MINIMO_CONEXIONES = 5;
const PUNTAJE_MAXIMO = 14; // 11 normales + 3 del loop

/*
 * Clasifica una conexión del estudiante. La regla de sentido invertido se
 * deduce comparando contra el mapa de referencia, no con un texto por par.
 */
function evaluar(conexion) {
  const { de, a } = conexion;
  if (REFERENCIA_SET.has(clave(de, a))) {
    if (esLoop(conexion)) {
      return {
        estado: "loop",
        puntos: 3,
        mensaje:
          "🎯 Esta es la conexión que casi nadie ve. Le diste la vuelta completa: lo que empezó como una idea para vender más terminó mordiéndose la cola. Así es el pensamiento sistémico — las cosas no se quedan quietas, regresan.",
      };
    }
    return {
      estado: "correcta",
      puntos: 1,
      mensaje: "✅ Bien visto — de ahí sí sale eso.",
    };
  }

  if (SENUELOS.has(de) || SENUELOS.has(a)) {
    return {
      estado: "senuelo",
      puntos: -0.5,
      mensaje:
        "❌ Esa ficha ni siquiera está en la fila — no tiene nada que ver con este caso.",
    };
  }

  if (REFERENCIA_SET.has(clave(a, de))) {
    return {
      estado: "invertida",
      puntos: -0.5,
      mensaje: `❌ Pusiste la ficha al revés: ¿${TEXTO[de]} empuja a ${TEXTO[a]}, o es ${TEXTO[a]} quien empuja a ${TEXTO[de]}?`,
    };
  }

  return {
    estado: "sin-relacion",
    puntos: -0.5,
    mensaje: "❌ Ahí no vemos que una ficha empuje a la otra. Piénsalo de nuevo.",
  };
}

const COLOR_ESTADO = {
  correcta: FAE.teal,
  loop: FAE.teal,
  senuelo: FAE.coral,
  invertida: FAE.coral,
  "sin-relacion": FAE.coral,
};

/* Punto donde la recta hacia (hx,hy) sale del rectángulo del nodo. */
function bordeDelNodo(r, hx, hy) {
  const dx = hx - r.cx;
  const dy = hy - r.cy;
  if (dx === 0 && dy === 0) return { x: r.cx, y: r.cy };
  const escala = Math.min(
    Math.abs(dx) < 1e-6 ? Infinity : r.w / 2 / Math.abs(dx),
    Math.abs(dy) < 1e-6 ? Infinity : r.h / 2 / Math.abs(dy)
  );
  return { x: r.cx + dx * escala, y: r.cy + dy * escala };
}

export default function MapaCausal({ onCompletar }) {
  const [conexiones, setConexiones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [resultado, setResultado] = useState(null); // null hasta verificar
  const [pos, setPos] = useState({});

  const contenedor = useRef(null);
  const nodoRefs = useRef({});

  /* Posiciones reales de cada tarjeta, para poder trazar las flechas encima. */
  const medir = useCallback(() => {
    const cont = contenedor.current;
    if (!cont) return;
    const base = cont.getBoundingClientRect();
    const siguiente = {};
    for (const [id, el] of Object.entries(nodoRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      siguiente[id] = {
        cx: r.left - base.left + r.width / 2,
        cy: r.top - base.top + r.height / 2,
        w: r.width,
        h: r.height,
      };
    }
    setPos(siguiente);
  }, []);

  useLayoutEffect(() => {
    medir();
    const ro = new ResizeObserver(medir);
    if (contenedor.current) ro.observe(contenedor.current);
    Object.values(nodoRefs.current).forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", medir);
    return () => { ro.disconnect(); window.removeEventListener("resize", medir); };
  }, [medir]);

  const verificado = resultado !== null;

  const tocarNodo = (id) => {
    if (verificado) return;
    if (seleccion === null) { setSeleccion(id); return; }
    if (seleccion === id) { setSeleccion(null); return; }
    const yaExiste = conexiones.some((c) => c.de === seleccion && c.a === id);
    if (!yaExiste) setConexiones((prev) => [...prev, { de: seleccion, a: id }]);
    setSeleccion(null);
  };

  const deshacer = () => {
    if (verificado) return;
    setConexiones((prev) => prev.slice(0, -1));
    setSeleccion(null);
  };

  const verificar = () => {
    if (verificado || conexiones.length < MINIMO_CONEXIONES) return;

    const evaluadas = conexiones.map((c) => ({ ...c, ...evaluar(c) }));
    const bruto = evaluadas.reduce((suma, c) => suma + c.puntos, 0);
    const porcentaje = Math.max(0, Math.min(1, bruto / PUNTAJE_MAXIMO)) * 100;

    const hechas = new Set(conexiones.map((c) => clave(c.de, c.a)));
    const faltantes = REFERENCIA.filter((c) => !hechas.has(clave(c.de, c.a)));

    setResultado({ evaluadas, faltantes, bruto, porcentaje });
    setSeleccion(null);
    onCompletar?.(porcentaje);
  };

  /* Flechas a dibujar: las del estudiante y, tras verificar, las que faltaron. */
  const flechas = [];
  const fuente = verificado ? resultado.evaluadas : conexiones;
  for (const c of fuente) {
    const a = pos[c.de];
    const b = pos[c.a];
    if (!a || !b) continue;
    const p1 = bordeDelNodo(a, b.cx, b.cy);
    const p2 = bordeDelNodo(b, a.cx, a.cy);
    flechas.push({
      id: clave(c.de, c.a),
      p1, p2,
      color: verificado ? COLOR_ESTADO[c.estado] : "rgba(248,249,250,0.55)",
      punteada: false,
    });
  }
  if (verificado) {
    for (const c of resultado.faltantes) {
      const a = pos[c.de];
      const b = pos[c.a];
      if (!a || !b) continue;
      flechas.push({
        id: "falta-" + clave(c.de, c.a),
        p1: bordeDelNodo(a, b.cx, b.cy),
        p2: bordeDelNodo(b, a.cx, a.cy),
        color: "rgba(248,249,250,0.34)",
        punteada: true,
      });
    }
  }

  const tarjetaNodo = (n, destacado) => {
    const activo = seleccion === n.id;
    return (
      <button
        key={n.id}
        type="button"
        ref={(el) => { nodoRefs.current[n.id] = el; }}
        onClick={() => tocarNodo(n.id)}
        disabled={verificado}
        aria-pressed={activo}
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "left",
          fontFamily: "Inter, sans-serif",
          fontSize: "13.5px",
          lineHeight: 1.4,
          padding: "12px 14px",
          borderRadius: "13px",
          cursor: verificado ? "default" : "pointer",
          background: activo ? "rgba(248,249,250,0.16)" : destacado ? "rgba(248,249,250,0.09)" : "rgba(248,249,250,0.045)",
          border: `1.5px solid ${activo ? FAE.text : "rgba(248,249,250,0.2)"}`,
          color: FAE.text,
          minHeight: "62px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {n.texto}
      </button>
    );
  };

  return (
    <div>
      <div
        ref={contenedor}
        style={{
          position: "relative",
          borderRadius: "18px",
          background: "rgba(248,249,250,0.03)",
          border: "1px solid rgba(248,249,250,0.1)",
          padding: "clamp(14px, 2.5vw, 22px)",
          marginBottom: "14px",
        }}
      >
        {/* capa de flechas, por debajo de las tarjetas */}
        <svg
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
        >
          <defs>
            {["neutro", "teal", "coral", "gris"].map((k) => (
              <marker key={k} id={`mc-${k}`} viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="9" markerHeight="9" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill={
                  k === "teal" ? FAE.teal : k === "coral" ? FAE.coral :
                  k === "gris" ? "rgba(248,249,250,0.34)" : "rgba(248,249,250,0.55)"
                } />
              </marker>
            ))}
          </defs>
          {flechas.map((f) => {
            const marcador = f.punteada ? "gris"
              : f.color === FAE.teal ? "teal"
              : f.color === FAE.coral ? "coral" : "neutro";
            return (
              <line
                key={f.id}
                x1={f.p1.x} y1={f.p1.y} x2={f.p2.x} y2={f.p2.y}
                stroke={f.color}
                strokeWidth={f.punteada ? 1.6 : 2}
                strokeDasharray={f.punteada ? "5 5" : "none"}
                markerEnd={`url(#mc-${marcador})`}
              />
            );
          })}
        </svg>

        {/* nodo origen, fijo arriba */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
          <div style={{ width: "min(100%, 320px)", display: "grid" }}>{tarjetaNodo(ORIGEN, true)}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
          {BANCO.map((n) => tarjetaNodo(n, false))}
        </div>
      </div>

      {/* panel inferior */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
        <span style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.7)" }}>
          Conexiones hechas: <strong style={{ color: FAE.text }}>{conexiones.length}</strong>
        </span>
        {!verificado && conexiones.length > 0 && (
          <button
            type="button"
            onClick={deshacer}
            style={{
              fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
              padding: "8px 14px", borderRadius: "999px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
              color: "rgba(248,249,250,0.7)",
            }}
          >
            Deshacer última
          </button>
        )}
        <button
          type="button"
          onClick={verificar}
          disabled={verificado || conexiones.length < MINIMO_CONEXIONES}
          style={{
            fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
            padding: "11px 20px", borderRadius: "999px", border: "none",
            cursor: !verificado && conexiones.length >= MINIMO_CONEXIONES ? "pointer" : "default",
            backgroundColor: !verificado && conexiones.length >= MINIMO_CONEXIONES ? FAE.teal : "rgba(248,249,250,0.08)",
            color: !verificado && conexiones.length >= MINIMO_CONEXIONES ? FAE.bg : "rgba(248,249,250,0.42)",
          }}
        >
          {verificado ? "Mapa verificado" : "Verificar mapa"}
        </button>
        {!verificado && conexiones.length < MINIMO_CONEXIONES && (
          <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)" }}>
            Necesitas al menos {MINIMO_CONEXIONES} conexiones.
          </span>
        )}
      </div>

      {seleccion && !verificado && (
        <p style={{ fontSize: "13.5px", color: FAE.text, margin: "0 0 16px" }}>
          Origen elegido: <strong>{TEXTO[seleccion]}</strong>. Ahora toca el nodo al que lleva.
        </p>
      )}

      {verificado && (
        <div
          style={{
            borderRadius: "16px",
            background: "rgba(248,249,250,0.04)",
            border: "1px solid rgba(248,249,250,0.12)",
            padding: "18px 20px",
          }}
        >
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", margin: "0 0 4px", color: FAE.text }}>
            Revisión del mapa
          </p>
          <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.6)", margin: "0 0 14px" }}>
            Puntaje {resultado.bruto} de {PUNTAJE_MAXIMO} · {Math.round(resultado.porcentaje)}% de acierto
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {resultado.evaluadas.map((c) => (
              <p
                key={clave(c.de, c.a)}
                style={{
                  fontSize: "13.5px", lineHeight: 1.55, margin: 0,
                  paddingLeft: "12px",
                  borderLeft: `2px solid ${COLOR_ESTADO[c.estado]}`,
                  color: "rgba(248,249,250,0.82)",
                }}
              >
                {c.mensaje}
              </p>
            ))}
          </div>

          {resultado.faltantes.length > 0 && (
            <>
              <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.6)", margin: "18px 0 8px" }}>
                Conexiones clave que no hiciste, marcadas en el mapa con línea punteada:
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {resultado.faltantes.map((c) => (
                  <li key={clave(c.de, c.a)} style={{ fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.7)", marginBottom: "5px" }}>
                    {TEXTO[c.de]} → {TEXTO[c.a]}
                    {esLoop(c) && <strong style={{ color: FAE.teal }}> (el cierre del loop)</strong>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
