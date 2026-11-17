-- El UPDATE de users está limitado por columna: el usuario puede editar su ubicación.
grant update (lat, lng, referencias) on public.users to authenticated;
