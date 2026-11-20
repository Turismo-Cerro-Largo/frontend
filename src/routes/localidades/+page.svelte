<script lang="ts">
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/inicio/HomeFooter.svelte';
    import type { PageData } from './$types';
    import '$lib/components/turista/turista.css';
    let { data }: { data: PageData } = $props();
</script>
<svelte:head><title>Localidades · Cerro Largo 360</title></svelte:head>
<div class="t-public"><Navbar solid /><main style="max-width:1100px;margin:auto;padding:130px 24px 64px">
<a class="t-link" href="/">← Inicio</a><h1 class="t-title">Recorré Cerro Largo</h1><p class="t-intro">Elegí una localidad para conocer sus lugares publicados.</p>
{#if data.localidades.length}
    <div class="t-grid">
        {#each data.localidades as localidad (localidad.id)}
            <a class="t-panel localidad-card" href={'/localidades/' + localidad.slug}>
                {#if localidad.icono}<img src={localidad.icono} alt="" class="localidad-icono" />{:else}<span class="localidad-icono localidad-placeholder" aria-hidden="true">⌖</span>{/if}
                <strong>{localidad.nombre}</strong><span aria-hidden="true">→</span>
            </a>
        {/each}
    </div>
{:else}<p>No hay localidades visibles por ahora.</p>{/if}
</main><HomeFooter /></div>
<style>
    .localidad-card { display:flex;align-items:center;gap:14px;color:#245c4e;transition:transform .2s,box-shadow .2s; }
    .localidad-card:hover { transform:translateY(-3px);box-shadow:0 12px 28px #233c351c; }
    .localidad-card strong { flex:1; }
    .localidad-icono { width:48px;height:48px;flex:none;object-fit:cover;border-radius:12px; }
    .localidad-placeholder { display:grid;place-items:center;background:#e7f0e8;font-size:28px; }
</style>