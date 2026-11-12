# Cerro Largo 360 · Frontend

## Alcance y desarrollo local

Esta guía describe la rama `loca`. El sitio usa SvelteKit, Svelte 5 con runes, TypeScript, Vite, Tailwind CSS y Mapbox GL JS. La API vive en el repositorio hermano.

- Arrancá el backend en el puerto 4000. Copiá `.env.example` a `.env`, instalá con `pnpm install` y ejecutá `pnpm dev`. Vite sirve el sitio normalmente en el puerto 5173.
- `API_URL` es el origen privado del backend, sin `/api`. `PUBLIC_MAPBOX_TOKEN` habilita el mapa y `PUBLIC_TURNSTILE_SITE_KEY` configura el captcha. Los secretos de Google, Gmail y Turnstile quedan en el backend.
- `pnpm check` sincroniza los tipos de ruta y ejecuta Svelte Check. `pnpm build` compila el sitio y `pnpm preview` previsualiza el resultado. `pnpm format` escribe en `src/`.

## Organización de rutas

| Área | Rutas y archivos |
| --- | --- |
| Inicio y navegación | `src/routes/+page.server.ts` y `+page.svelte` forman la portada. `+layout.server.ts` publica la cuenta y `+layout.svelte` monta el reproductor global. |
| Cuenta | `(autenticacion)/` contiene `/login`, `/register` y `/verificar-email`. La recuperación usa `/recuperar-contrasena` y `/restablecer-contrasena`. |
| Turismo público | `/categoria`, `/localidades`, `/lugares`, `/eventos`, `/mapa` y `/planificador` reúnen catálogo, fichas y mapa. |
| Transporte y radios | `/transporte`, `/horarios-omnibus` y `/radios-locales`. |
| Administración | `(dashboard)/administrador/` contiene resumen, categorías, comentarios, eventos, localidades, organizadores, transporte, ubicaciones, usuarios y valoraciones. |
| Organizador | `(dashboard)/organizador/` contiene el panel, el perfil y la gestión de eventos. |
| Turista | `(dashboard)/turista/` contiene perfil, explorar, favoritos y valoraciones. |

Los grupos entre paréntesis organizan archivos y no forman parte de la URL. Usá `+page.server.ts` y `+layout.server.ts` para cargas privadas y los tipos generados `./$types`. `src/lib/components/` reúne componentes por función, `src/lib/server/` contiene módulos exclusivos del servidor, `src/lib/types/` tipos compartidos y `static/` recursos públicos.

## Comunicación con la API y sesión

- Los formularios del navegador llaman a rutas relativas `/api/...`. En desarrollo, `vite.config.ts` las reenvía al backend usando `API_URL`. En producción, el despliegue debe enrutar esas peticiones al backend. El proxy de Vite es de desarrollo.
- Desde SSR, usá `backendUrl()` de `src/lib/server/backend.ts` y el `fetch` de la carga cuando corresponda. Reenviá la cookie en las consultas autenticadas al backend.
- `hooks.server.ts` inicia `event.locals.cuenta` en `null`. Si llega la cookie `session`, consulta `/api/auth/check` y deja la respuesta autenticada fuera de caché. El layout raíz pasa la cuenta a las páginas.
- El layout de autenticación redirige a usuarios con sesión. El de dashboard valida el rol antes de mostrar el panel. Los layouts no sustituyen la autorización del backend. La cookie de sesión es `HttpOnly` y la emite el backend.
- Login y registros reutilizan `Turnstile.svelte`. El registro por correo lleva a `/verificar-email`, que confirma o reenvía el código. El turista inicia sesión después de verificar. El organizador también necesita aprobación.
- La solicitud de recuperación usa el mismo widget con la acción `recuperar-contrasena` y envía JSON con `email` y `turnstileToken`. La pantalla de restablecimiento obtiene el token del fragmento del enlace y envía la contraseña nueva. Google OAuth comienza en `/api/auth/google`.

## Catálogo, mapas y radios

- Conservá las cargas SSR del catálogo cuando los datos formen parte de la página pública o su SEO. Mantené títulos, descripciones y enlaces de navegación en las rutas públicas.
- El detalle de lugar integra Mapbox para mostrar la ubicación. La acción de cómo llegar abre Google Maps. Mantené el orden de coordenadas que espera cada integración.
- La página de radios carga emisoras desde `src/lib/server/radios.ts`. El módulo consulta Radio Browser, filtra las emisoras de Cerro Largo y usa caché temporal. Las emisoras y los errores de reproducción se manejan en la página y el reproductor compartido.
- `src/lib/radios/` y `RadioFlotante.svelte` manejan el estado y los controles del reproductor. Mantené el audio en el layout raíz para que navegar entre páginas no corte la reproducción.

## Estilo, comprobaciones y despliegue

- Usá runes de Svelte 5, componentes compartidos, estilos existentes y etiquetas accesibles. Mantené estados de carga, error y resultados vacíos en formularios y listados. Comprobá móvil y escritorio en cambios de interfaz.
- Confirmá contratos, formatos de formularios y permisos con el backend antes de editar integraciones. Para cambios del frontend ejecutá `pnpm check` y `pnpm build`. Probá el flujo desde su página pública o panel.
- `loca` configura `adapter-auto` en `vite.config.ts`. La rama `cloud` incluye `vercel.json` para Vercel y un rewrite de `/api` al Worker. Al cambiar el dominio, revisá el rewrite, `API_URL`, los orígenes permitidos del backend y el callback de OAuth.
- Consultá `docs/` para el contexto de los paneles, navegación y flujos de turista. La skill `svelte-code-writer` está registrada en `skills-lock.json`.
