# AGENTS.md — Cerro Largo 360 / Frontend

> Código revisado: rama `check-point` de `Turismo-Cerro-Largo/frontend` (11/10/2026). La rama solicitada `check-out` no aparece en GitHub. Este documento se basa en lo observado en `check-point`.

## Tecnologías y comandos

SvelteKit 2, Svelte 5 (runes), TypeScript, Vite 8, Tailwind CSS 4, Mapbox GL JS 3, `adapter-node`, pnpm. Backend Hono + Prisma en otro repositorio.

- `pnpm install`: instalar dependencias.
- `pnpm dev`: iniciar Vite (habitualmente puerto 5173).
- `pnpm check`: comprobar Svelte/TypeScript.
- `pnpm build`: compilar para producción.
- `pnpm preview`: previsualizar build.
- `pnpm format`: formatear y modificar archivos.

## Estructura

```text
src/
  hooks.server.ts                 # Hook SSR de sesión
  app.d.ts                        # Tipos App.Locals y PageData
  lib/
    server/backend.ts             # URL privada de API
    types/cuenta.ts               # Tipo de cuenta/rol/estado
    components/
      Home/                       # Componentes página principal
      Mapa/                       # Componentes de mapa
      shared/                     # Navbar y paginador
      svg/                        # Recursos SVG
    hooks/                        # Utilidades reactivas
    styles/                       # Tokens y estilos organizador
  routes/
    +layout.server.ts             # Publica cuenta desde locals
    +layout.svelte                # Layout principal
    +page.svelte                  # Home
    (autenticacion)/
      +layout.server.ts           # Redirige autenticados
      login/+page.svelte
      register/+page.svelte
    (dashboard)/
      +layout.server.ts           # Requiere login y rol
      administrador/              # Dashboard, categorías, ubicaciones
      organizador/                # Dashboard, perfil, eventos
      turista/                    # Dashboard turista
    mapa/+page.svelte
    radios-locales/+page.svelte
  routes/layout.css
static/                            # Recursos, fuentes y SVG
vite.config.ts                     # SvelteKit, Tailwind, proxy en dev
.env.example                       # Ejemplo token Mapbox
```

Los grupos `(autenticacion)` y `(dashboard)` organizan código y **no aparecen en la URL pública**.

## Sesión y autenticación: flujo real

1. El formulario de `/login` llama a `fetch('/api/auth/login', { method: 'POST', body: FormData(...) })`.
2. El backend verifica la contraseña y responde con una cookie **firmada**, `session`, con `httpOnly`, `SameSite=Lax` y duración de siete días. No es JWT ni se administra desde un store de Svelte.
3. En desarrollo, `vite.config.ts` configura `server.proxy['/api']` a `http://localhost:4000`. Así, las solicitudes de `/api` llegan al backend.
4. En **cada request SSR**, `src/hooks.server.ts` establece `event.locals.cuenta = null`. Si llega la cookie `session`, reenvía la cabecera `Cookie` a `GET ${backendUrl()}/api/auth/check` con timeout de 3 segundos.
5. Si el backend responde correctamente, el hook asigna su JSON a `event.locals.cuenta`. Si falla, las páginas públicas siguen funcionando como visitante.
6. `src/routes/+layout.server.ts` devuelve `{ cuenta: locals.cuenta }` para que sea accesible desde las páginas.
7. El layout de `(autenticacion)` redirige una cuenta válida a su panel; el layout de `(dashboard)` exige estar autenticado y comprueba el rol frente al primer segmento de la URL.
8. El layout `/organizador/eventos` comprueba adicionalmente `cuenta.estado === 'APROBADO'` y lanza 403 si no corresponde.
9. Después de login se usa `window.location.assign(destino)` para iniciar una navegación completa y volver a comprobar la sesión en SSR.

**Importante:** `event.locals.cuenta` es información reconstruida para la petición SSR, no una sesión persistente. La identidad persistente se mantiene con la cookie del backend. Los redirects frontend **no reemplazan** la autorización de endpoints en backend.

### Roles y respuesta de `/check`

- `TURISTA` ➜ `/turista`.
- `ORGANIZADOR` ➜ `/organizador`.
- `ADMINISTRADOR` ➜ `/administrador`.

El backend entrega `{ id, rol, nombre }` y agrega `estado` **solo para organizadores**. `src/lib/types/cuenta.ts` lo declara obligatorio para todas las cuentas, lo que conviene corregir con tipo discriminado o campo opcional.

### Logout y OAuth

El backend ofrece `GET|POST /api/auth/logout` para borrar cookie. Después de logout, actualizar la navegación y los datos de layout. Google OAuth comienza en `/api/auth/google`; la rama actual del backend tiene una redirección fija hacia `http://localhost:5173/turista` que debe parametrizarse para producción.

## Comunicación con backend

- URL de API en servidor: `src/lib/server/backend.ts`, `backendUrl()` usa variable privada `API_URL`, con fallback `http://127.0.0.1:4000` en desarrollo.
- En `src/routes/(dashboard)/administrador/categorias/+page.server.ts` se usa además `$env/static/private.API_URL`; evitar distintas fuentes de configuración.
- El proxy `server.proxy` de Vite es **solo para desarrollo**. En producción se necesita un reverse proxy, BFF o esquema de despliegue equivalente para que `/api` y las cookies funcionen.
- Rutas backend confirmadas: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/register-organizador`, `GET /api/auth/google`, `GET /api/auth/check`, `GET|POST /api/auth/logout`, `GET /api/categorias`, `GET /api/categorias/:id`, `POST|PUT|DELETE` de categorías con permisos, `GET|PUT /api/organizador/perfil`.
- No inventar endpoints de eventos, mapas o transporte sin implementarlos en backend.

## Convenciones de implementación

- Escribir componentes `.svelte` con `<script lang="ts">` y runes Svelte 5 (`$state`, `$derived`, etc.), según la configuración actual de Vite.
- Usar `+page.server.ts` / `+layout.server.ts` y `$lib/server` para operaciones con secretos o acceso SSR; nunca importar variables privadas al cliente.
- Usar tipos de ruta generados `./$types`, `App.Locals` y `App.PageData`.
- Mantener los estilos, fuentes, componentes reutilizables y diseño responsive ya existentes; revisar accesibilidad, estados de carga y mensajes de error.
- Mantener Mapbox GL JS con `PUBLIC_MAPBOX_TOKEN`, que es un token público; no exponer credenciales privadas.
- Coordinar contratos de API (verbos, validaciones, cuerpos, errores y respuestas) con backend. Para solicitudes SSR autenticadas, garantizar que se reenvíe la cookie a la API cuando sea necesario.
- Proteger páginas por UX, pero delegar permisos y validación de recursos en backend.

## Configuración local

`.env.example` incluye `PUBLIC_MAPBOX_TOKEN`. Para llamadas internas del servidor se necesita `API_URL` en el entorno adecuado, especialmente en producción. No versionar `.env` ni secretos. En desarrollo, correr backend en puerto 4000 y frontend con `pnpm dev`.

## Checklist para agentes

1. Identificar ruta afectada y si debe ejecutarse en servidor o cliente.
2. Antes de tocar login o roles, inspeccionar `hooks.server.ts`, layouts de autenticación/dashboard, `app.d.ts`, `types/cuenta.ts` y los middlewares del backend.
3. Evitar guardar la cookie o secretos en localStorage o stores Svelte; `httpOnly` debe mantenerse.
4. No asumir que una cuenta organizador está aprobada solo porque tiene rol `ORGANIZADOR`.
5. Para cada pantalla nueva, comprobar contrato real del backend antes de conectar formularios.
6. Reusar componentes visuales existentes y validar desktop/móvil.
7. Ejecutar `pnpm check` y `pnpm build`; comunicar comprobaciones no ejecutadas.

## Riesgos y mejoras sugeridas

- `Cuenta.estado` obligatorio en tipos pero ausente en la respuesta para turista/admin.
- Petición de validación al backend en cada request SSR: revisar latencia y posibles errores temporales.
- Uso mixto de `backendUrl()` y variable estática `API_URL`.
- Proxy `/api` de Vite no funciona automáticamente tras desplegar `adapter-node`.
- Redirecciones de layout no autorizan mutaciones de API y no sustituyen revisión de propiedad de datos.
- Revisar CORS, envío de cookies y protección CSRF en despliegues con dominios distintos.
