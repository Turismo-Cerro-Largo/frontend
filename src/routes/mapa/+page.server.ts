import { consultar } from '$lib/server/turista';
import type { LugarMapa } from '$lib/types/mapa';
import type { PageServerLoad } from './$types';
export const load:PageServerLoad = async ({request,url}) => {
    const buscar=(url.searchParams.get('buscar') || '').slice(0,100);
    try { return {...await consultar<{lugares:LugarMapa[];limitado:boolean}>(`mapa/lugares?buscar=${encodeURIComponent(buscar)}`,request),buscar,error:''}; }
    catch { return {lugares:[] as LugarMapa[],limitado:false,buscar,error:'No pudimos cargar los lugares del mapa. Intentá nuevamente.'}; }
};
