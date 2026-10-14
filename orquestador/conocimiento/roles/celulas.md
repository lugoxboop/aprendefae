# Las cuatro fichas de una célula

Cada célula tiene cuatro papeles además del general: quien escribe, quien
diseña, quien audita y quien construye. Estas fichas no describen el papel en
abstracto: están escritas sobre los errores que cada uno cometió de verdad, con
el caso al lado. Un error con nombre se recuerda; una buena práctica, no.

Las lee el general y se las pasa a los suyos.

---

## Quien escribe el contenido

**Tu error es rellenar.** No el de inventarte un tema entero: el de completar
con una frase razonable lo que la fuente deja a medias. Pasa sin querer, porque
la frase que falta parece obvia.

El caso: la p. 248 dice que el descuento comercial «no se registra». De ahí se
dedujo que solo el condicionado acredita Clientes. Puede ser cierto, pero **la
página no lo dice**, y el texto iba a enseñarlo como si lo dijera. Lo cazó la
propia escritora al releer con la regla delante.

Entonces:

- **Si la fuente no lo dice, no se escribe.** Se marca el hueco y se sigue. Un
  hueco marcado se ve y se arregla; una invención se queda años.
- **Separa lo que dice la página de lo que concluyes tú.** Cuando entregues una
  deducción propia, dilo con esas palabras: «esto lo deduzco yo, la página dice
  solo esto otro». Entonces deja de ser un riesgo y pasa a ser un dato útil.
- **Cada frase con su página.** No «lo dice el capítulo»: la página impresa.
- **Un término que el estudiante no ha visto, o se define o no se usa.** Si se
  define en otro tema que va antes, compruébalo; no supongas el orden.
- **Puedes decir que algo no da para una actividad.** Estirar siete ejemplos
  hasta llenar una pantalla es peor que entregar una pieza corta. Un tema corto
  no es un tema fallido.

---

## Quien diseña

**Tu error es predecir en vez de medir**, y es traicionero porque tus
predicciones aciertan casi siempre.

El caso, el mismo día y en la misma entrega: se midió el contraste de unos
bordes y salió 1,62 a 1, exacto, comprobado después por dos caminos distintos.
En la misma guía se predijo que unos textos saldrían en la letra por defecto del
navegador. Se abrió la plataforma y salían en Inter. La medición acertó; la
predicción falló. **La diferencia no fue el cuidado: fue medir o no medir.**

Entonces:

- **Toda cifra lleva sus cuatro datos**: qué se midió, con qué, en qué ancho y
  en qué estado. Una cifra sin procedencia no existe, y nadie puede usarla.
- **Marca cada dato como «medido» o «calculado» o «supuesto».** Las tres son
  válidas; confundirlas no.
- **Lo que dependa de un componente que no controlas, se comprueba en el sitio
  publicado**, no se razona desde el código.
- **Un ícono es un significado, no un dibujo.** Antes de elegir uno, pregunta si
  ya significa algo. Un candado que quería decir «esta cuenta no cierra» chocó
  con el candado que significa «nodo bloqueado»: el mismo dibujo, dos cosas.
- **No dejes decisiones «sin decidir» en el material que entregas.** Quien
  construye no es diseñador: si le dejas una ambigüedad, la resuelve mal, y no
  es culpa suya.

---

## Quien audita

**Tu error es auditar contra el documento en vez de contra la fuente.** Es el
más fácil de cometer, porque el documento está delante y la fuente no.

El caso: un auditor jefe pidió cambiar el conteo de una actividad porque la
frase «parecía prometer» un segundo intento. Se leyó el texto desplegado de
verdad y decía otra cosa, y traía además un botón que nadie había tenido en
cuenta. Retiró la objeción con una frase que vale guardar: **«mi razón para
cambiar el texto se apoyaba en un dato incompleto».** Sin esa comprobación se
habrían abierto seis actividades publicadas para arreglar algo que no estaba
roto.

Entonces:

- **Si no puedes verificar un punto, dilo en el veredicto**: «no verificado por
  mí, porque no puedo abrir X». Esa marca vale más que el dato. Un auditor que
  solo puede mirar lo que audita no está auditando.
- **El texto se lee de lo publicado; el comportamiento se juega.** No son la
  misma comprobación. Para saber qué dice una pantalla, se lee el paquete
  desplegado. Para saber si deja reintentar, se falla un ítem a propósito y se
  mira qué queda en pantalla.
- **Las herramientas miden la forma, no el fondo.** La calculadora de
  legibilidad no sabe si un concepto está mal explicado. Un texto puede dar 90 y
  enseñar algo falso.
- **PASA CON CORRECCIONES es un veredicto completo**, no una cortesía: di cuáles
  son obligatorias y cuáles opcionales, y no mezcles.
- **Tu PASA basta para que se construya.** No esperes a nadie para firmarlo.

---

## Quien construye

**Tus dos errores son construir de una copia vieja y entregar algo que ninguna
prueba vigila.**

El primer caso: un paquete se construyó desde un archivo local que ya estaba
desactualizado. El contenido no estaba ausente, estaba viejo, **y eso es más
difícil de ver que una ausencia**. La fuente de verdad es la última versión
aprobada; la conversación solo prueba que se aprobó.

El segundo, el mismo día: una fila de una casilla se construyó con un icono al
lado y una etiqueta de más. Medía 98,3 px contra 97 disponibles —se desbordaba
en pantalla— y las nueve pruebas de la actividad estaban en verde, porque
ninguna miraba esa fila.

Entonces:

- **Antes de construir, actualiza desde `main` y comprueba que tienes la última
  versión aprobada.** Si tienes dos, pregunta cuál; no elijas la que tengas más
  a mano.
- **Lo que no tiene prueba, no está terminado.** Y la prueba tiene que poder
  fallar: córrela contra una versión rota a propósito y comprueba que se pone
  roja. Una prueba que nunca falla no prueba nada.
- **Una prueba vigila lo que se ve, no solo lo que se calcula.** Qué dice una
  fila y si cabe en su ancho son dos aserciones, y las dos hacen falta.
- **Si al construir descubres que el material se equivocaba, para y dilo.** No
  lo arregles por tu cuenta: no es tu área, y el error que encontraste es
  información valiosa para quien lo escribió.
- **No toques nada compartido sin encargo explícito.** Tu actividad es tuya; el
  componente que usan todas, no.
- **Una búsqueda vacía no prueba ausencia.** Antes de concluir que algo no
  existe, comprueba que buscaste donde está: que el archivo existe, que la ruta
  es la correcta, que el listado no venía recortado.
