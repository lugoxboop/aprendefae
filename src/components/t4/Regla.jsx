/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · «LA REGLA DEL FONDO» (Hanayama, rediseño de H4, con el arreglo v1.1 de
 * su rediseño de A3).
 *
 * Carril de la Célula D; no es compartido. Portada tal cual del prototipo
 * congelado (scratchpad hanayama/sitio/src/components/t4r/H4R.jsx: RANGO,
 * xDe, fuera, Rot y Regla, con las clases t4rg-). La usan A3 (Aprender) y H4
 * (Hacer): el arqueo y su práctica se leen igual, así que vive en un solo sitio.
 *
 * Una regla de −10.000 a +10.000 alrededor del fondo, con marcas cada 2.000 y
 * la marca del fondo en el centro. No es proporcional al fondo entero: es un
 * ACERCAMIENTO, y lo dice su escala («cada marca: 2.000»).
 *   · la aguja «suman»: soportes más caja
 *   · los tramos: la diferencia, desde la marca del fondo
 *   · la aguja «caja + cheque» (aguja2): solo el cheque correcto la deja en la
 *     marca; una equivocada va corta y en coral
 *   · las etiquetas: rótulos con su cifra; fuera de la regla llevan «←» o «→»
 *
 * Ninguna aguja corta un rótulo (v1.1): con la suma a un lado del fondo, el
 * rótulo «fondo» se va al otro lado de su marca (y la marca sube a su altura),
 * y el de «suman» queda junto a su aguja, hacia afuera si cabe. Con la suma en
 * el fondo, la aguja empieza bajo los dos rótulos. Sin triángulos (▲ es del
 * Tema 2), sin círculos (Tema 3), sin trazo discontinuo.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { C, cifra } from "./comun.jsx";

export const RANGO = 10_000;

export const CSS_REGLA = `
.t4rg { position: relative; height: 134px; margin: 4px 0 0; }
.t4rg-pista { position: absolute; left: 0; right: 0; top: 56px; height: 2px; background: ${C.neutro}; }
.t4rg-tic { position: absolute; top: 52px; width: 1px; height: 10px; background: ${C.neutro}; }
.t4rg-marca { position: absolute; left: calc(50% - 1px); top: 34px; width: 2px; height: 44px; background: ${C.texto}; }
.t4rg-rot { position: absolute; font: 500 12px/1.2 "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4rg-rot b { font-weight: 600; color: ${C.texto}; font-variant-numeric: tabular-nums; }
.t4rg-aguja { position: absolute; width: 2px; background: ${C.texto}; }
.t4rg-tramo { position: absolute; top: 64px; height: 6px; border-radius: 3px; }
`;

/* Dónde cae una desviación del fondo, en % del ancho (2 a 98). */
export const xDe = (desv) => Math.max(2, Math.min(98, 50 + (desv / RANGO) * 46));
export const fuera = (desv) => Math.abs(desv) > RANGO;

/* lado: "izq" (el rótulo termina 5 px antes de x), "der" (empieza 5 px después) o "centro"; sin lado, según x */
export function Rot({ x, top, children, dato, lado }) {
  const l = lado ?? (x > 62 ? "izq" : x < 38 ? "der" : "centro");
  const t = l === "izq" ? "translateX(calc(-100% - 5px))" : l === "der" ? "translateX(5px)" : "translateX(-50%)";
  return <span className="t4rg-rot t4r-nueva" data-rot={dato} style={{ left: `${x}%`, top: `${top}px`, transform: t }}>{children}</span>;
}

/*
 * r:         { fondo }
 * suman:     la suma de soportes y caja, o null (sin aguja)
 * tramos:    [{ id, desv, mal? }]
 * aguja2:    [{ id, desv, mal? }]  «caja + cheque»
 * etiquetas: [{ id, desv, valor, texto, fila: "A"|"B", mal? }]
 */
export function Regla({ r, suman, tramos = [], aguja2 = [], etiquetas = [] }) {
  const desvSuman = suman - r.fondo;
  const xs = suman != null ? xDe(desvSuman) : 50;
  const lado = suman == null || desvSuman === 0 ? 0 : desvSuman > 0 ? 1 : -1;
  const ladoSuman = lado === 0 ? "centro" : lado > 0 ? (xs <= 62 ? "der" : "izq") : (xs >= 38 ? "izq" : "der");
  return (
    <div className="t4rg" data-regla aria-hidden="true">
      <span className="t4rg-pista" />
      {Array.from({ length: 11 }, (_, k) => <span key={k} className="t4rg-tic" style={{ left: `${2 + k * 9.2}%` }} />)}
      <span className="t4rg-marca" style={lado ? { top: "18px", height: "60px" } : undefined} />
      <Rot x={50} top={18} dato="fondo" lado={lado > 0 ? "izq" : lado < 0 ? "der" : "centro"}>fondo <b>{cifra(r.fondo)}</b></Rot>
      <span className="t4rg-rot" style={{ left: 0, top: 118 }}>falta</span>
      <span className="t4rg-rot" style={{ right: 0, top: 118 }}>sobra</span>
      <span className="t4rg-rot" style={{ left: "50%", top: 118, transform: "translateX(-50%)" }}>cada marca: 2.000</span>
      {etiquetas.map((e) => <Rot key={e.id} x={xDe(e.desv)} top={e.fila === "A" ? 78 : 96} dato={e.id}>{fuera(e.desv) && e.desv < 0 ? "← " : ""}{e.mal && <span style={{ color: C.error }}>✗ </span>}{e.texto} <b>{cifra(e.valor)}</b>{fuera(e.desv) && e.desv > 0 ? " →" : ""}</Rot>)}
      {suman != null && (
        <>
          <span className="t4rg-aguja t4r-nueva" data-aguja="suman" style={{ left: `calc(${xs}% - 1px)`, top: lado ? "2px" : "34px", height: lado ? "56px" : "24px" }} />
          <Rot x={xs} top={0} dato="suman" lado={ladoSuman}>{fuera(desvSuman) ? "suman, fuera de la regla " : "suman "}<b>{cifra(suman)}</b></Rot>
        </>
      )}
      {tramos.map((t) => {
        const a = 50, b = xDe(t.desv);
        return <span key={t.id} className="t4rg-tramo t4r-nueva" data-tramo={t.id} style={{ left: `${Math.min(a, b)}%`, width: `${Math.abs(b - a)}%`, background: t.mal ? C.error : C.texto, opacity: t.mal ? 0.9 : 1 }} />;
      })}
      {aguja2.map((g) => (
        <span key={g.id}>
          <span className="t4rg-aguja t4r-nueva" data-aguja={g.id} style={{ left: `calc(${xDe(g.desv)}% - 1px)`, top: "56px", height: "20px", background: g.mal ? C.error : C.texto }} />
        </span>
      ))}
    </div>
  );
}
