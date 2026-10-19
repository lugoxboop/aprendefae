# Traspaso · Sakuta, general de la Célula B (18-oct-2026)

## Qué tengo a cargo
- T6 «Cuentas por cobrar» completo y las piezas b5-t5-* de T5 «Activos financieros temporales».
- La Célula C (Misa) tiene T5 Act1 con su C4, T5 Act2, P1 y P2. B no las toca.
- Hacer: b5-t5-a1, b5-t5-a2, b5-t6-a1, b5-t6-a2, b5-t6-a3, b5-t6-a4, b5-t6-a6. Retiradas con marcador suave: a5 (va dentro de a2) y a7.
- Aprender: T5 A1, T5 A2, T6 A1 a T6 A5.
- Estado (Shoko, capturas sobre 680ad7e, y lote 29 #458): todas en Avanzado verificable, salvo lo que sigue abajo.

## Cadena de mando
- Mateo → Miku (general de generales) → yo. Las órdenes de Mateo llegan por Miku.
- Erwin manda la Célula A y lo compartido: CuatroCapas, la ficha de FP, las tarjetas, Retro/juego.jsx, tesorería. Nunca escribo en su chat; le hablo por issue o PR (p. ej., #349).
- Crítico = solo lo que no se deshace (datos de estudiantes, contenido que Mateo aprobó, tumbar la plataforma). Eso va a Miku. Todo lo demás lo decido yo y lo informo.

## Decisiones vigentes (canon: orquestador/conocimiento/calidad/b5.md, R18–R27)
- «Terminada» = AVANZADO VERIFICABLE según el Kit (orquestador/conocimiento/kit-de-calidad.md, #368). El nivel es el mínimo de las 9 dimensiones.
- Estándar de Hacer (modelo T4): pastilla «Correcto» / «No va aquí» / «Iba aquí», lucide Check y X de 16 px, sin emoji, teal solo para DEBE y botones.
- Aprender, C2: pista al primer error; al segundo, la respuesta CON su porqué. Nunca un «Iba aquí» suelto.
- Capa 3: lo que elige el estudiante entra al modelo como fantasma y después se corrige (lotes 27 y 28).
- D8: la segunda visita (localStorage `fae-b5-vueltas:aprender:<id>` ≥ 1) cambia la pregunta de la capa 4. En T6 A2, A4 y A5 también se baraja la capa 3 (#455, #456, #458).
- La frase pegada de la capa 4 aparece solo después de responder.
- Una figura usa solo las cifras de su ejercicio. Lo construido lleva el rótulo «Escenario simulado».
- No inventar lo que el libro no dice. El repo es público: índice y análisis, nunca párrafos del libro.
- No hay dos constructores en los mismos archivos. Las ramas que esperan fusionan main primero.
- sticky no funciona dentro de las vistas (FondoMateria tiene overflow:hidden): se fija con script.

## Pendientes
1. Pendiente de prueba con personas: D2 y D3 en las 14 piezas, y el Avanzado de D5, D8 y D9.
2. Shoko NO auditó las devoluciones de la 2.ª visita del #458 (T6 A2, A4, A5), ni los dos textos de opción de T6 A4 que cambié («Siguen castigados, porque esa parte no se revive.», «En Caja, apenas el cliente los pague.»). Hay que pasárselos con capturas de la 2.ª visita.
3. D7 en b5-t5-a1, b5-t5-a2, b5-t6-a3, T5 A1, T5 A2, T6 A1 y T6 A3: la ficha de FP tapa texto en reposo a 320. Es de Erwin (#349); Miku se lo pasó como encargo.
4. Capa 1 de CuatroCapas (compartido): falta una microdecisión por término. Va a Levi, después.
5. PR #40 es el paquete versionado: NO FUSIONAR.

## Mis agentes y cómo hablarles
- Kaede, constructor (Claude Code): claude.ai/code/session_01Vh7Swg3dza8wvp3dQbLvGv. Un lote por mensaje, un PR, «sin preguntar lo que se puede deshacer» (R20). Le pido informe de una línea.
- Futaba, contenido: claude.ai/chat/4c4c17ec-5ce8-476a-93b9-256f7b0e5ddf. Lee main ella misma. Le doy archivo:línea, el estándar (≤ 25 palabras, INFLESZ ≥ 65, sin veredicto ni emoji) y le pido la entrega en tabla.
- Mai, diseño: claude.ai/chat/b702113f-1e86-4c13-969c-b6b3dcb5f16a. Se rige por el prompt maestro de diseño. Siempre le pregunto dónde y con qué midió.
- Shoko, auditora: claude.ai/chat/be98df9f-127f-425b-8b51-71f28445ef11. No ve código: le mando hojas de capturas (320 y 375) y le pido una línea por pieza (pieza · nivel · lo que falta). Su veredicto manda.
- Mensajes a los chats: con Chrome (una sola pestaña, en el grupo propio). Se pega con `document.execCommand('insertText')` en `[contenteditable="true"]` y se envía con Return. Si sale NOED, se espera a que cargue y se reintenta.
- Para leer un chat sin Chrome: `conversation_search` / `read_conversation` (el índice puede ir atrasado).
- Ahorro: mensajes cortos, el detalle va al PR, capturas solo para verificar lo terminado.

## Cómo arrancar
1. Leer este archivo, orquestador/conocimiento/protocolo-de-eficiencia.md (Erwin), calidad/b5.md y kit-de-calidad.md. Nada más.
2. Para ver PRs y CI, solo `gh api` REST (GraphQL está bloqueado). Para fusionar, PR verde con `fusiona-verde.sh` (sondea el CI y reintenta mergeable_state). Nunca force push, nunca borrar ramas remotas, nunca reescribir main.
3. Pruebas: `node --import ./scripts/cargador-jsx.mjs --test "src/**/*.test.mjs"`, `npm run build` y `npm run inflesz`.
4. Capturas: la sonda está en scripts/b5/sonda-enganche/enganche.py y su envoltorio se escribe de nuevo en el scratchpad. El servidor de dist es estático, a 320×568 y 375×667.
5. Primer movimiento: pendiente 2 (que Shoko audite el #458).
