import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export function backendUrl() {
    const value = env.API_URL?.trim() || (dev ? 'http://127.0.0.1:4000' : '');
    if (!value) throw new Error('Falta configurar API_URL.');
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/')
        throw new Error('API_URL debe ser el origen del backend, sin /api.');
    if (!dev && url.protocol !== 'https:') throw new Error('API_URL debe usar HTTPS en producción.');
    return url.origin;
}
