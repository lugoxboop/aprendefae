import { useState } from "react";
import { FAE } from "../theme.js";
import { HERO_PHRASES, HERO_SUBCOPY } from "../data/heroPhrases.js";

/*
 * Elige el titular de la sesión, igual que el export:
 * - Si la sesión ya tiene uno guardado, se reutiliza (no cambia al recargar).
 * - Si no, se sortea entre todos menos el de la sesión anterior, para no repetir.
 * - Si sessionStorage/localStorage fallan, cae a un sorteo simple.
 * Es idempotente: volver a llamarla dentro de la misma sesión devuelve lo mismo.
 */
export function pickHeadlineIndex() {
  const KEY = "fae:headline";
  const LAST = "fae:headline:last";
  try {
    const held = sessionStorage.getItem(KEY);
    if (held !== null && HERO_PHRASES[+held]) return +held;
    const last = localStorage.getItem(LAST);
    const pool = HERO_PHRASES.map((h, i) => i).filter((i) => String(i) !== last);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    sessionStorage.setItem(KEY, String(pick));
    localStorage.setItem(LAST, String(pick));
    return pick;
  } catch (e) {
    return Math.floor(Math.random() * HERO_PHRASES.length);
  }
}

export default function Hero() {
  const [index] = useState(pickHeadlineIndex);

  return (
    <div style={{ textAlign: "center", maxWidth: "min(90vw, 560px)" }}>
      <h1
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(30px, 5.4vw, 58px)",
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
          margin: 0,
          color: FAE.text,
          textWrap: "balance",
          minHeight: "2.1em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {HERO_PHRASES[index]}
      </h1>
      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.5,
          color: "rgba(248,249,250,0.62)",
          margin: "clamp(10px, 1.6vh, 18px) 0 0",
        }}
      >
        {HERO_SUBCOPY}
      </p>
    </div>
  );
}
