import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { CSS_SALA, Panel } from "../salaDeControl/marco.jsx";
import { CSS_JUEGO } from "../corazon/juego.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TESORERÍA NACIONAL — un cuarto dentro del edificio de la Sala de Control.
 *
 * Política Económica montó la sala de mandos de la economía; Política Fiscal
 * entra a UNA de sus habitaciones, la que maneja el dinero del Estado. No es un
 * mundo nuevo y por eso no trae vocabulario visual propio: el panel con bisel,
 * el rótulo grabado y la rejilla de fondo son los de salaDeControl/marco.jsx, y
 * las piezas de juego —la opción que se toca, la devolución, los pulsos, el
 * cierre— las de corazon/juego.jsx, que ya resolvieron el color que nunca va
 * solo y el emoji con equivalente en texto.
 *
 * Lo único propio de este cuarto son sus tres máquinas, una por instrumento:
 *
 *   Tributación          el recaudador      lo que el Estado cobra
 *   Gasto del Gobierno   el distribuidor    lo que el Estado paga
 *   Deuda Pública        el libro de deuda  lo que el Estado pide prestado
 *
 * Cada una tiene su icono y su acento, y ninguno de los dos informa solo: el
 * nombre del instrumento va escrito siempre al lado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";

/* El acento de cada máquina. Acompaña al nombre escrito; nunca lo sustituye. */
export const ACENTOS = {
  tributacion: FAE.teal,
  gasto: FAE.ambar,
  deuda: FAE.coral,
  ninguno: "rgba(203,220,242,0.8)",
};

/*
 * Las ranuras de los JUEGOS de la Tesorería. Deuda no va en coral aquí: en una
 * pantalla de preguntas el coral es la respuesta incorrecta y nada más, y una
 * bandeja coral se leería como «ahí va lo malo». Las escenas de Aprender
 * siguen con ACENTOS.
 */
export const ACENTOS_RANURA = {
  tributacion: FAE.teal,
  gasto: FAE.ambar,
  deuda: FAE.node,
  ninguno: "rgba(248,249,250,0.5)",
};

export const CSS_TESORERIA = `
${CSS_SALA}
${CSS_JUEGO}
/* El documento que baja por la máquina. Su final es el archivo: el reloj es la animación. */
@keyframes fae-ts-caer { from { transform: translateY(0); } to { transform: translateY(var(--fae-ts-recorrido)); } }
/* El golpe del sello. Un solo movimiento, no un bucle. */
@keyframes fae-ts-sello { 0% { opacity: 0; transform: rotate(-8deg) scale(1.5); } 100% { opacity: 1; transform: rotate(-8deg) scale(1); } }
.fae-ts-sello { animation: fae-ts-sello 260ms cubic-bezier(.3,1.4,.5,1) both; }
@media (prefers-reduced-motion: reduce) { .fae-ts-sello { animation: none !important; } }
`;

/* Un panel de la Tesorería: el de la sala, con el CSS de los juegos dentro. */
export function Tesoreria({ rotulo, titulo, acento = FAE.teal, children }) {
  return (
    <Panel rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_TESORERIA}</style>
      {children}
    </Panel>
  );
}

/* El icono de cada máquina. Decorativo: el nombre va siempre escrito al lado. */
export function IconoMecanismo({ id, color = FAE.text, tam = 22 }) {
  const trazo = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      {id === "tributacion" && (
        /* El recaudador: una ranura y la moneda que entra. */
        <>
          <rect x="3" y="11" width="18" height="9" rx="2" {...trazo} />
          <path d="M8 11 H16" {...trazo} />
          <circle cx="12" cy="5.5" r="2.6" {...trazo} />
        </>
      )}
      {id === "gasto" && (
        /*
         * El distribuidor: una caja de la que salen tres flechas. Con puntas:
         * sin ellas —un círculo y tres rayas— se leía como unas tijeras.
         */
        <>
          <rect x="2.5" y="9" width="6" height="6" rx="1.5" {...trazo} />
          <path d="M8.5 12 H20 M17 9 L20 12 L17 15" {...trazo} />
          <path d="M8.5 10.5 L18.5 5 M15.4 4.6 L18.5 5 L17.6 8" {...trazo} />
          <path d="M8.5 13.5 L18.5 19 M17.6 16 L18.5 19 L15.4 19.4" {...trazo} />
        </>
      )}
      {id === "deuda" && (
        /* El libro de la deuda, abierto. */
        <>
          <path d="M12 7 C9.5 5.3 6.5 5 3.5 5.6 V18.6 C6.5 18 9.5 18.3 12 20 C14.5 18.3 17.5 18 20.5 18.6 V5.6 C17.5 5 14.5 5.3 12 7 Z" {...trazo} />
          <path d="M12 7 V20" {...trazo} />
        </>
      )}
      {id === "ninguno" && (
        /* Ni instrumento: una línea de saldo sobre su eje. */
        <>
          <path d="M4 16 L9 11 L13 13 L20 6" {...trazo} />
          <path d="M4 20 H20" {...trazo} />
        </>
      )}
    </svg>
  );
}

/*
 * Una ranura o bandeja de destino: icono, nombre del instrumento y, debajo,
 * qué máquina es. El acento marca la parte de arriba; el nombre dice lo mismo
 * con palabras.
 */
export function Ranura({ id, nombre, detalle, onClick, deshabilitada = false }) {
  const color = ACENTOS_RANURA[id] ?? FAE.teal;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitada}
      style={{
        display: "flex", alignItems: "center", gap: "10px", textAlign: "left",
        padding: "12px 13px", borderRadius: "14px",
        background: "rgba(10,20,34,0.55)", border: `1px solid ${color}66`, borderTop: `3px solid ${color}`,
        color: FAE.text, cursor: deshabilitada ? "default" : "pointer", opacity: deshabilitada ? 0.55 : 1,
        fontFamily: "Sora, sans-serif",
      }}
    >
      <IconoMecanismo id={id} color={color} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "13.5px", fontWeight: 700, lineHeight: 1.25 }}>{nombre}</span>
        {detalle && (
          <span style={{ display: "block", marginTop: "2px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(248,249,250,0.6)", lineHeight: 1.35 }}>
            {detalle}
          </span>
        )}
      </span>
    </button>
  );
}

/*
 * ═══════════ LA MÁQUINA POR LA QUE BAJAN LOS DOCUMENTOS ═══════════
 *
 * La usan el clasificador (juego 1) y déficit vs deuda (juego 7). Un documento
 * a la vez baja hacia la línea de archivo; si la cruza sin clasificar, se
 * archiva como fallo.
 *
 * EL RELOJ ES LA ANIMACIÓN, como en Diagnóstico en vivo: el final de la caída
 * se dispara con `animationend`, no con un setTimeout. Con la pestaña oculta
 * la animación se para y el documento no se pierde. El manejador lo pone cada
 * juego —con su propio `animationName === "fae-ts-caer"`—, porque es el juego
 * quien sabe qué hacer con un documento archivado.
 *
 * El recorrido se MIDE: en translateY los porcentajes son del propio elemento,
 * no del contenedor. Sin medida —en un navegador sin layout— no se anima.
 */
const LINEA_ARCHIVO = 14;
const ALTO_DOCUMENTO = 78;

export function Pista({ itemKey, texto, segundos, detenido = false, marca = null, onAnimationEnd, rotulo = "ARCHIVO" }) {
  const pista = useRef(null);
  const [recorrido, setRecorrido] = useState(0);

  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return undefined;
    const medir = () => {
      const alto = nodo.getBoundingClientRect().height;
      setRecorrido(Math.max(0, alto * (1 - LINEA_ARCHIVO / 100) - 10 - ALTO_DOCUMENTO));
    };
    medir();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(nodo);
    return () => ro.disconnect();
  }, []);

  const borde = marca === "acierto" ? FAE.teal : marca === "fallo" ? FAE.coral : "rgba(29,53,87,0.35)";

  return (
    <div
      ref={pista}
      className="fae-sc-rejilla"
      aria-live="polite"
      style={{
        position: "relative", overflow: "hidden", height: "clamp(220px, 34vh, 290px)", borderRadius: "16px",
        background: `linear-gradient(160deg, ${FAE.navy}66, rgba(10,20,34,0.82))`,
        border: "1px solid rgba(248,249,250,0.14)",
      }}
    >
      <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: `${LINEA_ARCHIVO}%`, borderTop: `2px dashed ${FAE.ambar}`, opacity: 0.7 }} />
      <span
        aria-hidden="true"
        style={{
          position: "absolute", right: "10px", bottom: `calc(${LINEA_ARCHIVO}% + 6px)`,
          fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar,
        }}
      >
        {rotulo}
      </span>
      {texto && (
        <div
          key={itemKey}
          onAnimationEnd={onAnimationEnd}
          style={{
            position: "absolute", top: "10px", left: 0, right: 0, marginInline: "auto", width: "min(86%, 420px)",
            padding: "13px 15px", borderRadius: "10px",
            /* Papel: el documento se distingue de la máquina por ser papel, no por un color de estado. */
            background: "#F4EFE3", color: FAE.navy, border: `2px solid ${borde}`,
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
            fontFamily: "Inter, sans-serif", fontSize: "14.5px", fontWeight: 600, lineHeight: 1.4,
            "--fae-ts-recorrido": `${recorrido}px`,
            animation: detenido || recorrido === 0 ? undefined : `fae-ts-caer ${segundos}s linear forwards`,
          }}
        >
          {texto}
        </div>
      )}
    </div>
  );
}

/* Un botón de avance, el mismo en los siete. */
export function Avanzar({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: "14px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
        padding: "11px 18px", borderRadius: "999px", cursor: "pointer",
        background: FAE.teal, border: "none", color: FAE.bg,
      }}
    >
      {children}
    </button>
  );
}

/* El texto pequeño del cierre, a 13 px: se lee, no es una etiqueta. */
export const TEXTO_CIERRE = { margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.72)" };
