---
id: decisiones
titulo: Decisiones cerradas
procedencia: registro
---

# Decisiones cerradas

Lo que ya se decidió y **no se vuelve a discutir** en cada corrida. Una decisión
que vive aquí no se reabre salvo que Mateo la reabra.

Cada entrada dice **qué se decidió** y **por qué**, porque una decisión sin su
razón se revierte sola en cuanto alguien no ve la razón.

---

## Sobre el trabajo, no sobre el contenido

**Una pieza a la vez.** Gen no entrega un tema entero de un tirón. La calidad se
cae cuando se intenta todo en un solo prompt.

**El nivel de una actividad es el mínimo de sus dimensiones, no el promedio.**
Una actividad brillante en siete dimensiones y débil en una es del nivel de la
débil.

**Nadie resuelve un conflicto entre documentos por su cuenta.** Se reporta con
las dos versiones y decide Mateo. Esto aplica a Gen, a Levi, a Xeno, a la
compilación y a Sai.

**El texto pedagógico no se «mejora» en construcción.** Va literal. Si hay que
escribir un texto de interfaz por necesidad, va marcado
`[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]`.

**Ninguna prueba se da por buena sin demostrar que puede fallar.** Mutación.

---

## Sobre el producto

**Coral significa error, en todo el sitio, sin excepción.**

**Los FP nunca se restan.**

**375 px manda.** Los estudiantes entran por teléfono.

**Las piezas de Aprender no dan FP.** Son material teórico: sin dificultad, sin
modalidad, y no entran al catálogo de FP.

**El orden del índice es el del libro, no el de construcción.**

**No se usa vocabulario visual de un tema que el estudiante todavía no vio.**

**Un término nuevo puede aparecer por primera vez como opción de una pregunta,
pero solo en Aprender y solo si todos los caminos lo explican.** Pedido por la
Célula C y aceptado por su auditor para el nivel Básico de D13. Las tres
condiciones son parte de la decisión, no matices:

1. **Solo en piezas de Aprender.** En un Hacer calificado, un término presentado
   así cuenta como NO enseñado. La diferencia es entre enseñar y examinar: en
   Aprender el estudiante puede equivocarse y aprender de la respuesta; en un
   Hacer, equivocarse le cuesta FP por algo que nadie le explicó.
2. **Todos los caminos lo explican**, no solo el acierto: cada error nombra el
   término y dice qué es. Si solo lo explica el acierto, el estudiante que falla
   —que es justo el que no lo sabía— se queda sin la explicación.
3. **Queda escrito como interpretación del Básico de D13**, no como el D13
   mismo, porque el texto de D13 que hay en el kit es una reconstrucción y no el
   original. Quien tenga el original algún día puede confirmarla o tumbarla.

El caso que la originó: la cuenta «Compras» en la primera pieza de Aprender del
T7.

---

## Sobre la publicación

**Una actividad construida no se publica sola.** Entra al camino cuando existe
el material de Aprender que la sostiene. Antes de eso vive en el repo, probada,
fuera de las dos puertas.

**Las dos puertas tienen que decir lo mismo:** el catálogo (`subjects.js`) y el
registro de la vista del tema. Lo que solo está en el registro se abre
escribiendo el hash y registra FP de una clasificación que no existe.

**Toda actividad publicada necesita su regla de etiqueta** en el panel docente.

**Las migraciones las corre Mateo a mano**, en el SQL Editor de Supabase. Nadie
más las ejecuta. Se entregan numeradas, ordenadas e idempotentes, y quien las
escribe reporta qué tiene que devolver la consulta de comprobación.

---

## Pendientes conocidos

| Qué | Estado |
|---|---|
| T1-3 | Retenida por revisión del profesor. No se construye. Por eso el Tema 1 suma 235 FP y no 260. |
| D9 y D10 del Kit | Sin criterio verificable. No evaluables. |
| D13 del Kit | Solo un resumen, no el texto original. |
| Kit de Cliente | Solo el inicio. |
| Capa 4 de la pieza 1, Tema 1 | La opción correcta tiene 13 palabras y ninguna otra pasa de 11: se delata por su largo. Pendiente de Gen. |

---

## Sobre cómo se comprueba lo publicado

**El texto publicado se lee del paquete desplegado, no del repositorio.** Es lo
que ve el estudiante. El repositorio puede ir por delante de lo que está en
línea, y entonces «lo publicado» de la discusión y «lo publicado» de la
pantalla no son lo mismo.

Vino de un caso real: se iba a cambiar el conteo del resumen de una actividad
porque la frase parecía prometer un segundo intento. Leído del paquete
desplegado, el texto decía otra cosa de la que recordábamos, y traía además un
botón «Otra vez» que nadie había tenido en cuenta. Ese botón es la segunda
oportunidad, así que la frase era exacta y el cambio no hacía falta. El auditor
retiró su objeción con el dato delante: **«Mi razón para cambiar el texto se
apoyaba en un dato incompleto.»**

Sin esa comprobación se habrían abierto seis actividades publicadas para
arreglar algo que no estaba roto.

**El texto se lee de lo desplegado; el comportamiento se juega.** No es la
misma comprobación y no se hacen igual. Para saber qué dice una pantalla se
abre el paquete desplegado y se lee literal. Para saber si una actividad deja
reintentar hay que jugarla: se falla un ítem a propósito y se mira qué
controles quedan. Deducir el comportamiento del código es el camino donde se
cuela el «debería».
