export type CuentaAnalitica = { id: number; rol: string } | null | undefined;

export function contextoAnalitica(cuenta: CuentaAnalitica, ruta: string) {
    const excluido = cuenta?.rol === 'ADMINISTRADOR' || /^\/administrador(?:\/|$)/.test(ruta);
    const identificada = !excluido && cuenta && ['TURISTA', 'ORGANIZADOR'].includes(cuenta.rol);
    return {
        excluido,
        id: identificada ? `cuenta:${cuenta.id}` : '',
        rol: identificada ? cuenta.rol : 'VISITANTE',
    };
}
