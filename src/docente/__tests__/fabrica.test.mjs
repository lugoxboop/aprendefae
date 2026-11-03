import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_ARCHIVOS, MOTIVOS, tipoDe, revisar, formatearPeso, aBase64, empaquetar, encargar,
} from "../fabrica.js";

const archivo = (nombre, type, size) => ({ name: nombre, type, size });

test("un .md sin tipo del navegador se reconoce por la extensión", () => {
  assert.equal(tipoDe(archivo("apuntes.md", "")), "text/markdown");
  assert.equal(tipoDe(archivo("cap2.PDF", "")), "application/pdf");
  assert.equal(tipoDe(archivo("hoja.xlsx", "")), null);
});

test("se revisa antes de leer un solo byte", () => {
  assert.equal(revisar([archivo("a.pdf", "application/pdf", 10)]), null);
  assert.equal(revisar([archivo("a.exe", "application/x-msdownload", 10)]), MOTIVOS.tipo);
  assert.equal(revisar([archivo("a.pdf", "application/pdf", 9 * 1024 * 1024)]), MOTIVOS.peso);
  assert.equal(revisar(Array(MAX_ARCHIVOS + 1).fill(archivo("a.pdf", "application/pdf", 10))), MOTIVOS.cuantos);
});

test("el peso se dice en la unidad que se entiende", () => {
  assert.equal(formatearPeso(900), "900 B");
  assert.equal(formatearPeso(2048), "2 KB");
  assert.equal(formatearPeso(3 * 1024 * 1024), "3.0 MB");
});

/* Un FileReader de mentira: devuelve una URL de datos como la de verdad. */
class LectorFalso {
  readAsDataURL() { this.result = "data:application/pdf;base64,SE9MQQ=="; this.onload(); }
}

test("al empaquetar se quita la cabecera de la URL de datos", async () => {
  const b64 = await aBase64({}, LectorFalso);
  assert.equal(b64, "SE9MQQ==", "si viajara el 'data:...' delante, el modelo recibiría basura");
});

test("cada archivo viaja con su nombre y su tipo resuelto", async () => {
  const lote = await empaquetar([archivo("cap2.md", "", 10)], async () => "QUJD");
  assert.deepEqual(lote, [{ nombre: "cap2.md", tipo: "text/markdown", datos: "QUJD" }]);
});

test("un encargo vacío ni sale del navegador", async () => {
  let llamo = false;
  const cliente = { functions: { invoke: async () => { llamo = true; return { data: null, error: null }; } } };
  const r = await encargar(cliente, { materia: "contabilidad", mensaje: "  ", archivos: [] });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, MOTIVOS.vacio);
  assert.equal(llamo, false);
});

test("un archivo que no pasa la revisión tampoco sale", async () => {
  let llamo = false;
  const cliente = { functions: { invoke: async () => { llamo = true; return { data: {}, error: null }; } } };
  const r = await encargar(cliente, { materia: "x", mensaje: "", archivos: [archivo("a.exe", "application/x-msdownload", 5)] });
  assert.equal(r.ok, false);
  assert.equal(llamo, false);
});

test("el camino bueno manda materia y mensaje, y el archivo solo en el plan", async () => {
  /* Desde el 3-nov el encargo son varias llamadas: una de plan y una por
     actividad. El detalle de la coreografía se prueba en fabrica-fases; aquí
     solo que lo que escribió el profesor llega bien a la primera. */
  const cuerpos = [];
  const plan = { lectura: { tema: "t" }, actividades: [{ titulo: "Una", terminos: ["a", "b"] }] };
  const cliente = {
    functions: {
      invoke: async (_n, o) => {
        cuerpos.push(o.body);
        return { data: cuerpos.length === 1 ? { plan } : { pieza: { titulo: "Una" } }, error: null };
      },
    },
  };
  const r = await encargar(cliente, { materia: "contabilidad", mensaje: " capítulo 3 ", archivos: [] });
  assert.equal(r.ok, true);
  assert.equal(r.creadas, 1);
  assert.equal(cuerpos[0].pasada, "plan");
  assert.equal(cuerpos[0].materia, "contabilidad");
  assert.equal(cuerpos[0].mensaje, "capítulo 3", "se manda recortado");
  assert.equal(cuerpos[1].pasada, "pieza");
});

test("el motivo que escribió el servidor le llega al profesor, no uno genérico", async () => {
  const cliente = {
    functions: {
      invoke: async () => ({
        data: null,
        error: { message: "Edge Function returned a non-2xx status code", context: { json: async () => ({ error: "Llegaste al límite de encargos de hoy." }) } },
      }),
    },
  };
  const r = await encargar(cliente, { materia: "x", mensaje: "y" });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "Llegaste al límite de encargos de hoy.");
});

test("si ni eso se puede leer, queda un motivo entendible y no revienta", async () => {
  const cliente = { functions: { invoke: async () => ({ data: null, error: { message: "boom" } }) } };
  const r = await encargar(cliente, { materia: "x", mensaje: "y" });
  assert.equal(r.ok, false);
  assert.match(r.motivo, /Inténtalo otra vez/);
});

test("sin cliente no se rompe el panel", async () => {
  const r = await encargar(null, { materia: "x", mensaje: "y" });
  assert.equal(r.ok, false);
});
