import { agendaNoDisponible, escaparXml, eventosSeo } from '$lib/server/seo';
import type { RequestHandler } from './$types';

const paginasPublicas = [
    '/', '/eventos', '/lugares', '/localidades', '/mapa',
    '/horarios-omnibus', '/radios-locales',
    '/categoria/alojamiento', '/categoria/cultura', '/categoria/eventos',
    '/categoria/naturaleza', '/categoria/restaurantes'
];

export const GET: RequestHandler = async ({ url, fetch }) => {
    const rutas = new Set(paginasPublicas);
    try {
        const limit = 100;
        for (let pagina = 1; pagina <= Math.floor((50000 - paginasPublicas.length) / limit); pagina++) {
            const eventos = await eventosSeo(fetch, limit, pagina);
            for (const evento of eventos) rutas.add(`/eventos/${evento.id}`);
            if (eventos.length < limit) break;
        }
    } catch {
        return agendaNoDisponible();
    }

    const entradas = Array.from(rutas, (ruta) => {
        const enlace = escaparXml(new URL(ruta, url.origin).href);
        return `<url><loc>${enlace}</loc></url>`;
    });
    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entradas.join('')}</urlset>`,
        { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
};
