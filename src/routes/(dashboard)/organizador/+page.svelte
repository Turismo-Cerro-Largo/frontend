<script lang="ts">
    import { onMount } from 'svelte';
    let { data } = $props();
    let aprobado = $derived(data.estadoOrganizador === 'APROBADO');

    type Estado = 'BORRADOR' | 'PENDIENTE_REVISION' | 'PUBLICADO' | 'RECHAZADO' | 'CANCELADO' | 'FINALIZADO';
    type Evento = { id: number; titulo: string; inicio: string; estado: Estado };
    type Estadisticas = {
        total: number;
        pendientes: number;
        publicados: number;
        borradores: number;
        ultimos: Evento[];
    };

    let estadisticas = $state<Estadisticas | null>(null);
    let cargando = $state(true);
    let error = $state('');

    onMount(() => {
        if (!aprobado) {
            cargando = false;
            return;
        }
        async function cargarEstadisticas() {
            try {
                const respuesta = await fetch('/api/eventos/status', { credentials: 'include' });
                if (!respuesta.ok) {
                    const detalle = await respuesta.json().catch(() => null);
                    throw new Error(detalle?.message || `Error ${respuesta.status} al cargar las estadísticas`);
                }
                estadisticas = (await respuesta.json()) as Estadisticas;
            } catch (e) {
                error = e instanceof Error ? e.message : 'No se pudieron cargar las estadísticas';
            } finally {
                cargando = false;
            }
        }
        void cargarEstadisticas();
    });

    const etiquetas: Record<Estado, string> = {
        PUBLICADO: 'Publicado',
        PENDIENTE_REVISION: 'Pendiente',
        BORRADOR: 'Borrador',
        RECHAZADO: 'Rechazado',
        CANCELADO: 'Cancelado',
        FINALIZADO: 'Finalizado',
    };

    function colorEstado(estado: Estado) {
        switch (estado) {
            case 'PUBLICADO':
                return 'bg-[#d7e5db] text-[#385443]';
            case 'PENDIENTE_REVISION':
                return 'bg-[#fff1c9] text-[#765e19]';
            case 'RECHAZADO':
                return 'bg-[#f6d8d6] text-[#883b36]';
            case 'CANCELADO':
                return 'bg-[#eadede] text-[#704848]';
            default:
                return 'bg-[#ecebea] text-[#585858]';
        }
    }

    function fechaEvento(fecha: string) {
        return new Intl.DateTimeFormat('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Montevideo',
        }).format(new Date(fecha));
    }
</script>

<svelte:head>
    <title>Panel del organizador | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
    {#if !aprobado}
        <div class="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#ded8cf] bg-white p-7 shadow-sm">
            <div class="mb-4 inline-flex rounded-full bg-[#fff1c9] px-4 py-2 text-sm font-semibold text-[#765e19]">
                {data.estadoOrganizador === 'RECHAZADO' ? 'Solicitud rechazada' : 'Pendiente de revisión'}
            </div>
            <h1 class="text-2xl font-bold text-[#26382e]">
                {data.estadoOrganizador === 'RECHAZADO' ? 'Tu solicitud no fue aprobada' : 'Estamos revisando tu organización'}
            </h1>
            <p class="mt-3 leading-7 text-[#68746c]">
                {data.estadoOrganizador === 'RECHAZADO'
                    ? 'La solicitud fue rechazada. Revisá la información de tu perfil antes de consultar los próximos pasos con el equipo administrador.'
                    : 'Tu registro se realizó correctamente. Podés consultar tu perfil mientras el equipo administrador verifica la documentación presentada.'}
            </p>
            <p class="mt-3 text-sm text-[#68746c]">La creación y gestión de eventos estarán disponibles cuando tu cuenta tenga el estado Aprobado.</p>
            <a href="/organizador/perfil" class="mt-6 inline-flex rounded-xl bg-[#d7e5db] px-5 py-3 font-semibold text-[#26382e] transition-colors hover:bg-[#c5d9ca]"
                >Ver mi perfil</a
            >
        </div>
    {:else}
        <div class="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
                <p class="mb-1 text-sm font-medium text-[#708076]">Panel del organizador</p>
                <h1 class="text-3xl font-bold text-[#26382e]">Hola, Organizador</h1>
                <p class="mt-2 text-[#68746c]">Desde acá podés crear y gestionar tus eventos.</p>
            </div>
            <a
                href="/organizador/eventos/nuevo"
                class="inline-flex w-fit items-center justify-center rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29] shadow-sm transition hover:opacity-90"
            >
                + Crear nuevo evento
            </a>
        </div>

        {#if error}
            <p role="alert" class="mb-6 rounded-xl border border-[#f6d8d6] bg-[#fff2f1] px-5 py-4 text-sm text-[#883b36]">{error}</p>
        {/if}

        <div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {#each [{ numero: estadisticas?.total, texto: 'Total de eventos' }, { numero: estadisticas?.pendientes, texto: 'Pendientes' }, { numero: estadisticas?.publicados, texto: 'Publicados' }, { numero: estadisticas?.borradores, texto: 'Borradores' }] as tarjeta}
                <div class="rounded-2xl border border-[#ded8cf] bg-white p-5 shadow-sm">
                    <p class="text-3xl font-bold text-[#26382e]">{cargando ? '…' : (tarjeta.numero ?? '—')}</p>
                    <p class="mt-1 text-sm text-[#69736c]">{tarjeta.texto}</p>
                </div>
            {/each}
        </div>

        <div class="mb-4 flex items-center justify-between gap-4">
            <h2 class="text-xl font-bold text-[#26382e]">Mis eventos recientes</h2>
            <a href="/organizador/eventos" class="text-sm font-medium text-[#75514e] hover:underline">Ver todos</a>
        </div>

        <div class="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm">
            {#if cargando}
                <p class="p-6 text-sm text-[#647067]">Cargando eventos…</p>
            {:else if !estadisticas?.ultimos?.length}
                <p class="p-6 text-sm text-[#647067]">No hay eventos recientes.</p>
            {:else}
                <div class="hidden overflow-x-auto md:block">
                    <table class="w-full text-left">
                        <thead class="border-b border-[#e7e2da] bg-[#faf9f6]">
                            <tr>
                                <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Evento</th>
                                <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Fecha</th>
                                <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Estado</th>
                                <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each estadisticas.ultimos as evento (evento.id)}
                                <tr class="border-b border-[#eeeae4] last:border-b-0">
                                    <td class="px-6 py-5 text-sm font-medium text-[#303c34]">{evento.titulo}</td>
                                    <td class="px-6 py-5 text-sm text-[#647067]">{fechaEvento(evento.inicio)}</td>
                                    <td class="px-6 py-5">
                                        <span class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(evento.estado)}`}>
                                            {etiquetas[evento.estado] ?? evento.estado}
                                        </span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex gap-4">
                                            {#if evento.estado === 'BORRADOR' || evento.estado === 'RECHAZADO'}<a
                                                    href={`/organizador/eventos/${evento.id}`}
                                                    class="text-sm font-medium text-[#75514e] hover:underline">Editar</a
                                                >{:else}<a
                                                    href={`/organizador/eventos/${evento.id}/preview`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="text-sm font-medium text-[#52675a] hover:underline">Ver</a
                                                >{/if}
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <div class="divide-y divide-[#eeeae4] md:hidden">
                    {#each estadisticas.ultimos as evento (evento.id)}
                        <article class="p-5">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <h3 class="font-semibold text-[#303c34]">{evento.titulo}</h3>
                                    <p class="mt-1 text-sm text-[#6d776f]">{fechaEvento(evento.inicio)}</p>
                                </div>
                                <span class={`rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(evento.estado)}`}>
                                    {etiquetas[evento.estado] ?? evento.estado}
                                </span>
                            </div>
                            <div class="mt-4 flex gap-4">
                                {#if evento.estado === 'BORRADOR' || evento.estado === 'RECHAZADO'}<a
                                        href={`/organizador/eventos/${evento.id}`}
                                        class="text-sm font-medium text-[#75514e]">Editar</a
                                    >{:else}<a
                                        href={`/organizador/eventos/${evento.id}/preview`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-sm font-medium text-[#52675a]">Ver</a
                                    >{/if}
                            </div>
                        </article>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="mt-6 rounded-xl border border-[#ead79c] bg-[#fff8e5] px-5 py-4">
            <p class="text-sm text-[#67582d]">Los eventos enviados deben ser revisados por un administrador antes de publicarse.</p>
        </div>
    {/if}
</section>
