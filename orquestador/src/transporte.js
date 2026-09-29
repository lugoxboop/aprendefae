/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TRANSPORTE — la única parte que habla con la API.
 *
 * Está aislada por una razón práctica: así la cadena entera se puede probar sin
 * gastar un peso ni tocar la red. Todo lo demás del orquestador —la ruta, los
 * topes, el registro, el bucle— recibe un transporte y no sabe si detrás hay un
 * modelo o una lista de respuestas escritas a mano.
 *
 * Sin eso, probar el bucle costaría dinero cada vez y solo se podría probar el
 * camino feliz. Con esto se pueden montar los casos que importan —un agente que
 * no declara ruta, dos que se mandan el material en círculo, uno que se pasa
 * del tope— y verlos fallar como deben.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cuántas veces puede llamar herramientas la compilación antes de parar. */
const TOPE_HERRAMIENTAS = 25;

/**
 * El transporte de verdad.
 *
 * Devuelve `{ texto, uso, pasosDeHerramienta }`. El bucle de herramientas vive
 * aquí y no fuera porque para quien llama es UN salto: un agente que lee seis
 * archivos antes de contestar sigue siendo un turno de la cadena.
 */
export async function transporteReal({ apiKey } = {}) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const cliente = new Anthropic(apiKey ? { apiKey } : {});

  return {
    simulado: false,
    async enviar({ modelo, esfuerzo, sistema, mensajes, herramientas = null }) {
      const uso = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
      const acumular = (u) => {
        uso.input_tokens += u?.input_tokens ?? 0;
        uso.output_tokens += u?.output_tokens ?? 0;
        uso.cache_read_input_tokens += u?.cache_read_input_tokens ?? 0;
        uso.cache_creation_input_tokens += u?.cache_creation_input_tokens ?? 0;
      };

      const historia = [...mensajes];
      const pasos = [];

      for (let vuelta = 0; vuelta <= TOPE_HERRAMIENTAS; vuelta += 1) {
        const peticion = {
          model: modelo,
          max_tokens: 32000,
          system: sistema,
          messages: historia,
          thinking: { type: "adaptive" },
          output_config: { effort: esfuerzo },
        };
        if (herramientas?.definiciones?.length) peticion.tools = herramientas.definiciones;

        /* En streaming: `max_tokens` alto sin streaming se topa con el timeout. */
        const flujo = cliente.messages.stream(peticion);
        const respuesta = await flujo.finalMessage();
        acumular(respuesta.usage);

        /*
         * Una negativa del modelo NO se trata como texto. Si se dejara pasar,
         * la cadena seguiría con una respuesta vacía y el error aparecería tres
         * saltos más tarde, sin relación aparente.
         */
        if (respuesta.stop_reason === "refusal") {
          throw new Error(`el modelo declinó la petición (${respuesta.stop_details?.category ?? "sin categoría"})`);
        }

        const llamadas = respuesta.content.filter((b) => b.type === "tool_use");
        if (llamadas.length === 0 || !herramientas) {
          const texto = respuesta.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
          return { texto, uso, pasosDeHerramienta: pasos };
        }

        historia.push({ role: "assistant", content: respuesta.content });
        const resultados = [];
        for (const ll of llamadas) {
          let salida;
          let fallo = false;
          try {
            salida = await herramientas.ejecutar(ll.name, ll.input);
          } catch (e) {
            salida = `Error: ${e.message}`;
            fallo = true;
          }
          pasos.push({ herramienta: ll.name, entrada: ll.input, salida: String(salida).slice(0, 2000) });
          resultados.push({
            type: "tool_result",
            tool_use_id: ll.id,
            content: String(salida),
            ...(fallo ? { is_error: true } : {}),
          });
        }
        /* Todos los resultados en UN mensaje: repartirlos entrena al modelo a
           dejar de pedir varias herramientas a la vez. */
        historia.push({ role: "user", content: resultados });
      }

      throw new Error(`la compilación pidió más de ${TOPE_HERRAMIENTAS} herramientas sin contestar`);
    },
  };
}

/**
 * El transporte simulado.
 *
 * `guion` es una lista de respuestas, o una función `(peticion) => texto`. No
 * inventa contenido: devuelve lo que le den. Sirve para ver la FORMA de una
 * corrida y para probar el bucle, nunca para juzgar lo que produciría un agente.
 */
export function transporteSimulado(guion) {
  let i = 0;
  return {
    simulado: true,
    async enviar(peticion) {
      const siguiente = typeof guion === "function" ? guion(peticion, i) : guion[i];
      i += 1;
      if (siguiente === undefined) {
        throw new Error("el guion simulado se quedó sin respuestas");
      }
      return {
        texto: String(siguiente),
        /* Cero tokens: una corrida simulada no puede parecer que costó algo. */
        uso: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
        pasosDeHerramienta: [],
      };
    },
  };
}
