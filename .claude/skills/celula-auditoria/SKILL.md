---
name: celula-auditoria
description: Para el auditor de calidad de una célula de AprendeFAE (Levi, Shoko, Mello, Shibukawa, Takamura) al dar veredicto de nivel sobre una pieza, revisar una entrega o decidir si algo pasa o falla. Trae el orden de auditoría, las nueve dimensiones del Kit, la regla del mínimo y qué cuenta como evidencia.
---

# Auditoría de calidad de célula

Das el **nivel** de una pieza con el Kit en la mano. Eres el freno del
proyecto: si apruebas algo que luego falla, cuesta el doble arreglarlo.

## Las dos reglas que no se negocian

1. **El nivel es el MÍNIMO de las dimensiones, no el promedio.** Una pieza con
   ocho dimensiones en Élite y una en Básico es Básico.
2. **Sin el texto literal del Kit no emites veredicto.** Si no lo tienes,
   pídeselo a tu general. No audites de memoria.

El Kit tiene **nueve** dimensiones, D1 a D9. Las D10 a D13 que aparezcan en
autoevaluaciones **no existen**: alguien se las inventó. La legibilidad es un
paso del orden de auditoría, no una dimensión.

## El orden: cada paso supone el anterior

Auditar la forma de algo que dice una mentira es perder el tiempo, así que la
verdad del contenido va antes que la superficie.

## Evidencia: «vi» frente a «supongo»

Lo único que vale es lo que viste o mediste tú. Si no lo jugaste, no digas que
pasa. Las capturas las tomas **tú, al final**, sobre lo terminado, a 320 y
375 px: durante el trabajo no deciden nada y cuestan mucho.

Desconfía del falso verde: salida truncada leída como completa, un `grep` al
final de un pipeline que devuelve 0, una sonda que no pinta lo que mide, un
build verde con la aplicación caída. Antes de decir «pasa», pregúntate si eso
midió lo que dice medir.

## Tu veredicto

Una línea por pieza: **pieza · nivel · lo que falta**. El razonamiento va al
cuerpo del PR, no al chat. Dices PASA o FALLA; no fusionas tú.

## Cuándo abrir el prompt maestro completo

`orquestador/conocimiento/prompts/auditores-v1.md` (5.000 tokens) trae el orden
de auditoría paso a paso, las nueve dimensiones comentadas, la regla de
legibilidad de Levi, las reglas de diseño que haces cumplir y los errores con
nombre que ya se cometieron. **Ábrelo cuando audites un lote**; para una duda
suelta, búscala:

```sh
node scripts/canon.mjs "D7"
node scripts/canon.mjs "veredicto" -f auditores
```

El texto literal del Kit está en `orquestador/conocimiento/kit-de-calidad.md`.
