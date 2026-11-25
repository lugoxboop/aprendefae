/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0175 — LA CUENTA administrador.planck@gmail.com VE LO MISMO QUE MATEO
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199): escribe en public.docentes.
 *
 * Mateo pidió (25-nov) que la cuenta «Lugo - Rios» tenga su mismo acceso:
 * panel docente y todo lo que él ve. En el sitio ese acceso es UNA cosa: una
 * fila activa en la lista blanca public.docentes, con las materias que acota
 * lo que se ve. Así que se copia la fila de Mateo tal como esté en producción
 * (sus materias de hoy, no una lista escrita aquí que se quede vieja).
 *
 * Si la cuenta todavía no se ha registrado no importa: es_docente() cruza por
 * correo al entrar, así que el acceso aparece en cuanto entre con Google.
 * (Con correo y contraseña no, por la 0161: un profesor entra con Google.)
 *
 * También se marca como cuenta de prueba, igual que la de Mateo (0020), para
 * que lo que juegue no entre en los promedios de la clase. Si el perfil aún no
 * existe, ese update no hace nada y no rompe.
 *
 * No toca ningún dato de estudiantes. Idempotente.
 * ═══════════════════════════════════════════════════════════════════════════
 */
begin;

insert into public.docentes (email, nombre, materias, activo)
select 'administrador.planck@gmail.com', 'Lugo - Rios',
       coalesce((select d.materias from public.docentes d
                  where lower(d.email) = 'lugox173@gmail.com'),
                array['macroeconomia', 'contabilidad']::text[]),
       true
on conflict (email) do update
   set materias = excluded.materias,
       activo   = true;

update public.profiles p
   set es_prueba = true
  from auth.users u
 where u.id = p.user_id
   and lower(u.email) = 'administrador.planck@gmail.com'
   and not p.es_prueba;

commit;

/*
 * ═══════════ PARA DESHACERLO ═══════════
 *
 * update public.docentes set activo = false
 *  where lower(email) = 'administrador.planck@gmail.com';
 */
