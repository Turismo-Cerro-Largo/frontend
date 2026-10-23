import { consultar } from '$lib/server/turista';
import type { DetalleLugar, Valoracion } from '$lib/turista/types';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
export const load: PageServerLoad = async ({ params, request, locals, setHeaders }) => {
    if (!/^\d+$/.test(params.id) || !Number.isSafeInteger(Number(params.id))) error(404, 'Lugar no encontrado.');
    setHeaders({ 'cache-control': 'private, no-store' });
    const detalle = await consultar<DetalleLugar>(`lugares/${params.id}`, request);
    const personal = locals.cuenta?.rol === 'TURISTA' ? await consultar<{ favorito: boolean; valoracion: Valoracion | null }>(`turista/lugares/${params.id}`, request) : null;
    return { ...detalle, personal };
};
