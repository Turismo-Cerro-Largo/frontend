
export type TarjetaCategoria = {
    id: number;
    nombre: string;
    descripcion: string;
    localidad: string;
    imagen: string | null;
    latitud: number | null;
    longitud: number | null;
    direccion?: string | null;
    telefono?: string | null;
    sitio_web?: string | null;
    fecha?: string | null;
    precio?: string | null;
};

export type DatosCategoria = {
    elementos: TarjetaCategoria[];
    error: string;
};
