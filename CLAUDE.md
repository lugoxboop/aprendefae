# AprendeFAE — índice para agentes

Este archivo se carga solo en toda sesión. **Es un índice, no el canon**: dice
dónde está cada cosa para que no tengas que leer archivos enteros buscándola.
Mantenlo corto; lo paga cada sesión, cada turno.

## Lo primero: busca antes de leer

```sh
node scripts/canon.mjs "D4"              # qué dice el canon sobre D4
node scripts/canon.mjs "migraciones" -c 6 # con 6 líneas de contexto
node scripts/canon.mjs --mapa             # qué archivos hay y de qué tratan
```

El canon pesa unos 63.000 tokens. Abrir `kit.md` entero cuesta 13.000; buscar
en él cuesta unas decenas. **Lee un archivo completo solo cuando vayas a
editarlo.** Si el buscador no encuentra lo que necesitas, entonces sí ábrelo.

## Quién eres y qué cargar

Si eres un agente de célula, tu prompt maestro es una *skill* y se carga sola
cuando la necesitas. No la pegues en el chat ni la leas entera a mano:

| Papel | Skill |
|---|---|
| Diseño | `celula-diseno` |
| Contenido pedagógico | `celula-pedagogico` |
| Auditoría de calidad | `celula-auditoria` |
| Construcción (código) | `celula-construccion` |

Si eres general, tu traspaso está en `orquestador/traspasos/<tu-nombre>.md`.

## Las células

Cadena de mando: Mateo → Miku (general de generales) → generales → agentes.

| Célula | General | Tema desde el 23-oct | Código | Pedagógico | Diseño | Auditoría |
|---|---|---|---|---|---|---|
| A | Erwin | Lo compartido | Sai | Gen | Xeno | Levi |
| B | Sakuta | T1 Introducción | Kaede | Futaba | Mai | Shoko |
| C | L | T2 Cuentas, debe y haber | Misa | Near | Watari | Mello |
| D | Yujiro | T4 Efectivo + panel docente | Baki | Katsumi | Hanayama | Shibukawa |
| E | Kamogawa | T3 Ingresos y gastos | Ippo | Miyata | Itagaki | Takamura |

**Ukyo** es el par de ojos externo común a las cinco, y además el experto en
diseño gráfico, landing pages y UI. Prueba, critica y define el estándar visual.

Erwin manda lo compartido: componentes comunes, choques entre células y datos
de estudiantes. Nadie más los toca; se le pide por issue.

## Las reglas que no se negocian

1. **Hay estudiantes reales** en Macroeconomía y en Contabilidad. Solo se
   agrega: nunca se borra lo existente ni sus datos.
2. **El nivel lo da el auditor con el Kit**, y es el **mínimo** de sus
   dimensiones, no el promedio. Un verde que nadie midió cuesta el doble.
3. **Medir, no calcular.** Las sondas de `scripts/` devuelven números; las
   cifras supuestas no valen.
4. **Todo se comprueba a 320 y 375 px**, con el texto más largo real.
5. **Decides tú todo lo reversible.** Solo se para ante lo irreversible: borrar
   o dañar datos de estudiantes, cambiar contenido que Mateo ya aprobó, o
   tumbar la plataforma. Eso se escala a tu general, que lo lleva a Miku.

## Dónde está cada cosa

| Necesitas | Está en |
|---|---|
| Cómo gastamos poco sin verificar menos | `orquestador/conocimiento/protocolo-de-eficiencia.md` |
| El Kit de Calidad (D1 a D9) | `orquestador/conocimiento/kit-de-calidad.md` y `kit.md` |
| Qué hace que una pieza enganche (E1 a E12) | `orquestador/conocimiento/enganche.md` |
| Quién toca qué archivo, rangos y ramas | `orquestador/conocimiento/nocturno.md`, «El mapa de choques» |
| Las células y sus enlaces | `orquestador/conocimiento/celulas.md` |
| Los términos de contabilidad | `orquestador/conocimiento/vocabulario/` |
| Estado de cada célula ahora mismo | `orquestador/estado/<general>.md` |
| Decisiones ya tomadas | `orquestador/conocimiento/decisiones.md` |

## Cómo se informa

- Al general, **una línea**: terminado o qué falta.
- El razonamiento, las mediciones y lo decidido por el camino van **al cuerpo
  del PR**, no al chat: ahí sirven y no se vuelven a pagar al releerlos.
- El estado va a `orquestador/estado/<general>.md`, con la hora **real** de
  `TZ=America/Bogota date "+%Y-%m-%d %H:%M"` en la primera línea.
- Lo que necesites de otra célula: issue con la etiqueta `miku`. Nadie escribe
  en el chat de otro general.
