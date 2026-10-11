<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { contactoEvento, estadoColor, estadoTexto, fechaEvento, obtenerEvento } from '$lib/organizador/eventos';
  import type { Evento } from '$lib/types/evento';

  let evento = $state<Evento | null>(null);
  let error = $state('');
  let cargando = $state(true);
  let contacto = $derived(contactoEvento(evento?.contacto ?? null));

  onMount(() => {
    void (async () => {
      try {
        const id = Number(page.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new Error('Identificador no válido.');
        evento = await obtenerEvento(id);
      } catch (e) { error = e instanceof Error ? e.message : 'No se pudo cargar.'; }
      finally { cargando = false; }
    })();
  });
</script>

<svelte:head><title>Detalle del evento | Cerro Largo 360</title></svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
  <a href="/organizador/eventos" class="mb-5 inline-block text-sm font-medium text-[#65756b] hover:underline">← Volver a mis eventos</a>
  {#if cargando}
    <p class="text-[#68746c]">Cargando evento...</p>
  {:else if error}
    <div role="alert" class="rounded-xl border border-[#e5b8b4] bg-[#fbe8e6] p-5 text-[#7d3732]">{error}</div>
  {:else if evento}
    <div class="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="mb-2 text-sm text-[#708076]">{evento.categoria.nombre}</p>
        <h1 class="text-3xl font-bold text-[#26382e]">{evento.titulo}</h1>
      </div>
      {#if evento.estado === 'BORRADOR' || evento.estado === 'RECHAZADO'}
        <a href={`/organizador/eventos/${evento.id}/editar`} class="rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29]">Editar evento</a>
      {/if}
    </div>

    <div class="max-w-5xl space-y-6">
      <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
        <p><span class={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${estadoColor(evento.estado)}`}>{estadoTexto[evento.estado]}</span></p>
        {#if evento.motivo_rechazo}
          <p class="mt-4 rounded-lg bg-[#fbe8e6] p-3 text-sm text-[#7d3732]">Motivo de rechazo: {evento.motivo_rechazo}</p>
        {/if}
        <h2 class="mt-6 mb-2 text-xl font-bold text-[#26382e]">Descripción</h2>
        <p class="whitespace-pre-wrap text-[#4a594d]">{evento.descripcion}</p>
      </div>
      <div class="grid gap-5 md:grid-cols-2">
        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-bold text-[#26382e]">Fecha y entrada</h2>
          <p><strong>Inicio:</strong> {fechaEvento(evento.inicio)}</p>
          <p class="mt-2"><strong>Fin:</strong> {evento.fin ? fechaEvento(evento.fin) : 'Sin especificar'}</p>
          <p class="mt-2"><strong>Entrada:</strong> {evento.es_gratuito ? 'Gratuita' : `$ ${evento.precio ?? 'Sin definir'}`}</p>
        </div>
        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-bold text-[#26382e]">Ubicación y contacto</h2>
          <p><strong>Lugar:</strong> {evento.lugar_evento?.replace(' | ', ', ') ?? 'Sin definir'}</p>
          {#if evento.latitud != null && evento.longitud != null}
            <p class="mt-2"><a class="text-[#75514e] underline" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${evento.latitud}%2C${evento.longitud}`}>Ver ubicación en Google Maps</a></p>
          {/if}
          {#if contacto.telefono}<p class="mt-2"><strong>Teléfono:</strong> {contacto.telefono}</p>{/if}
          {#if contacto.correo}<p class="mt-2"><strong>Correo:</strong> {contacto.correo}</p>{/if}
          {#if contacto.redes}<p class="mt-2"><strong>Redes:</strong> {contacto.redes}</p>{/if}
        </div>
      </div>
      {#if evento.recursos.length}
        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-bold text-[#26382e]">Fotografías</h2>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
            {#each evento.recursos as recurso (recurso.id)}
              <img src={recurso.uri} alt={`Imagen de ${evento.titulo}`} class="h-48 w-full rounded-xl object-cover" loading="lazy" />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</section>
