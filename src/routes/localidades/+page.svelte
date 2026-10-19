<script>
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
    import { localidades } from '$lib/localidades';
    import '$lib/components/turista/turista.css';
</script>
<svelte:head><title>Localidades · Cerro Largo 360</title></svelte:head>
<div class="t-public"><Navbar solid /><main style="max-width:1100px;margin:auto;padding:130px 24px 64px">
<a class="t-link" href="/">← Inicio</a><h1 class="t-title">Recorré Cerro Largo</h1><p class="t-intro">Elegí una localidad para conocer sus lugares publicados.</p>
<div class="t-grid">{#each localidades as [slug,nombre]}<a class="t-panel t-link" href={`/localidades/${slug}`}>{nombre} →</a>{/each}</div>
</main><HomeFooter /></div>
