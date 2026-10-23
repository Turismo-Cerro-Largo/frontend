import type { LocalidadPublica } from '$lib/types/localidad';

export async function obtenerLocalidadesPublicas(): Promise<LocalidadPublica[]> {
    const respuesta = await fetch('/api/localidades');
    if (!respuesta.ok) throw new Error('No se pudieron cargar las localidades.');
    return (await respuesta.json()) as LocalidadPublica[];
}