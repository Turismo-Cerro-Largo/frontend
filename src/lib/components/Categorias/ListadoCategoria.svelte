<script lang="ts">
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
    import type { TarjetaCategoria } from '$lib/types/categoria';

    let {
        titulo,
        descripcion,
        elementos,
        error = '',
    }: {
        titulo: string;
        descripcion: string;
        elementos: TarjetaCategoria[];
        error?: string;
    } = $props();
</script>

<svelte:head>
    <title>{titulo} | Cerro Largo 360</title>
</svelte:head>

<!-- Fondo para mantener visible el Navbar -->
<Navbar solid />

<main class="relative min-h-screen bg-[#f7f8f5] px-5 pb-16 pt-32 md:px-10">
    <div class="mx-auto max-w-6xl">
        <a href="/" class="text-sm font-medium text-[#477967] hover:underline"> ← Volver al inicio </a>

        <div class="mb-10 mt-6">
            <h1 class="text-3xl font-bold text-zinc-900 md:text-4xl">
                {titulo}
            </h1>

            <p class="mt-3 text-zinc-600">
                {descripcion}
            </p>
        </div>

        {#if error}
            <p class="rounded-xl bg-red-50 p-5 text-red-700">
                {error}
            </p>
        {:else if elementos.length === 0}
            <div class="rounded-xl bg-white p-8 text-center shadow-sm">
                <h2 class="text-xl font-semibold">No hay publicaciones disponibles</h2>
                <p class="mt-2 text-zinc-500">Todavía no hay lugares o eventos publicados.</p>
            </div>
        {:else}
            <p class="mb-5 text-sm text-zinc-500">
                {elementos.length} resultados encontrados
            </p>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {#each elementos as item (item.id)}
                    <article class="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg">
                        {#if item.imagen}
                            <img src={item.imagen} alt={`Fotografía de ${item.nombre}`} class="h-52 w-full object-cover" loading="lazy" />
                        {:else}
                            <div class="flex h-52 items-center justify-center bg-[#d7e5db] text-zinc-600">Sin fotografía</div>
                        {/if}

                        <div class="p-5">
                            <h2 class="text-xl font-semibold text-zinc-900">
                                {item.nombre}
                            </h2>

                            <p class="mt-2 text-sm text-[#477967]">
                                📍 {item.localidad}
                            </p>

                            {#if item.fecha}
                                <p class="mt-2 text-sm text-zinc-600">
                                    📅 {new Date(item.fecha).toLocaleString('es-UY', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                        timeZone: 'America/Montevideo',
                                    })}
                                </p>
                            {/if}

                            {#if item.precio}
                                <p class="mt-2 font-medium text-[#477967]">
                                    {item.precio}
                                </p>
                            {/if}

                            <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
                                {item.descripcion}
                            </p>

                            {#if item.fecha}<a class="mt-4 inline-block font-semibold text-[#477967] underline" href={`/eventos/${item.id}`}>Ver evento y ubicación</a>{/if}
                            {#if !item.fecha}
                                <a class="mt-4 inline-block font-semibold text-[#477967] underline" href={`/lugares/${item.id}`}>Ver lugar, favoritos y valoraciones</a>
                            {/if}
                            {#if item.horario}<p class="mt-3 text-sm">Horario: {item.horario}</p>{/if}
                            <details class="mt-5 border-t pt-4">
                                <summary class="cursor-pointer font-medium text-[#477967]"> Ver detalles </summary>

                                <div class="mt-4 space-y-3 text-sm text-zinc-600">
                                    {#if item.direccion}
                                        <p>
                                            <strong>Dirección:</strong>
                                            {item.direccion}
                                        </p>
                                    {/if}

                                    {#if item.telefono}
                                        <p>
                                            <strong>Teléfono:</strong>
                                            {item.telefono}
                                        </p>
                                    {/if}

                                    {#if item.sitio_web && /^https?:\/\//i.test(item.sitio_web)}
                                        <a href={item.sitio_web} target="_blank" rel="noopener noreferrer" class="block text-[#477967] underline"> Visitar sitio web </a>
                                    {/if}

                                    {#if item.latitud !== null && item.longitud !== null}
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${item.latitud},${item.longitud}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="inline-block rounded-lg bg-[#477967] px-4 py-2 text-white"
                                        >
                                            Ver ubicación en mapa
                                        </a>
                                    {/if}
                                </div>
                            </details>
                        </div>
                    </article>
                {/each}
            </div>
        {/if}
    </div>
</main>

<HomeFooter />
