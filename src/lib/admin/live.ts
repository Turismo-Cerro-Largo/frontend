import type { RecordRow } from './management';
import type { DemoPlace } from './places';
export type AdminSnapshot = { records: Record<string,RecordRow[]>; places:DemoPlace[] };
export async function adminRequest(path:string, method='GET', body?:unknown):Promise<unknown> {
    const response=await fetch('/api/admin'+path,{method,credentials:'same-origin',headers:body instanceof FormData?undefined:body?{'Content-Type':'application/json'}:undefined,body:body instanceof FormData?body:body?JSON.stringify(body):undefined});
    const result=await response.json().catch(()=>({message:'El servidor devolvió una respuesta inesperada.'}));
    if(!response.ok) throw new Error(result.message??'No se pudo completar la operación.');
    return result;
}
