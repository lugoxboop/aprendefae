-- La razón de que las medallas de podio no se recalculen hacia atrás.
--
-- No cambia ningún comportamiento. Deja escrita, en el propio catálogo de la
-- base, una decisión que la 0026 tomó y explicó solo por su mecanismo.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- POR QUÉ UNA MIGRACIÓN Y NO UN COMENTARIO EN LA 0026
--
-- La 0026 ya está aplicada. Reescribir su archivo —aunque fuera solo un
-- comentario, y este iba dentro del cuerpo de liga_resultados— haría que lo
-- que dice el repositorio y lo que se ejecutó dejaran de ser lo mismo. Es la
-- regla que se siguió con la 0006 y la 0025.
--
-- Y así la razón queda donde se consulta: `comment on function` la guarda en
-- pg_description, y la ve cualquiera que inspeccione la función —el editor de
-- Supabase, \df+ en psql— sin tener que encontrar este archivo.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- LA DECISIÓN
--
-- La 0026 cambió el podio: del 28% del nivel a la zona de ascenso. Las
-- medallas de podio se calculan al vuelo desde liga_resultados, sin tabla de
-- medallas ganadas, así que aplicar la regla nueva a todos los ciclos habría
-- QUITADO medallas ya ganadas a quien estuvo en el podio del 28% y no lo está
-- en el de la zona. Por eso liga_resultados aplica la zona solo desde
-- 'podio_proporcional_desde'.
--
-- LA RAZÓN ES DE JUSTICIA, NO TÉCNICA: cada semana se juzga con la regla con
-- la que se jugó. Quien entró al podio del 28% lo ganó con las reglas que
-- había. Quitarle esa medalla por un cambio que hicimos nosotros después sería
-- indefendible, aunque recalcularlo todo con la regla nueva fuera "más
-- consistente". La consistencia del código no está por encima de lo que ya se
-- le reconoció a un estudiante.
--
-- SI LA REGLA DEL PODIO VUELVE A CAMBIAR, el mismo principio: otra fecha de
-- corte, nunca un recálculo hacia atrás.
--
-- Idempotente: `comment on` reemplaza el comentario anterior, si lo hubiera.
-- ---------------------------------------------------------------------------

comment on function public.liga_resultados(text, date) is
'Resultados reconstruidos de un ciclo de liga cerrado. El podio (en_podio) se juzga con la regla con la que se jugó ese ciclo: el 28% del nivel antes de ajustes.podio_proporcional_desde, la zona de ascenso desde entonces (0026). Es una decisión de justicia, no técnica: las medallas de podio se calculan al vuelo desde aquí, y recalcular hacia atrás le quitaría a un estudiante una medalla que ganó con las reglas que había, por un cambio posterior nuestro. Si la regla vuelve a cambiar: otra fecha de corte, nunca un recálculo. Ver 0027.';

comment on table public.ajustes is
'Ajustes del sitio leídos por las funciones. podio_proporcional_desde marca desde qué ciclo el podio de liga es la zona de ascenso; los ciclos anteriores conservan el podio del 28% con el que se jugaron (ver el comentario de liga_resultados y la 0027). No mover esa fecha hacia atrás: quitaría medallas ya ganadas.';
