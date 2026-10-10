import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export function backendUrl() {
    const value=env.API_URL?.trim() || (dev ? 'http://127.0.0.1:4000' : '');
    if(!value) throw new Error('Falta configurar API_URL.');
    return value.replace(/\/+$/,'');
}
