/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0161 — UN PROFESOR NO PUEDE SER UNA CUENTA DE CORREO Y CONTRASEÑA
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199). Sigue a la 0160 (auditoría del 11-nov).
 *
 * La 0160 pidió que el correo del docente estuviera CONFIRMADO. Al revisar el
 * panel de Supabase en vivo apareció que «Confirm email» está apagado: así,
 * Supabase marca como confirmado cualquier correo en el instante del registro,
 * y la 0160 no frenaba a quien se registrara con correo y contraseña usando el
 * correo de un profesor. Ese mismo día se apagó el registro por correo en el
 * panel (el sitio solo entra con Google), y esta migración lo deja cerrado
 * también en la base, por si algún día se vuelve a encender: una cuenta cuyo
 * único proveedor es «email» nunca es docente. Google sí confirma que el correo
 * es de quien entra.
 *
 * Revisado en producción antes de escribirla: de las 79 cuentas, 76 son de
 * Google y 3 de correo; ninguna de las 3 está en la lista de docentes. Nadie
 * pierde el acceso.
 * ═══════════════════════════════════════════════════════════════════════════
 */
create or replace function public.es_docente()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.docentes d
      join auth.users u on u.id = auth.uid()
     where lower(d.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       and lower(u.email) = lower(d.email)
       and u.email_confirmed_at is not null
       and not (coalesce(u.raw_app_meta_data ->> 'provider', '') = 'email'
                and not (coalesce(u.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google'))
       and d.activo
  );
$$;
