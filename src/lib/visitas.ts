import { dev } from '$app/env';
import * as env from '$app/env/public';

let visitante = '';
let rutaActual = '';
let rolActual = 'VISITANTE';
let inicio = 0;
let acumulado = 0;
let paginaId = '';
let escuchando = false;

export function idVisitante() {
    if (visitante) return visitante;
    try {
        visitante = localStorage.getItem('cl360_visitante') || crypto.randomUUID();
        localStorage.setItem('cl360_visitante', visitante);
    } catch { visitante = crypto.randomUUID(); }
    return visitante;
}

function enviar(evento: string, propiedades: Record<string, unknown>) {
    const cuerpo = JSON.stringify({
        api_key: env.PUBLIC_POSTHOG_KEY || 'phc_uRFh8r84qYyn8u5zwLkdzEdTr4LTanXDaUoE8o23u6kK',
        event: evento,
        properties: {
            distinct_id: idVisitante(),
            $process_person_profile: false,
            $current_url: location.origin + rutaActual,
            $pathname: rutaActual,
            $pageview_id: paginaId,
            rol: rolActual,
            ...propiedades
        },
        timestamp: new Date().toISOString()
    });
    void fetch('https://us.i.posthog.com/i/v0/e/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: cuerpo, keepalive: true, credentials: 'omit'
    }).catch(() => undefined);
}

function guardarTiempo() {
    if (!rutaActual) return;
    if (inicio) acumulado += performance.now() - inicio;
    inicio = 0;
    if (acumulado > 0) {
        enviar('pagina_tiempo', { segundos_activos: Math.round(acumulado / 1000) });
        acumulado = 0;
    }
}

export function registrarVisita(ruta: string, rol?: string) {
    if (dev || env.PUBLIC_POSTHOG_ENABLED === 'false') return;
    if (rutaActual === ruta) { rolActual = rol || 'VISITANTE'; return; }
    guardarTiempo();
    rolActual = rol || 'VISITANTE';
    rutaActual = ruta;
    paginaId = crypto.randomUUID();
    inicio = document.visibilityState === 'visible' ? performance.now() : 0;
    enviar('$pageview', {});
    if (escuchando) return;
    escuchando = true;
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') guardarTiempo();
        else inicio = performance.now();
    });
    window.addEventListener('pagehide', guardarTiempo);
}
