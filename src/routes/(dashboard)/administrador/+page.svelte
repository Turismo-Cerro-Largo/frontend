<script lang="ts">
    import { onMount } from 'svelte';

    import type { ResumenAdmin } from '$lib/types/admin';

    let resumen = $state<ResumenAdmin | null>(null);
    let cargando = $state(true);
    let error = $state('');
    let noAutorizado = $state(false);
    const numero = (n: number) => new Intl.NumberFormat('es-UY').format(n);
    const fecha = (s: string) => new Date(s).toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' });
    const estadoTexto = (e: string) => e.replaceAll('_', ' ').toLowerCase();

    async function cargar() {
        cargando = true;
        error = '';
        noAutorizado = false;
        try {
            const respuesta = await fetch('/api/admin/dashboard', { credentials: 'include', cache: 'no-store' });
            if (respuesta.status === 401 || respuesta.status === 403) {
                noAutorizado = true;
                return;
            }
            if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
            resumen = (await respuesta.json()) as ResumenAdmin;
        } catch (e) {
            error = e instanceof Error ? e.message : 'No se pudo cargar el resumen';
        } finally {
            cargando = false;
        }
    }
    onMount(() => {
        void cargar();
    });

    let grafico = $derived(resumen?.eventosPorMes ?? []);
    let maximo = $derived(Math.max(1, ...grafico.map((x) => x.total)));
    let puntos = $derived(grafico.map((x, i) => `${24 + i * 90},${175 - (x.total / maximo) * 135}`).join(' '));
    let area = $derived(puntos ? `24,175 ${puntos} 474,175` : '');
</script>

<svelte:head>
    <title>Resumen administrativo | Cerro Largo 360</title>
    <meta name="description" content="Indicadores y actividad de administración de Cerro Largo 360" />
</svelte:head>

<section class="space-y-6 p-1 sm:p-3">
    <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <p class="text-sm font-semibold text-emerald-700">Cerro Largo 360</p>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Resumen general</h1>
            <p class="mt-1 text-sm text-slate-500">Indicadores y tareas pendientes de la plataforma.</p>
        </div>
        <button
            onclick={cargar}
            disabled={cargando}
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >{cargando ? 'Actualizando…' : 'Actualizar datos'}</button
        >
    </header>

    {#if cargando && !resumen}
        <div role="status" class="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Cargando estadísticas…</div>
    {:else if noAutorizado}
        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 class="font-semibold text-amber-900">Acceso restringido</h2>
            <p class="mt-1 text-sm text-amber-800">Iniciá sesión como administrador para consultar el resumen.</p>
            <a class="mt-3 inline-block text-sm font-semibold underline" href="/">Volver al inicio</a>
        </div>
    {:else if error}
        <div role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            No se pudieron cargar los datos: {error}. <button class="ml-1 font-semibold underline" onclick={cargar}>Reintentar</button>
        </div>
    {:else if resumen}
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {#each [{ titulo: 'Usuarios registrados', valor: resumen.totales.usuarios, detalle: `+${numero(resumen.esteMes.usuarios)} este mes`, link: '/administrador/usuarios' }, { titulo: 'Eventos publicados', valor: resumen.totales.eventosPublicados, detalle: `${numero(resumen.totales.eventos)} eventos en total`, link: '/administrador/eventos' }, { titulo: 'Organizadores', valor: resumen.totales.organizadores, detalle: `${numero(resumen.pendientes.organizadores)} pendientes`, link: '/administrador/organizadores' }, { titulo: 'Ubicaciones', valor: resumen.totales.ubicaciones, detalle: 'Lugares turísticos', link: '/administrador/ubicaciones' }] as tarjeta}
                <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <p class="text-sm text-slate-500">{tarjeta.titulo}</p>
                    <p class="mt-2 text-3xl font-bold tabular-nums text-slate-900">{numero(tarjeta.valor)}</p>
                    <p class="mt-2 text-xs text-slate-500">{tarjeta.detalle}</p>
                </div>
            {/each}
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <a
                href="/administrador/organizadores?estado=PENDIENTE_REVISION"
                class="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:bg-amber-100"
            >
                <div>
                    <p class="font-semibold text-slate-900">Organizadores por validar</p>
                    <p class="mt-1 text-sm text-slate-600">Revisar registros y documentación</p>
                </div>
                <strong class="text-3xl text-amber-800">{numero(resumen.pendientes.organizadores)}</strong>
            </a>
            <a
                href="/administrador/eventos?estado=PENDIENTE_REVISION"
                class="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50 p-5 transition hover:bg-sky-100"
            >
                <div>
                    <p class="font-semibold text-slate-900">Eventos por revisar</p>
                    <p class="mt-1 text-sm text-slate-600">Nuevas publicaciones pendientes</p>
                </div>
                <strong class="text-3xl text-sky-800">{numero(resumen.pendientes.eventos)}</strong>
            </a>
        </div>

        <div class="grid gap-4 lg:grid-cols-5">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
                <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h2 class="text-lg font-semibold text-slate-900">Nuevos eventos</h2>
                        <p class="text-sm text-slate-500">Eventos creados durante los últimos seis meses</p>
                    </div>
                    <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">+{numero(resumen.esteMes.eventos)} este mes</span>
                </div>
                <div class="mt-5 overflow-x-auto">
                    <svg viewBox="0 0 500 205" class="h-56 w-full min-w-72" role="img" aria-label="Gráfico de eventos creados por mes">
                        {#each [0, 0.5, 1] as t}
                            <line x1="24" y1={175 - t * 135} x2="474" y2={175 - t * 135} stroke="#e2e8f0" stroke-dasharray="4 4" />
                        {/each}
                        <polygon points={area} fill="#d1fae5" opacity="0.65" />
                        <polyline points={puntos} fill="none" stroke="#047857" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
                        {#each grafico as mes, i}
                            <circle cx={24 + i * 90} cy={175 - (mes.total / maximo) * 135} r="4" fill="#047857"><title>{mes.clave}: {mes.total} eventos</title></circle>
                            <text x={24 + i * 90} y="196" text-anchor="middle" font-size="12" fill="#64748b">{mes.mes}</text>
                            <text x={24 + i * 90} y={Math.max(16, 164 - (mes.total / maximo) * 135)} text-anchor="middle" font-size="11" fill="#334155">{mes.total}</text>
                        {/each}
                    </svg>
                </div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <h2 class="text-lg font-semibold text-slate-900">Transporte</h2>
                <p class="mt-1 text-sm text-slate-500">Datos cargados en la plataforma</p>
                <div class="mt-6 space-y-4">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                        <span class="text-sm text-slate-600">Empresas registradas</span><strong class="text-2xl text-slate-900">{numero(resumen.totales.empresas)}</strong>
                    </div>
                    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                        <span class="text-sm text-slate-600">Horarios publicados</span><strong class="text-2xl text-slate-900">{numero(resumen.totales.horariosPublicados)}</strong>
                    </div>
                    <a class="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800" href="/administrador/transporte"
                        >Gestionar transporte →</a
                    >
                </div>
            </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-lg font-semibold">Eventos recientes</h2>
                    <a href="/administrador/eventos" class="text-sm font-semibold text-emerald-700 hover:underline">Ver todos</a>
                </div>
                {#if resumen.ultimosEventos.length === 0}<p class="text-sm text-slate-500">Todavía no hay eventos.</p>{:else}
                    <div class="divide-y divide-slate-100">
                        {#each resumen.ultimosEventos as evento (evento.id)}
                            <div class="flex items-center justify-between gap-4 py-3">
                                <div class="min-w-0">
                                    <p class="truncate text-sm font-semibold text-slate-800">{evento.titulo}</p>
                                    <p class="text-xs text-slate-500">{fecha(evento.creado_en)} · {estadoTexto(evento.estado)}</p>
                                </div>
                                <span class="shrink-0 text-xs text-slate-400">#{evento.id}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </section>
            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-lg font-semibold">Solicitudes de organizadores</h2>
                    <a href="/administrador/organizadores" class="text-sm font-semibold text-emerald-700 hover:underline">Ver todas</a>
                </div>
                {#if resumen.ultimosOrganizadores.length === 0}<p class="text-sm text-slate-500">No hay organizadores pendientes.</p>{:else}
                    <div class="divide-y divide-slate-100">
                        {#each resumen.ultimosOrganizadores as org (org.id)}
                            <a href={`/administrador/organizadores/${org.id}`} class="flex items-center justify-between gap-3 py-3 transition hover:bg-slate-50"
                                ><div class="min-w-0">
                                    <p class="truncate text-sm font-semibold text-slate-800">{org.nombre_organizacion}</p>
                                    <p class="text-xs text-slate-500">Solicitud del {fecha(org.creado_en)}</p>
                                </div>
                                <span class="shrink-0 text-xs font-medium text-amber-700">Revisar →</span></a
                            >
                        {/each}
                    </div>
                {/if}
            </section>
        </div>
    {/if}
</section>
