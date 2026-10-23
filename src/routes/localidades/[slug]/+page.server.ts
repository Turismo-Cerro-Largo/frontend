import { consultar } from '$lib/server/turista';
import type { LocalidadPublica } from '$lib/types/localidad';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, request }) => {
    const localidades = await consultar<LocalidadPublica[]>('localidades', request);
    const localidad = localidades.find((item) => item.slug.toLowerCase() === params.slug.toLowerCase());
    if (!localidad) error(404, 'Localidad no encontrada.');
    redirect(307, '/lugares?localidad=' + encodeURIComponent(localidad.nombre));
};