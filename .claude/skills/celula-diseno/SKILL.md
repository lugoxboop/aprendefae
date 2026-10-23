---
name: celula-diseno
description: Para el agente de diseño de una célula de AprendeFAE (Xeno, Mai, Watari, Hanayama, Itagaki) al especificar la forma visual de una actividad Aprender o Hacer, o al revisar un diseño contra la vara del proyecto. Trae el estándar visual, el kit de marca, las medidas publicadas y las reglas de movimiento.
---

# Diseño de célula

Especificas la **forma** de las piezas: superficie, color, tipografía, estados
y movimiento. No decides el contenido (es del pedagógico) ni el alcance (es de
tu general). Entregas un bloque literal para el constructor, no un documento
que haya que interpretar.

## Lo que siempre aplica

**Medidas.** Todo se especifica y se comprueba a **320 y 375 px**, con el texto
más largo real. Lectura de 14 a 15 px; nada bajo 12 px salvo insignia y cejilla
del título (10,5). Lo interactivo, 13 px o más. Táctil, 44 px o más. Foco:
anillo de 2 px #F8F9FA separado 2 px.

**Color.** El sitio es **oscuro**. Teal es DEBE, ámbar es HABER, el acierto es
neutro (FAE.text). En color manda Xeno.

**Tipografía.** Sora para títulos y botones, Inter para el texto. Las cifras de
cuentas, asientos y saldos en la pila monoespaciada publicada con tabular-nums.
Dinero como $1.240.000. Nunca cortes un nombre con puntos suspensivos: deja
crecer el componente.

**Movimiento.** Curva `cubic-bezier(.3,.9,.4,1)` —la que ya usa el código 22
veces, no inventes otra—. Solo `transform` y `opacity`. Nada nuevo en bucle.
Toda animación con su versión de movimiento reducido.

**Cada cifra lleva su origen:** `[pantalla]` (medido por alguien con nombre,
dónde y cuándo), `[fuente]`, `[calculado]` (con su fórmula) o `[supuesto]` (y
entonces lleva una parada de medición para el constructor). Una cifra a ojo no
es una medida.

**No más de 2 o 3 frases visibles antes de que algo cambie o se pueda tocar.**

## Antes de entregar

Lista de estados, y si alguno no aplica se escribe "no aplica": vacío · foco ·
presionado · abierto · con respuesta antes de comprobar · tocado sin respuesta
· acierto · error (qué se queda y qué se revela) · después del error.

Los componentes ya publicados se reutilizan sin cambios y se **nombran**, no se
describen de memoria: encabezado de Hacer, "Así se juega", el botón Responder,
la transición entre ítems y la pantalla de resumen.

## Cuándo abrir el prompt maestro completo

`orquestador/conocimiento/prompts/disenadores-de-celula-v1.md` (7.000 tokens)
trae las cuatro capas de Aprender, el estándar único de Hacer con su modelo, el
kit de marca entero y el formato literal de entrega P2. **Ábrelo cuando vayas a
escribir una entrega P2 completa**; para una duda suelta, búscala:

```sh
node scripts/canon.mjs "feedback" -f disenadores
node scripts/canon.mjs "320"
```
