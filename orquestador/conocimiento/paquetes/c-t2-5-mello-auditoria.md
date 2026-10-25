# Auditoría T2-5 · las correcciones de T2-4 y el PR #516

Mello → L · 24 de octubre de 2026.

**Fuentes:**
- `delta-t2-4.md` de Near y `figuras-t2-4.md` de Watari, leídos con Artifact.
- El PR #516, leído en el repo en solo lectura.
- Main en `256a1e2`.

**Criterios:** H1–H10 y el Kit. Para #516, el §5 de `logitos-temas-conta-v1.md`.

**Comprobaciones:**
- Medí con `node scripts/inflesz.mjs` todos los textos de 10 palabras o más de Near y los que propongo: 20 textos, ninguno bajo 65.
- Corrí las pruebas del PR y una simulación de la resolución que propongo.

## Veredictos

| Entrega | Veredicto | Lo mínimo |
|---|---|---|
| Cuadra por valor | **FALLA** | Un cambio de forma (H7): «Iba aquí» a los 0,7 s del error. |
| Del diario al mayor | **FALLA** | La misma pausa, más dos cambios de banco: la línea mala de A6 y una frase repetida. |
| Las que vuelven a cero | **PASA** | Sin cambios en este lote. Sigue en pie lo de T2-3. |
| PR #516 | **FALLA** | El dibujo está bien, pero el PR choca con main. Basta un rebase y dejar una sola definición. |

Las tres correcciones son de una línea o de una celda, y los textos ya están medidos. Con eso las apruebo sin otra vuelta.

## 1 · Cuadra por valor · FALLA

**Lo que está bien:**
- **Watari, completar.**
  - Antes de «Comprobar», el hueco es un tramo fijo de 28 px con «?», sin línea de nivel, y la suma del haber dice «?».
  - La prueba C5 de geometría queda bien definida: con cualquier cifra escrita, el tramo mide lo mismo.
  - Las columnas se mueven al comprobar (0 ms) y el veredicto llega a los 380 ms (H5 y C4-1).
- **Watari, juzgar y encontrar.**
  - Sin sumas ni columnas antes de decidir (E8).
  - Los renglones son botones de 44 px.
- **Watari, la frase de consecuencia.** La de «Sobran $X…» sale del dato.
- **Watari, los nombres a 320 px.** Su propia corrección: ya no se parten palabras.
- **Near, los 6 retros de línea buena.**
  - Cada uno nombra lo que creyó el estudiante y lo devuelve al hecho, sin señalar la línea.
  - Todos pasan INFLESZ, entre 70,6 y 106,5.
- **E3 con «del computador», como decidiste.** Lo medí con los dos textos ya cambiados:
  - el hecho: «Con un cheque de $650 abona $400 a la hipoteca y el resto a la deuda del computador.» (18 · 74,6);
  - el porqué: «La deuda del computador recibe lo que queda del cheque: $250. Aquí dice $520, y la diferencia de $270 se divide por 9.» (23 · 68,0).
- **Near, la maqueta.** Que aún muestre el E1 viejo no cambia la forma: el E1 de tres renglones entra en el mismo encontrar.

**Corrección mínima (Watari): la pausa de «Iba aquí» (H7).**

- **Lo que dice la forma.** En el paso de 380 ms escribe: «Llegan la pastilla, «Iba aquí» con la cifra correcta, el retro de Near […] La pausa baja de 0,7 s a 380 ms, como piden Mello y L».
- **Nadie lo pidió.** En T2-3 pedí que el veredicto llegara a los 380 ms después de la consecuencia, que es C4. No pedí mover «Iba aquí».
- **El dialecto es otro.** El canon (`disenadores-de-celula-v1` §4) dice que «Iba aquí» llega 0,7 s después del error. El código de main lo cumple: `RETARDO_IBA_MS = 700` y `RETRASO_REVELA_MS = 700`.
- **Por qué importa.** La pausa deja ver el error antes de ver la respuesta.
- **El orden correcto:**
  - 0 ms, la consecuencia;
  - 380 ms, la pastilla y el retro;
  - 380 + 700 ms, «Iba aquí».

  En el acierto no cambia nada.

## 2 · Del diario al mayor · FALLA

**Lo que está bien:**
- **Watari:**
  - El diario va completo arriba y el mayor pasado abajo.
  - Las líneas de las T son botones de 44 px. Mide 44 px a 320 y 58 px a 375, sin un botón dentro de otro.
  - El cotejo de Cuenta, Lado y Monto sale de los datos (H2) y se lee aunque el diario quede fuera de la pantalla.
  - El acierto va en neutro, porque el error es del libro y no del estudiante: es buena decisión.
  - Las cuatro T se barajan por intento (H6).
  - No hay saldo ni se elige el lado.
  - Midió 42 estados sin fallas.
- **Near:**
  - Los dos revisar van al final y el mayor llega con los 5 renglones: no hay respuesta pendiente a la vista.
  - Salen los tres tipos de error.
  - Las cifras están bien: A7, 4.800 → 8.400, diferencia de 3.600; B7, 2.500 → 5.200, diferencia de 2.700. Las dos se dividen por 9.
  - Las cifras caben en la regla de 9.999 de Watari.
  - B6 y B7 caen en T distintas, y ninguna es el inverso de un origen.

**Corrección mínima:**

1. **Watari: la misma pausa del §1.** En revisar, «Iba en la línea punteada» llega 0,7 s después de «No va aquí».
   - El texto distinto se justifica, porque «Iba aquí» no cabe en un botón de 44 px.
2. **Near: A6 y A7 caen en la misma T (D5).** Las dos líneas malas del caso A son de Flota y equipo de transporte. Después de A6, en A7 basta con tocar «la de Flota otra vez», y el caso A vuelve en cada intento impar.
   - A7 no se puede mover: 4.800 es la única cifra del caso con dos dígitos distintos de cero para trasponer.
   - Se mueve A6. Los $4.000 de Letras por pagar del 4 de enero caen en el **haber de Bancos**, que también es vecina del mismo asiento.
   - Línea mala: Bancos · H · 4 ene · 4.000. La T de Letras queda vacía, igual que antes.
   - Porqué: «El 4 de enero, los $4.000 son de Letras por pagar. En el mayor cayeron en Bancos, su vecina de asiento.» (21 · 86,6)
   - Líneas buenas: Bancos D 5.000, Bancos H 800, Acciones H 5.000 y Flota D 4.800, todas con Rv.
   - **Mejora la trampa:** Bancos queda con dos líneas en el haber del mismo día, y solo el monto las separa. Ese es el punteo.
   - **Revisé C1:** los origen de Bancos se juegan antes, y el r5 de Letras salió de destino en A5.
3. **Near: la frase repetida en el error.** Watari ya pinta «Esta línea coincide con su renglón en cuenta, lado y monto». Las plantillas Rv, Rt y Rl empiezan diciendo lo mismo. Se quita esa primera oración y quedan así:
   - Rv: «Busca un valor que cayó en la T de otra cuenta del mismo asiento.» (14 · 94,9)
   - Rt: «Compara cada cifra con la del diario, dígito por dígito.» (10 · 78,5)
   - Rl: «Compara el lado de cada valor con el lado que tiene en el diario.» (14 · 94,9)

## 3 · Las que vuelven a cero · PASA

Este lote no la toca, y el veredicto de T2-3 sigue en pie.

Recordatorio para Misa: el periodo de las opciones y de la caja de utilidad sale de `mes` y `mesSiguiente`. Debe decir «al año siguiente» y «= Utilidad del año», no el «abril» ni el «del mes» de la maqueta (H2).

## 4 · PR #516 · FALLA

**El dibujo pasa, y es mejor que el de main.**
- La ficha mide 10 de ancho (x = 39) en vez de 12. Con 12, entre la ficha y la división y el marco quedaban 3 px, y el sistema pide 4 o más en reposo.
- El §3 autoriza el ajuste: «se ajusta el dibujo, no el sistema».
- Sus 10 pruebas leen la geometría del SVG publicado, y las corrí: 10 de 10 en verde.
- Contra el §5:
  - **§5.4 (movimiento):** cubierto por L8. Un solo elemento, solo transform, 400 ms con la curva del sistema y nada con movimiento reducido.
  - **§5.1 a §5.3 (los nueve a 32 px en gris, la tarjeta a 320 y 375, el contraste):** los midió la Célula D en main (`e29a5e7`, con capturas) para el mismo dibujo con la ficha 2 px más ancha. No los volví a medir.

**Por qué falla:**
1. **Choca con main.** Mientras tanto, la Célula D integró los cuatro logitos T1-T4 en `identificadoresA.jsx` (`e29a5e7`), y ahí está `CasilleroDeCuentas` con la ficha de 12, la que deja 3 px.
   - `identificadoresDeTema.js` queda en conflicto.
   - Si se resuelve dejando los dos imports, el nombre `CasilleroDeCuentas` queda declarado dos veces y el build se rompe.
   - La prueba A5 de la Célula D no ve los 3 px, porque compara constantes, no el SVG.
2. **El CI rojo no viene del logito.** La rama salió de `4bb8b62b`, 139 commits atrás.
   - Falla «ninguna marca combinante anda suelta» por `scripts/canon.mjs`, línea 46, que main ya arregló en `aaf5a06`.
   - La rama también arrastra un `orquestador/estado/l.md` viejo, que pisaría el tuyo.

**Corrección mínima (Misa):**
- Hacer rebase sobre main. Eso arregla el CI y saca el `l.md` viejo.
- Al resolver, quedarse con una sola definición:
  - en `identificadoresA.jsx`, la función `CasilleroDeCuentas` se cambia por `export { CasilleroDeCuentas } from "./casilleroDeCuentas.jsx";`, como ya se hace con `CajonDePaso`;
  - en `identificadoresDeTema.js` se deja el registro de main tal cual, sin la línea ni el import que agrega el PR.
- Actualizar el comentario de `identificadoresA.jsx` que dice «la geometría es la del §3, tal cual»: ahora tiene la ficha de 10.

**Lo simulé sobre main:**
- `logito-t2`: 10 de 10.
- `identificadores-a`: 15 de 15.
- `sin-caracteres-de-control`: en verde.
- El cambio en el archivo de la Célula D es de una línea (más el comentario), así que no hace falta pedirle nada.

## Lo que no hice

- No vi las piezas construidas ni el cuerpo del PR, porque no tengo `gh`. Las cifras de Playwright del PR no las verifiqué.
- No corrí la suite completa sobre la simulación: tarda más de 9 minutos aquí. El CI la corre después del rebase.
