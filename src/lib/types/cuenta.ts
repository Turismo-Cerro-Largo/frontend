// src/lib/types/cuenta.ts
export type Cuenta = {
    id: number;
    rol: "TURISTA" | "ADMINISTRADOR" | "ORGANIZADOR";
    nombre: string;
    foto?: string | null;
    estado?: "PENDIENTE_REVISION" | "APROBADO" | "RECHAZADO";
};
