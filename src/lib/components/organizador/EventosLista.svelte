<script lang="ts">
  import { onMount } from 'svelte';
  import { estadoColor, estadoTexto, fechaEvento, obtenerEventos } from '$lib/organizador/eventos';
  import type { Evento, EstadoEvento } from '$lib/types/evento';

  let { resumen = false }: { resumen?: boolean } = $props();
  let eventos = $state<Evento[]>([]);
  let cargando = $state(true);
  let error = $state('');
  let filtro = $state<EstadoEvento | 'TODOS'>('TODOS');

  let filtrados = $derived(eventos.filter(evento => filtro === 'TODOS' || evento.estado === filtro));
  let visibles = $derived(resumen ? filtrados.slice(0, 5) : filtrados);

  const tarjetas = [
    { texto: 'Total de eventos', estado: 'TODOS' },
    { texto: 'Pendientes', estado: 'PENDIENTE_REVISION' },
    { texto: 'Publicados', estado: 'PUBLICADO' },
    { texto: 'Borradores', estado: 'BORRADOR' }
  ] as const;

  function contar(estado: EstadoEvento | 'TODOS') {
    return estado === 'TODOS' ? eventos.length : eventos.filter(e => e.estado === estado).length;
  }

  async function cargar() {
    cargando = true;
    error = '';
    try { eventos = await obtenerEventos(); }
    catch (e) { error = e instanceof Error ? e.message : 'No fue posible cargar los eventos.'; }
    finally { cargando = false; }
  }

  onMount(() => { void cargar(); });
</script>

<svelte:head>
  <title>{resumen ? 'Panel del organizador' : 'Mis eventos'} | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
  <div class="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
    <div>
      <p class="mb-1 text-sm font-medium text-[#708076]">Panel del organizador</p>
      <h1 class="text-3xl font-bold text-[#26382e]">{resumen ? 'Mis eventos recientes' : 'Mis eventos'}</h1>
      <p class="mt-2 text-[#68746c]">Consultá y gestioná los eventos que guardaste en la base de datos.</p>
    </div>
    <a href="/organizador/eventos/nuevo" class="rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29] shadow-sm transition hover:opacity-90">+ Crear nuevo evento</a>
  </div>

  <div class="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
    {#each tarjetas as tarjeta}
      <button type="button" onclick={() => filtro = tarjeta.estado}
        class={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-[#91aa99] ${filtro === tarjeta.estado ? 'border-[#78917f]' : 'border-[#ded8cf]'}`}>
        <p class="text-3xl font-bold text-[#26382e]">{contar(tarjeta.estado)}</p>
        <p class="mt-1 text-sm text-[#69736c]">{tarjeta.texto}</p>
      </button>
    {/each}
  </div>

  {#if error}
    <div role="alert" class="mb-6 rounded-xl border border-[#e5b8b4] bg-[#fbe8e6] p-4 text-sm text-[#7d3732]">{error}
      <button type="button" onclick={cargar} class="ml-3 underline">Reintentar</button>
    </div>
  {/if}

  {#if cargando}
    <p class="py-10 text-center text-[#68746c]">Cargando eventos...</p>
  {:else if !error}
    {#if resumen}
      <div class="mb-4 flex justify-between gap-4">
        <h2 class="text-xl font-bold text-[#26382e]">Últimos eventos</h2>
        <a href="/organizador/eventos" class="text-sm font-medium text-[#75514e] hover:underline">Ver todos</a>
      </div>
    {/if}
    {#if visibles.length === 0}
      <div class="rounded-2xl border border-[#ded8cf] bg-white p-10 text-center text-[#68746c]">
        {eventos.length === 0 ? 'Todavía no creaste eventos. Usá el botón «Crear nuevo evento».' : 'No hay eventos con este estado.'}
      </div>
    {:else}
      <div class="overflow-x-auto rounded-2xl border border-[#ded8cf] bg-white shadow-sm">
        <table class="w-full min-w-[650px] text-left">
          <thead class="border-b border-[#e7e2da] bg-[#faf9f6]">
            <tr>
              <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Evento</th>
              <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Fecha</th>
              <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Estado</th>
              <th class="px-6 py-4 text-sm font-semibold text-[#36463c]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each visibles as evento (evento.id)}
              <tr class="border-b border-[#eeeae4] last:border-0">
                <td class="px-6 py-5 text-sm font-semibold text-[#303c34]">{evento.titulo}
                  <p class="mt-1 text-xs font-normal text-[#7a857e]">{evento.categoria.nombre}</p>
                </td>
                <td class="px-6 py-5 text-sm text-[#647067]">{fechaEvento(evento.inicio)}</td>
                <td class="px-6 py-5"><span class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoColor(evento.estado)}`}>{estadoTexto[evento.estado]}</span></td>
                <td class="px-6 py-5">
                  <div class="flex gap-4">
                    <a href={`/organizador/eventos/${evento.id}`} class="text-sm font-medium text-[#52675a] hover:underline">Ver</a>
                    {#if evento.estado === 'BORRADOR' || evento.estado === 'RECHAZADO'}
                      <a href={`/organizador/eventos/${evento.id}/editar`} class="text-sm font-medium text-[#75514e] hover:underline">Editar</a>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}

  <div class="mt-6 rounded-xl border border-[#ead79c] bg-[#fff8e5] px-5 py-4">
    <p class="text-sm text-[#67582d]">Los eventos enviados quedan pendientes hasta que un administrador los apruebe.</p>
  </div>
</section>
