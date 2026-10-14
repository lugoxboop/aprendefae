# Trabajo nocturno

Escrito el 13 de octubre de 2026, para las noches en que Mateo no está y el
Vigía es quien mantiene vivas las conversaciones.

---

## Por qué existe este documento

El Vigía no dirige: reactiva. Lee el final de cada turno y, si encuentra la
marca `[SIGO]`, manda «continuar». **Un turno que termina sin `[SIGO]` apaga esa
célula hasta la mañana**, aunque el agente tuviera trabajo de sobra. No es que se
pierda una hora: se pierde la noche entera.

Por eso la regla de la noche no es «trabaja bien», es **no te detengas**. Un
turno que acaba en una pregunta es un turno que apaga la célula. Preguntar de día
es barato; de noche cuesta ocho horas.

Esto cambia el cálculo de las decisiones. De día, ante una duda razonable, se
consulta. De noche, **se decide, se escribe la decisión y se sigue**, y se deja
anotado qué se decidió y con qué razón, para que por la mañana se pueda revisar.
Una decisión escrita y revisable por la mañana vale más que una célula apagada.

---

## La regla del `[SIGO]`

Va al final del turno, en su propia línea, exacta, sin nada después.

**Lleva `[SIGO]`:** queda trabajo por hacer, aunque sea de otra tarea; se está
esperando a un agente de la propia célula; se entregó algo y se pasa a lo
siguiente; **se cayó el navegador o se perdió la conexión** —eso no es un
problema irresoluble, es un reintento—; se tomó una decisión que por la mañana
habrá que revisar.

**No lleva `[SIGO]`:** nunca, de noche, salvo que la cola esté vacía de verdad y
no quede ni una tarea de las de abajo. Eso no debería pasar: la cola de cada
célula está pensada para durar más que la noche.

Si un agente cree que debe parar, **antes de parar escribe por qué, elige la
tarea siguiente de su cola y sigue**. El motivo queda anotado para la mañana.

---

## Qué decide cada general, sin consultar

Esto no es una lista de permisos: es el trabajo del general. Si un general
consulta estas cosas, el cuello de botella se traslada al coordinador y la
noche se pierde igual.

- **El contenido y su corrección**: qué enseña una pieza, cómo se redacta, qué
  entra y qué sobra, qué errata del libro se respeta y cuál se corrige.
- **El orden y el recorte**: cuántas piezas, cuántas actividades, dónde corta un
  tema, qué cabe en una sesión de estudio.
- **Los FP de una actividad nueva**: se asignan con la escala del catálogo por
  dificultad —fácil 10, medio 25, difícil 50, experto 90—. Eso NO es tocar
  puntajes de estudiantes.
- **El diseño dentro de su tema**: medidas, espaciados, estados, textos de
  interfaz propios de la pieza.
- **Resolver un desacuerdo entre dos de sus agentes.** Decide el general y lo
  escribe.
- **Rechazar el trabajo de su propio auditor** si tiene una razón mejor,
  dejándola escrita. Un auditor no es un jefe.
- **Parar una tarea que resultó mala idea** y pasar a la siguiente de la cola.

---

## Qué se escala, y cómo NO frenarse mientras tanto

Solo tres cosas suben a Mateo:

1. **Datos o puntajes de estudiantes.**
2. **Contenido ya publicado** que habría que cambiar.
3. **Producción**: desplegar, correr migraciones.

Y una regla que las vuelve inofensivas de noche: **nada de lo escalado detiene a
nadie**. Todo lo que se escala se escribe en una lista para la mañana y la célula
sigue por el camino provisional:

- ¿Un nombre de cuenta ya publicado no coincide con el que haría falta? Se usa el
  publicado más reciente y se anota. Repetir un nombre publicado no es tocar
  contenido publicado.
- ¿Falta la respuesta del profesor? El dato va como «dato del ejercicio» y el
  texto no afirma nada que no se pueda sostener.
- ¿Falta una fuente que un auditor no puede abrir? Marca ese punto como **«no
  verificado por mí»** y sigue. Esa marca vale más que el dato: es honesta y es
  revisable.

**Lo que nunca se hace para no frenarse:** inventar lo que el libro no dice.
Entre dejar un hueco marcado y rellenarlo con algo nuestro, el hueco marcado
siempre gana. Un hueco se ve; una invención, no.

---

## Las auditorías de noche

El auditor jefe es uno y las células son tres: si todas lo esperan, todas paran.

- **El PASA del auditor de la célula basta para construir.** Sin excepción de
  noche.
- **El auditor jefe entra solo en tres casos**: componentes compartidos, base de
  datos y migraciones, y contenido ya publicado.
- **Su auditoría es asíncrona**: se le manda y se sigue trabajando. Nadie se
  sienta a esperarla. Si llega con correcciones, se aplican sobre lo construido.
- **No lee el repositorio ni otras conversaciones.** Lo que audite va pegado
  dentro del mensaje, literal, partido y numerado si no cabe.

---

## El mapa de choques

Dos células trabajando a la vez sobre los mismos archivos se pisan. Esto es lo
que está repartido y lo que no.

**Cada célula tiene lo suyo y nadie más lo toca:**

| | Célula B | Célula C |
|---|---|---|
| Secciones | §5.3 y §5.4, pp. 191-206 | §5.5 y §5.6, pp. 207-261 |
| Temas | T5 y T6 | T7-1, T7-2 y T7-3 |
| Prefijo de rama | `feat/conta-b5-` | `feat/conta-c7-` |
| Prefijo de id | `t5-`, `t6-` | `t7-` |
| Migraciones | 0070 a 0089 | 0090 a 0109 |
| Su vista | la del tema que construye | la del tema que construye |
| Sus datos | `src/data/contabilidadT5*`, `T6*` | `src/data/contabilidadT7*` |

**Archivos compartidos que las dos tocan.** No se reparten, porque cada
actividad nueva los necesita. La regla es otra:

- `src/data/subjects.js`, `src/docente/etiquetasItem.js` y los registros de
  «Así se juega»: **cada célula edita SOLO dentro del bloque de su tema**, nunca
  reordena ni reformatea lo ajeno, y **actualiza desde `main` justo antes de
  empujar**. Dos añadidos en bloques distintos del mismo archivo se funden solos.
- **Componentes compartidos** —`UnaFrase`, `CuatroCapas`, el encabezado, los
  botones—: **solo los toca quien tenga el encargo explícito del coordinador**,
  y nunca dos a la vez. Si una célula cree que hay que cambiar uno, lo reporta y
  sigue con lo suyo; no lo cambia por su cuenta.
- **Los íconos** los reserva el coordinador. Un ícono es un significado: el
  mismo dibujo no puede querer decir dos cosas en el sitio. Se piden; no se
  eligen.
- **El vocabulario de cuentas** es de todos: si una célula necesita fijar un
  nombre que otra también usará, lo reporta y usa el que ya esté publicado
  mientras tanto.

---

## Nadie espera una fusión

Las células no fusionan: abren el PR y **siguen con la tarea siguiente**. El
coordinador fusiona, despliega y verifica en vivo. Un PR abierto no es un
bloqueo; es trabajo entregado.

Si al coordinador le toma una hora llegar a ese PR, la célula ya debería estar
dos tareas más adelante.

---

## Cuando algo sale mal de verdad

- **El navegador se cae o se pierde la conexión**: se reintenta, y el turno
  termina con `[SIGO]` igual. No es un problema irresoluble.
- **Una prueba se pone roja y no se sabe por qué**: NO se borra ni se debilita
  la prueba. Se deja el trabajo en su rama, se anota el síntoma con el texto
  exacto del fallo, y se pasa a la tarea siguiente.
- **Dos documentos del canon se contradicen**: decide Mateo, pero no de noche.
  Se elige el más reciente, se anota la contradicción y se sigue.
- **Un agente de la célula entrega algo inservible**: el general lo devuelve con
  el motivo concreto y le da otra tarea mientras tanto. No se queda esperando la
  corrección de uno solo.

---

## Lo que se entrega por la mañana

Cada general deja, al final de la noche, una lista corta:

1. Qué quedó entregado y en qué PR.
2. Qué decidió por su cuenta y con qué razón.
3. Qué quedó anotado para Mateo.
4. En qué punto exacto de su cola quedó.

Nada de esto se escribe durante la noche interrumpiendo el trabajo: se escribe
al final, o cuando una entrega lo justifique.
