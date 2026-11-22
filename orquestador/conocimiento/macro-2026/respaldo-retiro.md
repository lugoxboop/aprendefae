2026-11-22 18:34 (America/Bogota)

# Respaldo del retiro de Macroeconomía

Orden de Mateo: quitar del sitio todo el contenido actual de Macroeconomía
(Demanda Agregada, Política Económica, Política Fiscal y Política Monetaria, y
el Repaso Diario de Macro) para rehacerlo desde cero. La materia sigue en la
portada, con su tarjeta y su índice, y el índice dice «Los temas de esta
materia están en construcción.».

## El código viejo entero está en un commit

**Commit padre del retiro: `d3716a5d0d75453c9b686971b023d01f5969925b`**
(«Gen skill: bloque de material grande y trabajo por etapas (#730)», la punta
de `origin/main` sobre la que se rebasó la rama `retiro-macro`).

Ese commit es el respaldo completo: vistas, mecánicas, datos, pool del Repaso
y pruebas de Macro tal como estaban publicados. Para recuperar algo:

```sh
git show d3716a5d:src/data/politicaMonetaria.js                  # leer un archivo
git checkout d3716a5d -- src/components/PoliticaFiscalView.jsx   # traerlo de vuelta
git diff d3716a5d retiro-macro --stat                            # qué salió
```

## Lo que pasa en el servidor

Ninguna fila se borra. Las 59 actividades de Macro con fila en
`actividad_catalogo` quedan como lápida (`retirada = true`) en la migración
**0258_retiro_macroeconomia.sql**. `fp_history`, `fp_detalle`, rachas, ligas
y progreso de los estudiantes no se tocan: el FP ganado se conserva y el panel
docente sigue nombrando cada actividad por el nombre que vio el estudiante
(`src/data/retiradas.js`).

El número 0258 cae en el rango de la Célula E y es a propósito: tiene que
correr después de la 0255, que crea tres de las filas retiradas. La cabecera
de la migración lo explica.

Las 12 de Aprender no tienen fila (Aprender no da FP ni entra al catálogo), así
que solo salen del cliente.

`dashboard-economico` ya estaba retirada desde la 0015 y no se repite aquí.

## Lo que ve quien ya jugó Macro

- **El FP y las rachas**, intactos: salen de `fp_history`, que no se toca.
- **La medalla «Macroeconomía al día»** se conserva para quien completó los 54
  juegos que la daban antes del retiro (`GANADAS_ANTES_DEL_RETIRO` en
  `src/medallas/medallas.js`). Sin eso, con el total de Macro en cero, se le
  habría apagado a todos.
- **El panel docente** nombra cada actividad retirada por su nombre
  (`retiradas.js`), pero ya no cada pregunta: las reglas de etiqueta leían los
  bancos de `src/data/*` que salieron, así que el desglose por ítem de una
  partida vieja de Macro enseña el id interno. Se recupera trayendo la regla y
  su banco del commit padre.

## Las 71 actividades retiradas

59 con fila en el servidor (58 Hacer de los cuatro temas y el Repaso Diario de
Macro) y 12 Aprender sin fila.

| id | Nombre visible | Tema | Tipo | Modalidad · dificultad · FP | Migración donde nació su fila |
|---|---|---|---|---|---|
| `grifos-da` | El corazón de la economía | demanda-agregada | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `pulso-memoria` | Pulso de memoria | demanda-agregada | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `estetoscopio-casos` | Diagnóstico con estetoscopio | demanda-agregada | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `memorama-corazon` | Memorama del Corazón | demanda-agregada | Hacer | exploratoria · facil · 10 FP | 0030_cimientos_y_bloques_completos |
| `cual-componente` | ¿Cuál componente? | demanda-agregada | Hacer | evaluativa · facil · 10 FP | 0030_cimientos_y_bloques_completos |
| `electrocardiograma` | Lectura de electrocardiograma | demanda-agregada | Hacer | evaluativa · medio · 25 FP | 0022_juegos_demanda_agregada |
| `termometro-reacciones` | El termómetro de reacciones | demanda-agregada | Hacer | evaluativa · medio · 25 FP | 0022_juegos_demanda_agregada |
| `banco-transfusiones` | Banco de transfusiones | demanda-agregada | Hacer | evaluativa · dificil · 50 FP | 0022_juegos_demanda_agregada |
| `biopsia-economica` | Biopsia económica | demanda-agregada | Hacer | evaluativa · dificil · 50 FP | 0022_juegos_demanda_agregada |
| `triage-emergencias` | Triage de emergencias | demanda-agregada | Hacer | evaluativa · experto · 90 FP | 0022_juegos_demanda_agregada |
| `cirugia-reconstruccion` | Cirugía de reconstrucción | demanda-agregada | Hacer | evaluativa · experto · 90 FP | 0022_juegos_demanda_agregada |
| `sala-monitores` | Sala de monitores | demanda-agregada | Hacer | evaluativa · dificil · 50 FP | 0022_juegos_demanda_agregada |
| `quien-beneficia-auge` | ¿A quién beneficia el auge? | demanda-agregada | Hacer | evaluativa · medio · 25 FP | 0030_cimientos_y_bloques_completos |
| `explica-paciente` | Explícaselo a un paciente nuevo | demanda-agregada | Hacer | evaluativa · dificil · 50 FP | 0030_cimientos_y_bloques_completos |
| `sala-espera-llena` | La sala de espera llena | demanda-agregada | Hacer | evaluativa · experto · 90 FP | 0030_cimientos_y_bloques_completos |
| `tablero-fallas` | El tablero de fallas | politica-economica | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `autorregulacion-intervencion` | ¿Autorregulación o intervención? | politica-economica | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `maquina-da-palancas` | La máquina de la DA y sus palancas | politica-economica | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `memorama-tesoro` | Memorama del Tesoro | politica-economica | Hacer | exploratoria · facil · 10 FP | 0030_cimientos_y_bloques_completos |
| `que-rama-es` | ¿Qué rama es? | politica-economica | Hacer | evaluativa · facil · 10 FP | 0030_cimientos_y_bloques_completos |
| `diagnostico-en-vivo` | Diagnóstico en vivo | politica-economica | Hacer | evaluativa · medio · 25 FP | 0015_retiro_j3_y_juegos_politica |
| `arma-grupo-logico` | Arma el grupo lógico | politica-economica | Hacer | evaluativa · dificil · 50 FP | 0015_retiro_j3_y_juegos_politica |
| `quien-gana-quien-pierde` | ¿Quién gana, quién pierde? | politica-economica | Hacer | evaluativa · medio · 25 FP | 0016_juegos_politica_economica |
| `corriente-titulares` | Corriente de titulares | politica-economica | Hacer | evaluativa · dificil · 50 FP | 0016_juegos_politica_economica |
| `explica-la-politica` | Explica la política | politica-economica | Hacer | evaluativa · dificil · 50 FP | 0016_juegos_politica_economica |
| `tablero-decisiones` | El tablero de decisiones | politica-economica | Hacer | evaluativa · experto · 90 FP | 0016_juegos_politica_economica |
| `simulador-de-crisis` | El simulador de crisis | politica-economica | Hacer | evaluativa · experto · 90 FP | 0016_juegos_politica_economica |
| `se-acerca-o-se-aleja` | ¿Se acerca o se aleja? | politica-economica | Hacer | evaluativa · medio · 25 FP | 0030_cimientos_y_bloques_completos |
| `expediente-gabinete` | El expediente del gabinete | politica-economica | Hacer | evaluativa · dificil · 50 FP | 0030_cimientos_y_bloques_completos |
| `consejo-ministros` | El consejo de ministros | politica-economica | Hacer | evaluativa · experto · 90 FP | 0030_cimientos_y_bloques_completos |
| `clase-politica-fiscal` | La política fiscal en cuatro escenas | politica-fiscal | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `memorama-tesoreria` | Memorama de la Tesorería | politica-fiscal | Hacer | exploratoria · facil · 10 FP | 0030_cimientos_y_bloques_completos |
| `cobra-gasta-o-pide` | ¿Cobra, gasta o pide prestado? | politica-fiscal | Hacer | evaluativa · facil · 10 FP | 0030_cimientos_y_bloques_completos |
| `clasificador-tesoro` | El clasificador del Tesoro | politica-fiscal | Hacer | evaluativa · medio · 25 FP | 0029_juegos_politica_fiscal |
| `directos-indirectos` | Directos e indirectos | politica-fiscal | Hacer | evaluativa · medio · 25 FP | 0029_juegos_politica_fiscal |
| `flujo-de-caja` | Flujo de caja: ¿a quién afecta? | politica-fiscal | Hacer | evaluativa · dificil · 50 FP | 0029_juegos_politica_fiscal |
| `agujero-fiscal` | El agujero fiscal | politica-fiscal | Hacer | evaluativa · dificil · 50 FP | 0029_juegos_politica_fiscal |
| `expansiva-contractiva` | Expansiva o contractiva | politica-fiscal | Hacer | evaluativa · experto · 90 FP | 0029_juegos_politica_fiscal |
| `disena-presupuesto` | Diseña el presupuesto | politica-fiscal | Hacer | evaluativa · experto · 90 FP | 0029_juegos_politica_fiscal |
| `deficit-vs-deuda` | Déficit vs deuda | politica-fiscal | Hacer | evaluativa · dificil · 50 FP | 0029_juegos_politica_fiscal |
| `quien-afecta-ajuste` | ¿A quién afecta el ajuste? | politica-fiscal | Hacer | evaluativa · medio · 25 FP | 0030_cimientos_y_bloques_completos |
| `explica-contribuyente` | Explícaselo a un contribuyente | politica-fiscal | Hacer | evaluativa · dificil · 50 FP | 0030_cimientos_y_bloques_completos |
| `comite-presupuesto` | El comité de presupuesto | politica-fiscal | Hacer | evaluativa · experto · 90 FP | 0030_cimientos_y_bloques_completos |
| `comite-nova` | El Comité de NOVA | politica-fiscal | Hacer | evaluativa · experto · 90 FP × 4 etapas (desafío) | 0041_desafio_comite_de_nova |
| `quien-manda-aqui` | ¿Quién Manda Aquí? | politica-monetaria | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `los-cuatro-instrumentos` | Los Cuatro Instrumentos | politica-monetaria | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `las-tres-transmisiones` | Las Tres Transmisiones | politica-monetaria | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `la-fabrica-del-dinero` | La Fábrica del Dinero | politica-monetaria | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `las-tallas-del-dinero` | Las Tallas del Dinero | politica-monetaria | Aprender | — (no da FP) | sin fila (Aprender no entra al catálogo) |
| `memorama-banco-central` | Memorama del Banco Central | politica-monetaria | Hacer | exploratoria · facil · 10 FP | 0031_politica_monetaria |
| `quien-decide-esto` | ¿Quién Decide Esto? | politica-monetaria | Hacer | evaluativa · facil · 10 FP | 0031_politica_monetaria |
| `en-que-talla-va` | ¿En Qué Talla Va? | politica-monetaria | Hacer | evaluativa · facil · 10 FP | 0091_monetaria_agregados |
| `volante-de-la-tasa` | El Volante de la Tasa | politica-monetaria | Hacer | evaluativa · medio · 25 FP | 0031_politica_monetaria |
| `la-tasa-que-muerde` | La Tasa que Muerde | politica-monetaria | Hacer | evaluativa · medio · 25 FP | 0255_monetaria_instrumentos |
| `caja-de-herramientas` | La Caja de Herramientas | politica-monetaria | Hacer | evaluativa · medio · 25 FP | 0031_politica_monetaria |
| `crea-o-cambia-de-manos` | ¿Crea o Cambia de Manos? | politica-monetaria | Hacer | evaluativa · medio · 25 FP | 0073_monetaria_fabrica_del_dinero |
| `el-freno-del-encaje` | El Freno del Encaje | politica-monetaria | Hacer | evaluativa · medio · 25 FP | 0255_monetaria_instrumentos |
| `a-quien-le-pega-la-tasa` | ¿A Quién Le Pega la Tasa? | politica-monetaria | Hacer | evaluativa · medio · 25 FP | 0031_politica_monetaria |
| `las-dos-entradas` | Las Dos Entradas | politica-monetaria | Hacer | evaluativa · medio · 25 FP | 0052_monetaria_dos_actividades |
| `que-toco-el-banco` | ¿Qué Tocó el Banco? | politica-monetaria | Hacer | evaluativa · medio · 25 FP | 0091_monetaria_agregados |
| `cadena-de-transmision` | La Cadena de Transmisión | politica-monetaria | Hacer | evaluativa · dificil · 50 FP | 0031_politica_monetaria |
| `por-cual-arteria-entra` | ¿Por Cuál Arteria Entra? | politica-monetaria | Hacer | evaluativa · dificil · 50 FP | 0052_monetaria_dos_actividades |
| `explicaselo-a-un-deudor` | Explícaselo a un Deudor | politica-monetaria | Hacer | evaluativa · dificil · 50 FP | 0031_politica_monetaria |
| `corriente-de-decisiones` | Corriente de Decisiones | politica-monetaria | Hacer | evaluativa · dificil · 50 FP | 0031_politica_monetaria |
| `el-rezago` | El Rezago | politica-monetaria | Hacer | evaluativa · dificil · 50 FP | 0031_politica_monetaria |
| `la-escalera-del-encaje` | La Escalera del Encaje | politica-monetaria | Hacer | evaluativa · dificil · 50 FP | 0073_monetaria_fabrica_del_dinero |
| `repo-o-definitiva` | ¿Repo o Definitiva? | politica-monetaria | Hacer | evaluativa · dificil · 50 FP | 0255_monetaria_instrumentos |
| `dilema-banquero-central` | El Dilema del Banquero Central | politica-monetaria | Hacer | evaluativa · experto · 90 FP | 0031_politica_monetaria |
| `duelo-de-instrumentos` | Duelo de Instrumentos | politica-monetaria | Hacer | evaluativa · experto · 90 FP | 0031_politica_monetaria |
| `disena-respuesta-monetaria` | Diseña la Respuesta Monetaria | politica-monetaria | Hacer | evaluativa · experto · 90 FP | 0031_politica_monetaria |
| `repaso-diario` | El Repaso Diario (Macroeconomía) | (transversal) | Hacer | evaluativa · medio · 60 FP · renovable a diario | 0033_repaso_diario |
