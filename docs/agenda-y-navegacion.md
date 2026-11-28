# Agenda pública y navegación

- El inicio conserva las tres imágenes originales, sus tamaños, orden y desplazamiento móvil. Únicamente se agregan enlaces a la información de cada afiche; no hay tarjetas ni textos adicionales. Dos enlaces estables resuelven el evento publicado por título y fecha sin depender de IDs locales; Carnaval conserva su página informativa sin fecha confirmada.
- `/eventos`: calendario mensual con selección de día, búsqueda por título/lugar y rango de viaje, páginas de 12 resultados. Horario America/Montevideo. Carga hasta 1000 entradas para los indicadores mensuales y avisa si alcanza ese límite; la lista sigue paginable.
- `/planificador?desde=...&hasta=...` conserva filtros y lleva a la agenda. No pretende generar itinerarios ni reservar viajes.
- Carnaval queda en `/eventos/carnaval-melo-2026`, con fecha pendiente. El lanzamiento de septiembre se consulta en el archivo de ese mes. No se presentan como próximos.
- Las fichas de eventos muestran ubicación exacta si hay coordenadas; de lo contrario ofrecen buscar la dirección indicada en el mapa, sin inventar un marcador.
- `/localidades` enumera los destinos del inicio; sus enlaces llevan a `/lugares?localidad=...`, filtrando localidad exacta y permitiendo combinar una búsqueda por nombre.
- Buscador móvil GET funcional; en escritorio la lupa lleva al listado buscable. Categorías conservan sus páginas y los eventos enlazan a la ficha compartida.
- Galerías en fichas de lugares: imagen ampliable y video manual con controles, sin reproducción automática. Créditos en la ficha. Ver backend/docs/contenido-turista-demo.md para fuentes y carga de datos.

Pendiente de contenido: fecha/lugar de Carnaval, horarios/precio del encuentro de motos y coordenadas verificadas. Los registros y archivos de prueba no viajan al hacer push del código; el equipo debe cargar contenido y disponer de almacenamiento persistente para el despliegue.

## Menú, transporte y mapa

El menú y el pie usan Destinos, Mapa, Horarios de ómnibus y Eventos (Radios locales también permanece en el menú). El planificador del inicio conserva la búsqueda por fechas hacia Eventos. Entrar directamente a Eventos muestra el mes actual.

Horarios de ómnibus consulta el backend, filtra origen/destino y muestra empresa, salida, llegada, días y precio/contacto si existen. Los seis horarios de demostración llevan aviso visible.

Mapa ahora usa los lugares publicados del backend, búsqueda por nombre/localidad/categoría, marcadores agrupados cuando comparten coordenadas y enlaces a las fichas; conserva controles 2D/3D. Sustituye en esta ruta las fichas fijas de ejemplo. Si falla Mapbox, la lista continúa disponible.

Se encontró un token público Mapbox en el .env del frontend original y se comprobó HTTP 200 del estilo standard y carga visual en navegador. Se copió únicamente al .env ignorado de esta copia de trabajo. No se incorpora el valor a Git ni a esta documentación. Configurar PUBLIC_MAPBOX_TOKEN en el entorno del equipo/despliegue.
