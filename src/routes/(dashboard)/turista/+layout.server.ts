import type { LayoutServerLoad } from './$types';
import { consultar } from '$lib/server/turista';
import type { Perfil } from '$lib/turista/types';
export const load: LayoutServerLoad = async ({ request, parent }) => {
  await parent();
  return { perfil: await consultar<Perfil>('turista/perfil', request) };
};
