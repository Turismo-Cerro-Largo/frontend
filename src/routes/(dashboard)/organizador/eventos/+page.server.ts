// src/routes/(dashboard)/organizador/eventos/+page.server.ts
import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

import type { Evento } from '$lib/types/evento';

export const load: PageServerLoad = async ({ locals, request, fetch }) => {
    const cuenta = locals.cuenta;
    if (!cuenta) error(401, 'Tenés que iniciar sesión.');
    if (cuenta.rol !== 'ORGANIZADOR') error(403, 'Acceso exclusivo para organizadores.');
    if (cuenta.estado !== 'APROBADO') error(403, 'La organización todavía no fue aprobada.');

    let respuesta: Response;
    try {
        respuesta = await fetch(backendUrl() + '/api/organizador/eventos', {
            headers: { cookie: request.headers.get('cookie') ?? '' },
            signal: AbortSignal.timeout(10000),
        });
    } catch {
        error(503, 'No se pudo conectar con el backend.');
    }
    if (!respuesta.ok) error(respuesta.status, 'No se pudieron consultar los eventos.');
    const datos = (await respuesta.json()) as { eventos: Evento[] };
    if (!Array.isArray(datos.eventos)) error(502, 'Respuesta inválida del backend.');
    return { eventos: datos.eventos };
};
