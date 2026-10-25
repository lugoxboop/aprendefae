/*
 * Banco de medida de las secuencias de T3 (Célula E), para
 * scripts/t3/medir-secuencias.mjs. No es una página del sitio.
 *
 *   #c6           una pista compacta con las cuatro marcas de 10 px (C6)
 *   #tarjetas     las cuatro citas en la tarjeta de cita, con el ancho de la figura
 *   #secuencia    la vista del tema con la bandera encendida (?t3=secuencia)
 *   #publicada    la vista del tema tal como la ven hoy los estudiantes
 *   #pe           el índice de Pensamiento Estratégico (control: no cambió)
 *   #t4           la secuencia de T4, que también usa SecuenciaAprender (control)
 *
 * Sin sesión real: un AuthContext vacío basta (ninguna de estas pantallas
 * pinta cifras de la cuenta).
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadTema3View from "../../../src/components/ContabilidadTema3View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import { APRENDER } from "../../../src/data/subjects.js";
import { Figura, PistaCompacta, Cifras, TarjetaCita, ALTO_FIGURA_T3 } from "../../../src/components/mecanicas/libros/tema3/secuencia/base.jsx";
import { PIEZA_LO_QUE_YA_PASO } from "../../../src/data/contabilidadTema3Pieza3.js";
import { PIEZA_LO_QUE_YA_SE_PAGO } from "../../../src/data/contabilidadTema3Pieza4.js";

const modo = location.hash.slice(1);

function C6() {
  const marcas = (actual) => [
    { forma: "cuadrado", llena: true, x: "12.5%", actual },
    { forma: "cuadrado", llena: false, x: "37.5%", actual },
    { forma: "circulo", llena: true, x: "62.5%", actual },
    { forma: "circulo", llena: false, x: "87.5%", actual },
  ];
  return (
    <div style={{ padding: "16px", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ background: "#0E1B2E", padding: "15px" }} data-c6>
        <Figura
          modelo={(
            <div style={{ display: "grid", rowGap: "6px" }}>
              <PistaCompacta data-c6-pista="actual" rotulo="Marcas actuales (#FFFFFF)" cifras={<Cifras pares={[["Ingresos", 5000], ["Gastos", 2500]]} />} marcas={marcas(true)} />
              <PistaCompacta data-c6-pista="anterior" rotulo="Marcas anteriores (#B8C4D4)" cifras={<Cifras pares={[["Entró", 15000], ["Salió", 0]]} />} marcas={marcas(false)} />
            </div>
          )}
        />
      </div>
    </div>
  );
}

/*
 * Las citas, una por oración completa, tal como están publicadas en `delLibro`
 * (Acumulado y Recibido por anticipado): la partición es por «» y su página.
 */
const citasDe = (pieza, termino) => pieza.nombres.find((n) => n.termino === termino).delLibro.match(/«[^»]+»\s*\([^)]*\)\.?/g);
export const CITAS_TARJETA = [
  ...citasDe(PIEZA_LO_QUE_YA_PASO, "Acumulado").map((c, k) => ({ id: `p3-7-cita-${k + 1}`, cita: c })),
  ...citasDe(PIEZA_LO_QUE_YA_SE_PAGO, "Recibido por anticipado").map((c, k) => ({ id: `p4-8-cita-${k + 1}`, cita: c })),
];

function Tarjetas() {
  return (
    <div style={{ padding: "16px", maxWidth: "860px", margin: "0 auto", display: "grid", gap: "24px" }}>
      {CITAS_TARJETA.map((c) => (
        <div key={c.id} data-tarjeta={c.id} style={{ padding: "0 15px" }}>
          <div className="fae-sec-figura-prueba" style={{ height: `var(--alto, ${ALTO_FIGURA_T3.a320}px)` }}>
            <TarjetaCita cita={c.cita} />
          </div>
        </div>
      ))}
      <style>{`@media (min-width: 375px) { .fae-sec-figura-prueba { --alto: ${ALTO_FIGURA_T3.a375}px; } }`}</style>
    </div>
  );
}

let vista;
if (modo === "c6") vista = <C6 />;
else if (modo === "tarjetas") vista = <Tarjetas />;
else if (modo === "pe") {
  const { default: EstrategiaTopicIndex } = await import("../../../src/components/EstrategiaTopicIndex.jsx");
  vista = <EstrategiaTopicIndex onOpenTopic={() => {}} />;
} else if (modo === "t4") {
  const { default: ContabilidadT4View } = await import("../../../src/components/ContabilidadT4View.jsx");
  vista = <ContabilidadT4View modo={APRENDER} onBack={() => {}} />;
} else vista = <ContabilidadTema3View modo={APRENDER} onBack={() => {}} />;

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>{vista}</AuthContext.Provider>,
);
