export type Medio = { id: number; tipo: 'IMAGEN' | 'VIDEO'; descripcion: string | null; uri?: string };
export type EventoPublico = {
    id: number;
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
    recursos: Medio[];
};
