# El orquestador

Automatiza el tramo **Gen → Levi → Xeno → compilación** de AprendeFAE. Recibe una
orden en lenguaje natural, hace correr la cadena de agentes, y entrega un
**encargo maestro compilado** listo para pegar en una sesión de construcción.

No construye código y no publica nada. Eso sigue siendo manual, y a propósito:
esta versión termina donde hoy empieza el trabajo de Sai.

## Por qué vive aquí y no en `src/`

Esto no es parte del sitio del estudiante. Tiene su propio `package.json`, su
propia suite de pruebas y su propia dependencia (`@anthropic-ai/sdk`), y **no
entra en el build ni en las pruebas del sitio**:

- `vite.config.js` compila dos entradas explícitas (`index.html` y
  `privacidad/index.html`). Una carpeta hermana no se empaqueta.
- El `npm test` de la raíz barre `src/**` y `supabase/functions/**`. No mira aquí.

Si algún día eso cambia, esta carpeta tiene que seguir fuera: una herramienta
interna que se cuele en el bundle del estudiante es peso muerto que se descarga
un teléfono en Bogotá.

## Cómo se corre

```
cd orquestador
npm install
node correr.mjs "Gen, crea las 7 actividades nuevas del tema 3 de contabilidad"
```

Necesita `ANTHROPIC_API_KEY` en el entorno. **No hay autenticación por
suscripción**: la documentación del Agent SDK dice explícitamente que el login
de claude.ai no está permitido para productos construidos sobre él, y los
únicos métodos que documenta son clave de API y los cuatro proveedores en la
nube. Esta herramienta llama a la API directamente, así que va con clave.

Para probar la cadena entera **sin gastar un peso**:

```
node correr.mjs --simulado "Gen, crea la pieza 5 del tema 1 de contabilidad"
```

El modo simulado usa un transporte falso que no toca la red. Sirve para ver la
forma de una corrida, no para juzgar contenido.

## El banco de pruebas de la compilación

Antes de confiar en la cadena, hay una pregunta que contestar: ¿el paso de
compilación **caza** los errores que de verdad han llegado a producción, o solo
reescribe documentos con buena letra?

```
node probar-compilacion.mjs                       # todos los casos
node probar-compilacion.mjs conflicto-entre-documentos   # uno solo
```

Cada caso de `pruebas/compilacion/` es un **extracto real** de un encargo cuyo
defecto ya se conoce, con lo que la compilación tiene que encontrar. Gasta: son
llamadas al modelo capaz con herramientas, y el costo se imprime al final.

**Un ✔ dice que miró donde había que mirar, no que lo entendiera.** La
calificación es por señales —que el hallazgo mencione lo que tiene que
mencionar— y eso es crudo a propósito: un suspenso es información dura, un
aprobado es una invitación a leer la salida entera, que se guarda en la carpeta
de la corrida.

## Qué hay dentro

| | |
|---|---|
| `conocimiento/` | La base de conocimiento versionada: el Kit, los roles, el vocabulario, las decisiones cerradas. **Es el insumo, no el código.** |
| `src/conocimiento.js` | La carga y la arma en bloques cacheables. |
| `src/roles.js` | Qué contexto recibe cada rol y con qué modelo corre. |
| `src/ruta.js` | Lee la decisión de ruta que el propio agente declara. |
| `src/topes.js` | Los límites de seguridad. |
| `src/registro.js` | El registro salto por salto. |
| `src/orquestador.js` | El bucle. |
| `src/interprete.js` | Orden en lenguaje natural → materia, tema, agente, tarea. |

## La regla que gobierna el diseño

**El código no decide la ruta.** Cada llamada a un agente termina pidiéndole que
declare a quién le toca seguir. El script obedece. Si no puede leer esa
declaración, se detiene — no adivina.
