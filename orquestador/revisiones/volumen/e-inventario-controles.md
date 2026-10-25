# Volumen de los controles · inventario de T3 (Célula E)

Ippo, 24-oct-2026, issue #538 punto 1; **revisado el 25-oct con el cambio de
alcance** (Mateo vía Miku, 24-oct 19:04: el volumen vale para las tres materias,
también Pensamiento Estratégico; se cae el opt-in; un compartido se cambia una
vez y vale para todas). **Solo documentación: no cambia ningún estilo.** La
forma del volumen (elevación, sombra, cuánto baja al pulsar) la define Ukyo en
la skill `celula-diseno`; aquí no se propone ninguna.

**Alcance:** las 4 piezas de Aprender publicadas (P1 «Vender no es cobrar», P3
«Lo que ya pasó…», P4 «Lo que ya se pagó…», P5 «Cerrar el periodo»), las 7
Hacer publicadas (H1 ¿Ingreso o cobro?, H2 ¿Cuándo se causa?, H3 El mismo
hecho, H4 Ajuste acumulado, H5 Ajuste diferido, H6 ¿Qué le toca a este
periodo?, H7 El cierre completo) y «¿Gasto o pago?» (GP, en el PR #533, aún sin
fusionar: se leyó de su rama). Más el camino de Hacer y la cabecera del tema.

La última columna dice **qué pantallas de Pensamiento Estratégico o de Macro
usan ese mismo control**: son las que habrá que comprobar (a 320 y 375) cuando
llegue el cambio. Los controles propios de E no salen de T3 (o del Repaso del
capítulo 5, que también es de E).

## Cómo se midió (no se supuso)

- **Grafo de imports** desde cada vista (cierre transitivo, `import … from` e
  `import()`), para las tres vistas de PE (`PensamientoSistemicoView`,
  `IcebergView`, `PorterView`) y las de Macro (`DemandaAgregadaAprenderView`,
  `DemandaAgregadaHacerView`, `PoliticaEconomicaView`, `PoliticaFiscalView`,
  `PoliticaMonetariaView`, `MacroTopicIndex`, `repaso/RepasoView`).
- Dentro de cada cierre, **los archivos que importan el control por su nombre y
  lo pintan** (`<Nombre` en el JSX). Estar en el árbol no basta: ver «Ojo».
- **Pantallas de T3:** dónde se pinta el control en cada una de las 12 piezas.
- «Propio de E» = archivo en `mecanicas/libros/tema3/`, `repasoCap5/` o la
  vista `ContabilidadTema3View.jsx`. «Compartido» = de Erwin.

## Claves de las pantallas de PE y Macro

Para que las filas se lean, las pantallas van con estas claves (archivos bajo
`src/components/`):

| Clave | Vista | Qué incluye |
|---|---|---|
| **PE-PS** | `PensamientoSistemicoView` | cabecera y camino de Hacer |
| **PE-IC** | `IcebergView` | cabecera y camino de Hacer |
| **PE-PO** | `PorterView` | cabecera y camino de Hacer |
| **DA-A** | `DemandaAgregadaAprenderView` | cabecera |
| **DA-H** | `DemandaAgregadaHacerView` | camino y juegos de Demanda agregada |
| **PEc** | `PoliticaEconomicaView` | camino y juegos de Política económica |
| **PF** | `PoliticaFiscalView` | camino y juegos de Política fiscal |
| **PM** | `PoliticaMonetariaView` | Aprender (CuatroCapas) y juegos de Política monetaria |
| **IDX** | `MacroTopicIndex` → `TopicIndexView` | índice de temas |
| **REP** | `repaso/RepasoView` → `PartidaRepaso` | Repaso diario de Macro |

Grupos de juegos que se repiten (los que pintan `Cierre`):

- **bloques·7** = `mecanicas/bloques/` CasoUnico, DuelosRanking, Explicale,
  FiltroDeSenales, PrimeraClasificacion, RolDeActores, SeAcercaOSeAleja (en
  DA-H, PEc y PF; en PM, los mismos menos FiltroDeSenales y SeAcercaOSeAleja).
- **corazón·7** = `mecanicas/corazon/` BancoTransfusiones, Biopsia, Cirugia,
  Electrocardiograma, SalaMonitores, Termometro, Triage (en DA-H).
- **máquinas·7** = `mecanicas/maquinas/` CasillasEnOrden, DosEntradas,
  LineaDeTiempo, PorCualArteria, PrediccionTasa, fabricaDelDinero,
  instrumentosPM (en PM).

## 1 · Botones de avance y de respuesta

| Control | Componente y archivo | ¿Propio de E o compartido? | Si es compartido: ¿lo usa PE o Macro? | Pantallas de T3 | ¿Qué pantallas de PE o de Macro lo usan? |
|---|---|---|---|---|---|
| Botón principal de Hacer: «Colocar la ficha», «Confirmar asiento», «Comprobar», «Siguiente ítem / hecho / par / caso», «Ver mi resumen», «Ver el resultado» | `Responder`, `mecanicas/libros/piezas.jsx` | Compartido | Macro sí; PE no | 7 (H1-H7) | **PM**: solo el «Siguiente» de los tutoriales (`AsiSeJuega`) de fabricaDelDinero y monetariaRepaso. PE: ninguna. (En Contabilidad lo usan además 95 `<Responder` en 64 archivos de las otras células.) |
| Botón principal de GP: «Siguiente», «Ver mi resumen» | `Responder`, `repasoCap5/comun.jsx` | Propio de E (GP y el Repaso del capítulo 5) | — | 1 (GP), más el Repaso del cap. 5 | Ninguna |
| «Comprobar» de H3 | `Comprobar`, `tema3/MismoHecho.jsx` (copia de `Responder` con `aria-disabled`) | Propio de E | — | 1 (H3) | Ninguna |
| «Confirmar asiento» por parte, en H7 | `BotonParte`, `tema3/ElCierreCompleto.jsx` (envuelve el `Responder` compartido) | Propio de E, pero pinta el compartido | Macro sí, vía `Responder` | 1 (H7) | Las de `Responder` |
| «Siguiente» del tutorial «Así se juega» | `Responder` dentro de `mecanicas/libros/AsiSeJuega.jsx` (lo monta `JuegoConTutorial`) | Compartido | Macro sí; PE no | 6 (H2-H7) en main; 7 con GP | **PM**: tutoriales de fabricaDelDinero (crea o cambia de manos, la escalera del encaje) y monetariaRepaso |
| «Pausar / Seguir / Ver de nuevo / Siguiente cuadro» del tutorial | botón `data-asj-control`, `AsiSeJuega.jsx` | Compartido | Macro sí; PE no | 6 (H2-H7); 7 con GP | **PM**: los mismos tutoriales |
| «Anterior» / «Siguiente» / «Continuar» de la capa 1 (términos) | `CuatroCapas.jsx`, `data-nav-capa1` | Compartido | Macro sí; PE no | 4 (P1, P3, P4, P5) | **PM** (Aprender). En Contabilidad, además: Intro (T1), Cuentas debe y haber (T2), T5 y T6 |
| «Anterior» / «Siguiente» de la capa 2 (pasos) | `MiraloFuncionar.jsx` (P1), `LoQueYaPaso.jsx` (P3), `LoQueYaSePago.jsx` (P4), `CerrarElPeriodo.jsx` (P5) | Propio de E | — | 4 | Ninguna. **Hay cuatro copias idénticas de `botonBase` y `DESACTIVADO`**: conviene llevarlas antes a un solo módulo de E para que el volumen entre una vez y no cuatro. |
| «Reproducir / Pausa / Ver de nuevo» (enlace subrayado) | los mismos 4 archivos | Propio de E | — | 4 | Ninguna (es un enlace, no un botón con cuerpo: decide Ukyo si lleva volumen) |
| «Seguir con otra empresa» | `PruebaUsted.jsx` (capa 3 de P1) | Propio de E | — | 1 (P1) | Ninguna |
| «Probar otra» (capa 4) | `mecanicas/libros/intro/UnaFrase.jsx` | Compartido | Ni PE ni Macro | 4 (P1, P3, P4, P5) | **Ninguna.** Solo Contabilidad: T1 (UnaFraseArticulacion, UnaFraseEcuacion, UnaFraseFotoPelicula), T3, T5 y T6 |
| «Otra vez» / «Otra tanda» en el recuadro de resultado | `Cierre` → `RecuadroDeResultado`, `mecanicas/corazon/juego.jsx` | Compartido | Macro sí; PE no lo pinta (ver «Ojo») | 8 (H1-H7 + GP) | **DA-H**: bloques·7 y corazón·7 · **PEc** y **PF**: bloques·7 · **PM**: bloques (5) y máquinas·7 · **REP**: PartidaRepaso |
| «Volver al camino» / «Repetir» de la pantalla de resumen | `PantallaResumen.jsx` (`data-volver`, `data-repetir`), por `CierreConResumen`; solo sale cuando la vista provee `ContextoResumen` | Compartido | Macro sí; PE no lo pinta (ver «Ojo») | 8 (H1-H7 + GP) | **DA-H, PEc, PF y PM**: todos los juegos que pintan `Cierre` (arriba) y, en **PEc**, además ArmaGrupoLogico, CorrienteTitulares, DiagnosticoEnVivo, QuienGanaQuienPierde, SimuladorDeCrisis y TableroDeDecisiones. REP no (no provee el contexto). |
| «‹ Volver al camino» (sobre el juego abierto) | `ContabilidadTema3View.jsx` | Propio de E (la misma forma está copiada en cada vista) | — | 8 (H1-H7 + GP) | Ninguna desde este archivo; cada vista tiene su copia |
| Chevrón «Volver a Contabilidad» | `ContabilidadTema3View.jsx` | Propio de E (copiado en cada vista) | — | todas (cabecera) | Ninguna desde este archivo; PE y Macro tienen su propia copia en su vista |

## 2 · Tarjetas de opción (lo que se toca para responder)

| Control | Componente y archivo | ¿Propio de E o compartido? | Si es compartido: ¿lo usa PE o Macro? | Pantallas de T3 | ¿Qué pantallas de PE o de Macro lo usan? |
|---|---|---|---|---|---|
| Opción de la pregunta final «En una frase» | `UnaFrase.jsx` (`data-opcion`) | Compartido | Ni PE ni Macro | 4 (P1, P3, P4, P5) | **Ninguna** (solo Contabilidad, como «Probar otra») |
| Punto de término (ir al término n) | `CuatroCapas.jsx` (`data-punto`) | Compartido | Macro sí; PE no | 4 | **PM** (Aprender) |
| «Ver lo que dice el libro» (pliegue) | `CuatroCapas.jsx` (`data-mas`) | Compartido | Macro sí; PE no | 3 (P3, P4, P5: las que tienen cita) | **PM**, solo si alguna de sus piezas trae cita del libro |
| Botón de hecho (capa 3 de P1) | `BotonHecho`, `PruebaUsted.jsx` | Propio de E | — | 1 (P1) | Ninguna |
| Pestaña de empresa / de mes (capa 3) | `CadaEmpresa.jsx` (P3), `CadaMes.jsx` (P4) | Propio de E | — | 2 | Ninguna |
| Fila de cuenta que se vacía (capa 3 de P5) | `ZonaA comoBoton`, `EscenaCierre.jsx` | Propio de E | — | 1 (P5) | Ninguna |
| Grupo 1-2-3 | `IngresoOCobro.jsx` (`data-grupo`) | Propio de E | — | 1 (H1) | Ninguna |
| Fila de marca (el día) | `CuandoSeCausa.jsx` (`fae-a2-fila`) | Propio de E | — | 1 (H2) | Ninguna |
| Opción de la segunda decisión | `OpcionSegunda`, `tema3/segundaDecision.jsx` | Propio de E | — | 2 (H1, H2) | Ninguna |
| Casilla del libro (abre la hoja) | `Casilla`, `MismoHecho.jsx` | Propio de E | — | 1 (H3) | Ninguna |
| Opción de la hoja (`role="radio"`) y «Cancelar» | `MismoHecho.jsx` | Propio de E | — | 1 (H3) | Ninguna |
| Ficha de nombre de cuenta (banco) y ficha de valor | `ArmaElAjuste.jsx` (`data-nombre`, `data-ficha-valor`) | Propio de E | — | 2 (H4, H5) | Ninguna |
| Columna debe / haber y hueco «sin nombre» de la cuenta T | `ArmaElAjuste.jsx` | Propio de E | — | 2 (H4, H5) | Ninguna (son zonas de destino: decide Ukyo si llevan volumen o solo las fichas) |
| «Antes» / «Después» (mover el corte) | `BotonPaso`, `QueLeToca.jsx` | Propio de E | — | 1 (H6) | Ninguna |
| Celda de la regla (toque directo) | `QueLeToca.jsx` (`data-celda`, transparente) | Propio de E | — | 1 (H6) | No aplica: es invisible a propósito |
| Botones «al debe» / «al haber» del estante y «devolver al estante» | `ElCierreCompleto.jsx` (`data-sacar`, `data-devolver`) | Propio de E | — | 1 (H7) | Ninguna |
| Casilla de la matriz | `Casilla`, `GastoOPago.jsx` (`fae-gp-casilla`) | Propio de E | — | 1 (GP) | Ninguna |
| Nodo del camino de Hacer | `shared/CaminoHacer.jsx` | Compartido | **PE sí** y Macro sí | 1 (el camino de T3: 7 nodos; 8 con GP) | **PE-PS, PE-IC, PE-PO** · **DA-H, PEc, PF, PM** (y el camino de todos los temas de Contabilidad). Es el control que más pantallas toca. |

## 3 · Contadores y progreso

| Control | Componente y archivo | ¿Propio de E o compartido? | Si es compartido: ¿lo usa PE o Macro? | Pantallas de T3 | ¿Qué pantallas de PE o de Macro lo usan? |
|---|---|---|---|---|---|
| Avance de la partida (puntos o barra, «Ítem / Hecho / Par / Caso n de N») | `Pulsos`, `mecanicas/corazon/juego.jsx` | Compartido | Macro sí; PE no. **Y `SecuenciaAprender` también lo usa** (con prueba que exige el del kit, no una copia) | 7 (H1-H7) | **DA-H**: DuelosRanking, Memorama, PrimeraClasificacion, RolDeActores, SeAcercaOSeAleja, BancoTransfusiones, Electrocardiograma, SalaMonitores, Termometro, Triage · **PEc** y **PF**: los cinco de bloques · **PM**: DuelosRanking, Memorama, PrimeraClasificacion, RolDeActores, DosEntradas, PorCualArteria, PrediccionTasa, fabricaDelDinero, instrumentosPM · **REP**: PartidaRepaso. Y toda pieza que monte `SecuenciaAprender`. |
| «Hecho n de N» de GP | texto con `CONTADOR`, `repasoCap5/comun.jsx` | Propio de E | — | 1 (GP) | Ninguna |
| Contadores de las dos líneas (Ingresos / Gastos / Entró / Salió) | `Contador`, `tema3/DosLineas.jsx` | Propio de E (T6 y B5 importan de `DosLineas` solo `useReducido`, no los contadores) | — | 3 (P1, P3, P4) | Ninguna |
| Contadores-barra Gastos / Salió | `Contador`, `GastoOPago.jsx` | Propio de E | — | 1 (GP) | Ninguna |
| «Término n de N» | `CuatroCapas.jsx` (`data-contador`) | Compartido | Macro sí; PE no | 4 | **PM** (Aprender). Es texto: probablemente fuera del volumen |
| «Paso n de N» de la capa 2 | los 4 archivos de capa 2 | Propio de E | — | 4 | Ninguna (texto) |

## 4 · Píldoras

| Control | Componente y archivo | ¿Propio de E o compartido? | Si es compartido: ¿lo usa PE o Macro? | Pantallas de T3 | ¿Qué pantallas de PE o de Macro lo usan? |
|---|---|---|---|---|---|
| Insignia APRENDER / HACER | `shared/ActivityBadge.jsx` | Compartido | **PE sí** y Macro sí | todas (cabecera) | **PE-PS, PE-IC, PE-PO** · **DA-A, DA-H, PEc, PF, PM, IDX, REP**: todas las cabeceras de PE y Macro |
| «¿Cómo se juega?» | `BotonComoSeJuega`, `mecanicas/libros/tema1/encabezado.jsx` (sale de `Encabezado` cuando recibe `onComoSeJuega`) | Compartido | Macro sí; PE no | 6 (H2-H7); 7 con GP | **PM**: DosEntradas, PorCualArteria y fabricaDelDinero (crea o cambia de manos, la escalera del encaje) |
| Pastilla «Correcto / Iba aquí / No va aquí» de la segunda decisión | `Pastilla`, `tema3/segundaDecision.jsx` | Propio de E | — | 2 (H1, H2) | Ninguna. Es un veredicto, no un control: decide Ukyo si lleva volumen |
| Pastilla de veredicto de GP | `Pastilla`, `repasoCap5/comun.jsx` | Propio de E | — | 1 (GP), más el Repaso del cap. 5 | Ninguna |
| Pastilla «Cierre de enero» | `AsientoTema3.jsx` (`data-pastilla-cierre`) | Propio de E | — | 1 (P5) | Ninguna |
| Chips «Retardo» y «Diferido» de la regla | `DosLineas.jsx` (`data-chip-retardo`, `data-chip-diferido`) | Propio de E | — | 2 (P3, P4) | Ninguna |
| «PIEZA n DE 4» | `ContabilidadTema3View.jsx` | Propio de E | — | 4 | Ninguna desde este archivo (PM tiene su propia copia del rótulo) |
| Rótulo del marco «EL LIBRO MAYOR · BÁSICO…» | `MarcoLibros` (`mecanicas/bloques/marcos.jsx`) → `Panel` (`mecanicas/salaDeControl/marco.jsx`) | Compartido | `MarcoLibros` en sí, solo Contabilidad; el `Panel` de debajo es el de los marcos de Macro (`MarcoMaquinas`, `MarcoCorazon`…). PE lo importa (por `tesoreria.jsx`, para un icono) pero no lo pinta | 8 (H1-H7 + GP) | Si el cambio va en `MarcoLibros`: ninguna. Si va en `Panel`: todos los juegos con marco de **DA-H, PEc, PF, PM y REP**, más Autorregulacion, MaquinaDA y TableroDeFallas en **PEc** y el Aprender de **PM** (`CuatroCapas` lo usa). Es un rótulo: probablemente fuera del volumen |

## Ojo: estar en el árbol de imports no es pintarlo

Tres compartidos aparecen en el cierre de imports de Pensamiento Estratégico
sin que PE los pinte:

- `corazon/juego.jsx` llega a PE solo porque `previasFiscal.jsx` importa
  `IconoMecanismo` de `tesoreria.jsx`, y `tesoreria.jsx` importa `CSS_JUEGO`.
  PE no pinta ni `Pulsos` ni `Cierre`.
- `PantallaResumen.jsx` y `TableroDeDecisiones.jsx` llegan por
  `previasEconomica.jsx`, que importa `Esfera` y `Onda` para dibujar la previa
  de un nodo del camino. PE no pinta la pantalla de resumen.
- Por eso, en las filas de `Cierre`, `Pulsos` y `PantallaResumen`, PE dice «no».
  Lo que PE pinta, directo, de esta lista: **`CaminoHacer`, `ActivityBadge` y
  `FondoMateria`.** Esas son las pantallas de PE que hay que comprobar.

Del mismo modo, las listas de juegos de Macro salen del árbol de imports de
cada vista (los archivos que importan el control **y** lo pintan). Un juego que
la vista importe pero no tenga en su camino aparecería igual: la lista sirve
para comprobar de más, no de menos.

## Resumen para quien decida el orden

- **De E, sin pedir nada:** 30 filas de este inventario; una (la celda
  invisible de H6) no aplica. No tocan ninguna pantalla de PE ni de Macro. La
  navegación de la capa 2 está copiada cuatro veces y conviene unirla antes.
- **Compartido, solo Contabilidad:** `UnaFrase` (opción y «Probar otra») y
  `MarcoLibros` en sí. Cero pantallas de PE o Macro que comprobar.
- **Compartido con Macro, no con PE:** `Responder` y `AsiSeJuega` (PM, solo
  tutoriales), `CuatroCapas` (PM Aprender), `Encabezado`/`BotonComoSeJuega`
  (PM, 3 juegos), `Cierre`, `PantallaResumen` y `Pulsos` (casi todos los juegos
  de DA-H, PEc, PF, PM y REP). `Pulsos` decide además el contador de
  `SecuenciaAprender`.
- **Compartido con PE:** `CaminoHacer` (los tres caminos de PE más los de
  Macro y Contabilidad) y `ActivityBadge` (todas las cabeceras). Son los dos que
  más pantallas tocan.
- Todo lo compartido es de Erwin: se le pide por issue con la etiqueta `miku`.
