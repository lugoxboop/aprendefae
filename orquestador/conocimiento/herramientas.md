---
id: herramientas
titulo: Las herramientas de la casa
procedencia: registro
---

# Las herramientas de la casa

**Una medida solo es comparable si todos la toman con la misma herramienta.**
Este archivo dice cuál es la oficial de cada cosa, y qué se hace mientras no
exista.

## Legibilidad — INFLESZ

**Oficial: el módulo del repositorio, `src/herramientas/inflesz.js`**, de Sai.
Escala de Szigriszt-Pazos, fijada en el Kit, dimensión D13: mínimo **65** en
todo texto de **10 palabras o más**.

Fórmula: 206,835 − 62,3 × (sílabas / palabras) − (palabras / frases).

**Sustituye a la calculadora del auditor**, que tenía un fallo: no reconocía la
«Ḡ» como letra y la saltaba sin avisar, lo que dio tres números publicados más
bajos de lo que correspondía. El auditor lo comprobó y lo asumió. De ahí sale
la regla que ahora lleva la herramienta: **si encuentra un carácter de letra
que no sabe contar, lo reporta; nunca lo salta en silencio.**

Convenciones que van escritas en la cabecera del módulo, porque cambiarlas sin
saberlo invalida todos los números históricos:

- Cada **cifra** cuenta como una palabra de tres sílabas, y el separador de
  miles no la parte.
- Las **variables** (T, TR, i, b, tc, Y, Ḡ…) cuentan como una palabra de una
  sílaba.
- El texto se **normaliza** antes de contar: la «Ḡ» escrita como un solo
  carácter y como «G» más una raya combinada tienen que dar el mismo resultado.

**Mientras una herramienta oficial no exista**, quien mida lo marca como
**estimación con su nombre** y la cifra oficial queda **«no medida»**. Un
número inventado es peor que ninguno. Eso lo decide cada general en su célula,
sin pedir permiso.

## Medidas de pantalla

**No hay herramienta oficial todavía, y eso es una deuda.**

Una cifra medida **dice dónde y con qué se midió**, y son cuatro datos, no uno:

1. el ancho de la caja: si es la caja completa o el del contenido, sin el
   relleno;
2. en qué pantalla: producción o local, y con qué navegador;
3. cómo se fijaron los 320 y los 375 px;
4. si la fuente ya estaba cargada cuando se midió.

Si no están los cuatro, **es una estimación y se entrega como tal**. Una cifra
sin procedencia que viaja de un documento a otro acaba usándose como medida, y
ya pasó: el ancho de 258 px llegó a dos paquetes de construcción sin que nadie
supiera de dónde salía.

## La revisión a 320 px, y cómo se hace de verdad

**El 15 de octubre de 2026 Mateo pidió a las cinco células revisar lo
publicado jugándolo en la página real, a 320 y 375 px.** Al intentarlo, el
coordinador se topó con dos cosas que conviene no volver a descubrir.

**La extensión del navegador dice que redimensiona y no redimensiona.** La
llamada responde «Successfully resized to 320x780» y `window.innerWidth`
sigue devolviendo 1366. Una revisión hecha así no es una revisión a 320 px:
es una revisión a 1366 px con un informe que miente. **Compruébalo siempre
leyendo `window.innerWidth` antes de mirar nada.**

**Lo que sí funciona:** servir el sitio en local y abrirlo con un navegador
que obedezca el ancho.

```
VITE_SUPABASE_URL=https://ejemplo.supabase.co \
VITE_SUPABASE_ANON_KEY=clave-de-mentira \
VITE_GOOGLE_CLIENT_ID=000.apps.googleusercontent.com npx vite build
cd dist && python3 -m http.server 8099
```

y luego Playwright (`/opt/npm-tools/node_modules/playwright-core`, con
`executablePath: '/opt/pw-browsers/chromium'`) con
`viewport: { width: 320, height: 820 }`. Las claves de mentira bastan: lo que
se revisa es la pantalla, no el servidor. Además, midiendo en código se
detecta de una vez lo que el ojo no ve: comparar `scrollWidth` con
`clientWidth` y recorrer los elementos cuyo borde derecho se sale, que es el
desbordamiento horizontal que a simple vista solo se nota si uno arrastra.

**Dos trampas de esa medición**, las dos aprendidas en la primera pasada:

- Los `fae-mesh-blob` del fondo se salen del ancho **a propósito**: son el
  degradado decorativo. Hay que excluirlos o todo sale «roto».
- El camino de un tema con una sola actividad mide 232 unidades de alto
  (`CaminoHacer`, la línea del `alto`), así que el vacío que se ve en esos
  temas **no es el camino**: es la vista alrededor. Atribuirlo al camino
  manda a arreglar el sitio equivocado.

### La regla que salió de la primera pasada: el título del tema se corta

A 320 px, el encabezado de cada tema corta su propio nombre: «Repaso del
capítul…», «Inventarios III: des…». El `h1` vive en una fila flex junto al
botón de volver y **no tiene permiso para romper en dos líneas**. Se comprobó
en las seis vistas de tema que existen y ninguna lo tiene.

El nombre del tema es la principal señal de orientación de esa pantalla.
Cortado, un estudiante en un teléfono estrecho no sabe dónde está.

**La regla: un título puede encogerse o romper en dos líneas, pero no
desaparecer.** En una fila flex, el elemento que lleva texto necesita
`minWidth: 0` para poder encogerse, y hay que dejarle romper.

**Y ya está arreglado en un solo sitio: `src/components/auth/AccountControl.jsx`**,
en la regla de `.fae-cabecera-titulo > h1`, que deja romper de renglón y
recorta con `-webkit-line-clamp` para todas las vistas de tema.

**El tope son cuatro renglones, y el número salió de medir, no de elegirlo.**
A 320 px al título le quedan 164 px —el resto son el botón de volver y la
reserva de la pastilla—. Medido sobre el paquete construido, con los diez
temas de Contabilidad: ocho entran en uno o dos renglones, y «Inventarios III:
descuentos, inventario físico y NIC 2» pide cuatro a 320 px, tres a 360 y dos
a 375. Con el tope en dos, ese título perdía sus últimas palabras **sin poner
puntos suspensivos**: el recorte por renglones no avisa, y el estudiante no
sabe que falta algo. El tope recorta pero no reserva, así que los otros nueve
siguen ocupando lo que ocupaban.

**Si entra un título más largo, hay que volver a medir.** Esto no se deduce del
CSS ni del número de caracteres.

Esto decía «cada célula lo arregla en la vista de su tema», y eso fue verdad
dos días. El resultado: **siete vistas con el mismo arreglo en línea** —T4, T5,
T6, las tres de T7 y el repaso del capítulo 5—, **tres pruebas de tres células
distintas** vigilando que los rodeos siguieran puestos, y las vistas que nadie
había tocado cortando igual. Siete copias de un arreglo son siete sitios donde
se puede olvidar la octava.

**La lección, que vale para cualquier defecto y no solo para este: cuando la
misma corrección aparece en la tercera vista, el defecto no está en las
vistas.** La tercera copia es la señal; a la séptima ya hay que desmontar
pruebas.

Dos consecuencias para quien venga:

- **No pongas en línea nada que decida cómo cede el título.** Los estilos en
  línea ganan a la hoja, así que un `overflow: "visible"` suelto anula el
  recorte compartido sin que se note en ninguna pantalla hasta que un título
  largo empuje la pantalla entera. `titulo-tema-320.test.mjs` lo vigila en las
  cuatro vistas de C y `t4-andamio.test.mjs` en la de D. La tipografía sí es de
  la vista.
- **Una prueba que exige el rodeo caduca con el rodeo.** Las tres que había
  —`titulo-tema-320.test.mjs` (C), `t4-andamio.test.mjs` (D) y
  `r5-1-repaso-cruzado.test.mjs` (E)— afirmaban «la hoja compartida sigue
  truncando, por eso cada vista la anula», así que arreglar la hoja las ponía
  en rojo **pidiendo que se devolviera el defecto**. Se reapuntaron: ahora
  exigen el recorte en la hoja y la AUSENCIA de estilos en línea que lo venzan.
  Lo que defienden es lo mismo; de lo que cuelgan, no.

  Y la señal para reconocerlo: **si una prueba se pone roja al arreglar algo, y
  su mensaje describe el arreglo, la prueba estaba vigilando el parche y no el
  defecto.** Las tres lo decían en voz alta —«por eso cada vista la anula»,
  «revisar si esta excepción sigue haciendo falta»—. Leer el mensaje antes de
  tocar el código ahorra el paso de creer que se rompió algo.

## Verificación contra lo publicado

- **El texto** se lee del **paquete desplegado**, no del repositorio: es lo que
  ve el estudiante.
- **El comportamiento** se **juega**: se abre la actividad, se falla un ítem a
  propósito y se mira qué queda en pantalla.

## Pruebas

**Ninguna prueba se da por buena sin demostrar que puede fallar.** Mutación: se
rompe el código a propósito y se comprueba que la prueba lo caza.

Una prueba marcada `todo` es **deuda conocida**, no una regresión. Se reporta
como «not ok … # TODO» y no se arregla desde fuera del equipo que la debe.

## Lo que las pruebas NO pueden ver

La suite compara el cliente contra los **archivos** de migración. Nunca contra
la base de datos. De ahí salen dos puntos ciegos, y los dos ya costaron:

**1. Una migración escrita y nunca corrida es invisible.** El 14 de octubre de
2026 había **trece actividades publicadas y jugables** sin fila en el catálogo
de producción: las dos de la 0052 y las once del bloque 0045-0051. Las siete
migraciones estaban escritas, correctas y en `main`. La prueba «toda actividad
que da FP está en el catálogo del servidor» las encontraba todas —en los
archivos— y salía en verde. Un estudiante que jugara cualquiera de las trece
veía su porcentaje y no recibía un solo FP. Nada falló, nada se puso rojo, y
llevaba semanas así.

Lo único que caza eso es preguntarle **a la base**, no al repositorio. La
consulta que lo midió, y que vale repetir después de cada despliegue:

```sql
with cliente(id) as (values ('…'),('…'))   -- los ids de Hacer del cliente
select count(*) from cliente c
left join public.actividad_catalogo k on k.activity_id = c.id
where k.activity_id is null;               -- tiene que dar 0
```

Y para comprobar que el servidor paga lo MISMO que la pantalla promete, sin
leer 80 filas a ojo: se construye `activity_id|modalidad|dificultad|fp_base`
ordenado en los dos lados y se comparan los dos `md5`. Si coinciden, coinciden
las ochenta.

**2. La llave pública NO sirve para esa sonda, y falla de la peor manera.**
`actividad_catalogo` tiene RLS: con la llave anónima, PostgREST responde
**HTTP 200 con `[]`**. No un error —éxito con cero filas—. Una sonda escrita
encima de eso diría «no falta ninguna» para siempre, sin haber mirado nada:
sería peor que no tenerla, porque daría confianza.

Para que la sonda exista hay que decidir CÓMO lee el catálogo, y eso lo decide
Mateo: una política que permita `select` anónimo —no filtra nada, el cliente ya
trae todos los ids y sus FP en el paquete—, una función `security definer` que
reciba la lista y devuelva las que falten, o una llave privilegiada en los
secretos del flujo. Mientras no esté, **la comprobación se hace a mano después
de cada despliegue** con la consulta de arriba.

**La regla que queda:** una prueba verde sobre archivos no dice nada del estado
de producción. Lo que no se le pregunta a la base, no se sabe.

## Un repertorio a medias se lee como verde: espera la línea `# fail`

Hermano de los dos de abajo, y me pasó **dos veces el mismo día**.

Lancé `npm test` en segundo plano y fui leyendo el archivo de salida mientras
corría. Lo que vi:

```
ok: 735    not ok: 0        → «verde»
ok: 1527   not ok: 3        → «solo los TODO conocidos»
ok: 2032   not ok: 4
# tests 2670 · # pass 2664 · # fail 0 · # todo 4   ← lo único que valía
```

Las tres primeras lecturas estaban hechas **a mitad de la corrida**, y las tres
se leían como un resultado. La primera habría dado por buena una rama con 1.935
pruebas sin ejecutar. Lo peor: `grep -c "not ok"` da 0 cuando todavía no ha
llegado al archivo que falla, y 0 rojos parece la mejor noticia posible.

**La regla: el repertorio no ha terminado hasta que imprime `# fail`.** Hasta
esa línea no hay resultado, hay un archivo creciendo. Contar `ok` no sirve
—2.670 no se sabe de antemano—, y «el proceso ya no está» tampoco: con dos
corridas a la vez es fácil vigilar el pid de la otra.

Esperar bien, y de paso no inventarse el total:

```bash
F=salida.txt
for i in $(seq 1 30); do grep -qE "^# fail" $F && break; read -t 20 _ < /dev/zero; done
grep -E "^# (tests|pass|fail|todo)" $F || echo "(aún sin resumen: NO es verde)"
```

El `|| echo` no es adorno: sin él, un `grep` que no encuentra nada imprime nada,
y «nada» se lee como «sin fallos». Es el falso verde de abajo otra vez, con otro
disfraz.

## Una prueba que lee un archivo como texto no lo compila

El 15 de octubre añadí un comentario dentro de la plantilla de CSS de
`AccountControl.jsx` y usé comillas invertidas para citar una propiedad. Una
comilla invertida **cierra la plantilla**: el archivo quedó roto. Corrí la
prueba que vigila justo esa regla y salió **verde, 8 de 8**.

Verde porque esa prueba hace `leer("src/components/auth/AccountControl.jsx")` y
busca con una expresión regular. Para ella el archivo es texto, y un texto roto
es un texto. Nadie lo importó, así que nadie lo compiló. Lo cazó `npm run build`
diez minutos después:

```
ERROR: Expected ";" but found "overflow"
```

Dos reglas de aquí:

- **Comprobar un archivo por su texto no dice que el archivo sea válido.** Tres
  pruebas de tres células vigilan esa hoja compartida leyéndola como texto, y
  ninguna la compila. Lo que valida la sintaxis es la compilación.
- **Antes de empujar un cambio en una plantilla de CSS, compila.** El repertorio
  en verde no basta, y es exactamente el caso en que menos lo parece: la prueba
  del archivo que rompiste es la que te dice que está bien.

Y la trampa de fondo, que ya estaba escrita en este canon dos horas antes de que
yo volviera a caer: **nada de comillas invertidas dentro de una plantilla de
CSS**, ni en el código ni en los comentarios. Escribir la regla no inmuniza
contra ella; compilar, sí.

**Caí una tercera vez, en el mismo archivo, media hora después de escribir esto.**
Así que la regla dejó de ser una regla y pasó a ser una prueba:
`src/__tests__/todo-compila.test.mjs` pasa todo `src/` por esbuild —sin ejecutar
nada— y se pone roja con cualquier error de sintaxis. Tarda dos segundos y corre
en cada `npm test`, que es lo que de verdad se corre.

La prueba de la diferencia, con la hoja compartida roto a propósito:

| qué se corrió | con el archivo roto |
|---|---|
| `titulo-tema-320.test.mjs`, que LEE esa hoja | `pass 6 · fail 0` |
| `todo-compila.test.mjs` | `fail 1` |

**Cuando uno cae tres veces en la misma trampa, la trampa no se arregla
escribiéndola mejor.** Se arregla con algo que no dependa de acordarse.

(Y escribiendo esa prueba caí en la hermana del mismo error: un comentario de
CSS de ejemplo, con su cierre de bloque, dentro del comentario de cabecera.
Cerró el comentario. El archivo de la prueba que comprueba que todo compila no
compilaba.)

## El falso verde: un extractor que no extrae nada dice que todo está bien

Hermano del resultado vacío, y más peligroso, porque sale **en verde**.

El 15 de octubre quise saber cuáles de los 18 PR abiertos esperaban una
migración mía. Escribí un cruce rápido: sacar los `activity_id` de cada archivo
con `grep` y mirar si estaban en el servidor. Salió esto:

```
#190  feat/conta-d4-h8    ✅ CORRIDA
```

Era mentira. La 0207 **no** estaba corrida. El `grep` no extrajo ningún id de
ese archivo, la lista de faltantes quedó vacía, y «no falta nada» se imprimió
como «todo bien». Si lo mando así, la Célula D fusiona una actividad de 90 FP
cuyo estudiante habría cobrado 22023.

Lo arreglé, y el arreglo falló al revés: un patrón más ancho se tragó
`contabilidad`, `evaluativa`, `facil` —todos los literales de la fila— y
entonces **todo** salía en rojo. Un cruce que marca los 18 PR es tan inútil
como uno que no marca ninguno; los dos hacen que lo apagues.

**Las dos reglas que salen de ahí:**

1. **«No encontré nada» y «comprobé que no falta nada» son estados distintos y
   se imprimen distinto.** Si el extractor devuelve cero elementos, la salida
   dice `NO EXTRAJE NADA (revisar a mano)`, nunca un visto bueno. Un resumen
   que no puede decir *cuántas* cosas miró no está diciendo nada.
2. **Ya existe un parser probado: úsalo.** `filasDeCatalogo`, de
   `scripts/guardian-migraciones.mjs`, hace exactamente esto y está comprobado
   con mutaciones. Lo correcto no era afinar mi `grep` por tercera vez, era
   importar el que ya pasó por pruebas:

```js
import { filasDeCatalogo } from "./scripts/guardian-migraciones.mjs";
for (const f of filasDeCatalogo(sql)) {
  console.log(servidor.has(f.activity_id) ? "EN_SERVIDOR" : "FALTA", f.activity_id);
}
```

Con el parser bueno el cruce dio la verdad a la primera: de 18 PR, dos
esperaban migración —la 0207 y la 0113— y las dieciséis restantes ya estaban.

**Y lo que no hay que aprender de esto:** que los scripts rápidos sean malos.
El cruce de 18 PR en un comando es lo que destrabó la noche. Lo que no puede
pasar es que un script rápido **informe** como si fuera una comprobación.

---

## Una pestaña cerrada no prueba que el otro no esté trabajando

Misma familia que la lista de chats incompleta de `celulas.md`, en otra
superficie. A media noche mi navegador tenía **una** pestaña: el editor SQL.
Las de los cuatro generales no estaban. La lectura fácil —«se cayeron las
células, hay que avisar a Mateo»— era falsa.

Lo que sí probaba su estado estaba en el repositorio:

```
git for-each-ref --sort=-committerdate --format='%(committerdate:relative)|%(refname:short)' refs/remotes/origin | head
```

Habían empujado hace 2, 5, 7 y 8 minutos. Los cuatro vivos y trabajando.

**La regla: antes de reportar que una célula se cayó, mira sus ramas y sus
comentarios.** Las pestañas son mi vista, no su existencia. Y el canal que
sobrevive a que se cierre un navegador es el que ellos ya usan entre sí: **un
comentario en su propio PR**, que queda escrito y no depende de que yo tenga
una ventana abierta.

## Cómo se le manda un mensaje a otro agente, y la trampa de darlo por enviado

El chat de otro agente se abre por su enlace (están todos en `celulas.md`) y
el mensaje se escribe así:

```js
const el = document.querySelector('div[contenteditable="true"]');
el.focus();
const sel = window.getSelection(); const r = document.createRange();
r.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(r);
document.execCommand('insertText', false, texto);
```

**Y el clic de enviar va en OTRA ejecución, no en la misma.** Esto cuesta un
mensaje perdido la primera vez que pasa:

```js
// segunda llamada, aparte
document.querySelector('button[aria-label="Enviar mensaje"]').click();
```

Metido junto al `insertText`, el clic sale antes de que la página registre lo
escrito y **no envía nada**. Lo peor es que parece que sí: el texto está en la
pantalla —en el cuadro de escritura— y una comprobación que solo busque el
texto en la página lo da por entregado.

**Así que se comprueba con las dos condiciones, no con una:**

1. el cuadro de escritura quedó **vacío**, y
2. el texto aparece en la conversación.

Si el cuadro sigue lleno, no se envió, por mucho que el texto se vea. El 15 de
octubre un mensaje a Xeno dio «llegó: true» estando entero sin mandar.

**Dos avisos más del mismo sitio:**

- Los acentos graves dentro de una plantilla de JavaScript rompen la llamada.
  Si el mensaje lleva código, va sin ellos o por otra vía.
- Un nombre que se ve idéntico puede no serlo: comparar con `===` los títulos
  de la lista de chats devolvió cero coincidencias sobre nombres que se leían
  exactamente iguales. Hay caracteres invisibles de por medio; se busca por
  `indexOf` o se lee la lista entera y se filtra a ojo.

## Un comentario que dice «esto ya está cubierto» no es una comprobación

Lo destapó Xeno el 15 de octubre, y es la lección más general de esa noche.

`ActivityBadge.jsx` llevaba escrito, desde hacía meses:

> «Teal para Aprender y coral para Hacer: (…) además **difieren en relleno y
> borde** para que la distinción no dependa solo del color.»

Suena a que alguien ya pensó en el daltonismo y lo resolvió. Xeno fue a
mirarlo en gris: **tinte del 14 % contra 16 %, borde del 55 % contra 62 %.**
Las dos insignias salen idénticas. Lo único que de verdad las separaba era la
palabra.

El comentario no mentía por mala fe: describía una intención que el código
nunca llegó a cumplir, o que se diluyó en un ajuste posterior. Y mientras
estuvo ahí **impidió que alguien lo revisara**, porque quien lo leía ya tenía
su respuesta.

**La regla: un comentario describe una intención; solo una prueba o una
medición describe un hecho.** Cuando un comentario afirme que algo está
cubierto —que un contraste basta, que un texto cabe, que una distinción no
depende del color—, trátalo como una hipótesis sin comprobar, no como una
comprobación hecha. Y si lo compruebas, deja la prueba, no otro comentario.

**No es un caso aislado.** La misma noche:

- Un medidor cuya cabecera explicaba cómo evitaba los falsos positivos
  declaró 25 defectos inventados en el índice, porque medía solo lo que cabía
  en pantalla.
- Yo arreglé `DEBE`/`HABER` en `AsientoEnLineas` y escribí por qué importaba
  —y dejé las columnas de la cuenta T, que dicen lo mismo, a 10,5 px. El
  comentario era correcto; la cobertura, no. **Quien lo leyera después habría
  creído que el asunto estaba cerrado.**

**Lo que sí funciona**, y está en todo el canon de esa noche: dejar una
guardia. Una prueba que se pone roja el día que la afirmación deja de ser
cierta. El comentario cuenta la historia; la guardia la sostiene.

## Un marco de 320 px no mide 320 px

Lo corrigió Sakuta el 15 de octubre, sobre su propio método, y vale para las
cinco porque al menos dos células medían así.

Meter un `iframe` de 320 px dentro de la página es cómodo: no hace falta
compilar ni servir nada. Pero **el marco lleva su propia barra de
desplazamiento**, y en un navegador de escritorio esa barra ocupa espacio
real:

```
iframe de 320 px  →  ~305 px útiles
iframe de 375 px  →  ~360 px útiles
```

En un teléfono la barra **flota encima** y la página tiene sus 320 enteros.
Así que medir con marcos no da un resultado aproximado: da un resultado
**sistemáticamente 15 px más estrecho** que el real.

**Las dos consecuencias, y la segunda es la peligrosa:**

1. Un defecto que solo aparece por debajo de 320 px se informa como si pasara
   en un teléfono. Sakuta encontró así una mesa que se rompía a 305 y la
   retiró del informe al darse cuenta: **en un teléfono no pasa.**
2. Y al revés, lo más caro: algo que **sí** falla justo a 320 px puede salir
   bien en un marco de 375, porque en realidad se midió a 360.

**El método bueno sigue siendo el de arriba** —compilar, servir en local y
Playwright con `viewport` fijo—, y por eso lleva escrito que se compruebe
`window.innerWidth` **antes** de medir: ese paso existe exactamente para
cazar esto.

**Si vas a usar marcos de todos modos** porque quieres mirar deprisa, está
bien para echar un vistazo, pero no para un informe: lee `innerWidth` dentro
del marco y escribe el número real al lado de cada medida. Un informe que dice
320 habiendo medido 305 contamina lo que lean las otras cuatro células.

## Corre `npm test`, no tu propio glob

Pequeña y cara. La escribo porque la pisé yo, durante horas, el 15 de octubre.

Llevaba toda la tarde comprobando mi trabajo con esto:

```
node --import ./scripts/cargador-jsx.mjs --test "src/**/*.test.mjs"
```

…y llamándolo «la suite completa». No lo es. El `test` de `package.json`
corre **dos** globs:

```
"test": "node --import ./scripts/cargador-jsx.mjs --test \"src/**/*.test.mjs\" \"supabase/functions/**/*.test.mjs\""
```

Me faltaban las catorce pruebas de `supabase/functions/`. Esa vez pasaban —lo
comprobé al darme cuenta— así que no escondí nada. **Pero mi «2.637 pruebas,
cero fallos» era un número de un subconjunto presentado como un total**, que
es precisamente lo que el canon dice no hacer tres secciones más arriba.

**La regla: para decir que algo pasa, corre el comando que corre el CI.** No
uno parecido. Si quieres correr una parte mientras trabajas, perfecto —es más
rápido—, pero entonces el informe dice «pasan las pruebas de `src/`», no
«pasa la suite».

**Y de dónde salió:** un PR estaba en rojo en el CI y en verde en mi máquina.
Perseguí la diferencia por el lado equivocado un buen rato —rama base
desfasada, re-lanzar el CI, el guardián de migraciones— antes de leer qué
ejecuta de verdad el trabajo del CI. **Cuando el CI y tu máquina no coinciden,
lo primero que se mira no es el código: es si los dos están corriendo lo
mismo.**

### Qué paso del CI falló, sin poder leer el registro

El proxy de este entorno **no deja descargar los registros** de GitHub
Actions: `gh run view --log-failed` devuelve «Forbidden». Eso parece dejarte a
ciegas, y no es verdad. Esto sí pasa, y dice el paso exacto:

```
gh run view <id> --json jobs --jq '.jobs[]|"\(.name): \(.conclusion)", (.steps[]|"   \(.number). \(.name) → \(.conclusion)")'
```

Devuelve los siete pasos del trabajo con su resultado, así que distingues en
un segundo entre «fallaron las pruebas», «falló la compilación», «falló el
guardián» y «ni siquiera instaló».

**Y la duración es una pista antes incluso de mirar eso.** La suite tarda
unos once minutos. Un trabajo que falla en **dos** no corrió las pruebas: se
cayó antes, o se cayó cargando algo. Esa sola cuenta —cuánto tardó contra
cuánto debería— orienta la búsqueda antes de abrir nada.
