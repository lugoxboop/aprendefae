import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase, supabaseConfigurado } from "../lib/supabase.js";
import { COLUMNAS_PERFIL, cambioPermitido, mensajeDeErrorPerfil } from "./perfilEditable.js";

/*
 * Estado de sesión y perfil.
 *
 * Reglas del flujo:
 * - Explorar el sitio nunca exige sesión. El proveedor no pide login al cargar.
 * - `pedirCuenta(motivo)` es lo que dispara el diálogo, y solo se llama en los
 *   momentos en que hace falta guardar algo o ver datos propios.
 * - Si hay sesión pero todavía no hay fila de perfil, es el primer ingreso y el
 *   paso de apodo queda pendiente: `necesitaApodo` lo señala.
 */

/*
 * EXPORTADO, y con una razón concreta. La sección del avatar de «Editar perfil»
 * necesita la cuenta pero tiene que poder montarse sin ella —el panel se prueba
 * suelto, sin Supabase— y una vista con cuenta se prueba con un proveedor de
 * mentira. Las dos cosas piden el contexto, no el hook que revienta sin él.
 *
 * El hook sigue siendo la forma normal de leerlo: quien necesita la cuenta de
 * verdad usa useAuth() y se enterará en el acto si está fuera del proveedor.
 */
export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};

/** Como useAuth, pero devuelve null fuera del proveedor en vez de lanzar. */
export const useAuthOpcional = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  /* Mensaje si la lectura del perfil falló; distinto de "todavía no hay perfil". */
  const [errorPerfil, setErrorPerfil] = useState(null);
  /* true hasta que sabemos si hay sesión guardada; evita parpadeos del botón. */
  const [cargando, setCargando] = useState(supabaseConfigurado);
  /* null = diálogo cerrado; string = motivo por el que se pide la cuenta. */
  const [motivoLogin, setMotivoLogin] = useState(null);

  /*
   * Lee la fila propia. RLS garantiza que solo puede devolver la del usuario.
   *
   * Distingue "no hay fila" (primer ingreso) de "no se pudo leer" (fallo de red
   * o tabla ausente). Confundirlos mandaría a un estudiante que ya tiene perfil
   * a elegir apodo otra vez, y el insert chocaría contra su propia fila.
   */
  const cargarPerfil = useCallback(async (userId) => {
    if (!supabase || !userId) return { perfil: null, error: null };
    const { data, error } = await supabase
      .from("profiles")
      .select(COLUMNAS_PERFIL)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.error("[aprendeFAE] No se pudo leer el perfil:", error.message);
      return { perfil: null, error: error.message };
    }
    return { perfil: data ?? null, error: null };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let vigente = true;

    const aplicar = async (s) => {
      setSession(s);
      if (!s) {
        setPerfil(null);
        setErrorPerfil(null);
        return;
      }
      const { perfil: p, error } = await cargarPerfil(s.user.id);
      setPerfil(p);
      setErrorPerfil(error);
    };

    /* Sesión ya guardada de una visita anterior. */
    supabase.auth.getSession().then(async ({ data }) => {
      if (!vigente) return;
      await aplicar(data.session ?? null);
      if (vigente) setCargando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evento, s) => {
      if (!vigente) return;
      await aplicar(s ?? null);
      setCargando(false);
      /* Al entrar, el diálogo ya cumplió su función. */
      if (s) setMotivoLogin(null);
    });

    return () => {
      vigente = false;
      sub.subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  /* Solo es primer ingreso si la lectura funcionó y devolvió vacío. */
  const necesitaApodo = Boolean(session) && !perfil && !errorPerfil;

  /*
   * Punto de entrada desde el resto de la app. Devuelve true si ya hay cuenta
   * utilizable; si no, abre el diálogo y devuelve false, sin bloquear nada.
   */
  const pedirCuenta = useCallback(
    (motivo) => {
      if (!supabaseConfigurado) return false;
      if (session && perfil) return true;
      setMotivoLogin(motivo || "guardar tu progreso");
      return false;
    },
    [session, perfil]
  );

  const cerrarDialogo = useCallback(() => setMotivoLogin(null), []);

  const crearPerfil = useCallback(
    async (nickname, nombreReal) => {
      if (!supabase || !session) return { error: "Sin sesión activa." };
      const limpio = nickname.trim();
      /*
       * El nombre real se guarda para que un docente autorizado reconozca a
       * quién ve en su panel. No sale en ningún ranking ni lo ve otro
       * estudiante: lo público sigue siendo solo el apodo.
       */
      const nombre = (nombreReal ?? "").trim() || null;
      const { data, error } = await supabase
        .from("profiles")
        .insert({ user_id: session.user.id, nickname: limpio, full_name: nombre })
        .select(COLUMNAS_PERFIL)
        .single();

      if (error) {
        /* 23505 = choque con el índice único del apodo. */
        if (error.code === "23505") return { error: "Ese apodo ya está tomado." };
        return { error: error.message };
      }
      setPerfil(data);
      setErrorPerfil(null);
      setMotivoLogin(null);
      return { data };
    },
    [session]
  );

  /*
   * Editar perfil. Manda solo las columnas de CAMPOS_EDITABLES, vuelve a leer
   * la fila tal como quedó y la pone en `perfil`: todo lo que pinta el apodo en
   * el cliente —la cabecera, el perfil, el resumen del semestre— lee de aquí,
   * así que el cambio se ve en el acto, sin recargar. Rankings, ligas y panel
   * docente leen `profiles` en vivo en el servidor: no guardan copia.
   */
  const guardarPerfil = useCallback(
    async (cambio) => {
      if (!supabase || !session) return { error: "Sin sesión activa." };
      const { data, error } = await supabase
        .from("profiles")
        .update(cambioPermitido(cambio))
        .eq("user_id", session.user.id)
        .select(COLUMNAS_PERFIL)
        .single();
      if (error) return { error: mensajeDeErrorPerfil(error) };
      setPerfil(data);
      return { data };
    },
    [session]
  );

  /*
   * ═══════════ LAS DOS PUERTAS PARA EL PERFIL QUE ESCRIBE EL SERVIDOR ═══════════
   *
   * El saldo de Cristales y la combinación del avatar los escriben funciones
   * security definer (0035), no un update del cliente: aquí no hay `guardar`
   * que valga. Pero la pantalla tiene que reflejarlo en el acto —el avatar sale
   * en el ranking y el saldo en la Tienda— así que:
   *
   *   aplicarPerfil   pone la fila que la función ya devolvió. Sin viaje extra.
   *   refrescarPerfil vuelve a leer, para cuando el cambio no vino con fila
   *                   (los Cristales que paga registrar_fp al terminar algo).
   */
  const aplicarPerfil = useCallback((fila) => {
    if (!fila) return;
    setPerfil((antes) => ({ ...(antes ?? {}), ...fila }));
    setErrorPerfil(null);
  }, []);

  const refrescarPerfil = useCallback(async () => {
    if (!session) return null;
    const { perfil: p } = await cargarPerfil(session.user.id);
    if (p) setPerfil(p);
    return p;
  }, [session, cargarPerfil]);

  const apodoDisponible = useCallback(async (nickname) => {
    if (!supabase) return true;
    const { data, error } = await supabase.rpc("nickname_disponible", {
      candidato: nickname.trim(),
    });
    /* Ante un fallo de red no bloqueamos: el índice único decide al insertar. */
    if (error) return true;
    return data === true;
  }, []);

  const cerrarSesion = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setPerfil(null);
  }, []);

  const value = useMemo(
    () => ({
      disponible: supabaseConfigurado,
      cargando,
      session,
      usuario: session?.user ?? null,
      perfil,
      errorPerfil,
      necesitaApodo,
      motivoLogin,
      pedirCuenta,
      cerrarDialogo,
      crearPerfil,
      guardarPerfil,
      aplicarPerfil,
      refrescarPerfil,
      apodoDisponible,
      cerrarSesion,
    }),
    [cargando, session, perfil, errorPerfil, necesitaApodo, motivoLogin, pedirCuenta, cerrarDialogo, crearPerfil, guardarPerfil, aplicarPerfil, refrescarPerfil, apodoDisponible, cerrarSesion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
