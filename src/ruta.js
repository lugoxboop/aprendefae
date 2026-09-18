import { useCallback, useEffect, useState } from "react";

/*
 * La vista del sitio, en la URL.
 *
 * ═══════════ EL PROBLEMA QUE RESUELVE ═══════════
 *
 * La vista vivía solo en estado de React, así que recargar devolvía al inicio
 * desde cualquier punto, y el botón «atrás» del navegador SACABA DEL SITIO —no
 * había ni una entrada de historial que retroceder—. Un estudiante a mitad del
 * camino del Iceberg que recargara sin querer aparecía en la portada.
 *
 * ═══════════ POR QUÉ HASH Y NO RUTAS DE VERDAD ═══════════
 *
 * La razón no es la elegancia, es el despliegue. El sitio sube por FTP a
 * Hostinger como archivos estáticos, y el propio main.jsx ya lleva escrito que
 * el host responde de forma incierta a rutas sin barra final. Con history
 * pushState, alguien que recargue en /modelo-iceberg se come un 404 salvo que
 * el servidor reescriba a index.html — una reescritura que no se puede probar
 * desde aquí antes de que la sufra un estudiante.
 *
 * EL HASH NO PUEDE DAR 404 NUNCA: el servidor solo ve «/». Y el botón atrás
 * funciona igual, porque cada navegación empuja su entrada de historial.
 *
 * react-router haría lo mismo por 10 kB y reescribir las diecisiete ramas de
 * App.jsx. No compra mantenibilidad aquí: compra sintaxis.
 *
 * ═══════════ EL HASH DE OAUTH, QUE NO ES UNA RUTA ═══════════
 *
 * Supabase está configurado con detectSessionInUrl y hay un camino de entrada
 * por redirección. Ese camino vuelve con el token EN EL HASH
 * —#access_token=…&refresh_token=…— que es exactamente donde vive la ruta.
 *
 * Por eso solo se interpreta como ruta lo que empieza por «#/». Cualquier otra
 * cosa se trata como la portada y NO SE TOCA, para que Supabase pueda leer su
 * token y limpiarlo él. Escribir el hash al arrancar habría roto el inicio de
 * sesión por redirección de una forma difícil de encontrar.
 */

/*
 * Las vistas que existen. Es una lista blanca a propósito: un hash escrito a
 * mano con basura —o el de una versión vieja del sitio— cae en la portada en
 * vez de pintar una pantalla vacía.
 */
export const VISTAS = new Set([
  "home",
  "macroeconomia",
  "pensamiento-estrategico",
  /* Temas */
  "camino-da",
  "grifos-da",
  "politica-economica",
  "politica-fiscal",
  "politica-monetaria",
  "pensamiento-sistemico",
  "modelo-iceberg",
  "fuerzas-porter",
  /* Transversales: no son un tema, pero se entra igual desde el índice. */
  "repaso-diario",
  /*
   * Aquí estaban las seis vistas de DA-Learn —dashboard, consumo, inversion,
   * gasto, xn y final—. El simulador se retiró entero, así que sus hashes
   * dejan de ser rutas: quien tenga uno guardado cae en la portada, que es lo
   * que hace esta lista con cualquier hash desconocido.
   */
  /* Nivel sitio */
  "perfil",
  "tienda",
  "docente",
]);

/*
 * De un tema del catálogo a la vista que lo pinta.
 *
 * Son el mismo nombre salvo Demanda Agregada, que tiene una vista por mitad:
 * "Aprender" al corazón de la economía y "Hacer" al camino de los siete juegos.
 * Esa excepción estaba escrita dentro de App.jsx y ahora la usan dos sitios
 * —App y el enlace de vuelta del panel—, así que vive aquí, que es donde están
 * los nombres de vista.
 *
 * Devuelve null si el tema no tiene vista propia: quien llame decide si eso es
 * un enlace que no se pinta o una navegación que no se hace.
 */
export function vistaDeTema(topicId, modo = null) {
  if (topicId === "demanda-agregada") return modo === "aprender" ? "grifos-da" : "camino-da";
  return VISTAS.has(topicId) ? topicId : null;
}

/* Las dos mitades de un tema. null = se entró sin elegir. */
export const MODOS = new Set(["aprender", "hacer"]);

export const RUTA_INICIAL = { vista: "home", modo: null, extra: null };

/*
 * ═══════════ EL TERCER SEGMENTO: `extra` ═══════════
 *
 * Un dato opaco que la vista de destino interpreta como quiera. Hoy lo usan
 * dos cosas, las dos con la misma forma —un id de actividad—:
 *
 *   #/docente/proyecto-arca            el panel abre con esa actividad puesta
 *   #/modelo-iceberg/hacer/proyecto-arca   el tema vuelve al camino con ese
 *                                          nodo resaltado —no abierto: ver
 *                                          useNodoEnRuta—
 *
 * NO SE VALIDA AQUÍ, y es deliberado. La lista blanca de VISTAS existe porque
 * una vista desconocida deja la pantalla en blanco; un `extra` desconocido no
 * rompe nada — quien lo lee comprueba que sea suyo y lo ignora si no. Meter
 * aquí un catálogo de ids de actividad obligaría al enrutador a conocer el
 * contenido del sitio, que es justo lo que no tiene que saber.
 *
 * DÓNDE VA EN EL HASH. El modo es opcional, así que el extra ocupa la segunda
 * posición cuando no hay modo y la tercera cuando lo hay. Se distinguen porque
 * MODOS es un conjunto cerrado de dos palabras: lo que no está en él, no es un
 * modo. Por eso ninguna actividad puede llamarse `aprender` ni `hacer`, y hay
 * una prueba que lo comprueba en vez de confiar en que nadie lo haga.
 */

/** De {vista, modo, extra} al texto del hash. La portada no lleva hash. */
export function serializar(vista, modo, extra = null) {
  if (vista === "home") return "";
  return `#/${[vista, modo, extra].filter(Boolean).join("/")}`;
}

/**
 * Del hash a {vista, modo}. Nunca lanza: lo que no reconoce es la portada.
 *
 * `crudo` se puede pasar para poder probar esto sin navegador.
 */
export function interpretar(crudo) {
  const hash = typeof crudo === "string" ? crudo : "";
  /* Ni el hash vacío ni el de OAuth son rutas. Ver la nota de arriba. */
  if (!hash.startsWith("#/")) return RUTA_INICIAL;

  const partes = hash.slice(2).split("/").filter(Boolean);
  const vista = partes[0] ?? "";
  if (!VISTAS.has(vista)) return RUTA_INICIAL;

  const modo = partes[1] && MODOS.has(partes[1]) ? partes[1] : null;
  /* El primer segmento después de la vista que NO sea un modo. */
  const extra = (modo ? partes[2] : partes[1]) ?? null;
  return { vista, modo, extra };
}

/**
 * La ruta actual y cómo cambiarla.
 *
 * `navegar(vista, modo)` empuja una entrada de historial, que es lo que hace
 * que el botón atrás retroceda un paso en vez de salir del sitio.
 *
 * `reemplazar: true` cambia la ruta SIN empujar entrada, para los casos en que
 * volver atrás debería saltarse el estado intermedio.
 */
export function useRuta() {
  const [ruta, setRuta] = useState(() => interpretar(window.location.hash));

  useEffect(() => {
    /*
     * LOS DOS EVENTOS, y no solo hashchange.
     *
     * Volver a la portada usa pushState para quitar la almohadilla de la barra,
     * y pushState NO dispara hashchange. Al retroceder sobre esa entrada el
     * navegador emite popstate, y según el caso también hashchange —cuando el
     * fragmento cambia— pero no siempre. Escuchar solo hashchange dejaba un
     * hueco donde el botón atrás movía la URL sin mover la pantalla, que es
     * peor que no tener router: la barra dice una cosa y la pantalla otra.
     *
     * Los dos apuntan a la misma función y esta lee la URL, así que dispararse
     * dos veces no hace nada: el estado queda igual.
     */
    const alCambiar = () => setRuta(interpretar(window.location.hash));
    window.addEventListener("hashchange", alCambiar);
    window.addEventListener("popstate", alCambiar);
    return () => {
      window.removeEventListener("hashchange", alCambiar);
      window.removeEventListener("popstate", alCambiar);
    };
  }, []);

  const navegar = useCallback((vista, modo = null, { reemplazar = false, extra = null } = {}) => {
    const destino = serializar(vista, modo, extra);
    const actual = window.location.hash;

    /* Ya estamos ahí: no se empuja una entrada repetida al historial. */
    if (destino === actual || (destino === "" && actual === "")) {
      setRuta(interpretar(destino));
      return;
    }

    if (reemplazar) {
      /*
       * replaceState no dispara hashchange, así que el estado se pone a mano.
       * Y se usa la URL completa porque replaceState con "" borraría la ruta
       * entera, incluido el pathname.
       */
      window.history.replaceState(null, "", destino || window.location.pathname);
      setRuta(interpretar(destino));
      return;
    }

    if (destino === "") {
      /*
       * Volver a la portada. Asignar "" al hash no limpia la almohadilla y
       * deja "…/#", que al recargar sigue siendo la portada pero se ve sucio;
       * pushState sí la quita. Empuja entrada igual, así que atrás funciona.
       */
      window.history.pushState(null, "", window.location.pathname);
      setRuta(RUTA_INICIAL);
      return;
    }

    /* Asignar el hash empuja la entrada y dispara hashchange, que sincroniza. */
    window.location.hash = destino;
    setRuta(interpretar(destino));
  }, []);

  return [ruta, navegar];
}
