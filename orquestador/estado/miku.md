2026-10-27 08:19 (hora Bogotá)
- Papel: general de generales. Las cinco células llevan en pausa desde el 26-oct por orden de Mateo (ahorro de cupo); Miku hace el trabajo a mano y reactiva por tareas concretas
- Vigía: lo hace Miku, no un agente. El agente vigía del 25-oct se borró: preguntaba «continuar» a agentes ya trabados y eso costó cupo sin mover nada

## Encargos de Mateo y dónde van

1. Capacitar a las células: terminado (skills de célula + CLAUDE.md + scripts/canon.mjs; medido, el canon se busca en decenas de tokens en vez de abrirse en miles)
2. Contabilidad recortada a 4 temas: terminado (OCULTAR_TEMAS_FUERA_DEL_SEMESTRE)
3. Logitos de los 4 temas: terminado
4. Repaso Diario de Contabilidad: BLOQUEADO por contenido, no por código. El pool tiene 4 ítems y los 4 son de T3. B, C y D reactivadas el 27-oct a las 08:2x para llenar t1.js, t2.js y t4.js; se publica (publicado: true) cuando pool-contabilidad.test.mjs diga que los cuatro temas tienen ítems
5. Más actividades para los 4 temas: a medias, de las células
6. Aprender tipo presentación: TERMINADO Y VISIBLE. T2_APRENDER_EN_SECUENCIA y ENCENDIDA en true (a7eda078). Cinco guardas reescritas, ninguna aflojada
7. Panel docente simplificado: terminado (célula D)
8. Ukyo diseño/UI y además ojos externos: terminado, sigue siendo las dos cosas
9. Ahorro de tokens en Cowork: en curso. Orden pasada a los cinco generales; skills y canon.mjs son la parte estructural
10. Volumen 3D en el CAMINO: terminado y en producción (nodo con base hundida, ALTURA_NODO)
11. Animaciones de entrada estilo landing + decoración: en PR #619

## PR #619 (abierto, CI verde en el primer commit)
- shared/Entrada.jsx: easing, offset & delay de 80 ms, profundidad por distancia recorrida. Portada y pantalla de materia coreografiadas
- shared/DecoracionCamino.jsx: 10 figuras geométricas cada ~10 % de alto + 2 glifos del tema (cuenta T, barras). Detrás, sin tocar, sin leerse, recortadas, deterministas
- shared/Mascota.jsx: el muñequito, al final del camino en el lado libre. Respira, parpadea, saluda 3 veces y para
- data/heroPhrases.js: 84 titulares por franja horaria y de fondo autodidacta. Los 5 viejos hablaban de nosotros
- scripts/sonda-pantalla.mjs: la sonda de capturas que faltaba, a 320 y 375, con --antes para fingir sesión
- camino-sin-cambios NO se rehízo: pesa el HTML con la capa decorativa recortada y las 42 huellas de main siguen cuadrando

## Lo que falta
- Fusionar #619 cuando CI cierre
- 19 PRs abiertos sin fusionar; #575 con conflictos
- Portada: Pensamiento Estratégico fuera de lo visible (PORTADA_ESTRATEGICO = false), ya en main

## Lecciones que no se repiten
- Un verde que no midió lo que dice medir no es un verde: filtrar con ^not ok sobre un informe que no es TAP enseña vacío y parece éxito
- Yo rompí main el 24-oct con marcas combinantes crudas en canon.mjs. Un general lo diagnosticó y dejó el arreglo de una línea; el rojo se heredó a todos los PR y costó un día
- Dos veces fui yo el cuello de botella por no fusionar lo compartido a tiempo (#490/#491 y una pila de 6)
