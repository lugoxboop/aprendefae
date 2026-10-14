import { CONSIGNA_CAPA_3_T6, HECHOS_T6, FINAL_CAPA_3_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import CajasQueRevelan from "./CajasQueRevelan.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 · CAPA 3 · «AHORA PRUEBE USTED» — seis hechos (guía v1
 * de Mai, §5, con la corrección de la v2 en el pie del bloque final).
 *
 * Las cajas de CajasQueRevelan.jsx con los seis hechos: tocar uno revela si
 * lo que deben los clientes sube, baja o no cambia; con los seis abiertos
 * aparece el bloque final. Cada caja y el final llevan su pie (★ de Futaba).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CAJAS = HECHOS_T6.map((h) => ({ id: h.id, titulo: h.hecho, revela: h.revela, pie: h.pie }));

export default function SeisHechos() {
  return <CajasQueRevelan consigna={CONSIGNA_CAPA_3_T6} cajas={CAJAS} final={FINAL_CAPA_3_T6} atributos={{ "data-capa3-t6": true }} />;
}
