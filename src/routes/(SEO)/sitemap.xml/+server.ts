import { backendUrl } from '#lib/server/backend.ts';
import { escaparXml, eventosSeo } from '#lib/server/seo.ts';
import { diaUruguay } from '#lib/utils/agenda.ts';
import type { RequestHandler } from './$types';

const paginasPublicas = [
    '/', '/eventos', '/lugares', '/localidades', '/mapa',
    '/horarios-omnibus', '/radios-locales', '/sobre-nosotros', '/contacto', '/privacidad', '/terminos',
    '/categoria/alojamiento', '/categoria/cultura', '/categoria/eventos',
    '/categoria/naturaleza', '/categoria/restaurantes'
];

const maxUrls = 50_000;

function frecuencia(ruta: string) {
    if (ruta === '/' || ruta === '/eventos' || ruta.startsWith('/eventos/')) return 'daily';
    return ruta === '/radios-locales' || ruta === '/horarios-omnibus' ? 'monthly' : 'weekly';
}

function prioridad(ruta: string) {
    if (ruta === '/') return '1.0';
    if (['/eventos', '/lugares', '/localidades', '/mapa'].includes(ruta)) return '0.8';
    if (ruta.startsWith('/lugares/') || ruta.startsWith('/localidades/') || ruta.startsWith('/eventos/')) return '0.7';
    return '0.6';
}

async function agregarLocalidades(fetcher: typeof fetch, rutas: Set<string>) {
    const respuesta = await fetcher(`${backendUrl()}/api/localidades`, {
        signal: AbortSignal.timeout(5000)
    });
    if (!respuesta.ok) throw new Error('No se pudieron cargar las localidades');
    const localidades: unknown = await respuesta.json();
    if (!Array.isArray(localidades) || !localidades.every((item) =>
        typeof item?.slug === 'string' && /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(item.slug)
    )) {
        throw new Error('Las localidades devolvieron un formato inválido');
    }
    for (const { slug } of localidades) rutas.add(`/localidades/${slug}`);
}

async function agregarEventos(fetcher: typeof fetch, rutas: Set<string>) {
    const limit = 100;
    const ahora = new Date();
    const hoy = diaUruguay(ahora);
    for (let pagina = 1; pagina <= Math.ceil(maxUrls / limit) && rutas.size < maxUrls; pagina++) {
        const eventos = await eventosSeo(fetcher, limit, pagina, hoy);
        for (const evento of eventos) {
            if (!evento.fin || Date.parse(evento.fin) >= ahora.getTime()) rutas.add(`/eventos/${evento.id}`);
        }
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
        await agregarLocalidades(fetch, rutas);
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
        return `<url><loc>${enlace}</loc><changefreq>${frecuencia(ruta)}</changefreq><priority>${prioridad(ruta)}</priority></url>`;
    });
    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entradas.join('')}</urlset>`,
        { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
};
