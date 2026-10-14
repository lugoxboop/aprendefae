import { CONSIGNA_CAPA_3_T6_A2, METODOS_T6_A2, FINAL_CAPA_3_T6_A2 } from "../../../../data/contabilidadT6Pieza2.js";
import CajasQueRevelan, { LECTURA } from "./CajasQueRevelan.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 2 · CAPA 3 · «AHORA PRUEBE USTED» — los dos métodos.
 *
 * Las cajas de CajasQueRevelan.jsx. El nombre del método va en Sora 14/600
 * con el chevrón reservado (guía de Mai §5). Las dos cajas se ven iguales:
 * ningún método se ve como el «bueno». Con las dos abiertas aparece el final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CAJAS = METODOS_T6_A2.map((m) => ({ id: m.id, titulo: m.nombre, revela: m.revela, pie: m.pie }));
const NOMBRE = { ...LECTURA, fontFamily: "Sora, sans-serif", fontWeight: 600 };

export default function DosMetodos() {
  return <CajasQueRevelan consigna={CONSIGNA_CAPA_3_T6_A2} cajas={CAJAS} final={FINAL_CAPA_3_T6_A2} estiloTitulo={NOMBRE} atributos={{ "data-capa3-t6-a2": true }} />;
}
