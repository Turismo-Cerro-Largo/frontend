import { backendUrl } from '$lib/server/backend';
import { diaUruguay } from '$lib/utils/agenda';
import type { EventoPublico } from '$lib/types/agenda';
import type { LocalidadPublica } from '$lib/types/localidad';
import type { HorarioOmnibus } from '$lib/types/transporte';
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
    const horarios = fetch(backendUrl() + '/api/transporte/horarios?pagina=1', {
        signal: AbortSignal.timeout(10000),
    }).then(async (respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar los horarios.');
        const datos = (await respuesta.json()) as { horarios: HorarioOmnibus[] };
        if (!Array.isArray(datos.horarios)) throw new Error('Respuesta de horarios inválida.');
        return datos.horarios.slice(0, 3);
    });
    const [resultadoEventos, resultadoLocalidades, resultadoHorarios] = await Promise.allSettled([eventos, localidades, horarios]);
    return {
        horarios: resultadoHorarios.status === 'fulfilled' ? resultadoHorarios.value : [],
        errorHorarios: resultadoHorarios.status !== 'fulfilled',
        eventosProximos: resultadoEventos.status === 'fulfilled' ? resultadoEventos.value : [],
        errorEventos: resultadoEventos.status !== 'fulfilled',
        localidades: resultadoLocalidades.status === 'fulfilled' ? resultadoLocalidades.value : null
    };
};
