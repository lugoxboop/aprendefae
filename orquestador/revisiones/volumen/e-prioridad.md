# Volumen · Célula E · los 10 controles por impacto (Itagaki, 24-oct-2026)

> Lista cruzada con el inventario de Ippo (`e-inventario-controles.md`, #544). El alcance es el de las tres materias (Mateo vía Miku, 24-oct): no hay opt-in, un control compartido se cambia una sola vez y lo heredan todas. **La forma (elevación, sombra, bajada al pulsar) la define Ukyo en `celula-diseno`; aquí no hay valores.**
> **Criterio:** lo que se toca sube; lo que recibe se hunde; lo que informa es una placa que no baja al pulsar. El orden también tiene en cuenta el alcance. **(E)** = control de Erwin, se le pide por issue con la etiqueta `miku`.

| # | Control · archivo | ¿Propio o compartido? | Quién lo hereda en Pensamiento Estratégico (PE) y Macro | Por qué le pega |
|---|---|---|---|---|
| 1 | Nodo del camino de Hacer · `shared/CaminoHacer.jsx` | Compartido (E) | PE-PS, PE-IC y PE-PO; DA-H, PEc, PF, PM; todos los caminos de Contabilidad | Es la puerta de cada Hacer y el control que aparece en más pantallas. Un nodo con relieve que baja al pulsar dice «empieza aquí» antes de leer. |
| 2 | Responder (`mecanicas/libros/piezas.jsx`), con `BotonComoSeJuega` (`tema1/encabezado.jsx`) y el «Siguiente» de `AsiSeJuega` | Compartido (E) | Responder y AsiSeJuega: PM (fabricaDelDinero, monetariaRepaso). BotonComoSeJuega: PM (DosEntradas, PorCualArteria, fabricaDelDinero). PE: ninguna | Es el botón que cierra cada decisión. **La Célula E pasa sus dos copias** (`Responder` de `repasoCap5/comun.jsx` y `Comprobar` de `MismoHecho.jsx`) **al Responder compartido**, para que el volumen entre una sola vez. |
| 3 | Casilla de la matriz · `GastoOPago.jsx` | Propio | Ninguna | Es el toque que califica en el acto. La bajada al pulsar y la caída de la ficha son el momento clave. |
| 4 | Tarjetas de opción de H1 y H2 · `IngresoOCobro.jsx` (`data-grupo`), `segundaDecision.jsx` (`OpcionSegunda`), `CuandoSeCausa.jsx` (fila de marca) | Propio | Ninguna | Hoy son contornos planos que se confunden con los rótulos. |
| 5 | Fichas de nombre y valor de `ArmaElAjuste.jsx` (`data-nombre`, `data-ficha-valor`) y sus destinos hundidos (Debe, Haber, hueco sin nombre) | Propio | Ninguna | Ficha que sube y destino que se hunde: el gesto se entiende sin texto. |
| 6 | `BOTON_NAV` de `SecuenciaAprender` | Compartido (E) | PM Aprender y toda pieza montada en SecuenciaAprender | Es el toque más repetido de Aprender. No se aplica a las copias de `botonBase` ni a `CuatroCapas`, porque SecuenciaAprender las reemplaza. |
| 7 | Casilla del libro y opciones de la hoja · `MismoHecho.jsx` | Propio | Ninguna | La casilla es destino (hundida) y las opciones se tocan (suben). |
| 8 | Controles de paso · `QueLeToca.jsx` (`BotonPaso`, «Antes», «Después») y `ElCierreCompleto.jsx` (`data-sacar`, `data-devolver`) | Propio | Ninguna | Se tocan muchas veces seguidas; el relieve los separa de la lectura. También vale para el ‹ › de Aprender. |
| 9 | Pulsos · `mecanicas/corazon/juego.jsx` | Compartido (E) | DA-H (10), PEc y PF (5 cada una), PM (9), REP y SecuenciaAprender | Es un contador, así que **va como placa, sin bajada al pulsar**. |
| 10 | Insignia APRENDER / HACER · `shared/ActivityBadge.jsx` | Compartido (E) | PE-PS, PE-IC y PE-PO; DA-A, DA-H, PEc, PF, PM, IDX y REP | Es la píldora que pidió Mateo y la de mayor alcance. Informa: **va como placa**. |

**Fuera de la lista:**
- Pastillas de veredicto: con relieve se leerían como botón.
- «En una frase» y «Probar otra»: con S3 salen de las piezas de E.
- Contadores de texto, rótulos y chips: solo informan.
- El enlace «Reproducir».
- La celda invisible de H6.

**A Erwin:** #1, #2, #6, #9 y #10 (issue con la etiqueta `miku`).
