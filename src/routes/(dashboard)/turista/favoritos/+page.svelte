<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { enviar } from '$lib/turista/api';
  import LugarCard from '$lib/components/turista/LugarCard.svelte';
  import Icono from '$lib/components/turista/Icono.svelte';
  let { data } = $props();
  let ocupado = $state<number | null>(null);
  let mensaje = $state('');
  async function quitar(id: number) {
    ocupado = id; mensaje = '';
    try { await enviar(`favoritos/${id}`, 'DELETE'); await invalidateAll(); }
    catch (e) { mensaje = (e as Error).message; } finally { ocupado = null; }
  }
</script>
<svelte:head><title>Mis favoritos · Cerro Largo 360</title></svelte:head>
<span class="t-eyebrow">LUGARES PARA VOLVER</span><h1 class="t-title">Mis favoritos</h1><p class="t-intro">Tu lista personal de lugares de Cerro Largo. Podés agregar o quitar lugares cuando quieras.</p>
{#if mensaje}<p class="t-message error" role="alert">{mensaje}</p>{/if}
{#if data.favoritos.length}<div class="t-grid">{#each data.favoritos as favorito (favorito.id_ubicacion)}<div style="display:flex;flex-direction:column;gap:12px">{#if favorito.lugar}<LugarCard lugar={favorito.lugar} />{:else}<div class="t-panel"><h2>Lugar no disponible</h2><p>Este lugar ya no está publicado. Podés retirarlo de tu lista.</p></div>{/if}<button class="t-button secondary" disabled={ocupado !== null} onclick={() => quitar(favorito.id_ubicacion)}>{ocupado === favorito.id_ubicacion ? 'Quitando…' : 'Quitar de favoritos'}</button></div>{/each}</div>{:else}<div class="t-empty"><Icono nombre="favoritos" size={38} /><h2>Tu próxima aventura está por empezar</h2><p>Guardá los lugares que te gustan y encontralos todos acá.</p><a class="t-button" href="/lugares">Explorar lugares</a></div>{/if}
