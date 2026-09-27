<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import MapaBusqueda from '$lib/components/Mapa/MapaBusqueda.svelte';
    import MapaLocalidadSelecionada from '$lib/components/Mapa/MapaLocalidadSelecionada.svelte';
    import { fade } from 'svelte/transition';

    let menu = $state<boolean>(false);
    const localidad = $derived(page.url.searchParams.get('localidad'));

    $effect(() => {
        if (!localidad) return;

        // Abrir el menu
        menu = true;
    });

    const cerrarMenu = async () => {
        menu = false;

        if (!localidad) return;

        const url = new URL(page.url);
        url.searchParams.delete('localidad');
        await goto(url, { replaceState: true, noScroll: true, keepFocus: true });
    };
</script>

<main class="relative flex min-h-dvh w-full flex-col overflow-hidden bg-gray-900">
    <!-- Menu -->
    <section
        class="absolute top-0 right-0 z-10 h-dvh w-full md:w-110 overflow-y-auto bg-white transition-transform duration-300 ease-in-out"
        style="transform: translateX({menu ? '0%' : '100%'})"
    >
        {#if localidad}
            <MapaLocalidadSelecionada />
        {:else}
            <MapaBusqueda />
        {/if}
    </section>

    <!-- Botton control menu -->
    {#if !menu}
        <button
            in:fade={{ duration: 500 }}
            out:fade={{ duration: 100 }}
            class="absolute top-5 right-5 flex h-12 w-13 flex-col items-center justify-center gap-1.5 rounded-md bg-gray-300 p-4 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-500 md:top-10 md:right-10"
            onclick={() => (menu = true)}
            title="Boton"
        >
            <span class="h-0.5 w-5 shrink-0 rounded-full bg-slate-800"></span>
            <span class="h-0.5 w-5 shrink-0 rounded-full bg-slate-800"></span>
            <span class="h-0.5 w-5 shrink-0 rounded-full bg-slate-800"></span>
        </button>
    {:else}
        <!-- https://phosphoricons.com/?q=x -->
        <button
            in:fade={{ duration: 500 }}
            out:fade={{ duration: 100 }}
            class="absolute top-5 right-5 z-20 flex h-12 w-13 flex-col items-center justify-center rounded-md bg-gray-300 p-4 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-500 md:top-10 md:right-10"
            onclick={cerrarMenu}
            title="Cerrar"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="h-5 w-5 text-slate-800">
                <path
                    d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
                />
            </svg>
        </button>
    {/if}
</main>
