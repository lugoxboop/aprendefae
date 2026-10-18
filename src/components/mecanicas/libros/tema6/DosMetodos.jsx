import { useState } from "react";
import { CONSIGNA_CAPA_3_T6_A2, PREGUNTA_CAPA_3_T6_A2, OPCIONES_CAPA_3_T6_A2, METODOS_T6_A2, FINAL_CAPA_3_T6_A2, PIEZA_NO_VA_A_PAGAR } from "../../../../data/contabilidadT6Pieza2.js";
import { useSegundaVisita, barajarDistinto } from "./LeyendaFinal.jsx";
import CajasQueRevelan, { LECTURA } from "./CajasQueRevelan.jsx";
import { FiguraT6A2 } from "./FigurasCapa3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 2 · CAPA 3 · «AHORA PRUEBE USTED» — los dos métodos.
 *
 * Las cajas de CajasQueRevelan.jsx. El nombre del método va en Sora 14/600
 * con el chevrón reservado (guía de Mai §5). Las dos cajas se ven iguales:
 * ningún método se ve como el «bueno». Con las dos decididas aparece el final.
 * Entre la consigna y las cajas, la rejilla de los dos métodos (§2b de Mai).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Hoja 6: abierta, cada caja pide decidir cuándo aparece el gasto antes de revelar. */
const CAJAS = METODOS_T6_A2.map((m) => ({
  id: m.id, titulo: m.nombre, revela: m.revela, pie: m.pie,
  decide: { pregunta: PREGUNTA_CAPA_3_T6_A2, opciones: OPCIONES_CAPA_3_T6_A2, correcta: m.correcta, falla: m.falla, pista: m.pista },
}));
const NOMBRE = { ...LECTURA, fontFamily: "Sora, sans-serif", fontWeight: 600 };
/* La regla de Mai (§2): en fila solo si todas caben en un renglón a 320. La segunda opción se parte a 320 (medido en Chromium): columna. */
const FORMA = "columna";

/* Lote 28 · D8: desde la segunda visita, otro orden de cajas y de opciones (una vez por intento). */
const barajadas = () => barajarDistinto(CAJAS).map((c) => ({ ...c, decide: { ...c.decide, opciones: barajarDistinto(c.decide.opciones) } }));

export default function DosMetodos() {
  const segunda = useSegundaVisita(PIEZA_NO_VA_A_PAGAR.id);
  const [cajas] = useState(() => (segunda ? barajadas() : CAJAS));
  return <CajasQueRevelan consigna={CONSIGNA_CAPA_3_T6_A2} cajas={cajas} final={FINAL_CAPA_3_T6_A2} estiloTitulo={NOMBRE} forma={FORMA} atributos={{ "data-capa3-t6-a2": true }} Figura={FiguraT6A2} />;
}
