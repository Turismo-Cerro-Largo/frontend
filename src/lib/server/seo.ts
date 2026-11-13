import { backendUrl } from './backend';

type EventoSeo = { id: number; titulo: string; descripcion: string | null };

export function escaparXml(texto: string) {
    return texto
        .replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export async function eventosSeo(fetcher: typeof fetch, limit: number, pagina = 1): Promise<EventoSeo[]> {
    const respuesta = await fetcher(`${backendUrl()}/api/eventos?limit=${limit}&pagina=${pagina}`, {
        signal: AbortSignal.timeout(5000)
    });
    if (!respuesta.ok) throw new Error('No se pudo cargar la agenda');
    const eventos: unknown = await respuesta.json();
    if (!Array.isArray(eventos) || !eventos.every((evento) =>
        Number.isSafeInteger(evento?.id) && evento.id > 0 && typeof evento.titulo === 'string' &&
        (evento.descripcion === null || typeof evento.descripcion === 'string')
    )) {
        throw new Error('La agenda devolvió un formato inválido');
    }
    return eventos;
}

export function agendaNoDisponible() {
    return new Response('La agenda no está disponible temporalmente.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '60', 'Cache-Control': 'no-store' }
    });
}
