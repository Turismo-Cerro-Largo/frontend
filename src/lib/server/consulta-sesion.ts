import type { Cuenta } from '../types/cuenta';

export type ResultadoSesion = { cuenta: Cuenta | null; status: number; bloqueada: boolean };
const DURACION_CACHE = 30_000;
const MAX_SESIONES = 500;

export function requiereCuenta({ ruta, pathname, aceptaHtml, datos, accion }: {
    ruta: string | null;
    pathname: string;
    aceptaHtml: boolean;
    datos: boolean;
    accion: boolean;
}) {
    return ruta !== null && pathname !== '/api' && !pathname.startsWith('/api/') &&
        (aceptaHtml || datos || accion || ruta.startsWith('/(dashboard)/') || ruta.startsWith('/(autenticacion)/'));
}

export function crearConsultaSesion(consultar: (token: string) => Promise<ResultadoSesion>, ahora = Date.now) {
    const cache = new Map<string, { resultado: ResultadoSesion; vence: number }>();
    const pendientes = new Map<string, Promise<ResultadoSesion>>();
    const copiar = (r: ResultadoSesion): ResultadoSesion => ({ ...r, cuenta: r.cuenta ? { ...r.cuenta } : null });

    return async (token: string, fresca = false): Promise<ResultadoSesion> => {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
        const clave = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
        const guardada = cache.get(clave);
        if (!fresca && guardada && guardada.vence > ahora()) return copiar(guardada.resultado);
        cache.delete(clave);
        const pendiente = pendientes.get(clave);
        if (pendiente) return copiar(await pendiente);

        const consulta = Promise.resolve().then(() => consultar(token)).then(resultado => {
            if (resultado.status === 200 && resultado.cuenta) {
                const tiempo = ahora();
                for (const [id, entrada] of cache) if (entrada.vence <= tiempo) cache.delete(id);
                if (cache.size >= MAX_SESIONES) cache.delete(cache.keys().next().value!);
                cache.set(clave, { resultado: copiar(resultado), vence: tiempo + DURACION_CACHE });
            }
            return resultado;
        }).finally(() => pendientes.delete(clave));
        pendientes.set(clave, consulta);
        return copiar(await consulta);
    };
}
