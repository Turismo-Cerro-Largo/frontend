
import { backendUrl } from '$lib/server/backend';
import type { TarjetaCategoria } from '$lib/types/categoria';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const nombres = [
            'Parques/Naturaleza',
            'Playas'
        ];

        const respuestas = await Promise.all(
            nombres.map((nombre) =>
                fetch(
                    `${backendUrl()}/api/ubicaciones?categoria=${encodeURIComponent(nombre)}`
                )
            )
        );

        if (respuestas.some((r) => !r.ok)) {
            throw new Error('Error al obtener lugares naturales');
        }

        const resultados = await Promise.all(
            respuestas.map(
                async (r) =>
                    (await r.json()) as TarjetaCategoria[]
            )
        );

        const todos = resultados.flat();

        // Evitar lugares repetidos
        const elementos = [
            ...new Map(
                todos.map((lugar) => [lugar.id, lugar])
            ).values()
        ];

        return {
            elementos,
            error: ''
        };

    } catch {
        return {
            elementos: [] as TarjetaCategoria[],
            error: 'No se pudieron cargar los lugares naturales.'
        };
    }
};
