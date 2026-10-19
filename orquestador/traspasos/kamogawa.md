# Traspaso · Kamogawa, general de la Célula E «Hajime no Ippo» (18-oct-2026)

## Lo que tengo a cargo
- Tema `repaso-capitulo-5` de Contabilidad (banco de ejercicios del cap. 5, pp. 262-274). Ids `r5-*`, ramas `feat/conta-e5-*`, migraciones 0250-0299 (usadas 0250-0254).
- Cinco actividades de Hacer en main: r5-1 «Repaso cruzado» (7 pantallas, C.1 primera), r5-2 «El Toro Negro», r5-3 «Marzo en Comercializadora Mate» (balanza del IVA), r5-4 «Septiembre en Barranquilla» (calendario del descuento), r5-5 «Septiembre en permanente» (kárdex). Identificador del tema: «el mazo del capítulo» (#430).
- Paquetes: `orquestador/conocimiento/paquetes/e5-*.md`. Índice del banco: `orquestador/conocimiento/mapas/e5-indice-banco.md`. Reglas propias: `enganche.md`, sección «Célula E» (E1-E12).

## Estado (nivel del Kit, criterio «Avanzado verificable mirando»)
- r5-1 Avanzado · r5-2 Avanzado · r5-4 Avanzado · r5-5 Avanzado (Takamura, 17-oct).
- r5-3: Takamura la dejó en Medio (D4); #444 aplicó su corrección literal, pero NO la ha re-auditado.
- Todo en main, CI verde, medido a 320 y 375 en versión A y B (`scripts/e5/medir-r5-*.mjs`, `R5_VERSION=B`).

## Decisiones vigentes de la célula
- Estándar único de Hacer y kit del PROMPT MAESTRO de diseño (§4-§6): Panel sin tarjeta, contorno 1/2 px, pastilla Check/X, literales «Correcto» / «No va aquí» / «Iba aquí», contador «{Sustantivo} n de N», «Siguiente {sustantivo}», «Ver mi resumen», botón teal, nada de ámbar en botones ni foco, cifras en monoespaciada (§5.3: la objeción de Takamura a la mono se rechazó; manda el canon de diseño).
- Comunes por lote en `src/components/repasoCap5/comun.jsx` y `src/data/repasoCap5Comun.js`: ninguna pieza redefine estados, superficies ni botones (hay guardas).
- Versión B (D8): `useIntento(id)` en comun.jsx; intentos impares A, pares B; cifras calculadas desde los datos; textos con cifra en plantilla; «Basado en el libro, p. N».
- «Terminada» = Avanzado en lo que se verifica mirando; D2, D3, D5, D7 y D9 quedan «pendiente de prueba con personas» (decisión de Mateo vía Miku).
- FP: rendimiento como puntos/total (r5-1: 3/3/4/4/4/4/3 = 25), nunca aciertos/N con decimales que no terminan.
- Citas: «el N del bloque X, p. N»; del bloque C solo está verificada la p. 263 (el 1); el resto va con el rango pp. 263-266, marcado como hueco.
- Sin estudiantes reales en Contabilidad: la célula decide sola sobre catálogo, ids, FP de prueba y textos (orden de Mateo, 15-oct); al entrar estudiantes, vuelve la regla de lo irreversible.

## Pendientes
1. r5-3: que Takamura re-audite #444 (D4 de la balanza y «Plazo del proveedor») y confirme Avanzado.
2. r5-4, dos detalles menores de Takamura: ocultar «Iba aquí» cuando el asiento está todo correcto; medir el margen de 16 px del calendario a 320.
3. Prueba con personas de D2, D3, D5, D7 y D9 en las cinco piezas (sin agendar).
4. Banco: C.2, D.1 y D.2 esperan a que la Célula D publique caja menor y bancos (T4).
5. De Erwin (compartido): el botón «Entrar» tapa texto de opciones a 320; «RESULTADO» del Cierre a 11 px; insignia del cierre de r5-2 sobre las cifras.

## Mis agentes
- Ippo (código): sesión de Claude Code «Construcción Célula E Ippo» (claude.ai/code/session_01VTSXaXpKQ9Xb1sKmB2k5D3). Abre un PR por encargo y avisa en una línea.
- Miyata (contenido): chat «r5-2, r5-3, r5-4 accounting exercises» (claude.ai/chat/339d1b41-3110-4d3f-bef5-5fbffef9eaa2). Tiene el prompt maestro pedagógico; mide INFLESZ con réplica, Ippo remide con `npm run inflesz`.
- Itagaki (diseño): chat «Encargo de Kamogawa» (claude.ai/chat/75434dd6-e0bf-4e2f-a8e1-014e00b91a46). Tiene el prompt maestro de diseño; entrega P2 completos.
- Takamura (auditoría): chat «Diseño r5-5 auditoría» (claude.ai/chat/e15a8fe4-747d-4e27-86ab-d249009f6f26). Tiene el prompt de auditores y el Kit literal (`kit-de-calidad.md`). No abre la pantalla: hay que subirle capturas de `medir-r5-*.mjs`.

## Cómo hablarles
- Mensajes cortos, encabezados «Kamogawa a X.», con el encargo literal y la condición de cierre; terminan con [SIGO] solo si queda trabajo.
- En Ippo NO usar la cola (Ctrl+Enter): con la sesión quieta los mensajes en cola no llegan. Enviar con el botón «Enviar».
- En los chats, si Return no envía, pulsar el botón «Enviar mensaje» y comprobar que el cuadro quedó vacío.
- Textos largos: pegarlos por portapapeles (ClipboardEvent) o traerlos del repo por SHA (raw.githubusercontent.com) dentro de la página.

## Cómo arrancar
1. Leer `orquestador/conocimiento/protocolo-de-eficiencia.md` (Erwin) y este traspaso.
2. `gh api` para ver PRs abiertos `conta-e5`; si hay uno verde y limpio, medirlo y fusionarlo.
3. Atacar los pendientes 1 y 2 (uno de auditoría, otro de Ippo); lo demás espera orden.
