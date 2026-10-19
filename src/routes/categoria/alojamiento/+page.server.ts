import { backendUrl } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

type Alojamiento = {
    id: number;
    nombre: string;
    descripcion: string;
    localidad: string;
    direccion: string | null;
    telefono: string | null;
    sitio_web: string | null;
    horario: string | null;
    latitud: number;
    longitud: number;
    imagen: string | null;
};

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const respuesta = await fetch(`${backendUrl()}/api/ubicaciones?categoria=Alojamiento`, { signal: AbortSignal.timeout(10000) });

        if (!respuesta.ok) {
            throw new Error('Error al cargar los alojamientos');
        }

        const alojamientos = (await respuesta.json()) as Alojamiento[];

        return {
            alojamientos,
            error: '',
        };
    } catch {
        return {
            alojamientos: [] as Alojamiento[],
            error: 'No se pudieron cargar los alojamientos.',
        };
    }
};
