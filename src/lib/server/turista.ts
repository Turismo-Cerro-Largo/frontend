import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';
export async function consultar<T>(ruta: string, request: Request): Promise<T> {
    const respuesta = await fetch(`${backendUrl()}/api/${ruta}`, {
        headers: { cookie: request.headers.get('cookie') || '' },
        signal: AbortSignal.timeout(10000),
    }).catch(() => null);
    if (!respuesta) error(503, 'No pudimos conectar con el servidor. Intentá nuevamente en unos momentos.');
    if (!respuesta.ok)
        error(
            respuesta.status === 404 ? 404 : respuesta.status === 401 ? 401 : 503,
            respuesta.status === 404
                ? 'Este lugar no está disponible.'
                : respuesta.status === 401
                  ? 'Tu sesión venció. Volvé a ingresar.'
                  : 'No pudimos cargar la información. Intentá nuevamente.'
        );
    return respuesta.json();
}
