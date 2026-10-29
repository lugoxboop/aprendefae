import { NIVEL } from "./alertas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FRASE DE HOY — lo primero que lee el profesor
 *
 * POR QUÉ UNA FRASE Y NO UN NÚMERO GRANDE
 * Google Classroom resolvió esto sin un solo gráfico y es lo más barato que
 * encontramos en los veinte competidores: en vez de «retención 73 %», escribe
 * «estos estudiantes entregaron tarde más de la mitad de sus tareas este mes».
 * Una afirmación con sujeto detrás, sobre la que ya se puede actuar. Un
 * porcentaje solo no dice a quién llamar.
 *
 * LA REGLA QUE GOBIERNA ESTE ARCHIVO
 * Si una línea no termina en algo que el profesor pueda hacer, no es la frase
 * y no sale. Y si falta el dato, la línea tampoco sale: aquí no se rellena con
 * «todavía no hay información suficiente», que es la forma elegante de hacerle
 * perder el tiempo a quien está de pie entre dos clases.
 *
 * TODA CIFRA LLEVA SU n
 * «48 %» sobre cuatro personas no es un porcentaje. Cada número que sale de
 * aquí viaja con cuántos lo componen, y el texto los escribe.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Plural sin el «(s)»: el profesor lee esto, no un formulario. */
const es = (n, uno, varios) => (n === 1 ? uno : varios);

/**
 * Las líneas de la frase, en orden de importancia, cada una con su acción.
 *
 * Cada línea es { id, texto, accion } y `accion` es { texto, destino } o null.
 * El destino es una palabra que el panel traduce a una vista; este módulo no
 * sabe nada de pantallas y por eso se puede probar sin navegador.
 */
export function fraseDeHoy({ cohorte = [], activos = 0, peor = null, riesgo = [], sinGrupo = false }) {
  const lineas = [];
  const n = cohorte.length;
  if (n === 0) return lineas;

  /*
   * `activos` puede venir del servidor, que cuenta sobre TODOS los de la
   * materia, mientras la cohorte puede ser solo el grupo curado del profesor.
   * Sin este tope salía «14 de 5 estudiantes trabajaron», que no es un número
   * raro: es una frase que no significa nada y que quema la confianza en el
   * bloque entero, que es justo lo primero que se lee.
   */
  const trabajaron = Math.min(Math.max(0, Number(activos) || 0), n);

  /*
   * 1 · Quién está y quién no. La cifra que ya estaba en la primera tarjeta,
   * dicha como frase y con la mitad que falta nombrada, que es la parte
   * accionable: los activos no necesitan nada del profesor.
   */
  const quietos = n - trabajaron;
  lineas.push({
    id: "actividad",
    texto: quietos === 0
      ? `${trabajaron === n ? "Los" : ""} ${trabajaron} de ${n} ${es(n, "estudiante", "estudiantes")} ${es(trabajaron, "trabajó", "trabajaron")} este ciclo.`.trim()
      : `${trabajaron} de ${n} ${es(n, "estudiante", "estudiantes")} ${es(trabajaron, "trabajó", "trabajaron")} este ciclo; ${quietos} no ${es(quietos, "ha entrado", "han entrado")}.`,
    accion: quietos > 0 ? { texto: `Ver ${es(quietos, "al que falta", "a los que faltan")}`, destino: "riesgo" } : null,
  });

  /*
   * 2 · Qué está frenando a la clase. Esta es la línea por la que el panel
   * existe: nombra el contenido, no a la persona, porque es la única que el
   * profesor puede arreglar para todos a la vez, el lunes, en el tablero.
   */
  if (peor && peor.cifras && peor.cifras.pct !== null) {
    const pct = Math.round(peor.cifras.pct);
    const term = peor.cifras.completaron;
    lineas.push({
      id: "frena",
      texto: `Lo que más está frenando a la clase es «${peor.nombre}»: ${pct}% de acierto medio entre ${term} que la ${es(term, "terminó", "terminaron")}.`,
      accion: { texto: "Abrir la actividad", destino: `actividad:${peor.id}` },
    });
  }

  /*
   * 3 · A quién mirar hoy, con el diagnóstico por nombre y no un recuento
   * plano. «3 en riesgo» no dice qué hacer con los tres; «1 dejó de entrar y
   * 2 van rápido fallando» son dos conversaciones distintas.
   */
  const urgentes = riesgo.filter((r) => r.principal.nivel === NIVEL.URGENTE);
  const atencion = riesgo.filter((r) => r.principal.nivel === NIVEL.ATENCION);
  const aMirar = urgentes.length + atencion.length;
  if (aMirar > 0) {
    const partes = [];
    /* Se nombran los dos diagnósticos más repetidos, no todos: una frase con
     * cinco cláusulas deja de ser una frase. */
    const cuenta = new Map();
    for (const r of [...urgentes, ...atencion]) {
      cuenta.set(r.principal.nombre, (cuenta.get(r.principal.nombre) ?? 0) + 1);
    }
    for (const [nombre, k] of [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2)) {
      partes.push(`${k} ${nombre.toLowerCase()}`);
    }
    lineas.push({
      id: "mirar",
      texto: `${aMirar} ${es(aMirar, "necesita", "necesitan")} que ${es(aMirar, "lo mires", "los mires")} hoy: ${partes.join(" y ")}.`,
      accion: { texto: "Ver la lista", destino: "riesgo" },
    });
  }

  /* 4 · El aviso de alcance, que no es una línea de la frase pero va con ella. */
  if (sinGrupo) {
    lineas.push({
      id: "sin-grupo",
      texto: "Todavía no has armado tu grupo, así que esto habla de todos los que entraron a la materia.",
      accion: { texto: "Armar mi grupo", destino: "estudiantes" },
    });
  }

  return lineas;
}

/**
 * El texto plano de la frase, para copiarlo y para el lector de pantalla.
 * Es la misma información que los botones: nunca una versión recortada.
 */
export function fraseEnTexto(lineas) {
  return lineas.map((l) => l.texto).join(" ");
}
