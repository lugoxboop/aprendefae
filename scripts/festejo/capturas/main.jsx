import { createRoot } from "react-dom/client";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import PantallaResumen, { ContextoResumen } from "../../../src/components/shared/PantallaResumen.jsx";
import RepasoView from "../../../src/components/repaso/RepasoView.jsx";
import MascotaFestejo from "../../../src/components/shared/MascotaFestejo.jsx";

/*
 * Banco de CAPTURAS del festejo de cierre (la mascota celebra al terminar).
 *   ?vista=resumen&festejo=baila&especie=perro&paleta=canela&pct=90
 *   ?vista=repaso  (el Repaso Diario recién hecho; useRepaso va sustituido)
 * Nada aquí escribe en ningún sitio.
 */
const q = new URLSearchParams(location.search);
const festejo = q.get("festejo");
import { FESTEJOS } from "../../../src/mascota/marionetas.js";
/* Fija el festejo: sin «último» guardado, el azar elige entre los seis en orden. */
if (festejo) {
  try { sessionStorage.setItem("fae-festejo-ultimo", "ninguno"); } catch { /* */ }
  const i = Math.max(0, FESTEJOS.indexOf(festejo));
  Math.random = () => (i + 0.5) / FESTEJOS.length;
}
const perfil = {
  id: "u", nickname: "yo", mascota_especie: q.get("especie") ?? "perro", mascota_paleta: q.get("paleta") ?? "natural",
  mascota_puestos: q.get("puestos") ? q.get("puestos").split(",") : [],
};
const auth = { session: { user: { id: "u" } }, usuario: { id: "u" }, perfil, pedirCuenta: () => {} };
const pct = Number(q.get("pct") ?? 90);
const bien = Math.round((pct / 100) * 10);
const detalle = [
  ...Array.from({ length: bien }, (_, k) => ({ item: `b${k}`, ok: true, intentos: 1 })),
  ...Array.from({ length: 10 - bien }, (_, k) => ({ item: `m${k}`, ok: false, intentos: 1, respuesta: "x" })),
];
const registro = { id: 1, fp_awarded: 40, repeat_index: 0, correct_pct: pct };
const partida = {
  id: 1, actividadId: "cu-cuadro-dinamicas", listo: true, valida: true, pct, detalle, registro,
  clasificacion: { tipo: "hacer", modalidad: "evaluativa", dificultad: "medio" },
  aviso: { fp: 40, repetida: false, actividadId: "x", materiaId: "contabilidad", pctGuardado: pct },
};
const valor = { activa: true, partida, celebrando: false, limpiar: () => {}, onVolver: () => {}, materiaId: "contabilidad" };

createRoot(document.getElementById("raiz")).render(
  <AuthContext.Provider value={auth}>
    {q.get("vista") === "todos" ? (
      /* Los seis festejos a la vez, cada uno con una especie (para el video). */
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "36px 12px", padding: "40px 16px", maxWidth: "900px", margin: "0 auto" }}>
        {[["colita", "zorro"], ["baila", "gato"], ["canta", "perro"], ["saltitos", "conejo"], ["saluda", "huron"], ["celebra", "hamster"]].map(([f, e]) => (
          <MascotaFestejo key={f} variante={f} perfil={{ mascota_especie: e, mascota_paleta: "natural", mascota_puestos: [] }} />
        ))}
      </div>
    ) : q.get("vista") === "repaso" ? (
      <RepasoView onBack={() => {}} />
    ) : (
      <div style={{ padding: "24px 16px", maxWidth: "720px", margin: "0 auto", boxSizing: "border-box" }}>
        <ContextoResumen.Provider value={valor}>
          <PantallaResumen onRepetir={() => {}} />
        </ContextoResumen.Provider>
      </div>
    )}
  </AuthContext.Provider>
);
