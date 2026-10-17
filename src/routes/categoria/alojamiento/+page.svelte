
<script lang="ts">
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Alojamientos | Cerro Largo 360</title>
    <meta
        name="description"
        content="Descubrí alojamientos turísticos en Cerro Largo."
    />
</svelte:head>

<Navbar />

<main class="min-h-screen bg-[#f7f8f5] px-5 pb-16 pt-32 md:px-10">
    <div class="mx-auto max-w-6xl">

        <!-- Encabezado -->
        <a
            href="/"
            class="text-sm font-medium text-[#477967] hover:underline"
        >
            ← Volver al inicio
        </a>

        <div class="mb-10 mt-6">
            <h1 class="text-3xl font-bold text-zinc-900 md:text-4xl">
                Alojamientos en Cerro Largo
            </h1>

            <p class="mt-3 text-zinc-600">
                Encontrá hoteles, posadas y cabañas
                para disfrutar de tu estadía.
            </p>
        </div>

        <!-- Error de conexión -->
        {#if data.error}
            <p class="rounded-xl bg-red-50 p-5 text-red-700">
                {data.error}
            </p>

        <!-- Sin alojamientos -->
        {:else if data.alojamientos.length === 0}
            <div class="rounded-xl bg-white p-8 text-center shadow-sm">
                <h2 class="text-xl font-semibold">
                    No hay alojamientos disponibles
                </h2>

                <p class="mt-2 text-zinc-500">
                    Todavía no se publicaron alojamientos
                    en esta categoría.
                </p>
            </div>

        <!-- Alojamientos de la base de datos -->
        {:else}
            <p class="mb-5 text-sm text-zinc-500">
                {data.alojamientos.length} alojamientos encontrados
            </p>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {#each data.alojamientos as alojamiento (alojamiento.id)}

                    <article class="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg">

                        <!-- Fotografía -->
                        {#if alojamiento.imagen}
                            <img
                                src={alojamiento.imagen}
                                alt={`Fotografía de ${alojamiento.nombre}`}
                                class="h-52 w-full object-cover"
                                loading="lazy"
                            />
                        {:else}
                            <div class="flex h-52 items-center justify-center bg-[#d7e5db] text-zinc-600">
                                Sin fotografía
                            </div>
                        {/if}

                        <!-- Información -->
                        <div class="p-5">
                            <h2 class="text-xl font-semibold text-zinc-900">
                                {alojamiento.nombre}
                            </h2>

                            <p class="mt-2 text-sm text-[#477967]">
                                📍 {alojamiento.localidad}
                            </p>

                            <p class="mt-3 text-sm leading-relaxed text-zinc-600">
                                {alojamiento.descripcion}
                            </p>

                            <!-- Información adicional -->
                            <details class="mt-5 border-t pt-4">
                                <summary class="cursor-pointer font-medium text-[#477967]">
                                    Ver detalles
                                </summary>

                                <div class="mt-4 space-y-3 text-sm text-zinc-600">

                                    {#if alojamiento.direccion}
                                        <p>
                                            <strong>Dirección:</strong>
                                            {alojamiento.direccion}
                                        </p>
                                    {/if}

                                    {#if alojamiento.telefono}
                                        <p>
                                            <strong>Teléfono:</strong>
                                            {alojamiento.telefono}
                                        </p>
                                    {/if}

                                    {#if alojamiento.horario}
                                        <p>
                                            <strong>Horario:</strong>
                                            {alojamiento.horario}
                                        </p>
                                    {/if}

                                    {#if alojamiento.sitio_web}
                                        <a
                                            href={alojamiento.sitio_web}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="block text-[#477967] underline"
                                        >
                                            Visitar sitio web
                                        </a>
                                    {/if}

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${alojamiento.latitud},${alojamiento.longitud}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="inline-block rounded-lg bg-[#477967] px-4 py-2 text-white"
                                    >
                                        Ver ubicación en mapa
                                    </a>

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
