import { consultar } from '$lib/server/turista';
import type { LocalidadPublica } from '$lib/types/localidad';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => ({
    localidades: await consultar<LocalidadPublica[]>('localidades', request)
});