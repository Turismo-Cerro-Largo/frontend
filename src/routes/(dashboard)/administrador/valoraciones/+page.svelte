<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { estados } from '$lib/turista/valoraciones';
  import '$lib/components/turista/turista.css';
  let { data } = $props();
  let ocupado = $state<number | null>(null);
  let mensaje = $state('');
  async function decidir(id: number, estado: string) {
    ocupado = id; mensaje = '';
    try {
      const res = await fetch(`/api/moderacion-valoraciones/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ estado }) });
      if (!res.ok) throw new Error('No se pudo guardar la decisión. Revisá tu sesión e intentá nuevamente.');
      await invalidateAll();
    } catch (e) { mensaje = (e as Error).message; } finally { ocupado = null; }
  }
</script>
<svelte:head><title>Moderar valoraciones · Cerro Largo 360</title></svelte:head>
<div class="t-public"><main class="t-public-inner"><header><a href="/" class="t-brand">Cerro Largo 360</a><a class="t-link" href="/administrador">Panel administrador →</a></header><span class="t-eyebrow">ADMINISTRACIÓN</span><h1 class="t-title">Valoraciones de turistas</h1><p class="t-intro">Revisá las experiencias antes de publicarlas. Solo las publicadas aparecen en las fichas y en su calificación promedio.</p><nav class="t-actions" aria-label="Estado de moderación">{#each Object.entries(estados) as [valor, texto]}<a href={`?estado=${valor}`} class="t-button" class:secondary={data.estado !== valor} aria-current={data.estado === valor ? 'page' : undefined}>{texto}</a>{/each}</nav>
{#if mensaje}<p class="t-message error" role="alert">{mensaje}</p>{/if}<p class="t-date" style="margin:24px 0">{data.total} valoraciones en este estado</p><div class="t-list">{#each data.valoraciones as v (v.id)}<article class="t-review"><div class="t-review-head"><h2>{v.ubicacion.nombre}</h2><span>{v.usuario.nombres}</span></div><span class="t-stars" aria-label={`${v.calificacion} de 5 estrellas`}>{'★'.repeat(v.calificacion)}{'☆'.repeat(5-v.calificacion)}</span><p>{v.texto || 'Valoración sin comentario.'}</p><div class="t-actions">{#if v.estado !== 'PUBLICADO'}<button class="t-button" disabled={ocupado !== null} onclick={() => decidir(v.id, 'PUBLICADO')}>{ocupado === v.id ? 'Guardando…' : 'Aprobar y publicar'}</button>{/if}{#if v.estado !== 'OCULTADO'}<button class="t-button secondary" disabled={ocupado !== null} onclick={() => decidir(v.id, 'OCULTADO')}>No publicar / ocultar</button>{/if}</div></article>{:else}<div class="t-empty"><h2>No hay valoraciones en este estado</h2><p>Las nuevas experiencias enviadas por turistas aparecerán en pendientes.</p></div>{/each}</div>
{#if data.total > data.porPagina}<nav class="t-pagination" aria-label="Páginas">{#if data.pagina > 1}<a href={`?estado=${data.estado}&pagina=${data.pagina - 1}`}>Anterior</a>{/if}<span>Página {data.pagina}</span>{#if data.pagina * data.porPagina < data.total}<a href={`?estado=${data.estado}&pagina=${data.pagina + 1}`}>Siguiente</a>{/if}</nav>{/if}
</main></div>
