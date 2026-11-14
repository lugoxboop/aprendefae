import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS RETOS EN COMPAÑÍA, para la interfaz.
 *
 * Toda la lógica vive en la base (0166): este hook llama a sus funciones y
 * guarda el resultado. `retos_estado()` trae de un viaje los tres grupos —retos
 * activos (con el progreso de cada quien), invitaciones recibidas y enviadas—,
 * cada tarjeta ya con la mascota del otro.
 *
 * Tras cerrar un reto logrado, la base le paga cristales a los dos; el
 * componente que use este hook debe refrescar su perfil para ver el saldo nuevo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const VACIO = { activos: [], invitaciones: [], enviadas: [] };

export function mensajeReto(error) {
  const msg = error?.message || "";
  const code = error?.code || "";
  if (/Ya tienen un reto/i.test(msg) || code === "23505") return "Ya tienen un reto en curso con esa persona.";
  if (/Solo puedes retar a tus amigos/i.test(msg)) return "Solo puedes retar a tus amigos. Agrégalo primero.";
  if (/retarte a ti mismo/i.test(msg)) return "No puedes retarte a ti mismo.";
  if (/ya no espera respuesta/i.test(msg)) return "Ese reto ya no espera respuesta.";
  if (/ya venció/i.test(msg)) return "El reto ya venció. Empieza uno nuevo.";
  if (/no completan la meta/i.test(msg)) return "Todavía no completan la meta entre los dos.";
  if (/sesión/i.test(msg) || code === "42501") return "Inicia sesión para los retos.";
  return "No se pudo. Intenta de nuevo en un momento.";
}

export function useRetos(activo = true) {
  const [estado, setEstado] = useState(VACIO);
  const [cargando, setCargando] = useState(Boolean(activo));
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    if (!supabase) { setCargando(false); return; }
    const { data, error: err } = await supabase.rpc("retos_estado");
    if (err) { setError("No pudimos cargar tus retos."); setCargando(false); return; }
    setError(null);
    setEstado({
      activos: data?.activos ?? [],
      invitaciones: data?.invitaciones ?? [],
      enviadas: data?.enviadas ?? [],
    });
    setCargando(false);
  }, []);

  useEffect(() => { if (activo) recargar(); }, [activo, recargar]);

  const retar = useCallback(async (amigoUserId) => {
    if (!supabase) return { error: "Sin conexión." };
    const { error: err } = await supabase.rpc("reto_crear", { p_amigo: amigoUserId });
    if (err) return { error: mensajeReto(err) };
    await recargar();
    return { ok: true };
  }, [recargar]);

  const responder = useCallback(async (id, aceptar) => {
    if (!supabase) return { error: "Sin conexión." };
    const { error: err } = await supabase.rpc("reto_responder", { p_id: id, p_aceptar: aceptar });
    if (err) return { error: mensajeReto(err) };
    await recargar();
    return { ok: true };
  }, [recargar]);

  const cerrar = useCallback(async (id) => {
    if (!supabase) return { error: "Sin conexión." };
    const { error: err } = await supabase.rpc("reto_cerrar", { p_id: id });
    if (err) return { error: mensajeReto(err) };
    await recargar();
    return { ok: true };
  }, [recargar]);

  return { ...estado, cargando, error, recargar, retar, responder, cerrar };
}

/* Texto corto de cuánto falta para que venza (para la tarjeta del reto). */
export function tiempoRestante(vence) {
  if (!vence) return "";
  const ms = new Date(vence).getTime() - Date.now();
  if (ms <= 0) return "venció";
  const horas = Math.floor(ms / 3_600_000);
  if (horas >= 1) return `${horas} h`;
  const min = Math.max(1, Math.floor(ms / 60_000));
  return `${min} min`;
}
