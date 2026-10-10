import { sections, type DemoRow } from './demo';

export type RecordRow = DemoRow & { data: Record<string, string> };
export type Field = { key: string; label: string; type?: string; required?: boolean; options?: string[]; relation?: 'categorias' | 'transporte' | 'destinos'; max?: number };
export type Definition = { title: string; fields: Field[]; removable?: boolean; editable?: boolean };
const name: Field = { key: 'nombre', label: 'Nombre', required: true, max: 150 };
export const definitions: Record<string, Definition> = {
    categorias: {
        title: 'Categoría',
        editable: true,
        fields: [name, { key: 'descripcion', label: 'Descripción', type: 'textarea', max: 255 }],
    },
    eventos: {
        title: 'Evento',
        editable: true,
        removable: true,
        fields: [
            name,
            { key: 'descripcion', label: 'Descripción', required: true, type: 'textarea' },
            { key: 'categoria', label: 'Categoría', required: true, relation: 'categorias' },
            { key: 'organizador', label: 'Organizador responsable', required: true },
            { key: 'inicio', label: 'Fecha y hora de inicio', type: 'datetime-local', required: true },
            { key: 'fin', label: 'Fecha y hora de finalización', type: 'datetime-local' },
            { key: 'lugar', label: 'Lugar del evento', required: true },
            { key: 'latitud', label: 'Latitud (con punto decimal)', required: true },
            { key: 'longitud', label: 'Longitud (con punto decimal)', required: true },
            { key: 'entrada', label: 'Entrada', required: true, options: ['Gratuita', 'Con costo'] },
            { key: 'precio', label: 'Precio en pesos uruguayos', type: 'number' },
            { key: 'contacto', label: 'Contacto', max: 255 },
        ],
    },
    multimedia: {
        title: 'Recurso multimedia',
        editable: true,
        removable: true,
        fields: [
            name,
            { key: 'destino', label: 'Lugar o evento asociado', required: true, relation: 'destinos' },
            { key: 'descripcion', label: 'Descripción del contenido', required: true, type: 'textarea', max: 255 },
        ],
    },
    transporte: {
        title: 'Empresa de transporte',
        editable: true,
        fields: [name, { key: 'telefono', label: 'Teléfono', type: 'tel', max: 30 }, { key: 'web', label: 'Sitio web', type: 'url', max: 500 }],
    },
    horarios: {
        title: 'Horario de ómnibus',
        editable: true,
        fields: [
            { key: 'empresa', label: 'Empresa', relation: 'transporte', required: true },
            { key: 'origen', label: 'Origen', required: true, max: 120 },
            { key: 'destino', label: 'Destino', required: true, max: 120 },
            { key: 'salida', label: 'Hora de salida', type: 'time', required: true },
            { key: 'llegada', label: 'Hora de llegada', type: 'time', required: true },
            { key: 'diaLlegada', label: 'Día de llegada', options: ['Mismo día', 'Día siguiente'], required: true },
            { key: 'dias', label: 'Días de servicio', required: true, max: 100 },
            { key: 'tipo', label: 'Tipo de servicio', options: ['Departamental', 'Interdepartamental'], required: true },
            { key: 'precio', label: 'Precio en pesos uruguayos', type: 'number' },
        ],
    },
    comentarios: { title: 'Comentario o calificación', removable: true, fields: [] },
};

export function initialRecords(): Record<string, RecordRow[]> {
    const result = Object.fromEntries(sections.map((section) => [section.id, section.filas.map((row) => ({ ...row, data: {} as Record<string, string> }))]));
    result.categorias.forEach((row) => (row.data = { nombre: row.nombre, descripcion: row.detalle }));
    result.eventos.forEach(
        (row, index) =>
            (row.data = {
                nombre: row.nombre,
                descripcion: 'Actividad ficticia para revisar los flujos de administración.',
                categoria: 'C-05',
                organizador: row.detalle,
                inicio: ['2026-10-24', '2026-10-31', '2026-11-07', '2026-11-14'][index] + 'T15:00',
                fin: '',
                lugar: 'Lugar de ejemplo en Melo',
                latitud: '-32.37',
                longitud: '-54.17',
                entrada: 'Gratuita',
                precio: '0',
                contacto: 'eventos@example.com',
            })
    );
    result.transporte.forEach((row) => (row.data = { nombre: row.nombre, telefono: '', web: '' }));
    result.horarios.forEach(
        (row) =>
            (row.data = {
                empresa: 'T-01',
                origen: 'Melo',
                destino: 'Río Branco',
                salida: '08:00',
                llegada: '09:30',
                diaLlegada: 'Mismo día',
                dias: 'Lunes a viernes',
                tipo: 'Departamental',
                precio: '0',
            })
    );
    result.multimedia.forEach(
        (row, index) => (row.data = { nombre: row.nombre, destino: 'lugares:L-0' + (index + 1), descripcion: 'Recurso ficticio sin archivo adjunto.', tipo: row.extra })
    );
    return result;
}

export function validateRecord(section: string, data: Record<string, string>, siblings: RecordRow[], id?: string): string {
    for (const field of definitions[section].fields) {
        const value = (data[field.key] ?? '').trim();
        if (field.required && !value) return `Completá ${field.label.toLowerCase()}.`;
        if (value.length > (field.max ?? 5000)) return `${field.label}: el texto es demasiado largo.`;
        if (field.options && value && !field.options.includes(value)) return `Seleccioná una opción válida para ${field.label.toLowerCase()}.`;
        if (field.type === 'url' && value) {
            try {
                if (!['http:', 'https:'].includes(new URL(value).protocol)) return 'El sitio web debe usar http:// o https://.';
            } catch {
                return 'El sitio web no es válido.';
            }
        }
    }
    if (
        ['categorias', 'transporte'].includes(section) &&
        siblings.some((row) => row.id !== id && row.nombre.trim().toLocaleLowerCase('es') === data.nombre.trim().toLocaleLowerCase('es'))
    )
        return 'Ya existe un registro con ese nombre.';
    if (data.precio && (!Number.isFinite(Number(data.precio)) || Number(data.precio) < 0)) return 'El precio debe ser un número mayor o igual a cero.';
    if (section === 'eventos') {
        if (!Number.isFinite(Date.parse(data.inicio))) return 'La fecha de inicio no es válida.';
        if (data.fin && (!Number.isFinite(Date.parse(data.fin)) || Date.parse(data.fin) <= Date.parse(data.inicio))) return 'La finalización debe ser posterior al inicio.';
        for (const [key, limit] of [
            ['latitud', 90],
            ['longitud', 180],
        ] as const)
            if (!data[key]?.trim() || !Number.isFinite(Number(data[key])) || Math.abs(Number(data[key])) > limit) return `${key}: ingresá un valor entre -${limit} y ${limit}.`;
        if (data.entrada === 'Con costo' && !(Number(data.precio) > 0)) return 'Indicá un precio mayor que cero para un evento con costo.';
    }
    if (section === 'horarios') {
        if (data.origen.trim().toLocaleLowerCase('es') === data.destino.trim().toLocaleLowerCase('es')) return 'Origen y destino deben ser distintos.';
        if (!/^\d{2}:\d{2}$/.test(data.salida) || !/^\d{2}:\d{2}$/.test(data.llegada)) return 'Completá los horarios.';
        if (data.diaLlegada === 'Mismo día' && data.llegada <= data.salida) return 'La llegada debe ser posterior a la salida, o seleccioná Día siguiente.';
    }
    return '';
}

export function recordRow(section: string, data: Record<string, string>, id: string, estado?: string): RecordRow {
    const row = { id, data, nombre: data.nombre ?? '', detalle: data.descripcion ?? '', extra: '', estado: estado ?? 'Activo' };
    if (section === 'categorias') {
        row.estado = 'Activa';
    }
    if (section === 'eventos') {
        row.detalle = data.organizador;
        row.extra = data.inicio.replace('T', ' ');
        row.estado = estado ?? 'Publicado';
    }
    if (section === 'transporte') {
        row.detalle = data.telefono || 'Sin teléfono';
        row.extra = data.web || 'Sin sitio web';
        row.estado = 'Activa';
    }
    if (section === 'horarios') {
        row.nombre = data.origen + ' → ' + data.destino;
        row.detalle = data.dias;
        row.extra = data.salida + ' / ' + data.llegada + (data.diaLlegada === 'Día siguiente' ? ' (+1 día)' : '');
        row.estado = estado ?? 'Publicado';
    }
    if (section === 'multimedia') {
        row.extra = data.tipo;
        row.estado = 'Disponible';
    }
    return row;
}
