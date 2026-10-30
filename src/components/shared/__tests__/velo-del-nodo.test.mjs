import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL VELO DEL EMERGENTE DEL NODO NO PUEDE VIVIR DENTRO DEL CAMINO
 *
 * El fallo, tal como lo vio Mateo el 30 de octubre: al pulsar un nodo, el
 * fondo quedaba oscurecido solo en la columna central y a los lados se veían
 * dos franjas claras. Parecía un problema de adaptación a móvil y no lo era.
 *
 * LA CAUSA, MEDIDA. El camino se revela con una máscara (CSS_ENTRADA). Una
 * máscara no recorta solo al elemento que la lleva: recorta el PINTADO de
 * todo lo que cuelga de él, incluidos sus descendientes `position: fixed`. El
 * velo MEDÍA la ventana entera —1320 × 620 en una ventana de 1320 × 620— y
 * aun así se pintaba solo dentro de la columna del camino, porque la caja de
 * la máscara es esa columna.
 *
 * Por eso esta prueba no mira la geometría: mirarla habría dado «correcto»
 * mientras el fallo estaba en pantalla. Mira que el velo salga del subárbol
 * enmascarado, que es lo único que lo arregla de verdad.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const FUENTE = readFileSync(new URL("../CaminoHacer.jsx", import.meta.url), "utf8");

test("el emergente del nodo se cuelga del body, fuera de la máscara del camino", () => {
  assert.match(FUENTE, /import \{ createPortal \} from "react-dom";/);
  /* El velo tiene que ser lo primero del portal, no un div cualquiera dentro. */
  assert.match(FUENTE, /createPortal\(\(\s*\n\s*<div className="fae-dn-fondo"/);
  assert.match(FUENTE, /\), document\.body\);/);
});

test("el camino sigue revelándose con máscara: por eso hace falta el portal", () => {
  /* Si un día se quita la máscara, esta prueba falla y hay que releer la
     cabecera de arriba antes de deshacer el portal: lo mismo le pasaría a
     cualquier filtro o clip-path que se le ponga al contenedor. */
  assert.match(FUENTE, /mask-image: linear-gradient/);
});

test("el velo sigue siendo fijo y a pantalla completa", () => {
  assert.match(FUENTE, /\.fae-dn-fondo \{ position: fixed; inset: 0;/);
});
