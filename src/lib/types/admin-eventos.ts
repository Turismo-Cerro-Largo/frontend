import type { EstadoEvento } from './evento';

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
