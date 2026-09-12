<script>
    import HomeCategorias from '$lib/components/Home/HomeCategorias.svelte';
    import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
    import HomeHero from '$lib/components/Home/HomeHero.svelte';
    import HomeLocalidades from '$lib/components/Home/HomeLocalidades.svelte';
    import HomeProximosEventos from '$lib/components/Home/HomeProximosEventos.svelte';
    import HomeRecomendados from '$lib/components/Home/HomeRecomendados.svelte';
    import HomeViaje from '$lib/components/Home/HomeViaje.svelte';
    import Navbar from '$lib/components/shared/Navbar.svelte';
</script>

<svelte:head>
    <title>CerroLargo360</title>
</svelte:head>

<Navbar />

<main class="flex min-h-dvh w-full flex-col">
    <HomeHero />
    <HomeCategorias />
    <HomeLocalidades />
    <HomeProximosEventos />
    <HomeViaje />
    <HomeRecomendados />
</main>

<HomeFooter />
