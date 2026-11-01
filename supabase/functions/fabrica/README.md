# Edge Function «fabrica» — el profesor crea sus propias actividades

Recibe el encargo de un docente —lo que escribió, lo que adjuntó, o las dos
cosas—, se lo pasa al modelo con el molde de una pieza de **Aprender**, y
guarda lo que salga como **borradores suyos**. Nada llega a un estudiante por
aquí: publicar es un acto del profesor, en su panel.

## Lo que NO hace, a propósito

| No hace | Por qué |
|---|---|
| Guardar el archivo | Es material de otro autor y el repositorio es público. Viaja en la petición, el modelo lo lee y muere con la invocación: ni Storage, ni tabla, ni repo. |
| Generar código | Un PDF que llega de fuera es material no confiable. Generando **datos** que entran en un molde ya medido, lo peor que puede pasar es una actividad mala. |
| Publicar | Lo generado se queda en borrador hasta que una persona lo lee. Es la regla con la que Duolingo genera ejercicios: la máquina propone, el experto elige. |

## Los secretos

| Secreto | Qué es | Obligatorio |
|---|---|---|
| `ANTHROPIC_API_KEY` | La misma clave que usa `asistente` | **Sí** — sin ella responde 503 |
| `FABRICA_LIMITE_DIARIO` | Encargos por docente y día | No: provisional de **8** |
| `FABRICA_MODELO` | El modelo | No: por defecto `claude-sonnet-5-5` |

El provisional está bajo a propósito: si el secreto se olvidara, el fallo es
«se acabó el cupo», no una factura. Un encargo con un PDF cuesta bastante más
que una pregunta a Bruno, así que este número no se copia del asistente.

## Desplegar

```bash
supabase functions deploy fabrica
```

**Nunca con `--no-verify-jwt`**, por lo mismo que `asistente`.

## Qué responde

| Código | Cuándo |
|---|---|
| `200` | `{creadas, piezas, descartadas, modelo, usadas, limite, limiteFuente}` |
| `400` | Encargo vacío, archivo de tipo no aceptado, demasiado grande o de más |
| `401` | Sin sesión |
| `403` | Hay sesión, pero quien llama no es docente de esa materia |
| `405` | No es POST |
| `422` | El modelo respondió, pero no salió ni una pieza usable |
| `429` | Se gastó el cupo del día |
| `502` | El modelo falló |
| `503` | Falta la clave, o la base no respondió |

El detalle de un error del proveedor **nunca** sale en la respuesta: puede
traer la clave dentro. Va al registro del servidor, y hay una prueba que lo
comprueba.

## El orden en que se dice que no

Sesión → clave → encargo → archivos → cupo → modelo.

El cupo va después de lo barato a propósito: cobrarle una invocación a quien
mandó un archivo de 40 MB sería cobrarle por un error que no llegó a costar
nada.

## Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `index.ts` | Solo los cables: Deno.serve, Supabase con la sesión del docente, el SDK |
| `fabrica.js` | El molde: el prompt, qué se acepta de vuelta, los límites |
| `manejador.js` | Las puertas y su orden |
| `__tests__/fabrica.test.mjs` | 22 pruebas con Node, sin gastar un token |
| `../../migrations/0158_fabrica_de_actividades.sql` | Los borradores y el cupo |
| `../../../src/docente/fabrica.js` | El lado del panel |
| `../../../src/components/docente/Fabrica.jsx` | La pantalla |
