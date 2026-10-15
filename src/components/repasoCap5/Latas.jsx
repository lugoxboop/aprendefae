import { useLayoutEffect, useRef, useState } from "react";
import { C, INTER } from "./comun.jsx";
import { OpcionR5 } from "./OpcionR5.jsx";
import { pesos } from "../../data/contabilidad.js";
import { INTERFAZ_R5_1, costoDeLatas, textoDeOpcion } from "../../data/repasoCap5Cruzado.js";
import { useReducido, terminarAnimaciones, llevarArriba, volarDesde } from "./movimiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PANTALLA 3 · C.6 «¿Qué latas salen?» (Itagaki, §a; v2.1, decisión 1).
 *
 * Dos estantes de cuatro latas: la primera compra a $10 y la segunda a $14
 * (el precio va una vez, en la marca). Tocar una lata de la primera compra la
 * vende: vuela al siguiente hueco de la bandeja (320 ms) y las barras se
 * mueven ±10 (240 ms). Tocar una de la segunda mientras quedan de la primera
 * la hace saltar y saca el mensaje; no se califica.
 *
 * Al vender la cuarta (costo 40, bodega 56), en cada barra aparece una marca
 * discontinua en lo que daría UEPS (costo 56, bodega 40) con el rótulo «Con
 * UEPS», y debajo se despliega la pregunta con la tabla de v1. La página se
 * desplaza hasta dejar el borde superior de las barras a 16 px del de la
 * ventana útil. Se califica solo la tabla.
 *
 * Un toque sobre una lata ACTÚA y termina al instante la animación anterior;
 * un toque en cualquier otra parte de la figura la salta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const VUELO_MS = 320;
const BARRAS_MS = 240;
const SALTO_MS = 300;
const DESPLIEGUE_MS = 300;

const idDeLata = (compra, k) => `${compra.id}-${k}`;

function Lata() {
  return (
    <span aria-hidden="true" data-lata-dibujo style={{ position: "relative", display: "block", width: "28px", height: "40px", boxSizing: "border-box", borderRadius: "6px", border: `2px solid ${C.hecho}`, background: C.fondo, overflow: "hidden" }}>
      <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: "4px", background: C.hecho }} />
    </span>
  );
}

const MARCA_CONTENIDO = { margin: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", lineHeight: "16px", color: C.atenuado };

/* Una de las dos barras: rótulo y valor arriba, la barra de 10 px debajo. */
function Barra({ id, rotulo, valor, escala, relleno, ueps, conUeps, reducido }) {
  const pct = (x) => `${(x / escala) * 100}%`;
  return (
    <div data-barra-latas={id} style={{ marginTop: id === "costo" ? 0 : "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", minHeight: "20px" }}>
        <span style={{ fontFamily: INTER, fontSize: "13px", color: C.atenuado }}>{rotulo}</span>
        <span data-valor-barra={valor} style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto }}>{pesos(valor)}</span>
      </div>
      {/* Con «Con UEPS» encima, la barra baja para que el rótulo no pise el renglón. */}
      <div style={{ position: "relative", height: "10px", marginTop: ueps !== null && conUeps ? "24px" : "6px" }}>
        <span
          data-relleno-barra={valor}
          style={{
            position: "absolute", left: 0, top: 0, height: "10px", width: pct(valor), boxSizing: "border-box", borderRadius: "2px",
            ...(relleno ? { background: C.hecho } : { border: `2px solid ${C.hecho}` }),
            transition: reducido ? "none" : `width ${BARRAS_MS}ms ease-out`,
          }}
        />
        {ueps !== null && (
          <>
            <span data-marca-ueps={ueps} style={{ position: "absolute", left: pct(ueps), top: "-4px", height: "18px", width: 0, borderLeft: `2px dashed ${C.texto}`, transform: "translateX(-1px)", animation: reducido ? "none" : "r5-aparece 200ms ease-out both" }} />
            {conUeps && (
              <span data-rotulo-ueps style={{ position: "absolute", left: pct(ueps), bottom: "14px", transform: "translateX(-50%)", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "14px", color: C.texto, whiteSpace: "nowrap", animation: reducido ? "none" : "r5-aparece 200ms ease-out both" }}>
                {INTERFAZ_R5_1.conUeps}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function Latas({ pantalla, onCalificar }) {
  const reducido = useReducido();
  const [vendidas, setVendidas] = useState([]);
  const [aviso, setAviso] = useState(false);
  const [elegida, setElegida] = useState(null);
  const figura = useRef(null);
  const barras = useRef(null);
  const tabla = useRef(null);
  const botones = useRef({});
  const enBandeja = useRef({});
  const vuelo = useRef(null);

  const { compras, vender } = pantalla;
  const primera = compras[0];
  const total = compras.reduce((t, c) => t + c.latas * c.precio, 0);
  const precioDe = (id) => compras.find((c) => id.startsWith(`${c.id}-`)).precio;
  const costo = vendidas.reduce((t, id) => t + precioDe(id), 0);
  const listas = vendidas.length >= vender;
  const ueps = costoDeLatas(compras, vender, "UEPS");
  const quedanDeLaPrimera = Array.from({ length: primera.latas }, (_, k) => idDeLata(primera, k)).some((id) => !vendidas.includes(id));

  const siguienteFoco = (sinEsta) => {
    for (const c of compras) {
      for (let k = 0; k < c.latas; k++) {
        const id = idDeLata(c, k);
        if (id !== sinEsta && !vendidas.includes(id)) return id;
      }
    }
    return null;
  };

  const tocarLata = (compra, k, evento) => {
    evento.stopPropagation();
    terminarAnimaciones(figura.current);
    const id = idDeLata(compra, k);
    if (listas || vendidas.includes(id)) return;
    if (compra.id !== primera.id && quedanDeLaPrimera) {
      setAviso(true);
      const el = botones.current[id];
      if (!reducido && el?.animate) el.animate([{ transform: "none" }, { transform: "translateY(-8px)" }, { transform: "none" }], { duration: SALTO_MS, easing: "ease-in-out" });
      return;
    }
    setAviso(false);
    vuelo.current = { id, rect: botones.current[id]?.querySelector("[data-lata-dibujo]")?.getBoundingClientRect() ?? null };
    const proxima = siguienteFoco(id);
    setVendidas((v) => [...v, id]);
    if (vendidas.length + 1 < vender && proxima) requestAnimationFrame?.(() => botones.current[proxima]?.focus({ preventScroll: true }));
  };

  /* El vuelo de la lata vendida, y el despliegue de la tabla tras la cuarta. */
  useLayoutEffect(() => {
    const v = vuelo.current;
    if (v) {
      vuelo.current = null;
      volarDesde(enBandeja.current[v.id], v.rect, VUELO_MS, { reducido });
    }
    if (listas) {
      if (!reducido && tabla.current?.animate) {
        tabla.current.animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }], { duration: DESPLIEGUE_MS, easing: "ease-out" });
      }
      llevarArriba(barras.current, reducido);
    }
  }, [vendidas.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = (id) => {
    if (elegida) return;
    setElegida(id);
    onCalificar?.({ ok: id === pantalla.opciones.find((o) => o.correcta).id, elegida: id });
  };
  const estadoDe = (o) => {
    if (!elegida) return null;
    if (o.id === elegida) return o.correcta ? "correcta" : "incorrecta";
    return o.correcta ? "revelada" : null;
  };

  return (
    <div data-pantalla-latas>
      <style>{"@keyframes r5-aparece { from { opacity: 0; } to { opacity: 1; } }"}</style>
      <div ref={figura} data-figura="latas" data-vendidas={vendidas.length} onClick={() => terminarAnimaciones(figura.current)} style={{ background: C.navy, borderRadius: "12px", padding: "12px" }}>
        {compras.map((c) => (
          <div key={c.id} data-estante={c.id} style={{ marginBottom: "8px" }}>
            <p style={MARCA_CONTENIDO}>{INTERFAZ_R5_1.marcaCompra(c.marca, c.precio)}</p>
            <div style={{ display: "flex", marginTop: "6px" }}>
              {Array.from({ length: c.latas }, (_, k) => {
                const id = idDeLata(c, k);
                const vendida = vendidas.includes(id);
                return (
                  <button
                    key={id}
                    ref={(el) => { botones.current[id] = el; }}
                    type="button"
                    data-lata={id}
                    data-vendida={vendida ? "si" : "no"}
                    disabled={vendida || listas}
                    aria-label={INTERFAZ_R5_1.lata(c.compra, c.precio)}
                    onClick={(e) => tocarLata(c, k, e)}
                    style={{ width: "44px", height: "48px", padding: 0, border: "none", background: "transparent", display: "flex", alignItems: "flex-end", justifyContent: "center", cursor: vendida || listas ? "default" : "pointer" }}
                  >
                    {!vendida && <Lata />}
                  </button>
                );
              })}
            </div>
            <span aria-hidden="true" style={{ display: "block", height: "2px", background: C.atenuado }} />
          </div>
        ))}
        {/* La bandeja de las vendidas. */}
        <div data-bandeja style={{ marginTop: "12px", minHeight: "68px" }}>
          <p style={MARCA_CONTENIDO}>{INTERFAZ_R5_1.vendidas}</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            {Array.from({ length: vender }, (_, k) => (
              <span key={k} data-hueco={k} style={{ width: "36px", height: "46px", boxSizing: "border-box", borderRadius: "6px", border: `1.5px dashed ${C.atenuado}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {vendidas[k] && <span ref={(el) => { enBandeja.current[vendidas[k]] = el; }} data-en-bandeja={vendidas[k]}><Lata /></span>}
              </span>
            ))}
          </div>
        </div>
        <div ref={barras} data-barras style={{ marginTop: "12px" }}>
          <Barra id="costo" rotulo={INTERFAZ_R5_1.costoVendido} valor={costo} escala={total} relleno ueps={listas ? ueps.costo : null} conUeps reducido={reducido} />
          <Barra id="bodega" rotulo={INTERFAZ_R5_1.enBodega} valor={total - costo} escala={total} relleno={false} ueps={listas ? ueps.bodega : null} reducido={reducido} />
        </div>
        <p aria-live="polite" data-mensaje-latas style={{ margin: "8px 0 0", minHeight: "18px", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: C.texto }}>
          {aviso ? pantalla.mensaje : ""}
        </p>
      </div>
      {listas && (
        <div ref={tabla} data-tabla-latas>
          <p data-pregunta-tabla style={{ margin: "16px 0 0", fontFamily: INTER, fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: C.texto }}>{pantalla.pregunta}</p>
          <div aria-hidden="true" data-cabecera-tabla style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", minHeight: "36px", alignItems: "end", padding: "0 14px 4px 46px", boxSizing: "border-box" }}>
            {pantalla.columnas.map((c) => <span key={c} style={{ fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: C.atenuado }}>{c}</span>)}
          </div>
          {pantalla.opciones.map((o) => (
            <div key={o.id} data-opcion={o.id} style={{ marginTop: "8px" }}>
              <OpcionR5 estado={estadoDe(o)} deshabilitada={Boolean(elegida)} etiqueta={textoDeOpcion(pantalla, o)} onClick={() => elegir(o.id)}>
                <span data-celdas style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
                  {o.celdas.map((x, k) => <span key={k} style={{ fontWeight: 600 }}>{x}</span>)}
                </span>
              </OpcionR5>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
