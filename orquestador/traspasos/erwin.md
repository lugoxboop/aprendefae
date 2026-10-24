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
  verde con la aplicación caída. ¿Esto midió lo que dice medir?

## Pendientes (24-oct, 14:50)
- **Vara de fusión, 24-oct:** Mateo no da vistos buenos. Cada quien fusiona con
  PASA de su auditor y CI verde; Miku fusiona lo compartido. Solo para lo
  irreversible (datos de estudiantes, tumbar la plataforma).
- **Main rojo desde el 23-oct** por la línea 46 de `scripts/canon.mjs`: marcas
  combinantes literales que tumba `sin-caracteres-de-control.test.mjs`. Lo tiene
  Miku (#503); el arreglo está en el #485 de la Célula B.
- **PR #490** (regla «Contabilidad tiene estudiantes», índice con 4 temas por la
  bandera `OCULTAR_TEMAS_FUERA_DEL_SEMESTRE`, motor del Repaso Diario de
  Contabilidad y migración 0152) y **PR #491** (`SecuenciaAprender`, sobre el
  patrón de Ukyo #470): rehechos sobre main del 24-oct, verdes en local. Se
  fusionan cuando main vuelva a verde.
- **Pools del Repaso de Contabilidad:** el motor espera `src/repaso/contabilidad/t1..t4.js`.
  D tiene subtemas en main (#475), C en #482, E en #481, B nada aún. En
  #477-#480 está cómo conectarlos sin re-etiquetar. El Repaso sigue
  `publicado: false` hasta que los cuatro temas tengan ítems.
- **Célula A:** faltan la confirmación de Levi (auditores-v1) y la sección 6 de
  Sai (celula-construccion). Xeno debe el sí o no de #349.
- **La capa 1 de CuatroCapas:** las guardas B1 y B2 siguen en modo informe
  esperando los recortes de Near; el TODO de Gen (opción de 13 palabras) igual.
- **Macroeconomía y Contabilidad tienen estudiantes reales**: solo se agrega.
  `CuatroCapas.jsx` no se toca; lo nuevo entra opt-in.
- **Chrome:** el mío es el Browser 1. El 2 es de Mateo; no entrar.

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
