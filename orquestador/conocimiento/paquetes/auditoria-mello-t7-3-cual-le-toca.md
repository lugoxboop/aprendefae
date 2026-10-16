# Auditoría · T7-3 «El descuento condicionado» · `cual-le-toca` rehecha

Mello → L · 15 de octubre de 2026

**Veredicto: PASA CON CORRECCIONES.** La pantalla está bien. Pero, al sacar la factura de aquí, `sobre-que` se quedó sin sus datos, y eso hay que arreglarlo antes de construir.

## Lo que pasa

- **Los 10 días salen bien contados según el libro (p. 252).**
  - Del 25 de mayo al 4 de junio hay 10 días, verificado con código: del 26 al 31 de mayo son 6, y del 1 al 4 de junio son 4.
  - Es el conteo del propio libro: en su ejemplo, pagar el 4 de junio una factura del 25 de mayo da el 15 % (3.990.000 × 15 % = 598.500), y 15/10 es el 15 % «si le paga la factura a los diez días».
  - La fecha de mayo es la de la errata C7-6, ya resuelta.
- **C1: ninguna pantalla anterior da la respuesta.**
  - `condiciones` (15 %, 30 %, Ninguno) enseña qué significa 15/10, pero no da ninguna fecha. Su figura no tiene ni venta ni pago.
  - `que-es` no tiene fechas.
  - Así, lo que mide `cual-le-toca` es contar los días.
- **E8: la figura no hace la cuenta.**
  - Antes de responder, `PLAZOS_A3(false)` muestra «Venta 25 may» al inicio y las marcas de 10, 20 y 30 días, sin ninguna fecha de pago.
  - El «Pago · 4 jun» sale solo en el acierto.
- **Los distractores se defienden:**
  - «5 %» es el error real de contar también el 25, que da 11 días y cae en 5/20.
  - «Ninguno» es el error de ver dos meses distintos y creer que ya se pasó el plazo.
- **Nada es falso.** La pista («Mayo tiene 31 días…») orienta sin dar el número.
- **INFLESZ.** Los cuatro textos de 10 palabras o más dan entre 81,6 y 95,7 con mi estimador.
- **Presupuesto.** Lo que se ve a la vez es como mucho 59 de 60 (55 con el acierto a la vista).

## Corrección obligatoria

**`sobre-que` se queda sin datos (suficiencia).**
- Near quitó de `cual-le-toca` dos cosas:
  - la factura (precio de lista $4.200.000, menos el 5 % comercial, igual a $3.990.000);
  - la frase de los $4.488.750.
- Near dice que los valores «siguen en el ejemplo, que va antes». En esta pieza no hay ningún ejemplo antes: las pantallas son portada, `condiciones`, `que-es`, `cual-le-toca`, `sobre-que` y resumen.
- Así, `sobre-que` pregunta «¿Sobre qué valor se calcula el 15 %?» con tres cifras sueltas ($3.990.000, $4.488.750, $4.200.000). El estudiante no puede saber qué es cada una antes de equivocarse.
- **Corrección:** llevar los dos datos a la propia `sobre-que`, que es donde se usan. Así C1 se cumple igual: los datos de una pregunta en su misma pantalla no delatan nada, porque lo que se califica es elegir la base.
  - **La figura `FACTURA`, antes de la pregunta:** lista, menos el 5 % comercial, igual al valor a facturar.
  - **La frase**, corregida para que no quede incompleta: «Con el IVA y la retención, Santa Martha debe $4.488.750.» (10 palabras; INFLESZ 84,7). Es 3.990.000 + 638.400 − 139.650; la versión publicada decía solo «Con el IVA», y faltaba la retención.
- **Near debe medir `sobre-que` con su contador.** El acierto ya trae la figura del pago y el asiento. Si pasa de 60, el asiento puede ir en la pantalla siguiente o en el resumen, pero la factura no puede salir de la pregunta.

## Para Misa (menor)

- **La figura que muestra la pantalla.** Near describe la figura de antes de responder como «15/10 · 5/20 · n/30 sobre 10 · 20 · 30 días», pero `PLAZOS_A3(false)` no tiene `rotDia`. Por eso pinta «Venta 25 may» y lo que lleva cada plazo («10 días 15 %», «20 días 5 %», «30 días: sin descuento»).
- **Eso está bien:** `condiciones` ya lo enseñó, la figura no delata el conteo y la marca de la venta ayuda a contar.
- **Qué hacer:** usar `PLAZOS_A3(false)` tal cual y actualizar la descripción del paquete.
