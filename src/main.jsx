import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import PrivacidadView from "./components/PrivacidadView.jsx";
import { NavigationContext } from "./navigation.js";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import AccountControl from "./components/auth/AccountControl.jsx";
import AuthDialog from "./components/auth/AuthDialog.jsx";
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
     * El control de cuenta y el diálogo viven fuera de <App /> para que estén en
     * todas las vistas sin que cada una tenga que montarlos.
     */
    <AuthProvider>
      <App />
      <AccountControl />
      <AuthDialog />
    </AuthProvider>
  )
);
