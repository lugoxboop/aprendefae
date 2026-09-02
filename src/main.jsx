import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import PrivacidadView from "./components/PrivacidadView.jsx";
import { NavigationContext } from "./navigation.js";
import { AuthProvider } from "./auth/AuthProvider.jsx";


import "./styles/global.css";
import "./styles/home.css";

/*
 * /privacidad se compila como documento estático propio, pero algunos hosts
 * responden a la ruta sin barra final con el index del SPA. Si eso pasa,
 * reconocemos la ruta aquí y montamos la misma página, para que la URL que se
 * entrega a la verificación de Google muestre siempre la política.
 */
const isPrivacidad = window.location.pathname.replace(/\/+$/, "") === "/privacidad";

const navigation = { goHome: () => { window.location.href = "/"; } };

/* Al llegar por el fallback, el título viene del index del SPA: se corrige. */
if (isPrivacidad) document.title = "Política de privacidad · AprendeFAE";

createRoot(document.getElementById("root")).render(
  isPrivacidad ? (
    <NavigationContext.Provider value={navigation}>
      <PrivacidadView />
    </NavigationContext.Provider>
  ) : (
    /*
     * El control de cuenta y el diálogo los monta App dentro de su proveedor de
     * navegación, no este archivo.
     *
     * Estuvieron aquí, como hermanos de <App />, y por eso "Ver mi perfil" no
     * hacía nada: NavigationContext se crea DENTRO de App, así que desde aquí
     * el contexto llegaba en null y `nav?.irAPerfil?.()` se resolvía en un
     * encogimiento de hombros — sin navegar y sin error que lo delatara.
     */
    <AuthProvider>
      <App />
    </AuthProvider>
  )
);
