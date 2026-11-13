<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import {
        consultarCalendario,
        precargarDetalle,
        fechaUruguay,
        mesActualUruguay,
        mesValido,
        etiquetasEstado,
        type EventoResumen,
        type EstadoEvento,
    } from '$lib/admin/eventos';

    let mes = $state(mesActualUruguay());
    let eventos = $state<EventoResumen[]>([]);
    let estado = $state('');
    let buscar = $state('');
    let busquedaAplicada = $state('');
    let cargando = $state(true);
    let error = $state('');
    let consulta = 0;
    const hoy = fechaUruguay(new Date());

    const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const mesTexto = $derived(
        new Intl.DateTimeFormat('es-UY', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(`${mes}-01T12:00:00Z`)),
    );

    const eventosPorDia = $derived.by(() => {
        const agrupados = new Map<string, EventoResumen[]>();
        for (const evento of eventos) {
            const dia = fechaUruguay(evento.inicio);
            const lista = agrupados.get(dia) ?? [];
            lista.push(evento);
            agrupados.set(dia, lista);
        }
        return agrupados;
    });

    const celdas = $derived.by(() => {
        const [anio, numeroMes] = mes.split('-').map(Number);
        const primero = new Date(Date.UTC(anio, numeroMes - 1, 1));
        const desplazamiento = (primero.getUTCDay() + 6) % 7;
        const totalDias = new Date(Date.UTC(anio, numeroMes, 0)).getUTCDate();
        const cantidadCeldas = Math.ceil((desplazamiento + totalDias) / 7) * 7;

        return Array.from({ length: cantidadCeldas }, (_, indice) => {
            const numero = indice - desplazamiento + 1;
            if (numero < 1 || numero > totalDias) return null;
            const dia = `${mes}-${String(numero).padStart(2, '0')}`;
            return { numero, dia, eventos: eventosPorDia.get(dia) ?? [] };
        });
    });

    function hora(inicio: string): string {
        return new Intl.DateTimeFormat('es-UY', {
            timeZone: 'America/Montevideo',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(new Date(inicio));
    }

    function estiloEstado(valor: EstadoEvento): string {
        if (valor === 'PUBLICADO') return 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100';
        if (valor === 'PENDIENTE_REVISION') return 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100';
        if (valor === 'RECHAZADO' || valor === 'CANCELADO') return 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100';
        return 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';
    }

    async function cargar() {
        const actual = ++consulta;
        cargando = true;
        error = '';
        try {
            const respuesta = await consultarCalendario(mes, estado, busquedaAplicada);
            if (actual !== consulta) return;
            eventos = respuesta.eventos;
        } catch (e) {
            if (actual !== consulta) return;
            eventos = [];
            error = e instanceof Error ? e.message : 'No se pudo consultar el calendario.';
        } finally {
            if (actual === consulta) cargando = false;
        }
    }

    function mesDesplazado(base: string, movimiento: number): string {
        const [anio, numeroMes] = base.split('-').map(Number);
        const nuevo = new Date(Date.UTC(anio, numeroMes - 1 + movimiento, 1));
        return `${nuevo.getUTCFullYear()}-${String(nuevo.getUTCMonth() + 1).padStart(2, '0')}`;
    }

    async function cambiarMes(siguiente: string) {
        if (!mesValido(siguiente) || siguiente === mes) return;
        mes = siguiente;
        // Actualiza el enlace compartible sin perder los filtros locales.
        await goto(`/administrador/eventos/calendario?mes=${mes}`, {
            replaceState: true,
            noScroll: true,
            keepFocus: true,
        });
        void cargar();
    }

    function buscarEventos() {
        busquedaAplicada = buscar.trim();
        void cargar();
    }

    onMount(() => {
        const mesURL = page.url.searchParams.get('mes');
        if (mesURL && mesValido(mesURL)) mes = mesURL;
        void cargar();
    });
</script>

<svelte:head>
    <title>Calendario de eventos | Cerro Largo 360</title>
    <meta name="description" content="Calendario mensual de eventos para administración de Cerro Largo 360." />
</svelte:head>

<section class="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
    <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
            <p class="text-sm text-slate-500">Administración / Eventos</p>
            <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Calendario de eventos</h1>
            <p class="mt-1 text-slate-500">Consultá los eventos reales según su fecha de inicio.</p>
        </div>
        <a
            href="/administrador/eventos"
            data-sveltekit-preload-data="hover"
            class="inline-flex items-center rounded-xl border bg-white px-4 py-2 text-sm font-medium text-[#477967] hover:bg-slate-50"
        >← Volver al listado</a>
    </header>

    <div class="space-y-4 rounded-2xl border bg-white p-4 md:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
                <button
                    type="button"
                    aria-label="Mes anterior"
                    class="rounded-xl border px-3 py-2 text-slate-700 hover:bg-slate-50"
                    onclick={() => void cambiarMes(mesDesplazado(mes, -1))}
                >←</button>
                <h2 class="min-w-40 text-center text-xl font-semibold capitalize text-slate-900">{mesTexto}</h2>
                <button
                    type="button"
                    aria-label="Mes siguiente"
                    class="rounded-xl border px-3 py-2 text-slate-700 hover:bg-slate-50"
                    onclick={() => void cambiarMes(mesDesplazado(mes, 1))}
                >→</button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <label for="mes-calendario" class="text-sm text-slate-600">Ir al mes</label>
                <input
                    id="mes-calendario"
                    type="month"
                    value={mes}
                    class="rounded-xl border px-3 py-2 text-sm"
                    onchange={(e) => void cambiarMes(e.currentTarget.value)}
                />
                <button
                    type="button"
                    class="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                    onclick={() => void cambiarMes(mesActualUruguay())}
                >Hoy</button>
            </div>
        </div>

        <form
            class="flex flex-wrap items-center gap-3"
            onsubmit={(e) => { e.preventDefault(); buscarEventos(); }}
        >
            <input
                aria-label="Buscar eventos en el calendario"
                placeholder="Buscar por título o descripción"
                bind:value={buscar}
                class="min-w-52 flex-1 rounded-xl border px-3 py-2 text-sm"
            />
            <button type="submit" class="rounded-xl bg-[#477967] px-4 py-2 text-sm font-medium text-white hover:bg-[#396250]">Buscar</button>
            <select
                aria-label="Filtrar eventos del calendario por estado"
                value={estado}
                class="rounded-xl border px-3 py-2 text-sm"
                onchange={(e) => { estado = e.currentTarget.value; void cargar(); }}
            >
                <option value="">Todos los estados</option>
                {#each Object.entries(etiquetasEstado) as [clave, etiqueta]}
                    <option value={clave}>{etiqueta}</option>
                {/each}
            </select>
        </form>

        {#if error}
            <div role="alert" class="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
                {error}
                <button class="ml-3 font-semibold underline" onclick={() => void cargar()}>Reintentar</button>
            </div>
        {/if}

        <div class="flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>{cargando ? 'Cargando calendario…' : `${eventos.length} evento${eventos.length === 1 ? '' : 's'} en este mes`}</span>
            <span>Horario de Uruguay</span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200" aria-busy={cargando}>
            <div class="min-w-180">
                <div class="grid grid-cols-7 border-b bg-[#f2f6f3] text-center text-xs font-semibold text-[#365747]">
                    {#each nombresDias as dia}
                        <div class="border-r px-2 py-3 last:border-r-0">{dia}</div>
                    {/each}
                </div>
                <div class="grid grid-cols-7">
                    {#each celdas as celda, indice (indice)}
                        <div class={`min-h-33 border-b border-r p-1.5 sm:p-2 ${celda ? 'bg-white' : 'bg-slate-50'} ${indice % 7 === 6 ? 'border-r-0' : ''}`}>
                            {#if celda}
                                <div class="mb-1 flex items-center justify-between">
                                    <span class={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${celda.dia === hoy ? 'bg-[#477967] text-white' : 'text-slate-600'}`}>
                                        {celda.numero}
                                    </span>
                                    {#if celda.eventos.length > 0}
                                        <span class="text-[11px] text-slate-400">{celda.eventos.length}</span>
                                    {/if}
                                </div>
                                <div class="space-y-1">
                                    {#each celda.eventos as evento (evento.id)}
                                        <a
                                            href={`/administrador/eventos/${evento.id}`}
                                            data-sveltekit-preload-data="hover"
                                            onpointerenter={() => precargarDetalle(evento.id)}
                                            onfocus={() => precargarDetalle(evento.id)}
                                            class={`block rounded-lg border px-1.5 py-1.5 text-xs transition-colors ${estiloEstado(evento.estado)}`}
                                            title={`${evento.titulo} · ${etiquetasEstado[evento.estado]}`}
                                        >
                                            <span class="block truncate font-semibold">{hora(evento.inicio)} · {evento.titulo}</span>
                                            <span class="block truncate text-[11px] opacity-75">{etiquetasEstado[evento.estado]}</span>
                                        </a>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        <p class="text-xs text-slate-500">En pantallas pequeñas, desplazate horizontalmente para ver los siete días. Seleccioná un evento para abrir su detalle.</p>
    </div>
</section>
