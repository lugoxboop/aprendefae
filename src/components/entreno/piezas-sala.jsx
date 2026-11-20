import { useEffect, useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { FAE } from "../../theme.js";
import { temasEnVivo, MATERIAS_EN_VIVO, CANTIDADES, DURACIONES, armarPreguntas } from "../../vivo/banco.js";
import { Carita, perfilDeTarjeta } from "../social/amigos-comun.jsx";
import { MAX_JUGADORES } from "../../entreno/datos.js";

/*
 * Piezas que comparten «crear sala» y «cambiar actividad» en el lobby:
 * elegir la actividad (materia, tema, cuántas preguntas, cuánto tiempo) y
 * elegir a quién invitar.
 */

export const NOMBRE_MATERIA = { macroeconomia: "Macroeconomía", contabilidad: "Contabilidad" };
const ICONO_MATERIA = { macroeconomia: "📈", contabilidad: "📒" };

export function Seccion({ titulo, children, extra = null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
        <span className="sal-cejilla">{titulo}</span>
        {extra}
      </div>
      {children}
    </div>
  );
}

/** La actividad que se va a jugar. `valor` = { materia, tema, cantidad, duracion }. */
export function ElegirActividad({ valor, onCambio, materiaInicial = "contabilidad" }) {
  const materia = valor.materia ?? materiaInicial;
  const temas = useMemo(() => temasEnVivo(materia), [materia]);
  useEffect(() => {
    if (!temas.some((t) => t.id === valor.tema)) onCambio({ ...valor, materia, tema: temas[0]?.id ?? null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temas]);
  const set = (k, v) => onCambio({ ...valor, materia, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <Seccion titulo="Materia">
        <div className="sal-materias">
          {MATERIAS_EN_VIVO.map((m) => (
            <button key={m} type="button" className="sal-opcion-tg" aria-pressed={materia === m} onClick={() => onCambio({ ...valor, materia: m, tema: null })} data-sal-materia={m}>
              <span aria-hidden="true" style={{ fontSize: "20px" }}>{ICONO_MATERIA[m]}</span> {NOMBRE_MATERIA[m]}
            </button>
          ))}
        </div>
      </Seccion>
      <Seccion titulo="Tema del reto">
        <div className="sal-temas">
          {temas.map((t) => (
            <button key={t.id} type="button" className="sal-opcion-tg" aria-pressed={valor.tema === t.id} onClick={() => set("tema", t.id)} data-sal-tema={t.id}>
              <span>{t.titulo}</span>
              <small>{t.disponibles} preguntas en el banco</small>
            </button>
          ))}
        </div>
      </Seccion>
      <div style={{ display: "flex", gap: "18px 28px", flexWrap: "wrap" }}>
        <Seccion titulo="Preguntas">
          <div className="sal-chips">
            {CANTIDADES.map((n) => (
              <button key={n} type="button" className="sal-opcion-tg" aria-pressed={valor.cantidad === n} onClick={() => set("cantidad", n)}>{n}</button>
            ))}
          </div>
        </Seccion>
        <Seccion titulo="Tiempo por pregunta">
          <div className="sal-chips">
            {DURACIONES.map((n) => (
              <button key={n} type="button" className="sal-opcion-tg" aria-pressed={valor.duracion === n} onClick={() => set("duracion", n)}>{n} s</button>
            ))}
          </div>
        </Seccion>
      </div>
    </div>
  );
}

/** De la actividad elegida a lo que pide la base. */
export function paqueteDeActividad(valor) {
  const temas = temasEnVivo(valor.materia);
  const t = temas.find((x) => x.id === valor.tema);
  if (!t) return null;
  return {
    materia: valor.materia,
    tema: t.id,
    temaTitulo: t.titulo,
    duracion: valor.duracion,
    preguntas: armarPreguntas(valor.materia, t.id, valor.cantidad),
  };
}

/** Clave estable de un amigo: el de verdad por su cuenta, el de muestra por su id. */
export const claveAmigo = (a) => (a.user_id ? `u:${a.user_id}` : `d:${a.demo_id}`);

/** A quién invitar. `elegidos` es un Set de claveAmigo. */
export function ElegirAmigos({ amigos, elegidos, onCambio, cargando = false, ocupados = new Set(), max = MAX_JUGADORES - 1 }) {
  const lleno = elegidos.size >= max;
  if (cargando) return <p className="sal-nota">Cargando a tus amigos…</p>;
  if (!amigos.length) {
    return <p className="sal-nota">Aún no tienes amigos. Puedes compartir el código de la sala para que entren.</p>;
  }
  return (
    <div className="sal-invitar" role="group" aria-label="Amigos para invitar">
      {amigos.map((a) => {
        const k = claveAmigo(a);
        const si = elegidos.has(k);
        const ya = ocupados.has(k);
        return (
          <button key={k} type="button" className="sal-amigo" aria-pressed={si || ya} disabled={ya || (!si && lleno)}
            style={ya || (!si && lleno) ? { opacity: 0.5, cursor: "default" } : undefined}
            data-sal-invitar={a.apodo}
            onClick={() => {
              const n = new Set(elegidos);
              if (si) n.delete(k); else n.add(k);
              onCambio(n);
            }}>
            {(si || ya) && <span className="sal-check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>}
            <Carita perfil={perfilDeTarjeta(a)} tamano={52} titulo={`Mascota de ${a.apodo}`} />
            <b>{a.apodo}</b>
            {a.demo && <small style={{ fontSize: "10px", fontWeight: 700, color: "rgba(248,249,250,.5)", textTransform: "uppercase", letterSpacing: ".06em" }}>demo</small>}
          </button>
        );
      })}
    </div>
  );
}

/** Separa las claves elegidas en cuentas y amigos de demostración. */
export function separarElegidos(elegidos) {
  const invitar = [], demos = [];
  for (const k of elegidos) {
    if (k.startsWith("u:")) invitar.push(k.slice(2));
    else if (k.startsWith("d:")) demos.push(k.slice(2));
  }
  return { invitar, demos };
}

/** Una tarjeta de «cómo funciona» de tres pasos, para la portada de las salas. */
export function Pasos() {
  const pasos = [
    ["1", "Arma tu sala", "Elige un tema de Macro o Contabilidad y cuántas preguntas."],
    ["2", "Llama a tu equipo", "Invita a tus amigos o pásales el código. Entran con su mascota."],
    ["3", "¡A jugar!", "Todos responden a la vez contra el reloj. Gana quien más sabe."],
  ];
  return (
    <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>
      {pasos.map(([n, t, d]) => (
        <div key={n} className="sal-panel" style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px" }}>
          <span aria-hidden="true" style={{ flex: "none", width: "34px", height: "34px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(180deg, #8EA0FF, #6F86FF)", color: "#0B1626", fontFamily: "Sora, sans-serif", fontWeight: 800 }}>{n}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: "0 0 2px", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "14.5px", color: FAE.text }}>{t}</p>
            <p className="sal-nota" style={{ fontSize: "13px" }}>{d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Un pequeño confeti de CSS para el podio. */
export function Confeti() {
  const [piezas] = useState(() => Array.from({ length: 36 }, (_, k) => ({
    left: Math.random() * 100, delay: -Math.random() * 6, dur: 4 + Math.random() * 4,
    color: ["#E9B949", "#3FC1B0", "#6F86FF", "#E76F51", "#F4F6F8"][k % 5],
  })));
  return (
    <div className="sal-confeti" aria-hidden="true">
      {piezas.map((p, k) => (
        <i key={k} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}

export function Destello({ children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <Sparkles size={15} aria-hidden="true" /> {children}
    </span>
  );
}
