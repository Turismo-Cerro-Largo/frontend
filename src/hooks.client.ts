import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { HandleClientError } from '@sveltejs/kit';
import posthog from 'posthog-js';

const contadores = { $pageview: 0, $exception: 0, $autocapture: 0 };
const limites = { $pageview: 50, $exception: 5, $autocapture: 200 };

export function init() {
    if (dev || env.PUBLIC_POSTHOG_ENABLED === 'false') return;

    posthog.init(env.PUBLIC_POSTHOG_KEY || 'phc_uRFh8r84qYyn8u5zwLkdzEdTr4LTanXDaUoE8o23u6kK', {
        api_host: 'https://us.i.posthog.com',
        autocapture: {
            dom_event_allowlist: ['click'],
            element_allowlist: ['a', 'button'],
            capture_copied_text: false,
            css_selector_ignorelist: ['.ph-no-autocapture', '[data-ph-no-autocapture]', 'form']
        },
        mask_all_text: true,
        mask_all_element_attributes: true,
        capture_pageview: 'history_change',
        capture_pageleave: false,
        capture_exceptions: {
            capture_unhandled_errors: true,
            capture_unhandled_rejections: true,
            capture_console_errors: false
        },
        disable_session_recording: true,
        capture_heatmaps: false,
        capture_dead_clicks: false,
        capture_performance: false,
        person_profiles: 'never',
        persistence: 'memory',
        advanced_disable_feature_flags: true,
        before_send(event) {
            if (!event || !(event.event in limites)) return null;
            const tipo = event.event as keyof typeof limites;
            if (contadores[tipo] >= limites[tipo]) return null;
            contadores[tipo]++;
            for (const propiedad of ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer']) {
                const valor = event.properties[propiedad];
                if (typeof valor !== 'string') continue;
                try {
                    const url = new URL(valor);
                    event.properties[propiedad] = url.origin + url.pathname;
                } catch {
                    delete event.properties[propiedad];
                }
            }
            delete event.properties.$set;
            delete event.properties.$set_once;
            return event;
        }
    });
}

export const handleError: HandleClientError = ({ error, status }) => {
    if (!dev && status >= 500 && posthog.__loaded) posthog.captureException(error);
};
