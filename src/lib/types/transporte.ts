export type HorarioOmnibus = {
    id: number;
    origen: string;
    destino: string;
    hora_salida: string;
    hora_llegada: string | null;
    dias: string;
    tipo_servicio: string;
    precio: string | null;
    empresa: { nombre: string; telefono: string | null; sitio_web: string | null };
};
