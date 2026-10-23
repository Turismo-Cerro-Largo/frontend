<script>
    import { page } from '$app/state';
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/inicio/HomeFooter.svelte';
</script>
<Navbar solid /><main style="max-width:900px;margin:auto;padding:140px 24px 80px"><h1 style="font-size:28px;font-weight:600">No pudimos mostrar esta consulta</h1><p style="margin:20px 0">{page.error?.message}</p><a href="/eventos" style="color:#356b53;text-decoration:underline">Volver al calendario</a></main><HomeFooter />
