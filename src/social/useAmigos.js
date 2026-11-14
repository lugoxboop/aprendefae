import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS AMIGOS DEL ESTUDIANTE, para la interfaz.
 *
 * Toda la lógica vive en la base (migración 0164): este hook solo llama a sus
 * cuatro funciones y guarda el resultado. `amigos_estado()` trae de un viaje
 * las tres listas —amigos aceptados, solicitudes recibidas, solicitudes
 * enviadas—, cada tarjeta ya con el apodo y la mascota del otro, que es lo
 * justo para pintarla sin un segundo viaje.
 *
 * Cada acción (pedir, responder, quitar) recarga el estado al terminar, para
 * que la pantalla siempre muestre lo que de verdad hay en la base y no una
 * copia que se quede vieja.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const VACIO = { amigos: [], recibidas: [], enviadas: [] };

/*
 * Traduce el error que devuelve la base a algo que un estudiante entienda. Se
 * exporta aparte para poder probarla sin tocar la red. Mira primero el texto
 * del mensaje (que la 0164 escribe a propósito) y, de apoyo, el código.
 */
export function mensajeAmistad(error) {
  const msg = error?.message || "";
  const code = error?.code || "";
  if (/No hay nadie con el apodo/i.test(msg) || code === "no_data_found") {
    return "No encontramos a nadie con ese apodo. Revísalo con tu amigo.";
  }
  if (/agregarte a ti mismo/i.test(msg)) return "Ese es tu propio apodo.";
  if (/Ya son amigos/i.test(msg)) return "Ya son amigos.";
  if (/Ya le enviaste/i.test(msg)) return "Ya le enviaste una solicitud; falta que la acepte.";
  if (code === "23505") return "Ya hay una solicitud entre ustedes.";
  if (/sesión/i.test(msg) || code === "42501") return "Inicia sesión para agregar amigos.";
  return "No se pudo completar. Intenta de nuevo en un momento.";
}

export function useAmigos(activo = true) {
  const [estado, setEstado] = useState(VACIO);
  const [cargando, setCargando] = useState(Boolean(activo));
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    if (!supabase) {
      setCargando(false);
      return;
    }
    const { data, error: err } = await supabase.rpc("amigos_estado");
    if (err) {
      setError("No pudimos cargar tus amigos.");
      setCargando(false);
      return;
    }
    setError(null);
    setEstado({
      amigos: data?.amigos ?? [],
      recibidas: data?.recibidas ?? [],
      enviadas: data?.enviadas ?? [],
    });
    setCargando(false);
  }, []);

  useEffect(() => {
    if (activo) recargar();
  }, [activo, recargar]);

  const solicitar = useCallback(
    async (apodo) => {
      if (!supabase) return { error: "Sin conexión." };
      const limpio = (apodo ?? "").trim();
      if (!limpio) return { error: "Escribe el apodo de tu amigo." };
      const { error: err } = await supabase.rpc("amistad_solicitar", { p_apodo: limpio });
      if (err) return { error: mensajeAmistad(err) };
      await recargar();
      return { ok: true };
    },
    [recargar],
  );

  const responder = useCallback(
    async (id, aceptar) => {
      if (!supabase) return { error: "Sin conexión." };
      const { error: err } = await supabase.rpc("amistad_responder", { p_id: id, p_aceptar: aceptar });
      if (err) return { error: mensajeAmistad(err) };
      await recargar();
      return { ok: true };
    },
    [recargar],
  );

  const eliminar = useCallback(
    async (id) => {
      if (!supabase) return { error: "Sin conexión." };
      const { error: err } = await supabase.rpc("amistad_eliminar", { p_id: id });
      if (err) return { error: mensajeAmistad(err) };
      await recargar();
      return { ok: true };
    },
    [recargar],
  );

  /* Sugerencias mientras se escribe. Solo lee; no cambia el estado del panel. */
  const buscar = useCallback(async (texto) => {
    if (!supabase) return [];
    const { data, error: err } = await supabase.rpc("amigos_buscar", { p_texto: texto });
    if (err) return [];
    return Array.isArray(data) ? data : [];
  }, []);

  return { ...estado, cargando, error, recargar, solicitar, responder, eliminar, buscar };
}
