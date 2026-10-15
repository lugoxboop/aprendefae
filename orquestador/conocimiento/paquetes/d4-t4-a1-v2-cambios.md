**T4 · A1 «La caja» · cambios de la versión 2 sobre la v1** (`d4-t4-a1-v1.md`).
- Autora: Katsumi. Motivo: las decisiones de Yujiro del 14 de octubre de 2026 (orden de la célula, sección «Decisiones de Yujiro sobre la lectura de Shibukawa»).
- Lo que no se nombra aquí queda igual que en la v1.
- INFLESZ **medido** con `src/herramientas/inflesz.js`, como en la v1.

## Revisión de la v1 contra cada decisión

| Decisión | ¿Toca A1? | Qué cambia |
|---|---|---|
| C5 · puente con el Tema 3 | Sí | Pantalla nueva, P1 (cambio 1) |
| C5 · nunca «sobrante» ni «faltante» a secas | Sí | El acierto de P7 decía «un error o un faltante» (cambio 3) |
| I5 · lo que solo se ve en el asiento se presenta como «mira el asiento de la p. X» | Sí | El acierto de P5 (cambio 2) |
| C1, C2, C3 · nombres de cuentas | No | A1 solo usa Caja, Bancos e Ingresos por servicios |
| E3 · sin números de cheque | No | A1 no muestra ninguno |
| C4 · nota débito | No | A1 no la nombra |
| Corte definitivo | No | A2 sigue llamándose «El fondo fijo», así que la línea «Siguiente» de P8 no cambia |

## Cambio 1 · pantalla nueva: P1 «De la caja del Tema 3 a dos cuentas»

Va **entre la portada y «Qué es Caja»**. Las pantallas de la v1 corren un número: P1 → P2, … P8 → P9. Es una sola idea: el dinero del Tema 3 se parte en dos cuentas.

- «En el Tema 3, la caja era la plata de la empresa, sin importar dónde estuviera: la que entra con un cobro y la que sale con un pago.» (76,9)
  - *[Lectura de Yujiro (C5) del Tema 3, comprobada en `contabilidadTema3.js`: el rótulo «Caja: entra y sale plata» y las definiciones «Cobro es la plata que entra a la caja» y «Pago es la plata que sale de la caja». «Sin importar dónde estuviera» es mi forma de decir «en sentido amplio»: el Tema 3 no lo dice con esas palabras, solo nunca separa caja de banco.]*
- «Esa idea sigue valiendo. Aquí esa plata se parte en dos cuentas: Caja, la que está a la mano, y Bancos, la que está en el banco.» (89,5)
  - *[«Sigue valiendo» es a propósito: no contradice el Tema 3. Que la plata se parte en Caja y Bancos lo dicen los títulos de §5.1 (p. 179) y §5.2 (p. 186).]*
- «Esta pieza mira la primera: Caja. Bancos tiene su propia pieza más adelante.» (75,7)
- Pie: «Basado en el libro, pp. 179 y 186»

## Cambio 2 · P5 (antes P5, ahora P6), acierto de la consignación

- v1: «Así es. La plata salió de la caja y llegó al banco. Bancos se debita por $435.000 y Caja se acredita por $435.000.» (90,8)
- **v2:** «Así es. La plata salió de la caja y llegó al banco. Mira el asiento de la p. 180: Bancos se debita por $435.000 y Caja se acredita por $435.000.» (91,3)
- Por qué (I5): que esta consignación sale de Caja lo muestra el asiento 2 de la p. 180. La regla general de la misma página también lo dice, pero el estudiante lo ve en el asiento.

## Cambio 3 · P7 (ahora P8), acierto del control que falla

- v1: «… Si una sola persona hace las dos cosas, un error o un faltante puede pasar sin que nadie lo vea.» (90,1)
- **v2:** «Así es. El libro pide separar a quien recibe el dinero de quien lo registra. Si una sola persona hace las dos cosas, un error o una pérdida de plata puede pasar sin que nadie lo vea.» (88,4)
- Por qué (C5): «faltante» a secas está prohibido, y aquí no es un faltante de caja menor, así que no se usa la palabra. La segunda frase sigue siendo deducción mía.

## Cómo queda el orden

P0 Portada · **P1 De la caja del Tema 3 a dos cuentas (nueva)** · P2 Qué es Caja · P3 Los cheques de la caja · P4 La regla · P5 Sus Servicios cobra · P6 La consignación · P7 Los siete controles · P8 ¿Qué control falla? · P9 Resumen.

Las cifras no cambian: solo $435.000 (p. 180), en P5 y P6.

## Términos que se añaden

| Término | Estado | Dónde |
|---|---|---|
| cobro · pago | Tema 3 (`PIEZA_VENDER_NO_ES_COBRAR`) | P1 |
