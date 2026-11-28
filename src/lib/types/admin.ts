type Evento = { id: number; titulo: string; estado: string; creado_en: string };
type Organizador = { id: number; nombre_organizacion: string; creado_en: string };
type Mes = { clave: string; mes: string; total: number };
export type ResumenAdmin = {
    totales: { usuarios: number; organizadores: number; eventos: number; eventosPublicados: number; ubicaciones: number; empresas: number; horariosPublicados: number };
    pendientes: { eventos: number; organizadores: number };
    esteMes: { usuarios: number; eventos: number };
    eventosPorMes: Mes[];
    ultimosEventos: Evento[];
    ultimosOrganizadores: Organizador[];
};
