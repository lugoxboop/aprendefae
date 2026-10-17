import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO } from "../../../data/contabilidad.js";
import { EstilosDeVerbos } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS DOS CAJONES DE «LAS DOS FAMILIAS DE CUENTAS».
 *
 * POR QUÉ VIVE APARTE DE `escenas.jsx`. Esta escena la pintan ahora DOS
 * capas de la misma pieza: la capa 2 —el paso a paso— y la capa 4, donde el
 * estudiante decide en qué cajón va una cuenta y qué le pasa el 31 de
 * diciembre. La capa 4 se arma en `cuentas/decideCuentas.jsx`, que es a su
 * vez lo que `escenas.jsx` importa: si la escena se quedara allí, los dos
 * archivos se importarían en círculo. Sacarla cuesta un archivo y evita un
 * ciclo; dejarla habría obligado a dibujar los cajones por segunda vez, y
 * entonces la capa 4 enseñaría un dibujo distinto del que la capa 2 explicó.
 *
 * `escenas.jsx` la sigue reexportando, así que nada de lo que ya la usaba
 * cambió de sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La cejilla de 10 px de los rótulos de escena, que viaja con los cajones. */
const ROTULO = {
  margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10px",
  fontWeight: 700, letterSpacing: "0.14em", color: "#A8B6C8",
};

/*
 * Dos cajones en vez de un árbol. Las cuentas caen sobre la mesa, se reparten,
 * y al llegar el 31 de diciembre el cajón de las transitorias SE VACÍA DE
 * GOLPE mientras el de las reales conserva lo suyo. El criterio entero del
 * capítulo —¿sobrevive al cierre?— dicho en un solo gesto.
 */
const EN_LA_MESA = [
  { nombre: "Caja", familia: "reales" },
  { nombre: "Cuentas por pagar", familia: "reales" },
  { nombre: "Aportes sociales", familia: "reales" },
  { nombre: "Ingresos por ventas", familia: "transitorias" },
  { nombre: "Gastos por arriendo", familia: "transitorias" },
  { nombre: "Costo de ventas", familia: "transitorias" },
];

function Cajon({ titulo, pie, cuentas, vacio, acento, atenuado = false }) {
  return (
    <div
      data-cajon={titulo}
      data-mirando={atenuado ? "no" : "si"}
      style={{
        flex: 1, minWidth: 0, padding: "10px 11px", borderRadius: "12px",
        background: atenuado ? "rgba(10,20,34,0.25)" : "rgba(10,20,34,0.45)",
        border: `1px solid ${acento}${atenuado ? "22" : "99"}`,
        opacity: atenuado ? 0.42 : 1,
        transition: "opacity 320ms ease, border-color 320ms ease, background 320ms ease",
      }}
    >
      <p style={{ ...ROTULO, color: acento, marginBottom: "4px" }}>{titulo.toUpperCase()}</p>
      <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#A8B6C8", lineHeight: 1.3 }}>{pie}</p>
      {vacio
        ? <p data-vaciado style={{ margin: 0, fontSize: "12px", color: "#A8B6C8" }}>— en blanco —</p>
        : cuentas.map((c) => (
          <p key={c} className="fae-cae" style={{ margin: 0, padding: "2px 0", fontSize: "12px", color: FAE.text }}>{c}</p>
        ))}
    </div>
  );
}

export function EscenaFamilias({ resaltar }) {
  const repartidas = resaltar !== "raiz";
  const cerrado = resaltar === "cierre";
  /*
   * El paso que NOMBRA una familia enciende su cajón y apaga el otro. Sin
   * esto, «las reales son las que se quedan» y «las transitorias son las que
   * se borran» se leen delante de la misma pantalla exacta: dos pasos, un
   * solo dibujo, y el texto prometiendo algo que no pasa.
   */
  const mirando = resaltar === "reales" || resaltar === "transitorias" ? resaltar : null;
  const deFamilia = (f) => (repartidas ? EN_LA_MESA.filter((c) => c.familia === f).map((c) => c.nombre) : []);

  return (
    <div>
      <EstilosDeVerbos />
      {!repartidas && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginBottom: "12px" }}>
          {EN_LA_MESA.map((c) => (
            <span key={c.nombre} className="fae-cae" style={{
              /* 12 px: son los nombres de las seis cuentas que hay sobre la mesa. */
              padding: "5px 9px", borderRadius: "999px", fontSize: "12px",
              background: "rgba(14,27,46,0.6)", border: "1px solid rgba(248,249,250,0.22)", color: FAE.text,
            }}>
              {c.nombre}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "9px" }}>
        <Cajon
          titulo="Reales"
          pie="Activo, Pasivo, Patrimonio"
          cuentas={deFamilia("reales")}
          vacio={!repartidas}
          acento={COLOR_LADO[DEBE]}
          atenuado={mirando === "transitorias"}
        />
        <Cajon
          titulo="Transitorias"
          pie="Ingresos, Gastos, Costos"
          cuentas={deFamilia("transitorias")}
          vacio={!repartidas || cerrado}
          acento={COLOR_LADO[HABER]}
          atenuado={mirando === "reales"}
        />
      </div>
      <p
        data-calendario
        style={{
          margin: "12px 0 0", textAlign: "center", fontFamily: "Sora, sans-serif",
          fontSize: "12.5px", fontWeight: 700,
          color: cerrado ? COLOR_LADO[HABER] : "#A8B6C8",
        }}
      >
        {cerrado ? "31 de diciembre — se cierra el año" : "Durante el año"}
      </p>
      {cerrado && (
        <p style={{ margin: "6px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", textAlign: "center" }}>
          Las reales siguen con su saldo intacto. Las transitorias arrancan de cero.
        </p>
      )}
    </div>
  );
}
