# Memoria de los agentes — bitácoras

Una bitácora por agente (`<nombre>.md`), definida por la **regla l** del
protocolo de eficiencia. Es la memoria de trabajo de cada quien: se **lee al
empezar cualquier chat, antes de hacer nada**, y se **actualiza al cerrar un
bloque**. Así un chat nuevo arranca sabiendo en qué estaba sin releer todo ni
preguntarle a Mateo.

- Estructura fija y corta (máx ~60 líneas): Quién soy y mi alcance · En qué
  estoy ahora · Decisiones tomadas y por qué · Pendientes · Lo que aprendí que
  no hay que repetir.
- Lo histórico se condensa en `archivo/<agente>-AAAA-MM.md`.
- Es distinta del **estado** (`orquestador/estado/`, que ve Miku) y del
  **traspaso** (`orquestador/traspasos/`, para cambiar de chat): la bitácora es
  para el propio agente, día a día.
