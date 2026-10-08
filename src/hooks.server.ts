import type { Handle } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.cuenta = null;
    const cookie = event.request.headers.get('cookie');
    if (event.cookies.get('session') && cookie) {
        try {
            const respuesta = await fetch(`${backendUrl()}/api/auth/check`, {
                headers: { cookie },
                signal: AbortSignal.timeout(3000)
            });
            if (respuesta.ok) event.locals.cuenta = await respuesta.json();
        } catch {
            // La web pública puede seguir funcionando si el servidor falla.
        }
    }
    return resolve(event);
};
