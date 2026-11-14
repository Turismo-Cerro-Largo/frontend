import { redirect } from "@sveltejs/kit";
import { backendUrl } from '$lib/server/backend';
import type { Handle } from "@sveltejs/kit";

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
        } else if (respuesta?.status === 403 && event.route.id?.startsWith("/(dashboard)/")) {
            const detalle = await respuesta.json().catch(() => null);
            if (detalle?.code === "CUENTA_BLOQUEADA") {
                event.cookies.delete("session", { path: "/" });
                redirect(303, "/cuenta-bloqueada");
            }
        }
    }

    const response = await resolve(event);
    if (event.locals.cuenta) response.headers.set('cache-control', 'private, no-store');
    return response;
}
