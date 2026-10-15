**T4 · A1 «La caja» · cambios de la versión 4 sobre la v3** (v1 + `v2-cambios` + `v3-cambios`, con la paráfrasis de e12ed82).
- Autora: Katsumi.
- Motivo: la auditoría de Shibukawa del 15 de octubre (`celula-d/shibukawa-auditoria-a1-a2.md`), que da PASA CON CORRECCIONES, y la orden de Yujiro.
- Lo que no se nombra aquí queda igual que en la v3.
- INFLESZ **medido** con `src/herramientas/inflesz.js`. El mínimo de la pieza sube de 65,4 a **66,0**.

## Obligatoria A1-1 · La póliza de manejo (P7, numeración de la v2)

**Control 6, la línea de la lista:**
- v3: «Asegurar con una póliza de manejo a quienes tocan la plata.» (71,2)
- **v4:** «Tener una póliza de manejo sobre quienes manejan la plata.» (66,0)
- Por qué: «asegurar a quienes tocan la plata» hacía creer que los asegurados son los empleados. «Sobre quienes» dice a quién vigila la póliza sin decir que los protege.

**La glosa:**
- v3: «Una póliza de manejo es un seguro que protege a la empresa si quien maneja su dinero causa una pérdida.» (65,4)
- **v4:** «Una póliza de manejo es un seguro de la empresa: la cubre si quien maneja su plata se la roba o se queda con ella.» (79,7)
- Por qué: la v3 decía de más. La póliza no cubre cualquier pérdida ni un error honesto; cubre que alguien se apropie de la plata.
- *[Glosa mía, construida: el libro no define la póliza de manejo (HD4-3). La sostengo con la fuente pública que citó Shibukawa, el condicionado de Seguros SURA «Solución Manejo Comercial», que ampara al asegurado contra la apropiación indebida de su dinero u otros bienes. No entro en más detalles de seguros que no podamos sostener: tipos de apropiación, deducibles o exclusiones. Shibukawa leyó un solo condicionado; no está verificado que valga igual para todas las aseguradoras.]*

**Efecto en H2.** H2 usa el mismo texto del control 6 y la idea de que la póliza «cubre una pérdida». Ver el aviso al final.

## Obligatoria A1-2 · P1, del Tema 3 a Caja y Bancos (pantalla de la v2)

La v2 presentaba como nueva la separación entre Caja y Bancos, que el Tema 2 ya enseñó (cu2-09, cu2-10 y `COLETILLA_CAJA_BANCOS`: «El capítulo las lleva por separado»). Pasa a ser un recordatorio.

| | v2 | **v4** |
|---|---|---|
| línea 1 | «En el Tema 3, la caja era la plata de la empresa, sin importar dónde estuviera: la que entra con un cobro y la que sale con un pago.» (76,9) | «En el Tema 3, la caja era la plata de la empresa en general: la que entra con un cobro y la que sale con un pago.» (85,2) |
| línea 2 | «Esa idea sigue valiendo. Aquí esa plata se parte en dos cuentas: Caja, la que está a la mano, y Bancos, la que está en el banco.» (89,5) | «En el Tema 2 ya viste que esa plata va en dos cuentas: Caja, la que está a la mano, y Bancos, la que está en el banco.» (87,6) |
| línea 3 | «Esta pieza mira la primera: Caja. Bancos tiene su propia pieza más adelante.» (75,7) | «Esta pieza mira de cerca la primera, Caja. Bancos tiene su propia pieza más adelante.» (78,9) |

- Pie: pasa de «Basado en el libro, pp. 179 y 186» a «Basado en el libro, pp. 179 y 186, y en los Temas 2 y 3».
- *[«En general» sigue siendo mi forma de decir que el Tema 3 habla de caja en sentido amplio (C5). El Tema 2 lo comprobé en `contabilidadActividades.js`.]*

## Opcional que tomo: resumen 3 (P9)

- v3: «El efectivo pide controles estrictos. Entre ellos, informes diarios, consignar cada día y separar a quien cobra de quien registra.» (66,0)
- **v4:** «El efectivo pide controles estrictos. Entre ellos, anotar y consignar cada día, y separar a quien cobra de quien registra.» (69,1)
- Por qué: así queda alineado con el vocabulario de la lista vigente («Anotar cada día…», «Llevar al banco, cada día…»).

## Opcionales que no tomo, y por qué

- **El control 5 y la glosa de arqueo dicen lo mismo.** Quito la glosa de debajo y dejo el control como está, «Contar la caja seguido y sin avisar: eso es un arqueo.», porque ya define el término en su sitio. **Lo tomo:** la glosa de arqueo de P7 sale.
- **«A la mano» aparece en P1 (v4) y en P2 (v3), con un par de líneas de diferencia.** Lo dejo. La repetición conecta las dos pantallas: la P1 dice qué es Caja y la P2 empieza por ahí. Si Yujiro prefiere cambiarlo, en la P2 de la v3 «la parte que la empresa tiene a la mano» puede pasar a «la plata que la empresa tiene en la oficina» (no medido).

## Obligatoria de proceso A1-P

No es mía, es de Baki: el PR sale de su árbol de trabajo, no del commit 46c17bc, y A0 entra en el mismo PR, porque A1 remite a «El activo corriente». **Con esta v4, Baki tiene que volver a construir** P1, P7 (control 6, glosa de póliza y la glosa de arqueo que se quita) y el resumen 3.

## Aviso: H2 usa lo que cambió aquí

H2 (`d4-t4-h2-v1.md`, commit c4bac7f) no se toca en este commit, porque el encargo era A1. Pero depende del cambio:
- Su opción del control 6 repite el texto viejo: «Asegurar con una póliza de manejo a quienes tocan la plata».
- Varias retroalimentaciones dicen que la póliza «protege a la empresa si alguien causa una pérdida».
- El caso H2-6 habla de «una pérdida».

Esto se corrige en una v2 de H2 con el texto nuevo. Si quieres, la saco antes de seguir la cola.

## Erratas que toca esta pieza

Sin cambios: A1 no toca ninguna errata del territorio.
