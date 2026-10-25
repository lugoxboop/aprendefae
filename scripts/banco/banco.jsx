/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BANCO COMÚN: cualquier pieza de Hacer, por su id.
 *
 * Había 22 bancos, uno por célula y por lote, y aun así piezas fusionadas que
 * no se podían abrir —ninguno montaba `tema1`—. Esto lo arregla sin inventar
 * una segunda verdad: **la lista de qué id es qué componente ya existe**, es
 * el `JUEGOS` de cada vista de tema, y es la única. Aquí se importan las trece
 * y se juntan.
 *
 * Nueve ya están exportadas. Las otras cuatro las exporta al vuelo el plugin
 * de `scripts/banco.mjs`, para no pedir trece ediciones repartidas entre cinco
 * células antes de poder mirar nada. Cuando se exporten de verdad, el plugin
 * se queda sin trabajo y no hay que tocar esto.
 *
 * Monta por `JuegoConTutorial`, igual que la vista real, no la mecánica
 * desnuda: así se mide lo que ve el estudiante, con «Así se juega» incluido.
 *
 *   #<activity_id>            la pieza
 *   #<activity_id>?sin-tutorial   saltándose «Así se juega»
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";
import { MarcoLibros } from "../../src/components/mecanicas/bloques/marcos.jsx";
import { FAE } from "../../src/theme.js";

const VISTAS = import.meta.glob("../../src/components/*View.jsx", { eager: true });

const CATALOGO = new Map();
for (const [ruta, mod] of Object.entries(VISTAS)) {
  if (!Array.isArray(mod.JUEGOS)) continue;
  for (const j of mod.JUEGOS) if (j?.id && !CATALOGO.has(j.id)) CATALOGO.set(j.id, { ...j, vista: ruta.split("/").pop() });
}
window.__CATALOGO = [...CATALOGO.entries()].map(([id, j]) => ({ id, vista: j.vista }));

const { default: JuegoConTutorial } = await import("../../src/components/mecanicas/libros/JuegoConTutorial.jsx")
  .catch(() => ({ default: null }));

const [id, consulta = ""] = decodeURIComponent(location.hash.slice(1)).split("?");
const juego = CATALOGO.get(id);
const raiz = createRoot(document.getElementById("raiz"));

if (!juego) {
  raiz.render(
    <div style={{ padding: 16, color: "#F8F9FA", fontFamily: "Inter, sans-serif", fontSize: 14 }}>
      <p style={{ margin: "0 0 12px" }}>{id ? `No hay ninguna pieza con el id «${id}».` : "Pon el id de la pieza en el hash."}</p>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
        {window.__CATALOGO.map((j) => (
          <li key={j.id}><a href={`#${j.id}`} style={{ color: "#2A9D8F" }}>{j.id}</a> <span style={{ opacity: 0.5 }}>· {j.vista}</span></li>
        ))}
      </ul>
    </div>
  );
} else {
  const Pieza = juego.Mecanica;
  raiz.render(
    <StrictMode>
      <div data-pieza={id} style={{ padding: "16px" }}>
        {/*
          Marco, rotulo y acento los pone la vista real; sin ellos la mecánica
          intenta pintar un componente indefinido y no sale nada.
        */}
        {JuegoConTutorial && !consulta.includes("sin-tutorial") ? (
          <JuegoConTutorial key={id} juego={juego} usuarioId={null} tituloVisible={false}
            Marco={MarcoLibros} rotulo="BANCO" acento={FAE.teal} onCompletar={() => {}} />
        ) : (
          <Pieza Marco={MarcoLibros} rotulo="BANCO" titulo={juego.titulo ?? id} acento={FAE.teal} onCompletar={() => {}} />
        )}
      </div>
    </StrictMode>
  );
}
