# Panel de administración

## Integración local con MySQL — 08/10/2026

La ruta /administrador carga datos reales del backend y guarda las operaciones
en cerrolargo360_admin_dev. La base turismo existente no fue modificada.
Hay sesión firmada con vencimiento y comprobación del rol en la base para cada
operación administrativa. /vista-panel-admin sigue siendo una demostración
exclusiva de desarrollo; no debe usarse para validar persistencia.

Conectados: categorías, lugares, eventos, decisiones de revisión de eventos y
organizadores, usuarios en consulta, moderación de reseñas, recursos multimedia,
empresas y horarios. Los documentos de identidad se consultan mediante una ruta
exclusiva para administradores. El motivo de rechazo se guarda y es opcional.
La carga de archivos admite JPG/PNG/WebP y MP4/WebM hasta 20 MB, con validación
de formato en el servidor. Este límite técnico debe confirmarse con el equipo.

Validación realizada: 22 comprobaciones contra MySQL (sesión, permisos, origen,
persistencia, visibilidad pública, decisiones y archivo inválido); renderizado
de las 11 secciones con sesión real; TypeScript backend correcto; Svelte sin
errores ni advertencias y compilación de producción correcta. La prueba SSR
conecta ambos servidores en proceso; no sustituye una prueba manual de navegador.
Los registros temporales de las pruebas se eliminan al terminar.

### Pendientes antes de declarar la entrega completa

- Completar las pruebas manuales de formularios restantes, reemplazo/eliminación de archivos, videos y documentos privados.
- Conectar las páginas públicas y el flujo visual del organizador a las APIs
  disponibles; comprobar el recorrido completo solicitud → aprobación → publicación.
- Acordar operaciones sobre usuarios y efecto de moderación en promedios. La API
  pública calcula actualmente promedios usando solo comentarios publicados.
- Revisar con el equipo la migración para bases existentes. La migración inicial
  incluida se aplicó solamente a la base nueva; no ejecutarla sobre turismo sin
  comparar el esquema y acordar una migración incremental.
- Validar despliegue, almacenamiento persistente de archivos y paginación para
  volúmenes mayores. Actualmente el panel carga todos los registros.

Las decisiones funcionales pendientes no se consideran aprobadas por el hecho
de estar implementadas. La entrega se prepara en ramas separadas y pull requests en borrador; el merge requiere conciliar la migración con el equipo.

## Ejecutar localmente

1. En backend: pnpm dev. La API escucha en el puerto 4000.
2. En frontend: configurar API_URL=http://127.0.0.1:4000 y el token Mapbox
   del proyecto; ejecutar pnpm dev.
3. Abrir http://localhost:5173/login. La cuenta local está en
   backend/.admin-local-credentials.json, ignorado por Git.
4. Tras ingresar como administrador se abre /administrador.

La base nueva tiene la cuenta local y las cinco categorías de RF-48; el resto
de las listas comienza vacío. No contiene registros ficticios de demostración.

Backend: pnpm admin:test repite las pruebas exclusivamente en la base local
cerrolargo360_admin_dev. pnpm admin:seed crea la cuenta si no existe y conserva
las credenciales existentes. No compartir ni versionar .env o las credenciales.

## Pruebas confirmadas por el usuario — 10/10/2026

Login administrativo; alta y edición de lugares; ocultar/mostrar y persistencia
al recargar; imágenes asociadas; alta y edición de eventos administrativos,
cambio de fechas, calendario e imágenes del evento. El usuario informó que ambos
recorridos del 1 al 6 terminaron sin errores. No se atribuye esta prueba al panel
del organizador ni a las páginas públicas.
