import { backendUrl } from '$lib/server/backend';
import { escaparXml, eventosSeo } from '$lib/server/seo';
import type { RequestHandler } from './$types';

const paginasPublicas = [
    '/', '/eventos', '/lugares', '/localidades', '/mapa', '/mapa-2',
    '/horarios-omnibus', '/radios-locales',
    '/categoria/alojamiento', '/categoria/cultura', '/categoria/eventos',
    '/categoria/naturaleza', '/categoria/restaurantes'
];

const maxUrls = 50_000;

async function agregarEventos(fetcher: typeof fetch, rutas: Set<string>) {
    const limit = 100;
    for (let pagina = 1; pagina <= Math.ceil(maxUrls / limit) && rutas.size < maxUrls; pagina++) {
        const eventos = await eventosSeo(fetcher, limit, pagina);
        for (const evento of eventos) rutas.add(`/eventos/${evento.id}`);
        if (eventos.length < limit) break;
    }
}

async function agregarLugares(fetcher: typeof fetch, rutas: Set<string>) {
    for (let pagina = 1; pagina <= 10_000 && rutas.size < maxUrls; pagina++) {
        const respuesta = await fetcher(`${backendUrl()}/api/lugares?pagina=${pagina}`, {
            signal: AbortSignal.timeout(5000)
        });
        if (!respuesta.ok) throw new Error('No se pudo cargar el catálogo');
        const { lugares, total, porPagina } = await respuesta.json();
        if (!Array.isArray(lugares) || !Number.isSafeInteger(total) || total < 0 ||
            !Number.isSafeInteger(porPagina) || porPagina < 1 ||
            !lugares.every((lugar) => Number.isSafeInteger(lugar?.id) && lugar.id > 0)) {
            throw new Error('El catálogo devolvió un formato inválido');
        }
        for (const lugar of lugares) rutas.add(`/lugares/${lugar.id}`);
        if (lugares.length < porPagina || pagina * porPagina >= total) break;
    }
}

export const GET: RequestHandler = async ({ url, fetch }) => {
    const rutas = new Set(paginasPublicas);
    try {
        await agregarEventos(fetch, rutas);
        await agregarLugares(fetch, rutas);
    } catch {
        return new Response('El sitemap no está disponible temporalmente.', {
            status: 503,
            headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' }
        });
    }

    const entradas = Array.from(rutas).slice(0, maxUrls).map((ruta) => {
        const enlace = escaparXml(new URL(ruta, url.origin).href);
        return `<url><loc>${enlace}</loc></url>`;
    });
    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entradas.join('')}</urlset>`,
        { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
};
