import { json, type RequestHandler } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';
const proxy: RequestHandler = async ({request,params,url}) => {
    if(!['GET','HEAD','OPTIONS'].includes(request.method) && request.headers.get('origin')!==url.origin) return json({message:'Origen no autorizado.'},{status:403});
    if(!/^[a-zA-Z0-9_/-]+$/.test(params.path??'') || (params.path??'').includes('..')) return json({message:'Ruta no válida.'},{status:400});
    try {
        const headers=new Headers();
        for(const name of ['cookie','content-type','accept','range']) { const value=request.headers.get(name); if(value) headers.set(name,value); }
        headers.set('origin',url.origin);
        const upstream=await fetch(backendUrl()+'/api/'+params.path+url.search,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:await request.arrayBuffer(),redirect:'manual',signal:AbortSignal.timeout(30000)});
        const result=new Headers(upstream.headers);
        for(const name of ['content-length','content-encoding','transfer-encoding','connection']) result.delete(name);
        result.set('cache-control','private, no-store');
        return new Response(upstream.body,{status:upstream.status,headers:result});
    } catch { return json({message:'No se pudo conectar con el backend. Comprobá que esté funcionando.'},{status:502}); }
};
export const GET=proxy; export const POST=proxy; export const PUT=proxy; export const PATCH=proxy; export const DELETE=proxy; export const HEAD=proxy;
