import { error, json } from '@sveltejs/kit';
import { consultar } from '$lib/server/turista';
import type { DetalleLugar } from '$lib/types/turista';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
    if (!/^\d+$/.test(params.id) || !Number.isSafeInteger(Number(params.id))) {
        error(404, 'Lugar no encontrado.');
    }

    return json(await consultar<DetalleLugar>(`lugares/${params.id}`, request));
};
