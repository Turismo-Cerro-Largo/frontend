# Cerro Largo 360 · Frontend

Sitio de turismo de Cerro Largo hecho con SvelteKit.

## Desarrollo local

1. Arrancá el backend en `http://localhost:4000`.
2. Copiá `.env.example` a `.env`. Configurá `API_URL` con el origen del backend, sin `/api`. Para el mapa, completá `PUBLIC_MAPBOX_TOKEN` con un token público.
3. Instalá las dependencias y arrancá el frontend.

```bash
pnpm install
pnpm dev
```

Abrí `http://localhost:5173`. Vite reenvía las peticiones de `/api` al backend.

Usá `pnpm check` para revisar el código y `pnpm build` para compilar.

## Organización de las rutas

SvelteKit crea las páginas a partir de `src/routes/`. Por ejemplo, `radios-locales/+page.svelte` corresponde a `/radios-locales`. El grupo `(autenticacion)` reúne `/login` y `/register`, y `(dashboard)` agrupa los paneles de administrador, organizador y turista. Los nombres entre paréntesis no aparecen en la URL.

`+page.server.ts` carga datos en el servidor y `+layout.svelte` comparte la estructura entre páginas.
