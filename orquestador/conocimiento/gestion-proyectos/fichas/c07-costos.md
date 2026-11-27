# Ficha · Capítulo 7 de la Guía del PMBOK 6.ª ed. — Gestión de los Costos del Proyecto

> Ficha de Gen, 2026-11-27, **en palabras propias** (el repositorio es público: aquí no
> se copia el libro). Original en el almacén privado del proyecto:
> `gestion-proyectos/originales/PMBOK-6-guia-ES.txt` (cap. 7 = pp. 231–271). Las páginas
> entre paréntesis son de la guía. No volver a abrir el original para este capítulo.

## Mapa del capítulo y subtemas (ids para el panel docente)

| Subtema | id | Páginas |
|---|---|---|
| Qué cubre el área, sus 4 procesos, costo del ciclo de vida, adaptación y ágil | `gp07-panorama` | 231–235 |
| Planificar la gestión de los costos y el plan de gestión de los costos | `gp07-plan` | 236–240 |
| Técnicas de estimación: análoga, paramétrica, ascendente | `gp07-tecnicas` | 245 |
| Estimación por tres valores: triangular y beta | `gp07-tres-valores` | 245–246 |
| Exactitud de la estimación (ROM, rango definitivo) y base de las estimaciones | `gp07-exactitud` | 242, 248 |
| Reservas: para contingencias y de gestión | `gp07-reservas` | 246, 253, 255, 266 |
| Agregación de costos, línea base de costos, presupuesto, curva S | `gp07-linea-base` | 249, 253–256 |
| Requisitos de financiamiento y conciliación del límite de financiamiento | `gp07-financiamiento` | 254, 256–257 |
| Controlar los costos: qué incluye, cambios, salidas | `gp07-control` | 258–261, 269–271 |
| Valor ganado: PV, EV, AC, BAC | `gp07-evm` | 262 |
| Variaciones e índices: CV, SV, CPI, SPI | `gp07-variaciones` | 263–264, 268 |
| Pronósticos: EAC (4 fórmulas), ETC, VAC | `gp07-pronosticos` | 265–266, 268 |
| Índice de desempeño del trabajo por completar (TCPI) | `gp07-tcpi` | 267–269 |
| Cronograma ganado (ES), tendencia emergente | `gp07-cronograma-ganado` | 234 |

## Conceptos (en palabras propias)

**El área (p. 231).** Reúne lo necesario para **planificar, estimar, presupuestar,
financiar, conseguir financiamiento, gestionar y controlar** los costos, de modo que el
proyecto termine **dentro del presupuesto aprobado**. En proyectos pequeños estimar y
presupuestar pueden ser casi un solo paso; la guía los separa porque usan técnicas
distintas. Como la capacidad de influir en los costos es **mayor al principio**, definir
pronto el alcance es crítico.

**Conceptos clave (p. 234).**
- Se ocupa sobre todo del costo de los **recursos** que necesitan las actividades.
- Debe mirar también el **costo del ciclo de vida**: una decisión que abarata el proyecto
  puede encarecer después el uso, el mantenimiento o el soporte del producto (ejemplo de
  la guía: limitar las revisiones de diseño baja el costo del proyecto y puede subir el
  costo operativo).
- Cada interesado **mide el costo de forma y en momento distintos**: al decidir o
  comprometer la compra, al pedir o recibir el artículo, o cuando el costo se incurre o se
  registra en la contabilidad.
- El análisis del rendimiento financiero del producto (retorno de la inversión, flujo de
  caja descontado, plazo de recuperación) muchas veces se hace **fuera** del proyecto; en
  obras de infraestructura puede quedar dentro.

**Tendencia: cronograma ganado (p. 234).** Extiende el valor ganado: en vez de medir el
atraso con EV − PV, usa **ES (cronograma ganado) y AT (tiempo real)**. Variación del
cronograma = **ES − AT** (mayor que 0 = adelantado). **SPI = ES / AT**. También permite
pronosticar la fecha de fin.

**Adaptación (p. 235).** Preguntas para ajustar los procesos: ¿hay repositorio de
conocimiento y bases de datos financieras?, ¿políticas y guías de estimación y
presupuesto?, ¿se usa valor ganado?, ¿se trabaja con enfoque ágil y cómo cambia la
estimación?, ¿qué gobernanza y auditoría hay?
**Ágil (p. 235).** Con mucha incertidumbre o alcance sin definir, el cálculo detallado
sirve poco: se usa **estimación simple** («lightweight») para un pronóstico rápido de alto
nivel del costo laboral; lo detallado se deja para el horizonte corto, justo a tiempo. Si
además el presupuesto es estricto, lo que se ajusta con frecuencia son **alcance y
cronograma**, para no salirse del costo.

### Los 4 procesos

| Proceso | Grupo de procesos | Entradas clave | Herramientas y técnicas clave | Salidas clave | Frecuencia |
|---|---|---|---|---|---|
| 7.1 Planificar la Gestión de los Costos | Planificación | Acta de constitución (recursos financieros preaprobados); plan de gestión del cronograma y de los riesgos | Juicio de expertos; análisis de alternativas (financiarse con recursos propios, acciones o deuda; construir, comprar, alquilar o arrendar); reuniones | **Plan de gestión de los costos** | Una vez o en puntos predefinidos |
| 7.2 Estimar los Costos | Planificación | Plan de gestión de los costos y de la calidad; línea base del alcance; cronograma; requisitos de recursos; registro de riesgos; lecciones aprendidas | Juicio de expertos; **análoga; paramétrica; ascendente; tres valores**; análisis de alternativas, **de reserva** y costo de la calidad; PMIS; votación | **Estimaciones de costos; base de las estimaciones** | Periódica, según se necesite |
| 7.3 Determinar el Presupuesto | Planificación | Base de las estimaciones; estimaciones de costos; cronograma; registro de riesgos; caso de negocio y plan de beneficios; acuerdos | **Agregación de costos**; análisis de reserva; información histórica; **conciliación del límite de financiamiento**; financiamiento | **Línea base de costos; requisitos de financiamiento** | Una vez o en puntos predefinidos |
| 7.4 Controlar los Costos | Monitoreo y Control | Línea base de costos / para la medición del desempeño; requisitos de financiamiento; **datos de desempeño del trabajo** | **Análisis del valor ganado, de variación, de tendencias y de reserva; TCPI**; PMIS | Información de desempeño; **pronósticos de costos**; **solicitudes de cambio** | Todo el proyecto |

**7.1 Plan de gestión de los costos (pp. 239–240).** Parte del plan para la dirección.
Dice cómo se planifican, estructuran y controlan los costos. Puede fijar:
- **Unidades de medida** (horas o días de trabajo, metros, litros, toneladas, pago único).
- **Nivel de precisión:** cuánto se redondea (ej. de la guía: 995,59 → 1.000).
- **Nivel de exactitud:** rango aceptable de la estimación (ej. ±10 %), que puede incluir
  contingencias.
- **Enlace con la organización:** la EDT es el marco; el componente de la EDT donde se
  contabiliza el costo es la **cuenta de control**, con un código ligado a la contabilidad.
- **Umbrales de control:** variación permitida antes de actuar, normalmente en % frente a
  la línea base.
- **Reglas para medir el desempeño con valor ganado:** en qué puntos de la EDT se mide,
  qué técnica (hitos ponderados, fórmula fija, porcentaje completado…), cómo se calcula la
  EAC.
- **Formatos y frecuencia de los informes.**
- **Otros:** elección estratégica del financiamiento, manejo de tasas de cambio, cómo se
  registran los costos.

**7.2 Estimar (pp. 241–248).** Una estimación es una **predicción cuantitativa** con la
información de un momento dado. Se expresa en moneda (a veces en horas o días de trabajo,
para quitar el efecto de las divisas). Se estiman **todos** los recursos: personal,
materiales, equipos, servicios, instalaciones y categorías especiales (inflación, costo de
financiación, contingencia). Hay que buscar equilibrio costo-riesgo (hacer o comprar,
comprar o alquilar, compartir recursos).
- **Exactitud que mejora con el avance (p. 242):** al inicio, **ROM** (orden de magnitud)
  de **−25 % a +75 %**; más adelante, con más información, **−5 % a +10 %**.
- **Análoga:** usa valores o atributos de un **proyecto anterior parecido** (alcance,
  costo, presupuesto, duración, tamaño, peso) como base.
- **Paramétrica:** usa una **relación estadística** entre datos históricos y una variable
  (ej. costo por metro cuadrado). Puede ser muy exacta según la calidad del modelo y de los
  datos; sirve para todo el proyecto o partes.
- **Ascendente:** estima cada paquete de trabajo o actividad **con el mayor detalle** y
  luego **suma** hacia arriba.
- **Tres valores:** más probable (**cM**), optimista (**cO**), pesimista (**cP**).
  - **Triangular: cE = (cO + cM + cP) / 3**
  - **Beta: cE = (cO + 4·cM + cP) / 6**
- **Análisis de reserva:** la **reserva para contingencias** es presupuesto **dentro de la
  línea base** para **riesgos identificados** («conocidos-desconocidos», ej. un retrabajo
  que se sabe que vendrá pero no cuánto). Puede ser %, monto fijo o calculada; puede
  usarse, reducirse o eliminarse según se aclara la información; debe quedar visible en la
  documentación.
- **Costo de la calidad:** comparar invertir en conformidad contra el costo de la no
  conformidad.
- **Votación:** involucra al equipo y sube su compromiso con la estimación.
- **Base de las estimaciones (p. 248):** cómo se hizo, supuestos, restricciones, riesgos
  incluidos, **rango** (ej. US$ 10.000 ± 10 %) y **nivel de confianza**.

**7.3 Presupuesto (pp. 249–257).**
- **Presupuesto del proyecto:** todos los fondos autorizados.
- **Agregación (p. 253):** actividades (+ su contingencia) → **paquetes de trabajo**
  (+ contingencia) → **cuentas de control** → suma = **línea base de costos** (gráfico 7-8).
- **Línea base de costos (p. 255):** versión **aprobada** del presupuesto **por fases de
  tiempo**, **con** reservas para contingencias y **sin** reserva de gestión. Solo cambia
  por **control formal de cambios**. Se dibuja como **curva S** (costo acumulado en el
  tiempo). Con valor ganado se llama **línea base para la medición del desempeño (PMB)**.
- **Reserva de gestión (p. 253):** monto retenido por **control de la dirección** para
  trabajo **no previsto dentro del alcance** («desconocidos-desconocidos»). **No está en
  la línea base** pero **sí en el presupuesto** y en los requisitos de financiamiento.
  Usarla exige **pasar el monto a la línea base con un cambio aprobado**.
- **Línea base + reserva de gestión = presupuesto del proyecto.**
- **Información histórica (p. 254):** alimenta modelos análogos y paramétricos; son
  fiables si los datos son exactos, los parámetros fáciles de cuantificar y el modelo es
  escalable.
- **Conciliación del límite de financiamiento (p. 254):** si los fondos comprometidos por
  período no alcanzan el gasto planeado, se **reprograma el trabajo** (fechas impuestas)
  para equilibrar el ritmo de gasto.
- **Financiamiento (p. 254):** conseguir los fondos; si la fuente es externa, puede poner
  requisitos.
- **Requisitos de financiamiento (p. 257):** totales y por período (trimestral, anual),
  salen de la línea base; suelen llegar **en escalones** (no parejos). **Fondos totales =
  línea base + reserva de gestión.** Pueden indicar la fuente.

**7.4 Controlar (pp. 258–271).** Para actualizar el presupuesto se necesitan los
**costos reales**. Todo aumento del presupuesto autorizado pasa por **Realizar el Control
Integrado de Cambios**. Vigilar el gasto **sin mirar el trabajo hecho** sirve de poco: la
clave es la relación entre fondos consumidos y trabajo logrado. El control incluye:
influir en lo que cambia la línea base; tramitar a tiempo las solicitudes de cambio;
gestionar los cambios cuando ocurren; que el gasto no pase de lo autorizado por período,
componente, actividad y total; detectar y entender variaciones; **no incluir cambios no
aprobados en los informes**; informar a los interesados; mantener los sobrecostos
previstos dentro de límites aceptables.

### Valor ganado (EVM) — fórmulas exactas (pp. 262–268, tabla 7-1)

| Sigla | Nombre | Qué es | Fórmula | Lectura |
|---|---|---|---|---|
| PV (VP) | Valor planificado | Presupuesto autorizado del trabajo **programado** hasta la fecha (sin reserva de gestión) | — | — |
| EV (VG) | Valor ganado | Presupuesto del trabajo **realmente completado** | EV = suma del PV del trabajo completado | No puede pasar del PV total del componente |
| AC (CR) | Costo real | Lo **gastado** en el trabajo medido por el EV | — | **Sin límite superior** |
| BAC | Presupuesto hasta la conclusión | PV total = línea base de costos | — | — |
| CV | Variación del costo | Déficit o superávit a la fecha | **CV = EV − AC** | + bajo el costo · 0 en el costo · − sobre el costo |
| SV | Variación del cronograma | Adelanto o atraso a la fecha | **SV = EV − PV** | + adelantado · 0 a tiempo · − atrasado |
| VAC | Variación a la conclusión | Déficit o superávit proyectado al final | **VAC = BAC − EAC** | + bajo el costo · − sobre el costo (lectura de Gen desde la definición; esa casilla de la tabla 7-1 llegó desordenada) |
| CPI | Índice de desempeño del costo | Eficiencia del costo | **CPI = EV / AC** | > 1 bajo el costo · 1 justo · < 1 sobre el costo |
| SPI | Índice de desempeño del cronograma | Eficiencia del cronograma | **SPI = EV / PV** | > 1 adelantado · 1 a tiempo · < 1 atrasado |
| EAC | Estimación a la conclusión | Costo total previsto | ver las 4 de abajo | — |
| ETC | Estimación hasta la conclusión | Lo que falta gastar | **ETC = EAC − AC** (o reestimar) | — |
| TCPI | Índice de desempeño del trabajo por completar | Eficiencia que **hay que lograr** en lo que falta | **(BAC − EV) / (BAC − AC)** o **(BAC − EV) / (EAC − AC)** | > 1 más difícil · 1 igual · < 1 más fácil |

**Las 4 EAC y cuándo se usa cada una (pp. 265–266, tabla 7-1):**
1. **El plan ya no vale → reestimar desde abajo:** **EAC = AC + ETC ascendente** (el
   método más común, lo hacen director y equipo).
2. **Lo que falta irá a la tasa presupuestada:** **EAC = AC + (BAC − EV)**. Si el
   desempeño fue malo, suponer que mejorará solo se acepta con un análisis de riesgos que
   lo respalde.
3. **Lo que falta irá al mismo CPI acumulado:** **EAC = BAC / CPI**.
4. **CPI y SPI pesan en lo que falta** (el cronograma afecta el costo): **EAC = AC +
   [(BAC − EV) / (CPI × SPI)]**; se pueden dar pesos (80/20, 50/50…).
Normalmente se usan los CPI y SPI **acumulados**. La EAC calculada o ascendente se
documenta y se comunica (pronóstico de costos).

**Más ideas del EVM:**
- EVM integra las líneas base de alcance, cronograma y costos en la **PMB**.
- El **CPI es la métrica más crítica** del análisis; una **CV negativa suele ser difícil
  de recuperar**.
- La **SV termina en cero** al acabar el proyecto (todo lo planificado ya ocurrió); por
  eso se usa con la ruta crítica y la gestión de riesgos.
- El rango de desviación aceptable **se estrecha** a medida que avanza el trabajo.
- **Tendencias (p. 264):** PV, EV y AC se grafican por período y acumulados en curvas S;
  el gráfico 7-12 muestra un proyecto sobre el costo y atrasado.
- **TCPI (p. 267):** trabajo restante (BAC − EV) / fondos restantes (BAC − AC, o EAC − AC
  si la EAC ya se aprobó). Si el CPI acumulado cae bajo la línea base, todo lo que falta
  tendría que hacerse al TCPI (BAC) para no pasarse del BAC; si eso es realista o no es un
  juicio (riesgos, tiempo, desempeño técnico). ⚠ El texto dice «basada en el BAC» también
  para la segunda fórmula: es errata; la segunda usa la EAC (lo confirma la tabla 7-1).
- **Análisis de reserva en el control (p. 266):** vigilar ambas reservas; las de
  contingencia que no se usen pueden **retirarse** para liberar recursos; los ahorros
  pueden sumarse a la contingencia o salir como margen; nuevos riesgos pueden pedir más
  reserva.
- **Salidas (pp. 269–271):** en la información de desempeño se documentan **CV, CPI, EAC,
  VAC y TCPI**; los cambios a la línea base (por cambios aprobados de alcance, recursos o
  estimaciones) van por **solicitud de cambio**; a veces la variación es tan grande que se
  pide **rebasar** la línea base para tener una base realista.

## Lo que más confunde (criterio de Gen hasta que llegue el profesor)
1. Meter la **reserva de gestión dentro de la línea base** (va fuera; solo está en el
   presupuesto).
2. Creer que el director puede gastar la reserva de gestión sin un cambio aprobado.
3. Invertir las restas: CV = **EV** − AC y SV = **EV** − PV (siempre empieza por EV).
4. Leer el CPI al revés: **menor que 1 es malo** (sobre el costo).
5. Confundir **EAC** (total al final) con **ETC** (lo que falta).
6. Usar siempre BAC/CPI sin preguntar si el desvío fue atípico (entonces AC + BAC − EV).
7. Leer el TCPI como el CPI: en el TCPI **mayor que 1 es más difícil**.
8. Creer que gastar menos de lo planeado es bueno sin mirar el trabajo hecho (AC solo no
   dice nada sin EV).
9. Confundir **precisión** (redondeo) con **exactitud** (rango ±).
10. Pensar que la estimación inicial (ROM) ya es exacta: va de −25 % a +75 %.
