import { ArrowRight } from "lucide-react";
import { FAE } from "../../../../theme.js";
import { FIGURAS_CAPA1_B, TEXTOS_FIGURAS_CAPA1 } from "../../../../data/figurasCapa1B.js";
import TanqueProvision, { HUNDIDO, RELLENO_AMBAR } from "./TanqueProvision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 10 · LAS FIGURAS DE LA CAPA 1 DE B (P2 de Mai, 16-oct).
 *
 * Cinco objetos para los 42 términos de las 7 piezas de Aprender: el asiento
 * (o la cuenta T), el estante, la línea, la barra y el tanque. La figura va
 * ANTES del nombre (`figuraAntesDelNombre`, la ranura que CuatroCapas ya
 * tiene desde el lote 7; el componente compartido no cambia). La parte que el
 * término nombra lleva el contorno de 2 px #F8F9FA; lo demás, el de reposo.
 * Teal y ámbar solo en DEBE y HABER, y ámbar en la provisión; coral nunca.
 *
 * La figura no se toca: es `role="img"` con su texto alternativo (patrón de
 * Mai §8, «{Objeto}: {partes}. Se señala {parte}.»; PARA FUTABA/SHOKO) y lo
 * de dentro va oculto al lector. Cabe en 150 de alto (ALTO_FIGURA). Sin
 * position: sticky (R21). Ninguna palabra vive aquí: salen de los datos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const INTER = "Inter, sans-serif";
const SORA = "Sora, sans-serif";
const BLANCO = FAE.text;
const NEUTRO = "#B8C4D4";
const SECUNDARIO = "#A8B6C8";
const DEBE = "#3FA69A";
const REPOSO = "1px solid rgba(248,249,250,0.35)";
const SENAL = `2px solid ${BLANCO}`;
const ROTULO = { fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: BLANCO };
const T = TEXTOS_FIGURAS_CAPA1;
const RAYADO = "repeating-linear-gradient(45deg, rgba(184,196,212,0.55) 0 3px, transparent 3px 7px)";

/* El contorno de una parte: señalada, 2 px #F8F9FA (con el relleno compensado); si no, el de reposo. */
const borde = (si) => ({ border: si ? SENAL : REPOSO, boxSizing: "border-box" });

function Asiento({ f }) {
  const si = (lado) => f.senal.includes(lado);
  const lado = (l) => (
    <div data-lado-figura={l} data-senal={si(l) ? "si" : "no"} style={{
      padding: "4px 6px", minHeight: "32px", borderRadius: "6px", textAlign: l === "haber" ? "right" : "left",
      boxShadow: si(l) ? `inset 0 0 0 2px ${BLANCO}` : "none",
    }}>
      <span style={{ display: "block", fontFamily: INTER, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: l === "debe" ? DEBE : FAE.ambar }}>{T[l]}</span>
      {f[l] && <span style={{ display: "block", ...ROTULO, marginTop: "2px" }}>{f[l]}</span>}
    </div>
  );
  return (
    <div style={{ padding: "8px", borderRadius: "10px", ...HUNDIDO }}>
      {f.cuenta && <p style={{ margin: "0 0 4px", textAlign: "center", fontFamily: SORA, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: BLANCO }}>{f.cuenta}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `2px solid ${NEUTRO}` }}>
        <div style={{ paddingTop: "4px", paddingRight: "4px" }}>{lado("debe")}</div>
        <div style={{ paddingTop: "4px", paddingLeft: "4px", borderLeft: `2px solid ${NEUTRO}` }}>{lado("haber")}</div>
      </div>
    </div>
  );
}

function Estante({ f }) {
  return (
    <div>
      {f.tapa && (
        <div data-tapa data-senal={f.senal.includes("tapa") ? "si" : "no"} style={{
          ...borde(f.senal.includes("tapa")), borderRadius: "10px", padding: "4px 8px", marginBottom: "6px", textAlign: "center", ...ROTULO,
        }}>{f.tapa}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${f.cajones.length}, minmax(0, 1fr))`, gap: "6px" }}>
        {f.cajones.map((c, k) => (
          <div key={c} data-cajon-figura={k} data-senal={f.senal.includes(k) ? "si" : "no"} style={{
            ...borde(f.senal.includes(k)), borderRadius: "10px", minHeight: "44px", padding: "4px 6px",
            display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", ...ROTULO, overflowWrap: "anywhere",
          }}>{c}</div>
        ))}
      </div>
    </div>
  );
}

function Linea({ f }) {
  const n = f.momentos.length;
  return (
    <div style={{ position: "relative", padding: "6px 0 0" }}>
      <span aria-hidden="true" style={{ position: "absolute", top: "11px", left: `${50 / n}%`, right: `${50 / n}%`, height: "2px", background: NEUTRO }} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: "6px", position: "relative" }}>
        {f.momentos.map((m, k) => {
          const si = f.senal.includes(k);
          return (
            <div key={m} data-momento-figura={k} data-senal={si ? "si" : "no"} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: si ? BLANCO : NEUTRO, boxShadow: si ? `0 0 0 2px ${FAE.bg}, 0 0 0 4px ${BLANCO}` : "none" }} />
              <span style={{ ...ROTULO, textAlign: "center", padding: "1px 4px", borderRadius: "6px", border: si ? SENAL : "2px solid transparent" }}>{m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Flecha({ f }) {
  const caja = (texto, id) => (
    <div data-extremo={id} data-senal={f.senal.includes(id) ? "si" : "no"} style={{
      ...borde(f.senal.includes(id)), flex: "1 1 0", minWidth: 0, minHeight: "44px", borderRadius: "10px", padding: "4px 8px",
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", ...ROTULO,
    }}>{texto}</div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {caja(f.de, "de")}
      <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} color={NEUTRO} style={{ flex: "none" }} />
      {caja(f.a, "a")}
    </div>
  );
}

/* La barra de lo que deben los clientes, 26 de alto. Con `edades`, cuatro tramos de 22 · 22 · 28 · 28 %. */
const ANCHOS = [22, 22, 28, 28];
const PORCION = [0, 20, 35, 50];
function Barra({ f }) {
  const si = f.senal.includes("parte") || f.senal.includes("tramos");
  const pie = (izq, der) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginTop: "4px" }}>
      <span style={{ ...ROTULO, color: izq?.senal ? BLANCO : SECUNDARIO }}>{izq?.texto ?? ""}</span>
      <span style={{ ...ROTULO, textAlign: "right", color: der?.senal ? BLANCO : SECUNDARIO }}>{der?.texto ?? ""}</span>
    </div>
  );
  if (f.edades) {
    return (
      <div>
        <div style={{ display: "flex", gap: "3px", height: "26px" }}>
          {ANCHOS.map((a, k) => (
            <div key={a + "-" + k} data-tramo={k} data-senal={si ? "si" : "no"} style={{
              ...borde(si), flex: `0 0 calc(${a}% - 3px)`, borderRadius: "6px", position: "relative", overflow: "hidden",
            }}>
              {f.porcion && PORCION[k] > 0 && <span data-porcion style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${PORCION[k]}%`, background: RELLENO_AMBAR }} />}
            </div>
          ))}
        </div>
        {f.grupos && (
          <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
            <span style={{ ...ROTULO, flex: `0 0 calc(${ANCHOS[0]}% - 3px)`, textAlign: "center" }}>{f.grupos[0]}</span>
            <span style={{ ...ROTULO, flex: "1 1 auto", textAlign: "center" }}>{f.grupos[1]}</span>
          </div>
        )}
        {f.porcentajes && (
          <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
            {ANCHOS.map((a, k) => (
              <span key={a + "-" + k} style={{ ...ROTULO, flex: `0 0 calc(${a}% - 3px)`, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{k ? f.porcentajes[k - 1].replace(" %", "\u00A0%") : ""}</span>
            ))}
          </div>
        )}
        {f.rotulo && <p style={{ margin: "4px 0 0", ...ROTULO, textAlign: "center" }}>{f.rotulo}</p>}
      </div>
    );
  }
  if (f.provision) {
    const p = f.senal.includes("provision"); const n = f.senal.includes("neto");
    return (
      <div>
        <div style={{ display: "flex", height: "26px", gap: "3px" }}>
          <div data-parte="neto" data-senal={n ? "si" : "no"} style={{ ...borde(n), flex: "1 1 auto", borderRadius: "6px" }} />
          <div data-parte="provision" data-senal={p ? "si" : "no"} style={{ ...borde(p), flex: "0 0 24%", borderRadius: "6px", background: RELLENO_AMBAR, borderLeftColor: p ? BLANCO : FAE.ambar }} />
        </div>
        {pie({ texto: f.neto, senal: n }, { texto: f.provision, senal: p })}
      </div>
    );
  }
  /* Rayada (no se va a cobrar), suelta (castigada: fuera de la barra) o rellena (abonada). */
  const texto = f.rayada ?? f.suelta ?? f.rellena;
  const fondo = f.rayada ? { backgroundImage: RAYADO } : f.rellena ? { background: "rgba(184,196,212,0.45)" } : {};
  return (
    <div>
      <div style={{ display: "flex", height: "26px", gap: f.suelta ? "10px" : "3px", alignItems: "flex-start" }}>
        <div style={{ ...borde(false), flex: "1 1 auto", height: "26px", borderRadius: "6px" }} />
        <div data-parte={f.rayada ? "rayada" : f.suelta ? "suelta" : "rellena"} data-senal={si ? "si" : "no"} style={{
          ...borde(si), flex: "0 0 24%", height: "26px", borderRadius: "6px", ...fondo, transform: f.suelta ? "translateY(8px) rotate(-6deg)" : "none",
        }} />
      </div>
      <div style={{ marginTop: f.suelta ? "12px" : "4px", textAlign: "right" }}><span style={ROTULO}>{texto}</span></div>
    </div>
  );
}

/* El tanque de la provisión en tamaño mínimo (84 × 96), sin gestos y sin cifras: debajo, su rótulo. */
const NIVELES = { falta: -31200, sobra: 185000, justo: 153400 };
const TEXTOS_TANQUE = { nombreTanque: "", leFaltanLector: "", pesosCero: "", cero: "", analisis: "", pide: "" };
function Tanques({ f }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
      {f.tanques.map((t) => (
        <div key={t.nivel} data-tanque-figura={t.nivel} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <TanqueProvision nivel={NIVELES[t.nivel]} textos={TEXTOS_TANQUE} alto={96} analisis={t.nivel === "falta" ? null : "solo"} conCero={false} reducido />
          {t.texto && <span style={ROTULO}>{t.texto}</span>}
        </div>
      ))}
    </div>
  );
}

const OBJETOS = { asiento: Asiento, estante: Estante, linea: Linea, flecha: Flecha, barra: Barra, tanques: Tanques };

/* El texto alternativo, con el patrón de Mai §8. PARA FUTABA: lo cambia por el suyo cuando lo escriba. */
export function altDe(f) {
  const lista = (xs) => xs.filter(Boolean).join(", ");
  if (f.tipo === "asiento") {
    const lados = [f.debe && `en el Debe, ${f.debe}`, f.haber && `en el Haber, ${f.haber}`].filter(Boolean).join("; ");
    const s = f.senal.map((l) => (l === "debe" ? "el Debe" : "el Haber")).join(" y ");
    return `${f.cuenta ? `Cuenta T de ${f.cuenta}` : "Asiento"}: ${lados}. Se señala ${s}.`;
  }
  if (f.tipo === "estante") {
    const s = f.senal.map((k) => (k === "tapa" ? f.tapa : f.cajones[k])).join(" y ");
    return `Estante${f.tapa ? ` ${f.tapa}` : ""}: ${lista(f.cajones)}. Se señala ${s}.`;
  }
  if (f.tipo === "linea") return `Línea: ${lista(f.momentos)}. Se señala ${f.senal.map((k) => f.momentos[k]).join(" y ")}.`;
  if (f.tipo === "flecha") return `Línea: de ${f.de} a ${f.a}. Se señala ${f.a}.`;
  if (f.tipo === "barra") {
    const partes = f.edades ? lista([...(f.grupos ?? []), ...(f.porcentajes ?? []), f.rotulo]) || "cuatro tramos" : lista([f.neto, f.provision, f.rayada, f.suelta, f.rellena]);
    return `Barra: ${partes}. Se señala ${f.edades ? "cada tramo" : f.senal.includes("neto") ? f.neto : (f.provision ?? f.rayada ?? f.suelta ?? f.rellena)}.`;
  }
  return `Tanque${f.tanques.length > 1 ? "s" : ""}: ${lista(f.tanques.map((t) => t.texto)) || "el nivel en la línea"}.`;
}

export function FiguraCapa1({ f }) {
  const Objeto = OBJETOS[f.tipo];
  return (
    <div data-figura-capa1={f.tipo} role="img" aria-label={altDe(f)} style={{ padding: "2px" }}>
      <div aria-hidden="true"><Objeto f={f} /></div>
    </div>
  );
}

/* Le pone a cada término de la pieza su figura, antes del nombre. Una pieza sin figuras queda igual. */
export function conFigurasCapa1(pieza) {
  const figuras = FIGURAS_CAPA1_B[pieza.id];
  if (!figuras) return pieza;
  return {
    ...pieza,
    nombres: pieza.nombres.map((n, k) => (figuras[k] ? { ...n, figura: () => <FiguraCapa1 f={figuras[k]} />, figuraAntesDelNombre: true } : n)),
  };
}
