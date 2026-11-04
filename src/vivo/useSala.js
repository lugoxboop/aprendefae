import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { canalDeSala, desfaseDe, leerEstado, RESPALDO_MS } from "./datos.js";

/*
 * El estado de una sala, al día: lo pide al entrar, lo vuelve a pedir cada vez
 * que alguien avisa por el canal, y de respaldo cada pocos segundos. Lo usan
 * las dos pantallas, la del tablero y la del celular.
 */
export function useSala(salaId, { cliente = supabase, inicial = null } = {}) {
  const [estado, setEstadoCrudo] = useState(inicial);
  const [error, setError] = useState(null);
  const desfase = useRef(desfaseDe(inicial));
  const canal = useRef(null);
  const vivo = useRef(true);

  const aplicar = useCallback((e) => {
    if (!e) return;
    desfase.current = desfaseDe(e);
    setEstadoCrudo(e);
    setError(null);
  }, []);

  const refrescar = useCallback(async () => {
    if (!salaId) return null;
    const { data, error: e } = await leerEstado(salaId, cliente);
    if (!vivo.current) return null;
    if (e) { setError(e); return null; }
    aplicar(data);
    return data;
  }, [salaId, cliente, aplicar]);

  useEffect(() => {
    vivo.current = true;
    if (!salaId) return undefined;
    canal.current = canalDeSala(salaId, refrescar, cliente);
    if (!inicial) refrescar();
    return () => { vivo.current = false; canal.current?.cerrar(); canal.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaId, cliente]);

  const fase = estado?.estado;
  useEffect(() => {
    if (!salaId || !fase || fase === "cerrada") return undefined;
    const t = setInterval(refrescar, fase === "pregunta" ? RESPALDO_MS.pregunta : RESPALDO_MS.otro);
    return () => clearInterval(t);
  }, [salaId, fase, refrescar]);

  const avisar = useCallback(() => canal.current?.avisar(), []);

  return { estado, aplicar, error, refrescar, avisar, desfase };
}

/** Un reloj que repinta cada `cada` ms mientras `activo`. Devuelve la hora. */
export function useReloj(activo, cada = 200) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!activo) return undefined;
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), cada);
    return () => clearInterval(t);
  }, [activo, cada]);
  return ahora;
}
