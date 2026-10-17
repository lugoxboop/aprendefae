import { CONSIGNA_CAPA_3, CONTEXTO_CAPA_3, PREGUNTA_CAPA_3, OPCIONES_CAPA_3, PAQUETES, FINAL_CAPA_3, PIE_FINAL_CAPA_3 } from "../../../../data/contabilidadT5Pieza1.js";
import { useState } from "react";
import CajasQueRevelan, { LECTURA } from "../tema6/CajasQueRevelan.jsx";
import { FiguraT5A1 } from "../tema6/FigurasCapa3.jsx";

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
 * Entre la consigna y las cajas, los dos cajones (§2b de Mai, FigurasCapa3).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CAJAS = PAQUETES.map((p) => ({
  id: p.id, titulo: p.nombre, cifras: [p.descripcion], revela: p.revela, pie: p.pie,
  decide: { pregunta: PREGUNTA_CAPA_3, opciones: OPCIONES_CAPA_3, correcta: p.correcta, falla: p.falla, pista: p.pista },
}));
const NOMBRE = { ...LECTURA, fontFamily: "Sora, sans-serif", fontWeight: 600, lineHeight: 1.35 };

/*
 * D8 (Mello, Kit v4; opcional, Célula C): `mezclar(opciones)` baraja las opciones de cada caja una vez
 * al montar (la barajar de #442: utils/barajar.js); dentro de un intento no cambian, el siguiente trae
 * otro orden. Sin `mezclar`, el orden de los datos, como siempre.
 */
const conOrden = (cajas, mezclar) => (mezclar ? cajas.map((c) => ({ ...c, decide: { ...c.decide, opciones: mezclar(c.decide.opciones) } })) : cajas);

/* `c4` (opcional, Célula C: tema5/capa3C4T5.jsx): el patrón C4 de la capa 3. Sin él, como siempre. */
export default function DosPaquetes({ c4 = null, mezclar = null }) {
  const [cajas] = useState(() => conOrden(CAJAS, mezclar));
  return (
    <CajasQueRevelan consigna={CONSIGNA_CAPA_3} contexto={CONTEXTO_CAPA_3} cajas={cajas} final={{ texto: FINAL_CAPA_3, pie: PIE_FINAL_CAPA_3 }}
      estiloTitulo={NOMBRE} forma="columna" atributos={{ "data-capa3-t5": true }} Figura={FiguraT5A1} c4={c4} />
  );
}
