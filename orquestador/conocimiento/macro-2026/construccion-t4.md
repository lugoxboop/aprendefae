# T4 · Política monetaria — construcción (rama `macro26-lote5`)

Fuente: `disenos/t4-politica-monetaria.md` (Gen). Código en
`src/macro2026/politica-monetaria/`; lo común del tema en `comun-pm.jsx`
(cascada de vasos, gráfica del mercado de dinero, tablero de palancas,
letrero, termostato). Mascotas de `comun/mascotas.jsx` (nunca personas) y
objetos del kit de `comun/kit.jsx`. Vista previa: `#/macro-2026/<id>`;
`?semilla=N` fija el azar. Publicado directo (lote 5, 2026-11-22 23:40,
hora de Bogotá): Mateo pidió publicar a medida que se termina.

## Casillas

- [x] Textos, catálogo, lo común del tema (`textos.js`, `catalogo.js`, `comun-pm.jsx`)
- [x] A1 · Lo que llevas en la billetera
- [x] A2 · La ventanilla del BanRep
- [x] H1 · ¿Entra o sale dinero?
- [x] A3 · La cascada de vasos
- [x] H2 · Ajusta la cascada (3 etapas → `etapas_test.sql`, chequeo 17)
- [x] A4 · Bóveda y cajas
- [x] H3 · Cada depósito a su caja
- [x] A5 · El precio del dinero
- [x] H4 · Mueve la curva, mira la tasa
- [x] A6 · Tres palancas
- [x] H6 · El dominó de la tasa
- [x] A7 · El termostato
- [x] H5 · La Junta decide
- [x] Pruebas (`__tests__/t4-textos-y-bancos`, `t4-piezas`, `t4-hacer`)
- [x] Sondas a 320 y 375: 26/26 sin contraste malo, letra ≥ 12 px, toques ≥ 44, sin desborde
- [x] Videos a 320 y 375 (`/mnt/project-files/macro-2026/videos/t4/`, 26)
- [x] Publicación: `PUBLICADAS_T4` con las 13, `subjects.js`, ruta, 0273 en `migrations/`

## Decisiones reversibles tomadas al construir

1. **Conteo de §4.** Diecinueve pantallas difieren del conteo declarado en
   una o dos palabras (la lista exacta está en `CONTEO_REAL` de
   `t4-textos-y-bancos.test.mjs`). Los textos quedan exactamente como en §2;
   la prueba anota el conteo real y exige ≤ 20, que todas cumplen.
2. **Subtemas de H6.** Las cadenas de §2 H6 traen subtemas que el catálogo
   no listaba para la pieza (la del encaje: instrumentos y creación
   secundaria; la de los TES: instrumentos y medidas). Se agregaron al
   catálogo de H6 para que cada ítem puntúe en su subtema.
3. **A4 P5, escala por área.** Los cuadros tienen lado ∝ √cifra (el área es
   la cifra). M2 y M3 casi coinciden (980 y 1.031 billones), así que encima
   se tapaban: los cuadros son solo dibujo y se tocan cuatro botones (BM, M1,
   M2, M3) que muestran la cifra. «Siguiente» espera las cuatro.
4. **A7, la serie.** Gen da puntos sueltos (d. 43). Los años sin dato se leen
   en línea recta y se redondean a medio punto (`SERIE_A7`). La tasa empieza
   en 2017 (primer punto de Gen): en 2016 se muestra «—». La fuente dice
   «Lectura aproximada del gráfico del Banco de la República».
5. **A5.** El punto de P2 se mueve con un deslizador (la tasa, 1 %–10 %), no
   arrastrándolo sobre la curva. En P4 la pared de la oferta tiene asa
   (arrastre y ← →) y además un deslizador, para quien no arrastra. El
   modelo es i = (kY − M/P)/h con k 0,5 y h 10; con los rangos de Gen
   (Y 260–360, M 80–120) la tasa queda entre 1 % y 10 %. Los precios suben
   un 20 % (M/1,2).
6. **H1, encaje y créditos.** Las operaciones de la cascada (encaje, crédito)
   no pasan por la ventanilla: se ven con una cascada pequeña que se acorta
   al revelar. Las flechas se ponen tocando el medidor (sube → baja → igual).
7. **H4, la respuesta.** Se mueven las dos curvas; cuenta la que más se
   movió (en M/P; la demanda se mide como k·ΔY), con umbral de 4. Curva y
   dirección puntúan por separado, cada una con su retro. Al revelar, la
   curva correcta se corre 15 y se ve la tasa nueva.
8. **H6 en columna a todo ancho** (también a 375 y más). Se reordena tocando
   dos fichas para intercambiarlas; se quitaron los botones ↑ ↓ por ficha
   porque a 320 medían 27 px de alto. Las fichas son botones: el teclado
   hace lo mismo. Puntúa solo el primer empujón de cada cadena.
9. **H5.** Tarjeta inicial con el aviso de Gen («Casos de práctica, no
   decisiones reales de la Junta.») y el panda autoridad (pose «carpeta»,
   120 px). Termostato a todo el ancho sobre el tablero (al lado no cabía la
   letra a 320). Con las tres palancas bien, el termómetro baja a la banda
   tras 1,2 s de rezago. Las rondas van en orden aleatorio.
10. **Mascotas.** A2 P1: panda autoridad «grifo» a 180 px (protagoniza);
    A2 P2: escena `viajero-banco-central` a 120 px. A6 P3: panda «timón» a
    120 px junto al tablero; A6 P7: escena `autoridad-empresario` a 120 px
    con los nueve impactos alrededor. H5: panda «carpeta» a 120 px. Objetos
    del kit: banco-central, bóveda, grifo, billetes-alas, cajero y los del
    resto de impactos.
11. **Termostato.** El rótulo «Meta 2 %–4 %» va debajo, en HTML (dentro
    del dibujo se montaba sobre la casa y a 320 px medía 11 px).
12. **H2.** Al tercer fallo el deslizador va solo a la solución (600 ms) y
    la etapa cuenta 0. La pista sale desde el segundo fallo. Al terminar
    las tres etapas, tarjeta de cierre con el «Supone que todo préstamo
    vuelve como depósito» de Gen y luego Terminar.
