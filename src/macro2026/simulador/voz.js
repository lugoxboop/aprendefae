/*
 * La voz del simulador: dictar con el micrófono y escuchar a la compañera.
 *
 * Dictado: Web Speech API (SpeechRecognition / webkitSpeechRecognition). NO es
 * Baseline: la traen Chrome, Edge y Safari (con prefijo); Firefox no. Por eso
 * es MEJORA PROGRESIVA: sin ella el botón del micrófono no aparece y queda el
 * teclado, que en el celular ya trae su propio dictado. Nada se graba ni se
 * sube: el navegador entrega el texto y el estudiante lo ve antes de enviar.
 *
 * Escuchar: speechSynthesis, que sí está ampliamente disponible. Apagado por
 * defecto (el estudiante puede estar en clase o en la biblioteca).
 */
import { useCallback, useEffect, useRef, useState } from "react";

function Reconocedor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export const hayDictado = () => Boolean(Reconocedor());
export const hayVoz = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";

/** Dicta al campo: `onTexto(texto, final)` recibe lo oído mientras se habla. */
export function useDictado(onTexto) {
  const [escuchando, setEscuchando] = useState(false);
  const rec = useRef(null);
  const cb = useRef(onTexto);
  cb.current = onTexto;
  const soportado = hayDictado();

  const parar = useCallback(() => { try { rec.current?.stop(); } catch { /* ya paró */ } }, []);

  const iniciar = useCallback(() => {
    const R = Reconocedor();
    if (!R) return;
    try {
      const r = new R();
      r.lang = "es-CO";
      r.interimResults = true;
      r.continuous = false;
      r.onresult = (e) => {
        let texto = "";
        let final = false;
        for (let k = 0; k < e.results.length; k += 1) {
          texto += e.results[k][0].transcript;
          if (e.results[k].isFinal) final = true;
        }
        cb.current?.(texto.trim(), final);
      };
      r.onend = () => setEscuchando(false);
      r.onerror = () => setEscuchando(false);
      rec.current = r;
      r.start();
      setEscuchando(true);
    } catch {
      setEscuchando(false);
    }
  }, []);

  useEffect(() => () => { try { rec.current?.abort(); } catch { /* nada */ } }, []);
  return { soportado, escuchando, iniciar, parar };
}

/** Lee en voz alta (si el estudiante encendió la voz). */
export function hablar(texto) {
  if (!hayVoz() || !texto) return;
  const s = window.speechSynthesis;
  s.cancel();
  const u = new window.SpeechSynthesisUtterance(texto);
  const voces = s.getVoices?.() ?? [];
  u.voice = voces.find((v) => /^es[-_]CO/i.test(v.lang)) || voces.find((v) => /^es[-_](419|MX|US)/i.test(v.lang)) || voces.find((v) => /^es/i.test(v.lang)) || null;
  u.lang = u.voice?.lang || "es-CO";
  u.rate = 1.02;
  s.speak(u);
}

export function callar() {
  if (hayVoz()) window.speechSynthesis.cancel();
}
