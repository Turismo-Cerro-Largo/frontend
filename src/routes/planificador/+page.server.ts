import { redirect } from '@sveltejs/kit';
export const load = ({ url }: {url: URL}) => redirect(307, `/eventos${url.search}`);
