import { backendUrl } from '$lib/server/backend';
import { diaUruguay, type EventoPublico } from '$lib/types/agenda';
import type { LocalidadPublica } from '$lib/types/localidad';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const eventos = fetch(
        backendUrl() + '/api/eventos?' + new URLSearchParams({ desde: diaUruguay(new Date()), limit: '3' }),
        { signal: AbortSignal.timeout(10000) }
    ).then(async (respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar los eventos.');
        return (await respuesta.json()) as EventoPublico[];
    });
    const localidades = fetch(backendUrl() + '/api/localidades', {
        signal: AbortSignal.timeout(10000)
    }).then(async (respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar las localidades.');
        return (await respuesta.json()) as LocalidadPublica[];
    });
    const [resultadoEventos, resultadoLocalidades] = await Promise.allSettled([eventos, localidades]);
    return {
        eventosProximos: resultadoEventos.status === 'fulfilled' ? resultadoEventos.value : [],
        errorEventos: resultadoEventos.status !== 'fulfilled',
        localidades: resultadoLocalidades.status === 'fulfilled' ? resultadoLocalidades.value : null
    };
};