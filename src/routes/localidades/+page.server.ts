import { consultar } from '#lib/server/turista.ts';
import type { LocalidadPublica } from '#lib/types/localidad.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => ({
    localidades: await consultar<LocalidadPublica[]>('localidades', request)
});