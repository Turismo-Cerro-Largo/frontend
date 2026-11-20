import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

import type { Evento } from '$lib/types/evento';

export const load: PageServerLoad = async ({ params, locals, request, fetch }) => {
    const cuenta = locals.cuenta;
    if (!cuenta || cuenta.rol !== 'ORGANIZADOR') error(403, 'Acceso exclusivo para organizadores.');
    if (!/^\d+$/.test(params.id)) error(400, 'ID de evento inválido.');

    let respuesta: Response;
    try {
        respuesta = await fetch(`${backendUrl()}/api/organizador/eventos/${params.id}`, {
            headers: { cookie: request.headers.get('cookie') ?? '' },
            signal: AbortSignal.timeout(10000),
        });
    } catch {
        error(503, 'No se pudo conectar al backend.');
    }
    if (respuesta.status === 404) error(404, 'El evento no existe.');
    if (respuesta.status === 401) error(401, 'Tu sesión venció. Volvé a ingresar.');
    if (respuesta.status === 403) error(403, 'No tenés permisos para consultar este evento.');
    if (!respuesta.ok) error(502, 'No se pudo consultar el evento.');
    const { evento } = (await respuesta.json()) as { evento: Evento };
    if (Number(evento.id_organizador) !== Number(cuenta.id)) error(404, 'El evento no existe.');
    return { evento };
};
