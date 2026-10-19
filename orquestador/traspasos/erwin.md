# Traspaso de Erwin

## Qué tengo a cargo
- La **Célula A**: T1, T2, T3, la portada, el índice del banco y los íconos.
  Los tres temas están cerrados y en `main`.
- **Lo compartido**: componentes comunes, choques entre células, datos de
  estudiantes y destrabar generales. Eso es lo que queda vivo.
- No hago el trabajo de los generales: cada uno fusiona lo suyo. Si alguien
  rompe `main` o pisa a otra célula, se lo devuelvo para que lo arregle él.

## Decisiones vigentes
- **Crítico es solo lo que no se puede deshacer**: datos de estudiantes,
  contenido ya aprobado por Mateo, o tumbar la plataforma. ¿Se deshace?
  Entonces decide el general.
- **«Terminada» = Avanzado verificable**, y el nivel es el **mínimo** de las
  dimensiones, no el promedio. D2, D3, D7 y D9 quedan «pendiente de personas».
- **D4, lectura estricta** (Miku): la misma pregunta sobre otro caso no es una
  decisión distinta. Avanzado pide dos decisiones de **tipo** distinto y que
  cada elección —también la mala— se vea en la figura.
- **D6 Avanzado**: un mensaje por error conceptual. Si un mensaje sirve para
  dos opciones, está mal escrito.
- **Medir, no calcular**: un contraste calculado vale lo que valga el fondo
  supuesto. Dos veces en doce horas el medido no coincidió.
- **El acierto es neutro** (`FAE.text`): teal es DEBE, ámbar HABER; lo guarda
  `b4-acierto-neutro.test.mjs`.
- Letra 12 px (salvo cejillas aceptadas), toque 44 px, todo a **320 y 375**.
- **La familia del falso verde** es mi error recurrente: salida truncada leída
  como completa, un `grep` al final de un pipeline que devuelve 0 como si
  hubieran pasado las pruebas, una sonda que no pinta lo que mide, un build
  verde con la aplicación caída al tener sesión. Antes de reportar limpio:
  ¿esto midió de verdad lo que dice medir?

## Pendientes
- **La contradicción de Xeno (#349).** Él dejó la ficha de FP fija a propósito;
  yo la hice desaparecer al bajar, porque tapaba 75 textos a 320 en una sola
  pieza y bloqueaba D7 de la Célula B. De tres juegos medidos, dos no se
  desplazan; el tercero sí, y ahí el contador queda escondido estando abajo.
  **Xeno decide si le basta.** El arreglo de fondo —sacar la banda del área que
  se desplaza— toca las 23 vistas y Macroeconomía va dentro: no sin Mateo.
- **La capa 1 de CuatroCapas.** Sus dos guardas están en «modo informe»
  (`# TODO`): «ninguna pantalla pasa de 60 palabras visibles» y «toda pantalla
  tiene figura o interacción, con 40 palabras antes». No fallan CI, así que
  **no avisan**: esperan los recortes de Near. Hay un tercer TODO de Gen: una
  opción correcta de 13 palabras contra 11 de las otras, y el largo delata.
- **Macroeconomía tiene estudiantes reales**; no se toca sin Mateo.
  `CuatroCapas.jsx` lo comparte Política Monetaria, así que lo que entre ahí
  entra **opt-in**, pieza por pieza, o rompe una materia en uso.

## Mis agentes y cómo hablarles
Gen (contenido), Xeno (diseño), Levi (auditoría), Sai (construcción); enlaces
en `conocimiento/celulas.md`. Un prompt debe bastar para capacitar del todo:
objetivo, lo ya descartado, los archivos a leer y el alcance. El código va por
issue o PR; a los de chat, un mensaje por lote. Les delego también la decisión:
si dependen de mi visto bueno, el cuello soy yo.

## Cómo arrancar
Lee `conocimiento/kit.md` (D4 y D6 textuales), `protocolo-de-eficiencia.md` y
`celulas.md`. Las sondas están en `scripts/`: `ficha-tapa.mjs` (con sus tres
criterios y por qué cambió cada uno), `contraste.mjs`, `blanco-de-toque.mjs` y
la de enganche. Se corren sobre `dist` servido en el 8099 con las variables de
Supabase falsas, y **fingen sesión**: sin ella miden un cero vacío.
