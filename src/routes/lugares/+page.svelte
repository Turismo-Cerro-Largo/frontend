<script lang="ts">
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
    import '$lib/components/turista/turista.css';
    import LugarCard from '$lib/components/turista/LugarCard.svelte';
    import Icono from '$lib/components/turista/Icono.svelte';
    let { data } = $props();
</script>

<svelte:head><title>Explorar lugares · Cerro Largo 360</title></svelte:head>
<div class="t-public">
    <Navbar solid />
    <main style="max-width:1200px;margin:auto;padding:130px 24px 64px">
        <span class="t-eyebrow">ENCONTRÁ TU PRÓXIMO DESTINO</span>
        <h1 class="t-title">{data.localidad ? `Lugares en ${data.localidad}` : "Explorar lugares"}</h1>
        <p class="t-intro">Buscá por nombre o localidad. Abrí un lugar para guardarlo o compartir tu experiencia.</p>
        <form class="t-search" method="GET">
            {#if data.localidad}<input type="hidden" name="localidad" value={data.localidad} />{/if}
            <label class="sr-only" for="buscar">Nombre o localidad</label><input
                id="buscar"
                name="buscar"
                value={data.buscar}
                maxlength="100"
                placeholder="Por ejemplo: Melo, museo, parque…"
            /><button class="t-button" type="submit">Buscar</button>
        </form>
        <div class="t-actions"><a class="t-link" href="/localidades">Elegir localidad</a>{#if data.localidad || data.buscar}<a class="t-link" href="/lugares">Quitar filtros</a>{/if}<a class="t-link" href="/eventos">Buscar eventos →</a></div>
        <p class="t-date" style="margin-bottom:20px">{data.total} {data.total === 1 ? 'lugar disponible' : 'lugares disponibles'}</p>
        {#if data.lugares.length}<div class="t-grid">
                {#each data.lugares as lugar (lugar.id)}<LugarCard {lugar} />{/each}
            </div>{:else}<div class="t-empty">
                <Icono nombre="explorar" size={36} />
                <h2>{data.buscar ? 'No encontramos lugares con esa búsqueda' : 'Pronto habrá lugares para explorar'}</h2>
                <p>{data.buscar ? 'Probá con otro nombre o localidad.' : 'Los lugares publicados por el equipo aparecerán acá.'}</p>
                {#if data.buscar}<a class="t-button secondary" href="/lugares">Ver todos</a>{/if}
            </div>{/if}
        {#if data.total > data.porPagina}<nav class="t-pagination" aria-label="Páginas de lugares">
                {#if data.pagina > 1}<a class="t-button secondary" href={`?buscar=${encodeURIComponent(data.buscar)}&localidad=${encodeURIComponent(data.localidad)}&pagina=${data.pagina - 1}`}>Anterior</a>{/if}<span
                    >Página {data.pagina}</span
                >{#if data.pagina * data.porPagina < data.total}<a class="t-button secondary" href={`?buscar=${encodeURIComponent(data.buscar)}&localidad=${encodeURIComponent(data.localidad)}&pagina=${data.pagina + 1}`}
                        >Siguiente</a
                    >{/if}
            </nav>{/if}
    </main>
    <HomeFooter />
</div>
