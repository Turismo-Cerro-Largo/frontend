<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import EventoFormulario from '$lib/components/organizador/EventoFormulario.svelte';
  import { obtenerEvento } from '$lib/organizador/eventos';
  import type { Evento } from '$lib/types/evento';

  let evento = $state<Evento | null>(null);
  let error = $state('');
  let cargando = $state(true);

  onMount(() => {
    void (async () => {
      try {
        const id = Number(page.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new Error('Identificador inválido.');
        const encontrado = await obtenerEvento(id);
        if (encontrado.estado !== 'BORRADOR' && encontrado.estado !== 'RECHAZADO') {
          throw new Error('Solo se pueden editar los borradores y los eventos rechazados.');
        }
        evento = encontrado;
      } catch (e) { error = e instanceof Error ? e.message : 'No fue posible cargar el evento.'; }
      finally { cargando = false; }
    })();
  });
</script>

{#if cargando}
  <p class="p-10 text-[#68746c]">Cargando formulario...</p>
{:else if error}
  <div class="m-8 rounded-xl border border-[#e5b8b4] bg-[#fbe8e6] p-5 text-[#7d3732]">{error}
    <a href="/organizador/eventos" class="ml-2 underline">Volver</a>
  </div>
{:else if evento}
  <EventoFormulario {evento} />
{/if}
