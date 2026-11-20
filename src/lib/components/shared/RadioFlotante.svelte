<script lang="ts">
    import type { Snippet } from 'svelte';
    import { establecerReproductor, type Emisora } from '$lib/radios/reproductor';

    let { children }: { children: Snippet } = $props();
    let audio: HTMLAudioElement;
    let emisora = $state.raw<Emisora>();
    let estado = $state<'cargando' | 'sonando' | 'pausada' | 'error'>('pausada');
    let intento = 0;
    let disponibles = $state.raw<Emisora[]>([]);
    let puedeCambiar = $derived(disponibles.some((radio) => radio.id !== emisora?.id));
    let reproduciendo = $derived(estado === 'sonando' || estado === 'cargando');

    function registrarFallo() {
        const fallida = emisora;
        if (!fallida) return;
        estado = 'error';
        disponibles = disponibles.filter((radio) => radio.id !== fallida.id || radio.enlace !== fallida.enlace);
    }

    function cambiar(direccion: -1 | 1) {
        if (!puedeCambiar) return;
        const actual = disponibles.findIndex((radio) => radio.id === emisora?.id);
        const origen = actual < 0 && direccion === -1 ? 0 : actual;
        const siguiente = (origen + direccion + disponibles.length) % disponibles.length;
        void reproducir(disponibles[siguiente]);
    }

    async function reproducir(nueva: Emisora) {
        const actual = ++intento;
        const cambiarFuente = emisora?.enlace !== nueva.enlace || estado === 'error';
        emisora = nueva;
        if (!cambiarFuente && !audio.paused) return;
        estado = 'cargando';
        if (cambiarFuente) audio.src = nueva.enlace;

        try {
            await audio.play();
        } catch (error) {
            if (actual !== intento) return;
            if (error instanceof DOMException && error.name === 'NotAllowedError') {
                estado = 'pausada';
            } else {
                registrarFallo();
            }
        }
    }

    function alternar() {
        if (!emisora) return;
        if (!reproduciendo) {
            void reproducir(emisora);
        } else {
            intento++;
            audio.pause();
            estado = 'pausada';
        }
    }

    function cerrar() {
        intento++;
        emisora = undefined;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
    }

    establecerReproductor({
        reproducir,
        actualizarDisponibles(emisoras) {
            disponibles = emisoras;
        },
        get fallida() {
            return estado === 'error' ? emisora : undefined;
        },
    });
</script>

{@render children()}

<audio
    bind:this={audio}
    preload="none"
    hidden
    onplaying={() => {
        const actual = emisora;
        if (!actual) return;
        estado = 'sonando';
        if (!disponibles.some((radio) => radio.id === actual.id)) {
            disponibles = [...disponibles, actual].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-UY'));
        }
    }}
    onwaiting={() => {
        if (emisora && !audio.paused) estado = 'cargando';
    }}
    onpause={() => {
        if (emisora && audio.paused && estado !== 'error') estado = 'pausada';
    }}
    onended={() => {
        if (emisora) estado = 'pausada';
    }}
    onerror={() => {
        if (emisora && audio.error) registrarFallo();
    }}
>
    <track kind="captions" />
</audio>

{#if emisora}
    <aside
        aria-label="Reproductor de radio"
        class="fixed z-40 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-lg bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))]"
    >
        <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
                <p class="truncate text-sm font-semibold" title={emisora.nombre}>{emisora.nombre}</p>
                <p class="mt-0.5 text-xs text-zinc-600" aria-live="polite">
                    {emisora.localidad} · {estado === 'sonando' ? 'En vivo' : estado === 'cargando' ? 'Conectando…' : estado === 'error' ? 'Señal no disponible' : 'En pausa'}
                </p>
            </div>
            <button type="button" onclick={cerrar} aria-label="Cerrar reproductor" class="rounded-full px-2 text-xl leading-none text-zinc-600 hover:bg-zinc-100">×</button>
        </div>
        <div class="mt-3 flex items-center justify-center gap-2">
            <button
                type="button"
                onclick={() => cambiar(-1)}
                disabled={!puedeCambiar}
                aria-label="Radio anterior"
                title="Radio anterior"
                class="grid h-9 w-9 place-items-center rounded-full text-lg hover:bg-zinc-100 disabled:opacity-40"
            >
                <span aria-hidden="true">⏮︎</span>
            </button>
            <button
                type="button"
                onclick={alternar}
                aria-label={reproduciendo ? 'Pausar' : estado === 'error' ? 'Reintentar' : 'Reproducir'}
                class="grid h-10 w-10 place-items-center rounded-full bg-[#d7e5db] text-lg hover:bg-[#c2d8c8]"
            >
                <span aria-hidden="true">{reproduciendo ? '⏸︎' : '▶︎'}</span>
            </button>
            <button
                type="button"
                onclick={() => cambiar(1)}
                disabled={!puedeCambiar}
                aria-label="Radio siguiente"
                title="Radio siguiente"
                class="grid h-9 w-9 place-items-center rounded-full text-lg hover:bg-zinc-100 disabled:opacity-40"
            >
                <span aria-hidden="true">⏭︎</span>
            </button>
        </div>
    </aside>
{/if}
