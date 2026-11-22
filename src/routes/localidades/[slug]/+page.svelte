<script lang="ts">
    import Navbar from '#lib/components/shared/Navbar.svelte';
    import HomeFooter from '#lib/components/inicio/HomeFooter.svelte';
    import LugarCard from '#lib/components/turista/LugarCard.svelte';
    import '#lib/components/turista/turista.css';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    const descripcion = $derived(data.localidad.descripcion?.trim() ||
        `Explorá los lugares para visitar en ${data.localidad.nombre}, Cerro Largo, Uruguay.`);
</script>

<svelte:head>
    <title>Qué visitar en {data.localidad.nombre}, Cerro Largo | Cerro Largo 360</title>
    <meta name="description" content={descripcion} />
    <link rel="canonical" href={data.canonical} />
</svelte:head>

<div class="t-public">
    <Navbar solid />
    <main style="max-width:1200px;margin:auto;padding:130px 24px 64px">
        <a class="t-link" href="/localidades">← Todas las localidades</a>
        <h1 class="t-title">Qué visitar en {data.localidad.nombre}</h1>
        <p class="t-intro">{descripcion}</p>
        {#if data.lugares.length}
            <div class="t-grid">
                {#each data.lugares as lugar, indice (lugar.id)}
                    <LugarCard {lugar} prioritaria={indice === 0} />
                {/each}
            </div>
        {:else}
            <p class="t-empty">Todavía no hay lugares publicados en esta localidad.</p>
        {/if}
        {#if data.total > data.porPagina}
            <nav class="t-pagination" aria-label="Páginas de lugares">
                {#if data.pagina > 1}
                    <a class="t-button secondary" href={data.pagina === 2 ? new URL(data.canonical).pathname : `?pagina=${data.pagina - 1}`}>Anterior</a>
                {/if}
                <span>Página {data.pagina}</span>
                {#if data.pagina * data.porPagina < data.total}
                    <a class="t-button secondary" href={`?pagina=${data.pagina + 1}`}>Siguiente</a>
                {/if}
            </nav>
        {/if}
    </main>
    <HomeFooter />
</div>
