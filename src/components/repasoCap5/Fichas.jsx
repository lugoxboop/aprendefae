import { useEffect, useRef, useState } from "react";
import { C, INTER, SORA } from "./comun.jsx";
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
 * Se califica por clasificación (decisión 5). Ficha bien: el botón elegido
 * conserva su relleno, con un punto y «Bien». Ficha mal: el botón elegido
 * PIERDE el relleno y queda con borde coral, un anillo y «Era …» (§e).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CONTADOR = 64;
const ERA = INTERFAZ_R5_1.era;
const NOMBRE = { suma: INTERFAZ_R5_1.suma, resta: INTERFAZ_R5_1.resta, fuera: INTERFAZ_R5_1.noEntra };

function estiloBoton(elegido, calif) {
  const base = {
    flex: 1, minWidth: 0, minHeight: "44px", padding: "0 6px", borderRadius: "10px", boxSizing: "border-box",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
    fontFamily: INTER, fontSize: "14px", fontWeight: 600, cursor: calif ? "default" : "pointer",
  };
  if (!elegido) return { ...base, background: "transparent", border: `1.5px solid ${C.atenuado}`, color: C.texto };
  if (calif === "mal") return { ...base, background: "transparent", border: `2px solid ${C.coral}`, color: C.texto };
  if (calif === "bien") return { ...base, background: C.hecho, border: `2px solid ${C.hecho}`, color: C.fondo };
  return { ...base, background: C.hecho, border: `1.5px solid ${C.hecho}`, color: C.fondo };
}

function Ficha({ dato, elegido, calif, onElegir, botonesRef }) {
  const fuera = elegido === "fuera";
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
    <div data-ficha={dato.id} data-calificacion={calif ?? "sin"} style={{ background: C.navy, borderRadius: "10px", padding: "12px", marginTop: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontFamily: INTER, fontSize: "14px", lineHeight: "20px", color: C.texto }}>{dato.etiqueta}</span>
        <span data-cifra-ficha style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: fuera ? C.atenuado : C.texto, whiteSpace: "nowrap" }}>
          {pesos(dato.valor)}
        </span>
      </div>
      <div role="radiogroup" aria-label={nombre} style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
        {BOTONES_C8.map((b, k) => {
          const es = elegido === b.id;
          const marca = es && calif;
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
              style={estiloBoton(es, es ? calif : null)}
            >
              {marca && (
                <span
                  aria-hidden="true"
                  data-forma-ficha={calif === "bien" ? "punto" : "anillo"}
                  style={{ width: "8px", height: "8px", borderRadius: "50%", boxSizing: "border-box", flexShrink: 0, ...(calif === "bien" ? { background: C.fondo } : { border: `2px solid ${C.coral}` }) }}
                />
              )}
              {NOMBRE[b.id]}
            </button>
          );
        })}
      </div>
      {calif && (
        <p data-palabra-ficha={calif} style={{ margin: "6px 0 0", textAlign: "right", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: C.texto }}>
          {calif === "bien" ? INTERFAZ_R5_1.bien : ERA[calif === "mal" ? dato.correcto : ""]}
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
          background: C.fondo, borderTop: `1px solid ${C.navy}`,
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
      <button
        type="button"
        data-revisar
        disabled={!listas || Boolean(r)}
        onClick={revisar}
        style={{
          marginTop: "16px", width: "100%", minHeight: "44px", borderRadius: "999px", border: "none",
          background: C.ambar, color: C.navy, fontFamily: SORA, fontSize: "14px", fontWeight: 700,
          opacity: listas && !r ? 1 : 0.45, cursor: listas && !r ? "pointer" : "default",
        }}
      >
        {INTERFAZ_R5_1.revisar}
      </button>
    </div>
  );
}
