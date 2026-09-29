/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS TOPES DE SEGURIDAD.
 *
 * Esta herramienta está pensada para dejarla corriendo de noche. Eso significa
 * que cuando algo salga mal, nadie va a estar mirando — así que los topes no
 * son una precaución, son la única cosa entre un bucle y la factura.
 *
 * Cada tope dice qué mide, cuál es su número y POR QUÉ ese número. Un límite
 * sin razón escrita se sube en cuanto estorba.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Precios por millón de tokens, para estimar el costo de la corrida.
 * Fuente: tabla de modelos de la API, junio 2026. Si cambian, cambia aquí. */
export const PRECIOS = {
  "claude-opus-5": { entrada: 5, salida: 25, cacheLectura: 0.5, cacheEscritura: 6.25 },
  "claude-sonnet-5": { entrada: 2, salida: 10, cacheLectura: 0.2, cacheEscritura: 2.5 },
  "claude-haiku-4-5": { entrada: 1, salida: 5, cacheLectura: 0.1, cacheEscritura: 1.25 },
};

export const TOPES = {
  /*
   * ═══════════ TRES VUELTAS GEN↔LEVI, Y NO ES UN NÚMERO AL AZAR ═══════════
   *
   * En el trabajo real observado, Gen y Levi convergen en una o dos vueltas:
   * los encargos llegan diciendo «correcciones ya aplicadas». La única vez que
   * hubo un choque de verdad —una propuesta de Xeno que Levi anuló— no lo
   * resolvió otra vuelta: lo resolvió un humano.
   *
   * Así que una tercera vuelta ya no es el proceso funcionando: es la señal de
   * que los dos discrepan en algo que necesita a Mateo. Seguir girando gasta
   * dinero para llegar al mismo sitio, más tarde.
   */
  vueltasGenLevi: 3,

  /*
   * El tope duro de saltos, contando todos los agentes. Una corrida sana va
   * entre seis y quince. Cuarenta es holgado para un tema entero y corta
   * cualquier bucle que se escape del contador de arriba.
   */
  saltos: 40,

  /*
   * Minutos de reloj. Importa más que el de dinero: una corrida atascada
   * esperando a la red no gasta, pero se come la noche.
   */
  minutos: 45,

  /*
   * Dólares. Con el contexto en caché, un salto ronda los 11 centavos y una
   * corrida típica de doce saltos, entre uno y tres dólares. Cinco deja margen
   * para un tema largo y corta mucho antes de que importe.
   *
   * ESTE TOPE NO SUSTITUYE al límite de gasto de la consola de Anthropic. Este
   * depende de que el código funcione; aquel no.
   */
  dolares: 5,
};

/** Una corrida en marcha: cuenta lo que lleva y dice cuándo hay que parar. */
export class Contador {
  constructor(topes = TOPES) {
    this.topes = topes;
    this.inicio = Date.now();
    this.saltos = 0;
    this.vueltas = new Map();
    this.costo = 0;
    this.tokens = { entrada: 0, salida: 0, cacheLectura: 0, cacheEscritura: 0 };
  }

  get minutos() {
    return (Date.now() - this.inicio) / 60000;
  }

  /*
   * Una «vuelta» Gen↔Levi es volver a Gen después de haber pasado por Levi. Se
   * cuenta por pieza, no por corrida: un tema con siete actividades puede dar
   * siete vueltas legítimas, una por pieza, sin que ninguna esté atascada.
   */
  anotarVuelta(pieza) {
    const clave = pieza ?? "(sin pieza)";
    const n = (this.vueltas.get(clave) ?? 0) + 1;
    this.vueltas.set(clave, n);
    return n;
  }

  vueltasDe(pieza) {
    return this.vueltas.get(pieza ?? "(sin pieza)") ?? 0;
  }

  anotarUso(modelo, uso) {
    const p = PRECIOS[modelo];
    if (!p) throw new Error(`no hay precio para «${modelo}»: no se puede contar el costo`);
    const entrada = uso?.input_tokens ?? 0;
    const salida = uso?.output_tokens ?? 0;
    const lectura = uso?.cache_read_input_tokens ?? 0;
    const escritura = uso?.cache_creation_input_tokens ?? 0;

    this.tokens.entrada += entrada;
    this.tokens.salida += salida;
    this.tokens.cacheLectura += lectura;
    this.tokens.cacheEscritura += escritura;

    this.costo += (entrada * p.entrada + salida * p.salida
      + lectura * p.cacheLectura + escritura * p.cacheEscritura) / 1e6;
    this.saltos += 1;
  }

  /**
   * ¿Hay que parar? Devuelve el motivo, o null.
   *
   * Se pregunta ANTES de cada salto, no después: parar después de gastar es
   * enterarse, no protegerse.
   */
  motivoParaParar(pieza = null) {
    if (this.saltos >= this.topes.saltos) {
      return `se alcanzó el tope de ${this.topes.saltos} saltos`;
    }
    if (this.minutos >= this.topes.minutos) {
      return `se alcanzó el tope de ${this.topes.minutos} minutos`;
    }
    if (this.costo >= this.topes.dolares) {
      return `se alcanzó el tope de ${this.topes.dolares} dólares (van ${this.costo.toFixed(2)})`;
    }
    if (pieza && this.vueltasDe(pieza) >= this.topes.vueltasGenLevi) {
      return `«${pieza}» dio ${this.topes.vueltasGenLevi} vueltas Gen↔Levi sin cerrar: queda bloqueada para revisión`;
    }
    return null;
  }

  resumen() {
    return {
      saltos: this.saltos,
      minutos: Number(this.minutos.toFixed(1)),
      dolares: Number(this.costo.toFixed(4)),
      tokens: { ...this.tokens },
      vueltas: Object.fromEntries(this.vueltas),
    };
  }
}
