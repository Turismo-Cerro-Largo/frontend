import { consultar } from '$lib/server/turista';
import type { Favorito } from '$lib/types/turista';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ request, parent }) => { await parent(); return consultar<{ favoritos: Favorito[] }>('turista/favoritos', request); };
