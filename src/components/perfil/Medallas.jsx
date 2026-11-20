import { useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import Medalla, { NIVELES, ETIQUETA_NIVEL } from "../shared/Medalla.jsx";
import { cargarLogros, conEstado } from "../../medallas/logros.js";
import { MENTA } from "./estilo-perfil.js";

/*
 * Las medallas del perfil (rediseño del 20-nov, pedido de Mateo: «que las
 * medallas se puedan ver»).
 *
 * Antes eran cuatro bloques con las 24 en fila: a 375 px medían más de dos
 * pantallas y lo ganado se perdía entre lo que falta. Ahora es una colección:
 *
 *   · un anillo con cuántas llevas de las que hoy se pueden ganar;
 *   · pestañas — «Ganadas» primero, y luego cada nivel con su «x de 6»;
 *   · tocar una medalla abre su ficha: qué es y cómo se gana. La descripción
 *     ya estaba en el catálogo y nunca se enseñaba.
 *
 * El criterio de siempre no cambia: las que faltan salen atenuadas, nunca
 * escondidas, y las que no tienen condición lo dicen. Élite sigue sobre navy
 * oscuro, como en el kit.
 *
 * `estado` llega del perfil (que también lo usa para la vitrina de la
 * cabecera); sin él, la sección se carga sola como antes.
 */

export function useMedallas() {
  const [estado, setEstado] = useState({ cargando: true, medallas: [], disponible: false });
  useEffect(() => {
    let vivo = true;
    cargarLogros().then(({ ganadas, disponible }) => {
      if (vivo) setEstado({ cargando: false, medallas: conEstado(ganadas), disponible });
    });
    return () => { vivo = false; };
  }, []);
  return estado;
}

/* Las mejores primero: de élite hacia base, y dentro del nivel, en catálogo. */
export function mejoresGanadas(medallas, n = 4) {
  const peso = (m) => NIVELES.indexOf(m.nivel);
  return medallas.filter((m) => m.obtenida).sort((a, b) => peso(b) - peso(a)).slice(0, n);
}

function estadoDe(m) {
  if (!m.ganable) return { texto: "Aún no disponible", color: FAE.ambar, fondo: "rgba(233,196,106,0.12)" };
  if (m.obtenida) return { texto: "Conseguida", color: MENTA, fondo: "rgba(134,224,195,0.12)" };
  return { texto: "Por conseguir", color: "rgba(248,249,250,0.75)", fondo: "rgba(248,249,250,0.07)" };
}

function Anillo({ ganadas, total }) {
  const r = 27;
  const c = 2 * Math.PI * r;
  const p = total ? ganadas / total : 0;
  return (
    <div className="fae-pf-anillo" role="img" aria-label={`${ganadas} de ${total} medallas que se pueden ganar hoy`}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="fae-pf-anillo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={MENTA} />
            <stop offset="1" stopColor={FAE.teal} />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(248,249,250,0.1)" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="url(#fae-pf-anillo-g)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`} />
      </svg>
      <b aria-hidden="true"><span>{ganadas}<small>de {total}</small></span></b>
    </div>
  );
}

export default function Medallas({ estado: estadoProp = null }) {
  const propio = useMedallas();
  const estado = estadoProp ?? propio;
  const [pestana, setPestana] = useState(null);
  const [elegida, setElegida] = useState(null);

  if (estado.cargando) {
    return <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.6)", margin: 0 }}>Cargando medallas…</p>;
  }

  const todas = estado.medallas;
  const ganadas = todas.filter((m) => m.obtenida);
  const ganables = todas.filter((m) => m.ganable).length;
  const pendientes = todas.length - ganables;

  /* Sin ninguna ganada, «Ganadas» estaría vacía: se abre en Base, que es por donde se empieza. */
  const actual = pestana ?? (ganadas.length ? "ganadas" : "base");
  const lista = actual === "ganadas" ? ganadas : todas.filter((m) => m.nivel === actual);
  const sel = lista.find((m) => m.id === elegida) ?? lista[0] ?? null;

  const pestanas = [
    { id: "ganadas", nombre: "Ganadas", cuenta: String(ganadas.length) },
    ...NIVELES.map((n) => {
      const del = todas.filter((m) => m.nivel === n);
      return { id: n, nombre: ETIQUETA_NIVEL[n], cuenta: `${del.filter((m) => m.obtenida).length}/${del.length}` };
    }),
  ];

  return (
    <section className="fae-pf-tarjeta fae-pf-medallas" data-medallas aria-labelledby="fae-pf-medallas-t">
      <div className="fae-pf-tarjeta-in">
        <div className="fae-pf-med-cab">
          <div style={{ minWidth: 0 }}>
            <p className="fae-pf-ceja">Tu colección</p>
            <h3 id="fae-pf-medallas-t" className="fae-pf-titulo">Medallas</h3>
            <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.62)", margin: "4px 0 0" }}>
              {ganadas.length} de {ganables} que se pueden ganar hoy.
              {pendientes > 0 && ` Otras ${pendientes} esperan a que se defina cómo se ganan.`}
            </p>
          </div>
          <Anillo ganadas={ganadas.length} total={ganables} />
        </div>

        <div className="fae-pf-pestanas" role="tablist" aria-label="Ver medallas">
          {pestanas.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={actual === p.id}
              data-pestana-medallas={p.id}
              className="fae-pf-pestana"
              onClick={() => { setPestana(p.id); setElegida(null); }}
            >
              {p.nombre} <span>{p.cuenta}</span>
            </button>
          ))}
        </div>

        {lista.length === 0 ? (
          <p className="fae-pf-vacio" style={{ textAlign: "left" }}>Todavía no tienes medallas. La primera llega al completar tu primera actividad.</p>
        ) : (
          <div role="tabpanel" className={`fae-pf-rejilla${actual === "elite" ? " fae-pf-rejilla--elite" : ""}`}>
            {lista.map((m) => (
              <button
                key={m.id}
                type="button"
                data-medalla={m.id}
                data-obtenida={m.obtenida ? "si" : "no"}
                aria-pressed={sel?.id === m.id}
                className={`fae-pf-med${m.obtenida ? " fae-pf-med--ganada" : ""}`}
                onClick={() => setElegida(m.id)}
              >
                <span className="fae-pf-med-arte">
                  <Medalla nivel={m.nivel} icono={m.icono} numero={m.numero} obtenida={m.obtenida} tamano={60} />
                  {m.obtenida && <span className="fae-pf-brillo" aria-hidden="true" />}
                </span>
                <p className="fae-pf-med-titulo" style={{ color: m.obtenida ? FAE.text : "rgba(248,249,250,0.6)" }}>{m.titulo}</p>
              </button>
            ))}
          </div>
        )}

        {sel && (
          <div key={sel.id} className="fae-pf-detalle" data-detalle-medalla aria-live="polite">
            <span style={{ lineHeight: 0, flex: "none" }}>
              <Medalla nivel={sel.nivel} icono={sel.icono} numero={sel.numero} obtenida={sel.obtenida} tamano={76} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p className="fae-pf-ceja" style={{ fontSize: "10.5px", color: "rgba(248,249,250,0.6)" }}>Nivel {ETIQUETA_NIVEL[sel.nivel]}</p>
              <h4>{sel.titulo}</h4>
              {/* Sin condición definida no se inventa una: se dice que falta. */}
              <p>{sel.ganable ? sel.descripcion : "Su condición todavía se está definiendo; por ahora no se puede conseguir."}</p>
              {(() => { const e = estadoDe(sel); return <span className="fae-pf-estado" style={{ color: e.color, background: e.fondo }}>{e.texto}</span>; })()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
