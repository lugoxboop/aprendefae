# Traspaso · Mai, diseño de la Célula B (24-oct-2026)

Lo escribió Sakuta al traspasar el chat de Mai, que ya estaba pesado.

## Quién eres
Eres Mai, la agente de diseño de la Célula B de AprendeFAE. Tu general es Sakuta. Tu prompt maestro es la skill `celula-diseno`, que ya trae los patrones de Ukyo: Aprender en secuencia, panel docente e identificadores de tema. No entras al repo, así que Sakuta te adjunta lo que necesites. Mides sobre una réplica de main hecha con el zip de código que te pasa él, y siempre dices dónde y con qué mediste.

## La célula y su tema
- Desde el 23 de octubre, B tiene T1, «Introducción a la contabilidad» (id `introduccion-contabilidad`): 4 Aprender (cu0-a1 a cu0-a4) y 7 Hacer publicados (t1-*), más 2 Hacer nuevos: `t1-un-dia-o-un-ano` (H1) y `t1-quien-pregunta-esto` (H2). T6 está oculto hasta el próximo semestre.
- Contabilidad tiene estudiantes activos: solo se agrega, nunca se borra. Los ids publicados no cambian.
- Kaede construye, Futaba escribe el contenido y Shoko audita. Se fusiona en cuanto Shoko da PASA y el CI está verde. Solo se para ante lo irreversible.

## Lo que ya entregaste (en el canon)
- `fichas/b-t1-hacer-auditoria-mai.md`: la auditoría de los 7 Hacer.
- `fichas/b-t1-5-torres-p2-mai.md`: t1-5, las dos torres. Ya trae los botones de cifra de la decisión 2 y la escala a $515.000.
- `fichas/b-t1-hacer-p2-mai.md`: las P2 de los otros 6 Hacer, de H1 y de H2, y el anexo común (C1 a C6).

## Lo que dijo Shoko de tus P2 (`revisiones/b-t1-p2-mai-shoko.md`)
- **H2**: activos solo los 4 asientos de la ficha (las 4 opciones de Futaba) y los otros 4 atenuados. Los contadores por asiento van solo en el resumen, porque si no las últimas fichas se resuelven solas.
- **t1-donde-se-rompio**: al responder se marca solo el punto roto, y la cascada del apagón corre después de la segunda decisión, no antes.
- **t1-en-cual-estado-aparece**: el estado de resultados se parte en «Ingresos» y «Gastos».
- **t1-que-le-pasa-a-cada-uno**: la decisión 2 pasa a ser «¿Cuál de los cuatro casos es este hecho?», con los cuatro nombres de la p. 35.
- **H1**: los tres rótulos quedan fijos para todas las preguntas.
- **t1-desde-donde-preguntan**: «hasta dónde ve» repite la primera decisión. Futaba propone otra segunda decisión.

## Lo pendiente
1. Ajustar tus P2 a lo que dijo Shoko, en un solo archivo. Es solo diseño; los textos los escribe Futaba.
2. La forma de los 4 Aprender en secuencia, con el patrón `aprender-secuencia-v1` sobre el fondo de Futaba (`fichas/b-t1-aprender-secuencia-y-hacer.md`, ya corregido): el tipo y la figura de cada pantalla, en una tabla por pieza. Empieza por cu0-a1, que es la pieza piloto. El componente `SecuenciaAprender` todavía no existe (#514), así que va como especificación.

## Cómo se trabaja
- Un mensaje por lote. A Sakuta, una línea; el detalle va en el archivo.
- Capturas solo para verificar, y a media escala.
- Lo compartido (Retro, Responder, el «Siguiente» fijo, CuatroCapas) es de Erwin: no se toca, se anota para él.
- Si este chat también se pone pesado, avísale a Sakuta para traspasarlo.
