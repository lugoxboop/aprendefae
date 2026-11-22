# T1 · Demanda agregada — construcción (rama `macro26-t1`)

Fuente: `disenos/t1-demanda-agregada.md` (Gen, 22-nov). Código en `src/macro2026/`.
Vista previa sin publicar: `#/macro-2026` (índice) y `#/macro-2026/<id>` (una pieza).
`?semilla=N` al final de la dirección fija el sorteo (videos y sondas).

## Casillas

- [x] Infraestructura común (colores-da, modelo-da, azar, ui, GraficaDA, carrito, textos, catálogo, vista previa)
- [x] A1 · El carrito de la economía
- [x] H1 · Llena el carrito
- [x] A2 · El vaso de la renta
- [ ] A3 · El columpio de la tasa
- [ ] A4 · Los que no miran la renta
- [ ] H4 · Lo que oyó el empresario
- [x] A5 · Bisagra y ascensor
- [ ] H3 · ¿Gira o sube?
- [ ] A6 · El eco del multiplicador
- [ ] H2 · Arma la fórmula
- [ ] H5 · La libreta de la analista
- [ ] H6 · Lleva la economía a la meta
- [ ] Migración de las 6 Hacer
- [ ] Pruebas
- [ ] Videos a 320 y 375

## Decisiones reversibles tomadas al construir (lo ambiguo o imposible)

1. **Colores C, I, G, XN** (§0 los deja al constructor): C `--warning` #f2c14e,
   I `--success` #4fc2b2, G `--accent` #6f86ff, XN `--ink` #f4f5f7 (tema oscuro de
   planck.css). Luminancias 0,57 / 0,43 / 0,27 / 0,91: se separan también sin
   ver color. Contraste contra #0E1B2E medido en la prueba `colores.test.mjs`.
2. **Sin publicar ≠ sin migración aplicada.** La migración de las 6 Hacer no va
   a `supabase/migrations/` todavía: allí la prueba `catalogo.test.mjs` y el
   guardián exigen que la actividad esté en `subjects.js`, y declararla en
   `subjects.js` la pondría en el camino de los estudiantes. Espera en
   `supabase/macro2026-pendientes/` y se mueve al publicar (ver «Al publicar»).
3. **Vista previa sin servidor.** Las Hacer cierran con la pantalla de resumen
   común (`shared/PantallaResumen.jsx`) alimentada con los FP que calcula el motor
   (`calcularFP`), sin escribir nada y sin estrellas de opinión.
4. **A1:** C, I y G no tienen cifras en la especificación; los bloques usan
   tamaños de dibujo (C 120, I 70, G 85, XN 20 en P2; en P3 XN = X − M con
   los deslizadores). P4 deja encoger cada bloque hasta 0 y volver a su tamaño.
   «Siguiente» solo se bloquea donde lo pide la especificación (P2, las cuatro manos).
5. **H1:** si el segundo intento también yerra, la ficha va sola a su mano
   correcta, con la retro a la vista, y se pasa a la siguiente (la
   especificación no dice qué pasa tras dos errores).

## Al publicar (cuando Mateo apruebe)

1. Mover `supabase/macro2026-pendientes/0270_*.sql` a `supabase/migrations/`.
2. Declarar las 6 Hacer en `SUBJECTS.macroeconomia.topics[demanda-agregada].actividades`
   con la `clasificacion` de `src/macro2026/demanda-agregada/catalogo.js`.
3. Montar las piezas en la vista del tema y conectar `onTerminar` a
   `registrarActividadCompletada` (el resultado ya trae `pct`, `detalle` con
   `item`/`ok`/`subtemas` y `duracionMs`).
