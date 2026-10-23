import type { EstadoValoracion } from '$lib/types/turista';

export const estados: Record<EstadoValoracion, string> = {
    PENDIENTE_REVISION: 'Pendiente de revisión',
    PUBLICADO: 'Publicada',
    OCULTADO: 'No publicada',
};
