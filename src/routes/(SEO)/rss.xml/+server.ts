import { agendaNoDisponible, escaparXml, eventosSeo } from '$lib/server/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
    try {
        const eventos = await eventosSeo(fetch, 30);
        const items = eventos.map((evento) => {
            const enlace = escaparXml(new URL(`/eventos/${evento.id}`, url.origin).href);
            return `<item><title>${escaparXml(evento.titulo)}</title><link>${enlace}</link><guid>${enlace}</guid><description>${escaparXml(evento.descripcion ?? '')}</description></item>`;
        });
        const agenda = escaparXml(new URL('/eventos', url.origin).href);
        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Eventos de Cerro Largo</title><link>${agenda}</link><description>Agenda de eventos</description><language>es-UY</language>${items.join('')}</channel></rss>`,
            { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } }
        );
    } catch {
        return agendaNoDisponible();
    }
};
