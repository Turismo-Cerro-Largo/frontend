<script lang="ts" module>
    type TurnstileApi = {
        render: (elemento: HTMLElement, opciones: {
            sitekey: string;
            action: string;
            language: string;
            size: 'flexible';
            'response-field': false;
            callback: (token: string) => void;
            'expired-callback': () => void;
            'error-callback': () => void;
            'timeout-callback': () => void;
        }) => string;
        reset: (id: string) => void;
        remove: (id: string) => void;
    };

    let carga: Promise<TurnstileApi> | undefined;

    function cargarTurnstile() {
        carga ??= new Promise<TurnstileApi>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;

            const fallo = () => {
                clearTimeout(limite);
                script.remove();
                carga = undefined;
                reject(new Error('No se pudo cargar Turnstile'));
            };
            const limite = setTimeout(fallo, 12000);
            script.onerror = fallo;
            script.onload = () => {
                const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
                if (!api) return fallo();
                clearTimeout(limite);
                resolve(api);
            };
            document.head.append(script);
        });
        return carga;
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { env } from '$env/dynamic/public';

    let { accion, token = $bindable('') }: {
        accion: 'login' | 'register' | 'register-organizador';
        token?: string;
    } = $props();

    let contenedor: HTMLDivElement;
    let api: TurnstileApi | undefined;
    let id: string | undefined;
    let activo = false;
    let error = $state('');

    function marcarError() {
        token = '';
        error = 'No se pudo completar la verificación de seguridad.';
    }

    async function montar() {
        const sitekey = env.PUBLIC_TURNSTILE_SITE_KEY?.trim();
        if (!sitekey) {
            error = 'La verificación de seguridad no está configurada.';
            return;
        }
        error = '';
        try {
            api = await cargarTurnstile();
            if (!activo) return;
            id = api.render(contenedor, {
                sitekey,
                action: accion,
                language: 'es',
                size: 'flexible',
                'response-field': false,
                callback: (valor) => {
                    token = valor;
                    error = '';
                },
                'expired-callback': marcarError,
                'error-callback': marcarError,
                'timeout-callback': marcarError,
            });
        } catch {
            if (activo) marcarError();
        }
    }

    export function reiniciar() {
        token = '';
        error = '';
        if (id !== undefined) api?.reset(id);
        else void montar();
    }

    onMount(() => {
        activo = true;
        token = '';
        void montar();
        return () => {
            activo = false;
            if (id !== undefined) api?.remove(id);
        };
    });
</script>

<div bind:this={contenedor}></div>
{#if error}
    <p role="alert" class="text-sm text-red-700">{error}</p>
    {#if env.PUBLIC_TURNSTILE_SITE_KEY?.trim()}
        <button type="button" onclick={reiniciar} class="self-start text-sm font-medium text-green-700 underline">
            Reintentar verificación
        </button>
    {/if}
{/if}
