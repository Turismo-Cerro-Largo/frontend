import { backendUrl } from '$lib/server/backend';
import type { Handle } from "@sveltejs/kit";

/**
 * Verificar si hay una cuenta
 */
export const handle: Handle = async ({ event, resolve }) => {
    event.locals.cuenta = null;

    if (event.cookies.get("session")) {

        // consultar al backend si la cuenta es true
        const respuesta = await fetch(`${backendUrl()}/api/auth/check`, {
            headers: { cookie: event.request.headers.get("cookie") ?? "" },
            signal: AbortSignal.timeout(3000),
        }).catch(() => null);

        // Si hay cuenta se guarda
        if (respuesta?.ok) {
            event.locals.cuenta = await respuesta.json();
        }
    }

    return resolve(event);
}
