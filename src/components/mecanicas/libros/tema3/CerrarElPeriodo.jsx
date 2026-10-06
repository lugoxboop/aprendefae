import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { EMPRESA_CIERRE, PASTILLA_CIERRE, PIE_CIERRE } from "../../../../data/contabilidadTema3Cierre.js";
import { pesos } from "../../../../contabilidad/dosLineas.js";
import {
  estadoPasoCierre, gananciasYPerdidas, conQuedaDesde7, filasDe, duracionPasoCierre, asientoEnTexto, NOMBRES_INGRESOS,
  PASOS_CIERRE, DIAGRAMA, ASIENTO, MS_VUELO, ESCALON_VUELO,
} from "../../../../contabilidad/cerrarElPeriodo.js";
import { useReducido, ENTRADA } from "./DosLineas.jsx";
import AsientoTema3 from "./AsientoTema3.jsx";
import { ZonaA, ZonaB, ZonaC, Diagrama, volar, CSS_CIERRE } from "./EscenaCierre.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «CERRAR EL PERIODO» · CAPA 2 · «MÍRELO FUNCIONAR» — 8 pasos (Xeno, P2 §3).
 *
 * Siete segmentos y el cierre. El texto va ARRIBA de la escena (cinco líneas
 * reservadas) y los controles quedan FIJOS al pie de la pantalla mientras la
 * capa está a la vista: es la pieza más alta del tema y así el texto queda
 * junto a la animación y los botones no se alejan.
 *
 * ═══════════ POR QUÉ NO ES `position: sticky` ═══════════
 *
 * El fondo de la materia (compartido) lleva `overflow: hidden`, y con eso
 * `sticky` no se pega a nada. En su lugar: un hueco de 104 px al final de la
 * capa, que es el «espacio al final» de Levi; mientras la capa está a la
 * vista y el hueco todavía no entra en pantalla, los controles se pintan
 * fijos abajo, a su mismo ancho; cuando el hueco aparece, se quedan en él.
 * Así nunca tapan el último contenido.
 *
 * ═══════════ EL SALDO NUNCA DESAPARECE SIN LLEGAR A OTRO LADO ═══════════
 *
 * Al llegar a los pasos 3 y 5 desde el anterior, la ficha de cada saldo sale
 * de su fila y vuela a su mitad (los gastos, escalonados 160 ms). La fila
 * baja a $0 en 400 ms mientras vuela, y la cifra de Ganancias y pérdidas
 * cuenta hacia arriba al llegar. El valor final queda siempre escrito.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const ALTO_CONTROLES = 104;
const SOLO_LECTOR = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };
const botonBase = {
  flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: SORA, fontSize: "14px", fontWeight: 600,
  cursor: "pointer", boxSizing: "border-box",
};
const DESACTIVADO = { background: "transparent", border: `2px solid ${COLOR.quieto}`, color: COLOR.apagado, cursor: "default" };

/*
 * Los controles se pintan fijos mientras la capa está a la vista y su hueco
 * aún no entra. Es siempre el mismo nodo (solo cambia su estilo), así que el
 * foco no se pierde al pasar de fijo a su sitio.
 */
function useFijos(contenedor, hueco) {
  const [fijo, setFijo] = useState(null);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const c = contenedor.current;
    const h = hueco.current;
    if (!c || !h) return undefined;
    const vis = { capa: false, hueco: false };
    const medir = () => {
      const r = h.getBoundingClientRect();
      const abajo = r.top > (globalThis.innerHeight ?? 0);
      setFijo(vis.capa && !vis.hueco && abajo ? { left: r.left, width: r.width } : null);
    };
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (e.target === c) vis.capa = e.isIntersecting;
        if (e.target === h) vis.hueco = e.isIntersecting && e.intersectionRatio >= 0.99;
      }
      medir();
    }, { threshold: [0, 0.99, 1] });
    io.observe(c);
    io.observe(h);
    globalThis.addEventListener?.("resize", medir);
    return () => { io.disconnect(); globalThis.removeEventListener?.("resize", medir); };
  }, [contenedor, hueco]);
  return fijo;
}

export default function CerrarElPeriodo() {
  const reducido = useReducido();
  const [paso, setPaso] = useState(1);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [atras, setAtras] = useState(false);
  const transicion = useRef({ paso: 1, desde: 1 });
  if (transicion.current.paso !== paso) transicion.current = { paso, desde: transicion.current.paso };
  const desde = transicion.current.desde;
  const estado = estadoPasoCierre(paso);
  const idAlt = useId();
  const capa = useRef(null);
  const escena = useRef(null);
  const hueco = useRef(null);
  const fijo = useFijos(capa, hueco);

  /*
   * Lo que se pinta: las filas vaciadas (`enFilas`) y lo que ya llegó a
   * Ganancias y pérdidas (`llegadas`). Sin vuelo, las dos son las del paso.
   */
  const [enFilas, setEnFilas] = useState(estado.vaciadas);
  const [llegadas, setLlegadas] = useState(estado.vaciadas);
  const relojes = useRef([]);
  const vuela = estado.vuelan.length > 0 && desde === paso - 1 && !reducido;

  useLayoutEffect(() => {
    relojes.current.forEach(clearTimeout);
    relojes.current = [];
    const final = estado.vaciadas;
    if (!vuela) { setEnFilas(final); setLlegadas(final); return undefined; }
    /* Arranca con lo del paso anterior y vacía una por una. */
    const antes = estadoPasoCierre(paso - 1).vaciadas;
    setEnFilas(antes);
    setLlegadas(antes);
    const lado = estado.vuelan[0] && NOMBRES_INGRESOS.includes(estado.vuelan[0]) ? "haber" : "debe";
    const t0 = setTimeout(() => {
      const caja = escena.current;
      const destino = caja?.querySelector(`[data-gyp-mitad="${lado}"]`)?.getBoundingClientRect();
      volar(caja, estado.vuelan.map((c, k) => ({
        desde: caja?.querySelector(`[data-fila="${c}"] [data-saldo-fila]`)?.getBoundingClientRect(),
        hasta: destino,
        texto: pesos(filasDe([]).find((f) => f.cuenta === c).saldo),
        retraso: k * ESCALON_VUELO,
      })), { reducido });
      estado.vuelan.forEach((c, k) => {
        relojes.current.push(setTimeout(() => setEnFilas((xs) => [...new Set([...xs, c])]), k * ESCALON_VUELO));
        relojes.current.push(setTimeout(() => setLlegadas((xs) => [...new Set([...xs, c])]), k * ESCALON_VUELO + MS_VUELO));
      });
      /* Respaldo: pase lo que pase, al final queda el estado del paso. */
      relojes.current.push(setTimeout(() => { setEnFilas(final); setLlegadas(final); }, estado.vuelan.length * ESCALON_VUELO + MS_VUELO + 200));
    }, 30);
    relojes.current.push(t0);
    return () => { relojes.current.forEach(clearTimeout); relojes.current = []; setEnFilas(final); setLlegadas(final); };
  }, [paso]); // eslint-disable-line react-hooks/exhaustive-deps

  /* El texto del paso cambia con un cruce de 150 ms y la región viva lo anuncia. */
  const [mostrado, setMostrado] = useState(paso);
  useEffect(() => {
    if (reducido) { setMostrado(paso); return undefined; }
    const t = setTimeout(() => setMostrado(paso), 150);
    return () => clearTimeout(t);
  }, [paso, reducido]);
  const textoMostrado = estadoPasoCierre(mostrado).texto;

  useEffect(() => {
    if (!reproduciendo) return undefined;
    if (paso >= PASOS_CIERRE) { setReproduciendo(false); return undefined; }
    const t = setTimeout(() => { setAtras(false); setPaso((p) => Math.min(PASOS_CIERRE, p + 1)); }, duracionPasoCierre(estado.texto));
    return () => clearTimeout(t);
  }, [reproduciendo, paso]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!reproduciendo) return undefined;
    const alOcultar = () => { if (document.visibilityState === "hidden") setReproduciendo(false); };
    document.addEventListener("visibilitychange", alOcultar);
    return () => document.removeEventListener("visibilitychange", alOcultar);
  }, [reproduciendo]);

  const ir = (nuevo) => {
    setReproduciendo(false);
    setAtras(nuevo < paso);
    setPaso(Math.min(PASOS_CIERRE, Math.max(1, nuevo)));
  };
  const primero = paso === 1;
  const ultimo = paso === PASOS_CIERRE;
  const fundido = reducido || atras ? undefined : `fae-ci-fundido 250ms ${ENTRADA} both`;
  const gyp = conQuedaDesde7(paso, gananciasYPerdidas(llegadas));
  const filas = filasDe(enFilas);

  const controles = (
    <div data-controles-cierre data-fijos={fijo ? "si" : "no"} style={{
      boxSizing: "border-box", height: `${ALTO_CONTROLES}px`, padding: "10px 0 6px",
      borderTop: `1.5px solid ${COLOR.quieto}`, background: FAE.bg,
      ...(fijo ? { position: "fixed", bottom: 0, left: `${fijo.left}px`, width: `${fijo.width}px`, zIndex: 20 } : {}),
    }}>
      <div className="fae-dl" style={{ display: "flex", gap: "9px" }}>
        <button type="button" data-anterior disabled={primero} onClick={() => ir(paso - 1)}
          style={{ ...botonBase, ...(primero ? DESACTIVADO : { background: "transparent", border: `2px solid ${COLOR.neutro}`, color: COLOR.blanco }) }}>
          Anterior
        </button>
        <button type="button" data-siguiente disabled={ultimo} onClick={() => ir(paso + 1)}
          style={{ ...botonBase, ...(ultimo ? DESACTIVADO : { background: COLOR.neutro, border: `2px solid ${COLOR.neutro}`, color: COLOR.navy }) }}>
          Siguiente
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "40px", marginTop: "2px" }}>
        <button
          type="button"
          data-reproducir
          aria-pressed={ultimo ? undefined : reproduciendo}
          onClick={() => { if (ultimo) { ir(1); return; } setAtras(false); setReproduciendo((r) => !r); }}
          style={{
            minHeight: "40px", padding: "0 4px", background: "transparent", border: "none", cursor: "pointer",
            fontFamily: SORA, fontSize: "13px", fontWeight: 600, color: COLOR.blanco, textDecoration: "underline", textUnderlineOffset: "3px",
          }}
        >
          {ultimo ? "Ver de nuevo" : reproduciendo ? "Pausa" : "Reproducir"}
        </button>
        <span data-paso-de style={{ fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>Paso {paso} de {PASOS_CIERRE}</span>
      </div>
    </div>
  );

  return (
    <div ref={capa} className="fae-ci" data-capa2-cierre>
      <style>{CSS_CIERRE}</style>

      {/* El texto del paso, ARRIBA: cinco líneas reservadas para que la escena no salte. */}
      <div data-texto-paso aria-live="polite" aria-atomic="true" style={{ minHeight: "115px", margin: "0 0 10px", padding: "0 4px" }}>
        <p key={mostrado} aria-describedby={estadoPasoCierre(mostrado).alternativo ? idAlt : undefined} style={{
          margin: 0, fontFamily: INTER, fontSize: "14.5px", lineHeight: 1.55, color: COLOR.blanco,
          animation: reducido ? undefined : `fae-ci-fundido 150ms ${ENTRADA} both`,
        }}>
          {textoMostrado}
        </p>
      </div>
      {estado.alternativo && <p id={idAlt} style={SOLO_LECTOR}>{estado.alternativo}</p>}

      <div ref={escena} data-escenario data-modo={estado.modo} style={{ position: "relative", padding: "0 4px" }}>
        {estado.modo === DIAGRAMA && <Diagrama anima={Boolean(fundido)} />}

        {estado.modo === ASIENTO && (
          <div key={`asiento-${paso}`} style={{ animation: fundido }}>
            <p style={{ margin: "0 0 10px" }}>
              <span data-empresa-cierre style={{
                display: "inline-flex", gap: "5px", padding: "3px 11px", borderRadius: "999px", border: `1.5px solid ${COLOR.neutro}`,
                fontFamily: INTER, fontSize: "13px", color: COLOR.apagado,
              }}>
                Empresa: <strong style={{ color: COLOR.blanco }}>{EMPRESA_CIERRE}</strong>
              </span>
            </p>
            <AsientoTema3 asiento={estado.asiento} anima={!atras} reducido={reducido} conPastilla textoPastilla={PASTILLA_CIERRE}
              alto={paso === 4 ? 128 : 0} lineas={3} />
            <div role="group" aria-label="Asiento" style={SOLO_LECTOR}><p>{asientoEnTexto(estado.asiento)}</p></div>
            <div style={{ marginTop: "14px" }}><ZonaB gyp={gyp} reducido={reducido} compacto /></div>
          </div>
        )}

        {estado.modo !== DIAGRAMA && estado.modo !== ASIENTO && (
          <div key="cuentas">
            <ZonaA filas={filas} reducido={reducido} />
            <ZonaB gyp={gyp} reducido={reducido} />
          </div>
        )}

        <ZonaC cuentas={estado.zonaC} />
        <p data-pie-cierre style={{ margin: "8px 0 14px", fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{PIE_CIERRE}</p>
      </div>

      {/* El hueco del final: aquí se quedan los controles cuando llegan. */}
      <div ref={hueco} data-hueco-controles style={{ height: `${ALTO_CONTROLES}px` }}>
        {controles}
      </div>
    </div>
  );
}
