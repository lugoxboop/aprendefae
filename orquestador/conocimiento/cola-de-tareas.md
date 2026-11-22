# La cola de tareas de Mateo y el turno automático

La cola es **una sola lista** donde se anota toda orden que Mateo le dé a
cualquier agente, y de donde un turno automático va sacando trabajo cada 5
horas. Vive en los **Issues de GitHub** del repo (`lugoxboop/aprendefae`),
porque es lo único que estas sesiones pueden leer y escribir de forma fiable
(GraphQL y por tanto los Projects v2 están bloqueados; la API REST no).

## El tablero

El tablero es la vista de Issues filtrada por la etiqueta `cola-mateo`:

```
https://github.com/lugoxboop/aprendefae/issues?q=is%3Aissue%20label%3Acola-mateo
```

Cada tarjeta es un Issue con **tres cosas obligatorias**:

- la etiqueta `cola-mateo` (la marca como parte de la cola),
- **una** prioridad: `prioridad:alta` · `prioridad:media` · `prioridad:baja`,
- **un** estado: `estado:pendiente` · `estado:en-curso` · `estado:hecha` ·
  `estado:bloqueada`.

El **título** es la tarea en una frase. El **cuerpo** lleva el contexto, los
criterios de aceptación y, si aplica, la célula o área (`celula-a`…`celula-e`).

## Cómo se anota una orden

Cuando Mateo le da una orden a cualquier agente (por Miku, por Erwin o directo),
**esa orden se anota aquí como tarjeta** antes o al momento de empezar, con su
prioridad y `estado:pendiente`. Quien recibe la orden la anota; si pasa por
Miku o Erwin, la anotan ellos. Así nada se pierde y el turno la puede tomar.

Crear una tarjeta (REST):

```sh
gh api -X POST repos/lugoxboop/aprendefae/issues \
  -f title="<tarea en una frase>" \
  -f body="<contexto, criterios de aceptación, área>" \
  -f 'labels[]=cola-mateo' -f 'labels[]=prioridad:media' -f 'labels[]=estado:pendiente'
```

## Cómo trabaja el turno automático

Corre en la nube **cada 5 horas**. En cada turno:

1. **Lee la cola**: las tarjetas pendientes, de mayor a menor prioridad.
   ```sh
   gh api "repos/lugoxboop/aprendefae/issues?labels=cola-mateo,estado:pendiente&state=open&per_page=100" \
     --jq 'sort_by([.labels[].name|select(.=="prioridad:alta")] | length) | reverse'
   ```
   En la práctica: primero las `prioridad:alta`, luego `media`, luego `baja`.
2. **Si la cola está vacía, termina** sin gastar nada más.
3. Toma la de mayor prioridad y la pasa a `estado:en-curso`.
4. **La hace completa**, siguiendo las reglas del repo: el protocolo de
   eficiencia, y en cualquier trabajo visual la **regla de evidencia visual**
   (grabar video a 320 y 375 px cuadro por cuadro, verificador aparte que da
   PASA/NO PASA, entregar el video). Abre su PR; con CI verde y el PASA del
   auditor, fusiona.
5. La marca `estado:hecha` y **cierra** el Issue, con un comentario de qué hizo
   y el PR.
6. Sigue con la siguiente hasta **agotar el límite** de la sesión. Si una tarea
   queda a medias por falta de presupuesto, la devuelve a `estado:pendiente`
   con un comentario; **nunca** deja una tarjeta en `en-curso` abandonada.

## Lo irreversible no se ejecuta

Si una tarea implica algo **irreversible** —tocar o borrar datos/puntajes de
estudiantes, o algo que pueda tumbar la plataforma (p. ej. una migración
destructiva en producción)— el turno **no la ejecuta**: la pasa a
`estado:bloqueada`, explica por qué en un comentario y la deja esperando a
Mateo. Todo lo reversible lo decide y lo hace el turno.

### Transiciones de estado (REST)

```sh
# tomar: pendiente -> en-curso
gh api -X DELETE repos/lugoxboop/aprendefae/issues/<n>/labels/estado:pendiente
gh api -X POST   repos/lugoxboop/aprendefae/issues/<n>/labels -f 'labels[]=estado:en-curso'

# terminar: en-curso -> hecha, y cerrar
gh api -X DELETE repos/lugoxboop/aprendefae/issues/<n>/labels/estado:en-curso
gh api -X POST   repos/lugoxboop/aprendefae/issues/<n>/labels -f 'labels[]=estado:hecha'
gh api -X PATCH  repos/lugoxboop/aprendefae/issues/<n> -f state=closed

# bloquear (irreversible): -> bloqueada, se queda abierta esperando a Mateo
gh api -X DELETE repos/lugoxboop/aprendefae/issues/<n>/labels/estado:en-curso
gh api -X POST   repos/lugoxboop/aprendefae/issues/<n>/labels -f 'labels[]=estado:bloqueada'
```

## El reporte de la mañana

Cada mañana una tarea programada le deja a Mateo **una línea**: qué se hizo
(tarjetas que pasaron a `hecha` desde ayer) y qué queda pendiente. No toca
nada, solo lee la cola y reporta.
