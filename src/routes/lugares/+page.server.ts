import { consultar } from '$lib/server/turista';
import type { Lugar } from '$lib/turista/types';
import type { LocalidadPublica } from '$lib/types/localidad';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ request, url }) => {
    const localidad = (url.searchParams.get("localidad") || "").slice(0,100);
    const buscar = (url.searchParams.get('buscar') || '').slice(0, 100);
    const pagina = Math.max(1, Math.min(10000, Number(url.searchParams.get('pagina')) || 1));
    return {
        ...(await consultar<{ lugares: Lugar[]; total: number; pagina: number; porPagina: number }>(
            `lugares?buscar=${encodeURIComponent(buscar)}&localidad=${encodeURIComponent(localidad)}&pagina=${Math.floor(pagina)}`,
            request
        )),
        buscar, localidad,
        localidades: await consultar<LocalidadPublica[]>('localidades', request),
    };
};
