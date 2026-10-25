# T1 · Auditoría del #531 (00be273) y del #535 (9c1b646), tercera vuelta (Shoko, 24-oct)

La subió Sakuta tal como salió del chat de Shoko (6c926eca). El #531 quedó fusionado (ad898f9).

**#531 · 00be273 · Medio · PASA.** Es mi caso límite y lo resuelve: a 320×568 se ven a la vez las dos torres, lo que puso el estudiante, la corrección y «Siguiente», sin desplazar. El plegado en un renglón por parte es mejor que lo que pedí: `tiene ✕ $25.000 ✓ $325.000` pone el error y el valor correcto en la misma línea, que es justo lo que la devolución le manda comparar («pusiste lo que se movió, no con cuánto quedó»). D3 y D6 quedan en Medio y el tope lo pone la falta de prueba con estudiante ajeno, no la forma. Cierro la FALLA.

**#535 · 9c1b646 — una línea por pieza**

- **t1-1 · Medio · PASA** — la decisión 2 ya no se ve en el paso 0, y el chip de AFUERA guarda «su oficio», el dato correcto, no la respuesta errada. Retirado lo del rótulo.
- **t1-2 · Medio · PASA** — ENTRA ya no se atenúa en el paso 2: las dos devoluciones apuntan a un recuadro que sigue legible.
- **t1-4 · Medio · PASA** — con un solo «Anotar» el estudiante elige el caso antes de ver la corrección de las torres, así que las dos decisiones son independientes y D4 se sostiene. El chip ya no imprime la respuesta. Queda anotado, no como falla: los cuatro casos visibles desde el paso 0 reducen las combinaciones de las torres; es tu decisión de estructura y la acepto.
- **t1-6 · Medio · PASA** — la devolución ya dice por qué («es de la empresa, algo que tiene: es activo»), no solo que el informe estaba bien. Verifiqué una de las cinco; en la próxima vuelta mándame una ficha de otra familia (una de Ingresos o Gastos) para dejar constancia de que son distintas. No bloquea.
- **t1-7 · FALLA · prerrequisito de fidelidad** — ver abajo.
- **t1-8 · Medio · FALLA** — el ✗ quedó sobre el dato verdadero. La banda «Se apagaron 3 puntos.» lleva ✗ rojo mientras el botón «3» lleva ✓: la misma pantalla marca como incorrecto el hecho que acaba de dar por correcto. Lo demás quedó bien (✗ en el «1», ✓ en el «3»). Arreglo: la banda sin marca o con ✓; el ✗ se queda solo en el «1».

**t1-7.** El §10 arregla lo que yo pedí —la flecha correcta ahora se ve completa con los dos extremos («Utilidad neta → Activos y pasivos, en bloque») y la equivocada lleva ✗ y tachado— pero introduce un error de contenido que no puedo dejar pasar, y no es de nivel: es el prerrequisito, así que no se publica.

El nodo se llama «Activos y pasivos, en bloque» y tiene adentro «Aportes de los dueños», que es patrimonio. Y la flecha que la pieza enseña como correcta lleva la utilidad neta a ese bloque. Toda T1 enseña tres partes —lo que tiene, lo que debe, lo que es de los dueños— y la utilidad del ejercicio entra por la tercera: es exactamente el punto que t1-5 hace marcar torre por torre. Un estudiante que acaba de hacer t1-5 llega aquí y lee que la utilidad cae en activos y pasivos. Son dos piezas de la misma secuencia diciendo cosas contrarias.

**¿El §10 lo decidiste tú para cerrar el hueco del Gráfico 2.6, o salió del libro?** Si fue decisión de cierre, la salida limpia es nombrar el nodo por lo que de verdad agrupa —«Lo que tiene, lo que debe y lo que es de los dueños», o directamente «Estado de situación financiera»— con el mismo id, y la flecha queda correcta sin tocar la mecánica. Si salió del libro, que Futaba me mande el fragmento y lo reviso contra eso antes de insistir.

Capturas que necesito en la próxima vuelta, todas a 320:

| pieza | qué elegir | para qué |
|---|---|---|
| t1-7 | la misma flecha errada, con el nodo renombrado | cerrar el prerrequisito |
| t1-8 | el «1» otra vez | ver la banda sin el ✗ |
| t1-6 | una ficha de Ingresos o de Gastos, respondiendo Activo | confirmar que las cinco devoluciones son distintas |
