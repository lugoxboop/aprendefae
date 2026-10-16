/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · EL TABLERO, EL MAYOR, EL PAR Y EL CAMPO (Hanayama, rediseño de enganche).
 *
 * Carril de la Célula D; no es compartido. Portado tal cual del prototipo
 * congelado (scratchpad hanayama/sitio/src/components/t4r/tablero.jsx). Lo usan
 * A2, A4 y A5 (Aprender) y H3, H4, H7 y H8 (Hacer): es el mismo dibujo con el
 * mismo significado, así que vive en un solo sitio y nadie lo porta dos veces.
 *
 *   · Tablero: las cuentas de una actividad, cada una con su mitad Debe y su
 *     mitad Haber como destinos (data-destino="cuenta:lado"). El estudiante pone
 *     el monto en una cuenta del debe y en otra del haber; con el acierto, el
 *     monto se suma al total de esa mitad, que CUENTA hasta su valor. Reemplaza
 *     a ConstructorAsiento, que pinta el acierto en teal
 *   · Mayor: una cuenta T (Bancos de A4 y A5), con líneas y saldo al pie
 *   · Par: dos saldos («el banco» y «la empresa»), con el «=» cuando coinciden
 *   · Campo: una cifra escrita, con su marca
 *
 * Teal y ámbar solo en «DEBE» y «HABER». Acierto: borde de 2 px #F8F9FA y la
 * pastilla «Correcto» con Check. Error: borde coral y «No va aquí» con X, y no
 * se escribe nada. Nada vuela; todo con fundido de 120 ms.
 *
 * EL TABLERO VA APILADO (bloque P2 de Hanayama, §2.3-2 y §3.6): cada cuenta es
 * un bloque, el nombre arriba a todo el ancho y debajo sus dos mitades, de
 * (ancho − 8) / 2. Cada mitad reserva abajo un hueco de 20 px para su pastilla,
 * así que calificar no mueve nada, y la misma cuenta puede llevar «No va aquí»
 * en una mitad e «Iba aquí» en la otra. «DEBE» (#3FA69A) y «HABER» se dicen una
 * vez, en la cabecera. Las mitades van sin relleno: la forma la guarda el borde.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useNumeroQueSube } from "../mecanicas/libros/verbos.jsx";
import { C, cifra, Marca } from "./comun.jsx";
import { MARCA } from "../../data/contabilidadT4.js";

export const CSS_TABLERO = `
.t4tb { display: grid; gap: 8px; min-width: 0; }
.t4tb-cab, .t4tb-mitades { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4tb-cab > span { font: 700 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; padding: 0 9px; }
.t4tb-cab > span + span { text-align: right; }
.t4tb-cuenta { display: grid; gap: 4px; min-width: 0; }
.t4tb-nom { display: grid; font: 600 14px/1.3 "Sora", "Inter", sans-serif; color: ${C.texto}; min-width: 0; }
.t4tb-nom > span { white-space: nowrap; }
.t4tb-mitad { position: relative; display: grid; grid-template-rows: 22px 20px; align-content: center; gap: 2px; min-height: 44px; padding: 5px 8px; border-radius: 8px; border: 1px solid ${C.reposo}; background: transparent; color: ${C.texto2}; font: 500 15px/22px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; cursor: pointer; text-align: left; justify-items: start; }
.t4tb-mitad[data-lado="haber"] { text-align: right; justify-items: end; }
.t4tb-mitad[data-sin-marcas] { grid-template-rows: 22px; }
.t4tb-mitad:disabled { cursor: default; }
.t4tb-mitad:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t4tb-mitad[data-puesta] { border: 2px solid ${C.texto}; padding: 4px 7px; color: ${C.texto}; font-weight: 600; }
.t4tb-mitad[data-marca="bien"], .t4tb-mitad[data-marca="era"] { border: 2px solid ${C.texto}; padding: 4px 7px; color: ${C.texto}; }
.t4tb-mitad[data-marca="mal"] { border: 2px solid ${C.error}; padding: 4px 7px; }
.t4tb-mitad > span { white-space: nowrap; }
.t4tb-hueco { display: flex; min-height: 20px; }
.t4tb-mitad[data-lado="haber"] .t4tb-hueco { justify-content: flex-end; }
.t4tb-foco { color: ${C.texto}; font-weight: 600; }
/*
 * Plan B (decisión de Yujiro sobre la parada de medición de Hanayama): donde
 * el tablero apilado no deja la pastilla tocada y la devolución a la vez en
 * la ventana de 320×568 (H4 pregunta 4 y H8 etapa 2), el tablero va lado a
 * lado (nombre · Debe · Haber) y las pastillas bajan a una línea por mitad
 * marcada, debajo del tablero: «Cuenta · lado: ✗ No va aquí».
 */
.t4tb-lineal .t4tb-cab, .t4tb-lineal .t4tb-fila { display: grid; grid-template-columns: minmax(0, 1fr) 76px 76px; gap: 6px; align-items: stretch; }
.t4tb-lineal .t4tb-cab > span + span { text-align: center; }
.t4tb-lineal .t4tb-cab > span:last-child { text-align: center; }
.t4tb-lineal .t4tb-nom { align-content: center; font-size: 13px; }
.t4tb-lineal .t4tb-mitad { grid-template-rows: 22px; justify-items: center; text-align: center; padding: 0 4px; min-height: 44px; }
.t4tb-lineal .t4tb-mitad[data-lado="haber"] { justify-items: center; text-align: center; }
.t4tb-lineal .t4tb-mitad[data-puesta], .t4tb-lineal .t4tb-mitad[data-marca] { padding: 0 3px; }
.t4tb-marcas { display: grid; gap: 4px; }
.t4tb-marcas > div { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font: 500 13px/1.4 "Inter", sans-serif; color: ${C.texto2}; }
/* mayor */
.t4my { display: grid; background: ${C.hundido}; border: 1px solid ${C.hundidoBorde}; border-radius: 10px; padding: 8px 10px; gap: 4px; }
.t4my-t { margin: 0; text-align: center; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t4my-cols { display: grid; grid-template-columns: minmax(0,1fr) 1px minmax(0,1fr); gap: 0 10px; border-top: 1px solid rgba(248,249,250,0.22); padding-top: 4px; }
.t4my-col { display: grid; align-content: start; gap: 2px; min-width: 0; }
.t4my-col > span:first-child { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; }
.t4my-l { display: grid; justify-items: end; }
.t4my-l > span { white-space: nowrap; font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto2}; }
.t4my-l > span.r { font: 500 12px/16px "Inter", sans-serif; }
.t4my-l.t4tb-foco > span { color: ${C.texto}; font-weight: 600; }
.t4my-saldo { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; border-top: 1px solid rgba(248,249,250,0.22); padding-top: 4px; min-height: 26px; }
.t4my-saldo > span:first-child { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; }
.t4my-saldo > span:last-child { font: 600 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
/* par */
.t4pr { display: grid; grid-template-columns: minmax(0,1fr) 24px minmax(0,1fr); align-items: end; border: 1px solid ${C.neutro}; border-radius: 10px; padding: 8px 10px; }
.t4pr > div { display: grid; gap: 2px; min-width: 0; }
.t4pr > div:last-child { justify-items: end; text-align: right; }
.t4pr span.r { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4pr span.v { font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4pr span.v.f { font-weight: 600; }
/* El eco de lo que se escribe (H7 fase 2): en #A8B6C8 hasta comprobar (§4.4 del prompt maestro). */
.t4pr span.v.e { color: ${C.texto2}; font-weight: 500; }
.t4pr-igual { text-align: center; font: 600 17px/1.3 "Inter", sans-serif; }
/* Lote B (A5): la línea al pie del par («difieren en…») y su tercer lugar («saldo verdadero: ?»). Opcionales: H7 y H8 no los usan. */
.t4pr-pie { grid-column: 1 / -1; justify-self: center; margin-top: 6px; font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4pr-ver { grid-column: 1 / -1; justify-self: center; margin-top: 6px; font: 600 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
/* campo */
.t4cp { display: grid; gap: 4px; min-width: 0; }
.t4cp label { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; }
.t4cp input { min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${C.reposo}; background: transparent; color: ${C.texto}; font: 500 16px "Inter", sans-serif; font-variant-numeric: tabular-nums; padding: 0 10px; }
.t4cp[data-marca="bien"] input { border: 2px solid ${C.texto}; }
.t4cp-marcas { display: flex; flex-wrap: wrap; gap: 6px; min-height: 20px; }
/*
 * «Iba aquí: {valor}» bajo el campo errado (H7 y H8, etapa de saldos). En una
 * columna angosta (H7 a 320) no cabe en un renglón: parte en dos, «Iba aquí:»
 * arriba y la cifra abajo, con la letra de siempre (12 px). Su hueco, a todo
 * el ancho, se reserva con el alto de dos renglones (2 × 18 + 4 = 40 px) desde que sale el error,
 * así nada salta cuando llega a los 0,7 s (Shibukawa; Yujiro).
 */
.t4cp-iba { flex: 0 0 100%; min-width: 0; display: flex; align-items: flex-start; }
.t4cp-iba[data-reserva] { min-height: 40px; }
.t4cp-iba .t4r-marca { width: auto; height: auto; min-height: 20px; max-width: 100%; flex-wrap: wrap; column-gap: 4px; white-space: normal; border-radius: 10px; padding: 1px 7px; }
.t4cp-iba .t4r-marca > span { white-space: nowrap; }
.t4cp[data-marca="mal"] input { border: 2px solid ${C.error}; }
`;

function Total({ v, foco }) {
  const x = useNumeroQueSube(v ?? 0);
  if (!v) return <span aria-hidden="true">&nbsp;</span>;
  return <span className={foco ? "t4tb-foco t4r-nueva" : undefined}>{cifra(x)}</span>;
}

/*
 * El nombre accesible de una mitad: la cuenta y el lado, la cifra que se ve
 * en ella (el total, o el monto puesto sin comprobar) y, si la hay, la palabra
 * de la marca. El nombre tapa el contenido del botón, así que si no dijera la
 * cifra, el lector no la oiría (Katsumi): «Caja menor al debe: 500.000».
 */
const nombreMitad = (c, lado, cifraVista, palabra) =>
  `${c.renglones.join(" ")} al ${lado}${cifraVista != null && cifraVista !== "" ? `: ${cifraVista}` : ""}${palabra ? `: ${palabra}` : ""}`;

/*
 * cuentas: [{ id, renglones: [...] }]
 * totales: { [id]: { debe, haber } }
 * puestas: { debe: id|null, haber: id|null }  (lo que el estudiante eligió y todavía no comprobó)
 * marcas:  { "id:lado": "bien"|"mal"|"era" }
 * recien:  ["id:lado"] los totales que acaban de cambiar
 */
/* `activas` (opcional, A5 los-asientos): solo esas cuentas son destinos; las demás se ven, sin tocar. */
export function Tablero({ cuentas, totales = {}, puestas = {}, monto, onElegir, activo, marcas = {}, recien = [], etiqueta = "Cuentas", conMarcas = true, apilado = true, activas = null }) {
  const mitad = (c, lado) => {
    const k = `${c.id}:${lado}`;
    const puesta = puestas[lado] === c.id;
    const m = marcas[k];
    return (
      <button
        key={lado}
        type="button"
        className="t4tb-mitad"
        data-destino={k}
        data-lado={lado}
        data-puesta={puesta && !m ? "" : undefined}
        data-marca={m}
        data-sin-marcas={conMarcas && apilado ? undefined : ""}
        disabled={!activo || (activas != null && !activas.includes(c.id))}
        aria-pressed={puesta}
        aria-label={nombreMitad(c, lado, puesta && !m ? monto : (totales[c.id]?.[lado] ? cifra(totales[c.id][lado]) : null), m ? MARCA[m] : null)}
        onClick={() => onElegir?.(c.id, lado)}
      >
        {puesta && !m ? <span className="t4r-nueva">{monto}</span> : <Total v={totales[c.id]?.[lado]} foco={recien.includes(k)} />}
        {conMarcas && apilado && <span className="t4tb-hueco">{m && <Marca marca={m} />}</span>}
      </button>
    );
  };
  if (!apilado) {
    /* Las marcas, una línea por mitad marcada, en el orden de las cuentas. */
    const lineas = cuentas.flatMap((c) => ["debe", "haber"].filter((lado) => marcas[`${c.id}:${lado}`]).map((lado) => ({ c, lado, m: marcas[`${c.id}:${lado}`] })));
    return (
      <div className="t4tb t4tb-lineal" role="group" aria-label={etiqueta} data-tablero data-apilado="no">
        <div className="t4tb-cab" aria-hidden="true"><span /><span style={{ color: C.debeTexto }}>Debe</span><span style={{ color: C.haber }}>Haber</span></div>
        {cuentas.map((c) => (
          <div key={c.id} className="t4tb-fila" data-cuenta={c.id}>
            <span className="t4tb-nom">{c.renglones.map((r) => <span key={r}>{r}</span>)}</span>
            {mitad(c, "debe")}
            {mitad(c, "haber")}
          </div>
        ))}
        {conMarcas && (
          <div className="t4tb-marcas" data-linea-marcas={lineas.length} aria-hidden="true">
            {lineas.map(({ c, lado, m }) => (
              <div key={`${c.id}:${lado}`} data-marca-de={`${c.id}:${lado}`}>
                <span>{`${c.renglones.join(" ")} · ${lado}:`}</span>
                <Marca marca={m} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="t4tb" role="group" aria-label={etiqueta} data-tablero>
      <div className="t4tb-cab" aria-hidden="true"><span style={{ color: C.debeTexto }}>Debe</span><span style={{ color: C.haber }}>Haber</span></div>
      {cuentas.map((c) => (
        <div key={c.id} className="t4tb-cuenta" data-cuenta={c.id}>
          <span className="t4tb-nom">{c.renglones.map((r) => <span key={r}>{r}</span>)}</span>
          <div className="t4tb-mitades">{mitad(c, "debe")}{mitad(c, "haber")}</div>
        </div>
      ))}
    </div>
  );
}

/* lineas: [{ id, v, r?: rótulo, foco? }] */
/* `eco`: lo que el estudiante escribe en el campo del saldo, en #A8B6C8 mientras escribe (H8 etapa 3, §4.4 del prompt maestro). */
export function Mayor({ titulo, debe, haber, reserva = 3, saldo = null, rotuloSaldo = "Saldo", marcaSaldo = null, eco = null }) {
  const col = (lado, ls) => (
    <div className="t4my-col" data-columna={lado}>
      <span style={{ color: lado === "debe" ? C.debeTexto : C.haber, textAlign: lado === "debe" ? "left" : "right" }}>{lado === "debe" ? "Debe" : "Haber"}</span>
      <div style={{ display: "grid", gap: "2px", minHeight: `${reserva * 22}px`, alignContent: "start" }}>
        {ls.map((l) => (
          <div key={l.id} className={`t4my-l t4r-nueva${l.foco ? " t4tb-foco" : ""}`} data-linea={l.id}>
            {l.r && <span className="r">{l.r}</span>}
            {/* `v` puede venir en renglones fijos (A4: «Nota débito» / «del banco»): un span por renglón. */}
            {(Array.isArray(l.v) ? l.v : [l.v]).map((t, i) => <span key={i} style={l.chico ? { fontSize: "12px", lineHeight: "20px" } : undefined}>{t}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="t4my" data-mayor>
      <p className="t4my-t">{titulo}</p>
      <div className="t4my-cols">{col("debe", debe)}<span style={{ background: "rgba(248,249,250,0.22)" }} />{col("haber", haber)}</div>
      <div className="t4my-saldo" data-saldo-mayor={saldo ?? ""} data-eco={saldo == null && eco ? eco : undefined} style={{ visibility: saldo == null && !eco ? "hidden" : "visible" }}>
        <span>{rotuloSaldo}</span>
        <span style={{ display: "flex", gap: "8px", alignItems: "center", color: saldo == null ? C.texto2 : C.texto }}>{saldo ?? (eco || "0")}{marcaSaldo && <Marca marca={marcaSaldo} />}</span>
      </div>
    </div>
  );
}

/* Lo que oye el lector cuando los dos saldos del par se igualan (Katsumi). */
export const SON_IGUALES = "son iguales";

/*
 * `pie`: una línea al pie del par (A5 P0, «difieren en 1.937.500»).
 * `verdadero`: el tercer lugar del par (A5, lote B §5.3): { rotulo, v, lector };
 * con `v` null dice «?», y con una cifra la cuenta hasta su valor (420 ms).
 */
function Verdadero({ rotulo, v, lector }) {
  const x = useNumeroQueSube(v ?? 0);
  return (
    <span className="t4pr-ver t4r-nueva" data-verdadero={v ?? "?"}>
      <span aria-hidden="true">{rotulo} {v != null ? cifra(x) : "?"}</span>
      <span className="t4f-sr">{v != null ? `${rotulo} ${cifra(v)}` : lector}</span>
    </span>
  );
}

export function Par({ izq, der, igual = false, pie = null, verdadero = null }) {
  const a = useNumeroQueSube(izq.v ?? 0);
  const b = useNumeroQueSube(der.v ?? 0);
  return (
    <div className="t4pr" data-par aria-label={`${izq.r} ${cifra(izq.v ?? 0)}; ${der.r} ${der.v != null ? cifra(der.v) : ""}${igual ? `; ${SON_IGUALES}` : ""}`}>
      <div data-lado-par="izq"><span className="r">{izq.r}</span><span className={`v${izq.foco ? " f" : ""}${izq.eco ? " e" : ""}`} data-eco={izq.eco ? "" : undefined}>{izq.v != null ? cifra(izq.eco ? izq.v : a) : "—"}</span></div>
      <span className="t4pr-igual" aria-hidden="true" style={{ visibility: igual ? "visible" : "hidden" }}>=</span>
      <div data-lado-par="der"><span className="r">{der.r}</span><span className={`v${der.foco ? " f" : ""}${der.eco ? " e" : ""}`} data-eco={der.eco ? "" : undefined}>{der.v != null ? cifra(der.eco ? der.v : b) : "—"}</span></div>
      {/* Cuando aparece el «=», el lector lo oye: la región está desde el principio, vacía, para que el cambio se anuncie. */}
      <span className="t4f-sr" aria-live="polite" data-lector-igual>{igual ? SON_IGUALES : ""}</span>
      {pie && <span className="t4pr-pie" data-pie-par>{pie}</span>}
      {verdadero && <Verdadero {...verdadero} />}
    </div>
  );
}

/*
 * `iba`: la cifra que iba, ya con su formato ($1.240.000). Se pasa solo tras
 * el error y a los 0,7 s, en las piezas sin reintento (H7 fase 2 y H8 etapa
 * 3): al lado de «No va aquí», en el mismo renglón, «Iba aquí: {valor}»
 * (prompt maestro §4.2; P2 de Hanayama, §3.8: 97 + 6 + 127 ≤ 258 px).
 */
export function Campo({ id, rotulo, valor, onCambio, marca = null, bloqueado = false, iba = null }) {
  return (
    <div className="t4cp" data-campo={id} data-marca={marca ?? undefined}>
      <label htmlFor={`t4cp-${id}`}>{rotulo}</label>
      <input id={`t4cp-${id}`} inputMode="numeric" autoComplete="off" value={valor} disabled={bloqueado}
        onChange={(e) => onCambio(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, "."))} />
      {(marca || iba != null) && (
        <span className="t4cp-marcas">
          {marca && <Marca marca={marca} />}
          {(marca === "mal" || iba != null) && (
            <span className="t4cp-iba" data-iba={iba != null ? id : undefined} data-reserva={marca === "mal" ? "" : undefined}>
              {iba != null && <span className="t4r-marca t4r-nueva" data-marca="era" aria-hidden="true"><span>{MARCA.era}:</span>{" "}<span>{iba}</span></span>}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export const numero = (s) => Number(String(s ?? "").replace(/\./g, "")) || 0;
