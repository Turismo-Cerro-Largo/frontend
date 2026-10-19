import { consultar } from '$lib/server/turista';
import type { PageServerLoad } from './$types';
type Horario = { id:number; origen:string; destino:string; hora_salida:string; hora_llegada:string|null; dias:string; tipo_servicio:string; precio:string|null; empresa:{nombre:string;telefono:string|null;sitio_web:string|null} };
export const load:PageServerLoad = async ({request,url}) => {
    const origen=(url.searchParams.get('origen')||'').slice(0,120);
    const destino=(url.searchParams.get('destino')||'').slice(0,120);
    const pagina=Math.max(1,Math.min(10000,Math.floor(Number(url.searchParams.get('pagina'))||1)));
    try {
        return {...await consultar<{horarios:Horario[];total:number;pagina:number;porPagina:number;origenes:string[];destinos:string[]}>(`transporte/horarios?${new URLSearchParams({origen,destino,pagina:String(pagina)})}`,request),origen,destino,error:''};
    } catch { return {horarios:[] as Horario[],total:0,pagina,porPagina:12,origenes:[] as string[],destinos:[] as string[],origen,destino,error:'No pudimos cargar los horarios. Intentá nuevamente.'}; }
};
