import type { EventoPublico } from '$lib/types/agenda';

export const diaUruguay = (fecha: string | Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Montevideo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(fecha));
export const fechaEvento = (fecha: string) => new Date(fecha).toLocaleDateString('es-UY', { timeZone: 'America/Montevideo', day: 'numeric', month: 'long', year: 'numeric' });
export function rangoEvento(e: EventoPublico) {
    return fechaEvento(e.inicio) + (e.fin && diaUruguay(e.fin) !== diaUruguay(e.inicio) ? ` al ${fechaEvento(e.fin)}` : '');
}
