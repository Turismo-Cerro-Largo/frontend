export type Cuenta = {
    id: number;
    rol: "TURISTA" | "ADMINISTRADOR" | "ORGANIZADOR";
    nombre: string;
    estado?: "PENDIENTE_REVISION" | "APROBADO" | "RECHAZADO";
};