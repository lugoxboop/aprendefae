import { C, INTER } from "./comun.jsx";
import { useReproduccion, enFase } from "./movimiento.js";
import { INTERFAZ_R5_1, RAYA_C1, colocarC1, esCorriente } from "../../data/repasoCap5Cruzado.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C.1 · «LA RAYA DEL AÑO» (r5-1 v2.3, Célula E).
 *
 * Imita a RayaDelAno de T4·A0 (decisión 1 de v2.3), con la figura de Itagaki
 * en esa orientación y las correcciones de Takamura. Componente propio: no se
 * toca ContabilidadT4View.jsx. (La RayaDelAno de A0 ya no está en main: el
 * rediseño de A0, #260, la cambió; se imita la que había antes, b6fbf8b^.)
 *
 *   · columna izquierda de 44 px con «hoy» y «1 año»; eje vertical de 2 px
 *     #B8C4D4 en x = 50, de «hoy» a la raya; los nombres desde x = 62
 *   · zona «Corriente» arriba: 12 px por mes, la raya del año a 144 px
 *   · raya de 2 px #F8F9FA (el color del texto), de x = 44 al borde
 *   · zona «No es corriente» abajo: una fila sin escala ni eje
 *   · sin subtítulos en las zonas (decisión 2: repetían el enunciado y el
 *     acierto): la figura mide 264 px con su relleno
 *   · todo neutro, sin coral (B4): lo que no es corriente lo dice su lugar
 *   · puntos #CBDCF2 con anillo de 2 px #1D3557 (decisión 4)
 *   · el inventario no tiene fecha: una franja de 6 px de «hoy» a 8 px antes
 *     de la raya, y su línea de unión sale de la mitad de la franja (decisión 5)
 *   · quien falla no pierde su activo (decisión 3): con la correcta en la
 *     figura, la fila de abajo conserva el de la elegida, con punto de
 *     contorno discontinuo de 1 px #B8C4D4 y nombre en #B8C4D4
 *   · texto alternativo: «Corriente: …. No es corriente: …» (decisión 6)
 *
 * La caída: cada activo, en el orden de la opción, con 140 ms de desfase; el
 * punto baja 20 px y el nombre aparece con un fundido (260 ms), luego su línea
 * de unión (100 ms); la franja crece hacia abajo (260 ms); lo de abajo cae
 * desde arriba de la figura y cruza la raya (360 ms). Un toque en la figura la
 * lleva al final. Con reduced-motion, todo en su sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const X_EJE = 50;
const X_NOMBRE = 62;
const COL = 44;
/* Alturas dentro de la caja (sin su relleno de 12): rótulo de arriba 18, 8 de aire, 10 de aire y la escala. */
const Y_HOY = 36;
const Y_RAYA = Y_HOY + RAYA_C1.raya;
const Y_ROTULO_ABAJO = Y_RAYA + 2 + 8;
const Y_FILA = Y_ROTULO_ABAJO + 18 + 8;
export const ALTO_RAYA_C1 = Y_FILA + 24;
const DESFASE = 140;
const CAE = 260;
const UNION = 100;
const CAE_ABAJO = 360;
const ANILLO = `0 0 0 2px ${C.navy}`;

const rotulo = { fontFamily: INTER, fontSize: "14px", lineHeight: "18px", fontWeight: 600, color: C.texto, whiteSpace: "nowrap" };
const nombreSt = { fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: C.texto, whiteSpace: "nowrap", background: C.navy, padding: "0 2px" };
const margen = { fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: C.atenuado, whiteSpace: "nowrap", position: "absolute", left: 0, width: `${COL - 8}px`, textAlign: "right" };

export const altDeRaya = (opcion) => INTERFAZ_R5_1.altRaya(
  opcion.activos.filter(esCorriente).map((a) => a.figura),
  opcion.activos.filter((a) => !esCorriente(a)).map((a) => a.figura),
);

function Punto({ y, fase, retraso, x = X_EJE + 1, fantasma = false }) {
  return (
    <span
      aria-hidden="true"
      data-punto-raya={fantasma ? "habria" : "si"}
      style={{
        position: "absolute", left: `${x - 5}px`, top: `${y - 5}px`, width: "10px", height: "10px", borderRadius: "50%", boxSizing: "border-box",
        ...(fantasma ? { border: `1px dashed ${C.atenuado}`, background: "transparent" } : { background: C.hecho, boxShadow: ANILLO }),
        ...enFase(fase, { transform: "translateY(-20px)", opacity: 0 }, { transform: "none", opacity: 1 }, { ms: CAE, retraso }),
      }}
    />
  );
}

function Nombre({ y, fase, retraso, children, alto = 18, dato, gris = false }) {
  return (
    <span
      data-nombre-raya={dato}
      style={{
        position: "absolute", left: `${X_NOMBRE}px`, top: `${y - alto / 2}px`, display: "flex", flexDirection: "column", alignItems: "flex-start",
        ...enFase(fase, { opacity: 0 }, { opacity: 1 }, { ms: CAE, retraso, propiedades: "opacity" }),
      }}
    >
      {typeof children === "string" ? <span style={{ ...nombreSt, ...(gris ? { color: C.atenuado } : {}) }}>{children}</span> : children}
    </span>
  );
}

export function RayaC1({ opcion, clave, onTerminar, elegida = null }) {
  const c = opcion ? colocarC1(opcion) : null;
  const orden = opcion ? opcion.activos : [];
  const retrasoDe = (a) => orden.indexOf(a) * DESFASE;
  const duracion = orden.length ? (orden.length - 1) * DESFASE + Math.max(CAE + UNION, CAE_ABAJO) : 0;
  const { fase, saltar } = useReproduccion(opcion ? clave : null, duracion, onTerminar);
  /* Decisión 3: con otra opción en la figura, lo de abajo de la elegida se queda, en discontinuo. */
  const habria = opcion && elegida && elegida.id !== opcion.id ? elegida.activos.filter((a) => !esCorriente(a)) : [];
  const lineas = [];
  if (c) {
    for (const x of c.arriba) {
      if (x.nombre !== x.punto) lineas.push({ k: x.activo.figura, x1: X_EJE + 6, y1: Y_HOY + x.punto, x2: X_NOMBRE - 1, y2: Y_HOY + x.nombre, retraso: retrasoDe(x.activo) + CAE });
    }
    if (c.inventario) {
      const medio = Y_HOY + (RAYA_C1.raya - 8) / 2;
      lineas.push({ k: "inventario", x1: X_EJE + 4, y1: medio, x2: X_NOMBRE - 1, y2: Y_HOY + c.inventario.nombre, retraso: retrasoDe(c.inventario.activo) + CAE });
    }
  }
  return (
    <div
      data-raya-c1
      data-fase={fase}
      role="img"
      aria-label={opcion ? altDeRaya(opcion) : undefined}
      onClick={saltar}
      style={{ position: "relative", height: `${ALTO_RAYA_C1}px`, cursor: fase === "animando" ? "pointer" : undefined }}
    >
      <div aria-hidden="true">
        {/* Los rótulos fijos: «Corriente» arriba, «No es corriente» abajo; «hoy» y «1 año» en la columna del tiempo. */}
        <span data-zona-raya="corriente" style={{ ...rotulo, position: "absolute", left: `${X_NOMBRE}px`, top: 0 }}>{INTERFAZ_R5_1.corriente}</span>
        <span data-margen-raya="hoy" style={{ ...margen, top: `${Y_HOY - 8}px` }}>{INTERFAZ_R5_1.hoyRaya}</span>
        <span data-eje-raya style={{ position: "absolute", left: `${X_EJE}px`, top: `${Y_HOY}px`, width: "2px", height: `${RAYA_C1.raya}px`, background: C.atenuado }} />
        <span data-margen-raya="un-ano" style={{ ...margen, top: `${Y_RAYA + 1 - 8}px`, color: C.texto }}>{INTERFAZ_R5_1.unAno}</span>
        <span data-raya style={{ position: "absolute", left: `${COL}px`, right: 0, top: `${Y_RAYA}px`, height: "2px", background: C.texto }} />
        <span data-zona-raya="no-corriente" style={{ ...rotulo, position: "absolute", left: `${X_NOMBRE}px`, top: `${Y_ROTULO_ABAJO}px` }}>{INTERFAZ_R5_1.noCorriente}</span>

        {c?.inventario && (
          <>
            {/* La franja del inventario: «en algún momento antes del año». Crece hacia abajo. */}
            <span
              data-franja-inventario
              style={{
                position: "absolute", left: `${X_EJE - 2}px`, top: `${Y_HOY}px`, width: "6px", height: `${RAYA_C1.raya - 8}px`, borderRadius: "3px", background: C.hecho,
                transformOrigin: "top",
                ...enFase(fase, { transform: "scaleY(0)" }, { transform: "scaleY(1)" }, { ms: CAE, retraso: retrasoDe(c.inventario.activo), propiedades: "transform" }),
              }}
            />
            <Nombre y={Y_HOY + c.inventario.nombre} alto={34} fase={fase} retraso={retrasoDe(c.inventario.activo)} dato="inventario">
              <span style={nombreSt}>{c.inventario.activo.figura}</span>
              <span style={{ ...nombreSt, fontSize: "12px", lineHeight: "16px", color: C.atenuado }}>{INTERFAZ_R5_1.alVenderse}</span>
            </Nombre>
          </>
        )}

        {lineas.length > 0 && (
          <svg data-uniones width="100%" height={ALTO_RAYA_C1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
            {lineas.map((l) => (
              <line key={l.k} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={C.atenuado} strokeWidth="1" style={enFase(fase, { opacity: 0 }, { opacity: 1 }, { ms: UNION, retraso: l.retraso, propiedades: "opacity" })} />
            ))}
          </svg>
        )}

        {c?.arriba.map((x) => (
          <span key={x.activo.texto}>
            <Punto y={Y_HOY + x.punto} fase={fase} retraso={retrasoDe(x.activo)} />
            <Nombre y={Y_HOY + x.nombre} fase={fase} retraso={retrasoDe(x.activo)} dato={x.activo.figura}>{x.activo.figura}</Nombre>
          </span>
        ))}

        {/* Lo que no es corriente cae desde arriba de la figura, cruza la raya y se posa abajo. */}
        {c?.abajo.map((a) => (
          <span
            key={a.texto}
            data-abajo={a.figura}
            style={{
              position: "absolute", left: 0, right: 0, top: `${Y_FILA}px`, height: "24px",
              ...enFase(fase, { transform: `translateY(${-Y_FILA}px)`, opacity: 0 }, { transform: "none", opacity: 1 }, { ms: CAE_ABAJO, retraso: retrasoDe(a) }),
            }}
          >
            <span style={{ position: "absolute", left: `${X_EJE + 1 - 5}px`, top: "7px", width: "10px", height: "10px", borderRadius: "50%", background: C.hecho, boxShadow: ANILLO }} />
            <span style={{ ...nombreSt, position: "absolute", left: `${X_NOMBRE}px`, top: "3px" }}>{a.figura}</span>
          </span>
        ))}
        {habria.map((a) => (
          <span key={`h-${a.texto}`} data-habria={a.figura} style={{ position: "absolute", left: 0, right: 0, top: `${Y_FILA}px`, height: "24px" }}>
            <Punto y={12} fase="final" retraso={0} fantasma />
            <span style={{ ...nombreSt, position: "absolute", left: `${X_NOMBRE}px`, top: "3px", color: C.atenuado }}>{a.figura}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
