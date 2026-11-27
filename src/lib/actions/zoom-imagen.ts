import { tick } from 'svelte';

export function zoomImagen(visor: HTMLElement, opciones: { leer: () => number; cambiar: (valor: number) => void }) {
    const dedos = new Map<number, { x: number; y: number }>();
    let distancia = 0;
    let revision = 0;

    function separar() {
        const puntos = [...dedos.values()];
        return puntos.length === 2 ? Math.hypot(puntos[1].x - puntos[0].x, puntos[1].y - puntos[0].y) : 0;
    }

    function iniciar(evento: PointerEvent) {
        if (evento.pointerType !== 'touch') return;
        dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
        visor.setPointerCapture(evento.pointerId);
        distancia = separar();
    }

    async function ampliar(siguiente: number, x: number, y: number) {
        const previo = opciones.leer();
        const rect = visor.getBoundingClientRect();
        const centroX = x - rect.left;
        const centroY = y - rect.top;
        const izquierda = (visor.scrollLeft + centroX) * siguiente / previo - centroX;
        const arriba = (visor.scrollTop + centroY) * siguiente / previo - centroY;
        const actual = ++revision;
        opciones.cambiar(siguiente);
        await tick();
        if (actual !== revision) return;
        visor.scrollLeft = izquierda;
        visor.scrollTop = arriba;
    }

    function rueda(evento: WheelEvent) {
        if (evento.ctrlKey || evento.metaKey || !evento.deltaY) return;
        evento.preventDefault();
        const unidad = evento.deltaMode === 1 ? 16 : evento.deltaMode === 2 ? visor.clientHeight : 1;
        const factor = Math.exp(Math.max(-1, Math.min(1, -evento.deltaY * unidad * 0.0025)));
        const siguiente = Math.max(1, Math.min(3, opciones.leer() * factor));
        void ampliar(siguiente, evento.clientX, evento.clientY);
    }

    function mover(evento: PointerEvent) {
        const anterior = dedos.get(evento.pointerId);
        if (!anterior) return;
        dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
        if (dedos.size === 1) {
            visor.scrollLeft += anterior.x - evento.clientX;
            visor.scrollTop += anterior.y - evento.clientY;
            return;
        }
        if (dedos.size !== 2) return;
        const nuevaDistancia = separar();
        if (nuevaDistancia === 0) return;
        const previo = opciones.leer();
        const siguiente = Math.max(1, Math.min(3, previo * nuevaDistancia / (distancia || nuevaDistancia)));
        distancia = nuevaDistancia;
        const puntos = [...dedos.values()];
        void ampliar(siguiente, (puntos[0].x + puntos[1].x) / 2, (puntos[0].y + puntos[1].y) / 2);
    }

    function terminar(evento: PointerEvent) {
        dedos.delete(evento.pointerId);
        distancia = separar();
        revision++;
    }

    visor.addEventListener('pointerdown', iniciar);
    visor.addEventListener('pointermove', mover);
    visor.addEventListener('pointerup', terminar);
    visor.addEventListener('pointercancel', terminar);
    visor.addEventListener('lostpointercapture', terminar);
    visor.addEventListener('wheel', rueda, { passive: false });
    return {
        destroy() {
            revision++;
            dedos.clear();
            visor.removeEventListener('pointerdown', iniciar);
            visor.removeEventListener('pointermove', mover);
            visor.removeEventListener('pointerup', terminar);
            visor.removeEventListener('pointercancel', terminar);
            visor.removeEventListener('lostpointercapture', terminar);
            visor.removeEventListener('wheel', rueda);
        },
    };
}
