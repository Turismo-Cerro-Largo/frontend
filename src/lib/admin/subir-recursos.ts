import type { RecursoSubido } from '$lib/types/archivo';


const LIMITE_LOTE = 80 * 1024 * 1024;

export async function subirRecursosDelFormulario(
    formulario: HTMLFormElement,
    input: HTMLInputElement,
    archivos: File[],
    alSubir: (recursos: RecursoSubido[], archivos: File[]) => void
) {
    let lote: File[] = [];
    let tamanio = 0;

    async function enviarLote() {
        if (!lote.length) return;
        const transferencia = new DataTransfer();
        for (const archivo of lote) transferencia.items.add(archivo);
        input.files = transferencia.files;
        const respuesta = await fetch('/api/admin/ubicaciones/recursos/upload', {
            method: 'POST',
            credentials: 'include',
            body: new FormData(formulario)
        });
        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(datos.message ?? datos.error ?? 'No se pudieron subir los archivos (' + respuesta.status + ').');
        if (!Array.isArray(datos.recursos) || datos.recursos.length !== lote.length)
            throw new Error('La respuesta de la carga de archivos está incompleta.');
        alSubir(datos.recursos as RecursoSubido[], lote);
        lote = [];
        tamanio = 0;
    }

    try {
        for (const archivo of archivos) {
            if (archivo.size > LIMITE_LOTE)
                throw new Error(archivo.name + ': el archivo supera los 80 MB permitidos.');
            if (tamanio + archivo.size > LIMITE_LOTE) await enviarLote();
            lote.push(archivo);
            tamanio += archivo.size;
        }
        await enviarLote();
    } finally {
        input.value = '';
    }
}