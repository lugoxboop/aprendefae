import { useState } from "react";
import { FAE } from "../theme.js";
import { HERO_SUBCOPY, franjaDe, titularesDe } from "../data/heroPhrases.js";

/*
 * Elige el titular de la sesión.
 *
 * TRES REGLAS, EN ESTE ORDEN:
 *   1. Dentro de una sesión no cambia. Recargar la portada y que el titular
 *      salte es lo que hace que una página parezca inestable.
 *   2. Salvo que haya cambiado la franja. El que abrió a las 23:50 y vuelve
 *      a las 00:10 ya no está en la misma noche: se vuelve a sortear.
 *   3. No repite el de la última vez. Dos visitas seguidas con la misma frase
 *      se leen como «solo tiene una».
 *
 * Si sessionStorage o localStorage fallan —modo privado, almacenamiento
 * bloqueado—, sortea y ya: el titular nunca puede tumbar la portada.
 */
export function elegirTitular(ahora = new Date(), sorteo = Math.random) {
  const CLAVE = "fae:titular";
  const ULTIMO = "fae:titular:ultimo";
  const lote = titularesDe(ahora);
  const franja = franjaDe(ahora.getHours());
  const alAzar = (lista) => lista[Math.min(lista.length - 1, Math.floor(sorteo() * lista.length))];

  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE) || "null");
    if (guardado?.franja === franja && lote.includes(guardado.frase)) return guardado.frase;

    const ultimo = localStorage.getItem(ULTIMO);
    const candidatas = lote.filter((f) => f !== ultimo);
    const frase = alAzar(candidatas.length ? candidatas : lote);

    sessionStorage.setItem(CLAVE, JSON.stringify({ franja, frase }));
    localStorage.setItem(ULTIMO, frase);
    return frase;
  } catch {
    return alAzar(lote);
  }
}

export default function Hero() {
  const [titular] = useState(() => elegirTitular());

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
        {titular}
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
