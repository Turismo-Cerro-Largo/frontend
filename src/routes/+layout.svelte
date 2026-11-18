<script lang="ts">
    import './layout.css';
    import RadioFlotante from '$lib/components/shared/RadioFlotante.svelte';
    import { page } from '$app/state';
    import { beforeNavigate } from '$app/navigation';
    import { actualizarAnalitica } from '$lib/analitica';

    let { children } = $props();
    beforeNavigate(() => actualizarAnalitica(undefined, ''));
    $effect(() => actualizarAnalitica(page.data.cuenta?.rol, page.url.pathname));
</script>

<svelte:head>
    <link rel="icon" type="image/png" sizes="48x48" href="/SEO/favicon-48.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

<RadioFlotante>
    {@render children()}
</RadioFlotante>
