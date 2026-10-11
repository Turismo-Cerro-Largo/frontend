// src/routes/(dashboard)/administrador/categorias/+page.server.ts

import { API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 10);

    if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        error(400, 'Parametros de paginacion invalidos.');
    }

    let respuesta: Response;

    try {
        respuesta = await fetch(`${API_URL}/api/categorias?offset=${offset}&limit=${limit}`);
    } catch {
        error(503, 'No se pudo conectar con el servidor.');
    }

    if (!respuesta.ok) {
        error(respuesta.status, 'No se pudieron cargar las categorias.');
    }

    const { categorias, total } = await respuesta.json();

    return { categorias, total };
};
