import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import { leerHechas, leerHechoHoy, leerHistorial } from "./datos.js";
import { estadoRepaso, faltanActividades, vistaPreviaDelDia } from "./seleccion.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LO QUE EL REPASO NECESITA SABER, LEÍDO UNA VEZ.
 *
 * Lo comparten el banner del índice —que ahora enseña el estado y la mezcla
 * del día sin salir de la página— y la partida. Antes vivía dentro de la vista
 * intermedia; al desaparecer esa pantalla, el dato tenía que mudarse a algún
 * sitio que los dos pudieran mirar.
 *
 * LAS TRES LECTURAS NO ESCRIBEN NADA. `actividades_hechas`, `repaso_historial`
 * y `repaso_hecho_hoy` son de solo lectura (0033), y la selección que se
 * calcula encima es una función pura. Abrir el banner no consume el repaso del
 * día ni lo marca como hecho: lo único que lo marca es terminar la partida, y
 * eso pasa por registrar_fp.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const VACIO = { hechas: new Set(), historial: new Map(), hechoHoy: false };

export function useRepaso() {
  const { session, cargando: cargandoSesion } = useAuth();
  const [datos, setDatos] = useState(null);
  const idUsuario = session?.user?.id ?? null;

  useEffect(() => {
    if (cargandoSesion) return;
    let vivo = true;
    /* Sin sesión no hay historial que leer: el estado sale del conjunto vacío. */
    if (!idUsuario) {
      setDatos(VACIO);
      return;
    }
    setDatos(null);
    Promise.all([leerHechas(), leerHistorial(), leerHechoHoy()]).then(([hechas, historial, hechoHoy]) => {
      if (!vivo) return;
      if (hechas === null || historial === null || hechoHoy === null) setDatos("error");
      else setDatos({ hechas, historial, hechoHoy });
    });
    return () => { vivo = false; };
  }, [cargandoSesion, idUsuario]);

  const listo = datos && datos !== "error";
  const estado = listo ? estadoRepaso(datos) : null;

  /*
   * La mezcla del día solo se calcula cuando hay algo que mezclar. Con el
   * repaso bloqueado o ya hecho no hay nada que anunciar, y recorrer el pool
   * entero para tirarlo sería trabajo por gusto en cada entrada al índice.
   */
  const previa = listo && estado === "listo"
    ? vistaPreviaDelDia({ hechas: datos.hechas, historial: datos.historial, usuarioId: idUsuario })
    : null;

  return {
    cargando: !datos,
    error: datos === "error",
    datos: listo ? datos : null,
    estado,
    previa,
    faltan: listo ? faltanActividades(datos.hechas) : 0,
    /* Para que la partida pueda marcar el día sin volver a leer de la red. */
    marcarHechoHoy: () => setDatos((d) => (d && d !== "error" ? { ...d, hechoHoy: true } : d)),
  };
}
