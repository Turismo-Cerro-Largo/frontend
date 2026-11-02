// Frontend: src/lib/types/evento.ts
export type EstadoEvento = 'BORRADOR' | 'PENDIENTE_REVISION' | 'PUBLICADO' | 'RECHAZADO' | 'CANCELADO' | 'FINALIZADO';

export interface CategoriaEvento {
    id: number;
    nombre: string;
}

export interface RecursoEvento {
    id: number;
    uri: string;
    tipo: 'IMAGEN' | 'VIDEO';
    orden?: number;
}

export interface Evento {
    id: number;
    id_organizador: number;
    titulo: string;
    descripcion: string;
    inicio: string;
    fin: string | null;
    lugar_evento: string | null;
    latitud: string | number | null;
    longitud: string | number | null;
    es_gratuito: boolean;
    precio: string | number | null;
    contacto: string | null;
    estado: EstadoEvento;
    motivo_rechazo: string | null;
    creado_en: string;
    actualizado_en: string;
    id_categoria: number;
    categoria: CategoriaEvento;
    recursos: RecursoEvento[];
}
