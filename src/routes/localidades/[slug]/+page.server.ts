import { localidades } from '$lib/localidades';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ params }) => {
    const localidad = localidades.find(([slug]) => slug.toLowerCase() === params.slug.toLowerCase());
    if (!localidad) error(404,'Localidad no encontrada.');
    redirect(307, `/lugares?localidad=${encodeURIComponent(localidad[1])}`);
};
