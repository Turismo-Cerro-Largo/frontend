import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const cuenta = locals.cuenta;
    if (!cuenta) error(401, 'Tenés que iniciar sesión.');
    if (cuenta.rol !== 'ORGANIZADOR') error(403, 'Acceso exclusivo para organizadores.');
    if (cuenta.estado !== 'APROBADO') error(403, 'Tu cuenta todavía no fue verificada.');
    return {};
};
