import { redirect } from '@sveltejs/kit';
export const load = ({ url }) => redirect(303, '/lugares' + url.search);
