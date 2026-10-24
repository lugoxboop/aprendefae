# Volumen de los controles · inventario de T3 (Célula E)

Ippo, 24-oct-2026, issue #538 punto 1. **Solo documentación: no cambia ningún
estilo.** La forma del volumen (elevación, sombra, cuánto baja al pulsar) la
define Ukyo en la skill `celula-diseno`; aquí no se propone ninguna.

**Alcance:** las 4 piezas de Aprender publicadas (P1 «Vender no es cobrar», P3
«Lo que ya pasó…», P4 «Lo que ya se pagó…», P5 «Cerrar el periodo»), las 7
Hacer publicadas (H1 ¿Ingreso o cobro?, H2 ¿Cuándo se causa?, H3 El mismo
hecho, H4 Ajuste acumulado, H5 Ajuste diferido, H6 ¿Qué le toca a este
periodo?, H7 El cierre completo) y «¿Gasto o pago?» (GP, en el PR #533, aún sin
fusionar: se leyó de su rama). Más el camino de Hacer y la cabecera del tema.

## Cómo se midió (no se supuso)

- **Quién usa qué:** un grafo de imports desde cada vista (cierre transitivo,
  `import … from` e `import()`), comparado con el de las vistas de Pensamiento
  Estratégico (`PensamientoSistemicoView`, `IcebergView`, `PorterView`) y de
  Macroeconomía (`DemandaAgregada*`, `PoliticaEconomica/Fiscal/MonetariaView`,
  `MacroTopicIndex`, `repaso/RepasoView`). Después, para cada compartido, **qué
  nombres importa directamente** cada archivo de ese cierre: estar en el cierre
  no basta (ver «Ojo» abajo).
- **Cuántas pantallas:** contando dónde se pinta el control en cada una de las
  12 piezas de T3 (4 Aprender + 7 Hacer + GP).
- «Propio de E» = archivo en `mecanicas/libros/tema3/`, `repasoCap5/` o la
  vista `ContabilidadTema3View.jsx`. «Compartido» = de Erwin.

## Leyenda de la última columna

- **prop**: el componente recibe una prop (`volumen`), como ya hace
  `CuatroCapas` con `rotulo`. Quien no la pasa, queda igual.
- **contexto**: un `createContext` por materia (p. ej. `ContextoMateria`) que
  pone la vista o `FondoMateria` (que ya recibe `materiaId` y envuelve todas las
  vistas); el control lo lee. Sirve cuando el control está a varios niveles de
  la vista y pasar una prop obligaría a tocar a todos los intermedios.
- **clase**: `FondoMateria` marca su raíz con `data-materia="contabilidad"` y
  el estilo cuelga de `[data-materia="contabilidad"] .fae-vol-…`. Solo sirve
  para lo que se pinta con CSS; casi todo T3 usa `style={{…}}` en línea, que
  una regla de clase no puede pisar sin `!important`.
- **local**: el control es de E; el volumen entra en el archivo de E, solo en
  T3, sin pedir nada a nadie.

## 1 · Botones de avance y de respuesta

| Control | Componente y archivo | ¿Propio de E o compartido? | Si es compartido: ¿PE o Macro? | Pantallas de T3 | ¿Cómo se haría opt-in? |
|---|---|---|---|---|---|
| Botón principal de Hacer: «Colocar la ficha», «Confirmar asiento», «Comprobar», «Siguiente ítem / hecho / par / caso», «Ver mi resumen», «Ver el resultado» | `Responder`, `mecanicas/libros/piezas.jsx` | Compartido | **Macro sí** (`AsiSeJuega`, que pinta el «Siguiente» de los tutoriales de Política Monetaria). PE no. | 7 (H1-H7) | prop `volumen` en `Responder`; los 7 Hacer de T3 la pasan. Contexto si se quiere el mismo volumen en toda Contabilidad sin tocar sus llamadas (medido: 95 `<Responder` en 64 archivos, sin contar `repasoCap5`). |
| Botón principal de GP: «Siguiente», «Ver mi resumen» | `Responder`, `repasoCap5/comun.jsx` | Propio de E (lo comparten GP y el Repaso del capítulo 5) | — | 1 (GP), más el Repaso del capítulo 5 | local, con prop: el repaso cap. 5 también es de E y es Contabilidad |
| «Comprobar» de H3 | `Comprobar`, `tema3/MismoHecho.jsx` (copia de `Responder` con `aria-disabled`) | Propio de E | — | 1 (H3) | local |
| «Confirmar asiento» por parte, en H7 | `BotonParte`, `tema3/ElCierreCompleto.jsx` (envuelve el `Responder` compartido) | Propio de E, pero pinta el compartido | Macro sí, vía `Responder` | 1 (H7) | sigue a `Responder` (prop) |
| «Siguiente» del tutorial «Así se juega» | `Responder` dentro de `mecanicas/libros/AsiSeJuega.jsx` (lo monta `JuegoConTutorial`) | Compartido | **Macro sí** (`fabricaDelDinero`, `monetariaRepaso`) | 6 (H2-H7) en main; 7 con GP | prop en `JuegoConTutorial` → `AsiSeJuega` → `Responder`, o contexto. H1 no tiene tutorial. |
| «Pausar / Seguir / Ver de nuevo / Siguiente cuadro» del tutorial | botón `data-asj-control`, `AsiSeJuega.jsx` | Compartido | Macro sí | 6 (H2-H7); 7 con GP | igual que la fila anterior |
| «Anterior» / «Siguiente» / «Continuar» de la capa 1 (términos) | `CuatroCapas.jsx`, `data-nav-capa1` | Compartido | **Macro sí** (`PoliticaMonetariaView`). PE no. | 4 (P1, P3, P4, P5) | prop en `CuatroCapas` (ya tiene `rotulo` como precedente de opt-in). Su skill dice que lo que entra ahí entra pieza por pieza. |
| «Anterior» / «Siguiente» de la capa 2 (pasos) | `MiraloFuncionar.jsx` (P1), `LoQueYaPaso.jsx` (P3), `LoQueYaSePago.jsx` (P4), `CerrarElPeriodo.jsx` (P5) | Propio de E | — | 4 (P1, P3, P4, P5) | local. **Hay cuatro copias idénticas de `botonBase` y `DESACTIVADO`**: conviene llevarlas antes a un solo módulo de E para que el volumen entre una vez y no cuatro. |
| «Reproducir / Pausa / Ver de nuevo» (enlace subrayado) | los mismos 4 archivos | Propio de E | — | 4 | local (es un enlace, no un botón con cuerpo: decide Ukyo si lleva volumen) |
| «Seguir con otra empresa» | `PruebaUsted.jsx` (capa 3 de P1) | Propio de E | — | 1 (P1) | local |
| «Probar otra» (capa 4) | `mecanicas/libros/intro/UnaFrase.jsx` | Compartido | **Ni PE ni Macro**: solo Contabilidad (T1, T2, T3…) | 4 (P1, P3, P4, P5) | prop, o contexto. Es la vía más segura de todas las compartidas. |
| «Otra vez» / «Otra tanda» en el recuadro de resultado | `Cierre` → `RecuadroDeResultado`, `mecanicas/corazon/juego.jsx` | Compartido | **Macro sí** (`PartidaRepaso`, `instrumentosPM`, `fabricaDelDinero`…). PE no lo pinta (ver «Ojo»). | 8 (H1-H7 + GP) | prop en `Cierre`; los Hacer de T3 la pasan. Contexto si se quiere para toda Contabilidad. |
| «Volver al camino» / «Repetir» de la pantalla de resumen | `PantallaResumen.jsx` (`data-volver`, `data-repetir`), por `CierreConResumen` | Compartido | **Macro sí**. PE solo lo importa, no lo pinta (ver «Ojo»). | 8 (H1-H7 + GP) | contexto: ya existe `ContextoResumen`, que la vista provee; un campo `volumen` en ese valor llega sin tocar a los intermedios. |
| «‹ Volver al camino» (sobre el juego abierto) | `ContabilidadTema3View.jsx` | Propio de E | — | 8 (H1-H7 + GP) | local |
| Chevrón «Volver a Contabilidad» | `ContabilidadTema3View.jsx` | Propio de E (la misma forma está copiada en cada vista) | — | todas (cabecera) | local; las otras vistas son de sus células |

## 2 · Tarjetas de opción (lo que se toca para responder)

| Control | Componente y archivo | ¿Propio de E o compartido? | Si es compartido: ¿PE o Macro? | Pantallas de T3 | ¿Cómo se haría opt-in? |
|---|---|---|---|---|---|
| Opción de la pregunta final «En una frase» | `UnaFrase.jsx` (`data-opcion`) | Compartido | Ni PE ni Macro | 4 (P1, P3, P4, P5) | prop / contexto |
| Punto de término (ir al término n) | `CuatroCapas.jsx` (`data-punto`) | Compartido | Macro sí | 4 | prop en `CuatroCapas`; probablemente fuera de alcance (es un punto, no una tarjeta) |
| «Ver lo que dice el libro» (pliegue) | `CuatroCapas.jsx` (`data-mas`) | Compartido | Macro sí | 3 (P3, P4, P5: las que tienen cita) | prop en `CuatroCapas` |
| Botón de hecho (capa 3 de P1) | `BotonHecho`, `PruebaUsted.jsx` | Propio de E | — | 1 (P1) | local |
| Pestaña de empresa / de mes (capa 3) | `CadaEmpresa.jsx` (P3), `CadaMes.jsx` (P4) | Propio de E | — | 2 | local |
| Fila de cuenta que se vacía (capa 3 de P5) | `ZonaA comoBoton`, `EscenaCierre.jsx` | Propio de E | — | 1 (P5) | local |
| Grupo 1-2-3 | `IngresoOCobro.jsx` (`data-grupo`) | Propio de E | — | 1 (H1) | local |
| Fila de marca (el día) | `CuandoSeCausa.jsx` (`fae-a2-fila`) | Propio de E | — | 1 (H2) | local; ya tiene clase `fae-a2-fila`, así que también admite **clase** |
| Opción de la segunda decisión | `OpcionSegunda`, `tema3/segundaDecision.jsx` | Propio de E | — | 2 (H1, H2) | local |
| Casilla del libro (abre la hoja) | `Casilla`, `MismoHecho.jsx` | Propio de E | — | 1 (H3) | local |
| Opción de la hoja (`role="radio"`) y «Cancelar» | `MismoHecho.jsx` | Propio de E | — | 1 (H3) | local |
| Ficha de nombre de cuenta (banco) y ficha de valor | `ArmaElAjuste.jsx` (`data-nombre`, `data-ficha-valor`) | Propio de E | — | 2 (H4, H5) | local |
| Columna debe / haber y hueco «sin nombre» de la cuenta T | `ArmaElAjuste.jsx` | Propio de E | — | 2 (H4, H5) | local (son zonas de destino: decide Ukyo si llevan volumen o solo las fichas) |
| «Antes» / «Después» (mover el corte) | `BotonPaso`, `QueLeToca.jsx` | Propio de E | — | 1 (H6) | local |
| Celda de la regla (toque directo) | `QueLeToca.jsx` (`data-celda`, transparente) | Propio de E | — | 1 (H6) | no aplica: es invisible a propósito |
| Botones «al debe» / «al haber» del estante y «devolver al estante» | `ElCierreCompleto.jsx` (`data-sacar`, `data-devolver`) | Propio de E | — | 1 (H7) | local |
| Casilla de la matriz | `Casilla`, `GastoOPago.jsx` (`fae-gp-casilla`) | Propio de E | — | 1 (GP) | local; ya tiene clase, así que también admite **clase** |
| Nodo del camino de Hacer | `shared/CaminoHacer.jsx` | Compartido | **PE sí, directo** (las tres vistas de PE) y Macro sí | 1 (el camino de T3, 7 nodos; 8 con GP) | **solo contexto o prop, nunca clase global ni cambio de base**: es el control más peligroso del inventario. `CaminoHacer` no recibe la materia hoy; habría que pasársela (prop) o leerla de un contexto que pongan solo las vistas de Macro y Contabilidad. |

## 3 · Contadores y progreso

| Control | Componente y archivo | ¿Propio de E o compartido? | Si es compartido: ¿PE o Macro? | Pantallas de T3 | ¿Cómo se haría opt-in? |
|---|---|---|---|---|---|
| Avance de la partida (puntos o barra, «Ítem / Hecho / Par / Caso n de N») | `Pulsos`, `mecanicas/corazon/juego.jsx` | Compartido | **Macro sí**. PE no. **Y `SecuenciaAprender` también lo usa** (con prueba que exige que sea el del kit, no una copia). | 7 (H1-H7) | prop en `Pulsos`; ojo: si el volumen entra en `Pulsos`, decide también cómo se ve el contador de la secuencia nueva |
| «Hecho n de N» de GP | texto con `CONTADOR`, `repasoCap5/comun.jsx` | Propio de E | — | 1 (GP) | local |
| Contadores de las dos líneas (Ingresos / Gastos / Entró / Salió) | `Contador`, `tema3/DosLineas.jsx` | Propio de E (T6 y B5 importan de `DosLineas` solo `useReducido`, no los contadores) | — | 3 (P1, P3, P4) | local |
| Contadores-barra Gastos / Salió | `Contador`, `GastoOPago.jsx` | Propio de E | — | 1 (GP) | local |
| «Término n de N» | `CuatroCapas.jsx` (`data-contador`) | Compartido | Macro sí | 4 | prop en `CuatroCapas` (es texto: probablemente fuera de alcance) |
| «Paso n de N» de la capa 2 | los 4 archivos de capa 2 | Propio de E | — | 4 | local (texto) |

## 4 · Píldoras

| Control | Componente y archivo | ¿Propio de E o compartido? | Si es compartido: ¿PE o Macro? | Pantallas de T3 | ¿Cómo se haría opt-in? |
|---|---|---|---|---|---|
| Insignia APRENDER / HACER | `shared/ActivityBadge.jsx` | Compartido | **PE sí, directo** (las tres vistas) y Macro sí | todas (cabecera) | prop (`volumen`) o contexto; nunca cambiar la base |
| «¿Cómo se juega?» | `BotonComoSeJuega`, `mecanicas/libros/tema1/encabezado.jsx` | Compartido | **Macro sí** (`fabricaDelDinero`, `DosEntradas`, `PorCualArteria`, vía `Encabezado`). PE no. | 6 (H2-H7); 7 con GP | prop en `Encabezado` → `BotonComoSeJuega` |
| Pastilla «Correcto / Iba aquí / No va aquí» de la segunda decisión | `Pastilla`, `tema3/segundaDecision.jsx` | Propio de E | — | 2 (H1, H2) | local. Es un veredicto, no un control: decide Ukyo si lleva volumen |
| Pastilla de veredicto de GP | `Pastilla`, `repasoCap5/comun.jsx` | Propio de E | — | 1 (GP) + repaso cap. 5 | local |
| Pastilla «Cierre de enero» | `AsientoTema3.jsx` (`data-pastilla-cierre`) | Propio de E | — | 1 (P5) | local |
| Chips «Retardo» y «Diferido» de la regla | `DosLineas.jsx` (`data-chip-retardo`, `data-chip-diferido`) | Propio de E | — | 2 (P3, P4) | local |
| «PIEZA n DE 4» | `ContabilidadTema3View.jsx` | Propio de E | — | 4 | local (es un rótulo, no una píldora) |
| Rótulo del marco «EL LIBRO MAYOR · BÁSICO…» | `MarcoLibros` → `Panel`, `mecanicas/bloques/marcos.jsx` | Compartido | Macro sí (por `marcos.jsx`). PE no. | 8 (H1-H7 + GP) | prop en `MarcoLibros` (es un rótulo) |

## Ojo: estar en el árbol de imports no es usarlo

Tres compartidos aparecen en el cierre de imports de Pensamiento Estratégico
sin que PE los pinte:

- `corazon/juego.jsx` llega a PE solo porque `previasFiscal.jsx` importa
  `IconoMecanismo` de `tesoreria.jsx`, y `tesoreria.jsx` importa `CSS_JUEGO`.
  PE no pinta ni `Pulsos` ni `Cierre`.
- `PantallaResumen.jsx` llega por `previasEconomica.jsx` (importa `Esfera` de
  `TableroDeDecisiones` y `Onda` de `ExplicaLaPolitica`, que a su vez importan
  `CierreConResumen`). PE no lo pinta.
- **Pero un cambio en el CSS de esos archivos (`CSS_JUEGO`, por ejemplo) sí
  puede alcanzar a PE** si alguna de esas piezas lo inyecta. Por eso el
  volumen en un compartido entra por prop o contexto, nunca reescribiendo su
  estilo base ni sus cadenas de CSS.

Lo que PE sí pinta, directo, de esta lista: **`CaminoHacer`, `ActivityBadge` y
`FondoMateria`.** Nada más.

## Resumen para quien decida el orden

- **De E, sin pedir nada (local):** 30 filas de este inventario; una (la celda invisible de H6) no aplica. El 100 %
  de las tarjetas de opción de los Hacer, los contadores de las dos líneas, la
  navegación de la capa 2 (4 copias que conviene unir primero) y todo GP.
- **Compartido, solo Contabilidad:** `UnaFrase` (opción y «Probar otra»).
- **Compartido con Macro, no con PE:** `Responder`, `Cierre`, `PantallaResumen`,
  `Pulsos`, `Encabezado`/`BotonComoSeJuega`, `AsiSeJuega`, `CuatroCapas`,
  `MarcoLibros`. Como Macro también entra en el volumen, aquí la prop sirve
  para las dos; aun así, **opt-in**, porque las demás células de Contabilidad
  tienen sus propias pantallas medidas.
- **Compartido con PE:** `CaminoHacer` y `ActivityBadge`. Solo con prop o
  contexto que las vistas de PE no pongan.
- Todo lo compartido es de Erwin: se le pide por issue con la etiqueta `miku`.
