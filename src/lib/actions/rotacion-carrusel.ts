type Opciones = { avanzar: () => void; pausada: () => boolean; total: number; reducirMovimiento: () => void };

export function rotacionCarrusel(nodo: HTMLElement, opciones: Opciones) {
    let visible = typeof IntersectionObserver === 'undefined';
    let encima = false;
    let tocando = false;
    let destruido = false;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
    function programar() {
        clearTimeout(temporizador);
        if (destruido || !visible || document.hidden || encima || tocando || opciones.pausada() || opciones.total < 2 || nodo.contains(document.activeElement)) return;
        temporizador = setTimeout(() => {
            const reproduciendo = [...nodo.querySelectorAll('video')].some(video => !video.paused && !video.ended);
            if (!document.querySelector('dialog[open]') && !reproduciendo && !opciones.pausada()) opciones.avanzar();
            programar();
        }, 8000);
    }
    function reducir() { if (movimiento.matches) opciones.reducirMovimiento(); programar(); }
    function entrar(evento: PointerEvent) { if (evento.pointerType === 'mouse') { encima = true; programar(); } }
    function salir() { encima = false; programar(); }
    function tocar() { tocando = true; programar(); }
    function soltar() { tocando = false; programar(); }
    function enfocar() { clearTimeout(temporizador); }
    function desenfocar() { queueMicrotask(programar); }
    const observador = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entradas => {
        visible = (entradas[0]?.intersectionRatio ?? 0) >= 0.25;
        programar();
    }, { threshold: 0.25 });
    observador?.observe(nodo);
    reducir();
    nodo.addEventListener('pointerenter', entrar);
    nodo.addEventListener('pointerleave', salir);
    nodo.addEventListener('pointerdown', tocar);
    nodo.addEventListener('focusin', enfocar);
    nodo.addEventListener('focusout', desenfocar);
    nodo.addEventListener('scroll', programar, true);
    document.addEventListener('pointerup', soltar);
    document.addEventListener('pointercancel', soltar);
    document.addEventListener('visibilitychange', programar);
    movimiento.addEventListener('change', reducir);
    return {
        update(nuevas: Opciones) { opciones = nuevas; programar(); },
        destroy() {
            destruido = true;
            clearTimeout(temporizador);
            observador?.disconnect();
            nodo.removeEventListener('pointerenter', entrar);
            nodo.removeEventListener('pointerleave', salir);
            nodo.removeEventListener('pointerdown', tocar);
            nodo.removeEventListener('focusin', enfocar);
            nodo.removeEventListener('focusout', desenfocar);
            nodo.removeEventListener('scroll', programar, true);
            document.removeEventListener('pointerup', soltar);
            document.removeEventListener('pointercancel', soltar);
            document.removeEventListener('visibilitychange', programar);
            movimiento.removeEventListener('change', reducir);
        },
    };
}
