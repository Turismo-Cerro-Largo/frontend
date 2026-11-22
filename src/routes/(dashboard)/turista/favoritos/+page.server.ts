import { consultar } from '#lib/server/turista.ts';
import type { Favorito } from '#lib/types/turista.ts';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ request, parent }) => { await parent(); return consultar<{ favoritos: Favorito[] }>('turista/favoritos', request); };
