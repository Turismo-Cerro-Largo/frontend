import { consultar } from '$lib/server/turista';
import { error } from '@sveltejs/kit';
import { diaUruguay, type EventoPublico } from '$lib/types/agenda';
import type { PageServerLoad } from './$types';
function fecha(valor: string) { return /^\d{4}-\d{2}-\d{2}$/.test(valor) && Number.isFinite(Date.parse(valor)) && new Date(valor).toISOString().slice(0,10) === valor; }
export const load: PageServerLoad = async ({ request, url }) => {
    const hoy = diaUruguay(new Date());
    const desde = url.searchParams.get('desde') || '';
    const hasta = url.searchParams.get('hasta') || '';
    const mes = (desde || hasta).slice(0,7) || url.searchParams.get('mes') || hoy.slice(0,7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes) || (desde && !fecha(desde)) || (hasta && !fecha(hasta)) || (desde && hasta && desde > hasta)) error(400, 'Revisá las fechas: la salida debe ser igual o posterior a la llegada.');
    const buscar = (url.searchParams.get('buscar') || '').slice(0,100);
    const inicio = `${mes}-01`;
    const ultimo = new Date(Date.UTC(Number(mes.slice(0,4)), Number(mes.slice(5)), 0)).toISOString().slice(0,10);
    const pagina = Math.max(1, Math.min(10000, Math.floor(Number(url.searchParams.get('pagina')) || 1)));
    const filtros = new URLSearchParams({ desde: desde || inicio, hasta: hasta || (desde ? desde : ultimo), buscar, limit: '12', pagina: String(pagina) });
    const calendario: EventoPublico[] = [];
    let truncado = false;
    for (let p = 1; p <= 10; p++) {
        const lote = await consultar<EventoPublico[]>(`eventos?${new URLSearchParams({desde:inicio,hasta:ultimo,limit:'100',pagina:String(p)})}`, request);
        calendario.push(...lote);
        if (lote.length < 100) break;
        if (p === 10) truncado = true;
    }
    return { eventos: await consultar<EventoPublico[]>(`eventos?${filtros}`, request), calendario, mes, desde, hasta, buscar, hoy, pagina, truncado };
};
