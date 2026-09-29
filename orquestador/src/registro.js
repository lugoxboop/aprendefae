import fs from "node:fs";
import path from "node:path";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REGISTRO — un renglón por salto, con todo lo que hizo falta para darlo.
 *
 * Sirve para una sola cosa: cuando una corrida salga mal, poder señalar el
 * salto exacto donde salió mal. Eso exige guardar la ENTRADA, no solo la
 * salida: un encargo torcido casi nunca se explica por lo que el agente
 * respondió, sino por lo que se le mandó.
 *
 * Se escribe salto a salto, no al final. Si la corrida se cae a la mitad —o se
 * queda sin batería el portátil a las tres de la mañana— lo que iba hecho
 * queda en disco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class Registro {
  constructor(carpeta, orden) {
    this.carpeta = carpeta;
    fs.mkdirSync(carpeta, { recursive: true });
    this.archivo = path.join(carpeta, "registro.jsonl");
    this.saltos = [];
    this.anotar({ tipo: "orden", orden });
  }

  anotar(entrada) {
    const con = { ...entrada, cuando: new Date().toISOString() };
    this.saltos.push(con);
    fs.appendFileSync(this.archivo, `${JSON.stringify(con)}\n`, "utf8");
    return con;
  }

  salto({ rol, modelo, entrada, salida, ruta, uso, simulado }) {
    return this.anotar({
      tipo: "salto",
      rol,
      modelo,
      simulado: Boolean(simulado),
      /*
       * La entrada va entera. Ocupa, pero recortarla es justo perder la mitad
       * que explica los errores. El registro de una corrida cabe de sobra en
       * disco; una corrida inauditable no cabe en ninguna parte.
       */
      entrada,
      salida,
      ruta,
      uso,
    });
  }

  parada(motivo, detalle = null) {
    return this.anotar({ tipo: "parada", motivo, detalle });
  }

  pregunta(texto) {
    return this.anotar({ tipo: "pregunta", texto });
  }

  /* Lo legible de una sentada: qué pasó, en orden, sin los cuerpos enteros. */
  resumenLegible() {
    const lineas = [];
    for (const s of this.saltos) {
      if (s.tipo === "orden") {
        lineas.push(`ORDEN  ${s.orden}`);
      } else if (s.tipo === "salto") {
        const destino = s.ruta?.destino ?? "—";
        const porque = s.ruta?.porque ?? s.ruta?.error ?? "";
        lineas.push(`${s.rol.padEnd(12)} → ${destino.padEnd(12)} ${porque}`);
      } else if (s.tipo === "parada") {
        lineas.push(`PARADA  ${s.motivo}${s.detalle ? ` — ${s.detalle}` : ""}`);
      } else if (s.tipo === "pregunta") {
        lineas.push(`PREGUNTA  ${s.texto}`);
      }
    }
    return lineas.join("\n");
  }
}

/** Una carpeta por corrida, con la hora en el nombre para que se ordenen solas. */
export function carpetaDeCorrida(raiz) {
  const sello = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return path.join(raiz, "corridas", sello);
}
