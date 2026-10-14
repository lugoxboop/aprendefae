import { CONSIGNA_CAPA_3_T5_A2, VENTAS_T5_A2, FINAL_CAPA_3_T5_A2 } from "../../../../data/contabilidadT5Pieza2.js";
import CajasQueRevelan, { LECTURA } from "../tema6/CajasQueRevelan.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 · CAPA 3 · «AHORA PRUEBE USTED» — las dos ventas (guía de
 * Mai v1 §5, con los textos de Futaba).
 *
 * Las cajas de CajasQueRevelan.jsx (Tema 6). Cerrada, cada venta muestra su
 * nombre en Sora 14/600 con el chevrón y, debajo, lo que se recibió y lo que
 * costaron. Sin color de acierto ni de error, sin verde ni rojo: ganancia y
 * pérdida las dice la palabra. Con las dos abiertas aparece el final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CAJAS = VENTAS_T5_A2.map((v) => ({ id: v.id, titulo: v.nombre, cifras: v.cifras, revela: v.revela, pie: v.pie }));
const NOMBRE = { ...LECTURA, fontFamily: "Sora, sans-serif", fontWeight: 600, lineHeight: 1.35 };

export default function DosVentas() {
  return <CajasQueRevelan consigna={CONSIGNA_CAPA_3_T5_A2} cajas={CAJAS} final={FINAL_CAPA_3_T5_A2} estiloTitulo={NOMBRE} atributos={{ "data-capa3-t5-a2": true }} />;
}
