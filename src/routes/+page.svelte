<script lang="ts">
    import type { PageData } from './$types';
    import HomeCategorias from '$lib/components/inicio/HomeCategorias.svelte';
    import HomeDescubre from '$lib/components/inicio/HomeDescubre.svelte';
    import HomeFooter from '$lib/components/inicio/HomeFooter.svelte';
    import HomeHero from '$lib/components/inicio/HomeHero.svelte';
    import HomeHorarios from '$lib/components/inicio/HomeHorarios.svelte';
    import HomeProximosEventos from '$lib/components/inicio/HomeProximosEventos.svelte';
    import HomeRecomendados from '$lib/components/inicio/HomeRecomendados.svelte';
    import HomeViaje from '$lib/components/inicio/HomeViaje.svelte';
    import HomeSeo from '$lib/components/inicio/HomeSeo.svelte';
    import Navbar from '$lib/components/shared/Navbar.svelte';
    let { data }: { data: PageData } = $props();
</script>

<HomeSeo />

<Navbar />

<main class="flex min-h-dvh w-full flex-col">
    <HomeHero />
    <HomeCategorias />
    <HomeDescubre registros={data.localidades} />
    <HomeProximosEventos eventos={data.eventosProximos} error={data.errorEventos} />
    <HomeHorarios horarios={data.horarios} error={data.errorHorarios} />
    <HomeViaje />
    <HomeRecomendados />
</main>

<HomeFooter />
