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
