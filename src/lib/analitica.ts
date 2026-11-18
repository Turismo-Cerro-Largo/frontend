import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import posthog from 'posthog-js';

export function actualizarAnalitica(rol: string | undefined, ruta: string) {
    if (dev || env.PUBLIC_POSTHOG_ENABLED === 'false' || !posthog.__loaded) return;
    const habilitado = (rol === 'TURISTA' || rol === 'ORGANIZADOR') &&
        !/^\/(login|register|verificar-email|recuperar-contrasena|restablecer-contrasena|administrador)(\/|$)/.test(ruta);
    posthog.set_config({
        autocapture: {
            dom_event_allowlist: habilitado ? ['click', 'change', 'submit'] : ['click'],
            element_allowlist: habilitado ? ['a', 'button', 'form', 'input', 'select', 'textarea'] : ['a', 'button'],
            capture_copied_text: false,
            capture_value_css_selector_allowlist: [],
            css_selector_ignorelist: ['.ph-no-autocapture', '[data-ph-no-autocapture]', ...(habilitado ? [] : ['form'])]
        }
    });
    if (habilitado) posthog.startSessionRecording();
    else posthog.stopSessionRecording();
}
