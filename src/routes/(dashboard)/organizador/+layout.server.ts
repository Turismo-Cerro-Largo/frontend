import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const cuenta = locals.cuenta;
    if (!cuenta) error(401, 'Iniciá sesión para acceder al panel de organizadores.');
    if (cuenta.rol !== 'ORGANIZADOR') error(403, 'Esta sección es exclusiva para organizadores.');

    // Una cuenta pendiente/rechazada puede ver el panel y su perfil,
    // pero no puede operar sobre eventos hasta ser aprobada.
    return { estadoOrganizador: cuenta.estado ?? 'PENDIENTE_REVISION' };
};
