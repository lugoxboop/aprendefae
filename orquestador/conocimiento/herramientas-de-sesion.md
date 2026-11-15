# Herramientas de sesión de código (Graphify + complementos)

Encargo de Mateo del 14 de noviembre de 2026 (puntos 3 y 4). Estas herramientas
viven en las **sesiones de código** (Claude Code), no en la orquestación, así
que las instala **un agente de código** (Sai, Kaede, Misa, Baki o Ippo) una sola
vez, desde su sesión. Fuentes oficiales únicamente.

## Graphify — mapa del código (prioridad 2)
Fuente: github.com/safishamsi/graphify · paquete `graphifyy` (con dos «y»).

1. Instalar la herramienta (`graphifyy`).
2. Registrar la skill **solo para el proyecto**: `graphify install --project`.
3. Generar el mapa: `/graphify .`
4. Activar la reconstrucción al hacer commit: `graphify hook install`.
5. Decidir si `graphify-out/` se versiona o se ignora; lo importante es que
   cualquier agente pueda consultarla (si se ignora, que esté en el `.gitignore`
   con una nota de cómo regenerarla).
6. Prueba: 3 preguntas reales sobre AprendeFAE con `/graphify query`,
   `/graphify path`, `/graphify explain`; confirmar que responde sin abrir
   archivos enteros.

**Regla para todos:** para entender cómo se conecta el código, consulta primero
el mapa (`/graphify query|path|explain`) antes de abrir archivos.

## Complementos de trabajo (prioridad 3)
Solo desde estas fuentes oficiales:

- **Agent Skills** (addyosmani/agent-skills) — planear, construir, probar,
  publicar:
  `/plugin marketplace add addyosmani/agent-skills`
  `/plugin install agent-skills@addy-agent-skills`
- **Ponytail** (DietrichGebert/ponytail) — busca lo que ya existe antes de
  escribir código nuevo; revisar al final de cada respuesta lo que dice que
  omitió:
  `/plugin marketplace add DietrichGebert/ponytail`
  `/plugin install ponytail@ponytail`

**No instalar OmniRoute** ni nada que cambie de modelo al acabarse el límite.
Si un complemento choca con el protocolo o con el auditor, manda el protocolo; el
choque se anota en una línea aquí.

## Estado de la instalación
- 2026-11-14 — Miku dejó estas instrucciones. Pendiente de que un agente de
  código las corra en su sesión (no se pueden instalar desde la orquestación).
