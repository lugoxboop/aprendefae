import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { FAE } from "../../theme.js";
import HojaOpinion from "./HojaOpinion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BOTÓN DE OPINIÓN EN LA PORTADA
 *
 * ═══════════ DÓNDE VA Y POR QUÉ AHÍ ═══════════
 *
 * Debajo de las tarjetas de materia y encima del pie. No flotando en una
 * esquina: un botón flotante tapa contenido, pelea con la ficha de FP que ya
 * va fija arriba a la derecha, y en un teléfono se queda justo donde está el
 * pulgar cuando se quiere tocar una materia. Aquí se encuentra al bajar la
 * vista —que es cuando alguien ya mira «y esto qué más tiene»— y no estorba
 * a quien entró a estudiar, que es casi todo el mundo.
 *
 * Entra en el puesto 5 de la coreografía, con el pie: es accesorio y tiene que
 * leerse como accesorio. Si entrara con las tarjetas competiría con la única
 * decisión que importa en esta pantalla, que es elegir materia.
 *
 * ═══════════ POR QUÉ «ANÓNIMO» SE DICE YA EN EL BOTÓN ═══════════
 *
 * Porque la decisión de opinar se toma antes de abrir la hoja. Quien lee
 * «dinos qué te parece» calcula en silencio cuánto le va a costar que su
 * nombre quede pegado a una queja, y si la respuesta aparece solo después de
 * abrir, muchos ya no abren. La palabra va en el botón, pequeña y separada por
 * un punto medio, y repetida completa dentro.
 *
 * El pseudo-elemento de hover y foco va en un <style> propio: son estados que
 * el estilo en línea no puede expresar, y el archivo se mantiene autónomo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_BOTON_OPINION = `
.fae-op-boton {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: rgba(248,249,250,0.055);
  border: 1px solid rgba(248,249,250,0.16);
  color: #F8F9FA;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 220ms cubic-bezier(.3,.9,.4,1),
              border-color 220ms cubic-bezier(.3,.9,.4,1),
              transform 220ms cubic-bezier(.3,.9,.4,1);
}
.fae-op-boton:hover {
  background: rgba(42,157,143,0.14);
  border-color: rgba(42,157,143,0.62);
  transform: translateY(-1px);
}
.fae-op-boton:active { transform: translateY(0); }
.fae-op-boton:focus-visible {
  outline: 2px solid #2A9D8F;
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .fae-op-boton { transition: none; }
  .fae-op-boton:hover, .fae-op-boton:active { transform: none; }
}
`;

export default function BotonOpinion({ origen = "inicio" }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <style>{CSS_BOTON_OPINION}</style>
      <button
        type="button"
        className="fae-op-boton"
        onClick={() => setAbierta(true)}
        data-boton-opinion
      >
        <MessageSquare size={15} color={FAE.teal} strokeWidth={2.2} aria-hidden="true" />
        <span>Dinos qué te parece</span>
        <span aria-hidden="true" style={{ color: "rgba(248,249,250,0.30)" }}>·</span>
        <span style={{ fontWeight: 500, color: "#A8B6C8" }}>anónimo</span>
      </button>
      {/*
        * La hoja se monta al abrirla, no antes. No es solo ahorro: la hoja lee
        * la sesión para saber si puede ofrecer firmar, y montarla siempre
        * obligaba a la portada entera a vivir dentro de <AuthProvider>. Tres
        * pruebas de portada que la pintan suelta se cayeron por eso.
        */}
      {abierta && (
        <HojaOpinion abierta onCerrar={() => setAbierta(false)} origen={origen} />
      )}
    </>
  );
}
