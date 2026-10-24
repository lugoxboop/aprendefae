# T1 · Bancos de H1 y H2 + textos de los 7 Hacer sin emoji (Futaba, 23-oct)

Todo texto de 10 palabras o más está medido con `npm run inflesz` y da ≥ 65. Todos tienen 25 palabras o menos, sin emoji y sin abrir con el veredicto. El 1.er error da la pista y el 2.º la devolución de la opción marcada. No hay cifras en ninguno de los dos bancos.

## 1 · H1 `t1-un-dia-o-un-ano` · «¿Un día, un año o dos fotos?»

**Fuente:** el concepto está en P = src/data/contabilidadPiezas234.js:196-202 (definiciones con cita), :218-239 (fotos y tramo) y :285-290 (errores). La página es HUECO hasta el #467. Quien pregunta es uno de los 8 usuarios de src/data/contabilidadIntro.js:153-194.

**Consigna:** Lee la pregunta de cada persona. Toca el informe que la responde. (78,8)
**Opciones (fijas, siempre en este orden, como P:258-262):** `foto` La foto · `pelicula` La película · `comparar` Hay que comparar las dos fotos.

| Id | Quién pregunta | Pregunta | Correcta | `foto` | Acierto |
|---|---|---|---|---|---|
| h1-01 | acreedores | Le vendí a crédito. ¿Cuánto me seguía debiendo la empresa el 31 de diciembre? | foto | diciembre | Es lo que debía un día exacto, el 31 de diciembre. Eso lo muestra la foto de ese día. |
| h1-02 | propietarios | ¿Cuánto ganó o perdió la empresa durante el año? | pelicula | — | Ganar o perder se mide en todo un periodo. La película muestra la utilidad o la pérdida del año. |
| h1-03 | empleados | ¿Cuánto gastó la empresa durante todo el año? | pelicula | — | Lo que gastó se fue sumando mes a mes. Eso lo cuenta la película, no una foto de un día. |
| h1-04 | estado | ¿Cuántos ingresos tuvo la empresa en el año? | pelicula | — | Los ingresos llegan a lo largo del periodo. Por eso los cuenta la película, no una foto. |
| h1-05 | administradores | ¿Con qué plata y qué cosas arrancó la empresa el 1 de enero? | foto | enero | Es cómo estaba un día exacto, al comenzar el año. Eso lo muestra la foto del 1 de enero. |
| h1-06 | inversionistas | ¿Cuánto bajaron las deudas de la empresa entre enero y diciembre? | comparar | — | Te preguntan cuánto cambió de una fecha a otra. Para eso pones la foto de enero al lado de la de diciembre. |
| h1-07 | acreedores | ¿Cuánto le debía la empresa al banco al comenzar el año? | foto | enero | Es lo que debía un día exacto, el 1 de enero. Eso lo muestra la foto del comienzo. |
| h1-08 | asociaciones | ¿Cuánto vendió esta empresa en el año? La quiero sumar a las de su sector. | pelicula | — | Lo que vendió se fue juntando durante todo el año. Eso lo cuenta la película. |
| h1-09 | clientes | ¿La empresa tiene hoy más cosas o menos que al comenzar el año? | comparar | — | Es un cambio entre dos fechas. Lo ves al comparar la foto del 1 de enero con la del 31 de diciembre. |
| h1-10 | clientes | ¿Cuánta mercancía tenía la empresa el 31 de diciembre? | foto | diciembre | Es lo que tenía un día exacto. Eso lo muestra la foto del 31 de diciembre. |

A propósito, ninguna pregunta habla de cómo cambió la plata ni de cómo cambió lo de los dueños. Esas dos las responden otros informes (P:210 y el de flujos, P:365), y abrirían una cuarta respuesta.

**Pista (1.er error), según la correcta:**
- foto: Busca en la pregunta una fecha. ¿Habla de un solo día?
- pelicula: ¿La pregunta habla de un día o de algo que pasó a lo largo del año?
- comparar: ¿Te preguntan cómo estaba algo, o cuánto cambió de una fecha a otra?

**Devolución (2.º error), según la correcta y la marcada.** Son las de P:285-290, tal cual, más una nueva (D2):

| Correcta → marcada | Clave | Devolución |
|---|---|---|
| foto → película | A | Esa pregunta es de un día exacto. La película cubre todo el año, así que no te dice cómo estaba la empresa ese día. (P:286) |
| película → foto | B | Esa pregunta es de todo el año. Una foto es de un día: no te cuenta qué pasó en los meses. (P:287) |
| foto → comparar | C1 | Con una foto basta. Comparar las dos sirve para saber cuánto cambió, y aquí no te preguntan por el cambio. (P:288) |
| película → comparar | C2 | Con la película basta. Te preguntan por lo que pasó en el año, no por cuánto cambió entre dos fechas. (P:289) |
| comparar → foto | D | Te preguntan por el cambio entre dos fechas. Una sola foto te dice cómo estaba un día. Para el cambio necesitas las dos. (P:290) |
| comparar → película | **D2, nueva** | Te preguntan cuánto cambió algo que tiene o debe. La película no lo muestra: compara la foto del comienzo con la del final. (87,0) |

D2 hace falta porque D habla de «una sola foto», y quien marcó la película no eligió ninguna foto. En cu0-a3 pasa lo mismo si la regla de evaluarP3 le muestra D a quien marca película. Shoko o Kaede deberían comprobarlo.

**Subtema para el Repaso ([regla], por la correcta):**
```js
"t1-un-dia-o-un-ano": { foto: "Estado de situación financiera — un día", pelicula: "Estado de resultados — un periodo", comparar: "El cambio entre dos fechas" },
```

## 2 · H2 `t1-quien-pregunta-esto` · «¿Quién pregunta esto?»

**Fuente:** el enunciado de cada ítem es el `proposito` textual del libro, pp. 11-12 (contabilidadIntro.js:156-192). Es una cita y no cuenta para el límite de palabras.

**Consigna:** Lee para qué usa alguien el informe. Elige quién es. (73,7)

**Opciones con nombre corto:** Propietarios · Administradores · Empleados · Acreedores · Clientes · Inversionistas · Asociaciones · El Estado. En cada ítem van 4: la correcta, la que más se le parece y dos más.

| Id | Propósito (cita, línea) | Opciones (✓ = correcta; la 2.ª es la que más se le parece) | Pista (1.er error) | Acierto |
|---|---|---|---|---|
| h2-01 | I:156 | ✓ Propietarios · Inversionistas · Administradores · Asociaciones | Fíjate en quién le confió su capital a la administración. ¿Quién lo puso? | Los dueños pusieron el capital y se lo confiaron a la administración. Quieren saber cuánto les rinde. |
| h2-02 | I:161 | ✓ Administradores · Propietarios · Empleados · El Estado | ¿Quién planea, controla y toma las decisiones de la empresa? | Los administradores usan el informe para planear, controlar y decidir. Y para ver si lo hacen bien. |
| h2-03 | I:166 | ✓ Empleados · Administradores · Acreedores · Clientes | ¿Quién les hace peticiones laborales a los empleadores? | Los empleados quieren saber cómo está la empresa antes de pedirle algo a quien los contrató. |
| h2-04 | I:171 | ✓ Acreedores · Clientes · Inversionistas · Propietarios | Responder por sus obligaciones es pagar lo que debe. ¿A quién le debe la empresa? | Los acreedores y proveedores le prestaron o le vendieron a crédito. Quieren saber si les va a pagar. |
| h2-05 | I:176 | ✓ Clientes · Acreedores · Asociaciones · Empleados | ¿Quién compara precios y busca otras opciones antes de comprar? | Los clientes miran si la empresa les va a cumplir y comparan sus precios con los de otras. |
| h2-06 | I:181 | ✓ Inversionistas · Propietarios · Acreedores · Asociaciones | Fíjate en «inversiones potenciales». ¿Esa plata ya se puso o todavía no? | Los inversionistas todavía no han puesto su plata. Miran si les conviene meterla: si es segura y deja ganancia. |
| h2-07 | I:186 | ✓ Asociaciones · El Estado · Inversionistas · Clientes | ¿Quién junta datos de muchas empresas de un mismo sector? | Las asociaciones juntan los informes de muchas empresas. Con ellos sacan cifras de cada sector. |
| h2-08 | I:191 | ✓ El Estado · Asociaciones · Acreedores · Administradores | ¿Quién cobra los impuestos y hace auditorías fiscales? | El Estado usa el informe para saber cuánto cobrar de impuestos y para hacer sus controles. |

**Devolución (2.º error), según la opción marcada.** Dice qué busca de verdad el que eligió, sin decir cuál era:

| Marcó | Devolución |
|---|---|
| Propietarios | Los dueños ya pusieron su capital y miran cuánto les rinde. Esta frase habla de otra cosa. |
| Administradores | Los jefes usan el informe para planear, controlar y decidir. Esta frase no habla de eso. |
| Empleados | Los empleados miran la empresa para sus peticiones laborales. Esta frase no habla de eso. |
| Acreedores | Los acreedores miran si la empresa les puede pagar lo que les debe. Esta frase pide otra cosa. |
| Clientes | Los clientes miran si la empresa les cumple y comparan precios. Esta frase pide otra cosa. |
| Inversionistas | Los inversionistas todavía no han puesto plata: miran si les conviene. Esta frase habla de otra cosa. |
| Asociaciones | Las asociaciones juntan datos de muchas empresas para sacar cifras del grupo. Esta frase mira a una sola. |
| El Estado | El Estado lee el informe para cobrar impuestos y hacer controles. Esta frase no habla de impuestos. |

Las citas del libro son largas y difíciles: es el texto del libro, no lo mido. Si Mai quiere aliviarlas, puede mostrar debajo la `pregunta` de Gen (I:157-192) como apoyo después del 1.er error, pero no en vez de la cita. Si la mostrara en vez de la cita, la actividad repetiría la capa 3 de cu0-a1.

**Subtema para el Repaso ([regla], por el id del usuario correcto):**
```js
"t1-quien-pregunta-esto": {
  propietarios: "Usuarios internos — propietarios", administradores: "Usuarios internos — administradores", empleados: "Usuarios internos — empleados",
  acreedores: "Usuarios externos — acreedores y proveedores", clientes: "Usuarios externos — clientes", inversionistas: "Usuarios externos — inversionistas potenciales",
  asociaciones: "Usuarios externos — asociaciones", estado: "Usuarios externos — el Estado",
},
```

## 3 · Los 7 Hacer de T1 sin emoji

Regla aplicada: quito ✅ y ❌ del comienzo, y también «Correcto.» y «No.» cuando venían después, porque eso lo dice la pastilla. Además cambié un «Sí tiene que ver» que se leía como veredicto. No toqué nada más.

Medí los 93 textos nuevos y todos los de 10 palabras o más dan ≥ 65 (el más bajo, 67,2). Incluyo los 5 «Así se juega» de T1 que copian el mismo estilo. Los de bloque3:78, :110, :172 y :279 son de T2 y quedan fuera.

**Aviso para Kaede:** hay pruebas que buscan el emoji, por ejemplo `asi-se-juega*.test.mjs`. Revisa también que ningún componente de tema1 decida el color de la pastilla por el emoji. En tema1 no encontré `startsWith("✅")`, pero corazon/juego.jsx sí lo hace. El comentario de T:744 menciona el ✅ y conviene ajustarlo.

| Archivo:línea | Texto de hoy | Texto nuevo |
|---|---|---|
| src/data/contabilidadTema1.js:83 | ✅ Adentro. Los dueños son parte de la empresa. Pero la flecha no se prendió: el día a día lo manejan los jefes. | Adentro. Los dueños son parte de la empresa. Pero la flecha no se prendió: el día a día lo manejan los jefes. |
| src/data/contabilidadTema1.js:84 | ✅ Adentro. Y mira la flecha que se prendió: los jefes deciden, y eso cambia lo que la empresa hace. | Adentro. Y mira la flecha que se prendió: los jefes deciden, y eso cambia lo que la empresa hace. |
| src/data/contabilidadTema1.js:85 | ✅ Adentro. Los empleados son parte de la empresa, aunque no manden ni sean dueños. | Adentro. Los empleados son parte de la empresa, aunque no manden ni sean dueños. |
| src/data/contabilidadTema1.js:86 | ✅ Afuera. Le prestó o le vendió a crédito, pero no es parte de la empresa. | Afuera. Le prestó o le vendió a crédito, pero no es parte de la empresa. |
| src/data/contabilidadTema1.js:87 | ✅ Afuera. Le compra a la empresa, pero no es parte de ella. | Afuera. Le compra a la empresa, pero no es parte de ella. |
| src/data/contabilidadTema1.js:88 | ✅ Afuera. Todavía no ha puesto nada. Está mirando si le conviene. | Afuera. Todavía no ha puesto nada. Está mirando si le conviene. |
| src/data/contabilidadTema1.js:89 | ✅ Afuera. Juntan números de muchas empresas para sacar cuentas del grupo. | Afuera. Juntan números de muchas empresas para sacar cuentas del grupo. |
| src/data/contabilidadTema1.js:90 | ✅ Afuera. Tiene poder sobre la empresa, pero no es parte de ella. Lee el informe como los demás de afuera. | Afuera. Tiene poder sobre la empresa, pero no es parte de ella. Lee el informe como los demás de afuera. |
| src/data/contabilidadTema1.js:96 | ❌ Esa persona sí es parte de la empresa. Los de adentro son tres: dueños, jefes y empleados. No importa si trabajan ahí todos los días. Importa si son parte. | Esa persona sí es parte de la empresa. Los de adentro son tres: dueños, jefes y empleados. No importa si trabajan ahí todos los días. Importa si son parte. |
| src/data/contabilidadTema1.js:101 | ❌ Esa persona no es parte de la empresa: la mira desde afuera. Lee el informe y lo usa para algo suyo. | Esa persona no es parte de la empresa: la mira desde afuera. Lee el informe y lo usa para algo suyo. |
| src/data/contabilidadTema1.js:164 | ✅ Industrial. Entró algodón y salió tela. No es lo mismo: adentro lo cambiaron. | Industrial. Entró algodón y salió tela. No es lo mismo: adentro lo cambiaron. |
| src/data/contabilidadTema1.js:165 | ✅ Comercial. Entró lo mismo que salió. La empresa solo lo revendió. | Comercial. Entró lo mismo que salió. La empresa solo lo revendió. |
| src/data/contabilidadTema1.js:166 | ✅ De servicios. No entró ninguna cosa. Lo que vende el banco es lo que sabe hacer. | De servicios. No entró ninguna cosa. Lo que vende el banco es lo que sabe hacer. |
| src/data/contabilidadTema1.js:167 | ✅ Industrial. Entró caña. Salió azúcar. No es lo mismo: adentro la cambiaron. | Industrial. Entró caña. Salió azúcar. No es lo mismo: adentro la cambiaron. |
| src/data/contabilidadTema1.js:168 | ✅ De servicios. No hay ninguna cosa que señalar. Venden lo que saben hacer. | De servicios. No hay ninguna cosa que señalar. Venden lo que saben hacer. |
| src/data/contabilidadTema1.js:169 | ✅ Agropecuaria. Entraron terneros y salió ganado. Ese ganado no se compró ni se sacó del suelo: se crió adentro. | Agropecuaria. Entraron terneros y salió ganado. Ese ganado no se compró ni se sacó del suelo: se crió adentro. |
| src/data/contabilidadTema1.js:170 | ✅ Comercial. Entraron productos y salieron los mismos. Solo cambiaron de dueño. | Comercial. Entraron productos y salieron los mismos. Solo cambiaron de dueño. |
| src/data/contabilidadTema1.js:171 | ✅ Minera. Nadie le vendió el petróleo. Lo sacaron del subsuelo. | Minera. Nadie le vendió el petróleo. Lo sacaron del subsuelo. |
| src/data/contabilidadTema1.js:172 | ✅ Industrial. Entró una cosa. Salió otra muy distinta. Adentro la cambiaron. | Industrial. Entró una cosa. Salió otra muy distinta. Adentro la cambiaron. |
| src/data/contabilidadTema1.js:173 | ✅ Minera. La piedra ya estaba en el suelo. Solo la sacaron. | Minera. La piedra ya estaba en el suelo. Solo la sacaron. |
| src/data/contabilidadTema1.js:174 | ✅ Agropecuaria. Nadie lo trajo ni lo sacó del suelo. El banano se sembró y creció aquí. | Agropecuaria. Nadie lo trajo ni lo sacó del suelo. El banano se sembró y creció aquí. |
| src/data/contabilidadTema1.js:225 | ❌ Mira los dos cuadros otra vez. ¿Salió lo mismo que entró? Si sí, la empresa solo revende. Si no, lo cambió. | Mira los dos cuadros otra vez. ¿Salió lo mismo que entró? Si sí, la empresa solo revende. Si no, lo cambió. |
| src/data/contabilidadTema1.js:226 | ❌ Mira el cuadro de ENTRA. Una industrial recibe materia y la cambia. Una minera no le compra a nadie: saca del suelo algo que ya estaba. | Mira el cuadro de ENTRA. Una industrial recibe materia y la cambia. Una minera no le compra a nadie: saca del suelo algo que ya estaba. |
| src/data/contabilidadTema1.js:227 | ❌ Las dos hacen algo nuevo, pero de forma distinta. Una cambia cosas con máquinas. La otra siembra o cría seres vivos. | Las dos hacen algo nuevo, pero de forma distinta. Una cambia cosas con máquinas. La otra siembra o cría seres vivos. |
| src/data/contabilidadTema1.js:228 | ❌ Una comercial compra para revender igual. Aquí lo que sale no se compró: se sembró o se crió adentro. | Una comercial compra para revender igual. Aquí lo que sale no se compró: se sembró o se crió adentro. |
| src/data/contabilidadTema1.js:229 | ❌ Aquí sí hay una cosa que puedes señalar. Las de servicios no venden cosas. Venden lo que saben hacer. | Aquí sí hay una cosa que puedes señalar. Las de servicios no venden cosas. Venden lo que saben hacer. |
| src/data/contabilidadTema1.js:230 | ❌ Una comercial le compra a alguien. Una minera no: saca del suelo algo que ya estaba ahí. Mira el cuadro de ENTRA. | Una comercial le compra a alguien. Una minera no: saca del suelo algo que ya estaba ahí. Mira el cuadro de ENTRA. |
| src/data/contabilidadTema1.js:231 | ❌ Mira el cuadro de ENTRA: dice sin insumo físico. No hay nada que cambiar, revender, criar ni sacar. | Mira el cuadro de ENTRA: dice sin insumo físico. No hay nada que cambiar, revender, criar ni sacar. |
| src/data/contabilidadTema1.js:232 | ❌ Las dos sacan algo de la tierra. Pero una cría animales o siembra plantas. La otra saca piedra o petróleo, que ya estaban ahí. | Las dos sacan algo de la tierra. Pero una cría animales o siembra plantas. La otra saca piedra o petróleo, que ya estaban ahí. |
| src/data/contabilidadTema1.js:338 | ❌ Marcaste que uno sube y el otro baja. Mira el hecho otra vez: entró algo y con eso nació una deuda. Nada se redujo. Los dos lados pueden subir juntos. | Marcaste que uno sube y el otro baja. Mira el hecho otra vez: entró algo y con eso nació una deuda. Nada se redujo. Los dos lados pueden subir juntos. |
| src/data/contabilidadTema1.js:339 | ❌ Marcaste que uno sube y el otro baja. Mira el hecho otra vez: salió plata y con eso se pagó una deuda. Nada creció. Los dos lados pueden bajar juntos. | Marcaste que uno sube y el otro baja. Mira el hecho otra vez: salió plata y con eso se pagó una deuda. Nada creció. Los dos lados pueden bajar juntos. |
| src/data/contabilidadTema1.js:340 | ❌ Marcaste que uno sube y el otro baja. Mira el hecho otra vez: entró algo a la empresa y creció lo que ella les reconoce a los socios. Aquí no hay ninguna deuda. Los dos lados pueden subir juntos. | Marcaste que uno sube y el otro baja. Mira el hecho otra vez: entró algo a la empresa y creció lo que ella les reconoce a los socios. Aquí no hay ninguna deuda. Los dos lados pueden subir juntos. |
| src/data/contabilidadTema1.js:341 | ❌ Marcaste que uno sube y el otro baja. Mira el hecho otra vez: salió plata de la empresa y bajó lo que ella les reconoce a los socios. Aquí no hay ninguna deuda. Los dos lados pueden bajar juntos. | Marcaste que uno sube y el otro baja. Mira el hecho otra vez: salió plata de la empresa y bajó lo que ella les reconoce a los socios. Aquí no hay ninguna deuda. Los dos lados pueden bajar juntos. |
| src/data/contabilidadTema1.js:344 | ❌ Esa parte queda igual con este hecho. Pregúntate si algo de eso entró, salió o cambió. | Esa parte queda igual con este hecho. Pregúntate si algo de eso entró, salió o cambió. |
| src/data/contabilidadTema1.js:347 | ✅ Sube lo que tiene y sube lo de los dueños. Entró plata a la empresa, y creció lo que ella les reconoce a los socios. | Sube lo que tiene y sube lo de los dueños. Entró plata a la empresa, y creció lo que ella les reconoce a los socios. |
| src/data/contabilidadTema1.js:348 | ✅ Suben los dos. Entró un computador y nació una deuda por lo mismo. Ninguna cancela a la otra. | Suben los dos. Entró un computador y nació una deuda por lo mismo. Ninguna cancela a la otra. |
| src/data/contabilidadTema1.js:349 | ✅ Suben los dos. Entró una máquina y el banco prestó la plata. La deuda nació con la compra. | Suben los dos. Entró una máquina y el banco prestó la plata. La deuda nació con la compra. |
| src/data/contabilidadTema1.js:350 | ✅ Bajan los dos. Salió plata y con eso se pagó parte de la deuda. | Bajan los dos. Salió plata y con eso se pagó parte de la deuda. |
| src/data/contabilidadTema1.js:351 | ✅ Sube lo que tiene y sube lo de los dueños. El local ya es de la empresa. Lo que creció es lo que ella les reconoce a los socios. | Sube lo que tiene y sube lo de los dueños. El local ya es de la empresa. Lo que creció es lo que ella les reconoce a los socios. |
| src/data/contabilidadTema1.js:352 | ✅ Bajan los dos. Salió plata de la empresa y bajó lo que ella les reconoce a los socios. | Bajan los dos. Salió plata de la empresa y bajó lo que ella les reconoce a los socios. |
| src/data/contabilidadTema1.js:353 | ✅ Suben los dos. Entró mercancía y nació una deuda con el proveedor. | Suben los dos. Entró mercancía y nació una deuda con el proveedor. |
| src/data/contabilidadTema1.js:354 | ✅ Bajan los dos. Salió plata y con eso se pagó parte del préstamo del banco. | Bajan los dos. Salió plata y con eso se pagó parte del préstamo del banco. |
| src/data/contabilidadTema1.js:398 | ❌ Los dos lados no dan igual. Faltan {Z} de un lado. Vuelve al hecho: lo que entró tiene que venir de algún lado. | Los dos lados no dan igual. Faltan {Z} de un lado. Vuelve al hecho: lo que entró tiene que venir de algún lado. |
| src/data/contabilidadTema1.js:399 | ❌ Esa parte no cambia con este hecho. Tiene que quedar igual que antes. Si la mueves, se pierde el rastro de lo de atrás. | Esa parte no cambia con este hecho. Tiene que quedar igual que antes. Si la mueves, se pierde el rastro de lo de atrás. |
| src/data/contabilidadTema1.js:400 | ❌ Los dos lados dan igual, pero los números no son los de este hecho. Que dé igual no basta. Revisa cuánto entró o salió. | Los dos lados dan igual, pero los números no son los de este hecho. Que dé igual no basta. Revisa cuánto entró o salió. |
| src/data/contabilidadTema1.js:428 | ✅ Y ahí está el mes completo. Lo que tiene la empresa y lo que debe más lo de los dueños dan lo mismo, hecho por hecho, desde cero. | Y ahí está el mes completo. Lo que tiene la empresa y lo que debe más lo de los dueños dan lo mismo, hecho por hecho, desde cero. |
| src/data/contabilidadTema1.js:502 | ❌ Eso no es algo que la empresa tenga hoy. Es algo que pasó durante el año. Un informe es una foto de un día. El otro cuenta todo el año. | Eso no es algo que la empresa tenga hoy. Es algo que pasó durante el año. Un informe es una foto de un día. El otro cuenta todo el año. |
| src/data/contabilidadTema1.js:504 | ❌ Eso la empresa lo tiene o lo debe, y mañana lo sigue teniendo. El otro informe solo cuenta lo que pasó dentro del año. | Eso la empresa lo tiene o lo debe, y mañana lo sigue teniendo. El otro informe solo cuenta lo que pasó dentro del año. |
| src/data/contabilidadTema1.js:506 | ❌ El informe es el correcto, eso ya lo tienes. Ahora pregúntate: ¿la empresa lo tiene, lo debe, o es de los dueños? | El informe es el correcto, eso ya lo tienes. Ahora pregúntate: ¿la empresa lo tiene, lo debe, o es de los dueños? |
| src/data/contabilidadTema1.js:510 | ✅ Va en el primer informe, en lo que tiene. Una patente no se toca, pero es de la empresa y vale. | Va en el primer informe, en lo que tiene. Una patente no se toca, pero es de la empresa y vale. |
| src/data/contabilidadTema1.js:511 | ✅ Va en el segundo informe. No es algo que la empresa tenga: es lo que vendió durante el año. | Va en el segundo informe. No es algo que la empresa tenga: es lo que vendió durante el año. |
| src/data/contabilidadTema1.js:512 | ✅ Va en el primer informe, en lo que debe. Es plata que le queda debiendo a un proveedor. | Va en el primer informe, en lo que debe. Es plata que le queda debiendo a un proveedor. |
| src/data/contabilidadTema1.js:513 | ✅ Va en el primer informe, en lo de los dueños. Es una parte de las ganancias que no se repartió. | Va en el primer informe, en lo de los dueños. Es una parte de las ganancias que no se repartió. |
| src/data/contabilidadTema1.js:514 | ✅ Va en el primer informe, en lo que tiene. Es la plata que tiene disponible. | Va en el primer informe, en lo que tiene. Es la plata que tiene disponible. |
| src/data/contabilidadTema1.js:515 | ✅ Va en el segundo informe. Es lo que la empresa gastó durante el año. | Va en el segundo informe. Es lo que la empresa gastó durante el año. |
| src/data/contabilidadTema1.js:516 | ✅ Va en el primer informe, en lo que tiene. Es plata que los clientes le quedaron debiendo. | Va en el primer informe, en lo que tiene. Es plata que los clientes le quedaron debiendo. |
| src/data/contabilidadTema1.js:517 | ✅ Va en el primer informe, en lo que tiene. Son cosas de la empresa que duran años. | Va en el primer informe, en lo que tiene. Son cosas de la empresa que duran años. |
| src/data/contabilidadTema1.js:518 | ✅ Va en el segundo informe. Es lo que obtuvo en el año por algo que no es su negocio de siempre. | Va en el segundo informe. Es lo que obtuvo en el año por algo que no es su negocio de siempre. |
| src/data/contabilidadTema1.js:519 | ✅ Va en el primer informe, en lo que tiene. Es plata que la empresa puso a producir en otra parte y puede recuperar pronto. | Va en el primer informe, en lo que tiene. Es plata que la empresa puso a producir en otra parte y puede recuperar pronto. |
| src/data/contabilidadTema1.js:520 | ✅ Va en el primer informe, en lo que debe. Es una deuda con un papel firmado. | Va en el primer informe, en lo que debe. Es una deuda con un papel firmado. |
| src/data/contabilidadTema1.js:521 | ✅ Va en el primer informe, en lo que debe. Es lo que le debe a un banco este año. | Va en el primer informe, en lo que debe. Es lo que le debe a un banco este año. |
| src/data/contabilidadTema1.js:522 | ✅ Va en el primer informe, en lo que tiene. Es plata que la empresa puso a producir en otra parte y va a tardar en volver. | Va en el primer informe, en lo que tiene. Es plata que la empresa puso a producir en otra parte y va a tardar en volver. |
| src/data/contabilidadTema1.js:523 | ✅ Va en el primer informe, en lo que debe. Es lo que la empresa calcula que va a tener que pagar por arreglos de lo que vendió. | Va en el primer informe, en lo que debe. Es lo que la empresa calcula que va a tener que pagar por arreglos de lo que vendió. |
| src/data/contabilidadTema1.js:524 | ✅ Va en el primer informe, en lo que debe. Es lo que le debe al Estado y todavía no le ha pagado. | Va en el primer informe, en lo que debe. Es lo que le debe al Estado y todavía no le ha pagado. |
| src/data/contabilidadTema1.js:525 | ✅ Va en el primer informe, en lo que debe. Es lo que les debe a sus empleados y todavía no les ha pagado. | Va en el primer informe, en lo que debe. Es lo que les debe a sus empleados y todavía no les ha pagado. |
| src/data/contabilidadTema1.js:614 | ❌ Esas dos cifras no se pasan nada. Pregúntate: ¿una es la misma que la otra, o explica de dónde salió? Si no pasa ninguna, no hay flecha. | Esas dos cifras no se pasan nada. Pregúntate: ¿una es la misma que la otra, o explica de dónde salió? Si no pasa ninguna, no hay flecha. |
| src/data/contabilidadTema1.js:616 | ❌ La flecha va al revés. Esta sale y esta recibe. Mira la regla: todas llegan al mismo informe, ninguna sale de él. | La flecha va al revés. Esta sale y esta recibe. Mira la regla: todas llegan al mismo informe, ninguna sale de él. |
| src/data/contabilidadTema1.js:618 | ❌ Esos dos informes no se conectan entre ellos. Cada uno le pasa sus cifras al tercero, no al otro. | Esos dos informes no se conectan entre ellos. Cada uno le pasa sus cifras al tercero, no al otro. |
| src/data/contabilidadTema1.js:622 | ✅ El informe de lo que vendió y gastó le pasa su resultado al otro. Lo que la empresa ganó o perdió cambia cómo queda al final. | El informe de lo que vendió y gastó le pasa su resultado al otro. Lo que la empresa ganó o perdió cambia cómo queda al final. |
| src/data/contabilidadTema1.js:623 | ✅ La plata que queda al final es la misma que aparece en el otro informe. No son dos cifras parecidas: es la misma. | La plata que queda al final es la misma que aparece en el otro informe. No son dos cifras parecidas: es la misma. |
| src/data/contabilidadTema1.js:624 | ✅ El movimiento del día a día explica lo que le deben y lo que debe. Lo que cobró y lo que pagó deja rastro ahí. | El movimiento del día a día explica lo que le deben y lo que debe. Lo que cobró y lo que pagó deja rastro ahí. |
| src/data/contabilidadTema1.js:625 | ✅ Lo que compró o vendió de sus cosas grandes explica esa línea. | Lo que compró o vendió de sus cosas grandes explica esa línea. |
| src/data/contabilidadTema1.js:626 | ✅ De dónde sacó la plata para financiarse explica lo que pusieron los dueños. | De dónde sacó la plata para financiarse explica lo que pusieron los dueños. |
| src/data/contabilidadTema1.js:650 | ✅ Correcto. No son dos cuentas que se parecen: es la misma cifra por dos caminos. Si no dan igual, uno de los dos está mal. | No son dos cuentas que se parecen: es la misma cifra por dos caminos. Si no dan igual, uno de los dos está mal. |
| src/data/contabilidadTema1.js:651 | ❌ No. Que quede con poca plata es posible y no es un error. Lo que no puede pasar es que los dos informes digan cifras distintas de lo mismo. | Que quede con poca plata es posible y no es un error. Lo que no puede pasar es que los dos informes digan cifras distintas de lo mismo. |
| src/data/contabilidadTema1.js:652 | ❌ Los dos cierran el mismo día. Si cubrieran tiempos distintos, no se podrían conectar. | Los dos cierran el mismo día. Si cubrieran tiempos distintos, no se podrían conectar. |
| src/data/contabilidadTema1.js:659 | ✅ Correcto. El otro informe muestra cómo quedó la empresa, y no puede quedar igual después de un año en que ganó o perdió. | El otro informe muestra cómo quedó la empresa, y no puede quedar igual después de un año en que ganó o perdió. |
| src/data/contabilidadTema1.js:660 | ❌ Eso lo explica otra flecha: la de lo que compró y vendió de sus cosas grandes. | Eso lo explica otra flecha: la de lo que compró y vendió de sus cosas grandes. |
| src/data/contabilidadTema1.js:661 | ❌ Las deudas ya están en el otro informe. Su movimiento lo explican otras flechas. | Las deudas ya están en el otro informe. Su movimiento lo explican otras flechas. |
| src/data/contabilidadTema1.js:668 | ✅ Correcto. Los otros dos cuentan qué pasó durante el año. Ese guarda cómo quedó la empresa. La explicación va hacia el resultado. | Los otros dos cuentan qué pasó durante el año. Ese guarda cómo quedó la empresa. La explicación va hacia el resultado. |
| src/data/contabilidadTema1.js:669 | ❌ Al revés: necesita lo que los otros calculan. El que va primero es el informe del comienzo del año, que es otro. | Al revés: necesita lo que los otros calculan. El que va primero es el informe del comienzo del año, que es otro. |
| src/data/contabilidadTema1.js:670 | ❌ Sí tiene que ver, y mucho: las cinco flechas llegan a él. Lo que no hace es mandarles cifras a ellos. | Tiene que ver, y mucho: las cinco flechas llegan a él. Lo que no hace es mandarles cifras a ellos. |
| src/data/contabilidadTema1.js:748 | ✅ Se rompió en el papel. Sin factura no queda un papel, así que este hecho no se anota, no llega al informe y los jefes deciden sin saberlo. Se apagaron cuatro puntos. | Se rompió en el papel. Sin factura no queda un papel, así que este hecho no se anota, no llega al informe y los jefes deciden sin saberlo. Se apagaron cuatro puntos. |
| src/data/contabilidadTema1.js:749 | ✅ Se rompió al anotar. El papel está. Pero nadie lo pasó a los libros, así que este hecho no llega al informe y los jefes deciden sin saberlo. Se apagaron tres puntos. | Se rompió al anotar. El papel está. Pero nadie lo pasó a los libros, así que este hecho no llega al informe y los jefes deciden sin saberlo. Se apagaron tres puntos. |
| src/data/contabilidadTema1.js:750 | ✅ Se rompió en el informe. Este hecho está anotado, pero lo dejaron por fuera del informe. Los jefes deciden sin ver este dato. Se apagaron dos puntos. | Se rompió en el informe. Este hecho está anotado, pero lo dejaron por fuera del informe. Los jefes deciden sin ver este dato. Se apagaron dos puntos. |
| src/data/contabilidadTema1.js:751 | ✅ El informe sí se hizo: los primeros cuatro puntos quedaron encendidos. Pero los jefes no decidieron nada con él. Por eso el último punto se apaga y la flecha de vuelta no se enciende. | El informe sí se hizo: los primeros cuatro puntos quedaron encendidos. Pero los jefes no decidieron nada con él. Por eso el último punto se apaga y la flecha de vuelta no se enciende. |
| src/data/contabilidadTema1.js:762 | ❌ Hasta ese punto todo funcionó bien. Mira más adelante: el corte está después. | Hasta ese punto todo funcionó bien. Mira más adelante: el corte está después. |
| src/data/contabilidadTema1.js:763 | ❌ Este hecho nunca llegó a ese punto. Se cortó antes, así que desde ahí ya no aparece. | Este hecho nunca llegó a ese punto. Se cortó antes, así que desde ahí ya no aparece. |
| src/data/asiSeJuegaBloque1.js:83 | ✅ «Total vendido» manda su cifra a «Ventas de la semana 1». Son la misma cifra en dos hojas, así que la flecha queda trazada. | «Total vendido» manda su cifra a «Ventas de la semana 1». Son la misma cifra en dos hojas, así que la flecha queda trazada. |
| src/data/asiSeJuegaBloque1.js:116 | ✅ «Lo que tiene» sube: entró el horno. «Lo que debe» sube: nació la deuda. «Lo que es de los dueños» queda igual: nadie puso ni sacó plata. | «Lo que tiene» sube: entró el horno. «Lo que debe» sube: nació la deuda. «Lo que es de los dueños» queda igual: nadie puso ni sacó plata. |
| src/data/asiSeJuegaBloque2.js:35 | ✅ Afuera. Le compra a la panadería, pero no es parte de ella. | Afuera. Le compra a la panadería, pero no es parte de ella. |
| src/data/asiSeJuegaBloque2.js:69 | ✅ Industrial. Entró harina. Salió pan. No es lo mismo: adentro lo cambiaron. | Industrial. Entró harina. Salió pan. No es lo mismo: adentro lo cambiaron. |
| src/data/asiSeJuegaBloque3.js:44 | ✅ Va en el primer informe, en lo que tiene. El horno es de la panadería y le dura años. | Va en el primer informe, en lo que tiene. El horno es de la panadería y le dura años. |
