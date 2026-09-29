import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { leerRuta, cuerpoSinRuta, DESTINOS } from "./ruta.js";
import { Contador, TOPES, PRECIOS } from "./topes.js";
import { correrCadena, encargoDe, MOTIVOS } from "./orquestador.js";
import { transporteSimulado } from "./transporte.js";
import { Registro } from "./registro.js";
import {
  cargarConocimiento, sistemaPara, procedenciaDe, TTL_CACHE,
} from "./conocimiento.js";
import { ROLES, instruccionDeRuta } from "./roles.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LO QUE SE ROMPE SIN HACER RUIDO EN UN ORQUESTADOR.
 *
 * 1 · QUE EL CÓDIGO DECIDA LA RUTA. El encargo dice que la decide el agente. Un
 *     «si no entiendo, mando a Gen» escrito por comodidad convierte la regla en
 *     mentira, y nada falla: la cadena sigue corriendo hacia donde nadie pidió.
 *
 * 2 · QUE LOS TOPES CUENTEN DESPUÉS DE GASTAR. Preguntar después de la llamada
 *     es enterarse, no protegerse. Y de noche no hay nadie para enterarse.
 *
 * 3 · QUE LA CACHÉ NO SE LEA NUNCA. Si el bloque compartido deja de ser
 *     idéntico entre roles, todo sigue funcionando y cada llamada paga el Kit
 *     entero a precio completo. No hay síntoma salvo la factura.
 *
 * 4 · QUE EL INTÉRPRETE ADIVINE. Una orden mal entendida no falla: arranca.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const carpetaTemporal = () => fs.mkdtempSync(path.join(os.tmpdir(), "orq-"));
const registroNuevo = () => new Registro(carpetaTemporal(), "prueba");

const conRuta = (cuerpo, destino, porque = "porque sí") =>
  `${cuerpo}\n\nSIGUIENTE: ${destino}\nPORQUE: ${porque}`;

/* ═══════════════════ LA RUTA LA DECIDE EL AGENTE ═══════════════════ */

test("★★★ una respuesta sin declaración de ruta detiene la cadena, no cae a ningún lado", async () => {
  const registro = registroNuevo();
  const conocimiento = cargarConocimiento();
  const resultado = await correrCadena({
    orden: "lo que sea",
    arranque: "gen",
    conocimiento,
    registro,
    transporte: transporteSimulado(["Aquí tienes la pieza. Creo que le toca a Levi."]),
  });

  assert.equal(resultado.motivo, MOTIVOS.detenidoPorFormato);
  /*
   * La palabra «Levi» estaba en el texto. Si el orquestador la hubiera buscado
   * —que es la tentación— habría seguido a Levi sin que nadie lo decidiera.
   */
  assert.match(resultado.detalle, /no declara SIGUIENTE/);
});

test("★★★ nombrar un rol mientras se razona no cuenta: vale la última declaración", () => {
  const respuesta = [
    "Esto podría ir a Xeno, pero mirándolo mejor no.",
    "SIGUIENTE: xeno",
    "PORQUE: primera idea",
    "",
    "Rectifico.",
    "SIGUIENTE: levi",
    "PORQUE: es una revisión, no un tema de diseño",
  ].join("\n");

  const r = leerRuta(respuesta);
  assert.equal(r.destino, "levi");
  assert.equal(r.porque, "es una revisión, no un tema de diseño");
});

test("★★ un destino que no existe se rechaza, no se aproxima al más parecido", () => {
  for (const inventado of ["stanley", "senku", "sai", "mateo"]) {
    const r = leerRuta(`x\n\nSIGUIENTE: ${inventado}\nPORQUE: y`);
    assert.ok(r.error, `«${inventado}» pasó como destino válido`);
    assert.match(r.error, /no es un destino válido/);
  }
});

test("★★ declarar un destino sin decir por qué no vale", () => {
  const r = leerRuta("x\n\nSIGUIENTE: levi");
  assert.ok(r.error);
  assert.match(r.error, /no dice por qué/);
});

test("★★ la declaración se quita del cuerpo: no se arrastra al salto siguiente", () => {
  const cuerpo = cuerpoSinRuta(conRuta("El contenido de verdad.", "levi", "toca revisar"));
  assert.equal(cuerpo, "El contenido de verdad.");
  assert.ok(!cuerpo.includes("SIGUIENTE"));
});

test("★★★ la cadena va exactamente a donde dijeron los agentes, en orden", async () => {
  const registro = registroNuevo();
  const resultado = await correrCadena({
    orden: "o",
    arranque: "gen",
    conocimiento: cargarConocimiento(),
    registro,
    transporte: transporteSimulado([
      conRuta("pieza", "levi", "a revisar"),
      conRuta("PASA CON CORRECCIONES", "gen", "corrige el ítem 4"),
      conRuta("corregida", "levi", "otra vez"),
      conRuta("PASA", "xeno", "falta la decisión de layout"),
      conRuta("layout cerrado", "compilacion", "ya está todo"),
      conRuta("# ENCARGO MAESTRO\n\nConstruye X.", "detener", "el encargo está listo"),
    ]),
  });

  assert.equal(resultado.motivo, MOTIVOS.detenidoPorAgente);
  assert.deepEqual(
    resultado.historia.map((h) => h.rol),
    ["gen", "levi", "gen", "levi", "xeno", "compilacion"],
  );
});

test("★★★ la compilación cierra la corrida con «entregar», y el encargo sale limpio", async () => {
  const resultado = await correrCadena({
    orden: "o",
    arranque: "gen",
    conocimiento: cargarConocimiento(),
    registro: registroNuevo(),
    transporte: transporteSimulado([
      conRuta("pieza", "compilacion", "ya está"),
      conRuta("# ENCARGO MAESTRO\n\nTodo verificado.", "entregar", "listo"),
    ]),
  });

  assert.equal(resultado.motivo, MOTIVOS.compilado);
  const encargo = encargoDe(resultado);
  assert.ok(encargo.includes("ENCARGO MAESTRO"));
  assert.ok(!encargo.includes("SIGUIENTE"), "el encargo se llevó la declaración de ruta dentro");
});

/*
 * ═══════════ «ENTREGAR» Y «DETENER» NO SON LO MISMO ═══════════
 *
 * Salió en la primera corrida simulada, no en una prueba: sin `entregar`, la
 * compilación terminaba su trabajo y lo único que podía declarar era `detener`.
 * La corrida perfecta se reportaba como bloqueada y el encargo se tiraba.
 */
test("★★★ la compilación bloqueada NO entrega encargo; la que termina, sí", async () => {
  const bloqueada = await correrCadena({
    orden: "o",
    arranque: "compilacion",
    conocimiento: cargarConocimiento(),
    registro: registroNuevo(),
    transporte: transporteSimulado([
      conRuta("Hay un conflicto entre dos documentos.", "detener", "decide Mateo"),
    ]),
  });
  assert.equal(bloqueada.motivo, MOTIVOS.detenidoPorAgente);
  assert.equal(encargoDe(bloqueada), null, "una compilación bloqueada entregó encargo igual");

  const entregada = await correrCadena({
    orden: "o",
    arranque: "compilacion",
    conocimiento: cargarConocimiento(),
    registro: registroNuevo(),
    transporte: transporteSimulado([conRuta("# ENCARGO", "entregar", "listo")]),
  });
  assert.equal(entregada.motivo, MOTIVOS.compilado);
  assert.ok(encargoDe(entregada));
});

test("★★★ solo la compilación puede entregar: si otro lo declara, se para y se dice", async () => {
  for (const rol of ["gen", "levi", "xeno"]) {
    const resultado = await correrCadena({
      orden: "o",
      arranque: rol,
      conocimiento: cargarConocimiento(),
      registro: registroNuevo(),
      transporte: transporteSimulado([conRuta("aquí tienes el encargo", "entregar", "ya está")]),
    });
    assert.equal(resultado.motivo, MOTIVOS.detenidoPorFormato, `${rol} entregó un encargo`);
    assert.match(resultado.detalle, /solo la compilación/);
  }
});

test("★★ mandarse el material a uno mismo se para: es un bucle de uno", async () => {
  for (const rol of ["gen", "levi", "xeno", "compilacion"]) {
    const resultado = await correrCadena({
      orden: "o",
      arranque: rol,
      conocimiento: cargarConocimiento(),
      registro: registroNuevo(),
      transporte: transporteSimulado((p, i) => conRuta(`vuelta ${i}`, rol, "otra vez yo")),
    });
    assert.equal(resultado.motivo, MOTIVOS.detenidoPorFormato, `${rol} giró sobre sí mismo`);
    assert.match(resultado.detalle, /a sí mismo/);
  }
});

test("★★ a la compilación se le ofrece «entregar»; a los demás, no", () => {
  assert.ok(instruccionDeRuta("compilacion").includes("`entregar`"),
    "la compilación no sabe que puede entregar");
  for (const rol of ["gen", "levi", "xeno"]) {
    assert.ok(!instruccionDeRuta(rol).includes("`entregar`"),
      `a «${rol}» se le ofrece entregar un encargo que no produce`);
  }
});

test("★★ el encargo es el de la compilación, no «lo último que se dijo»", async () => {
  const registro = registroNuevo();
  const resultado = await correrCadena({
    orden: "o",
    arranque: "gen",
    conocimiento: cargarConocimiento(),
    registro,
    transporte: transporteSimulado([
      conRuta("pieza", "compilacion", "ya"),
      conRuta("falta una cifra", "gen", "devuelvo"),
      conRuta("cifra puesta", "detener", "necesito a Mateo"),
    ]),
  });

  /*
   * La compilación devolvió el material y la cadena siguió: lo último que se
   * dijo no es un encargo. Pedirlo tiene que dar null, no la última respuesta.
   */
  assert.equal(resultado.motivo, MOTIVOS.detenidoPorAgente);
  assert.equal(encargoDe(resultado), null);

  /*
   * Y aunque la corrida SÍ haya terminado en compilado, el encargo se busca en
   * los turnos de la compilación, no en el último de la lista. Se monta a mano
   * porque el bucle de hoy siempre deja la compilación al final — pero
   * `encargoDe` está exportada y no puede fiarse de eso. Sobrevivió un mutante
   * que devolvía el último turno viniera de donde viniera.
   */
  const aMano = {
    motivo: MOTIVOS.compilado,
    historia: [
      { rol: "compilacion", cuerpo: "# ENCARGO MAESTRO\n\nEl bueno." },
      { rol: "gen", cuerpo: "una nota suelta que no es un encargo" },
    ],
  };
  assert.match(encargoDe(aMano), /ENCARGO MAESTRO/);
});

/* ═══════════════════ LOS TOPES ═══════════════════ */

test("★★★ el tope de vueltas Gen↔Levi corta antes del salto, no después", async () => {
  const registro = registroNuevo();
  /* Un guion que gira para siempre: Gen manda a Levi, Levi devuelve a Gen. */
  const resultado = await correrCadena({
    orden: "o",
    arranque: "gen",
    pieza: "la pieza atascada",
    conocimiento: cargarConocimiento(),
    registro,
    transporte: transporteSimulado((peticion, i) =>
      (i % 2 === 0 ? conRuta("otra versión", "levi", "a revisar") : conRuta("NO PASA", "gen", "sigue mal"))),
  });

  assert.equal(resultado.motivo, MOTIVOS.detenidoPorTope);
  assert.match(resultado.detalle, /vueltas Gen↔Levi/);
  assert.ok(resultado.detalle.includes("la pieza atascada"), "no dice qué pieza quedó bloqueada");
  /*
   * Tres vueltas, no cuatro ni infinitas. Cada vuelta son dos saltos, más el
   * primero de Gen: el corte tiene que llegar bastante antes del tope global.
   */
  assert.ok(resultado.contador.saltos < TOPES.saltos, "llegó al tope global antes que al de vueltas");
  assert.equal(resultado.contador.vueltasDe("la pieza atascada"), TOPES.vueltasGenLevi);
});

test("★★★ las vueltas se cuentan por pieza, no por corrida", () => {
  const c = new Contador();
  c.anotarVuelta("pieza 1");
  c.anotarVuelta("pieza 1");
  c.anotarVuelta("pieza 2");
  assert.equal(c.vueltasDe("pieza 1"), 2);
  assert.equal(c.vueltasDe("pieza 2"), 1);
  /*
   * Un tema de siete actividades puede dar siete vueltas legítimas, una por
   * pieza. Contarlas juntas bloquearía un tema sano en la tercera actividad.
   */
  assert.equal(c.motivoParaParar("pieza 2"), null);
});

test("★★★ el costo se cuenta con el precio del modelo que corrió, no con uno fijo", () => {
  const c = new Contador();
  c.anotarUso("claude-opus-5", { input_tokens: 1e6, output_tokens: 0 });
  assert.equal(Number(c.costo.toFixed(4)), PRECIOS["claude-opus-5"].entrada);

  const b = new Contador();
  b.anotarUso("claude-sonnet-5", { input_tokens: 1e6, output_tokens: 0 });
  assert.equal(Number(b.costo.toFixed(4)), PRECIOS["claude-sonnet-5"].entrada);
  assert.ok(b.costo < c.costo, "el modelo barato no sale más barato");
});

test("★★ leer de caché cuesta una fracción de leer sin caché", () => {
  const sin = new Contador();
  sin.anotarUso("claude-opus-5", { input_tokens: 1e6 });
  const con = new Contador();
  con.anotarUso("claude-opus-5", { cache_read_input_tokens: 1e6 });
  assert.ok(con.costo * 5 <= sin.costo, "la caché no está saliendo más barata que el precio completo");
});

test("★★ un modelo sin precio se cae en vez de contar cero", () => {
  const c = new Contador();
  assert.throws(() => c.anotarUso("modelo-inventado", { input_tokens: 10 }), /no hay precio/);
});

test("★★ el tope de dólares detiene la corrida", async () => {
  const registro = registroNuevo();
  const resultado = await correrCadena({
    orden: "o",
    arranque: "gen",
    conocimiento: cargarConocimiento(),
    registro,
    topes: { ...TOPES, dolares: 0.000001 },
    /* El transporte simulado no gasta, así que aquí se le pone uso a mano. */
    transporte: {
      simulado: false,
      async enviar() {
        return {
          texto: conRuta("x", "levi", "y"),
          uso: { input_tokens: 100000, output_tokens: 100000 },
          pasosDeHerramienta: [],
        };
      },
    },
  });
  assert.equal(resultado.motivo, MOTIVOS.detenidoPorTope);
  assert.match(resultado.detalle, /dólares/);
});

/* ═══════════════════ LA CACHÉ ═══════════════════ */

test("★★★ el bloque compartido es idéntico byte a byte entre todos los roles", () => {
  const conocimiento = cargarConocimiento({ materia: "contabilidad" });
  const primeros = Object.keys(ROLES).map((r) => sistemaPara(conocimiento, r)[0]);

  const textos = new Set(primeros.map((b) => b.text));
  assert.equal(textos.size, 1,
    `hay ${textos.size} versiones del bloque compartido: cada rol paga el Kit entero a precio completo`);
  /*
   * Y lleva su marca de caché con la TTL larga. Con los cinco minutos por
   * defecto, entre un salto y el siguiente —que es una llamada entera a un
   * modelo que razona— la caché expira y se paga la escritura sin leerla nunca.
   */
  for (const b of primeros) {
    assert.deepEqual(b.cache_control, { type: "ephemeral", ttl: TTL_CACHE });
  }
});

test("★★★ el bloque compartido va PRIMERO: al revés, cada rol invalidaría el Kit", () => {
  const conocimiento = cargarConocimiento({ materia: "contabilidad" });
  const sistema = sistemaPara(conocimiento, "gen");
  assert.equal(sistema.length, 2, "la caché se repartió en más bloques de los que hacen falta");
  assert.ok(sistema[0].text.includes("Kit de Estándar de Calidad"), "el Kit no abre el prefijo");
  assert.ok(sistema[1].text.includes("Gen"), "el rol no va en el segundo bloque");
  /* Y el bloque del rol NO puede llevar el Kit dentro: lo duplicaría. */
  assert.ok(!sistema[1].text.includes("Dimensión 1 — Fidelidad"), "el Kit está duplicado en el bloque del rol");
});

test("★★ el bloque compartido no lleva nada que cambie entre corridas", () => {
  const a = sistemaPara(cargarConocimiento({ materia: "contabilidad" }), "gen")[0].text;
  const b = sistemaPara(cargarConocimiento({ materia: "macroeconomia" }), "levi")[0].text;
  assert.equal(a, b, "el bloque compartido cambia con la materia: deja de compartirse");
  const anio = String(new Date().getFullYear());
  assert.ok(!a.includes(anio) || !a.includes(new Date().toISOString().slice(0, 10)),
    "hay una fecha de hoy en el prefijo cacheado");
});

/* ═══════════════════ LA BASE DE CONOCIMIENTO ═══════════════════ */

test("★★★ cada documento declara su procedencia, y los huecos del Kit se dicen", () => {
  const conocimiento = cargarConocimiento({ materia: "contabilidad" });
  assert.equal(procedenciaDe(conocimiento.kit), "mixta");
  for (const [id, texto] of Object.entries(conocimiento.roles)) {
    assert.ok(procedenciaDe(texto), `el rol «${id}» no declara de dónde salió`);
  }
  /*
   * D9 y D10 no tienen criterio. Si el Kit no lo dijera, Levi las evaluaría
   * inventándose un estándar que el equipo nunca acordó — y sonaría bien.
   */
  for (const dimension of ["Dimensión 9", "Dimensión 10"]) {
    /*
     * La sección se corta en el siguiente encabezado, no a tantos caracteres.
     * Con una ventana fija, el texto de D9 se comía el de D10 y borrarle a D9
     * su aviso no rompía nada: la prueba lo encontraba en la sección de al
     * lado. Sobrevivió un mutante por eso.
     */
    const desde = conocimiento.kit.indexOf(dimension);
    const siguiente = conocimiento.kit.indexOf("\n### ", desde);
    const trozo = conocimiento.kit.slice(desde, siguiente === -1 ? undefined : siguiente);
    assert.ok(trozo.length > 50 && trozo.length < 1200, `la sección de ${dimension} no se acotó bien`);
    /*
     * Las DOS cosas, y no una: la etiqueta HUECO dice que falta el criterio, y
     * la instrucción dice qué hacer con eso. Con solo la etiqueta, un agente
     * puede leer «falta la tabla» y rellenarla de su cosecha — sonaría bien y
     * sería un estándar que el equipo nunca acordó. Sobrevivió un mutante que
     * borraba justo la instrucción y dejaba la etiqueta.
     */
    assert.match(trozo, /HUECO/, `${dimension} no está marcada como hueco`);
    assert.match(trozo, /no es evaluable/i,
      `${dimension} no dice qué hacer: falta la instrucción de reportarla como no evaluable`);
  }
});

test("★★★ si falta un archivo de la base, se cae: no corre con medio Kit", () => {
  /*
   * Un orquestador que arranca sin el Kit produce material que nadie juzgó
   * contra nada, y lo produce con la misma cara de seguridad. Tiene que caerse.
   */
  const vacia = carpetaTemporal();
  fs.mkdirSync(path.join(vacia, "roles"));
  assert.throws(() => cargarConocimiento({ raiz: vacia }), /falta un archivo de la base/);

  /* Y con la base de verdad, carga entera. */
  const conocimiento = cargarConocimiento();
  assert.ok(conocimiento.kit.length > 1000, "el Kit vino vacío");
  for (const rol of Object.keys(ROLES)) {
    assert.ok(conocimiento.roles[rol], `falta el prompt del rol «${rol}»`);
  }
});

test("★★ pedir un rol que no tiene prompt se cae en vez de mandar un system a medias", () => {
  const conocimiento = cargarConocimiento();
  assert.throws(() => sistemaPara(conocimiento, "stanley"), /no hay prompt para el rol/);
});

test("★★ una materia sin vocabulario lo dice en vez de callarlo", () => {
  const c = cargarConocimiento({ materia: "materia-que-no-existe" });
  assert.equal(c.vocabulario.texto, null);
  const bloque = sistemaPara(c, "gen")[1].text;
  assert.match(bloque, /No hay vocabulario registrado/);
});

/* ═══════════════════ LA INSTRUCCIÓN DE RUTA ═══════════════════ */

test("★★ la instrucción de ruta va en el turno del usuario, no en el system", () => {
  const conocimiento = cargarConocimiento({ materia: "contabilidad" });
  for (const rol of Object.keys(ROLES)) {
    for (const bloque of sistemaPara(conocimiento, rol)) {
      assert.ok(!bloque.text.includes("SIGUIENTE:"),
        `la instrucción de ruta está en el system de «${rol}»: cambiarla invalidaría la caché del Kit`);
    }
    const instruccion = instruccionDeRuta(rol);
    assert.ok(instruccion.includes("SIGUIENTE:"));
    /* Y no se ofrece a sí mismo como destino. */
    assert.ok(!instruccion.includes(`${rol} (${ROLES[rol].nombre})`),
      `a «${rol}» se le ofrece mandarse el material a sí mismo`);
  }
});

test("★★ todos los destinos que la instrucción ofrece son destinos que la ruta acepta", () => {
  const instruccion = instruccionDeRuta("gen");
  for (const d of DESTINOS) {
    if (d === "gen") continue;
    assert.ok(instruccion.includes(d), `la instrucción no ofrece «${d}»`);
  }
});

/* ═══════════════════ EL REGISTRO ═══════════════════ */

test("★★★ el registro guarda la ENTRADA de cada salto, no solo la salida", async () => {
  const carpeta = carpetaTemporal();
  const registro = new Registro(carpeta, "la orden");
  await correrCadena({
    orden: "la orden",
    arranque: "gen",
    conocimiento: cargarConocimiento(),
    registro,
    transporte: transporteSimulado([conRuta("x", "detener", "ya")]),
  });

  const lineas = fs.readFileSync(path.join(carpeta, "registro.jsonl"), "utf8")
    .trim().split("\n").map((l) => JSON.parse(l));
  const salto = lineas.find((l) => l.tipo === "salto");
  assert.ok(salto, "no se registró ningún salto");
  /*
   * Sin la entrada, un encargo torcido es inauditable: casi nunca se explica
   * por lo que el agente respondió, sino por lo que se le mandó.
   */
  assert.ok(salto.entrada.includes("la orden"), "el registro no guarda qué se le mandó al agente");
  assert.ok(salto.entrada.includes("SIGUIENTE:"), "no consta que se le pidiera declarar la ruta");
  assert.equal(salto.rol, "gen");
  assert.ok(salto.cuando, "el salto no lleva hora");
});

test("★★ el registro se escribe salto a salto, no al final", async () => {
  const carpeta = carpetaTemporal();
  const registro = new Registro(carpeta, "o");
  const archivo = path.join(carpeta, "registro.jsonl");
  const antes = fs.readFileSync(archivo, "utf8").trim().split("\n").length;

  registro.salto({ rol: "gen", modelo: "claude-opus-5", entrada: "e", salida: "s", ruta: {}, uso: {} });
  const despues = fs.readFileSync(archivo, "utf8").trim().split("\n").length;
  assert.equal(despues, antes + 1, "el salto no llegó al disco hasta el final de la corrida");
});
