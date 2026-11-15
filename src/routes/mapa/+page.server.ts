import { cargarMapa } from '$lib/server/mapa';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => cargarMapa(event);
