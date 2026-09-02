-- Cierra nickname_disponible a los visitantes sin sesión.
--
-- Por qué hace falta además del `revoke ... from public` de 0001: Supabase
-- define privilegios por defecto que conceden EXECUTE sobre las funciones
-- nuevas del esquema public a los roles anon y authenticated. Revocar a PUBLIC
-- no toca esa concesión explícita a anon, así que la función quedaba abierta y
-- un anónimo podía averiguar qué apodos existen probando uno por uno.
--
-- Solo la necesita quien ya inició sesión y está eligiendo apodo.

revoke execute on function public.nickname_disponible(text) from anon;
grant  execute on function public.nickname_disponible(text) to authenticated;
