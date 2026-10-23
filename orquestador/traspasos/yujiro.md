# Traspaso · Yujiro, general de la Célula D «Baki Hanma» (18 oct 2026)

## A cargo
- T4 «Efectivo, caja menor y bancos» (Contabilidad, §5.0-§5.2, pp. 177-191 del libro de Mendoza Roca y Ortiz Tovar). Cerrado y en main.
- Carril: ids `t4-`, ramas `feat/conta-d4-*`, migraciones 0200-0249, vista `src/components/ContabilidadT4View.jsx`, componentes `src/components/t4/`, datos `src/data/contabilidadT4*`, pruebas `src/contabilidad/__tests__/t4-*`.
- Fusiono yo lo de la célula con el CI en verde y el PASA del auditor. Lo compartido es de Erwin.

## Estado de T4
- 6 Aprender (A0-A5) y 5 Hacer (H1, H3, H4, H7, H8). H2 salió y H5 y H6 se fundieron en H4 y H7 (retiro blando 0208, H4 difícil 0209).
- Kit: D1, D4 y D6 en Avanzado en las 11 piezas. D2, D3, D5, D7, D8 y D9: «pendiente de prueba con personas» (D5 y D8 en Medio por lo que se ve).
- Caso B (D8): A0-A5 sortean un segundo caso al repetir; clave `aprendefae-t4-caso` en localStorage lo fuerza.
- T3 de la Célula A: la célula corrigió D4 en `t3-ingreso-o-cobro` y `t3-cuando-se-causa` (#439, PASA de Shibukawa). Lo fusiona Erwin.

## Pendientes
1. Pruebas con personas (Ukyo o Mateo):
   - A: un estudiante nuevo juega cada pieza (termina al primer intento, explica en una frase, interés al repetir) → D2, D3, D8.
   - B: captura sin logo (¿se reconoce?, ¿detiene a alguien?) → D5, D9.
   - C: Android de gama baja frente a gama alta (animaciones) → D7.
2. Identificador del tema: dibujo en `src/contabilidad/identificadores/CajonDePaso.jsx`. Falta una línea en `src/data/identificadoresDeTema.js` cuando `IdentificadorDeTema.jsx` (Erwin) tenga los 64 px y `--mueve`.
3. #439 de T3 sin fusionar (Erwin).
4. En `t3-cuando-se-causa` la decisión empieza a 305-327 px a 320 de ancho (B1 280): exceso previo, de la Célula A.

## Decisiones vigentes de la célula
- Vara visual: `orquestador/conocimiento/prompts/disenadores-de-celula-v1.md`; contenido: `pedagogicos-v1.md`; auditoría: `auditores-v1.md`; niveles: `kit-de-calidad.md`; barra de enganche y reglas B1-B5, D1-D11: `enganche.md`.
- Literales de feedback: «Correcto», «No va aquí», «Iba aquí» (solo Hacer sin reintento). En Aprender, «Seguir» solo tras el acierto.
- Acierto nunca en teal ni ámbar. Botón principal Responder teal; progreso en node.
- E2: la pastilla tocada, la devolución y el botón caben en la ventana; si no, el foco va a la devolución.
- Lectura estricta de D4: la misma pregunta sobre otro caso no es una decisión distinta (Miku, 17 oct).
- Ítems retirados conservan su etiqueta en `etiquetasItem.js` para el panel docente.

## Agentes (sedes fijas desde el 23 oct; sobreviven a mis traspasos)
- Baki, código: sesión de Claude Code (claude.ai/code/session_01QpJop5McxwEWg52bgBvPGN). Construye, mide con sonda y guardia, abre PR, no fusiona.
- Katsumi, contenido: claude.ai/chat/a544b14e-bd46-4e97-b22a-5decfeda0c99. Prompt maestro pedagógico. INFLESZ con `npm run inflesz`, copia contra el libro = 0.
- Hanayama, diseño: claude.ai/chat/930849c0-7d5d-431e-a1b2-30f3e19b19dc. Prompt maestro de diseño. Especifica sobre el prototipo; no toca lo compartido.
- Shibukawa, auditoría: claude.ai/chat/3361c35f-ee1b-4585-8736-6e061d5bfdb1. Prompt de auditores y Kit literal. No ve la pantalla: hay que mandarle capturas a 320x568 y 375x667. Da PASA o FALLA.
- Flujo: Katsumi -> Hanayama -> Baki -> Shibukawa -> fusión.
- Ukyo (diseño y UI de todo el proyecto desde el 23 oct; no es de la célula): claude.ai/chat/93230b0c-b04b-4a7a-b601-bcae85595d95. Especifica el panel docente, el patrón de slides (#470) y el logito de T4; le hablo directo.
- Varas de aceptación de la célula (panel docente y slides de T4): `orquestador/revisiones/panel-docente/aceptacion.md`.

## Cómo hablarles y arrancar
- Ya no son subagentes: cada uno vive en su chat o sesión fija (arriba), capacitado con su prompt maestro del canon (sha a557d1f) y el contexto de la célula. Un encargo nuevo va a esa misma sede, un mensaje por lote.
- Mensajes con Chrome, una pestaña en el grupo propio: el texto se inserta con `document.execCommand('insertText')` en `[contenteditable="true"]` (los prompts largos se traen de raw.githubusercontent.com por sha dentro de la página) y se envía con un clic en el botón (`button[aria-label="Enviar mensaje"]` en los chats, «Enviar» en Claude Code). Return a veces no envía: comprobar siempre que el cuadro quedó vacío. Ojo: el cuadro de «Nueva sesión» de Claude Code puede tener el borrador de otro general; no se borra.
- Herramientas: sonda `scripts/t4/sonda-enganche/` (README; `--tema=t4`), guardia `scripts/t4/guardia-enganche.mjs`, medidor `scripts/t4/medir-t4.mjs`.
- GraphQL bloqueado: PR y fusión por REST (`gh api .../pulls`, `PUT .../merge` con el sha completo). Nunca force push; `npm ci`, nunca `npm install`.
- Reglas de eficiencia: `orquestador/conocimiento/protocolo-de-eficiencia.md` (Erwin). Órdenes de Mateo llegan por Miku; lo irreversible se le escala a ella.
