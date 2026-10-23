import { consultar } from '$lib/server/turista';
import type { LugarMapa } from '$lib/types/mapa';
import type { LocalidadPublica } from '$lib/types/localidad';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url }) => {
    const buscar = (url.searchParams.get('buscar') || '').slice(0, 100);
    const [lugares, localidades] = await Promise.allSettled([
        consultar<{ lugares: LugarMapa[]; limitado: boolean }>('mapa/lugares?buscar=' + encodeURIComponent(buscar), request),
        consultar<LocalidadPublica[]>('localidades', request)
    ]);
    return {
        lugares: lugares.status === 'fulfilled' ? lugares.value.lugares : [] as LugarMapa[],
        limitado: lugares.status === 'fulfilled' ? lugares.value.limitado : false,
        localidades: localidades.status === 'fulfilled' ? localidades.value : [] as LocalidadPublica[],
        buscar,
        error: lugares.status === 'fulfilled' ? '' : 'No pudimos cargar los lugares del mapa. Intentá nuevamente.'
    };
};