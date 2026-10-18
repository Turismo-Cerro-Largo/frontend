# Correspondencia con Documento-1.pdf y lista del panel

Estado al 10/10/2026. Implementación del panel administrador; no reemplaza las
funciones públicas ni las pantallas propias del organizador.

| Referencia | Implementación | Verificación y límites |
| --- | --- | --- |
| RF-48 | Alojamiento, Restaurantes, Parques/Naturaleza, Cultura y Eventos Sociales; alta y edición | Categorías reales, sin clasificación adicional Turismo/Eventos. |
| Actores y permisos; imagen | Sesión administrativa y rol validado por backend; usuarios en consulta | Login probado. Edición, bloqueo, eliminación y cambios de rol de usuarios pendientes de definición. |
| RF-110 a RF-114; imagen | Crear, editar, ocultar/mostrar y eliminar lugares con categoría y coordenadas | Usuario verificó alta, edición, visibilidad y persistencia. Falta integración con búsquedas, fichas y mapa públicos. |
| RF-115 a RF-118 | Subir, reemplazar y eliminar imágenes/videos asociados a lugares/eventos | Usuario verificó carga de imágenes y persistencia; falta probar reemplazo, eliminación y videos en navegador. |
| RF-119 a RF-124 | Alta administrativa de eventos publicados, edición, eliminación y calendario | Usuario verificó alta, edición, fechas, calendario e imágenes. No exige borrador previo. |
| RF-138 a RF-141 | Aprobar/rechazar eventos pendientes y guardar motivo opcional | Persistencia y rechazo probados por API; falta recorrido completo desde pantalla de organizador hasta página pública. |
| RF-152 a RF-160 | Datos de organización, RUT/contacto, documentos privados y decisiones | Aprobación y permisos probados por API; documentos privados y revisión completa pendientes de prueba manual. |
| RF-91 y RF-92; imagen | Consultar, ocultar/mostrar y eliminar reseñas | No altera puntuación. API pública promedia solo reseñas publicadas: confirmar política con equipo. |
| RF-97 a RF-103; imagen | Crear/editar empresas y horarios, servicios departamentales/interdepartamentales y llegada al día siguiente | Conectado al backend; formularios y presentación pública pendientes de prueba completa. |
| Imagen | Estadísticas derivadas de registros reales | Se cargan desde MySQL, sin cifras de ejemplo en /administrador. |
| RNF-07 a RNF-15 | Formularios etiquetados, mensajes, confirmaciones y diseño adaptable | Falta revisión completa de accesibilidad y dispositivos. |

Los límites de longitud, formatos y tamaño de archivos (20 MB) son decisiones
técnicas que debe revisar el equipo, no requisitos atribuidos al documento.
RF-141 y RF-160 no obligan a indicar motivo de rechazo.

La migración inicial del backend está limitada a una base nueva de pruebas.
Su conciliación con las migraciones del equipo bloquea el merge, no la revisión
de este trabajo en un pull request en borrador.
