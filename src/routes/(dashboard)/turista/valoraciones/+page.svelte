<script lang="ts">
  import EliminarValoracion from '$lib/components/turista/EliminarValoracion.svelte';
  import Icono from '$lib/components/turista/Icono.svelte';
  import { estados } from '$lib/turista/types';
  let { data } = $props();
</script>
<svelte:head><title>Mis valoraciones · Cerro Largo 360</title></svelte:head>
<span class="t-eyebrow">TUS EXPERIENCIAS CUENTAN</span><h1 class="t-title">Mis valoraciones</h1><p class="t-intro">Consultá tus estrellas, comentarios y su estado. Las valoraciones pendientes no se muestran públicamente hasta su aprobación.</p>
{#if data.valoraciones.length}<div class="t-list">{#each data.valoraciones as valoracion (valoracion.id)}<article class="t-review"><div class="t-review-head"><h2>{#if valoracion.ubicacion}<a href={`/lugares/${valoracion.ubicacion.id}`}>{valoracion.ubicacion.nombre}</a>{:else}Lugar no disponible{/if}</h2><span class="t-badge" class:published={valoracion.estado === 'PUBLICADO'}>{estados[valoracion.estado]}</span></div><div class="t-stars" aria-label={`${valoracion.calificacion} de 5 estrellas`}>{'★'.repeat(valoracion.calificacion)}{'☆'.repeat(5 - valoracion.calificacion)}</div>{#if valoracion.texto}<p>{valoracion.texto}</p>{/if}<time class="t-date" datetime={valoracion.creado_en}>{new Date(valoracion.creado_en).toLocaleDateString('es-UY', { timeZone: 'UTC' })}</time>{#if valoracion.estado === 'PENDIENTE_REVISION'}<EliminarValoracion id={valoracion.id} />{/if}</article>{/each}</div>{:else}<div class="t-empty"><Icono nombre="valoraciones" size={38} /><h2>Compartí tu primera experiencia</h2><p>Buscá un lugar que hayas visitado y valoralo de 1 a 5 estrellas. También podés escribir un comentario.</p><a class="t-button" href="/lugares">Buscar un lugar</a></div>{/if}
