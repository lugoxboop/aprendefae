# T1 · Las P2 de Mai para los Hacer de T1 (23-oct)

Copiadas de su chat por Sakuta, una sección por archivo y sin cambios. La de t1-la-ecuacion-en-movimiento está aparte, en b-t1-5-torres-p2-mai.md.



---

<!-- P2 t1 comun -->

# T1 · Hacer — reglas comunes del lote (anexo de cada P2)

De: Mai · 23-oct-2026 · Para Kaede. Cada P2 de T1 cita este anexo para no repetirlo.

**Origen de las cifras:**
- **[fuente, réplica]:** la réplica de main hecha con el zip de Sakuta (Vite 5.4.10, React 18.3.1), medida en Chromium 141.0.7390.37 headless con Inter y Sora de @fontsource 5.3.0. La «y» se cuenta desde el borde inferior de «Volver al camino».
- **[fuente, prototipo]:** `lote2/proto-t1-lote2.html` o `p2-t1-5/proto-t1-5-torres.html`, en el mismo navegador. La «y» se cuenta desde la cima del Panel.
- **Los dos orígenes difieren** por el margen entre «Volver al camino» y el Panel. Por eso no los resto: cada medida se compara contra 280.

## C1 · El encabezado compacto (en `tema1/encabezado.jsx`, que es de B)

1. **El objetivo**, como hoy.
2. **Una fila de 44:** el contador («Pregunta n de N») a la izquierda y «¿Cómo se juega?» a la derecha, como enlace (Sora 12/600, subrayado).
3. **La consigna y los pasos van plegados** bajo «¿Cómo se juega?».

**Medida [fuente, prototipo]:** el contador queda a 50,7 de la cima del Panel, a 320 y a 375. Hoy está a 235,8 de «Volver al camino» a 320 [fuente, réplica].

**⛔ Parte compartida, va a Erwin:** el rótulo de la cejilla y el subtema los pinta el marco compartido. Aquí solo se compacta lo que pinta `tema1/encabezado.jsx`.

## C2 · El veredicto (parche dentro de cada pieza, aprobado por Sakuta mientras Erwin decide #487)

- **Acierto:** contorno de 2 px #F8F9FA, relleno navy #1D3557 y ✓ «Correcto» (Check de lucide, 16 px, trazo 2,5).
- **Error:**
  - en lo elegido, contorno discontinuo coral de 2 px y ✕ «No va aquí» (X de lucide, coral #E76F51);
  - en lo correcto, ✓ «Iba aquí: {valor}».
- **La devolución del banco se pinta sin el emoji inicial,** quitándolo solo al dibujarla: los textos del banco no cambian.
- **El modelo es el registro.** Tras responder, el modelo muestra lo correcto, se acierte o no. Lo elegido queda como **fantasma** (discontinuo coral) donde habría caído.
- **Un intento por decisión.** Sin reintento.
- **Bordes sin salto:** el reposo es un borde de 2 px transparente con `box-shadow: inset 0 0 0 1px rgba(248,249,250,.35)`. Así, al pasar a acierto o error nada cambia de ancho ni reacomoda el texto. Lo medí: con borde de 1 px, la mesa de H2 crecía 19 px.

## C3 · Lo que se reserva

**Todo lo que entra después de responder tiene su sitio reservado de antemano:** el escenario no cambia de alto entre vacío y respondido. Cada P2 da su medida.

## C4 · Estados (la lista entera vale para las 8 piezas)

| Estado | Qué se ve |
|---|---|
| vacío | la figura sin nada que delate la respuesta (R10) |
| foco | anillo de 2 px #F8F9FA, separado 2 px |
| presionado | lo elegido, con `aria-pressed` |
| abierto | «¿Cómo se juega?» desplegado: empuja hacia abajo |
| con respuesta antes de comprobar | no aplica: en estas piezas tocar es responder |
| tocado sin respuesta | no aplica |
| acierto · error · después del error | C2 |
| movimiento reducido | C5 |

## C5 · Movimiento

- Lo que entra lo hace con opacidad y `translateY` de 6 a 0, en 240 ms.
- Lo que crece usa `scale`.
- La curva es cubic-bezier(.3,.9,.4,1). Nada en bucle; el «latido» de T1-4 da un solo pulso.
- **Con movimiento reducido,** todo al instante.

## C6 · Lo que no es mío y queda anotado

- **⛔ Erwin:** «Siguiente» va pegado (`position: sticky`) en el ejemplo de «Así se juega» (`AsiSeJuega.jsx`, compartido) y tapa el ejemplo a 320. Además, «Pausar» queda debajo de él.
  - **Propuesta:** «Pausar» (secundario) a la izquierda y «Siguiente» a la derecha, en la misma barra pegada.
  - **Propuesta:** la sección del ejemplo reserva abajo el alto de la barra.
- **Futaba / Sakuta:** los títulos llevan mayúscula en cada palabra (Shoko). Los `nombre` están en `contabilidadTema1.js`. Cambiarlos es tocar texto publicado: **lo hace quien es dueño del contenido, no yo.** La tabla de Shoko ya trae los textos.
- **Futaba:** el ejemplo de «Así se juega» de T1-5 usa el mismo hecho que el de T1-4, el horno a crédito (Shoko). Futaba lo cambia; mi P2 de las torres sirve con cualquier hecho que mueva dos partes por el mismo monto.

---

<!-- P2 t1 1 desde donde -->

DISEÑO: P2 t1-desde-donde-preguntan — el anillo en fila, con la vuelta — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. Va con `../P2-T1-comun.md` (C1 a C6). **Prototipo:** `proto-t1-lote2.html?p=t1-1`, con `&e=1` (error) y `&e=2` (error + segunda decisión).

## 0 · Alcance y paradas

- **Sin paradas.** El id, el banco (`USUARIOS_T1_1`) y `SEGUNDA_T1_1` no cambian. Solo cambia la vista.
- **Lo que se reemplaza:**
  - el anillo en columna, de cinco puntos, pasa a una fila;
  - la escena que no corría en el error ahora corre (el registro);
  - los estados del veredicto (C2).
- **No repite a H2** (¿Quién pregunta esto?). Aquí la segunda decisión es *hasta dónde ve*; en H2 es *quién es*.

## 1 · La idea y Norman

**El estudiante VE la pregunta entrar a la empresa o quedarse afuera, y la vuelta del ciclo encenderse solo cuando quien pregunta decide; después VE encenderse las estaciones que esa persona alcanza a ver. Eso explica que pertenecer, decidir y ver son tres cosas distintas.**

- **Primer impacto:** las cinco estaciones en fila, con la vuelta apagada encima.
- **Cómo se usa:** tocar «Adentro» o «Afuera» (decisión 1); luego la segunda decisión, que ya existe.
- **Lo que se lleva:** «adentro» no es lo mismo que «decide».

**Referencias:** el Gráfico 1.1 (p. 6), por el anillo, y las pp. 11-12, por los usuarios.

**Tres segundos:** una pregunta y dos zonas pegadas a la franja del ciclo.

## 2 · Estructura

1. Encabezado compacto (C1).
2. La pregunta, en su tarjeta.
3. **El escenario** (contenedor hundido):
   - **arriba,** las cinco estaciones en una fila de 5 columnas: un punto de 16 sobre un riel de 2 px #B8C4D4 y el nombre debajo (Inter 12/600, #A8B6C8). Los nombres son los publicados: «Pasa algo en la empresa», «Queda un papel», «Se anota», «Sale un informe» y «Los jefes deciden»;
   - **encima del riel,** la vuelta: un arco del punto 5 al 1, en discontinuo rgba(248,249,250,.25). Encendida, es sólida de 2 px #F8F9FA;
   - **debajo,** la franja del ciclo (6 px, rgba(184,196,212,.35)) y, pegada a ella, la zona «Adentro». Después, un blanco de 14 px y la zona «Afuera». Las dos son botones de 44 como mínimo. **Se distinguen por posición y por palabra, no por color**, como hoy.
4. El veredicto y la devolución (C2).
5. La segunda decisión (`SEGUNDA_T1_1`), debajo.

## 3 · Qué pasa al responder

| Decisión | Qué se mueve, se acierte o no |
|---|---|
| 1 · Adentro / Afuera | la pregunta entra, como ficha («la pregunta»), a su zona **correcta**. Si erró, la zona tocada queda con el fantasma coral discontinuo. **La vuelta se enciende solo si la pregunta es de los administradores** (`cierraElCiclo`), también tras un error |
| 2 · Hasta dónde ve | se encienden los puntos que esa persona alcanza a ver: con `todo`, los cinco; con `informe`, solo el 4. **Se encienden los correctos**; si erró, lo elegido queda como fantasma en los puntos que no debían encenderse |

**R10:** antes de responder, nada está encendido y la vuelta va tenue.

## 4 · Medidas [fuente, prototipo]

| | 320 | 375 |
|---|---|---|
| Hoy (réplica): primer control y palabras antes | 520,8 · 78 | 483,9 · 76 |
| La figura (el anillo), desde la cima del Panel | **171,3** | **171,3** |
| El primer control («Adentro») | 295,8 | 281,5 |
| Palabras antes de la figura | **30** | 30 |
| Escenario (no cambia al responder) | 237,6 | 223,2 |
| Desplazamiento horizontal | no | no |

- **B1 pasa por la figura:** a menos de 280 y con 30 palabras.
- **Lo honesto:** a 320, «Pasa algo en la empresa» ocupa 4 renglones en su columna. No lo corto: es el nombre publicado.

## 5 a 9 · Estados, movimiento, accesibilidad e íconos

- **Estados:** C4. **Movimiento:** C5; la vuelta se enciende con opacidad en 240 ms.
- **Accesibilidad:**
  - el anillo lleva `role="img"`, con un texto alternativo que cambia: «Ciclo de cinco estaciones. La pregunta está adentro. La vuelta está encendida: esta persona decide.»;
  - **ME FALTA de Futaba:** el texto alternativo final.
- **Íconos:** C2.

## 10 · Textos (para Shoko)

- **Nuevo:** «la pregunta» (el rótulo de la ficha).
- **Lo demás está publicado:** las estaciones, «Adentro», «Afuera» y `SEGUNDA_T1_1`.

## 11 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | Anillo en fila, con la vuelta encima | Me pasa el alto real |
| 2 | En el error la escena corre igual, con lo correcto, y queda el fantasma | Indispensable |
| 3 | La vuelta solo con `cierraElCiclo` | Indispensable |

---

<!-- P2 t1 2 que entro -->

DISEÑO: P2 t1-que-entro-y-que-salio — la flecha que dice qué le pasó — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. Va con `../P2-T1-comun.md`. **Sin prototipo nuevo:** la escena de main ya sirve, y lo que cambia es su comportamiento. Las medidas son de la réplica.

## 0 · Alcance y paradas

- **Sin paradas.** El id, `EMPRESAS`, `MATRIZ` y `SEGUNDA_T1_2` no cambian.
- **Cambios de vista:**
  - el encabezado de la pregunta, «¿QUÉ LE PASÓ ADENTRO A LO QUE ENTRÓ?», va hoy en ámbar y en mayúsculas. Pasa a neutro, en Sora 14/600 #F8F9FA, sin mayúsculas: el ámbar es solo HABER (Shoko);
  - el texto de Shoko, «¿Qué clase de empresa es?», es texto publicado: **lo cambia Futaba**. Si lo cambia, el renglón cabe igual.

## 1 · La idea y Norman

**El estudiante VE lo que entra transformarse, o no, en lo que sale, con la palabra que lo dice sobre la flecha, también cuando falla. Eso explica que la clase de empresa se decide por lo que le pasa adentro a lo que entró.**

## 2 · Qué cambia en la escena

- **Entre «ENTRA» y «SALE», la flecha lleva su relación** (`MATRIZ`: «lo mismo», «transformado», «criado», «extraído» o «no hay objeto»).
  - **Hoy solo se dibuja al acertar.** Pasa a dibujarse **siempre tras responder, con la relación correcta** (el registro).
  - **Si erró,** junto a la flecha va la relación de la clase elegida, tachada y en coral discontinuo, con ✕: el fantasma. Así se ven las dos relaciones, la que es y la que eligió.
  - **R10:** antes de responder la flecha va vacía, como hoy. La relación es la respuesta con otras palabras.
- **Las cinco clases:** C2. La correcta, ✓ «Iba aquí: Industrial o de manufactura».
- **El renglón de la relación reserva su alto** (dos líneas de Inter 12/600: 32 px [calculado: 2 · 16]). Así la escena no crece al responder.

## 3 · Medidas [fuente, réplica]

| | 320 | 375 |
|---|---|---|
| Primer control hoy, y palabras antes | 480 · 60 | 467 · 62 |
| Con el encabezado compacto (C1) | **[supuesto]** a menos de 280 · ⛔ **parada:** Kaede mide la «y» de «Comercial» tras C1 y me la pasa | — |

## 4 · Textos (para Shoko)

- **Nuevos:** ninguno. Las relaciones están publicadas en `MATRIZ`.
- **El encabezado de la pregunta:** solo cambian el color y las mayúsculas, no el texto.

## 5 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | La flecha con su relación, siempre tras responder; el fantasma de la elegida si erró | Indispensable |
| 2 | Encabezado de la pregunta en neutro, sin mayúsculas | — |
| 3 | La medida tras C1 | Parada de medición |

---

<!-- P2 t1 4 que le pasa -->

DISEÑO: P2 t1-que-le-pasa-a-cada-uno — las barras arriba, y el registro — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. Va con `../P2-T1-comun.md`. **Sin prototipo nuevo;** las medidas son de la réplica.

## 0 · Alcance y paradas

- **Sin paradas.** El id, el banco y `SEGUNDA_T1_4` no cambian.
- **No se parece a T1-5 (las torres):**
  - aquí son **tres barras sueltas, sin montos ni totales**, y un hecho por vez;
  - en T1-5 son dos torres que acumulan el recorrido con su monto.
- Lo que tienen en común es el hecho de ejemplo del horno a crédito (Shoko), y eso lo cambia Futaba.

## 1 · La idea

**El estudiante VE subir, bajar o quedarse quieta cada una de las tres barras con su decisión. Eso explica que con cada hecho se mueven dos partes y una se queda.**

## 2 · Qué cambia

- **Las tres barras suben al primer lugar,** justo bajo el hecho. Hoy el primer control está a 553 de «Volver al camino» a 320.
- **Debajo de las barras van las tres filas de «↑ sube · ↓ baja · = queda igual»,** cada una alineada con su barra.
- **Al responder:**
  - las barras van a lo **correcto** (el registro);
  - la que el estudiante movió mal deja su **fantasma** coral discontinuo a la altura que habría tomado;
  - **la barra quieta da un solo pulso de opacidad** (1 → .6 → 1, en 480 ms) y no cambia de alto. Hoy «late»: queda en una sola vez, nada en bucle (C5).
- **Veredicto:** C2, por fila.
- **La segunda decisión** (`SEGUNDA_T1_4`, «¿qué le pasó a esa igualdad?») sigue debajo. Al responderla, la línea «=» entre las barras de los dos lados se marca:
  - «sigue dando igual»: sólida, 2 px #F8F9FA;
  - «se rompió»: queda la correcta (sólida), y la elegida como fantasma.

## 3 · Medidas

| | 320 | 375 |
|---|---|---|
| Primer control hoy, y palabras antes [fuente, réplica] | 553,1 · 84 | 534,3 · 82 |
| Barras tras C1 y subirlas | **[supuesto]** figura a menos de 280 · ⛔ **parada:** Kaede mide la «y» de las barras tras el cambio | — |

## 4 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | Barras antes que las filas de decisión | Me pasa la medida |
| 2 | Registro y fantasma por barra | Indispensable |
| 3 | El pulso, una sola vez | — |

---

<!-- P2 t1 6 en que estado -->

DISEÑO: P2 t1-en-cual-estado-aparece — la foto y la película se llenan — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. Va con `../P2-T1-comun.md`. **Prototipo:** `proto-t1-lote2.html?p=t1-6`, con `&e=1` para el error.

## 0 · Alcance y paradas

- **Sin paradas.** El id y el banco (`CONCEPTOS`, con informe y sección) no cambian.
- **Lo que cambia:** las dos decisiones (primero el informe, luego la parte) pasan a **un solo toque sobre uno de cuatro destinos**:
  - en el estado de situación financiera: «Activo», «Pasivo» o «Patrimonio»;
  - o el estado de resultados.
- **Por qué un toque:** con la primera decisión binaria se acertaba al azar la mitad de las veces (Shoko). Con cuatro destinos, una de cada cuatro. El puntaje se calcula con la llave compuesta que ya existe (`informe:seccion`; solo `informe` si es el segundo).
- **Los nombres de los informes** pasan a los del Aprender, que es la nota de Shoko:
  - «Estado de situación financiera · al 31 de diciembre»;
  - «Estado de resultados · 1 ene – 31 dic».
  - **⛔ Es texto publicado: lo cambia Futaba en el banco, no yo.** Mi P2 usa esos nombres.

## 1 · La idea y Norman

**El estudiante VE la ficha caer en la foto de un día o en la franja de todo el año, y los dos informes llenarse ficha por ficha. Eso explica que uno muestra un día exacto y el otro, todo un periodo.**

- **Primer impacto:** dos informes lado a lado, con su fecha.
- **Cómo se usa:** tocar el destino.
- **Lo que se lleva:** al final, cada informe con su cuenta de fichas.

**Referencia:** la foto y la película del Aprender cu0-a3.

## 2 · Estructura

1. Encabezado compacto (C1).
2. La ficha (el concepto), en su tarjeta.
3. **El escenario:** dos columnas.
   - **A la izquierda, la foto:** «Estado de situación financiera», con «al 31 de diciembre» debajo, y tres destinos de 44 como mínimo: «Activo», «Pasivo» y «Patrimonio».
   - **A la derecha, la película:** «Estado de resultados», con «1 ene – 31 dic» debajo y la franja del tiempo (rayas de 6 px). Lleva un destino que ocupa toda la columna: «Lo que vendió y lo que gastó».
   - **Cada destino tiene un contador de fichas** en monospace («0», «1»…), dentro de una cajita con borde.
   - **Un renglón reservado debajo** (32 px de alto mínimo): «Entró: {ficha} → {destino}».
4. El veredicto (C2) y la devolución del banco.

## 3 · Qué pasa al responder

- **El contador del destino correcto sube**, y el destino queda resaltado hasta la ficha siguiente.
- **El renglón dice a dónde entró** la ficha.
- **Si erró:** el destino tocado queda con el fantasma coral, y aparece ✓ «Iba aquí: Estado de situación financiera · Activo».

## 4 · Medidas [fuente, prototipo]

| | 320 | 375 |
|---|---|---|
| Hoy (réplica): primer control y palabras antes | 316,9 · 48 | 279,2 · 48 |
| La figura, desde la cima del Panel | **151** | **132,1** |
| El primer destino | 252 | 203,1 |
| Palabras antes de la figura | **22** | 22 |
| Escenario, vacío y respondido | 262 · 262 | 229 · 229 |
| Desplazamiento horizontal | no | no |

## 5 a 9

- **Estados:** C4. **Movimiento:** el contador cambia con opacidad (C5).
- **Accesibilidad:** cada destino es un botón con su nombre y su cuenta: «Activo, 1 ficha».
- **Íconos:** C2.

## 10 · Textos (para Shoko)

- **Nuevos:** «Entró:» y «Lo que vendió y lo que gastó» (como destino).
- **Ya publicados:** los nombres de las partes.
- **Los informes:** con los nombres del Aprender (§0).

## 11 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | Un solo toque sobre cuatro destinos; el puntaje sale de la llave compuesta | Indispensable |
| 2 | Contadores por destino y el renglón reservado | — |

---

<!-- P2 t1 7 articulacion -->

DISEÑO: P2 t1-la-articulacion — lo que llega se queda — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. Va con `../P2-T1-comun.md`. **Sin prototipo nuevo;** las medidas son de la réplica.

## 0 · Alcance y paradas

- **Sin paradas.** El id y `FLECHAS` (f1 a f5) no cambian.
- **El código cuida que con cuatro flechas dibujadas la quinta no se deduzca.** Lo respeto: **el hilo sigue siendo momentáneo**, pero ahora deja una marca en la línea a donde llegó.

## 1 · La idea

**El estudiante VE la cifra viajar por el hilo que él tendió y quedarse en la línea a donde llega. Eso explica que los tres informes se pasan cifras y que todas llegan al de lo que la empresa tiene y debe.**

## 2 · Qué cambia

- **Al responder la flecha** (origen y luego destino):
  - se dibuja el hilo **correcto**, de `desde` a `hasta`, se acierte o no (el registro). Si erró, su hilo queda como fantasma coral discontinuo;
  - los dos hilos se van a los 1.200 ms, como hoy.
- **Lo que queda:** en la línea de destino, una **marca de llegada**, un punto lleno de 8 px #F8F9FA al final de la línea.
  - **No dice de dónde vino,** así que no ayuda a descartar orígenes: es lo que el código protege.
  - **Sí deja ver, flecha a flecha, que todas las marcas caen en el mismo informe.** Esa es la regla de la actividad, y llega con lo que el estudiante hace, no antes.
- **Al final, las cinco juntas,** como hoy.
- **Veredicto:** C2. En el error, ✓ «Iba aquí: {línea de destino}».

## 3 · Medidas [fuente, réplica]

| | 320 | 375 |
|---|---|---|
| Primer control hoy, y palabras antes | 321,5 · 57 | 321,5 · 57 |
| Tras C1 | **[supuesto]** a menos de 280 · ⛔ **parada:** Kaede mide | — |

## 4 · Textos

Ninguno nuevo.

## 5 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | Hilo correcto también en el error, y el fantasma del elegido | Indispensable |
| 2 | La marca de llegada se queda; el hilo, no | Indispensable |

---

<!-- P2 t1 8 donde se rompio -->

DISEÑO: P2 t1-donde-se-rompio — el apagón también tras el error — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. Va con `../P2-T1-comun.md`. **Sin prototipo nuevo;** es la mejor de las 7 y casi todo se queda.

## 0 · Alcance y paradas

- **Sin paradas.** El id y `SITUACIONES_T1_8` no cambian.
- **La segunda decisión** («a cuántos puntos no va a llegar») tampoco cambia.

## 1 · La idea

**El estudiante VE apagarse, uno por uno, el punto roto y todos los que siguen, también cuando falla. Eso explica que un hecho que no pasa de un punto no llega a ningún informe ni a ninguna decisión.**

## 2 · Qué cambia

- **Hoy, en el error no corre nada.** Pasa a correr el flujo **desde el punto correcto**, se acierte o no (el registro):
  - el punto tocado por error queda con el fantasma coral;
  - el punto correcto lleva ✓ «Iba aquí: {n} {nombre}».
  - **Después, la pregunta de cuántos se apagan, igual que en el acierto.**
- **La marca // y los chips «apagado»** se quedan tal cual: el código ya separa bien las dos señales.
- **Veredicto:** C2.

## 3 · Medidas [fuente, réplica]

| | 320 | 375 |
|---|---|---|
| Primer control hoy, y palabras antes | 418,4 · 73 | 361,2 · 68 |
| Tras C1 | **[supuesto]** a menos de 280 · ⛔ **parada:** Kaede mide | — |

## 4 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | En el error, el flujo corre desde el punto correcto y luego viene la segunda decisión | Indispensable |

---

<!-- P2 h1 un dia o un ano -->

DISEÑO: P2 t1-un-dia-o-un-ano (H1, nuevo) — la línea del año — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. Va con `../P2-T1-comun.md`. **Prototipo:** `proto-t1-lote2.html?p=h1`, con `&e=1` para el error.

## 0 · Alcance y paradas

- **Sin paradas.** Es una pieza nueva y no toca nada publicado. El id lo sugiere Futaba; Kaede lo confirma.
- **El banco es de Futaba,** que lo escribe a la vez. El prototipo usa la q5 de `PREGUNTAS_P3` y la devolución D de `ERROR_P3`, que ya están publicadas.
- **Las tres respuestas** son las de `RESPUESTAS_P3`:
  - «La foto», que en pantalla dice «La foto del 31 de diciembre»;
  - «La película», que dice «La película: todo el año»;
  - «Hay que comparar las dos fotos», que dice «Comparar las dos fotos».
  - **ME FALTA de Futaba:** que confirme los rótulos cortos o deje los publicados.
- **Si el banco trae preguntas de un día que no sea el 31 de diciembre** (`foto: "enero"`), el rótulo de la foto sale de ese dato.

## 1 · La idea y Norman

**El estudiante VE encenderse la foto de un día, la franja de todo el año o las dos fotos con su llave, según lo que elija. Eso explica que un informe es de un día, el otro de un periodo, y que el cambio necesita dos fotos.**

- **Primer impacto:** una línea del año, con una foto en cada punta y la franja en medio.
- **Cómo se usa:** tocar una de las tres respuestas.
- **Lo que se lleva:** son tres preguntas distintas con tres escenas distintas (D4).

**Referencias:** la foto y la película de cu0-a3, y la línea del tiempo de su pantalla 6.

**Por qué no repite a T1-6 (D9):**
- T1-6 pone fichas *dentro* de los informes;
- H1 enciende *el tiempo* que mira cada pregunta.

## 2 · Estructura

1. Encabezado compacto (C1). **Objetivo nuevo (de Futaba o mío, para Shoko):** «Decide qué informe responde cada pregunta: un día, un año o el cambio entre dos días.»
2. La pregunta, en su tarjeta.
3. **El escenario,** que no cambia de alto (292 de alto):
   - la **línea del año**: 2 px #B8C4D4, entre dos marcos de foto de 52 × 52 con borde de 2 px y rótulo «foto»;
   - debajo, «1 de enero» a la izquierda y «31 de diciembre» a la derecha (Inter 12, #A8B6C8);
   - **la franja** (la película): de foto a foto, 16 de alto, rayada a 6 px;
   - **la llave** bajo la línea, de foto a foto: un corchete de 2 px que solo se ve encendido;
   - debajo, **las tres respuestas** (botones de 44 o más, Sora 13/600).
4. El veredicto (C2) y la devolución de `ERROR_P3` correspondiente: A, B, C1, C2 o D.

## 3 · Qué se enciende

| Respuesta | Escena (la de `ERROR_P3.escena`) |
|---|---|
| la foto | el marco del 31 de diciembre: 2 px #F8F9FA y relleno navy |
| la película | la franja: borde de 2 px #F8F9FA |
| comparar | los dos marcos y la llave |

- **Tras responder se enciende la escena correcta** (el registro).
- **Si erró,** lo elegido queda con el contorno coral discontinuo, como fantasma. Ejemplo del prototipo: eligió «la foto» en la q5; quedan encendidas las dos fotos con la llave, y la del 31 de diciembre lleva además el fantasma.
- **R10:** antes de responder no hay nada encendido.

## 4 · Medidas [fuente, prototipo]

| | 320 | 375 |
|---|---|---|
| La figura, desde la cima del Panel | **190,1** | **171,3** |
| La primera respuesta | 327,1 | 308,3 |
| Palabras antes de la figura | **34** | 34 |
| Escenario, vacío y respondido | 292 · 292 | 292 · 292 |
| Desplazamiento horizontal | no | no |

B1 pasa por la figura. Con la pregunta más larga del banco, la figura baja lo que crezca la tarjeta: ⛔ **parada:** Kaede mide con el texto más largo de Futaba.

## 5 a 9

- **Estados:** C4. **Movimiento:** la escena se enciende con opacidad (C5).
- **Accesibilidad:** la línea lleva `role="img"`, con un texto alternativo que dice qué está encendido: «Están encendidas las dos fotos, la del 1 de enero y la del 31 de diciembre».
- **Íconos:** C2.

## 10 · Textos (para Shoko)

- **Nuevos:** «foto», «1 de enero», «31 de diciembre», el objetivo y los tres rótulos cortos (§0).
- **Publicados:** `PREGUNTAS_P3` y `ERROR_P3`.

## 11 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | Tres escenas distintas, y se enciende la correcta tras responder | Indispensable |
| 2 | El fantasma de lo elegido | Indispensable |
| 3 | Medida con la pregunta más larga | Parada |

---

<!-- P2 h2 quien pregunta -->

DISEÑO: P2 t1-quien-pregunta-esto (H2, nuevo) — la mesa de los ocho lectores — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. Va con `../P2-T1-comun.md`. **Prototipo:** `proto-t1-lote2.html?p=h2`, con `&e=1` para el error.

## 0 · Alcance y paradas

- **Sin paradas.** Es una pieza nueva.
- **Los datos ya están publicados:** `USUARIOS` (I:153-194), con `nombre`, `proposito` (textual del libro, pp. 11-12) y `pregunta` (en palabras de la persona).
- **El banco con las parejas que se confunden y su porqué es de Futaba** (propietarios e inversionistas potenciales; acreedores y clientes). En el prototipo dice «[el porqué de la pareja, de Futaba]».
- **No repite a T1-1:**
  - T1-1 pregunta *desde dónde* (adentro o afuera);
  - H2 pregunta *quién*, a partir del *para qué*.
  - **Para que T1-1 no conteste a H2,** el anillo de T1-1 no nombra a los usuarios.

## 1 · La idea y Norman

**El estudiante VE el propósito llegar al asiento del lector que eligió, y junto a él la pregunta en palabras de ese lector y la del que de verdad era. Eso explica que los ocho leen el mismo informe para cosas distintas, y en qué se parecen los que se confunden.**

- **Primer impacto:** un informe y ocho asientos alrededor.
- **Cómo se usa:** tocar un asiento.
- **Lo que se lleva:** al terminar, cada asiento con su propósito.

**Referencia:** las pp. 11-12 del libro y la pantalla 14 de cu0-a1 («Ocho leen lo mismo»).

**Por qué no repite a cu0-a1 (D9):** en el Aprender los ocho van alrededor de un informe para *leer*. Aquí son **una mesa de dos columnas para decidir**, y cada asiento guarda lo que recibió.

## 2 · Estructura

1. Encabezado compacto (C1). **Objetivo nuevo (para Shoko):** «Lee para qué usa el informe cada persona y di quién es.» El contador es «Propósito n de 8».
2. **El propósito**, en su tarjeta: el texto del libro, con la primera letra en mayúscula y un punto final. En el banco empieza en minúscula; Kaede lo pone al pintarlo, sin tocar el dato.
3. **El escenario,** que no cambia de alto (421 a 320):
   - arriba, el **informe**: 84 × 44, borde de 2 px #B8C4D4 y la palabra «Informe»;
   - **la mesa:** dos columnas de cuatro asientos. Cada asiento es un botón de 44 o más, con el ícono User de lucide (18 px, trazo 2) y el `nombre` publicado completo, sin cortar: «El Estado y las autoridades fiscales» ocupa 3 renglones;
   - **un renglón reservado** de 124 de alto bajo la mesa, para las preguntas de los dos lectores tras responder.
4. El veredicto (C2) y el porqué de Futaba.

## 3 · Qué pasa al responder

- **El asiento correcto queda encendido** (2 px #F8F9FA, relleno navy). Si erró, el elegido queda con el fantasma coral.
- **En el renglón reservado van las dos preguntas**, en las palabras de cada lector (`pregunta`):
  - «Inversionistas potenciales: «¿Me conviene meter plata aquí? ¿Es riesgoso?»»;
  - «Propietarios o accionistas: «Puse plata en esta empresa. ¿Cuánto me está dejando?»».
  - En el acierto va solo la del correcto.
- **Cada asiento guarda una marca** con el número de propósitos que recibió, como en T1-6. Al final se ven los ocho.
- **R10:** antes de responder no hay ninguna pregunta en pantalla. Las preguntas en palabras del lector **son la pista**: van solo después.

## 4 · Medidas [fuente, prototipo]

| | 320 | 375 |
|---|---|---|
| La figura (el informe y la mesa), desde la cima del Panel | **211,9** | **191,6** |
| El primer asiento | 272,9 | 252,6 |
| Palabras antes de la figura | **36** | 36 |
| Escenario, vacío y respondido | 421 · 421 | 421 · 421 |
| Desplazamiento horizontal | no | no |

- **B1 pasa,** con el propósito de los inversionistas (17 palabras).
- **El propósito más largo es el de los clientes, con 23 palabras** [calculado: contadas en el `proposito` de `clientes`]. La figura baja con él: ⛔ **parada:** Kaede mide con ese texto.
- **El renglón de 124** cabe la pareja del prototipo. Con la pareja más larga, ⛔ **parada:** Kaede mide y me pasa el alto.

## 5 a 9

- **Estados:** C4.
- **Movimiento:** el propósito entra al asiento con opacidad y un `translateY` de 6, en 240 ms. Las preguntas, con opacidad (C5).
- **Accesibilidad:** la mesa es un grupo con `aria-label` «Los ocho lectores». Cada asiento se lee como «{nombre}, {n} propósitos».
- **Íconos:** User de lucide en los ocho asientos. Son iguales a propósito: si cada lector tuviera su ícono, el ícono daría la respuesta. Más C2.

## 10 · Textos (para Shoko)

- **Nuevos:** «Informe», «Propósito n de 8», el objetivo y «Los ocho lectores».
- **Publicados:** `nombre`, `proposito` y `pregunta`.
- **ME FALTA de Futaba:** los porqués de las parejas.

## 11 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | Las preguntas de los lectores solo tras responder | Indispensable (R10) |
| 2 | El escenario reserva su alto; los asientos con borde de 2 transparente en reposo | Indispensable |
| 3 | Medidas con el propósito y la pareja más largos | Parada |
