export type Perfil = {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    fecha_nacimiento: string | null;
    genero: 'masculino' | 'femenino' | 'otro' | null;
    telefono: string | null;
    departamento: string | null;
    localidad: string | null;
    foto: string | null;
    creado_en: string;
};
export type Lugar = {
    recursos?: import('$lib/types/agenda').Medio[];
    id: number;
    nombre: string;
    descripcion: string;
    localidad: string;
    direccion: string | null;
    horario: string | null;
    telefono: string | null;
    sitio_web: string | null;
    latitud: string;
    longitud: string;
    categoria: { id: number; nombre: string };
};
export type EstadoValoracion = 'PENDIENTE_REVISION' | 'PUBLICADO' | 'OCULTADO';
export type Valoracion = { id: number; texto: string | null; calificacion: number; estado: EstadoValoracion };
export type ValoracionPropia = Valoracion & {
    id_ubicacion: number;
    creado_en: string;
    ubicacion: { id: number; nombre: string } | null;
};
export type Favorito = { id_ubicacion: number; creado_en: string; lugar: Lugar | null };
export type DetalleLugar = {
    lugar: Lugar;
    promedio: number | null;
    totalValoraciones: number;
    comentarios: { id: number; texto: string | null; calificacion: number; creado_en: string; usuario: { nombres: string } }[];
};
