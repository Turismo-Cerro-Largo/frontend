<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import { env } from '$env/dynamic/public';
    import 'mapbox-gl/dist/mapbox-gl.css';
    import type { Map as MapboxMap } from 'mapbox-gl';
    import { page } from '$app/state';
    import { consultarDetalle, invalidarCalendario, invalidarDetalle, mesActualUruguay, mesDeEvento, precargarCalendario } from '$lib/admin/eventos';
    import type { EventoDetalle as Evento } from '$lib/types/admin-eventos';
    let evento = $state<Evento | null>(null);
    const mesEvento = $derived(evento ? mesDeEvento(evento.inicio) : mesActualUruguay());
    let elementoMapa = $state<HTMLDivElement | undefined>(undefined);
    let mapa: MapboxMap | undefined;
    let errorMapa = $state('');
    let mostrandoMapa = $state(false);
    const tokenMapbox = env.PUBLIC_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    const coordenadas = $derived(
        (() => {
            const lat = Number(evento?.latitud);
            const lng = Number(evento?.longitud);
            if (evento?.latitud == null || evento?.longitud == null || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
            return { lat, lng };
        })()
    );
    async function montarMapa() {
        mapa?.remove();
        mapa = undefined;
        errorMapa = '';
        mostrandoMapa = false;
        if (!coordenadas) return;
        if (!tokenMapbox) {
            errorMapa = 'Falta configurar PUBLIC_MAPBOX_TOKEN en el frontend.';
            return;
        }
        await tick();
        if (!elementoMapa) return;
        try {
            const mapboxgl = (await import('mapbox-gl')).default;
            mapboxgl.accessToken = tokenMapbox;
            mapa = new mapboxgl.Map({
                container: elementoMapa,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [coordenadas.lng, coordenadas.lat],
                zoom: 14,
                attributionControl: true,
            });
            new mapboxgl.Marker({ color: '#477967' }).setLngLat([coordenadas.lng, coordenadas.lat]).addTo(mapa);
            mapa.on('load', () => {
                mostrandoMapa = true;
                mapa?.resize();
            });
            mapa.on('error', () => {
                errorMapa = 'No se pudo cargar el mapa. Verificá el token y la conexión.';
            });
        } catch {
            errorMapa = 'No se pudo iniciar Mapbox. Verificá que mapbox-gl esté instalado.';
        }
    }
    onDestroy(() => mapa?.remove());
    let cargando = $state(true);
    let guardando = $state(false);
    let error = $state('');
    let mensaje = $state('');
    let motivo = $state('');
    let decision = $state<'PUBLICADO' | 'RECHAZADO' | null>(null);
    const fecha = (v: string) => new Date(v).toLocaleString('es-UY', { dateStyle: 'medium', timeStyle: 'short' });
    function urlArchivo(uri: string) {
        return uri.startsWith('/api/archivos/') ? uri : `/api/archivos${uri.startsWith('/') ? uri : '/' + uri}`;
    }
    async function cargar() {
        cargando = true;
        error = '';
        try {
            evento = await consultarDetalle(Number(page.params.id));
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error inesperado';
        } finally {
            cargando = false;
        }
        if (evento) await montarMapa();
    }
    onMount(() => {
        void cargar();
    });
    async function cambiarEstado() {
        if (!evento || !decision || guardando) return;
        if (decision === 'RECHAZADO' && motivo.trim().length < 5) {
            error = 'Indicá un motivo de rechazo de al menos cinco caracteres.';
            return;
        }
        guardando = true;
        error = '';
        mensaje = '';
        try {
            const res = await fetch(`/api/eventos/${evento.id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ estado: decision, ...(decision === 'RECHAZADO' ? { motivo_rechazo: motivo.trim() } : {}) }),
            });
            if (!res.ok) throw new Error(`No se pudo cambiar el estado (${res.status}).`);
            const data = await res.json();
            evento = { ...evento, estado: data.estado, motivo_rechazo: data.motivo_rechazo };
            invalidarDetalle(evento.id);
            invalidarCalendario();
            mensaje = decision === 'PUBLICADO' ? 'Evento aprobado y publicado.' : 'Evento rechazado.';
            decision = null;
            motivo = '';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error al guardar';
        } finally {
            guardando = false;
        }
    }
</script>

<svelte:head><title>Revisión de evento | Cerro Largo 360</title></svelte:head>
<section class="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
    <nav class="flex flex-wrap items-center gap-4" aria-label="Navegación de eventos">
        <a href="/administrador/eventos" data-sveltekit-preload-data="hover" class="text-sm font-medium text-[#477967] hover:underline">← Volver a eventos</a>
        <a
            href={`/administrador/eventos/calendario?mes=${mesEvento}`}
            data-sveltekit-preload-data="hover"
            onpointerenter={() => precargarCalendario(mesEvento)}
            onfocus={() => precargarCalendario(mesEvento)}
            class="text-sm font-medium text-[#477967] hover:underline"
        >Ver en calendario</a>
    </nav>
    {#if cargando}<p class="rounded-2xl border p-6">Cargando detalle…</p>{:else if !evento}<div role="alert" class="rounded-2xl border p-6 text-rose-700">
            {error || 'Evento no encontrado.'}<button onclick={cargar} class="ml-3 underline">Reintentar</button>
        </div>{:else}
        <header class="flex flex-wrap items-start justify-between gap-4">
            <div>
                <p class="text-sm text-slate-500">Evento #{evento.id}</p>
                <h1 class="text-3xl font-semibold">{evento.titulo}</h1>
                <p class="mt-2 text-slate-500">Estado actual: <strong>{evento.estado.replaceAll('_', ' ')}</strong></p>
            </div>
            <a href={`/administrador/organizadores/${evento.organizador?.id}`} class="rounded-xl border px-4 py-2 hover:bg-slate-50">Ver organizador</a>
        </header>
        {#if error}<p role="alert" class="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>{/if}{#if mensaje}<p
                role="status"
                class="rounded-xl bg-emerald-50 p-4 text-emerald-800"
            >
                {mensaje}
            </p>{/if}
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div class="space-y-5">
                <article class="rounded-2xl border bg-white p-5">
                    <h2 class="text-lg font-semibold">Información del evento</h2>
                    <p class="mt-3 whitespace-pre-wrap text-slate-700">{evento.descripcion}</p>
                    <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt class="text-slate-500">Organizador</dt>
                            <dd>{evento.organizador?.nombre_organizacion ?? 'Sin datos'}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Categoría</dt>
                            <dd>{evento.categoria?.nombre ?? 'Sin categoría'}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Inicio</dt>
                            <dd>{fecha(evento.inicio)}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Finalización</dt>
                            <dd>{evento.fin ? fecha(evento.fin) : 'No indicada'}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Costo</dt>
                            <dd>{evento.es_gratuito ? 'Gratuito' : (evento.precio ?? 'Sin especificar')}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Contacto</dt>
                            <dd>{evento.contacto ?? 'No indicado'}</dd>
                        </div>
                        <div class="sm:col-span-2">
                            <dt class="text-slate-500">Lugar</dt>
                            <dd>{evento.lugar_evento ?? 'Sin dirección'}</dd>
                        </div>
                    </dl>
                </article>
                <article class="rounded-2xl border bg-white p-5">
                    <h2 class="text-lg font-semibold">Fotografías y recursos</h2>
                    {#if evento.recursos.length === 0}<p class="mt-3 text-slate-500">No se cargaron imágenes.</p>{:else}<div class="mt-4 grid gap-3 sm:grid-cols-2">
                            {#each evento.recursos as recurso, i (i)}<a
                                    href={urlArchivo(recurso.uri)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="block overflow-hidden rounded-xl border"
                                    ><img
                                        src={urlArchivo(recurso.uri)}
                                        alt={`Recurso ${i + 1} del evento`}
                                        class="h-52 w-full object-cover"
                                        loading="lazy"
                                        onerror={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    /><span class="block p-2 text-xs text-slate-500">Abrir recurso {i + 1}</span></a
                                >{/each}
                        </div>{/if}
                </article>
                <article class="rounded-2xl border bg-white p-5">
                    <h2 class="text-lg font-semibold">Ubicación</h2>
                    <p class="mt-2 text-sm text-slate-600">{evento.lugar_evento ?? 'Sin dirección'}</p>
                    {#if coordenadas}
                        <p class="mt-2 text-sm text-slate-600">Coordenadas: {coordenadas.lat}, {coordenadas.lng}</p>
                        <div class="relative mt-4 overflow-hidden rounded-xl border border-slate-200">
                            <div bind:this={elementoMapa} class="h-82.5 w-full md:h-100" aria-label={`Mapa con la ubicación de ${evento.titulo}`}></div>
                            {#if !mostrandoMapa && !errorMapa}<div
                                    class="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-100/70 text-sm text-slate-600"
                                >
                                    Cargando mapa…
                                </div>{/if}
                        </div>
                        {#if errorMapa}<p role="alert" class="mt-2 text-sm text-amber-700">{errorMapa}</p>{/if}
                        <a
                            class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#477967] hover:underline"
                            href={`https://www.google.com/maps/search/?api=1&query=${coordenadas.lat}%2C${coordenadas.lng}`}
                            target="_blank"
                            rel="noopener noreferrer">Abrir ubicación en otra pestaña ↗</a
                        >
                    {:else}<p class="mt-2 text-sm text-slate-500">Este evento no tiene coordenadas válidas.</p>{/if}
                </article>
            </div>
            <aside class="space-y-4">
                <div class="sticky top-4 rounded-2xl border bg-white p-5">
                    <h2 class="text-lg font-semibold">Revisión administrativa</h2>
                    {#if evento.motivo_rechazo}<p class="mt-3 rounded-xl bg-rose-50 p-3 text-sm">Motivo anterior: {evento.motivo_rechazo}</p>{/if}
                    <p class="mt-3 text-sm text-slate-500">Para aprobar o rechazar una publicación pendiente, elegí una acción.</p>
                    {#if evento.estado === 'PENDIENTE_REVISION'}<div class="mt-4 grid gap-2">
                            <button
                                class="rounded-xl bg-[#477967] px-4 py-2.5 font-medium text-white hover:opacity-90"
                                onclick={() => {
                                    decision = 'PUBLICADO';
                                    error = '';
                                }}>Aprobar y publicar</button
                            ><button
                                class="rounded-xl border border-rose-300 px-4 py-2.5 text-rose-800 hover:bg-rose-50"
                                onclick={() => {
                                    decision = 'RECHAZADO';
                                    error = '';
                                }}>Rechazar evento</button
                            >
                        </div>{:else}<p class="mt-4 rounded-xl bg-slate-50 p-3 text-sm">Este evento no está pendiente de revisión.</p>{/if}
                </div>
            </aside>
        </div>
        {#if decision}<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
                <div role="dialog" aria-modal="true" aria-labelledby="titulo-decision" class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <h2 id="titulo-decision" class="text-xl font-semibold">{decision === 'PUBLICADO' ? '¿Aprobar este evento?' : '¿Rechazar este evento?'}</h2>
                    <p class="mt-2 text-sm text-slate-600">{decision === 'PUBLICADO' ? 'El evento pasará a estar publicado.' : 'El organizador verá el motivo del rechazo.'}</p>
                    {#if decision === 'RECHAZADO'}<textarea
                            aria-label="Motivo del rechazo"
                            bind:value={motivo}
                            maxlength="2000"
                            rows="4"
                            class="mt-4 w-full rounded-xl border p-3"
                            placeholder="Explicá qué debe corregir…"></textarea>{/if}
                    <div class="mt-5 flex justify-end gap-2">
                        <button
                            disabled={guardando}
                            class="rounded-xl border px-4 py-2"
                            onclick={() => {
                                decision = null;
                                error = '';
                            }}>Cancelar</button
                        ><button disabled={guardando} class="rounded-xl bg-[#477967] px-4 py-2 text-white disabled:opacity-50" onclick={cambiarEstado}
                            >{guardando ? 'Guardando…' : 'Confirmar'}</button
                        >
                    </div>
                    {#if error}<p role="alert" class="mt-3 text-sm text-rose-700">{error}</p>{/if}
                </div>
            </div>{/if}
    {/if}
</section>
