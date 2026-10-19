# Traspaso de L (general de la Célula C, Contabilidad) · 18-oct-2026

## Qué tengo a cargo
- Territorio: T7-1 inventarios-periodico, T7-2 inventarios-permanente, T7-3 inventarios-descuentos-nic2 y T5 activos-financieros (§5.3).
- Las piezas b5-t5-* son de la Célula B (Sakuta). Por decisión de Miku, Misa cerró T5 Act1, Act2, P1 y P2 (#447 y #449).
- Estado: 44 de 44 piezas en Avanzado verificable. CI verde. Auditoría de Mello: niveles-kit-contabilidad-main-v7.md, un archivo de su chat. El último PR fue #449.
- Cadena de mando:
  - Mateo da las órdenes y le llegan a L por Miku, general de generales.
  - Erwin lleva lo compartido, los choques entre células, los datos de estudiantes y las migraciones.
  - L fusiona lo suyo cuando CI pasa verde.
  - Lo irreversible se escala a Miku.
## Decisiones vigentes de la Célula C
- Mientras no entren estudiantes reales, y solo en Contabilidad, L decide sin consultar (orden de Mateo, 16-oct): retirar o fusionar actividades, cambiar ids, limpiar intentos de prueba.
- C2 en Aprender, con la escalera de `escaleraAyuda.js`: al primer error, pista; al segundo, la respuesta con su porqué, nunca un «Iba aquí» suelto. Lo vigila `c2-porque.test.mjs`.
- C1: la respuesta no puede estar en la misma pantalla. Lo vigila `c1-misma-pantalla.test.mjs`, con una lista PENDIENTES que solo encoge.
- D8: las opciones se barajan en cada intento (#442 y #449), nunca con `barajarFijo`.
- Los componentes compartidos con la Célula B (CajasQueRevelan, LibroDiario, CuatroCapas, DosVentas, DosPaquetes) se tocan solo con una prop opcional. Sin esa prop, sus piezas quedan idénticas.
- Identificadores: la célula solo añade su entrada en `src/data/identificadoresDeTema.js`, con la clave «materia/tema». Los cinco temas ya están.
- Guardián de migraciones: una migración de la célula solo añade filas. La marca de retiro blando la pone Erwin, nunca L.
- Reglas fijas:
  - Nunca force push, nunca borrar ramas, nunca reescribir main.
  - Nunca debilitar ni borrar una prueba.
  - No meter texto del libro al repositorio.
  - No tocar producción.
## Pendientes
1. Prueba con personas de D2, D3, D5, D7, D8 y D9 (Kit de Calidad). No se puede verificar sin estudiantes.
2. Medir D7 a 320 y 375 px en lo publicado (aprendefae.com), no en el arnés.
3. Nada más en código. Sin trabajo nuevo hasta que Miku lo ordene.
## Mis agentes
- **Misa** (código): sesión de Claude Code `claude.ai/code/session_01APmb1VYYdaqZyxLFhtLgAd`. Abre PR por rama `feat/conta-c7-*`.
- **Near** (contenido pedagógico): chat `21f08d4e-de4b-40af-a6e4-ab5f444e3c0f`.
- **Watari** (diseño): chat `c7eeca49-0b46-4f0c-bb45-c44191bb0d08`. Sus artefactos de patrón:
  - C2: CseJ17Uh8Jy6EehRhnR8T8
  - C3: BenGz1v8Nbz9LcFuNDpbxg
  - C4: EjpX2ZMQayUUEzDSUV3GB7
  - Identificadores: 7zR53hMUbP1XcQr14EwNsF
- **Mello** (auditoría): chat `46cfedc3-aa79-4f25-8cd0-a279f9202102`. Usa el Kit de Calidad (`kit-de-calidad.md`) y el prompt de auditores.

## Cómo hablarles
- Mensajes de una a cinco líneas que empiecen con «L a <agente>:» y terminen con «Una línea.». El detalle va al PR, no al chat.
- **Enviar:**
  - Pegar con un ClipboardEvent de DataTransfer en el editor ProseMirror; un texto largo se vuelve adjunto.
  - En los chats el botón es `aria-label="Enviar mensaje"`.
  - En la sesión de Code el botón «Enviar» está junto al editor. Ojo: un botón genérico /enviar/ falla. Hay que comprobar que el editor quede vacío.
- **Leer** sin abrir el chat entero: `/api/organizations/3d2234e5-3a04-472d-8331-eff1e45d5ee9/chat_conversations/<id>?tree=False&rendering_mode=messages`. Basta el último mensaje del asistente. Los adjuntos se bajan por `/files/<uuid>/contents`.
- Si un chat se cuelga o sale «Reabrir»: pulsar Reabrir y mandar «continuar». Abrir un chat nuevo solo tras 2 fallos.
## Cómo fusionar
- GitHub por REST con `gh api`, porque GraphQL está bloqueado.
- Pasos:
  1. Revisar que ninguna prueba pierda asserts.
  2. Hacer update-branch.
  3. Esperar CI.
  4. Fusionar con squash, con las líneas de atribución.
- Si CI falla, buscar el paso con `actions/runs?head_sha=` y leer `jobs[].steps`.

## Cómo arrancar (chat nuevo)
1. Leer este archivo y `orquestador/conocimiento/protocolo-de-eficiencia.md` (Erwin).
2. `gh api "repos/lugoxboop/aprendefae/pulls?state=open"`: ver si hay algo de `conta-c7`.
3. Leer solo el último mensaje de Mello y de Misa.
4. Esperar órdenes de Miku. Sin trabajo nuevo, no se gastan tokens.
