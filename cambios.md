* `src/hooks.server.ts`
    - consulta la sesion al backend y guarda la cuenta en locals
* `src/app.d.ts`
    - type de locals y page data con la cuenta
* `src/lib/types/cuenta.ts`
    - type de la cuenta (id, rol, nombre)
* `src/routes/+layout.server.ts`
    - pasa la cuenta a los componentes
* `src/routes/(dashboard)/+layout.server.ts`
    - si no hay sesion en el dashboard redirige a /login
* `src/routes/(autenticacion)/+layout.server.ts`
    - si ya hay sesion redirige al dashboard segun el rol