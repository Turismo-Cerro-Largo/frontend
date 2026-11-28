# Entrega SANTANA — 19/10/2026

Se integró main d0f12a7 conservando el inicio y sus afiches, el menú de cuenta del turista y los módulos del equipo. Las categorías usan fichas y recursos del backend; `/transporte` redirige a `/horarios-omnibus` y ambos llevan al mismo servicio de datos.

El login incluye «¿Olvidaste tu contraseña?». `/recuperar-contrasena` solicita el correo y `/restablecer-contrasena` permite elegir una contraseña mediante un enlace de un solo uso. Las páginas funcionan aunque exista una sesión anterior, usan `no-store` y `no-referrer`, y no incluyen el token en solicitudes GET. El flujo del backend se documenta en `backend/docs/entrega-santana.md`.

El proxy `/api/[...path]` ahora sirve tanto en desarrollo como en la compilación Node y usa `API_URL`; conserva cookies y Origin sin aceptar un destino proporcionado por el cliente. Se eliminó el proxy Vite fijo a localhost:4000 que apuntaba a otra instancia durante las pruebas.

Configurar `API_URL`, `PUBLIC_MAPBOX_TOKEN` y el origen público de despliegue. No subir `.env`, tokens ni credenciales. La validación local usa API 4001 y web 5174. El token Mapbox sigue en configuración local ignorada.

Dependencias transitivas `cookie` y `postcss-selector-parser` fijadas a versiones corregidas mediante overrides en pnpm-workspace.yaml; conservar pnpm-lock.yaml. Se incluyen también overrides de npm para quienes lo usen, pero pnpm es el gestor del proyecto.

Comprobaciones: `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, `pnpm audit`. Probar ingreso, recuperación, perfil/foto, favoritos, valoración pendiente y eliminación, moderación, calendario, lugares, mapa y horarios con el backend de la misma rama. Los enlaces reales de correo quedan pendientes de configurar SMTP con el equipo.

No hubo push ni merge remoto. Los commits están preparados localmente para revisar y subir SANTANA en ambos repositorios. Publicar las dos ramas no modifica main; los PR deben describir la dependencia entre frontend/backend y la coordinación de migraciones.

## Resultado de la verificación local

66 pruebas de integración aprobadas (autenticación, recuperación, permisos, catálogo y turista). Backend compila; frontend compila y Svelte informa 0 errores y 0 advertencias. Auditorías npm y pnpm: 0 vulnerabilidades conocidas en ambas resoluciones verificadas. Lockfiles validados con instalación frozen en modo lockfile-only.

Para ejecutar la compilación con adapter-node, configurar ORIGIN con el origen público y BODY_SIZE_LIMIT=20M (los endpoints mantienen límites menores propios). Arranque: `node build/index.js` con las variables de entorno cargadas.
