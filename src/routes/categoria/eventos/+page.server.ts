import { backendUrl } from '$lib/server/backend';
import type { TarjetaCategoria } from '$lib/types/categoria';
import type { PageServerLoad } from './$types';

type EventoAPI = {
    id: number;
    titulo: string;
    descripcion: string;
    inicio: string;
    lugar_evento: string | null;
    latitud: string | number | null;
    longitud: string | number | null;
    es_gratuito: boolean;
    precio: string | number | null;
    recursos: {
        uri: string;
        tipo: string;
    }[];
};

function obtenerImagen(evento: EventoAPI): string | null {
    const uri = evento.recursos.find((recurso) => recurso.tipo === 'IMAGEN')?.uri;

    if (!uri) return null;

    return uri;
}

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const respuesta = await fetch(`${backendUrl()}/api/eventos?limit=50`, { signal: AbortSignal.timeout(10000) });

        if (!respuesta.ok) {
            throw new Error('Error al obtener eventos');
        }

        const eventos = (await respuesta.json()) as EventoAPI[];

        const elementos: TarjetaCategoria[] = eventos.map((evento) => ({
            id: evento.id,
            nombre: evento.titulo,
            descripcion: evento.descripcion,
            localidad: evento.lugar_evento ?? 'Cerro Largo',
            imagen: obtenerImagen(evento),

            fecha: evento.inicio,

            precio: evento.es_gratuito ? 'Entrada gratuita' : evento.precio !== null ? `Precio: ${evento.precio}` : 'Consultar precio',

            latitud: evento.latitud !== null ? Number(evento.latitud) : null,

            longitud: evento.longitud !== null ? Number(evento.longitud) : null,
        }));

        return {
            elementos,
            error: '',
        };
    } catch {
        return {
            elementos: [] as TarjetaCategoria[],
            error: 'No se pudieron cargar los eventos.',
        };
    }
};
