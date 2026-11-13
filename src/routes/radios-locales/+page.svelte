<script lang="ts">
    import RadiosSeo from './RadiosSeo.svelte';
    import { onMount } from 'svelte';
    import { obtenerReproductor } from '$lib/radios/reproductor';
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let resultados = $state<Record<string, string | null>>({});
    let filtro = $state('');
    const reproductor = obtenerReproductor();
    let comprobando = $state(true);

    function normalizar(texto: string) {
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    let visibles = $derived(
        data.radios.filter((radio) => resultados[radio.id] !== null && normalizar(`${radio.nombre} ${radio.localidad} ${radio.frecuencia}`).includes(normalizar(filtro)))
    );

    function comprobarAudio(url: string, signal: AbortSignal) {
        return new Promise<boolean>((resolve) => {
            if (signal.aborted) return resolve(false);

            const audio = new Audio();
            const cancelar = () => terminar(false);
            const timer = setTimeout(cancelar, 6000);

            function terminar(disponible: boolean) {
                clearTimeout(timer);
                signal.removeEventListener('abort', cancelar);
                audio.oncanplay = null;
                audio.onerror = null;
                audio.removeAttribute('src');
                audio.load();
                resolve(disponible);
            }

            signal.addEventListener('abort', cancelar, { once: true });
            audio.oncanplay = () => terminar(true);
            audio.onerror = cancelar;
            audio.preload = 'auto';
            audio.src = url;
        });
    }

    onMount(() => {
        const control = new AbortController();
        const radios = data.radios;
        let siguiente = 0;

        async function comprobarRadios() {
            while (!control.signal.aborted && siguiente < radios.length) {
                const radio = radios[siguiente++];
                let disponible = null;

                for (const enlace of radio.enlaces) {
                    if (await comprobarAudio(enlace, control.signal)) {
                        disponible = enlace;
                        break;
                    }
                    if (control.signal.aborted) return;
                }

                if (!control.signal.aborted) resultados[radio.id] = disponible;
            }
        }

        void Promise.all(Array.from({ length: Math.min(4, radios.length) }, comprobarRadios)).then(() => {
            if (!control.signal.aborted) comprobando = false;
        });
        return () => control.abort();
    });

    $effect(() => {
        const disponibles = data.radios.flatMap(({ id, nombre, localidad }) => {
            const enlace = resultados[id];
            return enlace ? [{ id, nombre, localidad, enlace }] : [];
        });
        if (disponibles.length || !comprobando) reproductor.actualizarDisponibles(disponibles);
    });

    function escuchar(radio: PageData['radios'][number]) {
        const enlace = resultados[radio.id];
        if (enlace) void reproductor.reproducir({ id: radio.id, nombre: radio.nombre, localidad: radio.localidad, enlace });
    }

    $effect(() => {
        const fallida = reproductor.fallida;
        if (fallida && resultados[fallida.id] === fallida.enlace) resultados[fallida.id] = null;
    });
</script>

<RadiosSeo canonical={data.canonical} />

<Navbar />

<main class="min-h-screen bg-zinc-50">
    <header class="bg-linear-to-br from-zinc-950 to-zinc-800 px-5 pt-32 pb-14 text-white md:px-10 md:pt-40 md:pb-20">
        <div class="mx-auto max-w-7xl">
            <p class="mb-2 text-xs font-medium tracking-widest text-white/60 uppercase">Cerro Largo · Uruguay</p>
            <h1 class="text-3xl font-semibold tracking-tight md:text-5xl">Radios de Cerro Largo en vivo</h1>
            <p class="mt-4 max-w-xl text-sm leading-6 text-white/70 md:text-base">Escuchá las emisoras de Melo, Río Branco y otras localidades de Cerro Largo.</p>
        </div>
    </header>

    <section class="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16" aria-labelledby="emisoras">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h2 id="emisoras" class="text-2xl font-semibold text-zinc-900">Emisoras</h2>
                <p class="mt-1 text-sm text-zinc-600" aria-live="polite">
                    {comprobando && data.radios.length ? 'Comprobando transmisiones…' : `${visibles.length} emisoras disponibles`}
                </p>
            </div>
            <label class="flex w-full flex-col gap-1 text-sm font-medium text-zinc-700 sm:w-72">
                Filtrar emisoras
                <input type="search" bind:value={filtro} placeholder="Nombre, localidad o frecuencia" class="rounded-lg border border-zinc-300 bg-white px-3 py-2" />
            </label>
        </div>

        {#if visibles.length}
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {#each visibles as radio (radio.id)}
                    <article class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h3 class="font-semibold text-zinc-900">{radio.nombre}</h3>
                        <p class="mt-1 text-sm text-zinc-600">{[radio.localidad, radio.frecuencia].filter(Boolean).join(' · ')}</p>
                        <button
                            type="button"
                            disabled={!resultados[radio.id]}
                            onclick={() => escuchar(radio)}
                            class="mt-4 rounded-full bg-[#d7e5db] px-4 py-2 text-sm font-semibold text-zinc-900 enabled:hover:bg-[#c2d8c8] disabled:opacity-50"
                        >
                            {resultados[radio.id] ? 'Escuchar' : 'Comprobando señal'}
                        </button>
                    </article>
                {/each}
            </div>
        {:else if !comprobando || !data.radios.length}
            <p class="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
                {filtro ? 'No hay emisoras que coincidan con el filtro.' : 'No encontramos transmisiones disponibles en este momento.'}
            </p>
        {/if}
    </section>
</main>
