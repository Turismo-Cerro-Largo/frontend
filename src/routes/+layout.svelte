<script lang="ts">
    import './layout.css';
    import RadioFlotante from '$lib/components/shared/RadioFlotante.svelte';
    import favicon from '$lib/assets/favicon.svg';

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<RadioFlotante>
    {@render children()}
</RadioFlotante>
