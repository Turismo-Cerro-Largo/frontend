import { backendUrl } from '$lib/server/backend';
import type { TarjetaCategoria } from '$lib/types/categoria';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const respuesta = await fetch(`${backendUrl()}/api/ubicaciones?categoria=Cultura`, { signal: AbortSignal.timeout(10000) });

        if (!respuesta.ok) {
            throw new Error('Error al obtener lugares culturales');
        }

        const elementos = (await respuesta.json()) as TarjetaCategoria[];

        return {
            elementos,
            error: '',
        };
    } catch {
        return {
            elementos: [] as TarjetaCategoria[],
            error: 'No se pudieron cargar los lugares culturales.',
        };
    }
};
