<script lang="ts">
  import HomeHero from "$lib/components/Home/HomeHero.svelte";
  import Navbar from "$lib/components/Shared/Navbar.svelte";
  import SvgCerroLargo from "$lib/components/svg/SvgCerroLargo.svelte";
</script>

<svelte:head>
  <title>CerroLargo360</title>
</svelte:head>

<Navbar />

<HomeHero />

<section class="w-full max-w-7xl flex flex-col-reverse md:flex-row">
  <article class="w-full md:w-2/5">
    <div></div>
  </article>
  <article class="md:w-3/5">
    <SvgCerroLargo />
  </article>
</section>
