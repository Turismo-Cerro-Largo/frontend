import type { DemoRow } from './demo';

export type DemoPlace = DemoRow & {
    descripcion: string;
    direccion: string;
    latitud: string;
    longitud: string;
    telefono: string;
    sitioWeb: string;
    horario: string;
};

export function emptyPlace(): DemoPlace {
    return { id: '', nombre: '', detalle: '', estado: 'Oculto', extra: '', descripcion: '', direccion: '', latitud: '', longitud: '', telefono: '', sitioWeb: '', horario: '' };
}

export function examplePlaces(): DemoPlace[] {
    return [
        {
            ...emptyPlace(),
            id: 'L-01',
            nombre: 'Mirador del Cerro',
            detalle: 'Parques/Naturaleza',
            estado: 'Publicado',
            extra: 'Melo',
            descripcion: 'Lugar ficticio para probar la gestión turística del panel.',
            direccion: 'Dirección de ejemplo 100',
            latitud: '-32.37',
            longitud: '-54.17',
            horario: 'Lunes a viernes, de 09:00 a 18:00',
        },
        {
            ...emptyPlace(),
            id: 'L-02',
            nombre: 'Sendero del Arroyo',
            detalle: 'Parques/Naturaleza',
            estado: 'Oculto',
            extra: 'Río Branco',
            descripcion: 'Sendero ficticio para revisar los campos y las acciones del panel.',
            latitud: '-32.60',
            longitud: '-53.38',
        },
    ];
}

export function validatePlace(place: DemoPlace): string {
    if (place.nombre.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (!place.detalle.trim()) return 'Seleccioná una categoría.';
    if (!place.extra.trim()) return 'Indicá la localidad.';
    if (place.descripcion.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres.';
    const latitude = Number(place.latitud.trim());
    const longitude = Number(place.longitud.trim());
    if (!place.latitud.trim() || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) return 'La latitud debe estar entre -90 y 90.';
    if (!place.longitud.trim() || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return 'La longitud debe estar entre -180 y 180.';
    if (place.sitioWeb.trim()) {
        try {
            if (!['http:', 'https:'].includes(new URL(place.sitioWeb).protocol)) return 'El sitio web debe comenzar con https:// o http://.';
        } catch {
            return 'Ingresá una dirección web válida.';
        }
    }
    return '';
}
