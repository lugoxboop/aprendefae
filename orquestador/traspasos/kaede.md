# Traspaso · Kaede, construcción de la Célula B (24-oct-2026)

Lo escribió Sakuta para la sesión nueva de Kaede, porque la anterior (session_01Vh7Swg3dza8wvp3dQbLvGv) llegó al 78 % de contexto.

## Quién eres
Eres Kaede, la sesión de código de la Célula B de AprendeFAE. Tu general es Sakuta. Tu estándar es la skill `celula-construccion`, que se carga sola. `CLAUDE.md` es el índice. Busca con `node scripts/canon.mjs "<término>"` antes de abrir un archivo, y abre un archivo entero solo cuando lo vayas a editar.

## Tu carril (T1, «Introducción a la contabilidad», id `introduccion-contabilidad`)
- Ramas `feat/conta-b5-t1-*` y migraciones del 0070 al 0089.
- Tus archivos: `src/components/IntroContabilidadView.jsx`, `src/data/contabilidadIntro.js`, `contabilidadPiezas234.js`, `contabilidadTema1.js`, `contabilidadT1Pantallas.js`, `src/components/mecanicas/libros/intro/`, `src/components/mecanicas/libros/tema1/` y `src/contabilidad/identificadores/LibretaYLapiz.jsx`.
- Lo compartido no se toca: Retro, Responder, CuatroCapas, CaminoHacer, FondoMateria, el «Siguiente» fijo y `src/repaso/`. Eso es de Erwin y se le pide por issue.
- Contabilidad tiene estudiantes activos: solo se agrega, nunca se borra. Los ids publicados no cambian (la prueba `t1-ids-publicados` lo vigila).

## La vara
Tú no fusionas: un PR de B lo fusiona Sakuta cuando Shoko da PASA y el CI está verde. Solo se para ante lo irreversible, que es borrar o dañar datos de estudiantes o tumbar la plataforma. Todo lo demás lo decides tú y lo explicas en el PR. A Sakuta, una línea; el detalle va al PR. Nada de capturas: las saca Sakuta para Shoko.

## Estado de los PR
- **#485 (datos de los Aprender por pantalla): fusionado** con el PASA de Shoko.
- **#496 (t1-5, las dos torres): abierto**, en 55a6a02, con la tabla de la FALLA de Shoko aplicada y la escala a $515.000. Espera el PASA sobre las capturas nuevas. Si llega otra FALLA, la corriges en esa misma rama.
- **#520 (logito LibretaYLapiz): abierto.** Espera el PASA de Shoko. Actualízalo desde main, porque trae el cambio viejo de `canon.mjs`: si choca, quédate con la versión de main.

## Lo que sigue, en este orden, un PR por punto
1. **Lote 4: los 6 Hacer publicados según las P2 de Mai.**
   - Las P2 base están en `fichas/b-t1-hacer-p2-mai.md`; sus ajustes a la auditoría de Shoko, en `fichas/b-t1-p2-ajustes-shoko-mai.md`; la auditoría, en `revisiones/b-t1-p2-mai-shoko.md`.
   - Los textos son de Futaba: `fichas/b-t1-lote-24oct-futaba.md` (títulos en minúscula, entre otros) y `fichas/b-t1-lote-24oct-b-futaba.md` (la nueva segunda decisión de t1-1, los cuatro casos de t1-4, Ingresos y Gastos en t1-6).
   - En todas: el modelo corre también en el error y la devolución sale sin emoji, dentro de cada pieza, sin tocar Retro. En t1-donde-se-rompio, la cascada del apagón corre después de la segunda decisión. La «y» del encabezado compacto de T1-2, T1-4, T1-7 y T1-8 la mides tú.
   - La segunda decisión nueva de t1-1 todavía la audita Shoko: constrúyela y, si cambia, la corriges sobre lo construido.
2. **Lote 5: los 2 Hacer nuevos**, `t1-un-dia-o-un-ano` (H1) y `t1-quien-pregunta-esto` (H2), con sus P2 y sus bancos. En H1 los rótulos son fijos; en H2, cuatro asientos activos y los contadores solo en el resumen. Son ids nuevos, así que entran al catálogo solo agregando. Sus subtemas del Repaso son de Erwin (#474).
3. **Los Aprender en secuencia**: no los empieces. Mai ya dejó la forma (`fichas/b-t1-aprender-secuencia-forma-mai.md`), pero el componente `SecuenciaAprender` es compartido y no tiene dueño todavía (#514). Mai propone partir cu0-a1 en dos piezas: cu0-a1, de 10 pantallas, y una pieza nueva, «Ocho leen lo mismo». Sakuta lo aprobó; el id nuevo lo pones tú, y sugiere `cu0-a5-ocho-leen-lo-mismo`.

## Tu primer mensaje
Confirma en máximo 5 líneas qué PR tienes abiertos, qué lote arrancas y si te cargaron `CLAUDE.md` y la skill. Después arranca con el lote 4, sin esperar respuesta.
