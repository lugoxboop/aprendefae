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
 * Teal y ámbar solo en «DEBE» y «HABER». Acierto: ✓ y borde #F8F9FA. Error: ✗
 * y borde coral, y no se escribe nada. Nada vuela; todo con fundido de 120 ms.
 *
 * `palabras` (opcional, lo usan A2 y A3): la marca de una mitad lleva palabra,
 * la pastilla común debajo del total («✓ Bien», «✗ Mal»: canon E3, en blanco y
 * negro se sabe cuál falló), y el lector la oye en el nombre de la mitad. Sin
 * `palabras`, el glifo de siempre en la esquina (los Hacer, sin cambios).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useNumeroQueSube } from "../mecanicas/libros/verbos.jsx";
import { C, cifra, Marca } from "./comun.jsx";

export const CSS_TABLERO = `
.t4tb { display: grid; gap: 4px; min-width: 0; }
.t4tb-cab, .t4tb-fila { display: grid; grid-template-columns: minmax(0, 1fr) var(--t4tb-mitad, 74px) var(--t4tb-mitad, 74px); gap: 4px; align-items: stretch; }
.t4tb-cab > span { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: center; }
.t4tb-nom { display: grid; align-content: center; padding: 4px 0; font: 600 13px/1.25 "Sora", "Inter", sans-serif; color: ${C.texto}; min-width: 0; }
.t4tb-nom > span { white-space: nowrap; }
.t4tb-mitad { position: relative; min-height: 44px; display: grid; place-items: center; padding: 0 4px; border-radius: 8px; border: 1px solid rgba(248,249,250,0.30); background: transparent; color: ${C.texto2}; font: 500 13px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; cursor: pointer; }
.t4tb-mitad:disabled { cursor: default; }
.t4tb-mitad[data-puesta] { border: 2px solid ${C.texto}; background: rgba(248,249,250,0.08); color: ${C.texto}; font-weight: 600; }
.t4tb-mitad[data-marca="bien"], .t4tb-mitad[data-marca="era"] { border: 2px solid ${C.texto}; color: ${C.texto}; }
.t4tb-mitad[data-marca="mal"] { border: 2px solid ${C.error}; background: rgba(248,249,250,0.08); }
.t4tb-mitad .g { position: absolute; top: 1px; right: 4px; font: 700 12px/1 "Inter", sans-serif; }
.t4tb-mitad > span { white-space: nowrap; }
.t4tb-mitad[data-con-palabra] { align-content: center; gap: 2px; }
.t4tb-foco { color: ${C.texto}; font-weight: 600; }
/* mayor */
.t4my { display: grid; border: 1px solid ${C.neutro}; border-radius: 10px; padding: 8px 10px; gap: 4px; }
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
.t4pr-igual { text-align: center; font: 600 17px/1.3 "Inter", sans-serif; }
/* campo */
.t4cp { display: grid; gap: 4px; min-width: 0; }
.t4cp label { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; }
.t4cp input { min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${C.neutro}; background: transparent; color: ${C.texto}; font: 500 16px "Inter", sans-serif; font-variant-numeric: tabular-nums; padding: 0 10px; }
.t4cp[data-marca="bien"] input { border: 2px solid ${C.texto}; }
.t4cp[data-marca="mal"] input, .t4cp[data-marca="cifra-mal"] input { border: 2px solid ${C.error}; }
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
export function Tablero({ cuentas, totales = {}, puestas = {}, monto, onElegir, activo, marcas = {}, recien = [], ancho = 74, etiqueta = "Cuentas", palabras = null }) {
  return (
    <div className="t4tb" role="group" aria-label={etiqueta} style={{ "--t4tb-mitad": `${ancho}px` }} data-tablero>
      <div className="t4tb-cab" aria-hidden="true"><span /><span style={{ color: C.debe }}>Debe</span><span style={{ color: C.haber }}>Haber</span></div>
      {cuentas.map((c) => (
        <div key={c.id} className="t4tb-fila" data-cuenta={c.id}>
          <span className="t4tb-nom">{c.renglones.map((r) => <span key={r}>{r}</span>)}</span>
          {["debe", "haber"].map((lado) => {
            const k = `${c.id}:${lado}`;
            const puesta = puestas[lado] === c.id;
            const m = marcas[k];
            return (
              <button
                key={lado}
                type="button"
                className="t4tb-mitad"
                data-destino={k}
                data-puesta={puesta && !m ? "" : undefined}
                data-marca={m}
                data-con-palabra={palabras && m ? "" : undefined}
                disabled={!activo}
                aria-pressed={puesta}
                aria-label={nombreMitad(c, lado, puesta && !m ? monto : (totales[c.id]?.[lado] ? cifra(totales[c.id][lado]) : null), palabras && m && palabras[m] ? palabras[m][1] : null)}
                onClick={() => onElegir?.(c.id, lado)}
              >
                {puesta && !m ? <span className="t4r-nueva">{monto}</span>
                  : (!palabras || !m || totales[c.id]?.[lado]) ? <Total v={totales[c.id]?.[lado]} foco={recien.includes(k)} /> : null}
                {palabras && m && palabras[m] && <Marca marca={m} palabras={palabras[m]} />}
                {!palabras && m === "bien" && <span className="g" aria-hidden="true">✓</span>}
                {!palabras && m === "mal" && <span className="g" aria-hidden="true" style={{ color: C.error }}>✗</span>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* lineas: [{ id, v, r?: rótulo, foco? }] */
export function Mayor({ titulo, debe, haber, reserva = 3, saldo = null, rotuloSaldo = "Saldo", marcaSaldo = null }) {
  const col = (lado, ls) => (
    <div className="t4my-col" data-columna={lado}>
      <span style={{ color: lado === "debe" ? C.debe : C.haber, textAlign: lado === "debe" ? "left" : "right" }}>{lado === "debe" ? "Debe" : "Haber"}</span>
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
      <div className="t4my-saldo" data-saldo-mayor={saldo ?? ""} style={{ visibility: saldo == null ? "hidden" : "visible" }}>
        <span>{rotuloSaldo}</span>
        <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>{saldo ?? "0"}{marcaSaldo && <Marca marca={marcaSaldo} />}</span>
      </div>
    </div>
  );
}

/* Lo que oye el lector cuando los dos saldos del par se igualan (Katsumi). */
export const SON_IGUALES = "son iguales";

export function Par({ izq, der, igual = false }) {
  const a = useNumeroQueSube(izq.v ?? 0);
  const b = useNumeroQueSube(der.v ?? 0);
  return (
    <div className="t4pr" data-par aria-label={`${izq.r} ${cifra(izq.v ?? 0)}; ${der.r} ${der.v != null ? cifra(der.v) : ""}${igual ? `; ${SON_IGUALES}` : ""}`}>
      <div data-lado-par="izq"><span className="r">{izq.r}</span><span className={`v${izq.foco ? " f" : ""}`}>{izq.v != null ? cifra(a) : "—"}</span></div>
      <span className="t4pr-igual" aria-hidden="true" style={{ visibility: igual ? "visible" : "hidden" }}>=</span>
      <div data-lado-par="der"><span className="r">{der.r}</span><span className={`v${der.foco ? " f" : ""}`}>{der.v != null ? cifra(b) : "—"}</span></div>
      {/* Cuando aparece el «=», el lector lo oye: la región está desde el principio, vacía, para que el cambio se anuncie. */}
      <span className="t4f-sr" aria-live="polite" data-lector-igual>{igual ? SON_IGUALES : ""}</span>
    </div>
  );
}

export function Campo({ id, rotulo, valor, onCambio, marca = null, bloqueado = false }) {
  return (
    <div className="t4cp" data-campo={id} data-marca={marca ?? undefined}>
      <label htmlFor={`t4cp-${id}`}>{rotulo}</label>
      <input id={`t4cp-${id}`} inputMode="numeric" autoComplete="off" value={valor} disabled={bloqueado}
        onChange={(e) => onCambio(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, "."))} />
      {marca && <Marca marca={marca} />}
    </div>
  );
}

export const numero = (s) => Number(String(s ?? "").replace(/\./g, "")) || 0;
