import { radiosDeCerroLargo } from '$lib/server/radios';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => ({
    radios: await radiosDeCerroLargo(fetch),
    canonical: new URL('/radios-locales', url.origin).href,
});
