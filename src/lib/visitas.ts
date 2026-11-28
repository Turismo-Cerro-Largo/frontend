import { dev } from '$app/env';
import * as env from '$app/env/public';
import { contextoAnalitica, type CuentaAnalitica } from '#lib/identidad-analitica.ts';

let visitante = '';
let rutaActual = '';
let rolActual = 'VISITANTE';
let inicio = 0;
let acumulado = 0;
let paginaId = '';
let escuchando = false;
let cuentaId = '';
let sesionId = '';
let excluido = false;

export function actualizarIdVisitante(id: string) {
    visitante = id;
    try { localStorage.setItem('cl360_visitante', id); } catch {}
}

export function identidadAnalitica() {
    return { id: cuentaId || idVisitante(), identificada: Boolean(cuentaId), sesionId, excluido, rol: rolActual };
}

function cambiarContexto(id: string, bloqueado: boolean) {
    const contexto = bloqueado ? 'EXCLUIDO' : id || 'VISITANTE';
    try {
        const anterior = sessionStorage.getItem('cl360_contexto');
        if (anterior && anterior !== contexto && anterior !== 'VISITANTE') {
            visitante = crypto.randomUUID();
            localStorage.setItem('cl360_visitante', visitante);
        }
        sesionId = anterior === contexto ? sessionStorage.getItem('cl360_sesion_analitica') || '' : '';
        sesionId ||= crypto.randomUUID();
        sessionStorage.setItem('cl360_contexto', contexto);
        sessionStorage.setItem('cl360_sesion_analitica', sesionId);
    } catch {
        if (cuentaId !== id || excluido !== bloqueado) visitante = crypto.randomUUID();
        if (!sesionId || cuentaId !== id || excluido !== bloqueado) sesionId = crypto.randomUUID();
    }
    cuentaId = id;
    excluido = bloqueado;
}

export function idVisitante() {
    if (visitante) return visitante;
    try {
        visitante = localStorage.getItem('cl360_visitante') || crypto.randomUUID();
        localStorage.setItem('cl360_visitante', visitante);
    } catch { visitante = crypto.randomUUID(); }
    return visitante;
}

function enviar(evento: string, propiedades: Record<string, unknown>) {
    if (excluido) return;
    const cuerpo = JSON.stringify({
        api_key: env.PUBLIC_POSTHOG_KEY || 'phc_uRFh8r84qYyn8u5zwLkdzEdTr4LTanXDaUoE8o23u6kK',
        event: evento,
        properties: {
            distinct_id: cuentaId || idVisitante(),
            $process_person_profile: Boolean(cuentaId),
            $is_identified: Boolean(cuentaId),
            sesion_analitica: sesionId,
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

export function registrarVisita(ruta: string, cuenta?: CuentaAnalitica) {
    if (dev || env.PUBLIC_POSTHOG_ENABLED === 'false') return;
    const contexto = contextoAnalitica(cuenta, ruta);
    if (rutaActual === ruta && cuentaId === contexto.id && excluido === contexto.excluido) return;
    guardarTiempo();
    cambiarContexto(contexto.id, contexto.excluido);
    rolActual = contexto.rol;
    rutaActual = excluido ? '' : ruta;
    if (excluido) return;
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
