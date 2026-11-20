import { createRoot } from "react-dom/client";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import PerfilView from "../../../src/components/PerfilView.jsx";

/*
 * Banco de CAPTURAS de «Tu perfil». Sesión fingida; logros, resumen, ánimos,
 * ranking y acceso docente van sustituidos en capturar.mjs. Nada escribe.
 *   ?especie=zorro&paleta=naranja&puestos=gafas&apodo=Mateo&racha=5
 */
const q = new URLSearchParams(location.search);
const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
const perfil = {
  id: "u", nickname: q.get("apodo") ?? "Mateo", full_name: "Mateo Lugo",
  points: Number(q.get("fp") ?? 1840), streak: Number(q.get("racha") ?? 5), best_streak: 9,
  last_activity_day: hoy, cristales_balance: 120,
  mascota_especie: q.get("especie") ?? "zorro", mascota_nombre: q.get("mascota") ?? "Tiara",
  mascota_paleta: q.get("paleta") ?? "natural",
  mascota_puestos: q.get("puestos") ? q.get("puestos").split(",") : [],
  mascota_accesorios: q.get("puestos") ? q.get("puestos").split(",") : [],
};
const auth = {
  session: { user: { id: "u" } }, usuario: { id: "u" }, perfil, pedirCuenta: () => {},
  guardarPerfil: async () => ({}), personalizarMascota: async () => ({}), equiparAccesorio: async () => ({}),
};
createRoot(document.getElementById("raiz")).render(
  <AuthContext.Provider value={auth}>
    <PerfilView onBack={() => {}} />
  </AuthContext.Provider>
);
