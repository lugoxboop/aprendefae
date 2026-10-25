# T1 · Auditoría del #559, la secuencia de cu0-a1 y «Ocho leen lo mismo» (Shoko, 24-oct)

La subió Sakuta tal como salió del chat de Shoko (6c926eca). Se auditó sobre 1c581b4. Nota de Sakuta: en las paradas 6 y 9 las capturas mostraban el estado después de dos toques; el estado de error sí existe y se mandó aparte (SEQ-paradas-320).

**Veredicto del lote: FALLA.** Dos pantallas con error de contenido, que es prerrequisito, y una parada que no es parada. El resto pasa.

- **cu0-a1 · pantalla 1 · FALLA (prerrequisito, fidelidad)** — la devolución dice «Son cinco, y anotar es solo el tercero», pero la pantalla 2 enseña que el sistema permite **siete** verbos y que registrar es uno de ellos, y la fila de paradas que acompaña todas las pantallas tiene cinco puntos. En dos pantallas seguidas el estudiante lee «son cinco» y «son siete» sobre lo mismo. En el libro son dos cosas distintas —los pasos del ciclo y los verbos de la definición— pero aquí nada las distingue: las dos frases empiezan igual. Hay que nombrar qué se cuenta en cada una.
- **cu0-a1 · pantalla 8 · FALLA (prerrequisito, fidelidad)** — el estado de situación financiera no cuadra: Caja 240.000 + Equipo 25.000 = 265.000 contra Cuentas por pagar 15.000 + Aportes 350.000 = 365.000, y se cierra con «y 3 líneas más». Dos pantallas después, «El informe tiene dos lados» enseña 415.000 = 415.000. Es la cifra de un estado financiero en una pieza cuyo tema es que los dos lados dan igual: o las líneas ocultas cuadran y se dice, o los números se ajustan para que cuadren a la vista. Además, «Cuentas por pagar 15.000» choca con el hecho de la pantalla 4 y 5, donde Caleja queda debiendo 25.000 por el computador.
- **cu0-a1 · pantalla 6 · Básico · FALLA** — la parada no para: en el «antes» ya hay tres opciones tocables y en el «después» aparece «✓ Correcto» con el texto de apoyo, pero ninguna de las tres es incorrecta. Dijiste que elegiste primero una opción mala y no veo el estado de error en ninguno de los dos tamaños. Si «Se guarda» y «Al Estado» no tienen devolución de error, no es una pregunta, es un botón disfrazado: D4 y D6 quedan en Básico.
- **cu0-a1 · pantalla 9 · Básico · FALLA** — lo mismo: «Los jefes» sale con ✓ y no hay captura de «El Estado» ni de «Los clientes» marcados mal. Mándame ese estado.
- **Ocho leen lo mismo · pantalla 3 · Básico · FALLA** — igual, y aquí pesa más: las cuatro frases son plausibles («Anota en libros lo que pasó», «Saca la cuenta de los impuestos») y son precisamente las confusiones que la pieza existe para deshacer. Sin un mensaje distinto por frase equivocada, el estudiante que elige «Anota en libros» no se entera de por qué esa se queda corta. Además la lista se corta a media opción 4 en las dos anchuras: la cuarta no se lee completa antes de elegir.

Lo demás pasa. El apoyo bajo la barra en las pantallas 1, 3 y 9 no lo cuento como falla —37 px de desplazamiento está dentro del tope de 40 que mide Kaede— pero en esas tres el apoyo es lo que dice qué tocar, así que vale la pena que Mai mire si cabe sin desplazar. «Siguiente pieza» partido en dos renglones tampoco bloquea.

| dónde | hoy | pegar |
|---|---|---|
| cu0-a1 · 1 · devolución | «Son cinco, y anotar es solo el tercero.» | «Del hecho a la decisión hay cinco pasos, y anotar es el tercero.» |
| cu0-a1 · 2 · apoyo | «Toca cada cosa que el sistema permite hacer. Son siete. Registrar, que es anotar, es solo una.» | «Toca cada cosa que el sistema permite hacer con esos hechos. Son siete verbos, distintos de los cinco pasos.» |

Futaba valida las dos contra su ficha del capítulo 1, y la aritmética de la pantalla 8 contra el libro.

Para la re-auditoría, todas a 320: cu0-a1 · 6 con «Se guarda»; cu0-a1 · 9 con «El Estado»; Ocho · 3 con «Anota en libros lo que pasó» y con «Saca la cuenta de los impuestos» (dos errores conceptualmente distintos, que es lo que pide D6 en Avanzado); y la pantalla 8 con las cifras ya cuadradas.
