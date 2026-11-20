import { cargarMapa } from '$lib/server/mapa';
import { consultar } from '$lib/server/turista';
import { diaUruguay } from '$lib/utils/agenda';
import type { EventoPublico } from '$lib/types/agenda';
import type { DetalleLugar } from '$lib/types/turista';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    const hoy = diaUruguay(new Date());
    const [mapa, agenda] = await Promise.all([
        cargarMapa(event),
        consultar<EventoPublico[]>(`eventos?desde=${hoy}&limit=100`, event.request).catch(() => null)
    ]);

    const categorias = new Set<string>();
    const elegidos = mapa.lugares.filter(({ categoria }) => {
        if (categorias.has(categoria.nombre)) return false;
        categorias.add(categoria.nombre);
        return true;
    });
    const recomendaciones = await Promise.all(
        [...elegidos, ...mapa.lugares.filter((lugar) => !elegidos.includes(lugar))].slice(0, 3).map(async (lugar) => {
            const detalle = await consultar<DetalleLugar>(`lugares/${lugar.id}`, event.request).catch(() => null);
            const foto = detalle?.lugar.recursos?.find((recurso) => recurso.tipo === 'IMAGEN');
            return { lugar, imagen: foto ? `/api/recursos/${foto.id}` : null };
        })
    );
    const eventos = (agenda ?? []).filter(({ latitud, longitud }) =>
        latitud !== null && longitud !== null && latitud !== '' && longitud !== '' &&
        Math.abs(Number(latitud)) <= 90 && Math.abs(Number(longitud)) <= 180
    );

    return { ...mapa, eventos, recomendaciones, errorEventos: agenda === null };
};
