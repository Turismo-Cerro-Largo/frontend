# Frontend Vercel + backend Cloudflare (rama cloud)

1. Importar el repositorio frontend en Vercel y seleccionar cloud como Production Branch. Framework: SvelteKit; instalar con pnpm install --frozen-lockfile y compilar con pnpm build. Node.js 22 o superior compatible con Vite.
2. Agregar API_URL=https://cerro-largo-api.baa4ts.workers.dev (privada, sin /api) y PUBLIC_MAPBOX_TOKEN con el token público de Mapbox. No agregar claves de Supabase al frontend. Las variables se configuran también en Preview si se utiliza ese entorno.
3. Desplegar para obtener el dominio estable de producción.
4. En backend/wrangler.jsonc, usar ese origen HTTPS exacto, sin barra final, tanto en APP_PUBLIC_URL como en APP_ORIGINS. Para varios dominios, APP_ORIGINS admite una lista separada por comas, únicamente de dominios propios autorizados. No usar *.vercel.app ni reflejar cualquier Origin.
5. Ejecutar pnpm deploy en backend. No hace falta reconstruir el frontend cuando se cambia sólo la lista del backend.
6. Probar registro/login, refrescar una página privada, logout e imágenes desde el dominio Vercel. La URL temporal de cada Preview debe autorizarse explícitamente si se desea probar mutaciones allí.

vercel.json reenvía /api/:path* al Worker conservando /api. El navegador usa rutas relativas y la cookie HttpOnly, Secure, SameSite=Lax queda en el dominio del frontend, sin Domain fijo. SSR consulta la misma API usando API_URL y reenvía la cookie. Se conserva la verificación del Origin original en el backend; las mutaciones no funcionarán hasta completar el paso 4.

El proxy es una reescritura externa de Vercel, no una función SvelteKit que reciba los archivos. Evita aplicar a las subidas el límite de cuerpo de las funciones de Vercel. Los límites de validación siguen en el backend.

Desarrollo: usar el backend local en API_URL y configurar APP_ORIGINS de ese backend con http://localhost:5173 y http://127.0.0.1:5173. Vite mantiene el proxy /api, sin reemplazar el Origin del navegador. No hace falta permitir localhost en producción.

Validar con pnpm check y pnpm build. El deploy público requiere comprobar las reescrituras y cookies reales; el build local no confirma la configuración del panel Vercel.

Referencias: https://vercel.com/docs/routing/rewrites ; https://vercel.com/docs/frameworks/full-stack/sveltekit

Validación local: revisión Svelte/TypeScript sin errores; compilación de la aplicación completada. El empaquetado de adapter-vercel requiere enlaces simbólicos y en este Windows devuelve EPERM; comprobar el empaquetado completo en Vercel (Linux).
