import { useRef, useState } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { CONSIGNA_CAPA_3_CIERRE, GANANCIAS_Y_PERDIDAS, CUENTAS_DEL_PERIODO } from "../../../../data/contabilidadTema3Cierre.js";
import { pesos } from "../../../../contabilidad/dosLineas.js";
import { estadoCapa3Cierre, gananciasYPerdidas, filasDe, NOMBRES_INGRESOS, MS_VUELO } from "../../../../contabilidad/cerrarElPeriodo.js";
import { useReducido } from "./DosLineas.jsx";
import { ZonaA, ZonaB, ZonaC, volar, CSS_CIERRE } from "./EscenaCierre.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «CERRAR EL PERIODO» · CAPA 3 · «AHORA PRUEBE USTED» (Xeno, P2 §5).
 *
 * Cada una de las seis filas es un botón. Tocar una cuenta con saldo la
 * vacía: su ficha vuela a Ganancias y pérdidas y la fila queda en $0. Tocar
 * una vaciada la devuelve: la ficha vuela de vuelta y la fila recupera su
 * saldo. El estado sale del CONJUNTO de cuentas vaciadas, no del orden; el
 * «Queda» solo aparece con las seis. Las cinco fichas que no se vacían no
 * son botones.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SOLO_LECTOR = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };
const saldoDe = (c) => CUENTAS_DEL_PERIODO.find((x) => x.cuenta === c).saldo;

export default function CadaCuentaCierre() {
  const reducido = useReducido();
  const [vaciadas, setVaciadas] = useState([]);
  /* Lo que se pinta en las filas y lo que ya llegó a Ganancias y pérdidas. */
  const [enFilas, setEnFilas] = useState([]);
  const [enGyp, setEnGyp] = useState([]);
  const [anuncio, setAnuncio] = useState("");
  const [vuelta, setVuelta] = useState(0);
  const escena = useRef(null);
  const relojes = useRef({});

  const tocar = (cuenta) => {
    const vaciar = !vaciadas.includes(cuenta);
    const nuevas = vaciar ? [...vaciadas, cuenta] : vaciadas.filter((c) => c !== cuenta);
    const lado = NOMBRES_INGRESOS.includes(cuenta) ? "haber" : "debe";
    const caja = escena.current;
    const fila = caja?.querySelector(`[data-fila="${cuenta}"] [data-saldo-fila]`)?.getBoundingClientRect();
    const mitad = caja?.querySelector(`[data-gyp-mitad="${lado}"]`)?.getBoundingClientRect();
    clearTimeout(relojes.current[cuenta]);
    const quitar = (xs) => xs.filter((c) => c !== cuenta);
    const poner = (xs) => [...new Set([...xs, cuenta])];
    if (reducido || typeof caja?.animate !== "function") {
      setEnFilas((xs) => (vaciar ? poner(xs) : quitar(xs)));
      setEnGyp((xs) => (vaciar ? poner(xs) : quitar(xs)));
    } else if (vaciar) {
      /* Sale de la fila (que baja en 400 ms) y entra en su mitad al llegar. */
      volar(caja, [{ desde: fila, hasta: mitad, texto: pesos(saldoDe(cuenta)) }], { reducido });
      setEnFilas(poner);
      relojes.current[cuenta] = setTimeout(() => setEnGyp(poner), MS_VUELO);
    } else {
      /* Sale de Ganancias y pérdidas y vuelve a su fila. */
      volar(caja, [{ desde: mitad, hasta: fila, texto: pesos(saldoDe(cuenta)) }], { reducido });
      setEnGyp(quitar);
      relojes.current[cuenta] = setTimeout(() => setEnFilas(quitar), MS_VUELO);
    }
    setVaciadas(nuevas);
    const g = gananciasYPerdidas(nuevas);
    setVuelta((n) => n + 1);
    setAnuncio(`${GANANCIAS_Y_PERDIDAS}: Debe ${pesos(g.debe)}, Haber ${pesos(g.haber)}`);
  };

  const base = estadoCapa3Cierre(vaciadas);
  return (
    <div className="fae-ci" data-capa3-cierre>
      <style>{CSS_CIERRE}</style>
      <p style={{ margin: "0 0 10px", padding: "0 4px", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, color: COLOR.blanco }}>
        {CONSIGNA_CAPA_3_CIERRE}
      </p>
      <div ref={escena} data-vaciadas={vaciadas.length} style={{ position: "relative", padding: "0 4px" }}>
        <ZonaA filas={filasDe(enFilas)} reducido={reducido} comoBoton onTocar={tocar} />
        <ZonaB gyp={gananciasYPerdidas(enGyp)} reducido={reducido} />
        <ZonaC cuentas={base.zonaC} />
      </div>
      {/* Tras cada toque: «Ganancias y pérdidas: Debe {monto}, Haber {monto}», con las cifras finales. */}
      <div data-anuncio-cierre aria-live="polite" aria-atomic="true" style={SOLO_LECTOR}>
        <span key={vuelta}>{anuncio}</span>
      </div>
    </div>
  );
}
