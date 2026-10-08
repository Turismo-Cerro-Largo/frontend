// $lib/hooks/isMobile.svelte.ts
import { browser } from '$app/environment';

const instancias = new Map<number, { current: boolean }>();

function crear(breakpoint: number) {
    const mq = browser ? window.matchMedia(`(max-width: ${breakpoint}px)`) : null;
    let matches = $state(mq?.matches ?? false);

    mq?.addEventListener('change', (e) => {
        matches = e.matches;
    });

    return {
        get current() {
            return matches;
        },
    };
}

export function isMobile(breakpoint = 767) {
    let instancia = instancias.get(breakpoint);
    if (!instancia) {
        instancia = crear(breakpoint);
        instancias.set(breakpoint, instancia);
    }
    return instancia;
}
