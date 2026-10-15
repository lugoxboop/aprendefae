# Mapa T4 · Efectivo, caja menor y bancos · pp. 177-191

## Control

Mapa de Katsumi (Célula D «Baki Hanma»), versión 1.2, 15 de octubre de 2026 (v1 del 14 de octubre). Fuente: *Contabilidad financiera para contaduría y administración*, cap. 5: apertura del capítulo (pp. 177-179), §5.1 y §5.2. La v1.2 incorpora el cotejo de Shibukawa (PASA CON CORRECCIONES; todas las cifras coinciden) y el cambio de territorio de Erwin (T4 empieza en la p. 177). Toda página citada es la **impresa** en el libro. INFLESZ: no aplica a un mapa. D9 y D10 del kit: no evaluables.

1. **Pliegos, verificados uno por uno.** Abrí los 7 pliegos de `t4_pp178-191.pdf` y leí el número impreso de las dos páginas de cada uno: pliego 1 = 178|179, 2 = 180|181, 3 = 182|183, 4 = 184|185, 5 = 186|187, 6 = 188|189, 7 = 190|191. Coincide con la fórmula de la orden (176+2k y 177+2k).
2. **Frontera con §5.3, confirmada.** El título «5.3 ACTIVOS FINANCIEROS» está a media p. 191, después del mayor de Bancos de San Calixto. Lo que va encima del título es nuestro; lo de abajo es de la Célula B.
3. **Frontera de arriba (cambiada en v1.2).** Por orden de Erwin (15 de octubre), T4 empieza en la **p. 177**: portada del capítulo con sus objetivos (p. 177), introducción (p. 178 y mitad de arriba de la p. 179) y, desde el título «5.1 EFECTIVO Y EQUIVALENTES AL EFECTIVO: CAJA» a media p. 179, §5.1. El bloque 0 ya no es contexto: lo enseña la pieza A0. Fuente de la p. 177: `t4_pp176-191.pdf`, pliego 1 = pp. 176|177 y pliego 2 = 178|179, comprobados por su número impreso.
4. **Calidad del escaneo.** Las 14 páginas se leen bien. Rasterizé a 170 ppp y amplié las tablas de asientos de las pp. 183 y 186 para confirmar dos erratas (D4-1 y D4-3). Lo único que cae en el pliegue son los últimos caracteres de algunas líneas de las páginas pares (p. ej. «$435.000» en la p. 180, «bancos.» en la p. 186), y en todos los casos se leen completos. **No hay ninguna cifra que no haya podido leer.**
5. **El libro no trae códigos de cuenta** en ningún asiento de las pp. 179-191. Fechas: los asientos modelo y los dos ejemplos de Sus Servicios de las pp. 180 y 187 van «xxxx». El ejemplo de caja menor de Rosa Primorosa (también Sus Servicios) lleva «may-01» en cuatro de sus cinco asientos y «xxxx» en el de faltante de caja menor cargado al empleado (p. 186). Los ajustes de San Calixto van «mar-31». (Corrección P4 de Shibukawa.)

## Qué dejaron dicho los temas anteriores (para no contradecirlo ni re-enseñarlo como nuevo)

Comprobado en `src/data/` el 14 de octubre de 2026, no de memoria.

| Qué | Dónde ya está | Consecuencia para T4 |
|---|---|---|
| En el Tema 3, «caja» es el dinero de la empresa en sentido amplio (rótulo «Caja: entra y sale plata»; «Cobro es la plata que entra a la caja») | Tema 3: `contabilidadTema3.js` | T4 parte ese dinero en Caja y Bancos. A1 hace ese puente con palabras, sin contradecir el Tema 3 (decisión de Yujiro, C5). El título publicado del Tema 3 es «Ingresos, gastos y ajustes» |
| Caja y Bancos son activos; un activo que aumenta va al debe | Tema 2: `contabilidadActividades.js` (cu1-11 «Bancos aumenta», cu2-09, cu2-10) | La regla de la p. 180 y la de la p. 186 son **repaso**: se dicen como «la regla que ya conoces», no como nuevas |
| Consignar mueve plata de Caja a Bancos | Tema 2: cu7-05 «Se consignó en la cuenta corriente $800», cu12-02, `consignar` en los errores | El asiento 2 de Sus Servicios (p. 180) y el ejemplo 1 de Bancos (p. 187) ya los vio el estudiante con otras cifras |
| «Con cheque» o «se consignó» → Bancos; «de contado» o «en efectivo» → Caja | Tema 2: `contabilidadArmaElAsiento.js` (`PALABRAS_DE_CAJA`, `PALABRAS_DE_BANCOS`, `COLETILLA_CAJA_BANCOS`) | **Choque aparente** con la p. 179, que dice que Caja guarda «dinero en efectivo o en cheques». Hay que explicarlo (ver A1, P2) |
| Cobro = plata que entra a la caja; pago = plata que sale; vender no es cobrar | Tema 3: `contabilidadTema3.js` (`PIEZA_VENDER_NO_ES_COBRAR`) | Sus Servicios vende y cobra el mismo día: se dice que aquí coinciden, sin re-enseñar la diferencia |
| «El efectivo es el activo corriente por excelencia»; corriente = se vuelve efectivo o se consume dentro del año | **Tema 2**, en el desafío opcional «El Ciclo Completo» (`contabilidadDesafio.js`; `ciclo-completo` cuelga de `cuentas-debe-haber` en subjects.js). Corrección O5: la v1 decía Tema 1 | Como el desafío es opcional, no garantiza que el estudiante lo haya visto. Por eso A0 define el activo corriente con la p. 178, sin darlo por sabido |
| «Ingresos por servicios» | Temas 2 y 3 (13 archivos) | Se usa sin definir |
| «Ingresos no operacionales» | Tema 1: `contabilidadTema1.js` (c6-09, como línea del estado de resultados) | Nombrado, no explicado. Para A3 hace falta una glosa corta |
| «Gastos generales», «Caja menor», «Gastos no operacionales», «arqueo» | **En ningún archivo** | Términos nuevos de T4 |
| «Nota débito» | Solo en la glosa **provisional** de la Célula B (`contabilidadT6Pieza1.js`, `GLOSA_NOTA_DEBITO`), que dice esperar a que T4 la defina | **Término que T4 define en A4**, como «nota débito del banco». Ver cruces |
| «Nota crédito» | T7-1 A6 (`contabilidadT7_1_a6.js`), con otro sentido: la que el vendedor le da al comprador | **Término que T4 define en A4**, como «nota crédito del banco». Ver cruces |
| «Ingresos por intereses» · «Gasto interés» | Tema 3 (`asiSeJuegaTema3.js`) y T5 (`contabilidadT5Act2.js`, `contabilidadT5Pieza2.js`) | Nombres que T4 usa para los intereses de San Calixto (decisión de Yujiro, C1-C2) |
| «Cuentas por pagar – proveedores» y «Cuentas por cobrar – clientes» | Tema 1 (c6-03 y c6-07, con «– Proveedores» y «– Clientes» en mayúscula), Tema 3 (CxC – clientes, Act7 y Cierre), T6 y T7. T5 no las usa (corrección P7 de Shibukawa) | Nombres que T4 usa con la forma en minúscula de T6 y T7 |
| «Cuentas por cobrar» | **Tema 2**: se enseña y se juega (`contabilidad.js`, l. 113, activo; `contabilidadActividades.js` cu4-04 y cu4-08) | **No es nueva en T4** (corrección O2): A0 y A5 la usan como sabida |
| «Ingresos por intereses» (T5, `contabilidadT5Act2.js`) · «Ingresos financieros – ganancia en venta de títulos» y «Gastos financieros – pérdida en venta de títulos» (T5) | T5 | T5 reservó «Ingresos financieros – …» para la venta de títulos; el interés va a «Ingresos por intereses» (corrección O1) |
| El sobrante de **inventario** de T7-3 va contra el costo de la mercancía vendida (`contabilidadT7_3_a5.js`), no contra Ingresos no operacionales | T7-3 | Por eso en T4 siempre «sobrante de caja menor» y «faltante de caja menor» (C5, aviso P2 de Shibukawa) |

## Bloque 0 · Apertura del capítulo (pp. 177-179, hasta el título de §5.1) → pieza A0

- **Portada (p. 177).** Capítulo «5 ACTIVOS CORRIENTES». Objetivos: conocer el grupo de bienes que conforman el activo corriente; manejar correctamente los movimientos del efectivo; manejar el movimiento de la cuenta deudores; saber los sistemas de inventarios; contabilizar compraventas con esos sistemas; contabilizar el impuesto a las ventas, la retención en la fuente, los fletes y los descuentos; hacer el estado de resultados de las empresas comerciales. Sin cifras ni cuentas.
- **Definición (p. 178), en paráfrasis:** un activo es corriente si puede volverse efectivo en menos de un año (frase clave del libro: «en un periodo inferior a un año»). Ejemplos del libro: el efectivo en caja, los depósitos en bancos, las inversiones a corto plazo, la cartera y los inventarios.
- **Qué afirma.** Los activos corrientes permiten operar (comprar mercancías, pagar gastos, adquirir activos fijos, pagar pasivos). Del volumen de activos corrientes depende el capital de trabajo, que es activo corriente menos pasivo corriente (p. 178). Son los que pueden convertirse en efectivo en menos de un año: caja, bancos, inversiones a corto plazo, cartera e inventarios (p. 178). A los acreedores les interesa más la capacidad de pago que los activos fijos (pp. 178-179). El activo corriente no debe ser más del necesario para operar al 100 %: operar con activos para el 120 % significa un 20 % subutilizado; operar al 90 % significa que falta liquidez y hay que cubrirla con financiación externa o aportes, con su costo (p. 179).
- **Cifras.** 100 %, 120 %, 20 %, 90 % (p. 179). Son ilustrativas, sin cálculo.
- **Cuentas.** Ninguna.
- **Dependencias.** «Activo» (Temas 1 y 2). «Capital de trabajo» y «liquidez» no están enseñados en Contabilidad (T7-1 A7 ya sacó «capital de trabajo» por esa razón). «Pasivo corriente» solo está en el desafío opcional del Tema 2. «Activos fijos» no se define en el bloque.
- **Ejercicios de la Célula E que dependen de este bloque:** B.1 (p. 262, qué activos son corrientes, con ejemplos), A.1 (p. 262, discutir si los corrientes son más importantes que los no corrientes) y C.1 (p. 263, elegir el grupo de activos corrientes; las opciones mezclan cuentas por cobrar a corto y a largo plazo, maquinaria, equipos, edificaciones y terrenos). No se usan como ítems.
- **Qué toma A0 (decisión de Katsumi, razones en `paquetes/d4-t4-a0-v1.md`):** el criterio de un año, los ejemplos, las dos razones de importancia con el matiz de los activos fijos, y el orden de la lista de la p. 179 como puente con A1. **No toma** el capital de trabajo ni el párrafo del 100 %, 120 % y 90 %: usan términos no enseñados y ningún ejercicio de E los pide.
- *(Histórico: la v1 recomendaba no construir sobre este bloque. Esa recomendación la reemplazó la orden de Erwin del 15 de octubre.)*

## Bloque 1 · §5.1 Caja (pp. 179-180) → pieza A1

**[1] Títulos exactos:** «5.1 EFECTIVO Y EQUIVALENTES AL EFECTIVO: CAJA» (p. 179) · «CONTROL INTERNO DE LOS FONDOS DE CAJA» (p. 179) · «EJEMPLO» (p. 180).

**[2] Qué afirma el libro, en orden:**

1. **Definición (p. 179), en paráfrasis.** Caja es el efectivo y los cheques que la empresa tiene para sus pagos frecuentes. El libro lo resume como un recurso «de disponibilidad inmediata».
2. **Control interno (p. 179).** El libro pide «estrictos controles» sobre el efectivo para proteger la plata con la que la empresa opera. Da siete procedimientos, en paráfrasis:
   1. Informes diarios de lo que entra y sale en efectivo (p. 179).
   2. Consignar cada día el efectivo recibido (p. 179).
   3. Un tope fijado para los pagos en efectivo (p. 180).
   4. Que quien recibe el dinero no sea quien lo registra (p. 180).
   5. Arqueos frecuentes y sin aviso (p. 180).
   6. Pólizas de manejo para quienes manejan el dinero (p. 180).
   7. Una caja menor para los pagos pequeños (p. 180).
3. **Regla (p. 180), en paráfrasis.** Como Caja es un activo, se debita al recibir dinero y se acredita al consignarlo o al pagar en efectivo.
4. **Ejemplo Sus Servicios Ltda. (p. 180).** Durante el día presta el servicio de mantenimiento de computadoras a varios clientes por **$435.000**; todos pagan de contado. El dinero se deposita ese mismo día en la cuenta corriente.
   - Asiento 1, «Contabilización del recibo del dinero»: Caja 435.000 al debe / Ingresos por servicios 435.000 al haber. Fecha «xxxx».
   - Asiento 2, «Consignación del dinero en la cuenta corriente»: Bancos 435.000 al debe / Caja 435.000 al haber. Fecha «xxxx».
   - Que esta consignación sale de Caja lo muestra el asiento 2. En pantalla se presenta como «mira el asiento de la p. 180» (decisión de Yujiro, I5). La regla general de la p. 180 («acreditar cuando los dineros se consignan») también lo sostiene.

**[3] Cuentas, nombre literal:** Caja · Ingresos por servicios · Bancos (p. 180).

**[4] Sumas.** Cada asiento cuadra (435.000 = 435.000). Después de los dos asientos, Caja queda igual que antes del día (+435.000 − 435.000); eso lo calculo yo, la página no lo dice.

**[5] Dependencias.** Caja y Bancos como activos, regla del debe para un activo que aumenta, consignar = Caja → Bancos, Ingresos por servicios (Temas 2 y 3, comprobado arriba). Términos nuevos que el bloque usa sin definir: **arqueo** (se define para caja menor en la p. 182), **póliza de manejo** (el libro no la define), **caja menor** (se define en la p. 181).

## Bloque 2 · El fondo de caja menor (pp. 181-182) → pieza A2

**[1] Título exacto:** «EL FONDO DE CAJA MENOR» (p. 181).

**[2] Qué afirma el libro:**

1. **Definición (p. 181), en paráfrasis.** La caja menor es un fondo en efectivo «fijo y renovable» para gastos pequeños, urgentes o imprevistos. La maneja una sola persona designada, que responde por él en varios planos, entre ellos el disciplinario y el penal.
2. **Funciones del responsable (p. 181), en paráfrasis:** pagar lo autorizado; guardar la plata y los soportes; aplicar las retenciones de ley; pedir el reembolso a tiempo.
3. **Regla (p. 181), en paráfrasis.** Se debita al crear o aumentar el fondo y se acredita al disminuirlo o cancelarlo. El texto dice «la cuenta de caja», pero los asientos mueven Caja menor (errata D4-7).
4. **Manejo contable, cuatro pasos numerados:**
   1. **Apertura (p. 181).** Se gira un cheque a nombre del encargado. Asiento modelo: Caja menor al debe / Bancos al haber, valores «xxxx».
   2. **Reembolso y contabilización de los gastos (p. 182).** El encargado relaciona todos los pagos con sus comprobantes y los envía a contabilidad, que los aprueba y gira el cheque del reembolso. Asiento modelo: Gastos generales al debe / Bancos al haber. **Caja menor no se mueve**: esto lo dice el asiento de la p. 182, no el texto. En pantalla se presenta como «mira el asiento de la p. 182» (decisión de Yujiro, I4).
   3. **Aumentos y disminuciones (p. 182).** Se aumenta cuando los desembolsos superan ampliamente el fondo y hay que reembolsarlo con frecuencia; se disminuye cuando permanece mucho tiempo con fondos ociosos. Aumentar: Caja menor al debe / Bancos al haber. Disminuir: **Caja** al debe / Caja menor al haber.
   4. **Arqueos** (p. 182) → bloque 3.

**[3] Cuentas, nombre literal:** Caja menor · Bancos (p. 181) · Gastos generales · Caja (p. 182).

**[4] Sumas.** Ninguna: todos los valores del bloque son «xxxx».

**[5] Dependencias.** Bloque 1 (qué es Caja). Cheque → Bancos (Tema 2). «Gastos generales» es nuevo. «Retenciones de ley» **no está enseñado**: la retención en la fuente se explica en la p. 210 (T7-1, que va después de T4). Si A2 nombra esa función, tiene que decir que se verá en Inventarios o dejarla fuera.

**[6] Lo que el bloque no tiene: ninguna cifra.** La primera cifra de caja menor es la apertura de Rosa Primorosa (p. 183), que el libro pone después de los modelos de arqueo. Esto pesa en mi opinión sobre el corte.

## Bloque 3 · Arqueos, sobrantes de caja menor y faltantes de caja menor (pp. 182-186) → pieza A3

**[2] Qué afirma el libro:**

1. **Arqueo (p. 182), en paráfrasis.** La caja menor se revisa a menudo y «sin previo aviso» para ver si los soportes de lo pagado, más el efectivo que queda, dan el valor del fondo.
2. **Sobrantes de caja menor (p. 183).** El libro dice que pasan a la empresa «como aprovechamientos». Asiento modelo: Gastos al debe / Ingresos no operacionales -sobrante de caja menor al haber / Bancos al haber.
3. **Faltantes de caja menor (p. 183), en paráfrasis.** Si el faltante es «representativo», por lo general se le cobra a quien maneja el fondo. Asiento modelo: Gastos generales al debe / Cuentas por cobrar -empleados al debe / Bancos al haber. Si no lo es, se puede llevar a los gastos del periodo: Gastos generales al debe / Gastos no operacionales -faltante de caja menor al debe / Bancos al haber.

**[4] Ejemplo Rosa Primorosa · Sus Servicios Ltda. (pp. 183-186).** El 1 de mayo Sus Servicios establece una caja menor de **$500.000** con un cheque a nombre de Rosa Primorosa (p. 183).

- **Apertura (p. 183):** may-01 · Caja menor 500.00 [sic, D4-1] al debe / Bancos 500.000 al haber.
- **Gastos de mayo, la misma lista en las tres situaciones** (pp. 184 dos veces y 185):

| Concepto (literal) | Valor |
|---|---|
| Transporte urbano | 34.000 |
| Fotocopias | 32.000 |
| Elementos de aseo para oficinas | 28.300 |
| Papelería y útiles de oficina | 63.400 |
| Cafetería | 107.200 |
| Repuestos para equipo de oficina | 34.100 |
| Servicio de correo | 47.100 |
| Reparaciones locativas | 132.000 |
| **Total impreso** | **478.100** |

  Recalculado: 34.000 + 32.000 + 28.300 + 63.400 + 107.200 + 34.100 + 47.100 + 132.000 = **478.100. Cuadra**, y las tres copias de la lista son idénticas.

- **Situación 1 · cuadra (p. 184).** Efectivo en billetes y monedas: **$21.900**. 478.100 + 21.900 = 500.000: ni sobrante de caja menor ni faltante de caja menor. Reembolso «en mayo 31»: may-01 [D4-2] · Gastos generales 478.100 / Bancos 478.100. **Cuadra.**
- **Situación 2 · sobrante de caja menor (pp. 184-185).** Efectivo: **$24.000**. Suma 478.100 + 24.000 = 502.100; sobrante de caja menor **$2.100**. Asiento may-01 [D4-2]: Gastos generales 478.100 al debe / Ingresos no operacionales -sobrante de caja menor 2.100 al haber / Bancos 476.000 al haber. «A pesar de que los gastos son $478.100, solo se reembolsa $476.000». Recalculado: 502.100 − 500.000 = 2.100; 478.100 − 2.100 = 476.000; 2.100 + 476.000 = 478.100. **Cuadra.**
- **Situación 3 · faltante de caja menor (pp. 185-186).** Efectivo: **$15.200**. Suma 478.100 + 15.200 = 493.300; faltante de caja menor **$6.700**.
  - Cargado al cajero (p. 186): xxxx · Gastos generales 478.100 al debe / Cuentas por cobrar -empleados 6.700 al debe / Bancos 484.800 al haber. «Aunque los gastos son $478.100, se debe reembolsar $484.800».
  - Llevado a gastos (p. 186): may-01 [D4-2] · Gastos generales 478.100 al debe / Gastos no operacinales [sic, D4-3] -faltante de caja menor 6.700 al debe / Bancos 484.800 al haber.
  - Recalculado: 500.000 − 493.300 = 6.700; 478.100 + 6.700 = 484.800; los dos asientos cuadran. **Cuadra.**

**Deducción mía, no del libro:** en las tres situaciones, efectivo + reembolso = 500.000 (21.900 + 478.100; 24.000 + 476.000; 15.200 + 484.800). Es decir, el reembolso deja el fondo otra vez en su valor fijo, con el sobrante de caja menor quedándose dentro y el faltante de caja menor repuesto. El libro no lo dice con esas palabras; la aritmética sí lo sostiene, y es la mejor forma de explicar por qué el cheque no es igual a los gastos.

**[3] Cuentas, nombre literal:** Gastos (sic, modelo p. 183) · Gastos generales · Ingresos no operacionales -sobrante de caja menor · Cuentas por cobrar -empleados · Gastos no operacionales -faltante de caja menor (p. 183; «operacinales» en la p. 186) · Caja menor · Bancos.

**[5] Dependencias.** Bloque 2 completo: fondo fijo, que el reembolso va a gastos contra Bancos y no toca Caja menor. «Ingresos no operacionales» solo está nombrado en el Tema 1; «Gastos no operacionales» y «Cuentas por cobrar – empleados» son nuevos.

## Bloque 4 · §5.2 Bancos (pp. 186-187) → pieza A4

**[1] Títulos:** «5.2 BANCOS» (p. 186) · «EJEMPLO 1» (p. 187).

**[2] Qué afirma el libro:**

1. **Definición (p. 186), en paráfrasis.** Bancos es la plata que la empresa tiene depositada, en pesos o en otra moneda, en bancos de Colombia o de fuera. Lo que está en moneda extranjera se pasa a pesos al cierre del ejercicio con la tasa representativa del mercado.
2. **Regla (p. 186), en paráfrasis.** Es un activo: se debita con lo que aumenta los depósitos y se acredita con lo que los disminuye.
3. **Se debita por (p. 186), en paráfrasis:** consignaciones propias; notas crédito del banco; consignaciones que hacen los clientes directamente; cheques anulados después de registrados; cualquier otro aumento.
4. **Se acredita por (p. 187), en paráfrasis:** cheques girados; notas débito del banco; pagos de préstamos; cualquier otra disminución.
5. **Ejemplo 1, Sus Servicios Ltda. (p. 187).** Durante el día consigna **$876.000** en la cuenta corriente y gira un cheque a un proveedor por **$398.200**. Asientos (xxxx): Bancos 876.000 / Caja 876.000; Cuentas por pagar -proveedores 398.200 / Bancos 398.200.

**[3] Cuentas literal:** Bancos · Caja · Cuentas por pagar -proveedores (p. 187).

**[4] Sumas.** Los dos asientos cuadran. El libro no da saldo de Bancos; no hay total que comprobar.

**[5] Dependencias.** Todo el ejemplo 1 es repaso del Tema 2 (consignar, pagar con cheque). Nuevo: **nota débito** y **nota crédito**, **términos que T4 define en A4**, siempre como «nota débito del banco» y «nota crédito del banco» (decisión de Yujiro). El libro no las define en la p. 186; la descripción útil llega en la p. 188, **tasa representativa del mercado** (sin ejemplo).

## Bloque 5 · Conciliación bancaria: qué es y por qué no cuadra (pp. 187-188) → pieza A4 (o A4 de la versión partida)

**[1] Título:** «CONCILIACIÓN BANCARIA» (p. 187).

**[2] Qué afirma el libro:**

1. La conciliación compara lo que la empresa tiene registrado en Bancos con lo que dice el extracto del banco (p. 187, en paráfrasis).
2. La empresa lleva un libro auxiliar de bancos con cada movimiento: giro de cheques, consignaciones, notas débito, notas crédito, anulación de cheques (p. 187). El banco lleva su propio registro y envía cada mes un extracto con los movimientos y el saldo al último día del mes (p. 188).
3. El libro dice que los dos saldos casi nunca coinciden (su frase mezcla «por lo general» y «nunca», ver D4-10), y que hay que revisar movimiento por movimiento para hallar la causa (p. 188, en paráfrasis).
4. **Seis causas (p. 188), en paráfrasis:** cheques que el beneficiario aún no cobra; consignaciones que el banco aún no abona; notas débito del banco que la empresa no ha registrado; notas crédito del banco que la empresa no ha registrado; errores de la empresa; errores del banco.

**[3] Cuentas:** ninguna. **[4] Cifras:** ninguna.

**[5] Dependencias.** Bloque 4 (qué mueve Bancos). Libro mayor (Tema 2, `cu-a4-diario-y-mayor`). «Libro auxiliar» y «extracto» son nuevos y el libro solo los describe de pasada. (Busqué «extracto» en `src/data/`: solo sale en un comentario de código de T7-1 A5 con el sentido de «fragmento», no de extracto bancario.)

**La p. 188 es lo más cerca que llega el libro a definir las notas del banco:** la nota débito es lo que el banco le «ha cargado» a la cuenta, y la nota crédito, lo que le «ha abonado».

## Bloque 6 · Ejemplo 2: la conciliación de la Compañía San Calixto Ltda. (pp. 188-191) → pieza A4 o A5

**[2] Datos (p. 189):**

- a. Saldo según extracto a marzo 31: **$2.435.600**.
- b. Saldo en libros a marzo 31: **$4.373.100**.
- c. Cheques sin pagar:

*Los números de cheque se transcriben aquí solo como dato de la fuente. **Ninguna pieza los muestra** (decisión de Yujiro, E3): los cheques se identifican por beneficiario y valor.*

| Cheque | Fecha | Valor | Beneficiario |
|---|---|---|---|
| n.º 100 | mar-10 | 156.000 | Lorena Guerra |
| n.º 104 | mar-21 | 203.000 | Steffany Herrera |
| n.º 110 | mar-30 | 97.000 | Angélica Garrido |
| n.º 146 (p. 189) / n.º 145 (p. 190) [D4-5] | mar-30 | 125.000 | Laura García |

- d. Consignaciones del 31 de marzo por **$2.758.000** no abonadas por el banco.
- e. Notas crédito: 18 de marzo, **$645.000**, pago de la factura 1234 hecho directamente al banco por el cliente Efraín Martínez; 30 de marzo, **$342.000**, intereses de las inversiones que la empresa tiene en el banco.
- f. Notas débito: «del día 14», **$43.500**, chequera; «del día 20», **$236.000**, intereses de sobregiro; «del día 26», **$468.000**, cheque devuelto del cliente Humberto Gómez. (El mes no se escribe; por el contexto es marzo.)
- Las notas débito y crédito no se han contabilizado en los libros de la empresa.

**Presentación (p. 190), con mis sumas:**

| Línea del libro | Impreso | Recalculado | ¿Cuadra? |
|---|---|---|---|
| Saldo en Bancos según extracto | 2.435.600 | dato | — |
| Más: consignación de marzo 31 | 2.758.000 | dato | — |
| Total cheques pendientes de cobro | 581.000 | 156.000 + 203.000 + 97.000 + 125.000 = 581.000 | sí |
| Saldo conciliado en Bancos | 4.612.600 | 2.435.600 + 2.758.000 − 581.000 = 4.612.600 | sí |
| Saldo en Bancos según libros | 4.373.100 | dato | — |
| Total notas créditos | 987.000 | 645.000 + 342.000 = 987.000 | sí |
| Total notas débito | 747.500 | 43.500 + 236.000 + 468.000 = 747.500 | sí |
| Saldo conciliado en libros | 4.612.600 | 4.373.100 + 987.000 − 747.500 = 4.612.600 | sí |

Comprobación cruzada mía: la diferencia inicial es 4.373.100 − 2.435.600 = 1.937.500. El lado del banco se mueve +2.177.000 (2.758.000 − 581.000) y el de libros +239.500 (987.000 − 747.500); 2.177.000 − 239.500 = 1.937.500. **Cuadra.**

**Lo que concluye el libro (p. 190).** En paráfrasis: nadie se había equivocado, sino que a cada lado le faltaba registrar algo. Para el libro, lo importante no es que los saldos den igual, sino hacer los asientos que dejan Bancos en su «verdadero valor». Y solo se asienta lo que afecta los libros de la empresa.

**Asientos de ajuste (p. 191), todos mar-31:**

| Debe | Haber | Valor |
|---|---|---|
| Bancos | Cuentas por cobrar -Efraín Martínez | 645.000 |
| Bancos | Ingresos Financieros -interés | 342.000 |
| Gastos financieros -chequera | Bancos | 43.500 |
| Gastos financieros -Interés | Bancos | 236.000 |
| Cuentas por cobrar -Humberto Gómez | Bancos | 468.000 |

Los cinco cuadran. Lo que **no** se asienta: los cuatro cheques pendientes y la consignación en tránsito, porque ya están en los libros de la empresa (eso es aplicación mía de la frase de la p. 190; el libro no lo dice partida por partida).

**Mayor de Bancos (p. 191).** Debe: saldo mar-31 4.373.100; 645.000; 342.000; suma 5.360.100. Haber: 43.500; 236.000; 468.000; suma 747.500. Saldo mar-31 4.612.600. Recalculado: 4.373.100 + 645.000 + 342.000 = 5.360.100; 43.500 + 236.000 + 468.000 = 747.500; 5.360.100 − 747.500 = 4.612.600, igual al saldo conciliado. **Cuadra.**

**[3] Cuentas literal (p. 191):** Bancos · Cuentas por cobrar -Efraín Martínez · Ingresos Financieros -interés · Gastos financieros -chequera · Gastos financieros -Interés · Cuentas por cobrar -Humberto Gómez.

**[5] Dependencias.** Bloques 4 y 5. Libro mayor (Tema 2). «Sobregiro», «chequera» e «intereses de las inversiones» no están definidos en el libro. «Cuentas por cobrar» **no es nueva**: el Tema 2 la enseña y la juega (cu4-04, cu4-08), y los Temas 1 y 3 la usan como «Cuentas por cobrar – clientes». T4 la usa como sabida. (Corrección O2; la v1 decía que se enseñaba en T6, que va después, y era falso.)

## Nombres de cuentas que usará T4 (decisión de contenido de Katsumi)

Regla: el nombre del libro, con la raya «–» y los espacios que ya usa lo publicado (T5, T6, T7). Donde el libro pone el nombre de una persona, va el nombre de la cuenta ya publicado y la persona queda en el enunciado.

| Libro (literal) | T4 escribe | Por qué |
|---|---|---|
| Caja · Bancos · Ingresos por servicios | igual | publicados en los Temas 1-3 |
| Caja menor · Gastos generales | igual | nuevos, sin choque |
| Gastos (modelo p. 183) | Gastos generales | D4-4: todos los demás asientos del mismo hecho dicen «Gastos generales» |
| Ingresos no operacionales -sobrante de caja menor | Ingresos no operacionales – sobrante de caja menor | forma de la raya |
| Gastos no operacionales -faltante de caja menor | Gastos no operacionales – faltante de caja menor | forma de la raya; corrige D4-3 |
| Cuentas por cobrar -empleados | Cuentas por cobrar – empleados | forma de la raya; nuevo |
| Cuentas por pagar -proveedores | Cuentas por pagar – proveedores | ya publicado así (T7) |
| Cuentas por cobrar -Efraín Martínez / -Humberto Gómez | Cuentas por cobrar – clientes | ya publicado así (T6, también para el cheque devuelto con nota débito); el cliente queda en el enunciado (decisión de Yujiro, C3) |
| Ingresos Financieros -interés | Ingresos por intereses | nombre ya publicado del mismo concepto, Tema 3 y T5 (decisión de Yujiro, C1) |
| Gastos financieros -Interés (intereses de sobregiro) | Gasto interés | nombre ya publicado del mismo concepto, Tema 3 (decisión de Yujiro, C2) |
| Gastos financieros -chequera | Gastos financieros – chequera | concepto nuevo: nombre del libro con raya (decisión de Yujiro) |

Cuando esté aprobado, esto pasa a `vocabulario/contabilidad.md` por quien lo administre (Yujiro lo reporta a Erwin); yo no toco ese archivo.

**Regla de redacción (decisión de Yujiro, C5):** en T4 nunca se escribe «sobrante» ni «faltante» a secas, sino «sobrante de caja menor» y «faltante de caja menor», porque en T7 el sobrante de inventario va a otra cuenta. Este mapa ya está escrito así, salvo en las citas literales del libro, que se marcan.

## Erratas e incoherencias (D4-1 a D4-17), ninguna confirmada con el profesor

| Id | Página | Qué | Confianza |
|---|---|---|---|
| D4-1 | 183 | Apertura de la caja menor: el Debe dice **500.00** y el Haber 500.000. Falta un cero. **Decisión de Yujiro: se usa 500.000.** | Alta (ampliado al 200 %) |
| D4-2 | 184, 185, 186 | El texto dice que el reembolso es «en mayo 31», pero los asientos de reembolso van fechados **may-01** (situación 1 p. 184, sobrante de caja menor p. 185, faltante de caja menor a gastos p. 186); el de faltante de caja menor al empleado (p. 186) va «xxxx». Un reembolso de gastos de todo mayo no puede ser del 1 de mayo. **Decisión de Yujiro: se usa el 31 de mayo, que es lo que dice el texto de la p. 184.** | Alta |
| D4-3 | 186 | «Gastos no **operacinales** -faltante de caja menor» por «operacionales» (el modelo de la p. 183 lo escribe bien). | Alta |
| D4-4 | 183 | El modelo del sobrante de caja menor debita «**Gastos**»; todos los demás asientos de reembolso (p. 182, los dos modelos de faltante de caja menor de la p. 183 y los ejemplos de las pp. 184-186) debitan «Gastos generales». | Media-alta: puede ser abreviatura, no cambia ninguna cifra |
| D4-5 | 189 vs 190 | El cheque de Laura García es el **n.º 146** en la tabla de la p. 189 y el **n.º 145** en la conciliación de la p. 190. El valor (125.000) es el mismo, así que no cambia ningún total. **Decisión de Yujiro: no se elige número; ninguna pieza muestra números de cheque.** | Alta |
| D4-6 | 186 | «debitar la **cuanta** de bancos» por «cuenta». | Alta, sin efecto |
| D4-7 | 181 | En la sección de caja menor, la regla habla de «la cuenta de caja» al describir cuándo se debita y se acredita el fondo, pero los asientos de apertura y aumento debitan **Caja menor**, y el de disminución (p. 182) acredita Caja menor y debita **Caja**. La frase solo es coherente si «caja» quiere decir «caja menor». **Decisión de Yujiro: se enseña lo que hacen los asientos (Caja menor); si se cita la frase, va con la aclaración.** | Media: puede leerse como uso genérico, pero tal cual confunde las dos cuentas |
| D4-8 | 183 | En el modelo de faltante de caja menor al cajero, «Cuentas por cobrar -empleados» va **sangrado como un crédito**, pero su valor está en la columna Debe. En el ejemplo de la p. 186 no va sangrado. Además, en la plantilla del sobrante de caja menor, «Bancos» va **sin sangría** aunque es un crédito (añadido en segunda lectura por Shibukawa, su E8). | Media: la columna manda |
| D4-9 | 187 | La enumeración de movimientos del libro auxiliar repite «las consignaciones» (al principio y al final). | Alta, sin efecto |
| D4-10 | 188 | «Por lo general, el saldo del extracto bancario **nunca** coincide»: «por lo general» y «nunca» se contradicen. No se debe enseñar «nunca». | Media (redacción, no cifra) |
| D4-11 | 185, 186 | El ejemplo dice «la cajera menor» (Rosa Primorosa) y los textos de los asientos dicen «el **cajero** menor» y «cargado al **cajero**». | Baja: puede ser masculino genérico |
| D4-12 | 178 (ahora dentro de T4, pieza A0) | «**ente** otros aspectos» dos veces, por «entre». El primer párrafo de la introducción se repite casi literal en el cuarto, y el segundo con el quinto (lo segundo, comprobado por Shibukawa). | Alta, sin efecto en cifras |
| D4-13 | 189 | «correspondientes a **el** pago de la factura número 1234» por «al pago». Encontrada en segunda lectura (Shibukawa, su E9). | Alta, sin efecto |
| D4-14 | 190 | «Total Notas **créditos**» frente a «Notas de crédito» y «Total Notas débito» de la misma tabla. Encontrada en segunda lectura (Shibukawa, su E10). | Alta, sin efecto |
| D4-15 | 190 | «Cheques devueltos, cliente Humberto Gómez», en plural, cuando la p. 189 habla de **un** cheque devuelto. Encontrada en segunda lectura (Shibukawa, su E11). | Alta, sin efecto en cifras |
| D4-16 | 191 | Mayúsculas desiguales en los nombres de cuenta de los ajustes («Ingresos Financieros -interés», «Gastos financieros -Interés», «Gastos financieros -chequera»). Encontrada en segunda lectura (Shibukawa, su E13). | Alta, sin efecto |
| D4-17 | 186 | «si se decide llevar **al** faltante a los gastos del periodo» por «llevar **el** faltante». Encontrada en segunda lectura (Shibukawa, su E14, a 400 ppp; ninguno de los dos la vio en la primera). | Alta, sin efecto |

**Cómo se tratan (canon de Erwin, 15 de octubre):** ninguna se corrige en silencio. Cada paquete lleva una sección «Erratas que toca esta pieza» con la lectura que usamos, la razón y dónde queda anotada. Esta tabla es la lista canónica de T4. Equivalencia con la lista de Shibukawa: E1=D4-1, E2=D4-2, E3=D4-5, E4=D4-6, E5=D4-3, E6=D4-4, E7=D4-9, E8=D4-8, E9=D4-13, E10=D4-14, E11=D4-15, E12=D4-11, E13=D4-16, E14=D4-17; I1=D4-7, I3=D4-10.

**No verificado por ninguno de los dos:** las erratas de redacción de los párrafos largos sin cifras de las pp. 179, 181 y 188 no se releyeron palabra por palabra en segunda lectura.

## Huecos: lo que la fuente no dice

| Id | Página | Hueco |
|---|---|---|
| HD4-1 | 179 | El título de §5.1 dice «Efectivo y **equivalentes al efectivo**», pero el texto nunca define los equivalentes ni da un ejemplo. No se enseña. |
| HD4-2 | 179 | Caja guarda «efectivo o cheques»: no dice **qué cheques** (los que se reciben, los propios en blanco…). Lo resuelvo en A1 como deducción marcada. |
| HD4-3 | 180 | No define **póliza de manejo**. |
| HD4-4 | 181 | Nombra «aplicar las **retenciones de ley**» como función del responsable, sin explicarla; la retención se explica en la p. 210 (T7). |
| HD4-5 | 182 | No dice por qué la disminución del fondo va a **Caja** y el aumento sale de **Bancos**. |
| HD4-6 | 183 | No da **criterio de «representativo»** para un faltante de caja menor. Un ítem no puede pedirle al estudiante que lo juzgue: el enunciado debe decir qué decidió la empresa. |
| HD4-7 | 183 | La p. 183 sí dice algo: los sobrantes pasan a la empresa «como aprovechamientos». Lo que no dice es dónde queda físicamente la plata. La deducción del bloque 3 (efectivo + reembolso = fondo) es mía. «Aprovechamientos» no es nombre de cuenta (decisión I2). |
| HD4-8 | 183, 186 | No hay asiento del **cobro posterior** al empleado (cómo se cancela Cuentas por cobrar – empleados). |
| HD4-9 | 186 | La conversión a pesos con la **tasa representativa del mercado** no tiene ejemplo, ni cuenta para la diferencia. |
| HD4-10 | 186 | Los cheques anulados después de registrados y los pagos de préstamos: sin ejemplo. |
| HD4-11 | 186-188 | No hay definición formal de **nota débito** ni de **nota crédito**: la p. 188 las describe como causas de diferencia. **El extracto sí está descrito** (p. 188): el banco lo envía cada mes, con los movimientos de la cuenta y su saldo al último día del mes (paráfrasis; corrección O3). |
| HD4-12 | 187 | En el ejemplo 1 no dice de dónde sale la plata consignada; el asiento acredita Caja. |
| HD4-13 | 188 | Los **errores** de la empresa o del banco son causa de diferencia, pero no hay ejemplo ni asiento de corrección. |
| HD4-14 | 189 | No define **sobregiro** ni **chequera**; las notas débito de los días 14, 20 y 26 no dicen el mes. |
| HD4-15 | 188-190 | **El signo de cada partida de la conciliación no está en el texto.** La p. 188 da las seis causas de diferencia, pero no dice cuál suma y cuál resta en cada lado. Solo lo muestra la presentación de la p. 190, con «Más: consignaciones en tránsito», «Menos: cheques pendientes de cobro», «Más: notas de crédito» y «Menos: notas débito». Quien escriba H6 y H7 tiene que presentarlo como «mira la presentación de la p. 190» (corrección O4). |
| HD4-16 | 183-186 | No define «**operacional**» ni «**no operacional**». |
| HD4-17 | 191 | Los cinco ajustes van fechados **mar-31** aunque las notas son de los días 14 a 30. El libro no dice por qué. |
| HD4-18 | 189-190 | Los cheques tienen dos nombres: «cheques sin pagar» (p. 189) y «cheques pendientes de cobro» (p. 190). |
| HD4-19 | 182-186 | No define «**Gastos generales**» ni explica por qué ocho gastos distintos van a una sola cuenta. |
| HD4-20 | 178-179 | No define «**activos fijos**» ni da ejemplos. |
| HD4-21 | 178 | No define «**corto plazo**». |
| HD4-22 | 179 | No dice por qué el efectivo va primero en la lista; solo lo pone primero. |

(HD4-16 a HD4-19 son los huecos menores de P5 de Shibukawa. HD4-20 a HD4-22 salen de A0.)

## Cruces con otras células

1. **Célula B · nota débito.** *Decisión de Yujiro (C4): cuando T4 la defina en A4, B retira su glosa en el mismo momento; Yujiro lo coordina con Erwin y B antes de ese PR. A1-A3 no la tocan.* `contabilidadT6Pieza1.js` trae una glosa provisional de «nota débito» porque espera que la defina T4, y su prueba `src/contabilidad/__tests__/b5-t6-glosa-nota-debito.test.mjs` **se pone roja el día que cualquier otro tema defina el término**. La pieza de T4 que defina «nota débito» (A4) rompe esa prueba en main a propósito. Hay que coordinarlo con B antes del PR: su glosa dice «el banco le resta un valor a la cuenta bancaria de la empresa; por ejemplo, cuando devuelve el cheque con el que un cliente había pagado», y es compatible con la p. 188 y con el asiento de Humberto Gómez de la p. 191.
2. **Célula B · p. 191.** T6 ya cita la p. 191 para el cheque devuelto (Cuentas por cobrar – clientes se debita con una nota débito). Coincide con nuestro asiento de Humberto Gómez; no hay contradicción, pero la cifra 468.000 no aparece en T6, y conviene que siga así.
3. **Célula C · «nota crédito» con otro sentido.** T7-1 A6 (`contabilidadT7_1_a6.js`) ya publicó «nota crédito» como el documento que **el vendedor le da al comprador** en una devolución. En §5.2 la nota crédito la expide **el banco** y aumenta Bancos. Son dos documentos distintos con el mismo nombre; T4 va antes en el índice. **Decidido por Yujiro: en T4 es siempre «nota crédito del banco» y «nota débito del banco».** Que T7 no la contradice lo deduzco yo leyendo las dos; ninguna de las dos páginas habla de la otra.
4. **Célula C · nombre «¿Qué control falta?».** Ya existe en T7-1 (`t7-1-que-control-falta`). **Decidido por Yujiro: ningún Hacer de T4 se llama «¿Qué control falta?».**
5. **San Calixto.** El Tema 3 y T7 ya usan «San Calixto» con otras cifras. Nuestro enunciado debe decir «Compañía San Calixto Ltda.», «conciliación de marzo» y traer todos sus datos.
6. **Sus Servicios Ltda.** Aparece en A1 (p. 180), en caja menor (p. 183) y en Bancos (p. 187), con hechos y cifras distintos. Cada enunciado trae sus datos completos.

## Corte definitivo (Yujiro, 14 de octubre; A0 añadida por orden de Erwin, 15 de octubre)

Seis piezas de Aprender. Manda la orden de la célula.

| Pieza | Qué cubre | Páginas |
|---|---|---|
| A0 | El activo corriente: el criterio de un año, los ejemplos, por qué importa y por qué el efectivo va primero | 177-179 |
| A1 | La caja | 179-180 |
| A2 | El fondo fijo, con la apertura de Rosa Primorosa y la situación que cuadra | 181-184 |
| A3 | El arqueo: sobrante de caja menor y faltante de caja menor | 182-186 |
| A4 | Bancos y notas del banco | 186-188 |
| A5 | La conciliación de San Calixto | 188-191 |

## (Histórico) Opinión sobre el corte A1-A4, la que llevó al corte definitivo

*Sección histórica: el corte definitivo de arriba ya la adoptó. Se deja por trazabilidad.*

**A1 sirve tal cual** (pp. 179-180): una definición, una regla, un ejemplo de dos asientos y siete controles. Es corta y no hace falta estirarla.

**A2 y A3: mover la frontera, no fundir.** Tal como está, A2 (pp. 181-182) no tiene ni una cifra: todos sus asientos son «xxxx». La apertura de Rosa Primorosa ($500.000, p. 183) y la situación 1, la que cuadra (efectivo $21.900, reembolso $478.100, p. 184), son exactamente lo que A2 enseña: el fondo fijo y el reembolso que no toca Caja menor. Propongo:

- **A2 «El fondo fijo»:** definición, apertura con Rosa Primorosa, reembolso con la situación 1, aumentar y disminuir (solo los modelos, sin cifras). Págs. 181-184.
- **A3 «El arqueo»:** qué es, el sobrante de caja menor (situación 2) y el faltante de caja menor con sus dos tratamientos (situación 3). Págs. 182-186. Reutiliza la lista de gastos como dato del enunciado, sin pedirla.
- Con la regla de la Célula C de un solo dueño por cifra: **478.100 y 500.000 son de A2**; 2.100, 476.000, 6.700 y 484.800 son de A3.

**A4: partirla en dos.** A4 carga dos listas, el ejemplo 1, la definición de conciliación, seis causas, un ejemplo de ocho partidas con presentación de dos lados, cinco asientos y un mayor: el doble que cualquier otra pieza. Propongo:

- **A4 «Dos libretas»** (pp. 186-188): qué mueve Bancos, nota débito y nota crédito, el ejemplo 1 (que es repaso y cabe en una pantalla), qué es la conciliación y sus seis causas, sin cifras de San Calixto.
- **A5 «La conciliación de San Calixto»** (pp. 188-191): los dos lados, el saldo conciliado de 4.612.600, por qué solo se asientan las notas, los cinco asientos y el mayor. El ejemplo no se parte (es uno solo). Si se pasa de unas ocho pantallas, la frontera natural es entre la presentación (p. 190) y los asientos (p. 191), y entonces 4.612.600 tendría un solo dueño.

En resumen: **5 piezas en lugar de 4**, con la frontera A2|A3 corrida a la p. 184.

## Ideas de Hacer que el material sostiene (la mecánica la decide Yujiro)

| # | Idea | Contenido que evalúa | La sostiene | Notas |
|---|---|---|---|---|
| H1 | ¿Entra o sale de Caja? | Ante un hecho (cobrar de contado, consignar, pagar en efectivo, pagar con cheque, recibir un cheque de un cliente), decidir si Caja va al debe, al haber o no se mueve | A1 (p. 180; cheque → Bancos, p. 187) | Hechos construidos salvo Sus Servicios. «Pagar con cheque: Caja no se mueve» es la confusión que más rinde |
| H2 | El control que se saltaron | Casos cortos, cada uno rompe uno de los siete controles de las pp. 179-180; elegir cuál | A1 | Casos construidos. Ningún Hacer de T4 se llama «¿Qué control falta?» (decisión de Yujiro) |
| H3 | ¿Se mueve la caja menor? | Apertura, reembolso, aumento y disminución: qué cuentas se mueven y de qué lado. La trampa es el reembolso, que no toca Caja menor | A2 (pp. 181-182) | Sin cifras o con las de Rosa (500.000, 478.100) |
| H4 | El arqueo de Rosa | Con fondo, gastos y efectivo, decir si cuadra, sobra o falta, cuánto, y por cuánto sale el cheque del reembolso | A3 (pp. 184-186) | Las tres situaciones del libro, más variantes con otro efectivo **marcadas como construidas** |
| H5 | ¿Al empleado o al gasto? | Armar el asiento del faltante de caja menor en los dos tratamientos | A3 (pp. 183, 186) | El enunciado dice qué decidió la empresa (HD4-6): el estudiante no juzga si es «representativo» |
| H6 | ¿De qué lado va? | Clasificar las partidas de San Calixto: suma o resta al saldo del banco, suma o resta al de libros, y armar los dos saldos conciliados | A5 (pp. 189-190) | El signo de cada partida solo está en la presentación de la p. 190 (HD4-15): la retroalimentación remite ahí |
| H7 | ¿Se asienta o no? | De las ocho partidas, cuáles generan asiento en los libros de la empresa, y armarlos | A5 (pp. 190-191) | Cuidado con la cadena: si H6 pide 4.612.600, H7 no puede mostrarlo resuelto |

## Cambios de esta versión

- v1, primera lectura completa de las pp. 178-191.
- v1.2 (15 de octubre): territorio desde la p. 177 (bloque 0 → A0, con la portada de la p. 177 y los ejercicios de E que dependen de él); corte de seis piezas; correcciones obligatorias del cotejo de Shibukawa (O1 a O6) y las opcionales P1 a P7; erratas D4-13 a D4-17 añadidas con su origen, D4-8 completada y equivalencia con la lista de Shibukawa; huecos HD4-15 a HD4-22; «Opinión sobre el corte» marcada como histórica.
- v1.1, con las decisiones de Yujiro del 14 de octubre: «sobrante/faltante de caja menor» en todo el mapa; nombres de cuenta «Ingresos por intereses», «Gasto interés» y «Cuentas por cobrar – clientes»; nota débito y nota crédito marcadas como términos que T4 define en A4, siempre «del banco»; ninguna pieza muestra números de cheque; las reglas que solo están en los asientos se presentan como «mira el asiento de la p. X»; erratas D4-1, D4-2, D4-5 y D4-7 con su decisión; corte definitivo en cinco piezas. Mapa hecho sin leer el informe de Shibukawa.
