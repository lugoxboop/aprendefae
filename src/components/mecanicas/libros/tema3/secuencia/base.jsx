/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LO COMÚN A LAS SECUENCIAS DE APRENDER (Célula E).
 *
 * T3 Aprender va sobre SecuenciaAprender (src/components/secuencia/, de
 * Erwin), que NO se toca. Aquí está lo que T3 le pasa: la figura de cada
 * pantalla, según la v3 de Itagaki (paquete e3-t3-secuencias-aprender-v3.md).
 *
 * ═══════════ EL REPARTO FIJO DE LA FIGURA (§1, D5) ═══════════
 *
 *              320     375
 *   modelo      98     148
 *   separación   8       8
 *   control     44      44      se reserva SIEMPRE, aunque esté vacía
 *   ─────────────────────────
 *   total      150     200
 *
 * Debajo, dentro del mismo <figure>, la ZONA DEL APOYO: el texto de la
 * pantalla, la pista del primer error o el porqué. Va dentro de la figura
 * porque el apoyo del contenedor es fijo y aquí cambia (D3: la pista
 * reemplaza al apoyo y en el intento siguiente se retira). Es lo mismo que
 * hizo T4 (`.t4-sec`): la clase `.t3-sec` envuelve el contenedor en la vista y
 * deja el <figure> en `auto`, sin tocar SecuenciaAprender.
 *
 * ═══════════ EL HAZ (D3 de Takamura, regla C2) ═══════════
 *
 *   sin responder ...... el apoyo de antes
 *   primer error ....... «No va aquí» y la PISTA en lugar del apoyo
 *   intento siguiente .. la pista se retira: acierto → «Correcto» y el apoyo
 *                        de después; segundo error → el estado correcto y el
 *                        porqué (el error de la opción, del lote 7) en lugar
 *                        del apoyo; si la opción no trae error, el apoyo
 *
 * Lo que la figura recuerda es JSON (se guarda en la pestaña).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { FAE } from "../../../../../theme.js";
import { HAZ_INICIAL, hazResuelto, mostrarCorrecto, responderHaz } from "../../../../secuencia/secuencia.js";

export const C = {
  texto: "#F8F9FA",
  blanco: "#FFFFFF",
  neutro: "#B8C4D4",
  apagado: "#A8B6C8",
  quieto: "#8C9BB0",
  cuerpo: "rgba(248,249,250,0.8)",
  error: FAE.coral,
  fondo: "#0E1B2E",
};

export const ALTO = { modelo320: 98, modelo375: 148, separacion: 8, control: 44 };
export const ALTO_FIGURA_T3 = { a320: ALTO.modelo320 + ALTO.separacion + ALTO.control, a375: ALTO.modelo375 + ALTO.separacion + ALTO.control };

/*
 * «Mono 12» del paquete: el sitio no carga ninguna fuente monoespaciada, así
 * que las cifras van en Inter con cifras tabulares, como las publicadas de T3
 * (CIFRAS en DosLineas.jsx). Las cifras alinean igual y no cambia la letra.
 */
export const MONO = '"Inter", sans-serif';
export const pesos = (n) => `$${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

export const CSS_T3S = `
.t3-sec .fae-sec-figura { height: auto; }
.t3s { display: flex; flex-direction: column; min-width: 0; color: ${C.texto}; font-family: "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t3s * { box-sizing: border-box; }
.t3s-modelo { position: relative; height: ${ALTO.modelo320}px; min-width: 0; }
.t3s-control { height: ${ALTO.control}px; margin-top: ${ALTO.separacion}px; display: flex; gap: 8px; min-width: 0; }
@media (min-width: 375px) and (min-height: 640px) { .t3s-modelo { height: ${ALTO.modelo375}px; } }
.t3s-zona { margin-top: 12px; display: grid; gap: 2px; align-content: start; }
.t3s-t { margin: 0; font: 400 14px/22px "Inter", sans-serif; color: ${C.cuerpo}; overflow-wrap: break-word; }
.t3s-t[data-fuerte] { color: ${C.texto}; }
.t3s-paso { margin: 0; font: 400 12px/16px "Inter", sans-serif; color: ${C.apagado}; }
.t3s-rot { margin: 0; font: 700 12px/16px "Inter", sans-serif; color: ${C.texto}; }
.t3s-pastilla { position: absolute; top: 0; right: 0; z-index: 3; display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: 999px; border: 2px solid ${C.texto}; color: ${C.texto}; background: ${C.fondo}; font: 600 12px/16px "Inter", sans-serif; white-space: nowrap; }
.t3s-pastilla[data-ver="mal"] { border-color: ${C.error}; color: ${C.error}; }
.t3s-ctl { appearance: none; flex: 1 1 0; min-width: 0; height: 44px; border-radius: 8px; border: 1px solid ${C.quieto}; background: transparent; color: ${C.texto}; font: 600 13px/16px "Inter", sans-serif; cursor: pointer; padding: 0 4px; text-align: center; hyphens: manual; overflow-wrap: normal; word-break: keep-all; }
.t3s-ctl[data-ver] { border-width: 2px; border-color: ${C.texto}; }
.t3s-ctl[data-ver="mal"] { border-color: ${C.error}; }
.t3s-ctl[data-activa] { border-width: 2px; border-color: ${C.texto}; }
.t3s-ctl[aria-disabled="true"] { cursor: default; color: ${C.apagado}; }
.t3s-ctl:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t3s-ctl[data-flecha] { flex: 0 0 44px; font-size: 18px; }
.t3s-ctl[data-centro] { flex: 1 1 0; }
.t3s-carril { position: relative; height: 12px; }
.t3s-carril::before { content: ""; position: absolute; left: 0; right: 0; top: 5px; height: 2px; background: ${C.quieto}; }
.t3s-marca { position: absolute; top: 1px; width: 10px; height: 10px; margin-left: -5px; }
.t3s-rotulo { height: 16px; font: 600 12px/16px "Inter", sans-serif; color: ${C.apagado}; white-space: nowrap; overflow: hidden; text-overflow: clip; }
.t3s-cifras { height: 16px; font: 400 12px/16px "Inter", sans-serif; color: ${C.apagado}; white-space: nowrap; }
.t3s-cifras b { font: 600 12px/16px ${MONO}; color: ${C.texto}; }
.t3s-nueva { animation: t3s-cae 200ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes t3s-cae { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.t3s-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@media (prefers-reduced-motion: reduce) { .t3s *, .t3s *::before, .t3s *::after { transition: none !important; animation: none !important; } }
`;

/* ═══════════ EL MARCO DE LA FIGURA ═══════════ */

/**
 * modelo   lo que se dibuja (alto fijo)
 * control  la fila de control (44, reservada aunque vaya vacía)
 * zona     [{ texto, fuerte?, rotulo?, paso? }]: el apoyo, la pista o el porqué
 * ver      "bien" | "mal" | null: la pastilla de la esquina del modelo
 */
export function Figura({ modelo = null, control = null, zona = [], ver = null, ...datos }) {
  return (
    <div className="t3s" {...datos}>
      <style>{CSS_T3S}</style>
      <div className="t3s-modelo" data-modelo>
        {modelo}
        {ver && (
          <span className="t3s-pastilla" data-ver={ver} data-mensaje={ver === "bien" ? "acierto" : "error"} role="status">
            <span aria-hidden="true">{ver === "bien" ? "✓" : "✕"}</span>
            {ver === "bien" ? "Correcto" : "No va aquí"}
          </span>
        )}
      </div>
      <div className="t3s-control" data-control>{control}</div>
      <div className="t3s-zona" data-zona aria-live="polite">
        {zona.filter(Boolean).map((z, k) => (
          z.paso ? <p key={k} className="t3s-paso" data-paso-zona>{z.paso}</p>
            : z.pie ? <p key={k} className="t3s-paso" data-pie>{z.pie}</p>
            : z.rotulo ? <p key={k} className="t3s-rot" data-rotulo-zona>{z.rotulo}</p>
              : <p key={k} className="t3s-t" data-fuerte={z.fuerte ? "" : undefined} data-texto={z.tipo ?? "apoyo"}>{z.texto}</p>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ EL HAZ DE UNA ELECCIÓN ═══════════ */

/* estado = { ...HAZ, eleccion } */
export const HAZ_T3 = { ...HAZ_INICIAL, eleccion: null };

export function elegir(estado, eleccion, correcta) {
  const e = estado ?? HAZ_T3;
  if (hazResuelto(e)) return e;
  return { ...responderHaz(e, eleccion === correcta), eleccion };
}

/** Lo que el modelo enseña: la consecuencia, cuando ya acertó o con dos errores. */
export const conConsecuencia = (estado) => hazResuelto(estado);

/** La pastilla: tras el primer error y tras acertar; con dos errores, el estado correcto lleva «Correcto» no: va sin pastilla verde. */
export function verDe(estado) {
  if (!estado?.ultimo) return null;
  if (estado.ok) return "bien";
  return "mal";
}

/**
 * La zona según D3. `antes` y `despues` son listas de bloques de zona; `pista`
 * un texto; `porque(eleccion)` el error de esa opción (o null).
 */
export function zonaHaz(estado, { antes = [], despues = [], pista = null, porque = null }) {
  const e = estado ?? HAZ_T3;
  if (e.ok) return despues;
  if (mostrarCorrecto(e)) {
    const p = porque?.(e.eleccion);
    /* Solo el porqué: con el apoyo de después pasa de 4 líneas a 320 (medido: 5 a 7). */
    return p ? [{ texto: p, fuerte: true, tipo: "porque" }] : despues;
  }
  if (e.ultimo === "error" && e.intentos === 1 && pista) return [{ texto: pista, fuerte: true, tipo: "pista" }];
  return antes;
}

/** El veredicto de cada botón: la elegida con su marca; con dos errores, solo la correcta. */
export function verBoton(estado, id, correcta) {
  const e = estado;
  if (!e?.ultimo) return null;
  if (mostrarCorrecto(e)) return id === correcta ? "bien" : null;
  if (e.eleccion !== id) return null;
  return e.ok ? "bien" : "mal";
}

/** Los botones de elección de la fila de control: 2 de 125, 3 de 80 o 4 de 58 a 320. */
export function Botones({ opciones, estado, correcta, onElegir, nombre }) {
  const resuelto = hazResuelto(estado);
  return (
    <div role="group" aria-label={nombre} style={{ display: "flex", gap: "8px", flex: "1 1 0", minWidth: 0 }}>
      {opciones.map((o) => {
        const ver = verBoton(estado, o.id, correcta);
        return (
          <button
            key={o.id}
            type="button"
            className="t3s-ctl"
            data-opcion={o.id}
            data-ver={ver ?? undefined}
            aria-disabled={resuelto ? "true" : undefined}
            aria-pressed={estado?.eleccion === o.id ? "true" : "false"}
            onClick={resuelto ? undefined : () => onElegir(o.id)}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}

/**
 * El control ‹ › (44 + centro + 44). `valores` es la lista de posiciones;
 * `rotulo(v)` lo que dice el centro. Tocar el centro confirma.
 */
export function ControlFlechas({ valores, indice, onMover, onConfirmar, rotulo, nombre, apagado = false, ver = null }) {
  const i = Math.max(0, Math.min(valores.length - 1, indice));
  return (
    <div role="group" aria-label={nombre} style={{ display: "flex", gap: "8px", flex: "1 1 0", minWidth: 0 }}>
      <button type="button" className="t3s-ctl" data-flecha="antes" aria-label="Anterior posición" aria-disabled={apagado || i === 0 ? "true" : undefined} onClick={apagado || i === 0 ? undefined : () => onMover(i - 1)}>‹</button>
      <button type="button" className="t3s-ctl" data-centro data-ver={ver ?? undefined} aria-disabled={apagado ? "true" : undefined} onClick={apagado ? undefined : () => onConfirmar(valores[i])}>
        {rotulo(valores[i])}
      </button>
      <button type="button" className="t3s-ctl" data-flecha="despues" aria-label="Siguiente posición" aria-disabled={apagado || i === valores.length - 1 ? "true" : undefined} onClick={apagado || i === valores.length - 1 ? undefined : () => onMover(i + 1)}>›</button>
    </div>
  );
}

/* ═══════════ LA PISTA COMPACTA (§1: rótulo 16, carril 12, marca de 10 sin tallo) ═══════════ */

/*
 * Forma = qué pista (cuadrado: ingresos y gastos; círculo: caja); relleno =
 * sentido (lleno suma, vacío resta). Sin tallo: la dirección la dice el
 * relleno. La marca actual en #FFFFFF; las anteriores en #B8C4D4 (nunca texto).
 */
export function MarcaCompacta({ forma, llena, actual = true, nueva = false, retraso = 0, x }) {
  const color = actual ? C.blanco : C.neutro;
  return (
    <span
      aria-hidden="true"
      className={`t3s-marca${nueva ? " t3s-nueva" : ""}`}
      data-marca-compacta={`${forma}-${llena ? "llena" : "vacia"}`}
      style={{
        left: x,
        borderRadius: forma === "circulo" ? "50%" : "2px",
        background: llena ? color : C.fondo,
        border: llena ? "none" : `2px solid ${color}`,
        animationDelay: retraso ? `${retraso}ms` : undefined,
      }}
    />
  );
}

/**
 * Una pista compacta: rótulo (16), [cifras (16)], carril (12) con marcas.
 * marcas = [{ forma, llena, x, actual, nueva, retraso }]
 */
export function PistaCompacta({ rotulo, cifras = null, marcas = [], children = null, ...datos }) {
  return (
    <div data-pista-compacta {...datos} style={{ position: "relative" }}>
      <div className="t3s-rotulo">{rotulo}</div>
      {cifras && <div className="t3s-cifras" data-cifras>{cifras}</div>}
      <div className="t3s-carril" data-carril>
        {marcas.map((m, k) => <MarcaCompacta key={k} {...m} />)}
        {children}
      </div>
    </div>
  );
}

/** «Ingresos $X · Gastos $Y», Inter 12 con la cifra en mono 12. */
export function Cifras({ pares }) {
  return (
    <>
      {pares.map(([nombre, monto], k) => (
        <span key={nombre}>
          {k > 0 && " · "}
          {nombre} <b data-monto>{pesos(monto)}</b>
        </span>
      ))}
    </>
  );
}

/* ═══════════ O1 COMPACTO: las casillas Debe y Haber (§1: 125 × 52 con rótulo 16 + 4) ═══════════ */
export function O1Compacto({ debe = null, haber = null, activa = null, onActivar = null, faltan = false }) {
  const casilla = (lado, valor) => (
    <div style={{ flex: "1 1 0", minWidth: 0, display: "grid", gap: "4px" }}>
      <div className="t3s-rotulo">{lado === "debe" ? "Debe" : "Haber"}</div>
      <button
        type="button"
        className="t3s-ctl"
        data-casilla={lado}
        data-activa={activa === lado ? "" : undefined}
        aria-pressed={activa === lado ? "true" : "false"}
        aria-disabled={onActivar ? undefined : "true"}
        onClick={onActivar ? () => onActivar(lado) : undefined}
        style={{ height: "52px", flex: "none", width: "100%", fontWeight: 600, fontSize: "12px", lineHeight: "16px" }}
      >
        {valor ?? ""}
      </button>
    </div>
  );
  return (
    <div data-o1 data-faltan-cuentas={faltan ? "" : undefined} style={{ display: "flex", gap: "8px" }}>
      {casilla("debe", debe)}
      {casilla("haber", haber)}
    </div>
  );
}

/* ═══════════ T COMPACTA (§1: nombre 16, cabecera 16, acumulado 22, saldo 22, +12) ═══════════ */
export function TCompacta({ nombre, debe = [], haber = [], saldo = null, rotuloSobre = null }) {
  const suma = (l) => l.reduce((s, x) => s + x, 0);
  return (
    <div data-t-compacta style={{ display: "grid", gridTemplateRows: "16px 16px 22px 22px", rowGap: "4px", position: "relative" }}>
      <div className="t3s-rotulo" style={{ color: C.texto, fontWeight: 700 }}>{rotuloSobre ?? nombre}</div>
      <div style={{ display: "flex", borderBottom: `2px solid ${C.quieto}` }}>
        <span className="t3s-rotulo" style={{ flex: 1 }}>Debe</span>
        <span className="t3s-rotulo" style={{ flex: 1, borderLeft: `2px solid ${C.quieto}`, paddingLeft: "6px" }}>Haber</span>
      </div>
      <div style={{ display: "flex", font: `600 12px/22px ${MONO}` }}>
        <span style={{ flex: 1 }} data-t-debe>{debe.length ? pesos(suma(debe)) : ""}</span>
        <span style={{ flex: 1, borderLeft: `2px solid ${C.quieto}`, paddingLeft: "6px" }} data-t-haber>{haber.length ? pesos(suma(haber)) : ""}</span>
      </div>
      <div style={{ font: `600 12px/22px ${MONO}`, color: C.texto }} data-t-saldo>{saldo ?? ""}</div>
    </div>
  );
}

/* ═══════════ O4 COMPACTO (§1: dos barras de 16 + 10 + 6 y el renglón del resultado, 22) ═══════════ */
export function O4Compacto({ ingresos, gastos, tapado = true, resultado = null, max }) {
  const tope = max ?? Math.max(ingresos, gastos);
  const barra = (nombre, monto) => (
    <div style={{ display: "grid", gridTemplateRows: "16px 10px", rowGap: "0" }}>
      <div className="t3s-cifras">{nombre} <b>{pesos(monto)}</b></div>
      <div style={{ height: "10px", width: `${(monto / tope) * 100}%`, background: C.neutro, borderRadius: "2px" }} />
    </div>
  );
  return (
    <div data-o4 style={{ display: "grid", rowGap: "6px" }}>
      {barra("Ingresos", ingresos)}
      {barra("Gastos", gastos)}
      <div data-o4-resultado style={{ height: "22px", font: `700 14px/22px "Inter", sans-serif`, color: C.texto, visibility: tapado ? "hidden" : "visible" }}>
        {resultado}
      </div>
    </div>
  );
}

export { hazResuelto, mostrarCorrecto };

/*
 * ═══════════ EL ASIENTO CON ‹ cuenta › (P3-5, P3-7, P4-6 y P4-9) ═══════════
 *
 * 1. Se toca la casilla «Debe» o «Haber» y queda activa (borde de 2 px).
 * 2. En la fila de control, ‹ › recorre las candidatas.
 * 3. Tocar el centro pone esa cuenta en la casilla activa y la califica:
 *    candidatas = [{ cuenta, lado: "debe" | "haber" | null, error }].
 *
 * Las candidatas son las de Miyata (textos v3 §1, CUENTAS_ASIENTO_*): 4 por
 * asiento, el par correcto y dos que no van. El control las recorre en orden
 * alfabético, para que el orden no delate el par. Si una pantalla llegara sin
 * candidatas (null), queda armada y esperando: no se inventa ninguna cuenta.
 */
export const enOrden = (candidatas) => [...(candidatas ?? [])].sort((a, b) => a.cuenta.localeCompare(b.cuenta, "es"));
export const ASIENTO_INICIAL = { activa: null, indice: 0, lados: {}, ultimo: null };

export function ponerCuenta(estado, candidatas, cuenta) {
  const e = estado ?? ASIENTO_INICIAL;
  const lado = e.activa;
  if (!lado || !candidatas) return e;
  const antes = e.lados[lado];
  if (hazResuelto(antes)) return e;
  const c = candidatas.find((x) => x.cuenta === cuenta);
  const ok = c?.lado === lado;
  const nuevo = { ...responderHaz(antes, ok), cuenta: ok ? cuenta : antes?.cuenta ?? null, ultimaElegida: cuenta };
  return { ...e, lados: { ...e.lados, [lado]: nuevo }, ultimo: { lado, ok, cuenta } };
}

export const asientoResuelto = (candidatas) => (e) => Boolean(candidatas) && ["debe", "haber"].every((l) => hazResuelto(e?.lados?.[l]));

/** Lo que muestra cada casilla: la cuenta acertada o, con dos errores, la correcta. */
export function cuentaEnCasilla(e, candidatas, lado) {
  const t = e?.lados?.[lado];
  if (!t) return null;
  if (t.ok) return t.cuenta;
  if (mostrarCorrecto(t)) return candidatas?.find((c) => c.lado === lado)?.cuenta ?? null;
  return null;
}

export function zonaAsiento(e, candidatas, { antes = [], despues = [], pista }) {
  const u = e?.ultimo;
  if (asientoResuelto(candidatas)(e)) return despues;
  if (!u) return antes;
  const t = e.lados[u.lado];
  if (!u.ok && mostrarCorrecto(t)) {
    const err = candidatas?.find((c) => c.cuenta === u.cuenta)?.error;
    return err ? [{ texto: err, fuerte: true, tipo: "porque" }] : antes;
  }
  if (!u.ok) return [{ texto: pista, fuerte: true, tipo: "pista" }];
  return antes;
}

export function Asiento({ estado, setEstado, candidatas, monto, encima = null }) {
  const e = estado ?? ASIENTO_INICIAL;
  const lista = enOrden(candidatas);
  const u = e.ultimo;
  const ver = u ? (u.ok ? "bien" : mostrarCorrecto(e.lados[u.lado]) ? null : "mal") : null;
  return {
    ver,
    modelo: (
      <div style={{ display: "grid", rowGap: "4px" }}>
        <div className="t3s-cifras" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{encima}</span>
          {monto ? <b data-monto-dado>{pesos(monto)}</b> : null}
        </div>
        <O1Compacto
          debe={cuentaEnCasilla(e, candidatas, "debe")}
          haber={cuentaEnCasilla(e, candidatas, "haber")}
          activa={e.activa}
          faltan={!candidatas}
          onActivar={(lado) => setEstado((x) => ({ ...(x ?? ASIENTO_INICIAL), activa: lado }))}
        />
      </div>
    ),
    control: (
      <ControlFlechas
        nombre="Elige la cuenta"
        valores={lista.length ? lista.map((c) => c.cuenta) : [""]}
        indice={e.indice}
        apagado={!candidatas || !e.activa}
        rotulo={(v) => v}
        onMover={(i) => setEstado((x) => ({ ...(x ?? ASIENTO_INICIAL), indice: i }))}
        onConfirmar={(cuenta) => setEstado((x) => ponerCuenta(x, candidatas, cuenta))}
      />
    ),
  };
}

/*
 * ═══════════ LA TARJETA DE CITA (Itagaki, lote 12; Takamura, lote 14) ═══════════
 *
 * En los pasos de cita de P3-7 y P4-8 la cita va en la figura: una tarjeta del
 * alto de la reserva (150 / 200), fondo #1C2939, raya izquierda de 3 px
 * #B8C4D4, relleno de 8, Inter 14/20 #F8F9FA con la atribución en la misma
 * línea. Lista para cuando SecuenciaAprender dé pasos después de responder un
 * Haz (#534); hoy solo la mide la sonda.
 */
export function TarjetaCita({ cita }) {
  return (
    <div data-tarjeta-cita style={{
      height: "100%", boxSizing: "border-box", background: "#1C2939", borderLeft: `3px solid ${C.neutro}`,
      padding: "8px", overflow: "hidden",
    }}>
      <p data-cita-texto style={{ margin: 0, font: '400 14px/20px "Inter", sans-serif', color: C.texto }}>{cita}</p>
    </div>
  );
}

/** Los estados que la sonda mide de un asiento: cada error posible, la pista, el «al revés» y el acierto. */
export function medirAsiento(candidatas) {
  const lista = candidatas ?? [];
  const debe = lista.find((c) => c.lado === "debe")?.cuenta;
  const haber = lista.find((c) => c.lado === "haber")?.cuenta;
  const poner = (pasos) => pasos.reduce((e, [lado, cuenta]) => ponerCuenta({ ...e, activa: lado }, candidatas, cuenta), ASIENTO_INICIAL);
  const estados = [
    { nombre: "sin-responder", estado: ASIENTO_INICIAL },
    { nombre: "casilla-activa", estado: { ...ASIENTO_INICIAL, activa: "debe" } },
  ];
  if (!candidatas) return estados;
  estados.push({ nombre: "acierto", estado: poner([["debe", debe], ["haber", haber]]) });
  estados.push({ nombre: "al-reves-pista", estado: poner([["debe", haber]]) });
  estados.push({ nombre: "al-reves-dos-errores", estado: poner([["debe", haber], ["debe", haber]]) });
  for (const c of lista.filter((x) => !x.lado)) {
    estados.push({ nombre: `dos-errores-${c.cuenta}`, estado: poner([["debe", c.cuenta], ["debe", c.cuenta]]) });
  }
  /* El nombre más largo en el centro del control. */
  const orden = enOrden(candidatas);
  const largo = orden.reduce((a, c, k) => (c.cuenta.length > orden[a].cuenta.length ? k : a), 0);
  estados.push({ nombre: "centro-mas-largo", estado: { ...ASIENTO_INICIAL, activa: "debe", indice: largo } });
  return estados;
}
