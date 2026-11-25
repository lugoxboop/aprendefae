import { createRoot } from "react-dom/client";
import { useState } from "react";
import { SecuenciaRacha } from "../../../src/components/racha/MomentoRacha.jsx";
import IconoRacha from "../../../src/components/shared/IconoRacha.jsx";

/*
 * Banco de CAPTURAS del momento de racha (la mascota feliz con su llama).
 *   ?especie=zorro&paleta=natural&nombre=Kiko&desde=7&hasta=8&puestos=gafas&dias=2026-11-24,2026-11-25
 *   ?vista=iconos   la llama pequeña en sus tamaños reales (ficha y Repaso)
 * Monta la secuencia real (SecuenciaRacha) con un momento fijo. Nada escribe.
 */
const q = new URLSearchParams(location.search);
const perfil = {
  id: "u", nickname: "yo",
  mascota_especie: q.get("especie") ?? "zorro",
  mascota_paleta: q.get("paleta") ?? "natural",
  mascota_nombre: q.get("nombre") ?? "",
  mascota_puestos: q.get("puestos") ? q.get("puestos").split(",") : [],
};
const momento = {
  mostrar: true,
  desde: Number(q.get("desde") ?? 7),
  hasta: Number(q.get("hasta") ?? 8),
  hoy: "2026-11-25",
  semana: (q.get("dias") ?? "2026-11-23,2026-11-24,2026-11-25").split(","),
};

function Banco() {
  const [vez, setVez] = useState(0);
  if (q.get("vista") === "iconos") {
    return (
      <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        {[15, 22, 28, 40].map((t) => <IconoRacha key={t} tamano={t} />)}
        {[15, 28].map((t) => <IconoRacha key={`a${t}`} tamano={t} encendida={false} colorApagado="#7A8798" />)}
        <IconoRacha tamano={22} encendida={false} colorApagado="#FFFFFF" />
      </div>
    );
  }
  return <SecuenciaRacha key={vez} momento={momento} perfil={perfil} onFin={() => { window.__fin = (window.__fin ?? 0) + 1; }} />;
}
createRoot(document.getElementById("raiz")).render(<Banco />);
