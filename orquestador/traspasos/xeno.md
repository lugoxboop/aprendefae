2026-10-24 16:54 · Xeno (diseño, Célula A: lo compartido) · traspaso para el chat nuevo

Quién soy: el diseñador de la Célula A (general Erwin; código Sai, pedagógico Gen,
auditoría Levi). Mi skill es `celula-diseno` y se carga sola; este archivo solo
guarda lo que NO está en ella: el estado de mi trabajo y las trampas del entorno.

## Lo que ya está decidido y dónde vive (no se vuelve a abrir)

- **Colores, estándar de Hacer, literal del feedback, contador y botones:** en la
  skill `celula-diseno` (secciones 4 y 5). Resumen para no releerla: coral solo
  error; teal es DEBE y botón principal; ámbar tiene tres papeles (HABER, nivel
  intermedio, énfasis puntual); el acierto en Contabilidad es ✓ o borde neutro
  #F8F9FA, nunca teal (B4); modelo de Hacer = T4 «¿Entra o sale de Caja?»;
  literales «Correcto» / «No va aquí» / «Iba aquí»; contador «{Sustantivo} n de N».
- **Sistema de identificadores de tema y regla de marcar lo inactivo:** `kit.md`,
  secciones «El sistema de los identificadores de tema» y «Marcar lo inactivo»
  (PR #396, fusionado). Buscar con `node scripts/canon.mjs "identificadores"`.
- **Piso de 12 px y contraste 4,5:1:** `kit.md`, con las sondas `scripts/piso-de-12.mjs`
  y `scripts/contraste.mjs`.
- **#349 (ficha de FP):** NO a ocultarla al bajar; SÍ a reservar 84 px arriba y
  `scroll-margin-top: 84px` en los destinos de scroll automático. Decisión en el
  comentario del issue; la construye Sai. Se mide con `scripts/ficha-tapa.mjs`.
- **FormaEstado (T1):** una sola columna, 12 px. Construida y fusionada (#388);
  midió 378 px a 320 y 360 a 375.
- **Flecha inactiva de TresInformes.jsx:155:** color sólido #7A8798, sin `opacity`,
  y el activo con contorno en cápsula de 2 px #F8F9FA más `aria-pressed`. Se la
  pasé a Erwin para que la aplique; **confirmar si ya entró**.
- **Ingresos (T3)** pasó a la Célula E el 23-oct: dejé el repintado y el literal
  especificados en el issue #508 (etiquetas `miku` y `celula-e`). No lo toco yo.

## Lo que me falta (en este orden)

1. **Marcas ✓ de `libros/` a neutro (B4).** `MarcaVeredicto` (`libros/marcaVeredicto.jsx`)
   recibe `color`; en `CampoCifra` y `MesaDelAsiento` la pasan en teal
   (`FAE.teal`) y en `ElegirLado` con `COLOR_LADO[lado]`. El bien pasa a `FAE.text`
   y el borde de la correcta a neutro. Hay al menos 16 líneas. Los tres tests
   `*-veredicto-forma` fijan hoy los bordes teal y hay que actualizarlos. Antes de
   tocar, mirar «El mapa de choques» en `nocturno.md`: parte de `libros/` ya es
   de la Célula C (T2).
2. **Barra `Pulsos`** con propiedad de acento para que dentro de Contabilidad vaya
   en node #CBDCF2 (hoy va en teal). Es compartido: pasa por Erwin.
3. **#6 y #7:** unificar los caminos (hoy unos nodos llevan ícono y otros número) y la
   identidad por tema en la portada. Los propongo con Erwin; son componentes compartidos.
4. Variantes de texto en las cejillas del Panel y los tintes de error: #3FA69A para
   teal pequeño sobre tarjeta y #EE8266 para coral sobre su tinte.
5. Comentario viejo del ámbar en `theme.js`.
6. **Congelado por decisión de Mateo:** el acento coral de Macroeconomía. No se toca sin
   una orden suya.

Observaciones menores sin reportar (reportarlas por lote cuando toque el archivo):
la fila de totales de `AsientoEnLineas` no lleva DEBE/HABER; los botones de alternar
son la forma más débil; `maquinas/LineaDeTiempo.jsx:126` tiene un `aria-label` que
pisa el veredicto y no hay región viva; costura en el borde de `CampoCifra`; emoji en
Retro (`juego.jsx`, Macroeconomía congelada); `aria-pressed` en los alternadores docentes.

## Trampas del entorno (me costaron turnos)

- **GraphQL de GitHub está bloqueado:** todo con `gh api` por REST.
- **El aviso «tiene commits sin subir y no hay rama remota» es falso** cuando la rama ya
  está subida. El repo solo sigue `main`; se arregla con
  `git config --add remote.origin.fetch '+refs/heads/<rama>:refs/remotes/origin/<rama>'`,
  `git fetch origin` y `git branch -u origin/<rama>`.
- **PR apilados:** se fusionan en el orden de la pila. Fusionados al revés, #253 y #254
  se quedaron fuera de main y hubo que rescatarlos con #330.
- **Prueba «sin estilo»:** quitar los estilos y exigir que los estados sigan distintos
  (la prueba de blanco y negro). Una prueba nueva debe fallar contra el código viejo.
- **Medir en la página construida:** `VITE_SUPABASE_URL=https://x.supabase.co VITE_SUPABASE_ANON_KEY=x npm run build`,
  servir `dist` y usar las sondas de `scripts/`. Las cifras de mi carpeta temporal no
  sobreviven al traspaso.
- La ficha de FP solo existe con sesión (hay que fingirla); sin ella, el cero no vale.

## Cómo se informa

Una línea al general, el detalle al cuerpo del PR, `[SIGO]` mientras quede trabajo. Si
algo le toca a Miku, se lo escribo a ella directamente en la respuesta, no solo en un issue.
