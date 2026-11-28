import { consultar } from '#lib/server/turista.ts';
import { error, redirect } from '@sveltejs/kit';
import type { EventoPublico } from '#lib/types/agenda.ts';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, request }) => {
    // Enlaces estables de los afiches; los IDs cambian entre bases de datos.
    const afiches: Record<string, { titulo: string; desde: string; hasta: string }> = {
        'mega-show-moto-2026': { titulo: '22.º Mega Show Internacional de Moto', desde: '2026-11-12', hasta: '2026-11-15' },
        'lanzamiento-semana-melo-2026': { titulo: 'Lanzamiento de Semana de Melo 2026', desde: '2026-09-03', hasta: '2026-09-03' },
    };
    const afiche = afiches[params.slug];
    if (afiche) {
        const filtros = new URLSearchParams({ buscar: afiche.titulo, desde: afiche.desde, hasta: afiche.hasta, limit: '100' });
        const eventos = await consultar<EventoPublico[]>(`eventos?${filtros}`, request);
        const evento = eventos.find(e => e.titulo === afiche.titulo);
        if (!evento) error(404, 'La información de este evento todavía no está disponible.');
        if (evento.slug) redirect(308, '/eventos/' + evento.slug);
        return { evento };
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.slug) || params.slug.length > 180) error(404, 'Evento no encontrado.');
    const evento = await consultar<EventoPublico>(`eventos/${encodeURIComponent(params.slug)}`, request);
    if (evento.slug && params.slug !== evento.slug) redirect(308, '/eventos/' + evento.slug);
    return { evento };
};
