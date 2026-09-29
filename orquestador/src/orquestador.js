import { ROLES, instruccionDeRuta } from "./roles.js";
import { leerRuta, cuerpoSinRuta, PUEDE_ENTREGAR } from "./ruta.js";
import { sistemaPara } from "./conocimiento.js";
import { Contador, TOPES } from "./topes.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BUCLE.
 *
 * Llama al rol que toca, lee a dónde dijo que sigue, y va. Nada más. Todo lo
 * que parece una decisión de este archivo es en realidad una de estas tres:
 *
 *   · Un tope dijo que había que parar.
 *   · El agente dijo a dónde seguía.
 *   · La declaración no se pudo leer, y entonces se para.
 *
 * ═══════════ POR QUÉ SE PARA EN VEZ DE ARREGLAR ═══════════
 *
 * Cada vez que aquí hubiera un «si pasa X, hago Y», el bucle estaría tomando
 * una decisión que el encargo puso en manos de los agentes. Y peor: la tomaría
 * en silencio. Una cadena que se corrige sola por dentro es una cadena que
 * nadie puede auditar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MOTIVOS = {
  compilado: "compilado",
  detenidoPorAgente: "detenido-por-agente",
  detenidoPorTope: "detenido-por-tope",
  detenidoPorFormato: "detenido-por-formato",
  detenidoPorError: "detenido-por-error",
};

/* El material que se le pasa al siguiente: lo que dijo el anterior, con su firma. */
function turnoDeUsuario({ orden, historia, rolDestino }) {
  const partes = [];

  partes.push("# La orden");
  partes.push(orden);

  if (historia.length > 0) {
    partes.push("");
    partes.push("# Lo que ya hizo la cadena");
    partes.push("");
    for (const h of historia) {
      partes.push(`## ${ROLES[h.rol].nombre} dijo:`);
      partes.push("");
      partes.push(h.cuerpo);
      partes.push("");
      partes.push(`— y lo mandó a ${h.destino}: ${h.porque}`);
      partes.push("");
    }
  }

  partes.push(instruccionDeRuta(rolDestino));
  return partes.join("\n");
}

/**
 * Corre la cadena.
 *
 *   orden         lo que pidió Mateo, en sus palabras
 *   arranque      con qué rol empieza
 *   pieza         a qué pieza pertenece, para contar las vueltas Gen↔Levi
 *   conocimiento  la base ya cargada
 *   transporte    real o simulado
 *   registro      dónde se anota cada salto
 */
export async function correrCadena({
  orden,
  arranque,
  pieza = null,
  conocimiento,
  transporte,
  registro,
  herramientas = null,
  topes = TOPES,
  /*
   * El contador se puede pasar desde fuera para que lo YA GASTADO cuente. El
   * intérprete corre antes que la cadena y también llama al modelo: con un
   * contador nuevo aquí, ese gasto no aparece en el total y el tope de dólares
   * arranca creyendo que se lleva cero. Poco dinero, pero un total que no es
   * el total es exactamente cómo se llega a una sorpresa en la factura.
   */
  contador = new Contador(topes),
}) {
  if (!ROLES[arranque]) throw new Error(`«${arranque}» no es un rol`);

  const historia = [];
  let rol = arranque;
  let anterior = null;

  for (;;) {
    /*
     * Se pregunta ANTES de gastar, no después. Parar después de la llamada es
     * enterarse de que se pasó del tope, no respetarlo.
     */
    const motivo = contador.motivoParaParar(pieza);
    if (motivo) {
      registro.parada(MOTIVOS.detenidoPorTope, motivo);
      return { motivo: MOTIVOS.detenidoPorTope, detalle: motivo, historia, contador };
    }

    /* Volver a Gen después de haber pasado por Levi es una vuelta. */
    if (rol === "gen" && anterior === "levi") contador.anotarVuelta(pieza);

    const definicion = ROLES[rol];
    const entrada = turnoDeUsuario({ orden, historia, rolDestino: rol });

    let respuesta;
    try {
      respuesta = await transporte.enviar({
        modelo: definicion.modelo,
        esfuerzo: definicion.esfuerzo,
        sistema: sistemaPara(conocimiento, rol),
        mensajes: [{ role: "user", content: entrada }],
        herramientas: definicion.herramientas.length ? herramientas : null,
      });
    } catch (e) {
      registro.parada(MOTIVOS.detenidoPorError, `${definicion.nombre}: ${e.message}`);
      return { motivo: MOTIVOS.detenidoPorError, detalle: e.message, historia, contador };
    }

    contador.anotarUso(definicion.modelo, respuesta.uso);
    const ruta = leerRuta(respuesta.texto);
    registro.salto({
      rol,
      modelo: definicion.modelo,
      entrada,
      salida: respuesta.texto,
      ruta,
      uso: respuesta.uso,
      simulado: transporte.simulado,
    });

    /*
     * Una declaración ilegible para la cadena. No se busca el nombre de un rol
     * en el texto ni se cae a un destino por defecto: el encargo dice que la
     * ruta la decide el agente, y un agente que no la declaró no la decidió.
     */
    if (ruta.error) {
      registro.parada(MOTIVOS.detenidoPorFormato, `${definicion.nombre}: ${ruta.error}`);
      return { motivo: MOTIVOS.detenidoPorFormato, detalle: ruta.error, historia, contador };
    }

    const cuerpo = cuerpoSinRuta(respuesta.texto);
    historia.push({ rol, cuerpo, destino: ruta.destino, porque: ruta.porque });

    if (ruta.destino === "detener") {
      registro.parada(MOTIVOS.detenidoPorAgente, `${definicion.nombre}: ${ruta.porque}`);
      return { motivo: MOTIVOS.detenidoPorAgente, detalle: ruta.porque, historia, contador };
    }

    if (ruta.destino === "entregar") {
      /*
       * Solo la compilación produce el encargo. Que otro rol declare `entregar`
       * no se obedece —no tiene nada que entregar— pero tampoco se ignora en
       * silencio: se para y se dice, porque significa que ese agente entendió
       * mal para qué está.
       */
      if (rol !== PUEDE_ENTREGAR) {
        const detalle = `${definicion.nombre} declaró «entregar», y solo la compilación produce el encargo`;
        registro.parada(MOTIVOS.detenidoPorFormato, detalle);
        return { motivo: MOTIVOS.detenidoPorFormato, detalle, historia, contador };
      }
      registro.parada(MOTIVOS.compilado, "la compilación entregó el encargo");
      return { motivo: MOTIVOS.compilado, encargo: cuerpo, historia, contador };
    }

    /* Mandarse el material a uno mismo es un bucle de uno. */
    if (ruta.destino === rol) {
      const detalle = `${definicion.nombre} se mandó el material a sí mismo`;
      registro.parada(MOTIVOS.detenidoPorFormato, detalle);
      return { motivo: MOTIVOS.detenidoPorFormato, detalle, historia, contador };
    }

    anterior = rol;
    rol = ruta.destino;
  }
}

/**
 * El encargo final de una corrida, si lo hubo.
 *
 * Se busca el último cuerpo de la compilación y no «el último cuerpo»: si la
 * compilación devolvió el material a Gen y la cadena siguió, lo último que se
 * dijo no es un encargo.
 */
export function encargoDe(resultado) {
  if (resultado.motivo !== MOTIVOS.compilado) return null;
  const compilaciones = resultado.historia.filter((h) => h.rol === "compilacion");
  return compilaciones.length ? compilaciones[compilaciones.length - 1].cuerpo : null;
}
