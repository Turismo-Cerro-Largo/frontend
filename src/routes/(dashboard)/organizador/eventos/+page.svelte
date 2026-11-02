<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import Paginador from '$lib/components/shared/Paginador.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    import type { EstadoEvento as Estado } from '$lib/types/evento';
    const etiquetas: Record<Estado, string> = {
        BORRADOR: 'Borrador',
        PENDIENTE_REVISION: 'Pendiente',
        PUBLICADO: 'Publicado',
        RECHAZADO: 'Rechazado',
        CANCELADO: 'Cancelado',
        FINALIZADO: 'Finalizado',
    };

    let estado = $derived(page.url.searchParams.get('estado') ?? '');
    let query = $derived(page.url.searchParams.get('query') ?? '');
    let offset = $derived(Math.max(0, Number(page.url.searchParams.get('offset') ?? 0) || 0));
    let limit = $derived(Math.min(100, Math.max(1, Number(page.url.searchParams.get('limit') ?? 10) || 10)));
    let filtrados = $derived(data.eventos.filter((e) => (!estado || e.estado === estado) && (!query || e.titulo.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')))));
    let visibles = $derived(filtrados.slice(offset, offset + limit));

    function colorEstado(valor: Estado) {
        switch (valor) {
            case 'PUBLICADO':
                return 'bg-[#d7e5db] text-[#385443]';
            case 'PENDIENTE_REVISION':
                return 'bg-[#fff1c9] text-[#765e19]';
            case 'RECHAZADO':
                return 'bg-[#f6d8d6] text-[#883b36]';
            case 'CANCELADO':
                return 'bg-[#eadede] text-[#704848]';
            case 'FINALIZADO':
                return 'bg-[#e0e8f0] text-[#41566e]';
            default:
                return 'bg-[#ecebea] text-[#585858]';
        }
    }

    const formato = new Intl.DateTimeFormat('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Montevideo',
    });
    const fechaEvento = (valor: string) => formato.format(new Date(valor));

    function aplicarFiltros(event: SubmitEvent) {
        event.preventDefault();
        const form = new FormData(event.currentTarget as HTMLFormElement);
        const url = new URL(page.url);
        for (const nombre of ['estado', 'query']) {
            const valor = String(form.get(nombre) ?? '').trim();
            if (valor) url.searchParams.set(nombre, valor);
            else url.searchParams.delete(nombre);
        }
        url.searchParams.set('offset', '0');
        void goto(`${url.pathname}${url.search}`, { keepFocus: true, noScroll: true });
    }
</script>

<svelte:head>
    <title>Mis eventos | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
    <div class="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
            <p class="mb-1 text-sm font-medium text-[#708076]">Panel del organizador</p>
            <h1 class="text-3xl font-bold text-[#26382e]">Mis eventos</h1>
            <p class="mt-2 text-[#68746c]">Consultá el estado de tus eventos y editá los borradores o rechazados.</p>
        </div>
        <a
            href="/organizador/eventos/nuevo"
            class="inline-flex w-fit items-center justify-center rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29] shadow-sm transition hover:opacity-90"
            >+ Crear nuevo evento</a
        >
    </div>

    {#key `${estado}|${query}`}
        <form onsubmit={aplicarFiltros} class="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[#ded8cf] bg-white p-4 shadow-sm">
            <label class="flex min-w-52 flex-col gap-2 text-sm font-medium text-[#36463c]">
                Buscar por título
                <input name="query" type="search" value={query} placeholder="Nombre del evento" class="rounded-xl border border-[#ded8cf] bg-white px-4 py-3 text-[#303c34]" />
            </label>
            <label class="flex min-w-52 flex-col gap-2 text-sm font-medium text-[#36463c]">
                Estado
                <select name="estado" class="rounded-xl border border-[#ded8cf] bg-white px-4 py-3 text-[#303c34]">
                    <option value="">Todos los estados</option>
                    {#each Object.entries(etiquetas) as [valor, nombre]}
                        <option value={valor} selected={estado === valor}>{nombre}</option>
                    {/each}
                </select>
            </label>
            <button type="submit" class="rounded-xl bg-[#d7e5db] px-5 py-3 text-sm font-semibold text-[#385443] hover:opacity-90">Aplicar filtros</button>
        </form>
    {/key}

    <div class="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm">
        {#if visibles.length === 0}
            <p class="p-8 text-center text-[#68746c]">No hay eventos para estos filtros.</p>
        {:else if visibles.length > 0}
            <div class="hidden overflow-x-auto md:block">
                <table class="w-full text-left">
                    <thead class="border-b border-[#e7e2da] bg-[#faf9f6]">
                        <tr>
                            <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Evento</th>
                            <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Categoría</th>
                            <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Fecha y hora</th>
                            <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Estado</th>
                            <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each visibles as evento (evento.id)}
                            <tr class="border-b border-[#eeeae4] last:border-b-0">
                                <td class="px-6 py-5 text-sm font-medium text-[#303c34]">{evento.titulo}</td>
                                <td class="px-6 py-5 text-sm text-[#647067]">{evento.categoria?.nombre ?? 'Sin categoría'}</td>
                                <td class="px-6 py-5 text-sm text-[#647067]">{fechaEvento(evento.inicio)}</td>
                                <td class="px-6 py-5"
                                    ><span class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(evento.estado)}`}>{etiquetas[evento.estado]}</span></td
                                >
                                <td class="px-6 py-5">
                                    {#if evento.estado === 'BORRADOR' || evento.estado === 'RECHAZADO'}
                                        <a href={`/organizador/eventos/${evento.id}`} class="text-sm font-medium text-[#75514e] hover:underline">Editar</a>
                                    {:else}
                                        <a
                                            href={`/organizador/eventos/${evento.id}/preview`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="text-sm font-medium text-[#52675a] hover:underline">Ver</a
                                        >
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            <div class="divide-y divide-[#eeeae4] md:hidden">
                {#each visibles as evento (evento.id)}
                    <article class="p-5">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <h2 class="font-semibold text-[#303c34]">{evento.titulo}</h2>
                                <p class="mt-1 text-sm text-[#6d776f]">{evento.categoria?.nombre ?? 'Sin categoría'}</p>
                                <p class="mt-1 text-sm text-[#6d776f]">{fechaEvento(evento.inicio)}</p>
                            </div>
                            <span class={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(evento.estado)}`}>{etiquetas[evento.estado]}</span>
                        </div>
                        {#if evento.estado === 'BORRADOR' || evento.estado === 'RECHAZADO'}
                            <a href={`/organizador/eventos/${evento.id}`} class="mt-4 inline-block text-sm font-medium text-[#75514e] hover:underline">Editar</a>
                        {:else}
                            <a
                                href={`/organizador/eventos/${evento.id}/preview`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="mt-4 inline-block text-sm font-medium text-[#52675a] hover:underline">Ver</a
                            >
                        {/if}
                    </article>
                {/each}
            </div>
        {/if}

        <Paginador total={filtrados.length} {query} />
    </div>

    <p class="mt-5 rounded-xl border border-[#ead79c] bg-[#fff8e5] px-5 py-4 text-sm text-[#67582d]">
        Los eventos enviados deben ser revisados por un administrador antes de publicarse.
    </p>
</section>
