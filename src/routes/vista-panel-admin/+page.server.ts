import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

// Vista exclusivamente local de la interfaz con datos ficticios; no concede una sesión.
export const load = () => {
    if (!dev) error(404, 'Página no encontrada');
    return {};
};
