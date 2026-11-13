import { createContext } from 'svelte';

export type Emisora = {
    id: string;
    nombre: string;
    localidad: string;
    enlace: string;
};

export const [obtenerReproductor, establecerReproductor] = createContext<{
    reproducir: (emisora: Emisora) => Promise<void>;
    actualizarDisponibles: (emisoras: Emisora[]) => void;
    readonly fallida: Emisora | undefined;
}>();
