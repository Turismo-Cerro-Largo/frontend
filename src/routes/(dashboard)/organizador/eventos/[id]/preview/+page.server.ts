import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

type Recurso = { id?: number; uri: string; tipo: string; orden: number };
type Evento = {
    id: number;
    id_organizador: number;
    titulo: string;
    descripcion: string;
    inicio: string;
    fin: string | null;
    estado: string;
    lugar_evento: string | null;
    latitud: string | number | null;
    longitud: string | number | null;
    es_gratuito: boolean;
    precio: string | number | null;
    contacto: string | null;
    motivo_rechazo: string | null;
    categoria?: { nombre: string } | null;
    recursos?: Recurso[];
};

export const load: PageServerLoad = async ({ params, locals, request, fetch }) => {
    const cuenta = locals.cuenta;
    if (!cuenta || cuenta.rol !== 'ORGANIZADOR') error(403, 'Acceso exclusivo para organizadores.');
    if (!/^\d+$/.test(params.id)) error(400, 'ID de evento inválido.');

    let respuesta: Response;
    try {
        respuesta = await fetch(`${backendUrl()}/api/eventos/${params.id}`, {
            headers: { cookie: request.headers.get('cookie') ?? '' },
            signal: AbortSignal.timeout(10000),
        });
    } catch {
        error(503, 'No se pudo conectar al backend.');
    }
    if (respuesta.status === 404) error(404, 'El evento no existe.');
    if (!respuesta.ok) error(502, 'No se pudo consultar el evento.');
    const evento = (await respuesta.json()) as Evento;
    if (Number(evento.id_organizador) !== Number(cuenta.id)) error(404, 'El evento no existe.');
    return { evento };
};
