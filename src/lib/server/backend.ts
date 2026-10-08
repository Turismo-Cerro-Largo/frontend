import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export function backendUrl() {
    const direccion = env.API_URL?.trim() || (dev ? 'http://127.0.0.1:4000' : '');
    if (!direccion) throw new Error('Configurá API_URL para conectarte al backend.');
    return direccion.replace(/\/+$/, '');
}
