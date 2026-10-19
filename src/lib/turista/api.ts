export async function enviar<T>(ruta: string, method: string, body?: unknown): Promise<T> {
    const esFormulario = body instanceof FormData;
    const respuesta = await fetch(`/api/turista/${ruta}`, {
        method,
        headers: body && !esFormulario ? { 'content-type': 'application/json' } : undefined,
        body: body ? (esFormulario ? body : JSON.stringify(body)) : undefined,
    }).catch(() => {
        throw new Error('No se pudo conectar. Revisá tu conexión e intentá nuevamente.');
    });
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) throw new Error(respuesta.status === 401 ? 'Tu sesión venció. Volvé a ingresar.' : datos?.message || 'No se pudo completar la acción.');
    return datos as T;
}
