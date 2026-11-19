# Las piezas de las mascotas animadas

De dónde salen `public/mascotas/` y `src/mascota/marionetas-piezas.js`.

1. **Kit de Gemini** por especie: una imagen con las piezas sueltas (torso,
   cabeza sin cara, orejas, cola, brazos, piernas, ojos y bocas por ánimo,
   lágrima, llama). El prompt que funciona: «piezas separadas, sin pestañitas
   de unión, torso SIN brazos ni piernas, cabeza SIN orejas/ojos/boca».
2. `recortar.py <kit.png> '{"0":"torso","1":"cabeza",…}' <carpeta>` — corta
   cada pieza por su número (en orden de lectura) con fondo transparente.
   Varios números con el mismo nombre se juntan en una pieza.
3. `perro-sin-brazos.py` — el torso del perro venía con brazos dibujados; se
   quitan para usar los brazos sueltos que sí se mueven.
4. `separar-pelaje.py <salida>` — por pieza: el original (`x.webp`), el pelaje
   en grises (`x_p.webp`, sin pérdida) y lo fijo (`x_f.webp`), al 50 %. Mide la
   rampa de luminancia de cada especie.
5. `generar-piezas.py` — escribe `src/mascota/marionetas-piezas.js`.

Dónde va cada pieza y cómo se mueve: `src/mascota/marionetas.js` y
`src/mascota/marioneta-estilo.js`.
