import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./embajadores.css";

/* Entrada propia del prototipo de horas de embajadores (ruta oculta /turnos-7k/). */
createRoot(document.getElementById("root")).render(<App />);
