# Gestión de Proyectos · Conexión Aprender (Jane) ↔ Hacer (Gen)

> Gen, 2026-11-27. Al escribir esto **no existe aún trabajo de Jane** en esta materia.
> Estos son los puntos de conexión que Gen propone; Jane puede cambiar el diseño interno
> de cada Aprender, pero si cambia un id, un personaje o un documento, lo avisa aquí.

## La regla de los dos pasos (lo que pidió el profesor)
1. **Aprender (Jane):** el estudiante *entiende* el concepto o el documento (microvideo o
   simulador con el mismo escenario).
2. **Hacer (Gen):** el mismo día lo *ejercita* con una decisión en ese escenario.

## Lo que comparten
- **Mundo:** Altamira, cafetera de Manizales que crece (tienda en Medellín, app de pedidos,
  puente de la finca, programa «Expansión a la costa»). Detalle en `disenos/c1-c2-hacer.md` §0.
- **Elenco:** `elenco.md`. El estudiante es siempre director(a) de proyectos de Altamira.
- **Subtemas:** los ids `gp-…` de las fichas. Cada Aprender declara los suyos; el panel
  docente cruza Aprender y Hacer por subtema.
- **Documentos como objetos:** cuando un Aprender muestre un documento (caso de negocio,
  acta, plan, informe), usa la misma carpeta ilustrada que su Hacer, para que el
  estudiante reconozca «el mismo papel». Propuesta: un componente común `DocumentoPM`.

## Pares propuestos (Aprender → Hacer)

| Aprender (Jane) | Qué deja entendido | Situación que el Hacer retoma | Hacer (Gen) |
|---|---|---|---|
| `gp-a01` ¿Qué es un proyecto? | temporal + único; proyecto vs. operación; cuándo termina | lunes en Altamira; la app de pedidos | `gp-h01-bandeja`, `gp-h02-reloj` |
| `gp-a02` Por qué nace un proyecto | cambio de estado, valor tangible/intangible, 4 motivos | propuestas a la patrocinadora; tienda Medellín | `gp-h03-sellos`, `gp-h04-puente` |
| `gp-a03` Proyecto, programa, portafolio | relaciones, «correctos» vs «correcta», operaciones | mapa de la junta | `gp-h05-portafolio` |
| `gp-a04` Ciclo de vida y fases | 5 ciclos del desarrollo; fase; punto de revisión | equipos de la app; puertas de la tienda | `gp-h06-lineas`, `gp-h07-puerta` |
| `gp-a05` Procesos, grupos y áreas | entrada → herramienta → salida; 5 grupos ≠ fases; 10 áreas | calendario del practicante; teléfono de la obra | `gp-h08-calendario`, `gp-h09-central` |
| `gp-a06` Datos, información, informes | flujo del gráfico 1-7 | reporte del viernes | `gp-h10-cafetera` |
| `gp-a07` Documentos de negocio y éxito | evaluación de necesidades → caso → acta → plan; medidas de éxito | puente con grietas; app que nadie usa | `gp-h11-caso-puente`, `gp-h12-balanzas` |
| `gp-a08` La guía, la adaptación y la ética | guía ≠ metodología; adaptar; 4 valores | memorando de inducción; sobre del proveedor | `gp-h13-memorando`, `gp-h14-sobre` |
| `gp-a09` EEF y OPA | qué no controlas y qué tiene la organización | bodega de Santa Marta | `gp-h15-control` |
| `gp-a10` Sistemas, gobernanza y gestión | principios de sistemas; elementos de gestión | órdenes cruzadas en la bodega | `gp-h16-nudos` |
| `gp-a11` Estructuras y PMO | autoridad del director por estructura; 3 tipos de PMO | reorganización; empresas aliadas | `gp-h17-dial`, `gp-h18-pmo` |

## Cómo se enlazan en pantalla (para construcción)
- El Aprender termina con un botón «Practícalo» que abre su primer Hacer.
- El Hacer arranca con una línea «Viene de: <nombre del Aprender>» y un enlace para
  verlo de nuevo. **No bloquea**: si el estudiante entra directo, puede jugar.
- Simuladores de Jane que conviene (sugerencia): A04 un ciclo de vida que el estudiante
  configura; A07 un caso de negocio que se llena por secciones; A11 la tabla 2-1 como
  algo manipulable. Los Hacer H07, H11 y H17 retoman exactamente esos objetos.

## Capítulos 3 a 13
Cada diseño trae su tabla de Aprender propuestos en su **§6. Conexión con Jane**
(`disenos/c03-hacer.md` … `disenos/c13-hacer.md`), con ids `gp-cNN-aMM`. Mismo mundo
(Altamira), mismo elenco y misma regla de dos pasos.
