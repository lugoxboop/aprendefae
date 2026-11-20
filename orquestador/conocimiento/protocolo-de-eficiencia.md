# Protocolo de eficiencia

Orden de Mateo del 18 de octubre de 2026, vía Miku. Bajamos el gasto sin bajar
la calidad. El cupo semanal de tokens es el recurso escaso: se gasta en
construir y en verificar, no en moverse de un sitio a otro.

## a) Los encargos de código viajan por el repo

Un encargo a un agente de código se escribe en un **issue o un PR** con la
etiqueta de su célula, y el agente contesta ahí mismo. Sin Chrome, sin pasar
por un chat. El repo ya guarda el historial, así que el encargo y su respuesta
quedan donde los va a buscar el siguiente, en vez de en una pestaña que alguien
tiene que volver a abrir.

## b) A los agentes de chat, UN mensaje por lote

Diseño, pedagógico y auditoría viven en chats. Se les manda **un solo mensaje
con todo el lote adentro**, no un mensaje por pieza: cada turno extra vuelve a
cargar el contexto entero y eso se paga. Su entrega va a **un archivo del repo
o al PR** siempre que se pueda; lo que solo existe en un chat hay que volver a
pedirlo.

## c) Capturas, solo en la verificación final

Una captura cuesta mucho y durante el trabajo no decide nada: para eso están
las sondas, que miden y devuelven números. Las capturas las toma **el auditor,
al final**, cuando lo que se comprueba es que lo terminado se ve bien.

## d) Informes de una línea, detalle al PR

Al general, una línea: terminado o qué falta. El razonamiento, las mediciones y
lo que se decidió por el camino van **en el cuerpo del PR**, que es donde
sirven y donde no se vuelven a pagar al releerlos.

## e) Nada de esperar ni de vigilar sin encargo

No se cierra un turno para esperar a otro. Mientras un agente trabaja, el
general avanza en otra cosa. Y nadie se queda de vigilante sin un encargo
concreto: un turno que solo dice «sigo» gasta lo mismo que uno que entrega.

## f) Un chat largo se traspasa

Cuando un chat se vuelve largo o lento, el general **escribe su traspaso** en
`orquestador/traspasos/` y sigue en un chat nuevo. Arrastrar un chat pesado
hace que cada turno cueste más que el anterior, y el traspaso cuesta una vez.

## g) El Kit y el auditor no se tocan

Esto no se negocia. El nivel lo sigue dando el auditor con el Kit en la mano, y
el nivel sigue siendo el **mínimo** de sus dimensiones, no el promedio. Todo lo
de arriba es para gastar menos en movernos; nada de eso es permiso para
verificar menos. Un verde que nadie midió no ahorra: cuesta el doble cuando
alguien lo descubre.

## h) El estado vive en el repo, no en el chat

Orden de Mateo del 23 de octubre de 2026, vía Miku. Miku ya no supervisa
leyendo chats con Chrome: lee el repo.

- Cada general mantiene `orquestador/estado/<su-nombre>.md`: en la primera
  línea, la fecha y hora de la última actualización; luego **una línea por
  encargo**: `terminado`, `en curso` o `bloqueado: <por qué>`.
- Lo actualiza **al cerrar cada lote y en el momento en que algo se bloquea**,
  con un commit corto directo a main (solo ese archivo).
- Si necesita una decisión de Mateo, la primera línea del cuerpo dice
  `BLOQUEADO-MATEO: <la pregunta en una frase>`. Miku la lleva.
- Si necesita algo de Miku o de otra célula, abre un issue con la etiqueta
  `miku`. Nadie escribe en el chat de otro general.
- Miku solo abre un chat con Chrome cuando el estado lleva horas sin moverse
  sin estar terminado (señal de que el general se detuvo) o cuando Mateo pide
  algo nuevo.

## i) Buscar antes de abrir, y cargar solo lo propio

Orden de Mateo del 23 de octubre de 2026, vía Miku. El canon pesa 772.000
tokens: 95.000 de núcleo y 677.000 de material. Lo que un agente mete en su
contexto no se paga una vez, se vuelve a leer en cada turno que siga, así que
un archivo abierto de más a las nueve de la mañana se sigue pagando a las seis
de la tarde.

- **Busca, no abras.** `node scripts/canon.mjs "D4"` devuelve el fragmento con
  su contexto; `--mapa` dice qué hay y cuánto pesa; `--todo` incluye los
  paquetes, las fichas y los registros, que quedan fuera por defecto. Ver qué
  dice D4 pasa de 12.755 tokens a unas decenas. **Abre un archivo entero solo
  cuando vayas a editarlo**, o cuando la búsqueda no encuentre lo que buscas.
- **Tu prompt maestro es una skill y se carga sola.** `celula-diseno`,
  `celula-pedagogico`, `celula-auditoria` y `celula-construccion` traen lo que
  siempre aplica en unos 760 tokens, con el prompt maestro completo a un paso
  para cuando de verdad haga falta. No se pegan en el chat: pegarlos enteros
  cuesta 18.277 tokens que luego se releen turno tras turno.
- **`CLAUDE.md` se carga solo** en toda sesión del repo y dice dónde está cada
  cosa. Por eso se mantiene corto: lo paga cada sesión, en cada turno.
- Para que un agente vea las skills, su clon tiene que estar al día (`git pull`)
  y registrado como raíz del repo.

Lo que **no** ahorra, y conviene no intentar: escribir en estilo telegrama,
abreviar o quitar palabras. Las palabras cortadas se parten en más pedazos, no
en menos, y encima hay que gastar en descifrarlas. Lo que se ahorra no es cómo
se dice: es cuánto se carga.

## j) Una sola pasada: lo que llega se exprime la primera vez

Orden de Mateo del 24 de octubre de 2026, vía Miku. Lo que más gasta no es
abrir un material pesado: es **volver a abrirlo**. Un capítulo del libro, una
ficha, una entrega o una auditoría se leen **una vez, de pies a cabeza**, y en
esa misma pasada se saca todo lo que va a hacer falta.

- **Exprime en la primera lectura.** No solo lo que necesitas hoy: también lo
  que vas a necesitar después, las cifras con su página, las citas, y **lo que
  falta**. Si al leer el capítulo 1 ves que te faltan páginas del capítulo 2,
  eso se anota ahí mismo, en esa lectura. No se deja para una segunda vuelta.
- **Déjalo escrito en el repo**, en el canon o en tu ficha. Lo que solo vive en
  un chat hay que volver a pedirlo cuando ese chat se traspase, y pedirlo dos
  veces gasta el tiempo de Mateo, que es más escaso que los tokens.
- **No mandes a nadie a «revisar si…».** Esa frase obliga a releer el material
  entero para contestar algo que debió salir de la primera pasada. Si hace
  falta saberlo, se sabe porque está anotado.
- **Volver a abrirlo es la excepción**, no el procedimiento: solo cuando lo
  anotado no alcanza y la decisión no se puede tomar sin ello.

Vale igual para los materiales de Mateo que para las entregas entre agentes: el
que recibe exprime, anota y decide. El que entrega escribe para que el otro no
tenga que volver a la fuente.

## k) Primero el índice, luego el buscador, y solo al final el archivo

Orden de Mateo del 14 de noviembre de 2026, vía Miku. Los agentes estaban
releyendo archivos enteros para encontrar algo que el índice ya ubica.

- `orquestador/INDICE.md` es el mapa de TODO el canon: una línea por archivo o
  carpeta, con qué contiene y cuándo leerlo. **Es la primera parada.**
- El orden es: **índice → buscador (`node scripts/canon.mjs "<término>"`) →
  abrir el archivo**, y abrirlo solo si vas a editarlo o si la búsqueda no
  encontró lo que buscabas.
- **Quien cree, mueva o renombre un documento actualiza su línea en el índice en
  el mismo cambio.** Un índice desactualizado manda a leer de más, que es justo
  lo que evita.

## l) Cada agente lleva su bitácora, y la lee antes de empezar

Orden de Mateo del 14 de noviembre de 2026, vía Miku. Los agentes perdían el
hilo entre chats y lo reconstruían releyendo, o preguntándole a Mateo.

- Cada agente tiene `orquestador/memoria/<su-nombre>.md`, corta (máximo ~60
  líneas), con esta estructura fija: **Quién soy y mi alcance** (3 líneas) ·
  **En qué estoy ahora** · **Decisiones tomadas y por qué** (con fecha) ·
  **Pendientes** · **Lo que aprendí que no hay que repetir** (errores ya vividos).
- **Al empezar cualquier chat, el agente lee su bitácora antes de hacer nada; al
  cerrar un bloque de trabajo, la actualiza.** Al traspasarse a un chat nuevo, lo
  primero es leerla.
- Lo viejo se condensa: si pasa de ~60 líneas, se resume y lo histórico va a
  `orquestador/memoria/archivo/<agente>-AAAA-MM.md`.
- Hora real de Bogotá en cada entrada:
  `TZ=America/Bogota date "+%Y-%m-%d %H:%M"`.

## m) Ingeniería de contexto: lo que no hace falta, no entra al chat

Orden de Mateo del 15 de noviembre de 2026, vía Miku y Erwin. Siguiendo lo que
Anthropic publica sobre ingeniería de contexto: lo que más gasta no es pensar,
es cargar al contexto cosas que no hacían falta. Cada archivo, captura,
resultado largo o herramienta conectada que entra se vuelve a pagar en cada
mensaje que sigue.

1. **Lo pesado lo hace un subagente.** Buscar en el repositorio, leer
   documentos largos, revisar muchos archivos o investigar se delega a un
   subagente que trabaja en su propio contexto y devuelve solo un resumen corto
   (máximo ~15 líneas). Su lectura no ensucia el chat principal.
2. **Texto, no capturas.** En Claude in Chrome, leer la página como texto
   (leer página / extraer texto) en vez de capturar. Las capturas, solo para
   verificar algo visual ya terminado (diseño, animación, que no se vea roto).
3. **Un tema por chat, y chats cortos.** Al terminar una tarea: actualizar la
   bitácora y empezar limpio (chat nuevo dentro del espacio, o contexto limpio),
   no arrastrar lo anterior. Un chat que se alarga se compacta o se traspasa con
   la bitácora al día.
4. **El modelo justo.** Haiku para lo mecánico (mover, renombrar, revisar
   formato, resumir); Sonnet por defecto; Opus solo para decisiones difíciles o
   caras de deshacer. Los subagentes de búsqueda y lectura, en Haiku.
5. **Índice → buscador → archivo.** Nunca abrir un archivo entero si basta un
   fragmento. Primero el índice del canon, luego el buscador del canon o el mapa
   del código, y abrir solo las líneas que hagan falta (refuerza las reglas i y k).
6. **Resultados de comandos recortados.** Pruebas, compilaciones y registros en
   modo silencioso o mostrando solo el final y los errores. Nunca volcar al chat
   un registro o un archivo completo.
7. **Solo las herramientas que se usan.** Cada conector y cada skill ocupa
   espacio en cada mensaje. Desconectar o dejar en carga diferida lo que no se
   usó en la última semana; mantener corto el archivo que se carga en cada
   sesión, con el detalle en skills que cargan bajo demanda.
8. **Respuestas cortas entre agentes.** Entre generales y hacia Mateo: resultado
   + lo que falta, sin repetir lo que el otro ya sabe ni narrar los pasos. El
   detalle va al repositorio (refuerza las reglas b y d).
9. **Leer una vez, extraer todo.** Lo que llega (capítulo, auditoría, entrega)
   se lee una sola vez, se extrae todo lo útil al repositorio y no se vuelve a
   abrir (regla j, ya vigente).
10. **Lo automático, con memoria barata.** En todo lo que corre por la API
    (Bruno, Fermi, arreglo automático, turno de noche): activar el
    almacenamiento en caché del prompt para las instrucciones y el material
    fijo, que se cobra mucho más barato cuando se repite, y usar el modelo más
    económico que haga bien la tarea.

**Medir.** Cada sesión de código mira su gasto con el comando de costo de la
sesión o con `ccusage` (resumen por día y por sesión). Línea base tomada el
15-nov-2026 sobre una tarea típica (p. ej. «corregir una actividad» o «revisar
el estado de las células»). En una semana se compara el gasto por tarea y se
reporta en una línea cuánto bajó y qué regla ayudó más.

## n) Guía web moderna antes de tocar la interfaz (Modern Web Guidance)

Orden de Mateo del 20 de noviembre de 2026. Instalamos el complemento oficial de
Google Chrome **Modern Web Guidance** (`GoogleChrome/modern-web-guidance`), que
trae datos de compatibilidad **Baseline** en tiempo real sobre qué funciona en
casi todos los navegadores y celulares. Los estudiantes entran desde teléfonos de
todo tipo, así que la compatibilidad no es opcional.

- **Antes de construir o corregir** animaciones, transiciones, ventanas
  emergentes (diálogos/popovers), formularios, accesibilidad, rendimiento en
  celular o inicio de sesión, **consulta primero la guía y síguela.** No es un
  paso opcional: es la fuente de qué técnica usar.
- **Objetivo de compatibilidad: «Widely available»** (Baseline ampliamente
  disponible). Si algo solo es «Newly available» o más nuevo, se usa solo con un
  respaldo que funcione en los navegadores viejos.
- **Nada experimental:** no se activan funciones de Origin Trial ni de un solo
  motor todavía inestables (el complemento las oculta por defecto; se deja así).
- Vale para todos los agentes de **código y diseño**. La guía se mantiene sola
  (actualizaciones automáticas activadas).
