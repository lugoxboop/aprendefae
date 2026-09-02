/* italic variable token, matches standard formula typesetting */
export function V({ children }) {
  return <span style={{ fontStyle: "italic" }}>{children}</span>;
}

/* CSS-based overline for autonomous components (C̄, Ī, Ḡ) */
export function Overline({ children }) {
  return (
    <span style={{ display: "inline-block", borderTop: "2px solid currentColor", paddingTop: "2px" }}>
      {children}
    </span>
  );
}
