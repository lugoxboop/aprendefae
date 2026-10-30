# Edge Function «asistente» — la tubería

Recibe un mensaje del sitio, comprueba sesión y cupo, le pregunta al modelo y
devuelve la respuesta. **Desde el 30-oct es Bruno**, el tutor: el prompt
pedagógico, el armado del contexto (pantalla + datos del ítem) y el tope de
120 palabras están en `bruno.js`; la ventana del sitio, en `src/bruno/`. Su
evaluación con casos reales: `scripts/bruno/evaluar.mjs`.

Lo que sí está terminado es lo que hay que hacer bien una sola vez: dónde vive
la clave, quién puede invocar, y cuánto puede gastar cada estudiante.

## Los tres secretos

Se ponen **una vez** y no requieren volver a desplegar la función al cambiarlos.

| Secreto | Qué es | Obligatorio |
|---|---|---|
| `ANTHROPIC_API_KEY` | La clave de API de Anthropic | **Sí** — sin ella la función responde 503 |
| `ASISTENTE_LIMITE_DIARIO` | Invocaciones por estudiante y día | No: sin él se usa un **provisional de 10** |
| `ASISTENTE_MODELO` | El modelo | No: por defecto `claude-sonnet-5-5` (decisión de Mateo, 30-oct). Para abaratar: `claude-haiku-4-5` |

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set ASISTENTE_LIMITE_DIARIO=25
```

> **`ASISTENTE_LIMITE_DIARIO` es el número que está definiendo Stanley.** El
> provisional de 10 está puesto bajo a propósito: si el secreto se olvidara, el
> fallo es «se acabó el cupo antes de tiempo», no una factura.

### Por qué esta clave no es una `VITE_*`

| Variable | ¿Pública? | Qué la protege |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | **Sí, por diseño** | Los orígenes autorizados en Google |
| `VITE_SUPABASE_ANON_KEY` | **Sí, por diseño** | Las políticas RLS |
| `ANTHROPIC_API_KEY` | **No** | Nada: quien la tenga gasta el saldo |

Vite incrusta en el bundle **todo** lo que empiece por `VITE_`. Poner esta clave
ahí la publicaría a cada estudiante que abra el sitio. Por eso vive en los
secretos de Supabase y se lee con `Deno.env.get` del lado del servidor.

Hay una prueba que lo vigila: busca un patrón de clave dentro de `dist/` y falla
si aparece. Se comprobó además con un canario — un build hecho con una clave
falsa en el entorno, y cero coincidencias en los 65 archivos servidos.

## Desplegar

```bash
supabase link --project-ref <ref-del-proyecto>
supabase functions deploy asistente
```

**Nunca con `--no-verify-jwt`.** Esa bandera apaga la comprobación del JWT que
hace Supabase antes de invocar. La función comprueba la sesión otra vez por su
cuenta, así que no quedaría abierta — pero no hay motivo para quitar una de las
dos puertas.

## Probar contra el proyecto

```bash
# Sin sesión → 401
curl -i -X POST "https://<ref>.supabase.co/functions/v1/asistente" \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"hola"}'

# Con sesión → 200, o 429 si ya se gastó el cupo del día
curl -i -X POST "https://<ref>.supabase.co/functions/v1/asistente" \
  -H "Authorization: Bearer <jwt-de-un-estudiante>" \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"¿Qué es la inflación?"}'
```

## Qué responde

| Código | Cuándo |
|---|---|
| `200` | Todo bien. `{respuesta, modelo, usadas, limite, limiteFuente}` |
| `400` | No llegó pregunta |
| `401` | Sin sesión — o la cabecera venía pero no era una sesión de verdad |
| `405` | No es POST |
| `429` | Se gastó el cupo del día. `{usadas, limite}` |
| `502` | El modelo falló |
| `503` | Falta `ANTHROPIC_API_KEY`, o la base no respondió |

`limiteFuente` dice de dónde salió el número: `secreto` si está configurado,
`provisional` si no. Sirve para saber de un vistazo si falta ponerlo.

**Ningún error devuelve el detalle del proveedor.** Al estudiante le llega un
motivo corto; lo demás va al registro del servidor, que solo ve quien
administra el proyecto. Un mensaje de error de la API puede traer la clave
dentro, y hay una prueba que comprueba que no sale.

## Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `index.ts` | Solo los cables: Deno.serve, el cliente de Supabase con la sesión del estudiante, el SDK de Anthropic |
| `manejador.js` | Toda la lógica: sesión, cupo, errores. En JavaScript plano para que Deno **y** las pruebas de Node lo carguen igual |
| `__tests__/manejador.test.mjs` | 14 pruebas, con Node. No gastan un solo token |
| `../../migrations/0040_asistente_uso.sql` | El contador por estudiante y día |
| `../../tests/asistente_uso_test.sql` | 15 pruebas del cupo, contra Postgres |

El contador vive en Postgres y no en la función porque una Edge Function no
tiene memoria entre invocaciones: cada llamada puede caer en otra instancia.
