# T3 · Política fiscal — construcción (rama `macro26-t3`)

Fuente: `disenos/t3-politica-fiscal.md` (Gen, 22-nov). Código en
`src/macro2026/politica-fiscal/`; lo común nuevo en `src/macro2026/comun/`
(`tributos.js`, `iconos-pf.jsx`). A5 usa `comun/modelo-da.js` de T1 y
`comun/personajes.jsx` (familia, inversionista).
Vista previa sin publicar: `#/macro-2026` (índice T1–T3) y
`#/macro-2026/<id>`. `?semilla=N` fija el azar.

## Casillas

- [x] Infraestructura (tributos, íconos, textos, catálogo, vista previa)
- [x] A1 · La lupa de seis caras
- [x] A2 · Tres buzones
- [x] A3 · Dos cajeros
- [x] A4 · El tanque del Estado
- [x] A5 · La balanza fiscal
- [x] Pruebas de las Aprender (`__tests__/t3-*.test.mjs`)
- [x] Sondas y videos de las Aprender a 320 y 375 (`/mnt/project-files/macro-2026/videos/t3/`)
- [ ] H1 · Echa la moneda
- [ ] H2 · ¿Qué cajero te cobra?
- [ ] H3 · La factura con lupa (3 etapas → `etapas_test.sql` al publicarla)
- [ ] H5 · Las dos montañas
- [ ] H4 · ¿Expande o contrae?
- [ ] H6 · El memo de la gerencia
- [ ] Migración de las 6 Hacer (`supabase/macro2026-pendientes/0272_*.sql`)
- [x] Interruptor de publicación por pieza (`PUBLICADAS_T3`, vacío)

## Decisiones reversibles tomadas al construir

1. **Conteo de §4.** Cuatro pantallas no coinciden con el conteo declarado:
   A3 P3 tiene 9 palabras (§4: 10); A4 P7 tiene 17 (16); A5 P1 tiene 13 (12);
   A5 P4 tiene 11 (10). Los textos quedan exactamente como en §2; la prueba
   anota el conteo real (`CONTEO_REAL`) y exige ≤ 20, que todas cumplen.
2. **Tonos de los tributos.** Impuesto `--accent` #6f86ff, tasa `--warning`
   #f2c14e, contribución `--success` #4fc2b2. Medidos: ≥ 3:1 sobre el fondo y
   ≥ 4,5:1 con la tinta oscura; luminancias separadas > 0,08. Directo e
   indirecto no llevan color: su señal es la forma (lupa, código de barras) y
   el nombre escrito.
3. **A3 P4, la línea de tiempo cuenta monedas, no pesos.** La ficha no da
   cifras de renta para la retención, y las tablas de d. 16–17 están vetadas
   (§0). Una moneda por mes (12) contra un impuesto del año de 14 → saldo a
   pagar 2. Rótulos «Pasa un mes», «Caja de retenciones», «Impuesto del año»
   en `textos.js` (A3). Un botón por mes, sin bloqueo de «Siguiente».
4. **A4, el nivel del tanque se conserva entre pantallas.** Empieza en 60 %;
   cada desagüe baja 20, así que tras P2–P4 el tanque llega vacío a P5 y la
   manguera ya está habilitada. Cada boquilla sube 30 y hace crecer su
   montaña. «Siguiente» espera el desagüe de la pantalla (P2–P4) y un
   préstamo (P5). Rótulos «Abrir», «Nivel del tanque», «Interna», «Externa»,
   «billones» en `textos.js` (A4).
5. **A5.** Las fichas se arrastran o se tocan (ficha y luego plato); en P2 y P3
   solo está activo el plato de la pantalla y «Siguiente» espera las tres
   fichas. En P5 la reforma cae al plato contraccionista aunque se suelte en
   el expansivo (lo que pide la especificación). Inclinación 7° por ficha;
   el globo se mueve 0,065 px por unidad de Y₀, tope ±26 px. Y₀ sale de
   `produccion(modelo(...))` de T1: base 1.275; con las tres expansivas 1.667;
   con las tres contraccionistas 955; reforma (t 0,30) 1.159. Empresa y
   región no tienen personaje en el elenco: van con un ícono de trazo sobre
   el mismo disco claro de 72 px. Rótulos de las perillas y la ecuación en
   `textos.js` (A5).
6. **A1, caras a 12,5 px** para que «Instrumentos» quepa en la columna a
   320 px.

## Mediciones (sonda, 320 y 375 px, todas las pantallas)

| Pieza | Pantallas | Contraste malo | Letra mín. | Toques < 44 | Desborde |
|---|---|---|---|---|---|
| A1 lupa | 6 | 0 | 12 | 0 | 0 |
| A2 buzones | 4 | 0 | 12 | 0 | 0 |
| A3 cajeros | 5 | 0 | 12 | 0 | 0 |
| A4 tanque | 7 | 0 | 12 | 0 | 0 |
| A5 balanza | 6 | 0 | 12 | 0 | 0 |

Videos: `01-pf26-a1-lupa`, `02-pf26-a2-buzones`, `04-pf26-a3-cajeros`,
`07-pf26-a4-tanque`, `09-pf26-a5-balanza`, cada uno `-320` y `-375.webm`.
