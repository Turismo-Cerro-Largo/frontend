export function imagenFallida(contenedor: HTMLElement) {
    function ocultar(evento: Event) {
        if (evento.target instanceof HTMLImageElement) evento.target.style.display = 'none';
    }
    contenedor.addEventListener('error', ocultar, true);
    for (const imagen of contenedor.querySelectorAll('img')) {
        if (imagen.complete && imagen.currentSrc && imagen.naturalWidth === 0) imagen.style.display = 'none';
    }
    return { destroy() { contenedor.removeEventListener('error', ocultar, true); } };
}
