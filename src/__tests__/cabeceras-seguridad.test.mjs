import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

/*
 * Las protecciones del navegador viven en public/.htaccess (auditoría de
 * seguridad, 11-nov). La política de contenido deja correr un solo script en
 * línea: la guardia de arranque de index.html, por su huella. Si alguien
 * cambia ese script y no actualiza la huella, el sitio publicado no arranca la
 * guardia. Esta prueba lo atrapa antes.
 */
const ht = readFileSync(new URL("../../public/.htaccess", import.meta.url), "utf8");
const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("★ la huella del script en línea de index.html está en la política de contenido", () => {
  const enLinea = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.ok(enLinea.length >= 1, "no hay scripts en línea: quitar la huella de .htaccess");
  for (const [, , cuerpo] of enLinea) {
    const huella = createHash("sha256").update(cuerpo, "utf8").digest("base64");
    assert.ok(ht.includes(`'sha256-${huella}'`), `falta 'sha256-${huella}' en script-src de public/.htaccess`);
  }
});

test("★ las cabeceras de protección están puestas", () => {
  for (const c of ["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security", "Permissions-Policy", "Content-Security-Policy"]) {
    assert.match(ht, new RegExp(`Header always set ${c} "`), c);
  }
  const csp = ht.match(/Content-Security-Policy "([^"]+)"/)[1];
  assert.match(csp, /frame-ancestors 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-(inline|eval)'/, "script-src no puede abrir la puerta a scripts sueltos");
});
