export function abrirDialogo(nodo: HTMLDialogElement) {
    nodo.querySelector('[data-foco-inicial]')?.setAttribute('autofocus', '');
    nodo.showModal();
}

export function dialogo(nodo: HTMLDialogElement) {
    abrirDialogo(nodo);
    return {
        destroy() {
            nodo.close();
        },
    };
}
