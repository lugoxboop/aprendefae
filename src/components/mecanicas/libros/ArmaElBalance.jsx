import { useEffect, useMemo, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { FAE } from "../../../theme.js";
import { ACTIVO, PASIVO, PATRIMONIO, DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import { TITULO_ESTADO } from "../../../data/contabilidadBalance.js";
import {
  BALANCES, SECCIONES, evaluarUbicacion, puntuar, pesoDeCadaCuenta,
} from "../../../contabilidad/armaElBalance.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { TEXTO_ATENUADO } from "../../../data/contabilidadIntro.js";
import { Encabezado } from "./tema1/encabezado.jsx";
import { CONSIGNA_TEMA2 } from "../../../data/contabilidadConsignas.js";
import {
  Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre, useNumeroQueSube,
  useMovimientoReducido, SOLO_LECTOR,
} from "./verbos.jsx";
import { TONO_ROTULO } from "./debeHaber/piezasDebeHaber.jsx";
/* Todo lo que se toca mide al menos esto, a lo alto y a lo ancho (Ukyo #585,
 * lote T2-12). Se gana con alto y relleno, nunca con letra: la letra no cambia. */
export const TOQUE_MINIMO = 44;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A2 · ARMA EL BALANCE.
 *
 * Un estado de situación financiera EN BLANCO y las cuentas de la empresa
 * llegando de una en una. Cada acierto ESCRIBE su renglón y el subtotal de
 * esa sección sube; al terminar, las dos cifras de la línea de cierre suben a
 * la vez y coinciden.
 *
 * ═══════════ POR QUÉ UN DOCUMENTO Y NO TRES BOTONES ═══════════
 *
 * «¿De qué familia es esta cuenta?» se puede contestar de memoria. Ponerla en
 * un balance obliga a mirar qué está diciendo el documento: si Aportes
 * sociales acaba entre los pasivos, el balance afirma que la empresa le debe
 * a su propio dueño. La respuesta equivocada no es un fallo abstracto — es un
 * estado financiero que miente.
 *
 * ═══════════ EN UN ERROR NO SE ESCRIBE NADA ═══════════
 *
 * Regla absoluta del tema, y aquí más que en ninguna: un renglón mal
 * clasificado no puede aparecer ni un instante en un documento, porque el
 * documento ES la respuesta. La ficha rebota y vuelve a flotar; el balance no
 * se entera.
 *
 * ═══════════ TRES SECCIONES APILADAS, TAMBIÉN EN EL TELÉFONO ═══════════
 *
 * Aquí apilar SÍ es correcto, al revés que en la mesa de dos casos del
 * Aprender: un balance real se lee de arriba abajo. Lo que no se apila es la
 * comparación —no hay ninguna—, así que nada se pierde.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-a2-rebota {
  0% { transform: translateY(0); }
  35% { transform: translateY(-9px); }
  70% { transform: translateY(3px); }
  100% { transform: translateY(0); }
}
.fae-a2-rebota { animation: fae-a2-rebota 400ms ease-out 1; }
@keyframes fae-a2-pulso { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
.fae-a2-pulso { animation: fae-a2-pulso 2.2s ease-in-out infinite; }
@keyframes fae-a2-renglon { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
.fae-a2-renglon { animation: fae-a2-renglon 500ms cubic-bezier(.3,.9,.4,1) both; }
@media (prefers-reduced-motion: reduce) {
  .fae-a2-rebota, .fae-a2-pulso, .fae-a2-renglon { animation: none !important; }
}
`;

const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

/*
 * ═══════════ LOS TRES ICONOS, DECISIÓN DE XENO ═══════════
 *
 * Los tres son la misma cuenta T en pequeño —el motivo de toda la materia— y
 * lo que los distingue es una sola marca:
 *
 *   Activo      el lado izquierdo relleno: lo que crece por el debe.
 *   Pasivo      el derecho relleno, y un nodo en la PUNTA EXTERIOR de la
 *               barra: la obligación apunta hacia afuera, a un tercero.
 *   Patrimonio  el derecho relleno, y el nodo en el CENTRO, donde las barras
 *               se cruzan: lo que queda en el centro de la estructura.
 *
 * Nunca van solos: siempre con su rótulo escrito al lado.
 */
function IconoSeccion({ seccion, tam = 18 }) {
  const t = tam;
  const lado = seccion === ACTIVO ? DEBE : HABER;
  const color = COLOR_LADO[lado];
  const relleno = seccion === ACTIVO
    ? { x: 1, w: t / 2 - 1 }
    : { x: t / 2, w: t / 2 - 1 };
  const nodo = seccion === PASIVO ? { cx: t - 1.5, cy: t * 0.3 }
    : seccion === PATRIMONIO ? { cx: t / 2, cy: t * 0.3 }
      : null;

  return (
    <svg width={t} height={t} viewBox={`0 0 ${t} ${t}`} aria-hidden="true" style={{ flex: "none" }}>
      <rect x={relleno.x} y={t * 0.34} width={relleno.w} height={t * 0.52} fill={color} opacity="0.32" />
      <line x1="1" y1={t * 0.3} x2={t - 1} y2={t * 0.3} stroke={color} strokeWidth="1.4" />
      <line x1={t / 2} y1={t * 0.3} x2={t / 2} y2={t - 1} stroke={color} strokeWidth="1.4" />
      {nodo && <circle cx={nodo.cx} cy={nodo.cy} r="2.1" fill={color} />}
    </svg>
  );
}

/* Un subtotal que sube contando cuando se le añade un renglón. */
function Subtotal({ valor }) {
  const visible = useNumeroQueSube(valor, 300);
  return (
    <span data-subtotal style={{ ...CIFRA, fontSize: "12px", fontWeight: 700, color: "rgba(248,249,250,0.8)" }}>
      {pesos(visible)}
    </span>
  );
}

function LineaDeCierre({ activos, pasivosMasPatrimonio }) {
  /* Las dos suben A LA VEZ: es la ecuación verificándose, no dos números. */
  const a = useNumeroQueSube(activos, 800);
  const b = useNumeroQueSube(pasivosMasPatrimonio, 800);
  const cuadra = activos === pasivosMasPatrimonio && activos > 0;
  return (
    <div data-cierre-balance style={{
      marginTop: "10px", paddingTop: "9px",
      borderTop: `1px solid ${cuadra ? FAE.teal : "rgba(248,249,250,0.22)"}`,
    }}>
      {[["TOTAL ACTIVOS", a, DEBE], ["TOTAL PASIVOS + PATRIMONIO", b, HABER]].map(([r, v, lado]) => (
        <div key={r} style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
          <span style={{
            flex: 1, minWidth: 0, fontFamily: "Sora, sans-serif", fontSize: "9.5px",
            fontWeight: 700, letterSpacing: "0.1em", color: "rgba(248,249,250,0.55)",
          }}>
            {r}
          </span>
          <span data-total={lado} style={{ ...CIFRA, fontSize: "13px", fontWeight: 700, color: TONO_ROTULO[lado] }}>
            {pesos(v)}
          </span>
        </div>
      ))}
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente. `items` le da las cuentas del ejemplo y `empresa`
 * el encabezado del documento (el ejemplo no es de Caleja ni del lavadero);
 * `modoDemo` le quita la consigna, el avance y el botón de seguir, y no llama
 * a `onCompletar`: ni FP, ni intentos, ni progreso. Con una sola cuenta, el
 * documento no está completo, así que tampoco se dibuja la línea de cierre.
 */
export default function ArmaElBalance({
  Marco, rotulo, titulo, acento, onCompletar,
  items = null, empresa = null, modoDemo = false, onComoSeJuega = null,
}) {
  const reducido = useMovimientoReducido();
  const sortear = () => {
    if (items) return items;
    const balance = barajar(BALANCES)[0];
    return barajar(balance.cuentas).map((c) => ({ ...c, balance: balance.id }));
  };
  const t = useTanda(sortear);

  const balance = useMemo(
    () => (empresa ? { empresa } : BALANCES.find((b) => b.id === t.items[0]?.balance) ?? BALANCES[0]),
    [t.items, empresa],
  );

  /* Lo escrito, en el orden en que se acertó. El error no escribe nunca. */
  const [escritas, setEscritas] = useState([]);
  const [retro, setRetro] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(null);
  const reloj = useRef(null);

  const item = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  useEffect(() => () => clearTimeout(reloj.current), []);

  const arrastre = useArrastre({
    onSoltar: (_ficha, destino) => {
      if (SECCIONES.some((s) => s.id === destino)) responder(destino);
    },
  });

  const totalDe = (seccion) => escritas
    .filter((c) => c.seccion === seccion)
    .reduce((s, c) => s + c.valor, 0);
  const activos = totalDe(ACTIVO);
  const pasivosMasPatrimonio = totalDe(PASIVO) + totalDe(PATRIMONIO);

  const responder = (seccion) => {
    /* Se responde si no hay devolución, o si la que hay es el primer fallo. */
    if (retro && !(retro.primero && !retro.ok)) return;
    const r = evaluarUbicacion(item, seccion);

    if (!r.ok) {
      if (!reducido) {
        setRebotando(seccion);
        clearTimeout(reloj.current);
        reloj.current = setTimeout(() => setRebotando(null), 420);
      }
      arrastre.limpiar();
    } else {
      /* Solo el acierto escribe el renglón. */
      setEscritas((xs) => [...xs, item]);
    }

    if (intento === 0) {
      t.anotar(item.id, r.ok, r.ok ? null : seccion);
      if (!r.ok) { setRetro({ ...r, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: item.id, primeroOk: true }]);
      setRetro({ ...r, primero: true });
      return;
    }
    setRespuestas((xs) => [...xs, { id: item.id, primeroOk: false, segundoOk: r.ok }]);
    setRetro({ ...r, primero: false, ultimo: true });
  };

  const avanzar = () => {
    setRetro(null); setIntento(0); setRebotando(null); arrastre.limpiar();
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setIntento(0); setEscritas([]); setRespuestas([]);
    setRebotando(null); arrastre.limpiar();
  };

  const esperandoReintento = retro && !retro.ok && retro.primero;
  const resaltadas = new Set((retro?.resaltar ?? []).map((x) => x.seccion));
  const rotuloDe = (s) => (retro?.resaltar ?? []).find((x) => x.seccion === s)?.rotulo ?? null;

  const cerrado = t.terminado;
  const terminado = !modoDemo && (cerrado || escritas.length === cuantas);

  /* ── El documento, que se dibuja igual jugando y al cerrar ── */
  const documento = (
    <div data-balance style={{
      padding: "12px 13px", borderRadius: "14px",
      background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
    }}>
      <p style={{
        margin: "0 0 2px", fontFamily: "Sora, sans-serif", fontWeight: 700,
        fontSize: "12.5px", textAlign: "center", color: FAE.text,
      }}>
        {balance.empresa}
      </p>
      {/*
        SIN FECHA a propósito: el libro encabeza «A 31 de diciembre» un
        ejercicio que ocurre entero en enero. No se corrige por cuenta propia
        ni se muestra una fecha que puede ser errata.
      */}
      <p style={{ margin: "0 0 2px", fontSize: "10.5px", textAlign: "center", color: "rgba(248,249,250,0.5)" }}>
        {TITULO_ESTADO}
      </p>
      {/*
        En qué momento de la empresa está hecha esta foto. Caleja sale en dos
        capítulos con dos cierres distintos —465.000 y 415.000— y sin este
        renglón los dos balances se leen como si uno de los dos estuviera mal.
      */}
      {balance.subtitulo && (
        <p data-subtitulo style={{ margin: "0 0 11px", fontSize: "9.5px", textAlign: "center", color: "rgba(248,249,250,0.42)" }}>
          {balance.subtitulo}
        </p>
      )}

      {SECCIONES.map((s) => {
        const renglones = escritas.filter((c) => c.seccion === s.id);
        const resaltada = resaltadas.has(s.id);
        return (
          <button
            key={s.id}
            type="button"
            data-seccion={s.id}
            data-destino={!retro || esperandoReintento ? s.id : undefined}
            data-resaltada={resaltada ? "si" : "no"}
            disabled={Boolean(retro) && !esperandoReintento}
            aria-label={`${s.nombre}: ${s.pie}`}
            onClick={!retro || esperandoReintento ? () => responder(s.id) : undefined}
            className={rebotando === s.id ? "fae-a2-rebota" : undefined}
            style={{
              display: "block", width: "100%", textAlign: "left", marginBottom: "9px",
              padding: "8px 9px", borderRadius: "11px",
              cursor: !retro || esperandoReintento ? "pointer" : "default",
              /*
               * Resaltado neutro de sección: fondo tenue + borde izquierdo
               * sólido. Todo en propiedades largas: mezclar `border` con
               * `borderLeft*` hacía que React avisara en cada repintado, y con
               * razón —el orden en que se aplican no está garantizado—.
               */
              background: resaltada ? "rgba(184,196,212,0.13)" : "rgba(10,20,34,0.3)",
              borderTopWidth: "1px", borderRightWidth: "1px", borderBottomWidth: "1px",
              borderStyle: rebotando === s.id ? "dashed" : "solid",
              borderTopColor: rebotando === s.id ? FAE.coral : "rgba(248,249,250,0.1)",
              borderRightColor: rebotando === s.id ? FAE.coral : "rgba(248,249,250,0.1)",
              borderBottomColor: rebotando === s.id ? FAE.coral : "rgba(248,249,250,0.1)",
              borderLeftWidth: "3px",
              borderLeftColor: resaltada ? "#B8C4D4" : (rebotando === s.id ? FAE.coral : "transparent"),
              borderLeftStyle: "solid",
              transition: "background 200ms ease, border-color 200ms ease",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <IconoSeccion seccion={s.id} />
              <span style={{
                fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.12em", color: "rgba(248,249,250,0.75)",
              }}>
                {s.nombre.toUpperCase()}
              </span>
              {rotuloDe(s.id) && (
                <span data-chip style={{
                  padding: "1px 6px", borderRadius: "6px", background: "#B8C4D4",
                  color: "#1D3557", fontFamily: "Sora, sans-serif", fontSize: "9.5px", fontWeight: 700,
                }}>
                  {rotuloDe(s.id)}
                </span>
              )}
              <span style={{ flex: 1 }} />
              {renglones.length > 0 && <Subtotal valor={totalDe(s.id)} />}
            </span>

            {renglones.length === 0
              ? <span data-vacia style={{ display: "block", fontSize: "11px", color: TEXTO_ATENUADO }}>— en blanco —</span>
              : renglones.map((c) => (
                <span
                  key={c.id}
                  data-renglon={c.cuenta}
                  className="fae-a2-renglon"
                  style={{ display: "flex", gap: "8px", alignItems: "baseline", padding: "1px 0" }}
                >
                  <span style={{ flex: 1, minWidth: 0, fontSize: "12px", color: FAE.text }}>{c.cuenta}</span>
                  <span style={{ ...CIFRA, fontSize: "12px", color: "rgba(248,249,250,0.75)" }}>{pesos(c.valor)}</span>
                </span>
              ))}
          </button>
        );
      })}

      {terminado && <LineaDeCierre activos={activos} pasivosMasPatrimonio={pasivosMasPatrimonio} />}
    </div>
  );

  if (cerrado) {
    const bien = respuestas.filter((r) => r.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otro balance">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada cuenta valía {pesoDeCadaCuenta(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
        <div style={{ marginTop: "14px" }}>{documento}</div>
        <p style={SOLO_LECTOR}>
          Balance completo de {balance.empresa}. Total activos {pesos(balance.activos)}.
          Total pasivos {pesos(balance.pasivos)} más patrimonio {pesos(balance.patrimonio)},
          que suman {pesos(balance.pasivosMasPatrimonio)}. Las dos cifras coinciden.
        </p>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <EstilosDeVerbos />
      {!modoDemo && (
        <>
          <Encabezado consigna={CONSIGNA_TEMA2["cu-de-que-familia"]} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (retro && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Cuenta" />
          </div>
        </>
      )}

      {documento}

      {(!retro || esperandoReintento) && (
        <>
          <p style={{
            margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
            fontWeight: 700, letterSpacing: "0.16em", color: acento,
          }}>
            {esperandoReintento ? "INTÉNTALO OTRA VEZ" : "ARRASTRA CADA CUENTA A SU SECCIÓN"}
          </p>
          <div
            className={rebotando ? undefined : "fae-a2-pulso"}
            onKeyDown={(e) => {
              if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
              e.preventDefault();
              const k = SECCIONES.findIndex((s) => s.id === (arrastre.tomada ?? SECCIONES[0].id));
              const paso = e.key === "ArrowDown" ? 1 : -1;
              const destino = SECCIONES[(Math.max(0, k) + paso + SECCIONES.length) % SECCIONES.length];
              responder(destino.id);
            }}
          >
            <Ficha
              valor={item.valor}
              lado={DEBE}
              texto={`${item.cuenta} · ${pesos(item.valor)}`}
              alto={TOQUE_MINIMO}
              color="rgba(248,249,250,0.55)"
              tomada={arrastre.tomada === item.id}
              onClick={() => arrastre.tocar(item.id)}
              gestos={arrastre.gestos(item.id)}
              etiqueta={`${item.cuenta}, ${pesos(item.valor)}. Con la ficha tomada, las flechas arriba y abajo recorren las tres secciones.`}
            />
          </div>
          <FichaEnVuelo
            valor={0}
            texto={arrastre.tomada ? `${item.cuenta} · ${pesos(item.valor)}` : null}
            lado={DEBE}
            puntero={arrastre.puntero}
          />
          {esperandoReintento && (
            <p data-fallo style={{
              margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
              fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
              border: `1px dashed ${FAE.coral}`,
            }}>
              No se escribió nada: la cuenta volvió a la mano.
            </p>
          )}
        </>
      )}

      {retro && <Retro texto={retro.texto} />}

      {retro && !esperandoReintento && !modoDemo && (
        <Responder onClick={avanzar}>
          {t.i + 1 === cuantas ? "Ver el balance cerrado" : "Siguiente cuenta"}
        </Responder>
      )}
    </Marco>
  );
}
