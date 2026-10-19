<script lang="ts">
    import { fade } from 'svelte/transition';
    import { tick } from 'svelte';
    import type { PageProps } from './$types';

    type Categoria = {
        id: number;
        nombre: string;
        descripcion: string | null;
        _count: { eventos: number; ubicaciones: number };
    };

    let { data }: PageProps = $props();
    // Mantener la copia local sincronizada cuando SvelteKit entrega nuevos datos.
    // No se invalidan datos tras eliminar, por lo que la transición permanece fluida.
    let categorias = $state<Categoria[]>([]);
    $effect(() => {
        categorias = [...data.categorias];
    });
    let busqueda = $state('');
    let paginaActual = $state(1);
    let porPagina = $state(10);
    let pendiente = $state<Categoria | null>(null);
    let eliminando = $state(false);
    let errorEliminar = $state('');
    let aviso = $state('');
    let dialogo: HTMLDialogElement;

    let filtradas = $derived(
        categorias.filter((categoria) => `${categoria.nombre} ${categoria.descripcion ?? ''}`.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es')))
    );
    let totalPaginas = $derived(Math.max(1, Math.ceil(filtradas.length / porPagina)));
    let paginaVisible = $derived(Math.min(paginaActual, totalPaginas));
    let visibles = $derived(filtradas.slice((paginaVisible - 1) * porPagina, paginaVisible * porPagina));

    function solicitarEliminar(categoria: Categoria) {
        pendiente = categoria;
        errorEliminar = '';
        aviso = '';
        dialogo.showModal();
    }

    function cerrarDialogo() {
        if (eliminando) return;
        dialogo.close();
        pendiente = null;
    }

    async function confirmarEliminar() {
        if (!pendiente || eliminando) return;
        eliminando = true;
        errorEliminar = '';
        const id = pendiente.id;
        try {
            const response = await fetch(`/api/categorias/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                if (response.status === 409) throw new Error('No se puede eliminar: la categoría tiene eventos o ubicaciones asociados.');
                if (response.status === 404) throw new Error('La categoría ya no existe.');
                if (response.status === 401 || response.status === 403) throw new Error('No tenés permisos para eliminar categorías.');
                throw new Error('No se pudo eliminar la categoría. Intentá nuevamente.');
            }
            dialogo.close();
            pendiente = null;
            // Esto activa solamente la salida gradual de la fila correspondiente.
            categorias = categorias.filter((categoria) => categoria.id !== id);
            await tick();
            paginaActual = Math.min(paginaActual, totalPaginas);
            aviso = 'Categoría eliminada correctamente.';
        } catch (e) {
            errorEliminar = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
        } finally {
            eliminando = false;
        }
    }
</script>

<svelte:head><title>Gestión de categorías</title></svelte:head>
<div class="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm">
    <header class="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeae4] p-6">
        <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d7e5db] text-2xl text-[#385443]" aria-hidden="true">▦</div>
            <div>
                <h1 class="font-semibold text-[#26382e]">Gestión de categorías</h1>
                <p class="mt-1 text-sm text-[#68746c]">Organizá las categorías de eventos y ubicaciones.</p>
            </div>
        </div>
        <a
            href="/administrador/categorias/nueva"
            class="rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29] transition-colors duration-200 hover:bg-[#cb8580] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D89994]"
            >+ Nueva categoría</a
        >
    </header>
    <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <label class="flex min-w-52 flex-1 flex-col gap-1 text-xs font-medium text-[#52675a] sm:max-w-xs">
            Buscar categoría
            <input
                type="search"
                bind:value={busqueda}
                oninput={() => (paginaActual = 1)}
                placeholder="Buscar por nombre o descripción"
                class="rounded-xl border border-[#ded8cf] px-3 py-2.5 text-sm text-[#26382e] outline-none focus:border-[#91ae9b] focus:ring-2 focus:ring-[#d7e5db]"
            />
        </label>
        <label class="flex items-center gap-2 text-sm text-[#52675a]"
            >Mostrar
            <select bind:value={porPagina} onchange={() => (paginaActual = 1)} class="rounded-lg border border-[#ded8cf] px-2 py-2 text-sm"
                ><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select
            >
        </label>
    </div>
    {#if aviso}<p role="status" class="mx-6 mb-4 rounded-xl bg-[#edf5ef] px-4 py-3 text-sm text-[#385443]" transition:fade={{ duration: 160 }}>{aviso}</p>{/if}
    <div class="overflow-x-auto">
        <table class="w-full text-left">
            <thead class="border-y border-[#e7e2da] bg-[#faf9f6]"
                ><tr>
                    {#each ['ID', 'Nombre', 'Descripción', 'N.º de eventos', 'N.º de ubicaciones', 'Acciones'] as titulo}
                        <th class="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#36463c]">{titulo}</th>
                    {/each}
                </tr></thead
            >
            <tbody>
                {#each visibles as categoria (categoria.id)}
                    <tr out:fade={{ duration: 240 }} class="border-b border-[#eeeae4] transition-colors duration-200 hover:bg-[#faf9f6]">
                        <td class="px-5 py-4 text-sm text-[#647067]">{categoria.id}</td>
                        <td class="px-5 py-4 text-sm font-medium text-[#303c34]">{categoria.nombre}</td>
                        <td class="px-5 py-4 text-sm text-[#647067]">{categoria.descripcion || 'Sin descripción'}</td>
                        <td class="px-5 py-4 text-sm text-[#647067]">{categoria._count.eventos}</td>
                        <td class="px-5 py-4 text-sm text-[#647067]">{categoria._count.ubicaciones}</td>
                        <td class="px-5 py-4"
                            ><div class="flex gap-2">
                                <a
                                    href={`/administrador/categorias/${categoria.id}`}
                                    class="rounded-lg px-3 py-2 text-sm font-medium text-[#75514e] transition-colors hover:bg-[#f4e9e6]">Editar</a
                                >
                                <button
                                    type="button"
                                    onclick={() => solicitarEliminar(categoria)}
                                    class="rounded-lg px-3 py-2 text-sm font-medium text-[#b4534c] transition-colors hover:bg-[#fbeeed]">Eliminar</button
                                >
                            </div></td
                        >
                    </tr>
                {:else}
                    <tr><td colspan="6" class="px-5 py-12 text-center text-sm text-[#647067]">No se encontraron categorías.</td></tr>
                {/each}
            </tbody>
        </table>
    </div>
    <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeae4] px-6 py-4 text-sm text-[#647067]">
        <span>{filtradas.length === 0 ? 0 : (paginaVisible - 1) * porPagina + 1}–{Math.min(paginaVisible * porPagina, filtradas.length)} de {filtradas.length}</span>
        <div class="flex items-center gap-3">
            <button
                type="button"
                disabled={paginaVisible <= 1}
                onclick={() => (paginaActual = paginaVisible - 1)}
                class="rounded-lg border border-[#ded8cf] px-3 py-2 transition-colors hover:bg-[#f1f5f1] disabled:cursor-not-allowed disabled:opacity-40">Anterior</button
            >
            <span>Página {paginaVisible} de {totalPaginas}</span>
            <button
                type="button"
                disabled={paginaVisible >= totalPaginas}
                onclick={() => (paginaActual = paginaVisible + 1)}
                class="rounded-lg border border-[#ded8cf] px-3 py-2 transition-colors hover:bg-[#f1f5f1] disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button
            >
        </div>
    </footer>
</div>

<dialog
    bind:this={dialogo}
    onclose={() => {
        if (!eliminando) pendiente = null;
    }}
    class="fixed inset-0 m-auto w-[min(92vw,440px)] rounded-2xl border border-[#e6ded5] bg-white p-0 text-[#26382e] shadow-xl backdrop:bg-[#172b20]/35 backdrop:backdrop-blur-[2px]"
>
    <div class="p-6">
        <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0ee] text-[#a64c45]" aria-hidden="true">⌫</div>
        <h2 class="text-lg font-semibold">¿Eliminar categoría?</h2>
        <p class="mt-2 text-sm leading-relaxed text-[#68746c]">Se eliminará <strong>{pendiente?.nombre}</strong>. Esta acción no se puede deshacer.</p>
        {#if errorEliminar}<p role="alert" class="mt-4 rounded-lg bg-[#fff1ef] p-3 text-sm text-[#a34842]">{errorEliminar}</p>{/if}
        <div class="mt-6 flex justify-end gap-3">
            <button
                type="button"
                disabled={eliminando}
                onclick={cerrarDialogo}
                class="rounded-xl border border-[#ded8cf] px-4 py-2.5 text-sm font-medium hover:bg-[#faf9f6] disabled:opacity-50">Cancelar</button
            >
            <button
                type="button"
                disabled={eliminando}
                onclick={confirmarEliminar}
                class="rounded-xl bg-[#b4534c] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#98443e] disabled:opacity-60"
                >{eliminando ? 'Eliminando…' : 'Sí, eliminar'}</button
            >
        </div>
    </div>
</dialog>
