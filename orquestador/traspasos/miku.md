# Traspaso · Miku, general de generales (23-oct-2026)

## Quién soy
- General de generales de AprendeFAE, por encima de Erwin. Cadena: Mateo → Miku → generales → agentes.
- Coordino las cinco células, llevo las órdenes de Mateo a todas y le reporto. No hago el trabajo de los generales: los destrabo.
- Erwin manda la Célula A y lo compartido (componentes comunes, choques entre células, datos de estudiantes).

## Células
| Célula | General | Código | Pedagógico | Diseño | Auditor |
|---|---|---|---|---|---|
| A | Erwin | — | — | Xeno (dueño del color) | Levi (sin acceso al repo) |
| B | Sakuta | Kaede | Futaba | Mai | Shoko |
| C | L | Misa | Near | Watari | Mello |
| D | Yujiro | Baki | Katsumi | Hanayama | Shibukawa |
| E | Kamogawa | Ippo | Miyata | Itagaki | Takamura |

Ukyo es el probador general. Cada general tiene su traspaso en `orquestador/traspasos/`.

## Cómo superviso (desde el 23-oct)
- Leo `orquestador/estado/*.md` en el repo (regla h del protocolo), no los chats.
- Un vigilante barato (git cada 10 min) me despierta solo si cambia un estado, aparece `BLOQUEADO-MATEO` o hay un issue con la etiqueta `miku`.
- Chrome solo si un estado lleva horas quieto sin estar terminado, o si Mateo pide algo nuevo. Lectura de texto, sin capturas salvo que sea imprescindible.
- Los chats de los generales (nuevos, del 23-oct) los tiene Mateo; no van en el repo porque es público.

## La vara de Mateo
- Crítico = solo lo que no se deshace: datos o puntajes de estudiantes, contenido que Mateo ya aprobó, tumbar la plataforma. Eso se le pregunta con opciones (botones), en negrilla.
- Todo lo reversible lo decide el general o Miku, y se cuenta en el resumen.
- Reportes a Mateo: cortos, gerenciales, sin código. Formato por general: estado (Avanza / Lento / Estancado / Espera a Mateo / Sin señal) + una línea; luego «Mi lectura» y **Decisión tuya**.
- Lectura con doble verificación: nunca reportar «quieto» sin una segunda comprobación.

## Decisiones vigentes
- «Terminada» = Avanzado verificable según el Kit (`orquestador/conocimiento/kit-de-calidad.md`): Avanzado en todo lo comprobable mirando. D2, D3, D5, D7, D8 y D9 que exigen personas reales quedan «pendiente de prueba con personas».
- D4 en lectura estricta: repetir la misma pregunta con otro caso no cuenta como decisión distinta.
- Aprender, C2: pista al primer error; al segundo, la respuesta con su porqué.
- Macroeconomía tiene estudiantes reales: solo se agrega, nunca se toca lo existente ni sus datos.
- Medalla «Macroeconomía al día»: quien ya la tiene la conserva (prueba automática que lo protege).
- Ahorro: protocolo de eficiencia (reglas a–h). El Kit y el auditor no se negocian.

## Estado al 23-oct
- Contabilidad cerrada en las cinco células (~109 piezas en Avanzado verificable).
- Política monetaria (Macro): 3 actividades publicadas — La Tasa que Muerde, ¿Repo o Definitiva?, El Freno del Encaje.

## Pendientes
1. Prueba con estudiantes reales de lo marcado «pendiente de prueba con personas» (todas las células).
2. Célula E: Takamura no ha re-auditado r5-3 (#444); dos detalles menores de r5-4.
3. Célula B: Shoko no revisó con capturas las devoluciones del #458.
4. Compartido: la capa 1 de CuatroCapas no le pregunta nada al estudiante (Erwin/Levi).
5. Contradicción de diseño anotada por Erwin para Xeno.
6. Levi sigue sin acceso al repo: o se le da lectura, o audita otro auditor con acceso.
7. Medición del ahorro: anotar el cupo semanal al empezar y al terminar la próxima materia y dividir por piezas terminadas (línea base de la semana del 16-oct: 0,5–0,7 % del cupo por pieza).

## Cómo arrancar
1. Lee este archivo y `orquestador/conocimiento/protocolo-de-eficiencia.md`.
2. Lee `orquestador/estado/` para saber dónde va cada célula.
3. Arranca el vigilante del repo y espera órdenes de Mateo.
