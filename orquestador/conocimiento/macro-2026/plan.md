# Macroeconomía 2026 — rehacer desde cero (plan con casillas)

> Encargo de Mateo, 2026-11-22 17:33 (Bogotá): quitar todo el contenido piloto de
> Macroeconomía (Aprender y Hacer) y rehacerlo con 5 presentaciones del profesor.
> Los datos de estudiantes (FP, intentos, progreso) NO se borran: lo viejo sale
> del sitio como «retirada» (lápida en el servidor, nombre en `retiradas.js`).
> Nada nuevo visible a estudiantes sin el visto bueno de Mateo (video por lote).
>
> SI SE CORTA LA SESIÓN: sigue en la primera casilla sin marcar. No releas los
> originales si ya hay ficha.

## Inventario del material (originales FUERA del repo: almacén privado del proyecto, `macro-2026/originales/`)

| # | Archivo | Diap. | Palabras | Tema | De qué trata |
|---|---|---|---|---|---|
| 1 | 4-PyEM-DA-02-2026.pptx | 15 | ~1.070 | Demanda agregada | Componentes C, I, G, XN y cómo se comportan; caso del empresario confundido |
| 2 | PyEM-PolEc-02-2026-003C.pptx | 23 | ~1.780 | Política económica | Qué es, objetivos, instrumentos, autoridades; entorno de los negocios |
| 3 | 6-PyEM-PolFis-02-2026-003C.pptx | 45 | ~3.300 | Política fiscal | Impuestos, gasto, déficit, deuda, reforma tributaria (casos Colombia) |
| 4 | 7-PyEM-PolMon-02-2026.pptx | 43 | ~1.760 | Política monetaria | Creación del dinero, Banco Central y bancos, tasa de interés, inflación |
| 5 | 8-PyEM-PolCamb-02-2026-003C.pptx | 29 | ~2.390 | Política cambiaria | Mercado cambiario, tasa de cambio, apreciación/depreciación, FED, petróleo |

## Casillas

### Etapa 0 — Quitar lo piloto
- [x] Inventario (este archivo)
- [ ] Respaldo de lo que liga datos de estudiantes a las piezas viejas (ids, nombres, filas del servidor)
- [ ] PR de retiro de todo Macro (catálogo, vistas, rutas, repaso), sin tocar filas de estudiantes

### Etapa 1 — Fichas (una por archivo, en palabras propias)
- [x] Ficha 1 · Demanda agregada → `fichas/1-demanda-agregada.md`
- [x] Ficha 2 · Política económica → `fichas/2-politica-economica.md`
- [x] Ficha 3 · Política fiscal → `fichas/3-politica-fiscal.md`
- [x] Ficha 4 · Política monetaria → `fichas/4-politica-monetaria.md`
- [x] Ficha 5 · Política cambiaria → `fichas/5-politica-cambiaria.md`
- [ ] Mapa de temas (repeticiones y contradicciones) → `mapa.md`

### Etapa 2 — Por tema: plan, especificación, construcción, video
(se llena al cerrar cada ficha; cada pieza es una casilla)

## Decisiones de Mateo
- 2026-11-22 17:36 — Lo viejo se quita **al publicar lo nuevo**: el retiro queda listo pero sale en el mismo cambio que el primer lote aprobado. No fusionar el retiro solo.

### Etapa 2 — casillas por tema
- [x] T1 Demanda agregada · diseño (12 piezas) → `disenos/t1-demanda-agregada.md`
- [ ] T1 · construcción (rama local `macro26-t1`) → `construccion-t1.md`
- [ ] T1 · video y verificación de Gen
- [x] T2 Política económica · diseño (10 piezas) → `disenos/t2-politica-economica.md`
- [ ] T2 · construcción (empieza sobre la rama de T1: reutiliza sus módulos comunes)
- [ ] T2 · video y verificación
- [ ] T3 Política fiscal · diseño
- [ ] T4 Política monetaria · diseño
- [ ] T5 Política cambiaria · diseño
