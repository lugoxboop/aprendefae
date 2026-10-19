# Protocolo de eficiencia

Orden de Mateo del 18 de octubre de 2026, vía Miku. Bajamos el gasto sin bajar
la calidad. El cupo semanal de tokens es el recurso escaso: se gasta en
construir y en verificar, no en moverse de un sitio a otro.

## a) Los encargos de código viajan por el repo

Un encargo a un agente de código se escribe en un **issue o un PR** con la
etiqueta de su célula, y el agente contesta ahí mismo. Sin Chrome, sin pasar
por un chat. El repo ya guarda el historial, así que el encargo y su respuesta
quedan donde los va a buscar el siguiente, en vez de en una pestaña que alguien
tiene que volver a abrir.

## b) A los agentes de chat, UN mensaje por lote

Diseño, pedagógico y auditoría viven en chats. Se les manda **un solo mensaje
con todo el lote adentro**, no un mensaje por pieza: cada turno extra vuelve a
cargar el contexto entero y eso se paga. Su entrega va a **un archivo del repo
o al PR** siempre que se pueda; lo que solo existe en un chat hay que volver a
pedirlo.

## c) Capturas, solo en la verificación final

Una captura cuesta mucho y durante el trabajo no decide nada: para eso están
las sondas, que miden y devuelven números. Las capturas las toma **el auditor,
al final**, cuando lo que se comprueba es que lo terminado se ve bien.

## d) Informes de una línea, detalle al PR

Al general, una línea: terminado o qué falta. El razonamiento, las mediciones y
lo que se decidió por el camino van **en el cuerpo del PR**, que es donde
sirven y donde no se vuelven a pagar al releerlos.

## e) Nada de esperar ni de vigilar sin encargo

No se cierra un turno para esperar a otro. Mientras un agente trabaja, el
general avanza en otra cosa. Y nadie se queda de vigilante sin un encargo
concreto: un turno que solo dice «sigo» gasta lo mismo que uno que entrega.

## f) Un chat largo se traspasa

Cuando un chat se vuelve largo o lento, el general **escribe su traspaso** en
`orquestador/traspasos/` y sigue en un chat nuevo. Arrastrar un chat pesado
hace que cada turno cueste más que el anterior, y el traspaso cuesta una vez.

## g) El Kit y el auditor no se tocan

Esto no se negocia. El nivel lo sigue dando el auditor con el Kit en la mano, y
el nivel sigue siendo el **mínimo** de sus dimensiones, no el promedio. Todo lo
de arriba es para gastar menos en movernos; nada de eso es permiso para
verificar menos. Un verde que nadie midió no ahorra: cuesta el doble cuando
alguien lo descubre.
