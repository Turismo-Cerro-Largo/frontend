import { consultar } from '$lib/server/turista';
import { error } from '@sveltejs/kit';
import type { EventoPublico } from '$lib/types/agenda';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, request }) => {
    // Enlaces estables de los afiches; los IDs cambian entre bases de datos.
    const afiches: Record<string, { titulo: string; desde: string; hasta: string }> = {
        'mega-show-moto-2026': { titulo: '22.º Mega Show Internacional de Moto', desde: '2026-11-12', hasta: '2026-11-15' },
        'lanzamiento-semana-melo-2026': { titulo: 'Lanzamiento de Semana de Melo 2026', desde: '2026-09-03', hasta: '2026-09-03' },
    };
    const afiche = afiches[params.id];
    if (afiche) {
        const filtros = new URLSearchParams({ buscar: afiche.titulo, desde: afiche.desde, hasta: afiche.hasta, limit: '100' });
        const eventos = await consultar<EventoPublico[]>(`eventos?${filtros}`, request);
        const evento = eventos.find(e => e.titulo === afiche.titulo);
        if (!evento) error(404, 'La información de este evento todavía no está disponible.');
        return { evento };
    }
    if (!/^\d+$/.test(params.id)) error(404, 'Evento no encontrado.');
    return { evento: await consultar<EventoPublico>(`eventos/${params.id}`, request) };
};
