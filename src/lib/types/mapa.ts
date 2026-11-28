import type { EventoPublico } from './agenda';

export type CategoriaMarcador = { id?: number; nombre: string; icono_url?: string | null; color?: string };
export type LugarMapa = { id: number; nombre: string; localidad: string; latitud: string | number; longitud: string | number; categoria: CategoriaMarcador; evento?: EventoPublico };
