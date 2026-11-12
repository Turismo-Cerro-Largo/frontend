# Cerro Largo 360 · Frontend

Cerro Largo 360 es un portal para explorar el departamento. En el sitio se pueden consultar lugares y eventos, navegar el mapa, ver horarios de ómnibus y escuchar radios locales. También incluye paneles para turistas, organizadores y administradores.

Este repositorio contiene el sitio hecho con SvelteKit, Svelte 5, TypeScript y Tailwind CSS. Las páginas consultan la API del repositorio backend. Los mapas usan Mapbox y el reproductor de radios sigue activo al navegar entre páginas.

## Desarrollo local

1. Iniciá el backend en `http://localhost:4000`.
2. Copiá [`.env.example`](.env.example) a `.env`. Indicá el origen del backend en `API_URL`, sin `/api`. Completá `PUBLIC_MAPBOX_TOKEN` para el mapa y `PUBLIC_TURNSTILE_SITE_KEY` para los formularios protegidos.

```sh
pnpm install
pnpm dev
```

Abrí `http://localhost:5173`. En desarrollo, Vite reenvía las solicitudes de `/api` al backend. La rama `cloud` incluye la configuración para desplegar en Vercel y reenviar esas rutas al Worker.

`pnpm check` revisa los tipos y los componentes. `pnpm build` compila el sitio.

## Organización de las rutas

SvelteKit define las páginas en [`src/routes/`](src/routes/). Los nombres de grupo entre paréntesis no forman parte de la URL.

| Carpeta | Qué contiene |
| --- | --- |
| `(autenticacion)/` | Inicio de sesión, registro y verificación de correo. |
| `recuperar-contrasena/` y `restablecer-contrasena/` | Solicitud de un enlace y cambio de contraseña. |
| `(dashboard)/` | Paneles de turista, organizador y administrador. |
| `categoria/`, `localidades/`, `lugares/`, `eventos/`, `mapa/` y `planificador/` | Catálogo y herramientas para explorar el departamento. |
| `transporte/`, `horarios-omnibus/` y `radios-locales/` | Transporte y radios del departamento. |

Los archivos `+page.server.ts` cargan datos en el servidor y `+layout.svelte` comparte estructura entre páginas. Para detalles de trabajo, consultá [`AGENTS.md`](AGENTS.md).
