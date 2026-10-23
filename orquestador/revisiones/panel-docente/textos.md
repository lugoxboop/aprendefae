# Panel docente v1 · textos (Katsumi, 23 oct 2026)

Textos del rediseño que especificó Ukyo (`orquestador/conocimiento/prompts/panel-docente-v1.md`, PR #473). Todo texto de 10 palabras o más está medido con `npm run inflesz`. Los umbrales de `alertas.js` no se tocan. Las decisiones de Yujiro van al final.

| Dónde va | Texto | NUEVO o existente |
|---|---|---|
| **Motivos de alerta (6 palabras o menos)** | | |
| B2 · regla urgente (2 o más registros y más de 7 días sin actividad) | Más de una semana sin actividad | NUEVO (hoy: «Sin actividad más de un ciclo semanal») |
| B2 · regla de atención (2 o más exploratorias y menos de 60 % en evaluativas) | Practica, pero acierta poco en evaluativas | NUEVO (hoy: «Practica, pero no le sale sin apoyo») |
| B2 · regla informativa (menos de 90 s por actividad y menos de 60 % de acierto) | Responde rápido y acierta poco | NUEVO (hoy: «Respuestas rápidas y con poco acierto») |
| «Ver los N» · regla que todavía no se puede calcular (`REGLAS_SIN_DATOS`) | Abandono a mitad: aún sin datos | NUEVO (hoy: «Abandono repetido a mitad de actividad») |
| Detalle de cada alerta (`detalle`) | Sin cambios; va en «Ver los N», no en la fila | existente |
| **Rótulos** | | |
| B1, título | Mi clase | de la especificación |
| B1, rótulo de la cifra | Actividades hechas | NUEVO |
| B1, línea de apoyo | {N} de {M} activos esta semana | NUEVO (hoy: «ACTIVOS ESTE CICLO») |
| B2, título | Necesitan atención | de la especificación |
| B2, pie | Ver los {N} | de la especificación |
| B3, título | La actividad que más costó | NUEVO (la especificación decía «Actividad con peor resultado») |
| B3, rótulos de las cifras | Acierto medio · {N} la terminaron | NUEVO |
| B3, pie | Ver todas las actividades | de la especificación |
| B4, título (solo a 1024 px o más) | Desde tu última visita | de la especificación |
| Riesgo, junto al ícono | Alto (▲, urgente) · Medio (◆, atención) · Bajo (●, informativo) | de la especificación |
| Riesgo, para el lector de pantalla | Riesgo alto · Riesgo medio · Riesgo bajo | NUEVO |
| **Estados** | | |
| 0 estudiantes · B1 | Aún no hay nada que mostrar. Cuando tu clase haga su primera actividad, la verás aquí. (16 palabras · 82,0) | NUEVO; reemplaza el actual, que mide 28,6 |
| 0 estudiantes · «Mis estudiantes» y «Actividades» deshabilitados | Se abre cuando alguien haga su primera actividad. | NUEVO |
| 1 estudiante · B1, rótulo de la cifra | Avance de tu estudiante | NUEVO |
| 1 estudiante · B1, apoyo | {N} de 1 activo esta semana | NUEVO |
| B2 sin alertas | Nadie necesita atención hoy | de la especificación |
| B2 sin alertas, con 1 estudiante | Tu estudiante no necesita atención hoy | NUEVO |
| B3 sin datos | Aún no hay suficientes datos | de la especificación |
| B3 sin datos, segunda línea | Sale cuando cinco terminen la misma actividad. | NUEVO |
| B3 con 1 estudiante | Con un solo estudiante todavía no hay con quién comparar. (10 · 78,5) | NUEVO |
| Error de carga del panel | Título: «No se pudo cargar tu clase» · Cuerpo: «Revisa tu conexión y vuelve a intentarlo.» · Botón: «Reintentar» | NUEVO (hoy el panel principal no tiene estado de error) |
| Error, detalle por código | Los textos de `explicarFallo` | existente, sin cambios |
| Cargando | Esqueleto de 3 bloques; para el lector de pantalla, «Cargando…» | existente |

## Decisiones de Yujiro (reversibles)

1. **«Avance de la clase» se rotula «Actividades hechas».** Dice exactamente lo que cuenta `avancePorTema` (hechas entre total, promediado). Shibukawa lo juzga en captura; si no se entiende, cambia el rótulo, no la fórmula.
2. **No se escribe «Comparte el código del curso».** Esa función no existe en el código, y en este panel «0 estudiantes» significa que nadie ha hecho una actividad, no que nadie esté inscrito. Si algún día se construye, es de Erwin.
3. **El estado sin alertas no lleva ícono de riesgo.** Así ● Bajo significa siempre «aviso informativo» y nunca «todo bien».
4. **B3 con 1 estudiante:** Baki confirma si `n_terminaron` cuenta estudiantes distintos o intentos. Si cuenta estudiantes, con un solo estudiante se usa el texto propio de 1 estudiante, porque el umbral de 5 nunca se alcanzaría.
5. **Los motivos dicen solo lo que la regla comprueba.** Reemplazan los ejemplos de Ukyo («No entra hace 2 semanas», «Falla casi todo lo evaluativo»), que exageraban el dato: el umbral es de 7 días, se mide actividad y no entradas al sitio, y un acierto bajo 60 % no es «casi todo».
