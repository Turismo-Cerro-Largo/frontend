<script lang="ts">
    import HomeCategorias from '$lib/components/Home/HomeCategorias.svelte';
    import HomeHero from '$lib/components/Home/HomeHero.svelte';
    import HomeProximosEventos from '$lib/components/Home/HomeProximosEventos.svelte';
    import HomeRecomendados from '$lib/components/Home/HomeRecomendados.svelte';
    import Navbar from '$lib/components/Shared/Navbar.svelte';
</script>

<svelte:head>
    <title>CerroLargo360</title>
</svelte:head>

<Navbar />
<HomeHero />
<HomeCategorias />
<HomeProximosEventos />
<HomeRecomendados />
