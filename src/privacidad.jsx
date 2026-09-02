import { createRoot } from "react-dom/client";
import PrivacidadView from "./components/PrivacidadView.jsx";
import { NavigationContext } from "./navigation.js";
import "./styles/global.css";

/*
 * Entrada propia de /privacidad. Es un documento aparte del SPA, así que el
 * logo vuelve al inicio con una navegación de página completa.
 */
const navigation = { goHome: () => { window.location.href = "/"; } };

createRoot(document.getElementById("root")).render(
  <NavigationContext.Provider value={navigation}>
    <PrivacidadView />
  </NavigationContext.Provider>
);
