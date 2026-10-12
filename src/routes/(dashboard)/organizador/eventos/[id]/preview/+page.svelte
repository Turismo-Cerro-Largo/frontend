<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let evento = $derived(data.evento);
    const fecha = (valor: string) =>
        new Intl.DateTimeFormat('es-UY', {
            dateStyle: 'long',
            timeStyle: 'short',
            timeZone: 'America/Montevideo',
        }).format(new Date(valor));

    function imagen(uri: string) {
        if (uri.startsWith('/api/archivos/publicos/')) return uri;
        if (uri.startsWith('/publicos/')) return `/api/archivos${uri}`;
        return '';
    }
</script>

<svelte:head>
    <title>Vista previa: {evento.titulo} | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
    <div class="mx-auto max-w-5xl space-y-6">
        <header class="flex flex-wrap items-start justify-between gap-4">
            <div>
                <p class="mb-1 text-sm font-medium text-[#708076]">Vista previa del evento</p>
                <h1 class="text-3xl font-bold text-[#26382e]">{evento.titulo}</h1>
                <p class="mt-2 text-sm text-[#68746c]">Estado: {evento.estado.replaceAll('_', ' ')}</p>
            </div>
            <div class="flex gap-3">
                {#if evento.estado === 'BORRADOR' || evento.estado === 'RECHAZADO'}
                    <a href={`/organizador/eventos/${evento.id}`} class="rounded-xl bg-[#D89994] px-4 py-2 text-sm font-semibold text-[#442b29]">Editar</a>
                {/if}
                <button type="button" onclick={() => window.close()} class="rounded-xl border border-[#ded8cf] bg-white px-4 py-2 text-sm font-medium text-[#26382e]"
                    >Cerrar pestaña</button
                >
            </div>
        </header>

        {#if evento.estado !== 'PUBLICADO'}
            <p class="rounded-xl border border-[#ead79c] bg-[#fff8e5] px-5 py-4 text-sm text-[#67582d]">Esta es una vista previa privada. El evento no está publicado.</p>
        {/if}
        {#if evento.motivo_rechazo}
            <p class="rounded-xl border border-[#f6d8d6] bg-[#fff2f1] px-5 py-4 text-sm text-[#883b36]">Motivo de rechazo: {evento.motivo_rechazo}</p>
        {/if}

        <article class="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm">
            {#if evento.recursos?.some((r) => r.tipo === 'IMAGEN' && imagen(r.uri))}
                <div class="grid gap-2 p-4 sm:grid-cols-2">
                    {#each evento.recursos
                        .filter((r) => r.tipo === 'IMAGEN' && imagen(r.uri))
                        .sort((a, b) => a.orden - b.orden) as recurso, i (recurso.id ?? `${recurso.uri}-${i}`)}
                        <img src={imagen(recurso.uri)} alt={`Fotografía de ${evento.titulo}`} class="h-60 w-full rounded-xl object-cover" loading="lazy" />
                    {/each}
                </div>
            {/if}
            <div class="space-y-5 p-6">
                <div>
                    <p class="mb-1 text-sm font-medium text-[#68746c]">{evento.categoria?.nombre ?? 'Evento'}</p>
                    <h2 class="text-2xl font-bold text-[#26382e]">{evento.titulo}</h2>
                    <p class="mt-4 whitespace-pre-wrap text-[#45564b]">{evento.descripcion}</p>
                </div>
                <dl class="grid gap-4 border-t border-[#eeeae4] pt-5 sm:grid-cols-2">
                    <div>
                        <dt class="text-sm text-[#68746c]">Inicio</dt>
                        <dd class="font-medium text-[#303c34]">{fecha(evento.inicio)}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-[#68746c]">Finalización</dt>
                        <dd class="font-medium text-[#303c34]">{evento.fin ? fecha(evento.fin) : 'Sin definir'}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-[#68746c]">Lugar</dt>
                        <dd class="font-medium text-[#303c34]">{evento.lugar_evento || 'Sin definir'}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-[#68746c]">Entrada</dt>
                        <dd class="font-medium text-[#303c34]">{evento.es_gratuito ? 'Gratis' : evento.precio != null ? `$ ${evento.precio}` : 'Consultar'}</dd>
                    </div>
                    {#if evento.contacto}
                        <div class="sm:col-span-2">
                            <dt class="text-sm text-[#68746c]">Contacto</dt>
                            <dd class="font-medium text-[#303c34]">{evento.contacto}</dd>
                        </div>
                    {/if}
                    {#if evento.latitud != null && evento.longitud != null}
                        <div class="sm:col-span-2">
                            <a
                                href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(evento.latitud))}&mlon=${encodeURIComponent(String(evento.longitud))}#map=14/${encodeURIComponent(String(evento.latitud))}/${encodeURIComponent(String(evento.longitud))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm font-medium text-[#75514e] underline">Ver ubicación en el mapa</a
                            >
                        </div>
                    {/if}
                </dl>
            </div>
        </article>
    </div>
</section>
