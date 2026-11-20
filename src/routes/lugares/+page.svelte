<script lang="ts">
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/inicio/HomeFooter.svelte';
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
        <form class="destinos-filtros" method="GET">
            <div class="destinos-localidad">
                <label for="localidad">Elegí una localidad</label>
                <div class="destinos-select">
                    <span aria-hidden="true" class="destinos-pin">⌖</span>
                    <select id="localidad" name="localidad" value={data.localidad} onchange={(event) => event.currentTarget.form?.requestSubmit()}>
                        <option value="">Todas las localidades</option>
                        {#each data.localidades as localidad}
                            <option value={localidad.nombre}>{localidad.nombre}</option>
                        {/each}
                    </select>
                    <span aria-hidden="true" class="destinos-chevron">⌄</span>
                </div>
            </div>
            <div class="destinos-buscar">
                <label for="buscar">Buscar por nombre</label>
                <input
                    id="buscar"
                    name="buscar"
                    value={data.buscar}
                    maxlength="100"
                    placeholder="Por ejemplo: museo, parque…"
                />
            </div>
            <button class="t-button" type="submit">Buscar destinos</button>
        </form>
        <div class="t-actions"><a class="t-link" href="/localidades">Ver todas las localidades</a>{#if data.localidad || data.buscar}<a class="t-link" href="/lugares">Quitar filtros</a>{/if}<a class="t-link" href="/eventos">Buscar eventos →</a></div>
        <p class="t-date" style="margin-bottom:20px">{data.total} {data.total === 1 ? 'lugar disponible' : 'lugares disponibles'}</p>
        {#if data.lugares.length}<div class="t-grid">
                {#each data.lugares as lugar (lugar.id)}<LugarCard {lugar} />{/each}
            </div>{:else}<div class="t-empty">
                <Icono nombre="explorar" size={36} />
                <h2>{data.buscar ? 'No encontramos lugares con esa búsqueda' : data.localidad ? 'Todavía no hay lugares publicados en esta localidad' : 'Pronto habrá lugares para explorar'}</h2>
                <p>{data.buscar || data.localidad ? 'Probá otra búsqueda o elegí una localidad diferente.' : 'Los lugares publicados por el equipo aparecerán acá.'}</p>
                {#if data.buscar || data.localidad}<a class="t-button secondary" href="/lugares">Ver todos</a>{/if}
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

<style>
    .destinos-filtros {
        display: grid;
        grid-template-columns: minmax(230px, 1fr) minmax(240px, 1.2fr) auto;
        align-items: end;
        gap: 16px;
        margin: 28px 0 16px;
        padding: 20px;
        border: 1px solid #cadccf;
        border-radius: 18px;
        background: linear-gradient(135deg, #e7f0e8, #f8faf5);
        box-shadow: 0 12px 32px #233c350d;
    }
    .destinos-localidad, .destinos-buscar { display: grid; gap: 8px; min-width: 0; }
    .destinos-localidad label, .destinos-buscar label { color: #285544; font-size: 12px; font-weight: 700; }
    .destinos-select { position: relative; display: flex; align-items: center; }
    .destinos-select select, .destinos-buscar input {
        width: 100%;
        min-height: 48px;
        border: 1px solid #b7cebd;
        border-radius: 11px;
        background: white;
        color: #233c35;
        font: inherit;
        font-size: 14px;
    }
    .destinos-select select { appearance: none; padding: 10px 36px 10px 42px; cursor: pointer; font-weight: 600; }
    .destinos-buscar input { padding: 10px 14px; }
    .destinos-pin, .destinos-chevron { position: absolute; pointer-events: none; color: #2f6d50; font-size: 22px; line-height: 1; }
    .destinos-pin { left: 14px; }
    .destinos-chevron { right: 14px; }
    .destinos-filtros .t-button { min-height: 48px; border-radius: 11px; }
    @media (max-width: 760px) {
        .destinos-filtros { grid-template-columns: 1fr; }
        .destinos-filtros .t-button { width: 100%; }
    }
</style>