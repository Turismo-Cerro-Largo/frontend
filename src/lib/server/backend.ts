import { dev } from '$app/env';
import * as env from '$app/env/private';

export function backendUrl() {
    const value=env.API_URL?.trim() || (dev ? 'http://127.0.0.1:4000' : '');
    if(!value) throw new Error('Falta configurar API_URL.');
    return value.replace(/\/+$/,'');
}
