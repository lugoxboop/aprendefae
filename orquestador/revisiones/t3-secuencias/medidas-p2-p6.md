# P2 y P6 en SecuenciaAprender · medidas (#578, lote 16)

Sonda: `FUENTES_NPM=… node scripts/t3/medir-secuencias.mjs --capturas … --json …` (Chromium, 320×568 y 375×667, Sora e Inter servidas desde @fontsource). Cada estado se pone escribiendo lo guardado en sessionStorage y se mide lo que pinta la página.

## Previas

Fuentes: 400 12px Inter: cargada · 600 12px Inter: cargada · 600 14px Inter: cargada

- 320: cabecera de la vista hasta el Panel **105 px** (hasta la figura 248); bloque de navegación 56 px; Sora 700 cargada
- 375: cabecera de la vista hasta el Panel **107 px** (hasta la figura 250); bloque de navegación 56 px; Sora 700 cargada

| cifra | Inter tabular | ancho a 320 |
|---|---|---|
| $5.935.000 | 12/400 | 68.6 |
| $1.958.550 | 12/400 | 68.6 |
| $3.976.450 | 12/400 | 68.6 |
| $6.020.000 | 12/400 | 68.6 |
| $8.620.000 | 12/400 | 68.6 |
| $14.650 | 12/400 | 49.8 |
| $14.800 | 12/400 | 49.8 |
| $6.450 | 12/400 | 42 |
| $5.935.000 | 12/600 | 68.6 |
| $1.958.550 | 12/600 | 68.6 |
| $3.976.450 | 12/600 | 68.6 |
| $6.020.000 | 12/600 | 68.6 |
| $8.620.000 | 12/600 | 68.6 |
| $14.650 | 12/600 | 49.9 |
| $14.800 | 12/600 | 49.9 |
| $6.450 | 12/600 | 42.1 |
| $5.935.000 | 14/600 | 80 |
| $1.958.550 | 14/600 | 80 |
| $3.976.450 | 14/600 | 80 |
| $6.020.000 | 14/600 | 80 |
| $8.620.000 | 14/600 | 80 |
| $14.650 | 14/600 | 58.2 |
| $14.800 | 14/600 | 58.2 |
| $6.450 | 14/600 | 49.1 |

## Encaje

| ancho | pieza | n | pantalla | estado | figura fija | líneas apoyo | desborde | letra<12 | toque<44 | corte en botón | barra | pastilla tapa | razón con pista | renglón más ancho | errores |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 320 | el-mes-de-san-calixto | 1 | apertura | apertura | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 2 | cobrados | sin-responder | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 2 | cobrados | uno-cobrado | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 2 | cobrados | pista | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 2 | cobrados | pista-retirada | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 2 | cobrados | acierto | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 2 | cobrados | dos-errores | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 3 | haber | sin-tocar | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 3 | haber | factura-jcc | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 3 | haber | factura-mps | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 4 | asiento | sin-responder | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 4 | asiento | casilla-activa | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 4 | asiento | acierto | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 4 | asiento | al-reves-pista | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 4 | asiento | al-reves-dos-errores | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 4 | asiento | dos-errores-Cuentas por cobrar – clientes | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 4 | asiento | dos-errores-Aportes sociales | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 4 | asiento | centro-mas-largo | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 5 | gastos | sin-responder | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 5 | gastos | acierto | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 5 | gastos | pista-gasto | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 5 | gastos | dos-errores-gasto | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 5 | gastos | pista-caja | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 5 | gastos | dos-errores-caja | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 6 | utilidad | sin-responder | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 6 | utilidad | escribiendo | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 6 | utilidad | pista-23150 | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 6 | utilidad | pista-14800 | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 6 | utilidad | acierto | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 6 | utilidad | dos-errores-23150 | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 6 | utilidad | dos-errores-14800 | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | el-mes-de-san-calixto | 7 | separan | pendiente | 150 | 0 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 8 | cierre | paso-1 | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | el-mes-de-san-calixto | 8 | cierre | paso-2 | 150 | 3 | 18 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 1 | apertura | paso-1-objetivo | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 1 | apertura | sin-responder | 150 | 4 | 22 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 1 | apertura | acierto | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 1 | apertura | pista-si | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 1 | apertura | dos-errores-si | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 2 | separar | sin-responder | 150 | 3 | 18 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 2 | separar | pista | 150 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 2 | separar | dos-errores-operacion | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 2 | separar | dos-errores-interes | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 2 | separar | paso-5 | 150 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 2 | separar | acierto | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 3 | antes | sin-responder | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 3 | antes | escribiendo | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 3 | antes | pista-6020000 | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 3 | antes | pista-6105000 | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 3 | antes | acierto | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 3 | antes | dos-errores-6020000 | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 3 | antes | dos-errores-6105000 | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 4 | impuesto | sin-responder | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 4 | impuesto | escribiendo | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 4 | impuesto | pista-1986600 | 150 | 4 | 22 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 4 | impuesto | pista-3976450 | 150 | 4 | 22 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 4 | impuesto | acierto | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 4 | impuesto | dos-errores-1986600 | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 4 | impuesto | dos-errores-3976450 | 150 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/258 | 0 |
| 320 | lo-que-deja-el-periodo | 5 | estado | tramo-1 | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | 234/250 | 0 |
| 320 | lo-que-deja-el-periodo | 5 | estado | tramo-2 | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | 234/250 | 0 |
| 320 | lo-que-deja-el-periodo | 5 | estado | tramo-3 | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | 234/250 | 0 |
| 320 | lo-que-deja-el-periodo | 6 | reparte | sin-responder | 150 | 3 | 18 | 0 | 0 | 0 | no | — | no | 239/258 | 0 |
| 320 | lo-que-deja-el-periodo | 6 | reparte | pista | 150 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | 239/258 | 0 |
| 320 | lo-que-deja-el-periodo | 6 | reparte | dos-errores-por-pagar | 150 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | 239/258 | 0 |
| 320 | lo-que-deja-el-periodo | 6 | reparte | paso-2 | 150 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | 239/258 | 0 |
| 320 | lo-que-deja-el-periodo | 6 | reparte | acierto | 150 | 4 | 22 | 0 | 0 | 0 | no | 0 | no | 239/258 | 0 |
| 320 | lo-que-deja-el-periodo | 6 | reparte | centro-mas-largo | 150 | 3 | 18 | 0 | 0 | 0 | no | — | no | 239/258 | 0 |
| 320 | lo-que-deja-el-periodo | 7 | por-pagar | pendiente | 150 | 0 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 8 | a-su-estado | sin-responder | 150 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 8 | a-su-estado | pista | 150 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 8 | a-su-estado | dos-errores-utilidad | 150 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 8 | a-su-estado | dos-errores-impuesto | 150 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 8 | a-su-estado | acierto | 150 | 4 | 22 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 9 | acacias | pendiente | 150 | 0 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 320 | lo-que-deja-el-periodo | 10 | cierre | paso-1 | 150 | 3 | 0 | 0 | 0 | 0 | no | — | no | 244/258 | 0 |
| 320 | lo-que-deja-el-periodo | 10 | cierre | paso-2 | 150 | 2 | 12 | 0 | 0 | 0 | no | — | no | 244/258 | 0 |
| 375 | el-mes-de-san-calixto | 1 | apertura | apertura | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 2 | cobrados | sin-responder | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 2 | cobrados | uno-cobrado | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 2 | cobrados | pista | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 2 | cobrados | pista-retirada | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 2 | cobrados | acierto | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 2 | cobrados | dos-errores | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 3 | haber | sin-tocar | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 3 | haber | factura-jcc | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 3 | haber | factura-mps | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 4 | asiento | sin-responder | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 4 | asiento | casilla-activa | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 4 | asiento | acierto | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 4 | asiento | al-reves-pista | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 4 | asiento | al-reves-dos-errores | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 4 | asiento | dos-errores-Cuentas por cobrar – clientes | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 4 | asiento | dos-errores-Aportes sociales | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 4 | asiento | centro-mas-largo | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 5 | gastos | sin-responder | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 5 | gastos | acierto | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 5 | gastos | pista-gasto | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 5 | gastos | dos-errores-gasto | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 5 | gastos | pista-caja | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 5 | gastos | dos-errores-caja | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 6 | utilidad | sin-responder | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 6 | utilidad | escribiendo | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 6 | utilidad | pista-23150 | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 6 | utilidad | pista-14800 | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 6 | utilidad | acierto | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 6 | utilidad | dos-errores-23150 | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 6 | utilidad | dos-errores-14800 | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | el-mes-de-san-calixto | 7 | separan | pendiente | 200 | 0 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 8 | cierre | paso-1 | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | el-mes-de-san-calixto | 8 | cierre | paso-2 | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 1 | apertura | paso-1-objetivo | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 1 | apertura | sin-responder | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 1 | apertura | acierto | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 1 | apertura | pista-si | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 1 | apertura | dos-errores-si | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 2 | separar | sin-responder | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 2 | separar | pista | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 2 | separar | dos-errores-operacion | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 2 | separar | dos-errores-interes | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 2 | separar | paso-5 | 200 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 2 | separar | acierto | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 3 | antes | sin-responder | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 3 | antes | escribiendo | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 3 | antes | pista-6020000 | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 3 | antes | pista-6105000 | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 3 | antes | acierto | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 3 | antes | dos-errores-6020000 | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 3 | antes | dos-errores-6105000 | 200 | 1 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 4 | impuesto | sin-responder | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 4 | impuesto | escribiendo | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 4 | impuesto | pista-1986600 | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 4 | impuesto | pista-3976450 | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 4 | impuesto | acierto | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 4 | impuesto | dos-errores-1986600 | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 4 | impuesto | dos-errores-3976450 | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 243/313 | 0 |
| 375 | lo-que-deja-el-periodo | 5 | estado | tramo-1 | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | 234/305 | 0 |
| 375 | lo-que-deja-el-periodo | 5 | estado | tramo-2 | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | 234/305 | 0 |
| 375 | lo-que-deja-el-periodo | 5 | estado | tramo-3 | 200 | 3 | 0 | 0 | 0 | 0 | no | — | no | 234/305 | 0 |
| 375 | lo-que-deja-el-periodo | 6 | reparte | sin-responder | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | 239/313 | 0 |
| 375 | lo-que-deja-el-periodo | 6 | reparte | pista | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | 239/313 | 0 |
| 375 | lo-que-deja-el-periodo | 6 | reparte | dos-errores-por-pagar | 200 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | 239/313 | 0 |
| 375 | lo-que-deja-el-periodo | 6 | reparte | paso-2 | 200 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | 239/313 | 0 |
| 375 | lo-que-deja-el-periodo | 6 | reparte | acierto | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | 239/313 | 0 |
| 375 | lo-que-deja-el-periodo | 6 | reparte | centro-mas-largo | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | 239/313 | 0 |
| 375 | lo-que-deja-el-periodo | 7 | por-pagar | pendiente | 200 | 0 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 8 | a-su-estado | sin-responder | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 8 | a-su-estado | pista | 200 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 8 | a-su-estado | dos-errores-utilidad | 200 | 3 | 18 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 8 | a-su-estado | dos-errores-impuesto | 200 | 2 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 8 | a-su-estado | acierto | 200 | 3 | 0 | 0 | 0 | 0 | no | 0 | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 9 | acacias | pendiente | 200 | 0 | 0 | 0 | 0 | 0 | no | — | no | — | 0 |
| 375 | lo-que-deja-el-periodo | 10 | cierre | paso-1 | 200 | 2 | 0 | 0 | 0 | 0 | no | — | no | 244/313 | 0 |
| 375 | lo-que-deja-el-periodo | 10 | cierre | paso-2 | 200 | 1 | 0 | 0 | 0 | 0 | no | — | no | 244/313 | 0 |

## Delta v3 (#586): P2-7, P6-7 y P6-9

Sonda: `FUENTES_NPM=… node scripts/t3/medir-secuencias.mjs --solo 'a2-.*/separan$|a6-.*/(por-pagar|acacias)$' --capturas …`. 38 estados (19 por ancho): figura fija 150/200 en todos; letra < 12, toque < 44, palabra partida, barra, errores de página, pastilla sobre el modelo y razón con la pista: 0.
### P2-7, P6-7 y P6-9: lo que ocupa la figura

| ancho | pantalla | estado | ocupa / reserva | marca | lista | opciones | fila de control (alto · lectura · puente) | línea de datos | apoyo: líneas · desborde |
|---|---|---|---|---|---|---|---|---|---|
| 320 | 7 separan | sin-responder | 96 / 150 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · vacío | — | 3 · 0 |
| 320 | 7 separan | una-clave | 96 / 150 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · vacío | — | 3 · 0 |
| 320 | 7 separan | pista | 96 / 150 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · vacío | — | 3 · 0 |
| 320 | 7 separan | pista-equipo | 96 / 150 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · vacío | — | 3 · 0 |
| 320 | 7 separan | acierto | 96 / 150 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · «6.450 +15.000 −6.800 = 14.650» | — | 4 · 22 |
| 320 | 7 separan | dos-errores-gastos-pagados | 96 / 150 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · «6.450 +15.000 −6.800 = 14.650» | — | 3 · 0 |
| 320 | 7 separan | dos-errores-equipo | 96 / 150 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · «6.450 +15.000 −6.800 = 14.650» | — | 3 · 0 |
| 320 | 7 por-pagar | sin-responder | 132 / 150 | — | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 320 | 7 por-pagar | acierto | 132 / 150 | — | 132 | 44 · 44 · 44 | — | — | 3 · 0 |
| 320 | 7 por-pagar | pista-caja | 132 / 150 | — | 132 | 44 · 44 · 44 | — | «Impuesto de renta $1.958.550» | 3 · 18 |
| 320 | 7 por-pagar | dos-errores-caja | 132 / 150 | — | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 320 | 7 por-pagar | pista-al-reves | 132 / 150 | — | 132 | 44 · 44 · 44 | — | «Impuesto de renta $1.958.550» | 3 · 18 |
| 320 | 7 por-pagar | dos-errores-al-reves | 132 / 150 | — | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 320 | 9 acacias | sin-responder | 150 / 150 | 16 | 132 | 44 · 44 · 44 | — | — | 3 · 0 |
| 320 | 9 acacias | acierto | 150 / 150 | 16 | 132 | 44 · 44 · 44 | — | — | 3 · 0 |
| 320 | 9 acacias | pista-al-reves | 150 / 150 | 16 | 132 | 44 · 44 · 44 | — | «Las Acacias · Pérdida $100.000» | 3 · 18 |
| 320 | 9 acacias | dos-errores-al-reves | 150 / 150 | 16 | 132 | 44 · 44 · 44 | — | — | 3 · 0 |
| 320 | 9 acacias | pista-utilidad | 150 / 150 | 16 | 132 | 44 · 44 · 44 | — | «Las Acacias · Pérdida $100.000» | 3 · 18 |
| 320 | 9 acacias | dos-errores-utilidad | 150 / 150 | 16 | 132 | 44 · 44 · 44 | — | — | 3 · 0 |
| 375 | 7 separan | sin-responder | 96 / 200 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · vacío | — | 2 · 0 |
| 375 | 7 separan | una-clave | 96 / 200 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · vacío | — | 2 · 0 |
| 375 | 7 separan | pista | 96 / 200 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · vacío | — | 2 · 0 |
| 375 | 7 separan | pista-equipo | 96 / 200 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · vacío | — | 2 · 0 |
| 375 | 7 separan | acierto | 96 / 200 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · «6.450 +15.000 −6.800 = 14.650» | — | 3 · 0 |
| 375 | 7 separan | dos-errores-gastos-pagados | 96 / 200 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · «6.450 +15.000 −6.800 = 14.650» | — | 2 · 0 |
| 375 | 7 separan | dos-errores-equipo | 96 / 200 | — | — | 44 · 44 · 44 · 44 | 44 · «Caja $14.650 · Utilidad $6.450» · «6.450 +15.000 −6.800 = 14.650» | — | 2 · 0 |
| 375 | 7 por-pagar | sin-responder | 132 / 200 | — | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 375 | 7 por-pagar | acierto | 132 / 200 | — | 132 | 44 · 44 · 44 | — | — | 3 · 0 |
| 375 | 7 por-pagar | pista-caja | 132 / 200 | — | 132 | 44 · 44 · 44 | — | «Impuesto de renta $1.958.550» | 2 · 0 |
| 375 | 7 por-pagar | dos-errores-caja | 132 / 200 | — | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 375 | 7 por-pagar | pista-al-reves | 132 / 200 | — | 132 | 44 · 44 · 44 | — | «Impuesto de renta $1.958.550» | 2 · 0 |
| 375 | 7 por-pagar | dos-errores-al-reves | 132 / 200 | — | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 375 | 9 acacias | sin-responder | 150 / 200 | 16 | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 375 | 9 acacias | acierto | 150 / 200 | 16 | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 375 | 9 acacias | pista-al-reves | 150 / 200 | 16 | 132 | 44 · 44 · 44 | — | «Las Acacias · Pérdida $100.000» | 3 · 18 |
| 375 | 9 acacias | dos-errores-al-reves | 150 / 200 | 16 | 132 | 44 · 44 · 44 | — | — | 2 · 0 |
| 375 | 9 acacias | pista-utilidad | 150 / 200 | 16 | 132 | 44 · 44 · 44 | — | «Las Acacias · Pérdida $100.000» | 3 · 18 |
| 375 | 9 acacias | dos-errores-utilidad | 150 / 200 | 16 | 132 | 44 · 44 · 44 | — | — | 2 · 0 |

