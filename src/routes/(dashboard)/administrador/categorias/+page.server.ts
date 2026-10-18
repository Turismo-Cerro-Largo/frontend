import { API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    let response: Response;
    try {
        response = await fetch(`${API_URL}/api/categorias`);
    } catch {
        error(503, 'No se pudo conectar con el servidor de categorías.');
    }
    if (!response.ok) error(response.status, 'No se pudieron cargar las categorías.');
    const result = await response.json();
    return { categorias: result.categorias ?? [] };
};
