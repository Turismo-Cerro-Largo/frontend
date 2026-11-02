# Revisión de conexiones del turista — 17/10/2026

> Registro histórico. La situación actual y las correcciones de estos pendientes están en [entrega-santana.md](entrega-santana.md) y [agenda-y-navegacion.md](agenda-y-navegacion.md).

## Base y procedencia

Trabajo local en SANTANA, basado en main integrado: frontend afbaf85 y backend 8f2a2e4. Ambos main seguían sin cambios al consultar GitHub.

Se reutilizaron selectivamente las categorías públicas de JULIO/frontend a17108b y la consulta de ubicaciones de JULIO/backend 1f90f42. No se fusionó JULIO completo: su router contiene marcadores de conflicto e incorpora otra migración inicial que recrea tablas. No se incorporaron archivos privados ni imágenes de prueba de esa rama. check-point contiene avances separados de administración y no sustituye la base main acordada.

## Conectado en esta revisión

- Menú de cuenta en la cabecera pública: nombre, foto o inicial, perfil, favoritos, valoraciones y cierre de sesión. Opciones específicas para administrador/organizador conservadas.
- Se retiró la presentación de dashboard del turista. Sus formularios reutilizan la cabecera y pie públicos. /turista redirige al inicio; /turista/explorar a /lugares.
- Login y registro de turistas regresan al inicio. El perfil conserva correo, cédula y rol fuera de los campos editables.
- /lugares ofrece búsqueda pública por nombre/localidad y paginación. Los detalles existentes conservan favoritos y valoraciones moderadas.
- Categorías de inicio conectadas con GET /api/ubicaciones?categoria=...; solo PUBLICADO. Las tarjetas de lugares enlazan a /lugares/:id.
- GET /api/eventos público devuelve únicamente PUBLICADO, con límite validado y selección explícita de campos.
- GET /api/recursos/:id sirve imágenes registradas de lugares/eventos publicados, desde rutas locales permitidas. No copia imágenes desde otras bases ni publica documentos privados.
- Navbar de fondo sólido en páginas internas. Enlaces Destinos e Intereses reutilizan la búsqueda y las categorías. La lupa de escritorio lleva a la búsqueda.

## Pendientes públicos identificados

- Mapa Mapbox y su ficha/comentarios todavía usan datos fijos; conectar a lugares publicados y disponer de token válido.
- Próximos eventos del inicio todavía contiene tarjetas de ejemplo. Reutilizar la API pública nueva para fechas y datos reales.
- Planificador y enlaces a localidades todavía necesitan sus rutas y filtros. Radios locales, contacto y textos legales requieren contenido/rutas acordados con el equipo.
- Buscador móvil de la navegación original aún requiere conexión.
- Fotografías históricas deben existir en el almacenamiento configurado. Esta revisión admite recursos /publicos/nombre.ext y medios UUID del organizador; otros formatos requieren revisar el almacenamiento antes de habilitarlos.
- Revisar el acceso público previo a /api/organizador/eventos/media/:nombre con el responsable del organizador: su política actual es independiente del nuevo endpoint público.
- Coordinar la migración incremental de localidad/foto del perfil con la base del equipo antes del despliegue. No ejecutar migraciones iniciales duplicadas.

## Validación

- Backend compila con TypeScript.
- 30 pruebas de integración del turista y conexiones públicas pasan con MySQL en base local aislada, nunca sobre turismo.
- Svelte check: cero errores; advertencias preexistentes del formulario del organizador.
- Navegación manual: inicio autenticado, menú, perfil y favoritos; cabecera móvil de 390 px sin desbordamiento horizontal.
- La suite antigua de autenticación tenía cuatro casos fallidos por datos incompatibles con las validaciones actuales; no equivalen a cobertura total aprobada.

No se realizó push ni merge en esta revisión. La base de pruebas y sus credenciales no forman parte de Git.

## Limpieza posterior del dashboard anterior

Se eliminaron las reglas sin uso de barra lateral, resumen estadístico, cabecera privada y disposición del dashboard, los iconos exclusivos del resumen y el tipo Resumen. Se retiró GET /api/turista/resumen, sin consumidores. Se conservan los formularios funcionales de cuenta, los estilos compartidos con lugares/moderación y las redirecciones de /turista y /turista/explorar para enlaces antiguos. Las cuentas de prueba viven exclusivamente en la base local aislada; ninguna credencial se incluye en este repositorio.

## Ajustes de cuenta y valoraciones — 18/10/2026

- El autor puede eliminar su valoración solo en PENDIENTE_REVISION, con confirmación en la interfaz y condición atómica de autor/estado en el backend.
- Nacimiento y género son visibles y se pueden completar individualmente solo cuando están vacíos. Una vez registrados quedan bloqueados, incluso ante solicitudes concurrentes. Se validan fechas reales entre 1900 y hoy.
- Las estrellas previsualizan y animan todas las posiciones hasta el cursor; al salir recuperan la selección. El contorno reemplaza el fondo rectangular y se respeta la preferencia de movimiento reducido.
- 38 pruebas de integración aprobadas en la base aislada. Svelte sin errores; conserva las 15 advertencias anteriores del organizador.
