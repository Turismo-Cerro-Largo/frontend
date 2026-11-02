import { consultar } from '$lib/server/turista';
import type { ValoracionPropia } from '$lib/types/turista';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ request, parent }) => { await parent(); return consultar<{ valoraciones: ValoracionPropia[] }>('turista/valoraciones', request); };
