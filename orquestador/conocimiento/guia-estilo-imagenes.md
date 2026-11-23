# Guía de estilo de imágenes (Gemini)

Para que todas las imágenes que pida Gen a Gemini salgan **coherentes entre sí**.
Es la referencia fija: antes de pedir una imagen, Gen lee esta guía y la cumple;
cuando cierra la descripción definitiva de un personaje, la **anota aquí** para
que la próxima vez salga igual.

## Reglas fijas para todas las imágenes
- **Paleta:** la del kit de marca (`orquestador/conocimiento/marca-planck.md`):
  grafito `#121418`, azul `#2747F5` (claro) / `#6F86FF` (oscuro); **coral solo
  para error**, nunca de relleno. Nada de clichés de gamificación (trofeos,
  coronas, cofres, gemas).
- **Trazo:** el mismo estilo de línea y acabado en todas (defínelo una vez abajo
  y no lo cambies entre personajes).
- **Fondo:** transparente o liso, **nunca una foto o una escena cargada**.
- **Fidelidad:** una imagen nunca puede implicar algo conceptualmente falso del
  tema (regla del Kit).

## Mascotas que se animan (marionetas)
Las 7 especies son marionetas de piezas (ver `src/mascota/marionetas.js`): se
animan por partes. Por eso, para una mascota:
- Pide el personaje **por partes** (cabeza, cuerpo, patas, cola) **o** en varias
  poses, con **fondo transparente o liso** — **no una sola foto**.
- Cada parte/pose debe encajar con las demás (misma escala, mismo trazo, misma
  paleta de la especie).

### Las 7 especies
Panda · conejo · hurón · zorro · gato · perro · hámster.

La descripción visual exacta de cada especie (proporciones, pelaje, rasgos)
vive hoy en `src/mascota/marionetas.js` y `public/mascotas/`. Aquí Gen deja, por
especie, la **descripción bloqueada** que le pasa a Gemini (una vez la fija),
para que no cambie entre pedidos:

| Especie | Descripción bloqueada para Gemini (Gen la llena al fijarla) |
|---|---|
| Panda |  |
| Conejo |  |
| Hurón |  |
| Zorro |  |
| Gato |  |
| Perro |  |
| Hámster |  |

## Dónde quedan las imágenes
- Gemini descarga a la carpeta **Descargas/Imagenes-agentes** del computador.
- Gen revisa la imagen (que se vea bien y respete esta guía) y la sube al
  proyecto con un **nombre claro** (p. ej. `panda-cabeza.png`, `zorro-pose-saludo.png`).
- **Derechos de autor:** a este repositorio (público) van las imágenes propias
  generadas; nunca los originales de terceros.
