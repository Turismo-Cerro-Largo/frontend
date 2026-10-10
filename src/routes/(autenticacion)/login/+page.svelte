<script lang="ts">

    import SvgGoogle from '$lib/components/svg/SvgGoogle.svelte';
    import { slide } from 'svelte/transition';

    // Variables
    let cargando = $state(false);
    let error = $state('');

    // Subir el formulario
    const enviar = async (evento: SubmitEvent) => {
        evento.preventDefault();
        if (cargando) return;

        const datos = new FormData(evento.currentTarget as HTMLFormElement);
        error = '';
        cargando = true;

        try {
            // peticion
            const respuesta = await fetch('/api/auth/login', {
                method: 'POST',
                body: datos,
            });

            if (!respuesta.ok) {
                error = respuesta.status === 400 || respuesta.status === 401
                    ? 'El correo o la contraseña no coinciden. Revisá tus credenciales e intentá nuevamente.'
                    : respuesta.status === 403
                      ? 'No se autorizó el ingreso desde esta dirección. Volvé a abrir el sitio e intentá nuevamente.'
                      : respuesta.status === 429
                        ? 'Hubo demasiados intentos. Esperá unos minutos y volvé a intentar.'
                        : respuesta.status >= 500
                          ? 'El servicio de ingreso no está disponible en este momento. Intentá nuevamente más tarde.'
                          : 'No se pudo completar el ingreso. Volvé a intentar.';
                return;
            }

            error = '';

            const cuenta = await respuesta.json();
            window.location.assign(cuenta.rol === 'ADMINISTRADOR' ? '/administrador' : cuenta.tipo === 'organizador' ? '/organizador' : '/turista');
        } catch {
            error = 'No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.';
        } finally {
            cargando = false;
        }
    };
</script>

<svelte:head>
    <title>Ingresar · CerroLargo360</title>
</svelte:head>

<section class="flex items-center justify-center w-full min-h-dvh px-4">
    <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
            <h2 class="text-lg font-semibold text-green-600 tracking-wide">CerroLargo360</h2>
            <h1 class="text-2xl font-bold text-slate-800 mt-1">Ingresar</h1>
        </div>

        <!-- Mensaje de error generico -->
        {#if error}
            <div in:slide|local out:slide|local class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
            </div>
        {/if}

        <!-- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy -->
        <form onsubmit={enviar} class="flex flex-col gap-4" aria-busy={cargando}>
            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-slate-700"> Correo electrónico </label>
                <input
                    disabled={cargando}
                    id="email"
                    name="email"
                    type="email"
                    required
                    autocomplete="email"
                    minlength="7"
                    maxlength="254"
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                />
            </div>

            <div class="flex flex-col gap-1">
                <label for="password" class="text-sm font-medium text-slate-700"> Contraseña </label>
                <input
                    disabled={cargando}
                    id="password"
                    name="password"
                    type="password"
                    required
                    minlength="1"
                    maxlength="1024"
                    autocomplete="current-password"
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                />
            </div>

            <button
                type="submit"
                disabled={cargando}
                class="h-11 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-98 transition-all cursor-pointer text-white font-medium rounded-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
                {#if cargando}
                    <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="opacity-75" />
                    </svg>
                    Ingresando...
                {:else}
                    Ingresar
                {/if}
            </button>
            <div class="flex items-center gap-3">
                <div class="flex-1 h-px bg-slate-200"></div>
                <span class="text-xs text-slate-400">o</span>
                <div class="flex-1 h-px bg-slate-200"></div>
            </div>
            <a
                href="/api/auth/google"
                data-sveltekit-reload
                aria-disabled={cargando}
                tabindex={cargando ? -1 : undefined}
                class="h-11 flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer text-slate-700 font-medium rounded-lg aria-disabled:pointer-events-none aria-disabled:opacity-60"
            >
                <div class="w-5 h-5">
                    <SvgGoogle />
                </div>
                Continuar con Google
            </a>
        </form>

        <p class="text-sm text-slate-500 text-center mt-6">
            ¿No tenés cuenta?
            <a href="/register" data-sveltekit-replacestate class="text-green-600 font-medium hover:underline"> Registrate </a>
        </p>
    </div>
</section>
