import { dev } from '$app/env';
import * as env from '$app/env/public';
import type { PostHog } from 'posthog-js';
import { idVisitante, identidadAnalitica, actualizarIdVisitante } from '#lib/visitas.ts';

let cliente: PostHog | undefined;
let pendiente: Promise<PostHog | undefined> | undefined;
let version = 0;
let identidadCliente = '';
let bloqueada = false;

async function cargar() {
    if (dev || env.PUBLIC_POSTHOG_ENABLED === 'false' || bloqueada) return;
    pendiente ??= import('posthog-js').then(({ default: posthog }) => {
        if (bloqueada || identidadAnalitica().excluido) return;
        posthog.init(env.PUBLIC_POSTHOG_KEY || 'phc_uRFh8r84qYyn8u5zwLkdzEdTr4LTanXDaUoE8o23u6kK', {
            api_host: 'https://us.i.posthog.com',
            autocapture: false,
            capture_pageview: false,
            capture_pageleave: false,
            capture_exceptions: false,
            capture_performance: false,
            capture_heatmaps: false,
            capture_dead_clicks: false,
            disable_session_recording: true,
            person_profiles: 'identified_only',
            persistence: 'memory',
            bootstrap: { distinctID: idVisitante(), isIdentifiedID: false },
            advanced_disable_feature_flags: true,
            mask_all_text: true,
            mask_all_element_attributes: true,
            session_recording: {
                maskAllInputs: true,
                maskTextSelector: '*',
                blockSelector: 'input[type="file"], img, video, iframe',
                recordHeaders: false,
                recordBody: false
            },
            before_send(event) {
                if (!event || bloqueada || identidadAnalitica().excluido) return null;
                for (const clave of ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer']) {
                    const valor = event.properties[clave];
                    if (typeof valor !== 'string') continue;
                    try {
                        const url = new URL(valor);
                        event.properties[clave] = url.origin + url.pathname;
                    } catch { delete event.properties[clave]; }
                }
                delete event.properties.$set;
                delete event.properties.$set_once;
                return event;
            }
        });
        cliente = posthog;
        identidadCliente = idVisitante();
        return posthog;
    }).catch(() => undefined);
    const cargado = await pendiente;
    if (!cargado) pendiente = undefined;
    return cargado;
}

export function pausarAnalitica() {
    version++;
    cliente?.stopSessionRecording();
    cliente?.set_config({ autocapture: false, capture_pageleave: false, capture_exceptions: false, capture_performance: false, capture_heatmaps: false, capture_dead_clicks: false });
}

export async function actualizarAnalitica(rol: string | undefined, ruta: string) {
    pausarAnalitica();
    const actual = version;
    const identidad = identidadAnalitica();
    bloqueada = identidad.excluido;
    if (bloqueada) {
        cliente?.reset(true);
        identidadCliente = '';
        return;
    }
    const organizador = rol === 'ORGANIZADOR' && /^\/organizador(?:\/|$)/.test(ruta);
    const resena = rol === 'TURISTA' && /^\/lugares\/[^/]+$/.test(ruta);
    const registro = ruta === '/register';
    if (!identidad.identificada && !cliente && !organizador && !resena && !registro) return;
    const ph = await cargar();
    if (!ph || actual !== version) return;
    if (identidadCliente !== identidad.id) {
        if (identidadCliente.startsWith('cuenta:') || !identidadCliente) ph.reset(true);
        if (identidad.identificada) ph.identify(identidad.id);
        else actualizarIdVisitante(ph.get_distinct_id());
        identidadCliente = ph.get_distinct_id();
    }
    ph.register({ rol: identidad.rol, sesion_analitica: identidad.sesionId });
    if (!organizador && !resena && !registro) return;
    ph.set_config({
        autocapture: registro ? false : {
            dom_event_allowlist: ['click', 'change', 'submit'],
            element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea'],
            css_selector_allowlist: resena ? ['[data-analitica="resena"]'] : undefined,
            capture_value_css_selector_allowlist: [],
            capture_copied_text: false
        },
        capture_pageleave: false,
        capture_exceptions: { capture_unhandled_errors: true, capture_unhandled_rejections: true, capture_console_errors: false },
        capture_performance: { web_vitals: true, network_timing: false },
        capture_heatmaps: organizador,
        capture_dead_clicks: organizador
    });
    if (organizador || resena) ph.startSessionRecording();
}

export function registrarEvento(nombre: 'registro_enviado' | 'registro_resultado' | 'resena_resultado', propiedades: { tipo?: string; estado?: number; exito?: boolean }) {
    if (bloqueada || identidadAnalitica().excluido) return;
    const actual = version;
    void cargar().then(ph => { if (actual === version && !bloqueada) ph?.capture(nombre, propiedades); }).catch(() => undefined);
}
