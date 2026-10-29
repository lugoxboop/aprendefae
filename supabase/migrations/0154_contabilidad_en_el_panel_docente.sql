/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0154 — CONTABILIDAD EN EL PANEL DOCENTE, PARA LA CUENTA DE MATEO
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Va en el rango del coordinador (150-199) porque escribe en public.docentes,
 * que es la lista blanca del panel: ninguna célula la toca.
 *
 * QUÉ CAMBIA Y QUÉ NO
 *
 * Las materias que ve cada docente NO están en el código: viven en
 * docentes.materias, y materias_docente() las lee del JWT por correo. Así que
 * «añadir Contabilidad al panel» no es un despliegue, es esta fila.
 *
 * Encargo de Mateo del 29-oct, y con su alcance elegido: SOLO su cuenta. La
 * alternativa era dársela a todos los docentes activos, y la descartó él
 * mismo —con razón—: quien hoy entra a ver Macroeconomía pasaría a ver los
 * nombres y el desempeño de los estudiantes reales de Contabilidad sin que
 * nadie se lo haya concedido.
 *
 * ═══════════ POR QUÉ NO ES UN `UPDATE … SET materias = ARRAY[...]` ═══════════
 *
 * Porque eso BORRA lo que ya hubiera. Si la cuenta ya tiene macroeconomia y
 * alguien escribe el array entero a mano, la pierde en silencio y el panel se
 * queda sin la materia que sí funcionaba. Aquí se AÑADE el elemento y solo si
 * falta, que es la única forma de que correr esto dos veces no haga daño.
 *
 * Es reversible de una línea, y queda escrita al final por si hace falta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

begin;

/*
 * Si la cuenta todavía no está en la lista blanca, entra con Contabilidad.
 * Si ya está, no se toca aquí: de eso se encarga el update de abajo, que
 * respeta las materias que ya tenga.
 */
insert into public.docentes (email, nombre, materias, activo)
values ('lugox173@gmail.com', 'Mateo Lugo Duque', array['contabilidad']::text[], true)
on conflict (email) do nothing;

/*
 * Y se le añade Contabilidad conservando lo demás.
 *
 * El `where not (… = any(materias))` hace dos cosas: evita duplicar el
 * elemento y, de paso, convierte esta migración en idempotente — correrla de
 * nuevo no cambia ninguna fila.
 *
 * `activo = true` se fija aquí a propósito: una cuenta desactivada con la
 * materia puesta seguiría sin ver el panel, y el síntoma («le di permiso y no
 * aparece») es de los que cuestan media tarde de diagnóstico.
 */
update public.docentes
   set materias = array_append(materias, 'contabilidad'),
       activo   = true
 where lower(email) = 'lugox173@gmail.com'
   and not ('contabilidad' = any (materias));

commit;

/*
 * ═══════════ PARA DESHACERLO ═══════════
 *
 * update public.docentes
 *    set materias = array_remove(materias, 'contabilidad')
 *  where lower(email) = 'lugox173@gmail.com';
 *
 * No borra ningún dato de ningún estudiante: solo deja de enseñárselos.
 */
