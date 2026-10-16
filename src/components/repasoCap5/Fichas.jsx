import { useEffect, useRef, useState } from "react";
import { C, INTER, SORA, CIFRA, ESTADOS, REPOSO, Pastilla, Comprobar, useTrasError } from "./comun.jsx";
import { pesos } from "../../data/contabilidad.js";
import { INTERFAZ_R5_1, CMV, BOTONES_C8, contadorDeC8, evaluarC8, respuestaDeC8 } from "../../data/repasoCap5Cruzado.js";
import { useCifra } from "./movimiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PANTALLA 4 · C.8 «Arma el costo» (Itagaki, §a; v2.1, decisión 6).
 *
 * Seis fichas en el orden del estado de resultados. Cada una: la etiqueta y la
 * cifra arriba; debajo, tres botones de 44 px a todo el ancho: «Suma» ·
 * «Resta» · «No entra» (un grupo de opciones). Elegido: relleno #CBDCF2 y
 * texto #0E1B2E; sin elegir: borde 1,5 px #B8C4D4. Con «No entra», la cifra
 * de la ficha pasa a gris.
 *
 * El contador en vivo («Costo de mercancía vendida») suma lo de Suma y resta
 * lo de Resta en cada decisión (200 ms). Va fijo al borde inferior de la
 * ventana mientras la lista se ve y, al final, en el flujo, entre la lista y
 * «Revisar». La lista lleva un relleno inferior igual al alto del contador.
 * «Revisar» se activa con las seis fichas puestas.
 *
 * Se califica por clasificación (decisión 5), al estándar único de Hacer
 * (PROMPT MAESTRO §4): la ficha va sobre el Panel con su contorno de reposo;
 * los botones, sin relleno. Ficha bien: el elegido con 2 px #F8F9FA y la
 * pastilla «Correcto». Ficha mal: el elegido con 2 px coral y «No va aquí», y
 * 0,7 s después el que iba, con 2 px #F8F9FA e «Iba aquí» (r5-1 no tiene
 * reintento).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CONTADOR = 64;
const NOMBRE = { suma: INTERFAZ_R5_1.suma, resta: INTERFAZ_R5_1.resta, fuera: INTERFAZ_R5_1.noEntra };

/* El botón: reposo 1 px; elegido o bien 2 px #F8F9FA; mal 2 px coral; el que iba, 2 px #F8F9FA (comun.jsx). */
function estiloBoton(estado, calificada) {
  const base = {
    flex: 1, minWidth: 0, minHeight: "44px", padding: "4px 6px", borderRadius: "10px", boxSizing: "border-box",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
    fontFamily: INTER, fontSize: "14px", fontWeight: 600, color: C.texto, cursor: calificada ? "default" : "pointer",
  };
  return { ...base, ...(ESTADOS[estado] ?? ESTADOS.reposo) };
}

function Ficha({ dato, elegido, calif, onElegir, botonesRef }) {
  const fuera = elegido === "fuera";
  const revela = useTrasError(calif === "mal");
  const nombre = INTERFAZ_R5_1.grupo(dato.etiqueta, dato.valor);
  /* El grupo de opciones: las flechas cambian dentro del grupo; Tab pasa a la ficha siguiente. */
  const teclas = (e, k) => {
    if (calif) return;
    const mover = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!mover) return;
    e.preventDefault();
    const j = (k + mover + BOTONES_C8.length) % BOTONES_C8.length;
    onElegir(BOTONES_C8[j].id);
    botonesRef.current[`${dato.id}-${BOTONES_C8[j].id}`]?.focus();
  };
  const conFoco = elegido ?? BOTONES_C8[0].id;
  return (
    <div data-ficha={dato.id} data-calificacion={calif ?? "sin"} style={{ border: REPOSO, borderRadius: "10px", padding: "12px", marginTop: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontFamily: INTER, fontSize: "14px", lineHeight: "20px", color: C.texto }}>{dato.etiqueta}</span>
        <span data-cifra-ficha style={{ ...CIFRA, fontSize: "15px", fontWeight: 600, color: fuera ? C.atenuado : C.texto, whiteSpace: "nowrap" }}>
          {pesos(dato.valor)}
        </span>
      </div>
      <div role="radiogroup" aria-label={nombre} style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
        {BOTONES_C8.map((b, k) => {
          const es = elegido === b.id;
          const iba = calif === "mal" && revela && b.id === dato.correcto;
          const estado = es ? (calif === "bien" ? "ok" : calif === "mal" ? "mal" : "ok") : iba ? "revelada" : null;
          return (
            <button
              key={b.id}
              ref={(el) => { botonesRef.current[`${dato.id}-${b.id}`] = el; }}
              type="button"
              role="radio"
              aria-checked={es ? "true" : "false"}
              aria-disabled={calif ? "true" : undefined}
              tabIndex={b.id === conFoco ? 0 : -1}
              data-boton={b.id}
              data-elegido={es ? "si" : "no"}
              onClick={() => { if (!calif) onElegir(b.id); }}
              onKeyDown={(e) => teclas(e, k)}
              data-estado-ficha={estado ?? "reposo"}
              style={estiloBoton(estado, Boolean(calif))}
            >
              {NOMBRE[b.id]}
              {iba && <Pastilla estado="revelada" />}
            </button>
          );
        })}
      </div>
      {calif && (
        <p data-palabra-ficha={calif} style={{ margin: "6px 0 0", display: "flex", justifyContent: "flex-end" }}>
          <Pastilla estado={calif === "bien" ? "ok" : "mal"} />
        </p>
      )}
    </div>
  );
}

/*
 * El contador va fijo al borde inferior de la ventana mientras la lista se ve,
 * y en el flujo cuando su sitio ya está a la vista. No es `position: sticky`:
 * FondoMateria (compartido) lleva `overflow: hidden` y eso lo anula. Un hueco
 * de 64 px guarda su sitio en el flujo; dentro, la barra se fija cuando hace
 * falta, con el ancho y la posición del hueco.
 */
function Contador({ valor, listaRef }) {
  const pintado = useCifra(valor, 200, valor);
  const negativo = pintado < 0;
  const hueco = useRef(null);
  const [fijo, setFijo] = useState(null);
  useEffect(() => {
    const medir = () => {
      const h = hueco.current?.getBoundingClientRect();
      const l = listaRef.current?.getBoundingClientRect();
      if (!h || !l) return;
      const flota = l.top < window.innerHeight && h.bottom > window.innerHeight;
      setFijo((antes) => {
        const nuevo = flota ? { left: h.left, width: h.width } : null;
        if (!antes && !nuevo) return antes;
        if (antes && nuevo && antes.left === nuevo.left && antes.width === nuevo.width) return antes;
        return nuevo;
      });
    };
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => { window.removeEventListener("scroll", medir); window.removeEventListener("resize", medir); };
  }, [listaRef]);
  return (
    <div ref={hueco} data-contador-hueco style={{ height: `${CONTADOR}px` }}>
      <div
        data-contador
        data-fijo={fijo ? "si" : "no"}
        style={{
          ...(fijo ? { position: "fixed", bottom: 0, left: `${fijo.left}px`, width: `${fijo.width}px`, zIndex: 20 } : { position: "relative" }),
          height: `${CONTADOR}px`, boxSizing: "border-box", padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          background: C.fondo, borderTop: "1px solid rgba(248,249,250,0.12)",
        }}
      >
        <span style={{ fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: C.atenuado }}>{CMV}</span>
        <span data-valor-contador={valor} aria-live="polite" style={{ fontFamily: SORA, fontSize: "24px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: C.texto, whiteSpace: "nowrap" }}>
          {`${negativo ? "−" : ""}${pesos(Math.abs(Math.round(pintado)))}`}
        </span>
      </div>
    </div>
  );
}

export function Fichas({ pantalla, onCalificar }) {
  const [clasificacion, setClasificacion] = useState({});
  const [r, setR] = useState(null);
  const botones = useRef({});
  const lista = useRef(null);
  const puestas = pantalla.datos.filter((d) => clasificacion[d.id]).length;
  const listas = puestas === pantalla.datos.length;

  const revisar = () => {
    if (!listas || r) return;
    const nuevo = evaluarC8(pantalla, clasificacion);
    setR(nuevo);
    onCalificar?.({ ok: nuevo.ok, textos: nuevo.textos, respuesta: respuestaDeC8(pantalla, clasificacion) });
  };

  return (
    <div data-pantalla-fichas>
      <div data-con-contador>
        <div ref={lista} data-lista-fichas style={{ paddingBottom: `${CONTADOR}px` }}>
          {pantalla.datos.map((d) => {
            const f = r?.fichas[d.id];
            return (
              <Ficha
                key={d.id}
                dato={{ ...d, correcto: f?.correcto }}
                elegido={clasificacion[d.id] ?? null}
                calif={f ? (f.ok ? "bien" : "mal") : null}
                onElegir={(b) => setClasificacion((x) => ({ ...x, [d.id]: b }))}
                botonesRef={botones}
              />
            );
          })}
        </div>
        <Contador valor={contadorDeC8(pantalla, clasificacion)} listaRef={lista} />
      </div>
      {/* §4.3: «Comprobar», porque son seis fichas; el Responder común. */}
      {!r && <Comprobar activo={listas} onClick={revisar} dato="revisar" />}
    </div>
  );
}
