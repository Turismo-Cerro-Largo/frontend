<script lang="ts">
    import './layout.css';
    import RadioFlotante from '$lib/components/shared/RadioFlotante.svelte';

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" type="image/png" sizes="48x48" href="/SEO/favicon-48.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

<RadioFlotante>
    {@render children()}
</RadioFlotante>
