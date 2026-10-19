<script lang="ts">
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
    import Galeria from '$lib/components/turista/Galeria.svelte';
    import { rangoEvento, diaUruguay } from '$lib/types/agenda';
    import '$lib/components/turista/turista.css';
    let { data } = $props();
    const evento = $derived(data.evento);
    const mapa = $derived(evento.latitud !== null && evento.longitud !== null ? `${evento.latitud},${evento.longitud}` : evento.lugar_evento);
</script>
<svelte:head><title>{evento.titulo} · Cerro Largo 360</title></svelte:head>
<div class="t-public"><Navbar solid /><main style="max-width:1000px;margin:auto;padding:130px 24px 64px">
    <a class="t-link" href={`/eventos?mes=${diaUruguay(evento.inicio).slice(0,7)}`}>← Ver en el calendario</a>
    <span class="t-eyebrow">AGENDA DE CERRO LARGO</span><h1 class="t-title">{evento.titulo}</h1><p class="t-intro">{rangoEvento(evento)}</p>
    <Galeria recursos={evento.recursos} nombre={evento.titulo} />
    <section class="t-panel"><h2>Información del evento</h2><p class="t-description" style="white-space:pre-line">{evento.descripcion}</p>
    <dl class="t-details"><div><dt>Lugar</dt><dd>{evento.lugar_evento || 'A confirmar'}</dd></div><div><dt>Entrada</dt><dd>{evento.es_gratuito ? 'Gratuita' : evento.precio !== null ? `$ ${evento.precio}` : 'Precio a confirmar'}</dd></div>{#if evento.contacto}<div><dt>Contacto</dt><dd>{evento.contacto}</dd></div>{/if}</dl>
    {#if mapa}<a class="t-button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapa)}`} target="_blank" rel="noopener noreferrer">{evento.latitud !== null ? 'Ver ubicación en mapa ↗' : 'Buscar esta dirección en el mapa ↗'}</a>{/if}
    </section>
</main><HomeFooter /></div>
