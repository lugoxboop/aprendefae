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
import { AuthContext } from "../../src/auth/AuthProvider.jsx";
import { MarcoLibros } from "../../src/components/mecanicas/bloques/marcos.jsx";
import { FAE } from "../../src/theme.js";

const VISTAS = import.meta.glob("../../src/components/*View.jsx", { eager: true });
/* Las secuencias de Aprender no están en JUEGOS: viven en módulos propios que
 * exportan PIEZAS_* y TEMA_*, y los importa cada vista. Se recogen igual. */
const SECUENCIAS_MOD = import.meta.glob(
  ["../../src/components/mecanicas/libros/**/secuencia/*.js", "../../src/components/mecanicas/libros/**/secuencia*.jsx", "../../src/components/mecanicas/libros/t7/Aprender*.jsx"],
  { eager: true }
);

const CATALOGO = new Map();
for (const [ruta, mod] of Object.entries(VISTAS)) {
  /*
   * No todas se llaman `JUEGOS`: las tres vistas de T7 usan `JUEGOS_T7_1` y
   * compañía, y por mirar solo el nombre exacto se quedaban fuera tres temas
   * enteros. Vale cualquier `JUEGOS*` cuyas entradas tengan id y Mecánica.
   */
  for (const [nombre, lista] of Object.entries(mod)) {
    if (!/^JUEGOS/.test(nombre) || !Array.isArray(lista)) continue;
    for (const j of lista) {
      if (!j?.id || typeof j.Mecanica !== "function" || CATALOGO.has(j.id)) continue;
      CATALOGO.set(j.id, { ...j, vista: ruta.split("/").pop() });
    }
  }
}
/*
 * Las secuencias, por su clave: de `PIEZAS_T7_1` sale `t7_1`, y su tema sale de
 * `TEMA_T7_1` del mismo módulo (o del `TEMA_*` que haya, si solo hay uno).
 */
const SECUENCIAS = new Map();
for (const [ruta, mod] of Object.entries({ ...VISTAS, ...SECUENCIAS_MOD })) {
  const temas = Object.entries(mod).filter(([k, v]) => (k === "TEMA" || k.startsWith("TEMA_")) && typeof v === "string");
  const css = Object.entries(mod).filter(([k, v]) => k.startsWith("CSS_") && typeof v === "string").map(([, v]) => v);
  for (const [k, piezas] of Object.entries(mod)) {
    /*
     * No todo `PIEZAS_*` es una secuencia de Aprender: T7 y T4 tienen listas
     * con el mismo nombre para otros componentes, y montarlas aquí revienta
     * con «pieza.pantallas is not iterable». La forma manda sobre el nombre.
     */
    if (!k.startsWith("PIEZAS_") || !Array.isArray(piezas) || !piezas.length) continue;
    if (!piezas.every((pz) => Array.isArray(pz?.pantallas))) continue;
    const sufijo = k.slice("PIEZAS_".length);
    const clave = sufijo.toLowerCase().replace(/_/g, "-");
    /* Sin TEMA a mano, uno de mentira: aquí solo sirve de clave de guardado. */
    const tema = temas.find(([tk]) => tk.slice("TEMA_".length) === sufijo)?.[1] ?? temas[0]?.[1] ?? `banco-${clave}`;
    if (!SECUENCIAS.has(clave)) SECUENCIAS.set(clave, { tema, piezas, css, modulo: ruta.split("/").pop() });
  }
}

window.__CATALOGO = [
  ...[...CATALOGO.entries()].map(([id, j]) => ({ id, vista: j.vista, clase: "hacer" })),
  ...[...SECUENCIAS.entries()].map(([k, v]) => ({ id: `aprender:${k}`, vista: v.modulo, clase: "aprender", piezas: v.piezas.length })),
];

const { default: JuegoConTutorial } = await import("../../src/components/mecanicas/libros/JuegoConTutorial.jsx")
  .catch(() => ({ default: null }));

/*
 * Cuatro piezas usan `useAuth` y reventaban aquí con «debe usarse dentro de
 * <AuthProvider>». No es un fallo suyo: era del banco. Se les da una sesión de
 * mentira, como hace el banco del ranking.
 */
const SESION_FALSA = {
  session: { user: { id: "u-banco" } },
  perfil: { nickname: "Banco", avatar_shape: "nucleo", avatar_palette: "marea", avatar_level: 2 },
  pedirCuenta: () => {},
};

const [id, consulta = ""] = decodeURIComponent(location.hash.slice(1)).split("?");
const juego = CATALOGO.get(id);
const secuencia = id.startsWith("aprender:") ? SECUENCIAS.get(id.slice("aprender:".length)) : null;
const raiz = createRoot(document.getElementById("raiz"));

if (secuencia) {
  const { default: SecuenciaAprender } = await import("../../src/components/secuencia/SecuenciaAprender.jsx");
  raiz.render(
    <StrictMode>
      <AuthContext.Provider value={SESION_FALSA}>
        <div data-pieza={id} style={{ padding: "16px" }}>
          {secuencia.css.map((c, i) => <style key={i}>{c}</style>)}
          <SecuenciaAprender temaId={secuencia.tema} piezas={secuencia.piezas} final="tema" onFinal={() => {}} />
        </div>
      </AuthContext.Provider>
    </StrictMode>
  );
} else if (!juego) {
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
      <AuthContext.Provider value={SESION_FALSA}>
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
      </AuthContext.Provider>
    </StrictMode>
  );
}
