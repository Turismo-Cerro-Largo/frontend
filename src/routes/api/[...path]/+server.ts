import { json, type RequestHandler } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';

const proxy: RequestHandler = async ({ request, params }) => {
    let destino: URL;
    try {
        destino = new URL(`${backendUrl()}/api/${params.path ?? ''}`);
    } catch {
        return json({ message: 'El backend no está configurado.' }, { status: 503 });
    }
    destino.search = new URL(request.url).search;
    const headers = new Headers(request.headers);
    for (const clave of ['host', 'connection', 'content-length', 'accept-encoding']) {
        headers.delete(clave);
    }
    try {
        const respuesta = await fetch(destino, {
            method: request.method,
            headers,
            body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
            redirect: 'manual'
        });
        const respuestaHeaders = new Headers(respuesta.headers);
        for (const clave of ['connection', 'content-length', 'content-encoding', 'transfer-encoding']) {
            respuestaHeaders.delete(clave);
        }
        return new Response(respuesta.body, { status: respuesta.status, headers: respuestaHeaders });
    } catch {
        return json({ message: 'El backend no responde. Comprobá que esté encendido.' }, { status: 502 });
    }
};
export const GET = proxy;
export const POST = proxy;
