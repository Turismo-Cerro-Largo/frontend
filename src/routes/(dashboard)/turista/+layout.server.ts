import type { LayoutServerLoad } from './$types';
import { consultar } from '#lib/server/turista.ts';
import type { Perfil } from '#lib/types/turista.ts';
export const load: LayoutServerLoad = async ({ request, parent }) => {
  await parent();
  return { perfil: await consultar<Perfil>('turista/perfil', request) };
};
