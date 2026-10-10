import { error, redirect } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';
import type { AdminSnapshot } from '$lib/admin/live';
export const load = async ({request,locals}) => {
    if(!locals.cuenta) redirect(303,'/login');
    if(locals.cuenta.rol!=='ADMINISTRADOR') error(403,'Se requieren permisos de administrador.');
    let response:Response;
    try { response=await fetch(backendUrl()+'/api/admin/datos',{headers:{cookie:request.headers.get('cookie')??''},signal:AbortSignal.timeout(15000)}); }
    catch { error(503,'No se pudo conectar con el backend. Intentá nuevamente.'); }
    if(response.status===401) redirect(303,'/login');
    if(!response.ok) error(response.status===403?403:503,'No se pudieron cargar los datos del panel.');
    return {snapshot:await response.json() as AdminSnapshot};
};
