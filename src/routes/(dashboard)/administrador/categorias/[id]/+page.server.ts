// src/routes/(dashboard)/administrador/categorias/[id]/+page.server.ts

import { API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const respuesta = await fetch(`${API_URL}/api/categorias/${params.id}`);

    if (!respuesta.ok) {
        error(respuesta.status, 'No se pudo cargar la categoría.');
    }

    const categoria = await respuesta.json();

    return { categoria };
};
