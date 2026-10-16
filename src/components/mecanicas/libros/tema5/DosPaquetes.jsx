import { CONSIGNA_CAPA_3, CONTEXTO_CAPA_3, PREGUNTA_CAPA_3, OPCIONES_CAPA_3, PAQUETES, FINAL_CAPA_3, PIE_FINAL_CAPA_3 } from "../../../../data/contabilidadT5Pieza1.js";
import CajasQueRevelan, { LECTURA } from "../tema6/CajasQueRevelan.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 1 · CAPA 3 · «AHORA PRUEBE USTED» — dos paquetes de
 * acciones (guía de Mai v3, §5; hoja 6: decidir antes de revelar).
 *
 * Las cajas de CajasQueRevelan.jsx (Tema 6): cerrada, cada paquete muestra
 * su nombre en Sora 14/600 y, debajo, su descripción. Abierta, pregunta si
 * puede ser temporal (opciones en columna: son frases); al decidir, la
 * devolución si falló y el texto de siempre. Con los dos decididos, en
 * cualquier orden, aparece el bloque final. Sin color de acierto ni de error.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CAJAS = PAQUETES.map((p) => ({
  id: p.id, titulo: p.nombre, cifras: [p.descripcion], revela: p.revela, pie: p.pie,
  decide: { pregunta: PREGUNTA_CAPA_3, opciones: OPCIONES_CAPA_3, correcta: p.correcta, falla: p.falla, pista: p.pista },
}));
const NOMBRE = { ...LECTURA, fontFamily: "Sora, sans-serif", fontWeight: 600, lineHeight: 1.35 };

export default function DosPaquetes() {
  return (
    <CajasQueRevelan consigna={CONSIGNA_CAPA_3} contexto={CONTEXTO_CAPA_3} cajas={CAJAS} final={{ texto: FINAL_CAPA_3, pie: PIE_FINAL_CAPA_3 }}
      estiloTitulo={NOMBRE} forma="columna" atributos={{ "data-capa3-t5": true }} />
  );
}
