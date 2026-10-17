/**
 * Cache corto para precargar eventos desde enlaces con hover/focus.
 * No reemplaza la API ni persiste datos en el navegador.
 */
export type EstadoEvento =
    | 'BORRADOR'
    | 'PENDIENTE_REVISION'
    | 'PUBLICADO'
    | 'RECHAZADO'
    | 'CANCELADO'
    | 'FINALIZADO';

export type EventoResumen = {
    id: number;
    titulo: string;
    estado: EstadoEvento;
    inicio: string;
    creado_en: string;
    lugar_evento: string | null;
    categoria: { nombre: string } | null;
    organizador: { id: number; nombre_organizacion: string } | null;
};

export type EventoDetalle = EventoResumen & {
    descripcion: string;
    fin: string | null;
    latitud: string | null;
    longitud: string | null;
    es_gratuito: boolean;
    precio: string | null;
    contacto: string | null;
    motivo_rechazo: string | null;
    organizador: { id: number; nombre_organizacion: string; rut: string | null } | null;
    recursos: { uri: string; tipo: string | null; orden: number }[];
};

export type RespuestaCalendario = {
    mes: string;
    total: number;
    eventos: EventoResumen[];
};

export const etiquetasEstado: Record<EstadoEvento, string> = {
    BORRADOR: 'Borrador',
    PENDIENTE_REVISION: 'Pendiente',
    PUBLICADO: 'Publicado',
    RECHAZADO: 'Rechazado',
    CANCELADO: 'Cancelado',
    FINALIZADO: 'Finalizado',
};

const VIDA_CACHE_MS = 15_000;
type Entrada<T> = { vence: number; solicitud: Promise<T> };
const cacheCalendario = new Map<string, Entrada<RespuestaCalendario>>();
const cacheDetalle = new Map<number, Entrada<EventoDetalle>>();

function obtenerDeCache<K, T>(cache: Map<K, Entrada<T>>, clave: K, cargar: () => Promise<T>): Promise<T> {
    const actual = cache.get(clave);
    if (actual && actual.vence > Date.now()) return actual.solicitud;

    const solicitud = cargar().catch((e: unknown) => {
        if (cache.get(clave)?.solicitud === solicitud) cache.delete(clave);
        throw e;
    });
    cache.set(clave, { vence: Date.now() + VIDA_CACHE_MS, solicitud });
    return solicitud;
}

async function pedirJSON<T>(ruta: string): Promise<T> {
    const res = await fetch(ruta, { credentials: 'include' });
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('No tenés permisos para consultar estos eventos.');
        throw new Error(`No se pudieron cargar los eventos (HTTP ${res.status}).`);
    }
    return (await res.json()) as T;
}

export function mesValido(mes: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(mes);
}

export function fechaUruguay(valor: string | Date): string {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Montevideo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(typeof valor === 'string' ? new Date(valor) : valor);
    const dato = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? '';
    return `${dato('year')}-${dato('month')}-${dato('day')}`;
}

export function mesActualUruguay(): string {
    return fechaUruguay(new Date()).slice(0, 7);
}

export function mesDeEvento(inicio: string): string {
    return fechaUruguay(inicio).slice(0, 7);
}

export function consultarCalendario(mes: string, estado = '', buscar = ''): Promise<RespuestaCalendario> {
    if (!mesValido(mes)) return Promise.reject(new Error('El mes seleccionado no es válido.'));
    const parametros = new URLSearchParams({ mes });
    if (estado) parametros.set('estado', estado);
    if (buscar.trim()) parametros.set('buscar', buscar.trim());
    const clave = parametros.toString();
    return obtenerDeCache(cacheCalendario, clave, () =>
        pedirJSON<RespuestaCalendario>(`/api/admin/eventos/calendario?${clave}`),
    );
}

export function precargarCalendario(mes: string, estado = '', buscar = ''): void {
    void consultarCalendario(mes, estado, buscar).catch(() => {
        // Los errores se muestran al navegar, no durante el hover.
    });
}

export function invalidarCalendario(): void {
    cacheCalendario.clear();
}

export function consultarDetalle(id: number): Promise<EventoDetalle> {
    if (!Number.isSafeInteger(id) || id <= 0) return Promise.reject(new Error('ID de evento inválido.'));
    return obtenerDeCache(cacheDetalle, id, () => pedirJSON<EventoDetalle>(`/api/admin/eventos/${id}`));
}

export function precargarDetalle(id: number): void {
    void consultarDetalle(id).catch(() => {
        // Se informa el error al abrir el detalle.
    });
}

export function invalidarDetalle(id?: number): void {
    if (id === undefined) cacheDetalle.clear();
    else cacheDetalle.delete(id);
}
