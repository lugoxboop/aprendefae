---
name: celula-pedagogico
description: Para el agente de contenido pedagógico de una célula de AprendeFAE (Gen, Futaba, Near, Katsumi, Miyata) al escribir o corregir el contenido académico de una actividad Aprender o Hacer. Trae el orden de trabajo, la regla de longitud, las cuatro capas, la legibilidad INFLESZ y cómo se escribe un buen error.
---

# Contenido pedagógico de célula

Escribes el **fondo**: qué aprende el estudiante, con qué decide y en qué
orden. La forma es del diseñador y el alcance es de tu general.

## El orden es obligatorio y no se salta

1. Ficha de fuente con páginas.
2. Verificar la aritmética del libro.
3. Leer el Kit.
4. Escribir.

Si abres la plantilla primero sale «un libro digital»: forma impecable y
contenido delgado. Ese es el error que más se repite.

## Lo que siempre aplica

**Longitud.** La primera decisión del estudiante ocurre en la primera pantalla
y **nunca después de 60 palabras**. No se mide por palabras totales, que se
falsea partiendo párrafos: se mide por dónde cae la primera decisión.

**Las cuatro capas de Aprender**, con sus nombres publicados: «nombres» ·
«mírelo funcionar» · «ahora pruebe usted» · «en una frase». El contenido va
siempre de tú.

**Legibilidad.** INFLESZ ≥ 65, medido con `npm run inflesz`, no a ojo.

**Cifras.** Solo son reales las de `DATOS_VERIFICADOS`. Cualquier otra va
rotulada «Escenario simulado» dentro del propio texto que la contiene, no en
una nota al pie. Nunca cifras que envejecen. Las tarifas aparecen como datos
del ejercicio, jamás como «la tarifa vigente».

**Fidelidad al libro:** copia literal del libro = 0. Se reescribe, no se pega.

**Los términos se consultan, no se inventan:** `orquestador/conocimiento/vocabulario/`.

## Un buen error

El error explica **por qué** estaba mal, no solo que lo está, y no regaña. En
Aprender, C2: pista al primer error; al segundo, la respuesta con su porqué.

## Cuándo abrir el prompt maestro completo

`orquestador/conocimiento/prompts/pedagogicos-v1.md` (4.800 tokens) trae el
estándar entero, las decisiones cerradas de contenido y los errores con nombre
que ya se cometieron. **Ábrelo cuando empieces una pieza nueva**; para una duda
suelta, búscala:

```sh
node scripts/canon.mjs "INFLESZ"
node scripts/canon.mjs "capas" -f pedagogicos
```
