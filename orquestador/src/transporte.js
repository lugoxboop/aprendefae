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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CONVERSACIÓN DEL BUCLE DE HERRAMIENTAS TAMBIÉN SE CACHEA.
 *
 * Esto costó siete dólares descubrirlo, así que queda escrito.
 *
 * Cada vuelta del bucle reenvía la conversación ENTERA: los archivos leídos,
 * las salidas de los cálculos, todo. Con veinticinco vueltas posibles y
 * archivos de decenas de miles de tokens, eso crece rápido. La primera corrida
 * real gastó 1,2 MILLONES de tokens de entrada sin caché en dos llamadas — seis
 * de los siete dólares.
 *
 * El `system` sí estaba cacheado, pero el `system` es la parte que NO crece. Lo
 * que crece es lo que no se estaba cacheando.
 *
 * La caché es un prefijo, así que basta con marcar el final de lo que ya se
 * mandó: la vuelta siguiente lee de caché todo lo anterior y solo paga lo
 * nuevo. Se marca el último bloque del último mensaje, y se quitan las marcas
 * viejas — el límite son cuatro por petición y el `system` ya usa dos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function marcarParaCache(mensajes) {
  if (mensajes.length === 0) return mensajes;

  const copia = mensajes.map((m) => ({
    ...m,
    content: typeof m.content === "string"
      ? m.content
      : m.content.map((b) => {
        const { cache_control: _quitado, ...resto } = b;
        return resto;
      }),
  }));

  const ultimo = copia[copia.length - 1];
  /*
   * Un contenido de texto suelto se convierte en bloque para poder marcarlo.
   * No cambia lo que recibe el modelo: un string y un bloque de texto con el
   * mismo texto son la misma cosa para la API.
   */
  if (typeof ultimo.content === "string") {
    ultimo.content = [{ type: "text", text: ultimo.content }];
  }
  const bloques = ultimo.content;
  if (bloques.length === 0) return copia;
  bloques[bloques.length - 1] = {
    ...bloques[bloques.length - 1],
    cache_control: { type: "ephemeral", ttl: "1h" },
  };
  return copia;
}

/**
 * El transporte de verdad.
 *
 * Devuelve `{ texto, uso, pasosDeHerramienta }`. El bucle de herramientas vive
 * aquí y no fuera porque para quien llama es UN salto: un agente que lee seis
 * archivos antes de contestar sigue siendo un turno de la cadena.
 */
export async function transporteReal({ apiKey } = {}) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const { cabecerasDelCliente, IDENTIFICADOR_FALTANTE, comoArreglarElEspacio } = await import("./clave.js");
  /*
   * La cabecera del espacio de trabajo solo va si la clave la necesita —una
   * clave de organización sin ella recibe un 400—. Con una clave ya acotada,
   * `cabecerasDelCliente` devuelve undefined y el cliente queda igual que antes.
   */
  const cliente = new Anthropic({
    ...(apiKey ? { apiKey } : {}),
    ...(cabecerasDelCliente() ? { defaultHeaders: cabecerasDelCliente() } : {}),
  });

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
          messages: marcarParaCache(historia),
          thinking: { type: "adaptive" },
          output_config: { effort: esfuerzo },
        };
        if (herramientas?.definiciones?.length) peticion.tools = herramientas.definiciones;

        /* En streaming: `max_tokens` alto sin streaming se topa con el timeout. */
        let respuesta;
        try {
          respuesta = await cliente.messages.stream(peticion).finalMessage();
        } catch (e) {
          /*
           * Un 400 de «clave no acotada a un espacio de trabajo» es lo único
           * que se traduce aquí, porque el mensaje de la API es correcto y
           * completamente opaco para quien no vive en la consola de Anthropic:
           * la clave FUNCIONA y le falta un dato, que no es lo que parece.
           */
          if (IDENTIFICADOR_FALTANTE.test(String(e.message))) {
            throw new Error(`${comoArreglarElEspacio()}\n\n(la API dijo: ${e.message})`);
          }
          throw e;
        }
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
