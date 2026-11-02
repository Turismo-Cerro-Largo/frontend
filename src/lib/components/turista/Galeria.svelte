<script lang="ts">
    import type { Medio } from '$lib/types/agenda';
    let { recursos, nombre }: { recursos: Medio[]; nombre: string } = $props();
</script>
{#if recursos.length}
<section aria-label={`Fotos y videos de ${nombre}`} class="galeria">
    {#each recursos as recurso (recurso.id)}
        <figure>
            {#if recurso.tipo === 'IMAGEN'}
                <a href={`/api/recursos/${recurso.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar imagen de ${nombre}`}><img src={`/api/recursos/${recurso.id}`} alt={recurso.descripcion || nombre} loading="lazy" /></a>
            {:else}
                <video controls muted playsinline preload="none" poster={recursos.find(r => r.tipo === "IMAGEN") ? `/api/recursos/${recursos.find(r => r.tipo === "IMAGEN")?.id}` : undefined} aria-label={recurso.descripcion || `Video de ${nombre}`} src={`/api/recursos/${recurso.id}`}>
                    Tu navegador no permite reproducir este video.
                </video>
            {/if}
            {#if recurso.descripcion}<figcaption>{recurso.descripcion}</figcaption>{/if}
        </figure>
    {/each}
</section>
{/if}
<style>
    .galeria { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:20px;margin:24px 0 32px; }
    figure { margin:0;overflow:hidden;border:1px solid #dfe6df;border-radius:16px;background:white; }
    img, video { width:100%;height:300px;object-fit:contain;background:#edf1eb; }
    figcaption { padding:12px 16px;font-size:12px;color:#59685f; }
</style>
