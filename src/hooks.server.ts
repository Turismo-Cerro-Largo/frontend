import { redirect } from "@sveltejs/kit";
import { backendUrl } from '#lib/server/backend.ts';
import { crearConsultaSesion, requiereCuenta, type ResultadoSesion } from '#lib/server/consulta-sesion.ts';
import type { Cuenta } from '#lib/types/cuenta.ts';
import type { Handle } from "@sveltejs/kit/hooks";

const consultarSesion = crearConsultaSesion(async token => {
    const respuesta = await fetch(`${backendUrl()}/api/auth/check`, {
        headers: { cookie: `session=${encodeURIComponent(token)}` },
        signal: AbortSignal.timeout(3000),
    }).catch(() => null);
    if (!respuesta) return { cuenta: null, status: 503, bloqueada: false };
    const datos = await respuesta.json().catch(() => null);
    const cuenta: Cuenta | null = respuesta.ok && datos && typeof datos.id === 'number' &&
        ['TURISTA', 'ORGANIZADOR', 'ADMINISTRADOR'].includes(datos.rol) ? datos : null;
    return { cuenta, status: respuesta.ok && !cuenta ? 503 : respuesta.status, bloqueada: respuesta.status === 403 && datos?.code === 'CUENTA_BLOQUEADA' } satisfies ResultadoSesion;
});

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.cuenta = null;
    const token = event.cookies.get('session');
    const consultar = !!token && requiereCuenta({
        ruta: event.route.id, pathname: event.url.pathname,
        aceptaHtml: (event.request.headers.get('accept') || '').includes('text/html'),
        datos: event.isDataRequest, accion: event.request.headers.has('x-sveltekit-action'),
    });
    if (consultar && token) {
        const fresca = event.request.method !== 'GET' || event.route.id?.startsWith('/(dashboard)/') ||
            event.route.id?.startsWith('/(autenticacion)/') || event.url.pathname === '/cuenta-bloqueada';
        const resultado = await consultarSesion(token, !!fresca);
        event.locals.cuenta = resultado.cuenta;
        if (resultado.status === 401 || resultado.bloqueada) event.cookies.delete('session', { path: '/' });
        if (resultado.bloqueada && event.route.id?.startsWith('/(dashboard)/')) {
            redirect(303, '/cuenta-bloqueada');
        }
    }

    const response = await resolve(event);
    response.headers.set('x-content-type-options', 'nosniff');
    response.headers.set('x-frame-options', 'DENY');
    response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    response.headers.set('cross-origin-opener-policy', 'same-origin-allow-popups');
    response.headers.set('permissions-policy', 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)');
    if (event.url.protocol === 'https:') response.headers.set('strict-transport-security', 'max-age=300');
    if (event.route.id?.startsWith('/(dashboard)/') || event.route.id?.startsWith('/(autenticacion)/') ||
        ['/recuperar-contrasena', '/restablecer-contrasena', '/cuenta-bloqueada'].includes(event.url.pathname)) {
        response.headers.set('x-robots-tag', 'noindex, nofollow');
        response.headers.set('cache-control', 'private, no-store');
    }
    if (consultar) response.headers.set('cache-control', 'private, no-store');
    return response;
}
