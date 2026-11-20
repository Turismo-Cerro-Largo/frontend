import { consultar } from '$lib/server/turista';
import type { LocalidadPublica } from '$lib/types/localidad';
import type { Lugar } from '$lib/types/turista';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, request, url }) => {
    const localidades = await consultar<LocalidadPublica[]>('localidades', request);
    const localidad = localidades.find((item) => item.slug === params.slug) ??
        localidades.find((item) => item.slug.toLowerCase() === params.slug.toLowerCase());
    if (!localidad) error(404, 'Localidad no encontrada.');
    const ruta = '/localidades/' + encodeURIComponent(localidad.slug);
    if (params.slug !== localidad.slug) redirect(308, ruta + url.search);

    const pagina = Math.max(1, Math.min(10_000, Math.floor(Number(url.searchParams.get('pagina')) || 1)));
    const filtros = new URLSearchParams({ localidad: localidad.nombre, pagina: String(pagina) });
    const catalogo = await consultar<{ lugares: Lugar[]; total: number; pagina: number; porPagina: number }>(
        `lugares?${filtros}`, request
    );
    const canonical = new URL(ruta, url.origin);
    if (pagina > 1) canonical.searchParams.set('pagina', String(pagina));
    return { ...catalogo, localidad, canonical: canonical.href };
};
