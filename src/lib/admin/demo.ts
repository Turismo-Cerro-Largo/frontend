export type DemoRow = { id: string; nombre: string; detalle: string; estado: string; extra: string };
export type AdminSection = {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    columnas: string[];
    accion?: string;
    filas: DemoRow[];
};

// Ejemplos de interfaz: no representan registros ni estadísticas de la base de datos.
export const sections: AdminSection[] = [
    {
        id: 'lugares',
        nombre: 'Lugares turísticos',
        icono: 'pin',
        descripcion: 'Organizá los lugares que los visitantes pueden descubrir en Cerro Largo.',
        columnas: ['Lugar', 'Categoría', 'Localidad'],
        accion: 'Crear lugar',
        filas: [
            { id: 'L-01', nombre: 'Mirador del Cerro', detalle: 'Ejemplo de lugar turístico', estado: 'Publicado', extra: 'Melo' },
            { id: 'L-02', nombre: 'Sendero del Arroyo', detalle: 'Ejemplo de espacio natural', estado: 'Oculto', extra: 'Río Branco' },
        ],
    },
    {
        id: 'categorias',
        nombre: 'Categorías',
        icono: 'grid',
        descripcion: 'Administrá las categorías de la plataforma turística.',
        columnas: ['Categoría', 'Descripción'],
        accion: 'Crear categoría',
        filas: [
            { id: 'C-04', nombre: 'Alojamiento', detalle: 'Establecimientos de alojamiento en Cerro Largo.', estado: 'Activa', extra: '' },
            { id: 'C-03', nombre: 'Restaurantes', detalle: 'Restaurantes y establecimientos gastronómicos.', estado: 'Activa', extra: '' },
            { id: 'C-01', nombre: 'Parques/Naturaleza', detalle: 'Parques, playas, ríos, lagunas, sierras, senderos y otros atractivos naturales.', estado: 'Activa', extra: '' },
            { id: 'C-02', nombre: 'Cultura', detalle: 'Museos, teatros, monumentos, centros culturales y sitios históricos.', estado: 'Activa', extra: '' },
            { id: 'C-05', nombre: 'Eventos Sociales', detalle: 'Eventos actuales y próximos realizados en Cerro Largo.', estado: 'Activa', extra: '' },
        ],
    },
    {
        id: 'eventos',
        nombre: 'Eventos',
        icono: 'calendar',
        descripcion: 'Consultá los eventos y su estado de publicación.',
        columnas: ['Evento', 'Organizador', 'Fecha'],
        accion: 'Crear evento',
        filas: [
            { id: 'E-01', nombre: 'Encuentro de sabores locales', detalle: 'Organización de ejemplo A', estado: 'Pendiente de revisión', extra: '24 oct. 2026' },
            { id: 'E-02', nombre: 'Paseo cultural por Melo', detalle: 'Organización de ejemplo B', estado: 'Publicado', extra: '31 oct. 2026' },
            { id: 'E-03', nombre: 'Feria de artesanías', detalle: 'Organización de ejemplo A', estado: 'Pendiente de revisión', extra: '07 nov. 2026' },
            { id: 'E-04', nombre: 'Recorrido al atardecer', detalle: 'Organización de ejemplo C', estado: 'Rechazado', extra: '14 nov. 2026' },
        ],
    },
    {
        id: 'organizadores',
        nombre: 'Organizadores',
        icono: 'people',
        descripcion: 'Revisá las solicitudes de organizaciones que quieren publicar eventos.',
        columnas: ['Organización', 'Solicitud', 'Localidad'],
        filas: [
            { id: 'O-01', nombre: 'Organización de ejemplo A', detalle: 'Solicitud para publicar eventos culturales', estado: 'Pendiente de verificación', extra: 'Melo' },
            { id: 'O-02', nombre: 'Organización de ejemplo B', detalle: 'Solicitud para publicar recorridos turísticos', estado: 'Aprobado', extra: 'Río Branco' },
        ],
    },
    {
        id: 'usuarios',
        nombre: 'Usuarios',
        icono: 'people',
        descripcion: 'Consultá los usuarios registrados y sus roles de acceso.',
        columnas: ['Usuario', 'Correo', 'Rol'],
        filas: [
            { id: 'U-01', nombre: 'Turista de ejemplo', detalle: 'turista@example.com', estado: 'Activo', extra: 'Turista' },
            { id: 'U-02', nombre: 'Administrador de ejemplo', detalle: 'admin@example.com', estado: 'Activo', extra: 'Administrador' },
        ],
    },
    {
        id: 'comentarios',
        nombre: 'Comentarios y reseñas',
        icono: 'message',
        descripcion: 'Revisá las opiniones y calificaciones de los visitantes.',
        columnas: ['Reseña', 'Lugar', 'Calificación'],
        filas: [
            { id: 'R-01', nombre: 'Un lindo lugar para conocer', detalle: 'Mirador del Cerro · Ejemplo', estado: 'Pendiente de revisión', extra: '4 de 5' },
            { id: 'R-02', nombre: 'Calificación sin comentario', detalle: 'Sendero del Arroyo · Ejemplo', estado: 'Publicado', extra: '5 de 5' },
        ],
    },
    {
        id: 'multimedia',
        nombre: 'Imágenes y videos',
        icono: 'image',
        descripcion: 'Organizá los recursos visuales asociados a los lugares turísticos.',
        columnas: ['Recurso', 'Lugar', 'Formato'],
        accion: 'Agregar recurso',
        filas: [
            { id: 'M-01', nombre: 'Vista del mirador', detalle: 'Mirador del Cerro · Ejemplo', estado: 'Publicado', extra: 'Imagen' },
            { id: 'M-02', nombre: 'Recorrido del sendero', detalle: 'Sendero del Arroyo · Ejemplo', estado: 'Oculto', extra: 'Video' },
        ],
    },
    {
        id: 'transporte',
        nombre: 'Empresas de transporte',
        icono: 'bus',
        descripcion: 'Administrá la información de las empresas de transporte.',
        columnas: ['Empresa', 'Servicio', 'Cobertura'],
        accion: 'Agregar empresa',
        filas: [{ id: 'T-01', nombre: 'Empresa de ejemplo', detalle: 'Servicio de ómnibus', estado: 'Activa', extra: 'Departamental' }],
    },
    {
        id: 'horarios',
        nombre: 'Horarios de ómnibus',
        icono: 'clock',
        descripcion: 'Consultá los recorridos, días de servicio y horarios.',
        columnas: ['Recorrido', 'Empresa y días', 'Salida / llegada'],
        accion: 'Agregar horario',
        filas: [{ id: 'H-01', nombre: 'Melo → Río Branco', detalle: 'Empresa de ejemplo · Lunes a viernes', estado: 'Publicado', extra: '08:00 / 09:30' }],
    },
];

export const pendingEvents = sections.find((section) => section.id === 'eventos')!.filas.filter((row) => isPending(row.estado));
export const pendingOrganizers = sections.find((section) => section.id === 'organizadores')!.filas.filter((row) => isPending(row.estado));
export const pendingReviews = sections.find((section) => section.id === 'comentarios')!.filas.filter((row) => isPending(row.estado));
export const pendingSection: AdminSection = {
    id: 'pendientes',
    nombre: 'Eventos pendientes',
    icono: 'clock',
    descripcion: 'Revisá los eventos que esperan aprobación antes de publicarse.',
    columnas: ['Evento', 'Organizador', 'Fecha'],
    filas: pendingEvents,
};
export const navigation = [sections[0], sections[1], sections[2], pendingSection, ...sections.slice(3)];

export function isPending(estado: string): boolean {
    return estado === 'Pendiente de revisión' || estado === 'Pendiente de verificación';
}
