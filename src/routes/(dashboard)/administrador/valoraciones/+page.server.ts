import { consultar } from '$lib/server/turista';
import type { Valoracion } from '$lib/turista/types';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ request, url, parent, setHeaders }) => {
  await parent(); setHeaders({ 'cache-control': 'private, no-store' });
  const elegido = url.searchParams.get('estado') || 'PENDIENTE_REVISION';
  const estado = ['PENDIENTE_REVISION', 'PUBLICADO', 'OCULTADO'].includes(elegido) ? elegido : 'PENDIENTE_REVISION';
  const pagina = Math.floor(Math.max(1, Math.min(10000, Number(url.searchParams.get('pagina')) || 1)));
  const datos = await consultar<{ valoraciones: (Valoracion & { usuario: { nombres: string }; ubicacion: { id: number; nombre: string }; creado_en: string })[]; total: number; pagina: number; porPagina: number }>(`moderacion-valoraciones?estado=${estado}&pagina=${pagina}`, request);
  return { ...datos, estado };
};
