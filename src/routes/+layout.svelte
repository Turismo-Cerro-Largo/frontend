<script lang="ts">
    import './layout.css';
    import RadioFlotante from '#lib/components/shared/RadioFlotante.svelte';
    import { page } from '$app/state';
    import { onNavigate } from '$app/navigation';
    import { actualizarAnalitica, pausarAnalitica } from '#lib/analitica.ts';
    import { registrarVisita } from '#lib/visitas.ts';

    let { children } = $props();
    onNavigate(() => { pausarAnalitica(); });
    $effect(() => {
        registrarVisita(page.url.pathname, page.data.cuenta);
        void actualizarAnalitica(page.data.cuenta?.rol, page.url.pathname).catch(() => undefined);
    });
</script>

<svelte:head>
    <link rel="icon" type="image/png" sizes="48x48" href="/SEO/favicon-48.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

<RadioFlotante>
    {@render children()}
</RadioFlotante>
