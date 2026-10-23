<script lang="ts">
  import Navbar from '$lib/components/shared/Navbar.svelte';
  import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
  import '$lib/components/turista/turista.css';
  let { children } = $props();
</script>
<div class="t-public">
  <Navbar solid />
  <main id="contenido" style="max-width:1200px;margin:auto;padding:130px 24px 64px;min-height:75vh">
    <a class="t-link" href="/" style="margin-bottom:24px;display:inline-block">← Volver al inicio</a>
    {@render children()}
  </main>
  <HomeFooter />
</div>
