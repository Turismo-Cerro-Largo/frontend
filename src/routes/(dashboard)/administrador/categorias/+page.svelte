<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/state';
    import Paginador from '$lib/components/shared/Paginador.svelte';
    import type { PageProps } from './$types';

    type Categoria = {
        id: number;
        nombre: string;
        descripcion: string | null;
        _count: {
            eventos: number;
            ubicaciones: number;
        };
    };

    let { data }: PageProps = $props();

    let categorias = $derived(data.categorias as Categoria[]);

    let eliminando = $state<number | null>(null);
    let errorEliminar = $state('');

    async function eliminarCategoria(id: number) {
        if (eliminando !== null) return;

        const confirmar = confirm('¿Estás seguro de que querés eliminar esta categoría?');

        if (!confirmar) return;

        eliminando = id;
        errorEliminar = '';

        try {
            const respuesta = await fetch(`/api/categorias/${id}`, {
                method: 'DELETE',
            });

            if (!respuesta.ok) {
                if (respuesta.status === 409) {
                    throw new Error('La categoría tiene eventos o ubicaciones asociados.');
                }

                if (respuesta.status === 404) {
                    throw new Error('La categoría no existe.');
                }

                throw new Error('No se pudo eliminar la categoría.');
            }

            const offset = Number(page.url.searchParams.get('offset') ?? 0);
            const limit = Number(page.url.searchParams.get('limit') ?? 10);

            if (categorias.length === 1 && offset > 0) {
                const url = new URL(page.url);
                url.searchParams.set('offset', String(Math.max(0, offset - limit)));

                await goto(`${url.pathname}${url.search}`, {
                    invalidateAll: true,
                    noScroll: true,
                });
            } else {
                await invalidateAll();
            }
        } catch (error) {
            errorEliminar = error instanceof Error ? error.message : 'Error al eliminar la categoría.';
        } finally {
            eliminando = null;
        }
    }
</script>

<div
    class="overflow-hidden rounded-2xl
           border border-[#ded8cf] bg-white shadow-sm
           transition-shadow duration-300 ease-in-out
           hover:shadow-md"
>
    <!-- ENCABEZADO -->
    <div
        class="flex flex-col gap-4 border-b border-[#eeeae4]
               px-6 py-5 sm:flex-row sm:items-center
               sm:justify-between"
    >
        <div class="flex items-center gap-4">
            <div
                class="flex h-12 w-12 shrink-0 items-center
                       justify-center rounded-xl bg-[#d7e5db]"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#385443"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" />
                    <path d="m12 12 8-5.5" />
                    <path d="m12 12-8-5.5" />
                    <path d="M12 12v8" />
                </svg>
            </div>

            <div>
                <p class="text-base font-semibold text-[#26382e]">Gestión de categorías</p>

                <p class="mt-1 text-sm text-[#68746c]">Organizá las categorías de eventos y ubicaciones.</p>
            </div>
        </div>

        <a
            href="/administrador/categorias/nueva"
            class="inline-flex shrink-0 cursor-pointer
                   items-center justify-center gap-2
                   rounded-xl bg-[#D89994] px-5 py-3
                   text-sm font-semibold text-[#442b29]
                   shadow-sm transition-all duration-200 ease-out
                   hover:bg-[#cb8580] hover:shadow-md
                   active:scale-[0.97]
                   focus-visible:outline-2
                   focus-visible:outline-offset-2
                   focus-visible:outline-[#D89994]"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </svg>

            Nueva categoría
        </a>
    </div>

    {#if errorEliminar}
        <div
            role="alert"
            class="mx-6 my-4 flex items-center justify-between gap-3
                   rounded-xl border border-[#f0cfcc]
                   bg-[#fff2f0] px-4 py-3"
        >
            <p class="text-sm text-[#93453f]">
                {errorEliminar}
            </p>

            <button
                type="button"
                aria-label="Cerrar mensaje"
                onclick={() => (errorEliminar = '')}
                class="cursor-pointer rounded-lg px-2 py-1
                       text-[#93453f] transition-colors duration-200
                       hover:bg-[#f6d8d6]"
            >
                ✕
            </button>
        </div>
    {/if}

    <!-- TABLA -->
    <div class="overflow-x-auto">
        <table class="w-full text-left">
            <thead class="border-b border-[#e7e2da] bg-[#faf9f6]">
                <tr>
                    {#each ['ID', 'Nombre', 'Descripción', 'N.º de eventos', 'N.º de ubicaciones', 'Acciones'] as columna}
                        <th
                            class="whitespace-nowrap px-6 py-4
                                   text-sm font-semibold text-[#36463c]"
                        >
                            {columna}
                        </th>
                    {/each}
                </tr>
            </thead>

            <tbody>
                {#each categorias as categoria (categoria.id)}
                    <tr
                        class="group border-b border-[#eeeae4]
                               transition-colors duration-200 ease-in-out
                               hover:bg-[#faf9f6]
                               last:border-b-0"
                    >
                        <td class="px-6 py-5 text-sm text-[#647067]">
                            {categoria.id}
                        </td>

                        <td class="px-6 py-5 text-sm font-medium text-[#303c34]">
                            {categoria.nombre}
                        </td>

                        <td class="px-6 py-5 text-sm text-[#647067]">
                            {categoria.descripcion ?? 'Sin descripción'}
                        </td>

                        <td class="px-6 py-5 text-sm text-[#647067]">
                            {categoria._count.eventos}
                        </td>

                        <td class="px-6 py-5 text-sm text-[#647067]">
                            {categoria._count.ubicaciones}
                        </td>

                        <td class="px-6 py-5">
                            <div class="flex items-center gap-3">
                                <a
                                    href={`/administrador/categorias/${categoria.id}`}
                                    class="inline-flex cursor-pointer
                                           items-center justify-center
                                           rounded-lg px-3 py-2
                                           text-sm font-medium text-[#75514e]
                                           transition-all duration-200 ease-in-out
                                           hover:bg-[#f4e9e6]
                                           hover:text-[#593936]
                                           active:scale-[0.97]
                                           focus-visible:outline-2
                                           focus-visible:outline-offset-2
                                           focus-visible:outline-[#D89994]"
                                >
                                    Editar
                                </a>

                                <button
                                    type="button"
                                    onclick={() => eliminarCategoria(categoria.id)}
                                    disabled={eliminando !== null}
                                    class="inline-flex min-w-24 cursor-pointer
                                           items-center justify-center gap-2
                                           rounded-lg px-3 py-2
                                           text-sm font-medium text-[#b4534c]
                                           transition-all duration-200 ease-in-out
                                           hover:bg-[#fbeeed]
                                           hover:text-[#8f3832]
                                           active:scale-[0.97]
                                           disabled:cursor-not-allowed
                                           disabled:active:scale-100"
                                >
                                    {#if eliminando === categoria.id}
                                        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                                            <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Eliminando...
                                    {:else}
                                        Eliminar
                                    {/if}
                                </button>
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td
                            colspan="6"
                            class="px-6 py-10 text-center
                                   text-sm text-[#647067]"
                        >
                            No hay categorías disponibles.
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <Paginador total={data.total} />
</div>
