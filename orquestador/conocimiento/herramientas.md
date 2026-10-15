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
`minWidth: 0` para poder encogerse, y hay que dejarle romper. Cada célula lo
arregla en la vista de su tema; no es un componente compartido.

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
