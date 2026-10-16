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

| | Célula B | Célula C | Célula D | Célula E |
|---|---|---|---|---|
| Secciones | §5.4, pp. 199-206 | §5.3 y §5.5-§5.6, pp. 191-198 y 207-261 | §5.0-§5.2, pp. 177-190 | banco de ejercicios, pp. 262-274 |
| Temas | T6 | T5 y T7-1, T7-2, T7-3 | T4 | `repaso-capitulo-5` |
| Prefijo de rama | `feat/conta-b5-` | `feat/conta-c7-` | `feat/conta-d4-` | `feat/conta-e5-` |
| Prefijo de id | `t6-` (y sus `b5-t5-*` ya publicados) | `t7-`, y `t5-` para lo nuevo de T5 | `t4-` | `r5-` |
| Migraciones | 0070 a 0089 | 0090 a **0149** | **0200 a 0249** | **0250 a 0299** |
| Su vista | la del tema que construye | la del tema que construye | `ContabilidadT4View` | `RepasoCapitulo5View` |
| Sus datos | `src/data/contabilidadT5*`, `T6*` | `src/data/contabilidadT7*` | `src/data/contabilidadT4*` | `src/data/repasoCap5*` |

El rango del coordinador es **0150 a 0199**, y la 0150 ya está gastada.

**Dónde entra cada tema nuevo en el índice, decidido por el coordinador antes
de que las células lleguen ahí.** D y E van a añadir cada una un tema a
`SUBJECTS.contabilidad.topics`, y si las dos lo ponen al final chocan en la
misma línea y además dejan el índice en un orden que no es el del libro. El
orden es este y no se discute en la rama:

1. `introduccion-contabilidad`
2. `cuentas-debe-haber`
3. `ingresos-gastos-y-caja`
4. **`efectivo-caja-menor-bancos`** ← Célula D, §5.1 y §5.2. Va aquí, antes de
   T5, porque en el libro va antes.
5. `activos-financieros`
6. `cuentas-por-cobrar`
7. `inventarios-periodico`
8. `inventarios-permanente`
9. `inventarios-descuentos-nic2`
10. **`repaso-capitulo-5`** ← Célula E. Va al final, siempre, porque repasa
    todo lo anterior. Ningún tema se añade después de él.

La prueba `src/contabilidad/__tests__/tema.test.mjs` afirma esa lista completa
y en ese orden. Las dos células la van a tocar: la segunda en fusionar
actualiza desde `main` antes de empujar y añade su id al lado del otro, sin
reordenar nada. **Esa prueba no se afloja**: afirma la lista entera a
propósito, para que un tema no pueda aparecer, desaparecer ni cambiarse de
sitio sin que alguien lo vea.


**El rango de C se amplió de 0109 a 0149 el 14 de octubre de 2026**, porque
T7-3 consumió hasta la 0109 exacta y la célula se habría quedado sin números a
mitad de tema. Un rango que se agota en silencio es un choque esperando: el
siguiente número libre es el de otra célula y nadie se entera hasta que dos
migraciones distintas se llaman igual.

**Los rangos nuevos no empiezan en 0110 por una razón.** Dejar hueco entre
rangos cuesta nada y permite ampliar el de en medio sin mover a nadie. Las
migraciones se aplican por orden de nombre y ningún hueco rompe eso: la 0150
corrió perfectamente con las 0104 a 0149 sin escribir.

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

## Cada general fusiona lo suyo

**Cambió el 15 de octubre de 2026, y es el cambio más importante que ha tenido
este documento.** Antes decía que las células no fusionan y que el coordinador
fusiona, despliega y verifica. Eso convirtió al coordinador en la puerta por
la que pasaba todo, y se vio el día que una célula entregó quince piezas
encadenadas mientras otra llevaba nueve horas detenida esperando una respuesta
de una línea. El cuello de botella no era la producción: era el permiso.

Ahora: **el general de cada célula fusiona el trabajo de su célula.** Abre el
PR, **espera el verde de CI**, comprueba que no pisa a nadie, y fusiona. No
pide permiso y no espera turno.

**La barra es CI, no la suite local. Cambió el 15 de octubre de 2026, por la
tarde.** Durante dieciocho horas CI estuvo caída y la barra fue correr la
suite entera y el build en la máquina de cada quien. CI volvió, y mantener la
barra local además de CI es pagar dos veces por la misma comprobación: son los
mismos archivos de prueba, y CI corre además las pruebas SQL sobre un Postgres
limpio, que en local no existen. Con cinco células, eso eran cuatro suites
completas de ocho minutos por cada entrega, cada noche.

Así que: **la suite local se corre mientras se construye, no como ceremonia
antes de fusionar.** Se corre entera en local solo cuando CI no está
disponible —y entonces se dice en el PR que la barra fue local, como se hizo
toda la noche del 14 de octubre—. Lo que NO cambia: no se fusiona nada sin
verde, y el verde de CI es el que manda. Un PR fusionado sin esperar a CI es
exactamente el agujero que esta regla deja abierto; no lo uses.

Lo que el coordinador sigue teniendo, y es lo único:

- **Lo compartido.** `subjects.js`, `etiquetasItem.js`, los componentes
  comunes, los íconos y el vocabulario de cuentas. Una célula edita dentro del
  bloque de su tema; cambiar la forma de uno de esos archivos sigue siendo del
  coordinador.
- **Los choques entre células.** Quién puede tocar qué, los rangos, los
  cortes de tema y qué hacer cuando dos células quieren lo mismo.
- **Los datos de estudiantes.** Nadie más los toca, ni para mirar.
- **Destrabar generales.** Un general detenido es el fallo más caro que tiene
  este montaje, y repararlo es trabajo del coordinador, no un favor.
- **Las migraciones que no son de catálogo**: las de esquema, los incidentes y
  comprobar que la base y la aplicación siguen diciendo lo mismo. Las de
  catálogo **ya no las corre nadie a mano**; ver abajo.

**Lo que el coordinador ya NO hace:** revisar y fusionar lo que la célula
puede fusionar sola. Si un general fusiona algo que rompe `main` o que pisa a
otra célula, el coordinador **se lo devuelve para que lo arregle él**. No lo
arregla por él. Arreglárselo enseña que alguien va detrás recogiendo, y esa
es exactamente la dependencia que este cambio existe para romper.

Y lo que no cambia: **ninguna célula toca producción**, y un PR abierto sigue
sin ser un bloqueo. Si algo tuyo espera, sigues por la pieza siguiente.

---

## Una pila fusionada al revés pierde los de en medio, y CI no se queja

El 16 de octubre Xeno encontró que dos trabajos terminados, revisados y
fusionados **no estaban en `main`**: las marcas ✓/✗ de `CampoCifra` (#253) y de
`MesaDelAsiento` (#254), con sus pruebas.

Qué pasó. Los tres PR estaban apilados: #251 → #253 → #254. Se fusionaron en
orden inverso al de la pila:

1. el #254 entró en la rama del #253;
2. el #251 entró en `main`;
3. el #253 entró en la rama del #251 — **que ya estaba fusionada**, así que su
   contenido quedó en una rama muerta.

Resultado: `main` se quedó con la marca de `ElegirLado` (#251) y sin las otras
dos. Los tres PR dicen «fusionado» y ninguno miente: cada uno entró en la rama
que tenía por base.

**Y CI nunca iba a avisar.** No hay nada roto que fallar: el código simplemente
no está. Las pruebas que lo vigilaban se fueron con él. Es el falso verde de
`herramientas.md` en su forma más limpia: **lo que no existe no falla.**

**La regla, y cuesta treinta segundos: después de fusionar una pila, se busca en
`main` una cadena distintiva de CADA PR.**

```bash
git fetch -q origin && git checkout main && git pull -q
for s in "Cifra correcta" "data-marca-cuenta" "data-marca-lado"; do
  printf '%-22s ' "$s"; git grep -l "$s" -- src | head -1 || echo "NO ESTÁ"
done
```

Que el PR esté cerrado con «Merged» **no es la comprobación**: la comprobación es
que la cadena esté en `main`. Y conviene escribir esa cadena en el propio PR
—«esto se busca en main como `data-marca-cuenta`»— para que cualquiera pueda
hacerlo sin leer el diff.

Dos cosas que ayudan a no llegar ahí:

- **Una pila se fusiona de abajo hacia arriba**, y cada PR se reapunta a `main`
  cuando su base entra. Si la base se fusionó y el PR sigue apuntando a ella, lo
  que entre no llega a ninguna parte.
- **Cuando una base se fusiona, GitHub reapunta solo los PR que colgaban de
  ella si la rama se borra.** Aquí no se borran ramas (y está bien: son el
  respaldo), así que el reapuntado **lo hace una persona**. Esa es la otra cara
  de la regla de no borrar ramas, y no estaba escrita.

## La prueba de guardia: cómo se entrega un término de una célula a otra

**Es de la Célula B, y es la mejor pieza de coordinación que ha producido este
montaje.** Se escribe aquí para que las cinco la usen.

**El problema.** Un término solo puede estar definido en un sitio. Pero la
célula que lo necesita hoy no siempre es la que va a ser su dueña mañana: T6
necesitaba «nota débito» mucho antes de que existiera T4, que es el tema al
que de verdad pertenece. Las salidas malas son dos: definirlo dos veces, y que
un estudiante lea dos definiciones distintas del mismo término; o no definirlo
y dejar un hueco.

**Lo que hizo la Célula B.** Puso una glosa provisional en su tema **y** una
prueba que se pone roja el día que otro tema defina ese término:

```
src/contabilidad/__tests__/b5-t6-glosa-nota-debito.test.mjs
★★★ GUARDIA: ningún tema fuera de T6 define «nota débito»
```

El 15 de octubre de 2026 la Célula D publicó A4 de T4, que define «nota
débito», y la guardia saltó. Exactamente el día que tenía que saltar.

**Lo que la hace buena de verdad no es la prueba: es el mensaje de fallo.**
Lleva dentro las instrucciones de qué hacer cuando salte, y a quién le toca:

```
══ OTRO TEMA YA DEFINE «NOTA DÉBITO» ══
Qué hacer (Célula B):
  1. Reemplazar la glosa provisional por la definición publicada, o quitarla
     y remitir a ese tema.
  2. Pasar el cambio por auditoría: es contenido publicado.
  3. No debilitar ni borrar esta prueba: cuando la glosa ya no exista, se
     retira con ella, en el mismo PR.
```

Quien se encuentra ese rojo —que puede ser otra célula, meses después— no
tiene que entender el contexto ni preguntar a nadie: lo lee.

**Y la otra mitad: la Célula D no tocó esa prueba.** Tenía una prueba ajena en
rojo bloqueándole la entrega y la dejó en paz, explicó por qué en el PR y
esperó. Si la hubiera aflojado, nadie se habría enterado hasta que un
estudiante leyera las dos definiciones.

**La regla, para las cinco:**

- Si necesitas un término que pertenece a un tema que todavía no existe,
  defínelo provisionalmente **y escribe la guardia**.
- La guardia lleva las instrucciones dentro del mensaje de fallo, nombrando a
  la célula a la que le tocará actuar.
- La guardia se retira en el mismo PR que retira la glosa, nunca antes.
- **Una prueba ajena en rojo no se toca.** Se reporta y se sigue por otra
  pieza. Aflojarla es la única manera de que este mecanismo falle.

---

## Las migraciones se aplican solas, y quién es la mirada ahora

> **ENCENDIDO Y COMPROBADO el 15 de octubre a las 22:55 UTC.** Lo que sigue
> dejó de ser un plan ese día: Mateo guardó el secreto `SUPABASE_DB_URL` y el
> primer despliegue creó la tabla de control. Lo que viene después de este
> recuadro describe cómo funciona hoy, no cómo se pensaba que funcionaría.
>
> **Y cómo se comprobó importa, porque casi me engaño.** El paso del
> despliegue decía «success»… pero está escrito para NO fallar cuando falta el
> secreto, así que da «success» en los dos casos. Un paso en verde no probaba
> nada. Lo que lo probó fue mirar la base: `migraciones_aplicadas`, que antes
> no existía, apareció con 93 filas y la última sellada a las 22:55. Esa tabla
> solo la pudo crear el despliegue con la clave buena.
>
> **La regla que queda:** cuando se enciende algo, la prueba se busca en el
> sitio donde el efecto tiene que haber ocurrido, no en el informe de quien lo
> encendió.

**Cambió el 15 de octubre de 2026.** Hasta esa mañana cada migración la pegaba
el coordinador en el editor SQL de Supabase. Esa mañana había **doce
esperando** y cuatro células paradas: el cuello de botella ya no era fusionar
—eso se había soltado la noche anterior— sino la base de datos.

La tentación era repartir la llave de producción entre los cinco generales. No
se hizo, y la razón no es la confianza: **lo que protegía ese paso manual no
era la mano, era la mirada.** Alguien que no había escrito la migración la
revisaba antes de que tocara la base. Si la corre quien la escribe, se pierde
exactamente eso, y se pierde sobre el único recurso que no se puede deshacer
barato.

Así que la mirada se escribió una vez, en `scripts/guardian-migraciones.mjs`,
y ahora corre en **cada propuesta**, al instante, sin dormirse. Comprueba lo
mismo que se comprobaba a mano:

1. **Nada destructivo.** `ALTER`, `DROP`, `TRUNCATE`, `DELETE`, `UPDATE`,
   `GRANT` o `REVOKE` fuera de un comentario se rechazan. Solo el rango del
   coordinador (0150-0199) puede cambiar el esquema, y tiene que decirlo con
   una marca explícita.

   **Con una excepción, y es la que vas a usar: el retiro blando.** Desde que
   Mateo dejó a las células retirar y fusionar actividades de Contabilidad,
   cualquier célula puede escribir desde **su propio rango**:

   ```sql
   -- GUARDIAN: retiro blando de catalogo
   update public.actividad_catalogo
      set retirada = true
    where activity_id in ('b5-t6-a7', 'b5-t6-a5');
   ```

   Esa línea de comentario es el permiso, y la forma tiene que ser exactamente
   esa: la tabla del catálogo, el campo `retirada`, a `true`, con
   `where activity_id in (...)`. Si el archivo trae además un `delete`, un
   `alter` o un update que ponga otro campo, el guardián lo rechaza **aunque
   lleve la marca**, y el reproche te lo dice con esas palabras. No borres la
   fila: `fp_history` apunta a ella, el retiro blando es reversible con un
   `false`, y el panel docente ya sabe enseñar el nombre de una actividad
   retirada (`src/data/retiradas.js`).

   **Por qué existe esta puerta.** El mismo día, dos células se quedaron
   paradas pidiéndole al coordinador una línea de SQL: B con el #281 y C con
   el #269. Una de las dos me propuso prestarle la marca de esquema a su
   constructor, y eso habría abierto la puerta entera —con esa marca pasa
   cualquier `delete`—. Una puerta estrecha y escrita vale más que una ancha y
   prestada.
2. **El número, dentro del rango de su célula.** Un número fuera de rango es
   un choque que se descubre con las dos migraciones ya escritas.
3. **La fila dice lo mismo que `subjects.js`**: materia, tema, modalidad,
   dificultad y FP, uno por uno. Es la que de verdad protege a un estudiante:
   si la migración dice 25 FP y la aplicación dice 50, alguien cobra lo que no
   es.

Y el despliegue aplica las que falten, **antes de subir el sitio**. El orden
importa: publicar primero y migrar después deja un rato en el que el sitio
ofrece una actividad cuya fila no existe, y quien la termine en ese rato no
cobra. La tabla `public.migraciones_aplicadas` lleva la cuenta; se sembró con
las 93 que ya estaban aplicadas a mano, porque si no el primer despliegue
habría intentado reaplicar desde la 0001.

**Lo que esto te pide a ti, general: nada nuevo.** Sigues escribiendo las
migraciones igual. Lo que cambia es que ya no avisas de «corre la 0204» y ya
no esperas. Lo que no cambia es que una migración floja rebota: el guardián
comprueba lo mismo que comprobaba una persona, y rechaza antes de que se pueda
fusionar.

**Tres cosas que se aprendieron escribiéndolo**, por si alguien lo toca:

- Un `on conflict ... do update set` **no es destructivo**: es la forma
  idempotente de un insert. La primera versión lo rechazaba, o sea que
  rechazaba la manera más segura de escribir una migración.
- El guardián mira **solo lo que la propuesta añade**, no la historia. La
  primera versión juzgaba las ochenta del repositorio y rechazaba doce que
  llevaban meses aplicadas y correctas.
- **No se comprueba que el id empiece por el prefijo de la célula**, aunque
  suene razonable: las Células B y C también construyeron piezas de Macro
  desde sus rangos, con ids como `en-que-talla-va`. Esa regla, escrita,
  rechazaba migraciones correctas. La comprobación 3 ya caza un id equivocado
  sin inventarse una regla que la realidad no cumple.

---

## Cuando CI no corre

Un CI en rojo dice una de dos cosas, y confundirlas cuesta la noche entera:
que el código falló una prueba, o que **la prueba nunca se ejecutó**. Lo
segundo no es un defecto que arreglar: es una obra fuera del edificio.

**Cómo se distinguen, sin adivinar.** El rojo que evaluó algo tiene pasos, un
runner y una duración que se parece a la de los días anteriores. El rojo que no
evaluó nada se ve así:

- el trabajo dura **segundos**, no minutos;
- `steps` viene **vacío**: ni «Traer el código» llegó a correr;
- `runner_name` viene vacío y `runner_id` en cero: nadie recogió el trabajo;
- y, la señal que lo cierra, **falla igual en todas las ramas y en los dos
  flujos a la vez**, incluidos commits que ya habían salido en verde.

Eso último es lo que lo prueba. Un defecto vive en un commit; una caída de
cuenta cae sobre todos. Antes de tocar una línea de código, se mira si el
commit de al lado —uno que ya pasó— también está rojo ahora.

**Qué NO se hace.** No se investiga, no se «arregla» código que no está roto,
no se debilita una prueba para ver si así pasa, y sobre todo no se espera el
verde. Esperar el verde cuando no hay quién lo dé es pararse hasta la mañana.

**Cuál es la barra mientras tanto.** La local, completa y sin recortar: la suite
entera más el build. Lo que pasa eso, está entregado. El coordinador la repite
antes de fusionar, y las fusiones y los despliegues se acumulan en cola hasta
que CI vuelva. Una cola no es un bloqueo: es trabajo esperando un trámite.

**Lo que sí se escala, una vez.** Que CI no corre, con la evidencia de arriba en
tres líneas, porque restablecerlo suele ser cosa de la cuenta —límites, saldo,
permisos— y eso no lo toca nadie más que Mateo. Se escribe y se sigue
trabajando; no se pregunta dos veces ni se espera respuesta para continuar.

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

## La vara de lo crítico: ¿se puede deshacer?

Mateo, 15 de octubre, corrigiéndome a mí y mandándomelo pasar a las cinco
células:

> Crítico es solo lo que no se puede deshacer: borrar o dañar datos de
> estudiantes, cambiar contenido que yo ya aprobé, o algo que tumbe la
> plataforma. Un punto de diferencia en un redondeo, cómo se interpreta una
> regla, qué componente se ajusta y cómo: todo eso lo resuelves tú y me lo
> cuentas en el resumen final, no me lo preguntas. Antes de preguntarme algo,
> pregúntate si se puede deshacer; si se puede, decide tú.

**La prueba, antes de escribirle a nadie por encima de ti: ¿se puede
deshacer?** Si sí, decides y lo cuentas en el informe. Si no, preguntas.

| Se deshace → **decides tú** | No se deshace → **preguntas** |
|---|---|
| Cambiar cómo se calcula algo de aquí en adelante | Recalcular o borrar FP ya otorgados |
| Ajustar un componente, un color, un tamaño | Reescribir contenido que Mateo ya aprobó |
| Interpretar una regla del canon | Un cambio que puede tumbar la plataforma |
| Abrir, cerrar o rehacer un PR | Borrar una rama o reescribir la historia de `main` |
| Decidir el alcance de tu propia tanda | Gastar dinero o escribirle a un tercero |

**El caso que la originó, por si sirve de calibre.** Encontré que el navegador
le enseñaba 56 FP al estudiante y la base guardaba 57, en las 137 actividades
evaluativas. Lo llevé a Mateo porque toca puntajes. Me respondió que no: el
arreglo era una línea, no tocaba ninguna fila guardada y se podía revertir en
un minuto. **Lo reversible era el arreglo, no el defecto.** Lo irreversible
habría sido recalcular las filas ya otorgadas — y eso sí se queda esperando.

**Y la otra mitad, que es la que cuesta más:** esto vale en los dos sentidos.
Un general que le pregunta a su coordinador lo que puede decidir él convierte
al coordinador en el cuello de botella, igual que el coordinador que le
pregunta a Mateo. Si lo que te frena es que alguien confirme algo reversible,
no estás siendo prudente: estás gastando el recurso más escaso que hay aquí,
que es la atención de quien está por encima de ti.
