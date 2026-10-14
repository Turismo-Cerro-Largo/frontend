<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';

    type Estado = 'BORRADOR' | 'PENDIENTE_REVISION' | 'PUBLICADO' | 'RECHAZADO' | 'CANCELADO' | 'FINALIZADO';

    type Evento = {
        id: number;
        titulo: string;
        estado: Estado;
        inicio: string;
        creado_en: string;
        lugar_evento: string | null;
        categoria: { nombre: string } | null;
        organizador: {
            id: number;
            nombre_organizacion: string;
        } | null;
    };

    let eventos = $state<Evento[]>([]);
    let total = $state(0);
    let pendientes = $state(0);
    let filtro = $state('');
    let buscar = $state('');
    let busquedaAplicada = $state('');
    let pagina = $state(0);
    let cargando = $state(true);
    let error = $state('');

    const limite = 12;
    let consulta = 0;

    const formato = (v: string) =>
        new Date(v).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    const etiqueta: Record<Estado, string> = {
        BORRADOR: 'Borrador',
        PENDIENTE_REVISION: 'Pendiente',
        PUBLICADO: 'Publicado',
        RECHAZADO: 'Rechazado',
        CANCELADO: 'Cancelado',
        FINALIZADO: 'Finalizado',
    };

    async function cargar() {
        const actual = ++consulta;
        cargando = true;
        error = '';

        try {
            const params = new URLSearchParams({
                offset: String(pagina * limite),
                limit: String(limite),
            });

            if (filtro) params.set('estado', filtro);
            if (busquedaAplicada) {
                params.set('buscar', busquedaAplicada);
            }

            const res = await fetch(`/api/admin/eventos?${params}`, { credentials: 'include' });

            if (!res.ok) {
                throw new Error(res.status === 403 || res.status === 401 ? 'No tenés permisos para consultar eventos.' : `No se pudo cargar la lista (${res.status}).`);
            }

            const data = await res.json();

            if (actual === consulta) {
                eventos = data.eventos;
                total = data.total;
                pendientes = data.pendientes;
            }
        } catch (e) {
            if (actual === consulta) {
                error = e instanceof Error ? e.message : 'Error al consultar eventos';
            }
        } finally {
            if (actual === consulta) cargando = false;
        }
    }

    function cambiarFiltro(valor: string) {
        filtro = valor;
        pagina = 0;
        void cargar();
    }

    function ejecutarBusqueda() {
        busquedaAplicada = buscar.trim();
        pagina = 0;
        void cargar();
    }

    // Aplicar automáticamente el filtro al entrar
    // desde el dashboard con ?estado=PENDIENTE_REVISION
    onMount(() => {
        const estadoURL = page.url.searchParams.get('estado');

        if (estadoURL === 'PENDIENTE_REVISION') {
            filtro = 'PENDIENTE_REVISION';
        }

        void cargar();
    });
</script>

<svelte:head>
    <title>Gestión de eventos | Cerro Largo 360</title>
</svelte:head>

<section class="space-y-6 p-4 md:p-8">
    <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <p class="text-sm text-slate-500">Administración</p>
            <h1 class="text-3xl font-semibold tracking-tight">Gestión de eventos</h1>
            <p class="mt-1 text-slate-500">Revisá las publicaciones y su documentación.</p>
        </div>

        <button onclick={cargar} class="rounded-xl border px-4 py-2 hover:bg-slate-50" disabled={cargando}> Actualizar </button>
    </header>

    <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border bg-white p-5">
            <p class="text-sm text-slate-500">Resultados</p>
            <p class="mt-2 text-3xl font-semibold">{total}</p>
        </div>

        <div class="rounded-2xl border bg-white p-5">
            <p class="text-sm text-slate-500">Pendientes de revisión</p>
            <p class="mt-2 text-3xl font-semibold text-amber-700">
                {pendientes}
            </p>
        </div>
    </div>

    <div class="space-y-3 rounded-2xl border bg-white p-4">
        <div class="flex flex-wrap gap-3">
            <form
                class="flex min-w-56 flex-1 gap-2"
                onsubmit={(e) => {
                    e.preventDefault();
                    ejecutarBusqueda();
                }}
            >
                <input aria-label="Buscar eventos" class="min-w-0 flex-1 rounded-xl border px-3 py-2" placeholder="Buscar por título o descripción" bind:value={buscar} />

                <button class="rounded-xl bg-[#477967] px-4 py-2 text-white" type="submit"> Buscar </button>
            </form>

            <select aria-label="Filtrar por estado" class="rounded-xl border px-3 py-2" value={filtro} onchange={(e) => cambiarFiltro(e.currentTarget.value)}>
                <option value="">Todos los estados</option>

                {#each Object.entries(etiqueta) as [key, value]}
                    <option value={key}>{value}</option>
                {/each}
            </select>
        </div>

        {#if error}
            <div role="alert" class="rounded-xl bg-rose-50 p-4 text-rose-800">
                {error}
                <button class="ml-3 underline" onclick={cargar}> Reintentar </button>
            </div>
        {:else if cargando}
            <p class="py-10 text-center text-slate-500">Cargando eventos…</p>
        {:else if eventos.length === 0}
            <p class="py-10 text-center text-slate-500">No hay eventos que coincidan con los filtros.</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full min-w-190 text-left text-sm">
                    <thead class="border-b text-slate-500">
                        <tr>
                            <th class="p-3">Evento</th>
                            <th class="p-3">Organizador</th>
                            <th class="p-3">Categoría</th>
                            <th class="p-3">Fecha</th>
                            <th class="p-3">Estado</th>
                            <th class="p-3">Acción</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each eventos as evento (evento.id)}
                            <tr class="border-b last:border-0 hover:bg-slate-50/70">
                                <td class="p-3 font-medium">
                                    {evento.titulo}
                                </td>

                                <td class="p-3">
                                    {evento.organizador?.nombre_organizacion ?? 'Sin organizador'}
                                </td>

                                <td class="p-3">
                                    {evento.categoria?.nombre ?? 'Sin categoría'}
                                </td>

                                <td class="p-3">
                                    {formato(evento.inicio)}
                                </td>

                                <td class="p-3">
                                    <span
                                        class={`rounded-full px-2.5 py-1 text-xs ${
                                            evento.estado === 'PENDIENTE_REVISION'
                                                ? 'bg-amber-100 text-amber-900'
                                                : evento.estado === 'PUBLICADO'
                                                  ? 'bg-emerald-100 text-emerald-900'
                                                  : 'bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        {etiqueta[evento.estado]}
                                    </span>
                                </td>

                                <td class="p-3">
                                    <a class="font-medium text-[#477967] hover:underline" href={`/administrador/eventos/${evento.id}`}> Ver detalle </a>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}

        <footer class="flex items-center justify-between gap-2 pt-2 text-sm text-slate-500">
            <span>
                {total === 0 ? 0 : pagina * limite + 1}–{Math.min((pagina + 1) * limite, total)} de {total}
            </span>

            <div class="flex gap-2">
                <button
                    class="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                    disabled={pagina === 0 || cargando}
                    onclick={() => {
                        pagina--;
                        void cargar();
                    }}
                >
                    Anterior
                </button>

                <button
                    class="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                    disabled={(pagina + 1) * limite >= total || cargando}
                    onclick={() => {
                        pagina++;
                        void cargar();
                    }}
                >
                    Siguiente
                </button>
            </div>
        </footer>
    </div>
</section>
