// src/routes/(dashboard)/organizador/eventos/+page.server.ts
import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

type Estado = 'BORRADOR' | 'PENDIENTE_REVISION' | 'PUBLICADO' | 'RECHAZADO' | 'CANCELADO' | 'FINALIZADO';
type Evento = {
    id: number;
    titulo: string;
    inicio: string;
    estado: Estado;
    categoria: { nombre: string } | null;
};

export const load: PageServerLoad = async ({ locals, request, fetch }) => {
    const cuenta = locals.cuenta;
    if (!cuenta) error(401, 'Tenés que iniciar sesión.');
    if (cuenta.rol !== 'ORGANIZADOR') error(403, 'Acceso exclusivo para organizadores.');
    if (cuenta.estado !== 'APROBADO') error(403, 'La organización todavía no fue aprobada.');

    const cookie = request.headers.get('cookie') ?? '';
    const eventos: Evento[] = [];
    const tamano = 50; // Límite máximo admitido por el backend.

    try {
        while (eventos.length < 5000) {
            const params = new URLSearchParams({ offset: String(eventos.length), limit: String(tamano) });
            const respuesta = await fetch(`${backendUrl()}/api/eventos/organizador/${cuenta.id}?${params}`, {
                headers: { cookie },
                signal: AbortSignal.timeout(10000),
            });
            if (!respuesta.ok) error(respuesta.status, 'No se pudieron consultar los eventos.');
            const lote: Evento[] = await respuesta.json();
            if (!Array.isArray(lote)) error(502, 'Respuesta inválida del backend.');
            eventos.push(...lote);
            if (lote.length < tamano) break;
        }
        if (eventos.length >= 5000) error(503, 'Hay demasiados eventos para cargar en una sola consulta.');
    } catch (e) {
        if (e && typeof e === 'object' && 'status' in e) throw e;
        error(503, 'No se pudo conectar con el backend.');
    }

    return { eventos };
};
