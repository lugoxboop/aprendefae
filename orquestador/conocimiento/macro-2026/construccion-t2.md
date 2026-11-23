# T2 · Política económica — construcción (rama `macro26-t2`)

Fuente: `disenos/t2-politica-economica.md` (Gen, 22-nov) y el anexo de
`fichas/2-politica-economica.md` (los 43 enunciados). Código en
`src/macro2026/politica-economica/`; lo común nuevo en `src/macro2026/comun/`
(`ramas.js`, `iconos-pe.jsx`, `Escalera.jsx`, `arrastre.js`). A4 usa
`comun/modelo-da.js` de T1.
Vista previa sin publicar: `#/macro-2026` (índice de T1 y T2) y
`#/macro-2026/<id>`. `?semilla=N` fija el sorteo.

## Casillas

- [x] Infraestructura (ramas, íconos, escalera, arrastre, textos, catálogo, vista previa)
- [x] A1 · ¿Mecánico o te arreglas solo?
- [x] A2 · La economía con fiebre
- [x] A3 · El problema, resuelto
- [x] H3 · Conecta los cables
- [x] A4 · Las perillas de la demanda
- [x] A5 · La escalera de la política
- [x] H1 · Seis peldaños
- [x] H2 · Arma el grupo lógico
- [x] H4 · El peldaño que no encaja
- [x] H5 · Un paciente, dos fiebres
- [x] Migración de las 5 Hacer (`supabase/macro2026-pendientes/0271_*.sql`)
- [x] Pruebas de las Aprender (`__tests__/t2-*.test.mjs`)
- [x] Videos de las Aprender a 320 y 375 (`/mnt/project-files/macro-2026/videos/t2/`)
- [x] Interruptor de publicación por pieza (`PUBLICADAS_T2`, vacío)

## Decisiones reversibles tomadas al construir

1. **Tonos de las ramas.** El tema oscuro de planck.css trae cuatro tonos con
   color y T1 ya los usa todos. Se tomaron los hermanos de la misma paleta:
   fiscal `--accent-hover` #8a9cff, monetaria `--product-debe` #2a9d8f,
   cambiaria `--product-haber` #e9c46a, comercial el `node` de theme.js
   #cbdcf2. Ninguno es coral; luminancias separadas (> 0,08 entre sí); ≥ 3:1
   sobre el fondo y ≥ 4,5:1 con la tinta de las pastillas (medido en la prueba).
   El nombre de la rama va siempre escrito junto al ícono.
2. **Conteo de palabras.** Cuatro pantallas no coinciden con §4: A3 P1 tiene 11
   (§4: 12); A5 P2, P6 y P7 tienen una más (9, 14, 17) porque «%» va separado
   de su cifra. Los textos quedan tal cual; todas cumplen ≤ 20.
3. **Tocar-tocar.** Todo lo que se arrastra se puede también tocar (elige) y
   luego tocar el destino; con teclado, Enter o Espacio. Pointer Events con
   captura (guía «drag»); el destino se reconoce por su rectángulo.
4. **A1 P4:** cada nodo oculto muestra «?» (sin texto de ayuda añadido); el
   signo de «¿Fallos del Estado?» parpadea una vez. «Siguiente» solo se bloquea
   en P1, que es donde lo pide la especificación.
5. **A2:** el termómetro sube un grado por cada uno de los cinco virus del
   circuito (P2). Las fichas sin cifra en §2 no muestran ninguna. El 9,4 % no
   aparece (§0). A 320 px el circuito mide 320 px de alto para que ningún virus
   tape el rótulo de su parte.
6. **A3 P3:** las cuatro tarjetas se funden solas al entrar; tocar
   «Estabilización» repite la fusión.
7. **A4:** la aguja va de 0 a 4.500 (el máximo que alcanzan las perillas es
   4.350, con t = 0). Los rótulos de los deslizadores nombran la rama. El
   altavoz se escala con el multiplicador relativo al de la base (2,5).
8. **A5 P8:** las tarjetas se barajan al entrar; la que cae en un peldaño ajeno
   vuelve al mazo y el peldaño correcto parpadea una vez.
9. **Íconos.** Los de rama, problemas, sectores y la silueta son propios de
   `src/macro2026/` (no son decoración del sitio). Falta pedir su reserva a la
   Célula A antes de publicar.
10. **Segundo error en H1 y H3:** si el segundo intento también falla, la
    tarjeta o el cable va solo a su sitio, con la retro a la vista. Es lo mismo
    que hace H1 de T1. Los peldaños de H1 no dicen cuántas tarjetas llevan:
    contarlas delataría la última de cada par.
11. **H3, la máquina:** es la ecuación de A4 en una franja de 64 a 80 px. Late
    el término que mueve la rama: TR, t y G (fiscal), i (monetaria), XN
    (cambiaria y comercial). Los cables son curvas SVG entre el enchufe y la
    toma, y se miden de nuevo al redimensionar. A 320 px, cada toma pone el
    ícono encima del nombre, porque «Monetaria» no cabía al lado.
12. **H2:** tocar una tarjeta la suelta directamente en el peldaño actual,
    porque es el único destino y un segundo toque no aporta nada. Arrastrarla
    también vale. Los peldaños que no son el actual son figura (36 px), no
    botones. Tras la bandera hay un botón «Siguiente grupo», o «Terminar» en
    el último grupo, para que la escalera iluminada se pueda leer.
13. **H4:** la tarjeta coherente que se toca lleva coral 300 ms, su retro, y
    luego ✓ en el rótulo. La errada cae (420 ms) y en su sitio sube el
    enunciado corregido con su explicación debajo. Se pasa con «Siguiente
    escalera».
14. **H5, el FP:** exploratoria, pct 100. Se cobra una vez, con «Terminar» en
    la pantalla de un final. Así la lectura y el cierre se leen antes de que
    la pantalla de resumen los tape, y «Probar otro tratamiento» sigue
    disponible. El servidor paga una sola vez, así que los demás finales no
    suman.
15. **H5, el mapa de 9 finales:** se guarda en el navegador (localStorage
    `aprendefae-pe26-h5-finales`). Guardarlo por estudiante en el servidor
    pediría una migración. El «cuerpo-circuito» de A2 es aquí un óvalo que
    rodea los tres medidores, no el circuito completo.
16. **Escalera.jsx:** un peldaño solo es botón si tiene destino u `onPeldano`.
    Esto no cambia A5 ni H1.

## Mediciones (sondas sobre `dist` servido en 8099, todas las pantallas)

Aprender, a 320 y 375 px, tocando todo lo tocable de cada pantalla:

| | 320 | 375 |
|---|---|---|
| Fallos de contraste | 0 | 0 |
| Letra mínima | 12 px | 12 px |
| Toques < 44 px | 0 | 0 |
| Desborde horizontal | 0 | 0 |
| B1 máx. (figura − tarjeta) | 41 (A2: 43) | 41 (A2: 43) |

Hacer, a 320 y 375 px. Pantalla inicial y una con retro o con un final;
sonda `sonda-pe26.mjs hacer`:
| | 320 | 375 |
|---|---|---|
| Fallos de contraste | 0 | 0 |
| Letra mínima | 12 px | 12 px |
| Toques < 44 px | 0 | 0 |
| Desborde horizontal | 0 | 0 |
| B1 máx. (figura − tarjeta) | 64 (H5: 86, con la entrada) | 64 |

Videos de las Hacer en `/mnt/project-files/macro-2026/videos/t2/`, de
`0{4,7,8,9}-*` y `10-*` a 320 y 375. Cada uno lleva un error al principio,
arrastre y tocar-tocar, y llega a la pantalla de FP. A 320, en H2, la Meta
queda fuera de la pantalla junto a las tarjetas: ahí se toca la tarjeta en
vez de arrastrarla, y la tarjeta se coloca sola en el peldaño.

Pruebas: `__tests__/t2-hacer.test.mjs` (9). Comprueba consigna, coral solo
en el error y durante 300 ms, sorteo, retro de ESE destino, puntaje al primer
intento entre N, subtemas, la tabla de los 9 finales de H5 (recortada a 1–5),
el FP de H5 una sola vez, y FP 25/25/150/50/25. `t2-textos-y-bancos` ata la
0271 al catálogo y al guardián.


## Lote 2 (23-nov-2026): las 5 Aprender, publicadas

- `PUBLICADAS_T2` tiene las 5 Aprender. `subjects.js` declara «Política
  económica» como tema 2 de Macro, con esas 5 y sin Hacer.
- La ruta es `politica-economica`, la misma del tema retirado, ahora otra vez
  en `VISTAS`. `archivo-macro-2025.test.mjs` la tenía vetada; deja de vetarla,
  pero sigue rechazando todo id viejo. La pinta `TemaMacro2026`, la misma
  vista que T1. Todos sus ids empiezan por `pe26-`, así que ninguna actividad
  vieja vuelve.
- La clave `color` de `ramas.js` se llama ahora `tono`. La prueba del teal
  como texto (`color: "#2A9D8F"`) no distingue un dato de un estilo.

## Lote 3 (23-nov-2026): las 5 Hacer, publicadas, y el elenco

- La 0271 pasa a `supabase/migrations/`. `PUBLICADAS_T2` tiene las 10.
  `subjects.js` declara las 5 Hacer con la clasificación del catálogo.
  `TemaMacro2026` las monta.
- `FORMATO_MACRO`: las cuatro evaluativas en X de N y H5 en solo puntos (es
  exploratoria).
- Las etiquetas del panel docente están en `src/macro2026/etiquetas.js`.
  - Los ítems son: H3, el instrumento; H1, `e<n>`; H2, `<grupo>-<peldaño>`;
    H4, la escalera; H5, `<paso>-<opción>` y `final-<a>+<b>`.
  - Los nombres de peldaño se copian allí, porque Escalera.jsx es JSX.
- `supabase/tests/etapas_test.sql`: `pe26-h2-grupo-logico` queda fuera del
  chequeo 2. El chequeo 15 le exige 3 etapas y base 50.
- `camino-sin-cambios`: entran las 6 variantes de T2. Las de T1 dan las
  mismas huellas. Las 12 de Pensamiento Estratégico cambian solo por los ids
  de `useId`.
- **El elenco de Gen** (commit 85b95557, traído con cherry-pick):
  - `comun/personajes.jsx` con `FotoPersonaje`: `<img>` con alt igual al
    nombre, 72 × 72 fijo, sobre un disco #C9D1E4 al 18 %, porque el contorno
    oscuro se pierde sobre el navy.
  - Sustituye las siluetas de T1 H4 (el empresario), T1 H5 (la analista) y
    la escalera (la autoridad económica). La escalera es un solo componente,
    así que el cambio alcanza a A5 y H2.
  - En la escalera, el peldaño donde está el personaje crece a 76 px y la
    autoridad entra con `da26-entra` en cada peldaño nuevo: sigue subiendo.
  - En H5 de T1, la hoja reserva 86 px arriba para la analista.
  - Medido con `sonda-elenco.mjs` a 320 y 375: las cuatro imágenes miden
    72 px de alto y cargan (naturalWidth 512), sin desborde. La sonda de T2
    sobre A5 y H2 da 0 fallos de contraste, 0 toques chicos y 0 de desborde.
  - Prueba: `__tests__/personajes.test.mjs`.
