/*
 * MACRO 2026 · EL ELENCO (10 personajes de Gen, generados con Gemini)
 *
 * Estilo y descripciones bloqueados en
 * orquestador/conocimiento/guia-estilo-imagenes.md, «Elenco de Macroeconomía
 * 2026». Los PNG viven en public/macro2026/personajes/ (512 px, transparentes,
 * ≤ 120 KB).
 *
 * Reglas de uso (Gen, 23-nov):
 * - <img> con alt = el nombre del personaje, width/height fijos, y
 *   loading="lazy" si no está en la primera pantalla.
 * - El contorno es azul muy oscuro (#121418) y casi desaparece sobre el navy:
 *   cada personaje va sobre un disco claro (#C9D1E4 al 18 %).
 * - 72 px de alto como mínimo donde el personaje es figura; en la escalera
 *   (que lo lleva de peldaño en peldaño) se mide aparte.
 */

export const ELENCO = {
  empresario: "El empresario",
  analista: "La analista",
  "autoridad-economica": "La autoridad económica",
  profesor: "El profesor",
  familia: "Familia",
  inversionista: "Inversionista",
  "exportadora-flores": "Exportadora de flores",
  "importadora-celulares": "Importadora de celulares",
  viajero: "Viajero",
  "deudor-externo": "Quien paga deuda externa",
};

export const rutaPersonaje = (id) => `/macro2026/personajes/${id}.png`;

/** El disco claro que hace legible el contorno oscuro sobre el fondo navy. */
export const DISCO = "rgba(201, 209, 228, 0.18)";

export function FotoPersonaje({ id, alto = 72, perezosa = false, decorativa = false, style = null, ...resto }) {
  return (
    <span
      data-foto-personaje={id}
      style={{ display: "inline-grid", placeItems: "center", flex: "none", width: alto, height: alto, borderRadius: "50%", background: DISCO, ...style }}
      {...resto}
    >
      <img
        src={rutaPersonaje(id)}
        alt={decorativa ? "" : ELENCO[id]}
        width={alto}
        height={alto}
        loading={perezosa ? "lazy" : "eager"}
        decoding="async"
        draggable={false}
        style={{ display: "block", width: alto, height: alto, objectFit: "contain" }}
      />
    </span>
  );
}
