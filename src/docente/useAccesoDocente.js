import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { accesoDocente } from "./datos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿ES DOCENTE, Y DE QUÉ MATERIAS? — con la respuesta guardada por sesión.
 *
 * El enlace «ver cómo le fue al grupo» aparece en las cinco vistas de tema, así
 * que esta pregunta se hace cada vez que alguien abre una actividad. Sin caché
 * serían dos llamadas al servidor por apertura para un docente y una para un
 * estudiante, siempre las mismas y siempre con la misma respuesta.
 *
 * ═══════════ LA CACHÉ SE TIRA AL CAMBIAR DE SESIÓN, NO POR TIEMPO ═══════════
 *
 * Una caché con caducidad tendría que elegir un número, y cualquier número
 * estaría mal: la respuesta no cambia sola, cambia cuando alguien entra o sale.
 * Así que se escucha eso y ya. Entrar como docente después de haber mirado como
 * invitado recalcula; quedarse una hora en la misma sesión no vuelve a
 * preguntar.
 *
 * ═══════════ EL DEFECTO SIGUE SIENDO "NO ES DOCENTE" ═══════════
 *
 * Todo lo que decide accesoDocente() vale igual aquí: mientras no se sabe, el
 * estado es el cerrado, y una llamada que falle deja el cerrado. Un enlace que
 * no aparece no le rompe el día a nadie; uno que aparece de más enseña que
 * existe una pantalla que no debería.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CERRADO = { esDocente: false, materias: [] };

/* La respuesta viva de esta sesión. null = todavía no se ha preguntado. */
let cache = null;
let enVuelo = null;
/* Quién quiere enterarse cuando la respuesta cambie. */
const suscriptores = new Set();

function avisar(valor) {
  cache = valor;
  for (const fn of suscriptores) fn(valor);
}

function preguntar() {
  if (cache) return Promise.resolve(cache);
  if (enVuelo) return enVuelo;
  enVuelo = accesoDocente()
    .then((a) => {
      enVuelo = null;
      avisar(a);
      return a;
    })
    .catch(() => {
      enVuelo = null;
      avisar(CERRADO);
      return CERRADO;
    });
  return enVuelo;
}

/*
 * Un solo oyente para todo el módulo, montado la primera vez que alguien
 * pregunta. TOKEN_REFRESHED se ignora a propósito: renovar el token no cambia
 * quién eres, y recalcular en cada renovación sería tráfico sin motivo.
 */
let escuchando = false;
function escuchar() {
  if (escuchando || !supabase) return;
  escuchando = true;
  supabase.auth.onAuthStateChange((evento) => {
    if (evento === "TOKEN_REFRESHED" || evento === "USER_UPDATED") return;
    cache = null;
    enVuelo = null;
    preguntar();
  });
}

/** El acceso docente de la sesión actual. Mientras no se sabe, va cerrado. */
export function useAccesoDocente() {
  const [acceso, setAcceso] = useState(cache ?? CERRADO);

  useEffect(() => {
    let vivo = true;
    escuchar();
    const alCambiar = (valor) => { if (vivo) setAcceso(valor); };
    suscriptores.add(alCambiar);
    preguntar().then((a) => { if (vivo) setAcceso(a); });
    return () => {
      vivo = false;
      suscriptores.delete(alCambiar);
    };
  }, []);

  return acceso;
}

/** Solo para las pruebas: olvidar lo aprendido. */
export function _olvidarAcceso() {
  cache = null;
  enVuelo = null;
}
