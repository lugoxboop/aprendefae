/*
 * El icono de un bloque del panel, en su pastilla de color: el mismo gesto
 * que las opciones de la barra lateral de la cuenta (#681). Decorativo: el
 * título ya dice lo que es, así que el lector de pantalla no lo anuncia.
 */
export default function IconoBloque({ icono: Icono, tono, tamano = 30 }) {
  return (
    <span
      className="pd3-titulo-icono"
      aria-hidden="true"
      style={{
        width: `${tamano}px`, height: `${tamano}px`, borderRadius: "9px", flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        backgroundColor: `${tono}1F`, color: tono,
      }}
    >
      <Icono size={Math.round(tamano * 0.53)} strokeWidth={2.2} />
    </span>
  );
}
