import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { mensajeAmistad } from "./useAmigos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FILA DE AMIGOS DE LA PORTADA, para la interfaz.
 *
 * Un solo viaje a `amigos_inicio()` (0170): los amigos —los de verdad y, en la
 * cuenta de demostración, los de muestra—, cuántos son, y las sugerencias si
 * todavía no tiene ninguno. Pedir amistad desde una sugerencia reutiliza
 * `amistad_solicitar` de la 0164, que ya acepta de una vez si el otro te había
 * pedido a ti.
 *
 * `modoDe` decide qué pinta la fila. Se exporta aparte para probarla sin red.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const VACIO = { amigos: [], total: 0, sugerencias: [] };

/* "amigos" en cuanto hay uno; "sugerencias" si no hay amigos pero sí a quién sugerir; si no, "vacio". */
export function modoDe({ amigos = [], sugerencias = [] } = {}) {
  if (amigos.length > 0) return "amigos";
  if (sugerencias.length > 0) return "sugerencias";
  return "vacio";
}

export function useAmigosInicio(activo = true) {
  const [estado, setEstado] = useState(VACIO);
  const [cargando, setCargando] = useState(Boolean(activo && supabase));

  const recargar = useCallback(async () => {
    if (!supabase) {
      setCargando(false);
      return;
    }
    const { data, error } = await supabase.rpc("amigos_inicio");
    if (!error && data) {
      setEstado({
        amigos: Array.isArray(data.amigos) ? data.amigos : [],
        total: Number(data.total) || 0,
        sugerencias: Array.isArray(data.sugerencias) ? data.sugerencias : [],
      });
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    if (activo) recargar();
    else {
      setEstado(VACIO);
      setCargando(false);
    }
  }, [activo, recargar]);

  /*
   * Pedir amistad. La sugerencia se marca «enviada» en el acto (la pantalla
   * responde al toque) y después se recarga lo que dice la base: si el otro ya
   * te había pedido, la amistad queda aceptada y la fila pasa a mostrar amigos.
   */
  const solicitar = useCallback(
    async (apodo) => {
      if (!supabase) return { error: "Sin conexión." };
      setEstado((e) => ({
        ...e,
        sugerencias: e.sugerencias.map((s) => (s.apodo === apodo ? { ...s, enviada: true } : s)),
      }));
      const { error } = await supabase.rpc("amistad_solicitar", { p_apodo: apodo });
      if (error) {
        await recargar();
        return { error: mensajeAmistad(error) };
      }
      await recargar();
      return { ok: true };
    },
    [recargar],
  );

  return { ...estado, cargando, recargar, solicitar, modo: modoDe(estado) };
}
