import {
  T6_ACT2, PASOS_T6_ACT2, PASOS_TEXTOS_T6_ACT2, ESTANTE_T6_ACT2, RESUMEN_T6_ACT2, ALT_T6_ACT2, DIARIO_T6_ACT2, PROVISION_2007_T6_ACT2, REGLAS_T6_ACT2,
} from "../../../../data/contabilidadT6Act2.js";
import { evaluarParte } from "../../../../contabilidad/cierreConMesa.js";
import CierreConMesa from "../b5/CierreConMesa.jsx";
import { MesaConDiario } from "../b5/LibroDiario.jsx";
import CuentaQueSeLlena, { BloqueEstado, crearCuenta } from "./CuentaQueSeLlena.jsx";
import { useVuelta } from "../b5/ConVuelta.jsx";
import {
  PASOS_V2_T6_ACT2, PROVISION_V2_T6_ACT2, T6_ACT2_V2, ALT_V2_T6_ACT2, BARRA_V2_T6_ACT2, MOMENTOS_V2_T6_ACT2, ESCENA_V2_T6_ACT2,
} from "../../../../data/b5SegundaVuelta.js";
import { TanqueCifra } from "./CifraQueMueve.jsx";
import AjusteDelAnoSiguiente from "./AjusteDelAnoSiguiente.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 2 · LA PROVISIÓN DE EL TORITO (Célula B, b5-t6-a2)
 *
 * La mesa de asientos de la célula (la del cierre de Santa Pacha,
 * generalizada) con lo propio de esta actividad. Desde el lote 6b lleva
 * dentro a b5-t6-a5, que se retiró (hoja de la fusión de Mai): cinco pasos,
 * P1 (el valor neto) → Asiento 1 (el castigo de marzo) → P2 (lo que le falta)
 * → Asiento 2 (la provisión del año siguiente) → P3 (el saldo final).
 *
 * Entre el contador y el paso, la cuenta T de la provisión, que se llena con
 * cada respuesta y no se mueve (CuentaQueSeLlena.jsx); la pregunta 1 lleva
 * encima de su campo el bloque «En el estado de situación financiera».
 * Encima de todo, el libro diario, plegado desde el principio y sin abrirse
 * solo: la provisión de 2007 y cada asiento comprobado. Estante de El Torito
 * con Caja de distractor; B específicas C15, C12 y T8.
 *
 * «Así se juega» monta la mesa sola, en modo demo, con la provisión de 2007.
 * ═══════════════════════════════════════════════════════════════════════════
 */

function CuentaDeA2(props) {
  return <CuentaQueSeLlena {...props} cierre={T6_ACT2.cierre} />;
}

export const CONFIG_T6_ACT2 = {
  actividad: T6_ACT2,
  /* Lote 6c: los pasos van plegados bajo «¿Cómo se juega?», y el ejemplo resuelto es su propio paso. */
  reglas: REGLAS_T6_ACT2,
  ejemplo: PROVISION_2007_T6_ACT2,
  partes: PASOS_T6_ACT2,
  estante: ESTANTE_T6_ACT2,
  resumen: RESUMEN_T6_ACT2,
  alt: ALT_T6_ACT2,
  evaluar: evaluarParte,
  textos: PASOS_TEXTOS_T6_ACT2,
  visual: CuentaDeA2,
  bloques: { estado: BloqueEstado },
  /* Lote 17: en las preguntas 2 y 3, el tanque a la izquierda de la pregunta, el campo y «Comprobar». */
  lados: { tanque: TanqueCifra },
  atributos: { "data-cierre-t6-a2": true },
  /* Lote 24 (D9, Mai): tras la pregunta 3, la regla del ajuste del año siguiente. Las cifras salen de los pasos de cada vuelta. */
  elementoPropio: AjusteDelAnoSiguiente,
};

/* D8 (lote 18, Futaba): la variante, Distribuidora La Ceiba y Hernán Ríos, con su T y su bloque del estado. */
const CUENTA_V2 = crearCuenta({ momentos: MOMENTOS_V2_T6_ACT2, escena: ESCENA_V2_T6_ACT2, barra: BARRA_V2_T6_ACT2 });
function CuentaDeA2V2(props) {
  return <CUENTA_V2.CuentaQueSeLlena {...props} cierre={T6_ACT2.cierre} />;
}
export const CONFIG_V2_T6_ACT2 = {
  ...CONFIG_T6_ACT2, actividad: T6_ACT2_V2, ejemplo: PROVISION_V2_T6_ACT2, partes: PASOS_V2_T6_ACT2, alt: ALT_V2_T6_ACT2,
  visual: CuentaDeA2V2, bloques: { estado: CUENTA_V2.BloqueEstado },
};

/* La configuración llega como prop: al cambiar de vuelta, la mesa no se desmonta (su resumen sigue a la vista). */
export function MesaProvision({ config = CONFIG_T6_ACT2, ...props }) {
  return <CierreConMesa config={config} {...props} />;
}

export default function ProvisionDeElTorito(props) {
  const { variante, alCompletar } = useVuelta(T6_ACT2.id, props.onCompletar);
  if (props.modoDemo) return <MesaProvision {...props} />;
  return (
    <MesaConDiario {...props} Juego={MesaProvision} config={variante ? CONFIG_V2_T6_ACT2 : CONFIG_T6_ACT2}
      inicial={variante ? PROVISION_V2_T6_ACT2 : PROVISION_2007_T6_ACT2} textos={DIARIO_T6_ACT2} quieto onCompletar={alCompletar} />
  );
}
