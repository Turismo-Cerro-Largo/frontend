<script lang="ts">
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
    import EventoCard from '$lib/components/turista/EventoCard.svelte';
    import { diaUruguay } from '$lib/types/agenda';
    import '$lib/components/turista/turista.css';
    let { data } = $props();
    const inicio = $derived(new Date(`${data.mes}-01T12:00:00Z`));
    const vacios = $derived((inicio.getUTCDay()+6)%7);
    const cantidad = $derived(new Date(Date.UTC(inicio.getUTCFullYear(),inicio.getUTCMonth()+1,0)).getUTCDate());
    const tituloMes = $derived(inicio.toLocaleDateString('es-UY',{month:'long',year:'numeric',timeZone:'UTC'}));
    function mover(delta:number) { return `/eventos?mes=${new Date(Date.UTC(inicio.getUTCFullYear(),inicio.getUTCMonth()+delta,1)).toISOString().slice(0,7)}`; }
    function enDia(dia:string) { return data.calendario.filter(e=>diaUruguay(e.inicio)<=dia && diaUruguay(e.fin || e.inicio)>=dia); }
    function paginar(p:number) { return `?${new URLSearchParams({mes:data.mes,desde:data.desde,hasta:data.hasta,buscar:data.buscar,pagina:String(p)})}`; }
</script>
<svelte:head><title>Calendario de eventos · Cerro Largo 360</title></svelte:head>
<div class="t-public"><Navbar solid />
<main class="agenda">
    <a class="t-link" href="/">← Inicio</a><span class="t-eyebrow">PLANIFICÁ TU VISITA</span><h1 class="t-title">Calendario de eventos</h1>
    <p class="t-intro">Descubrí qué hay durante tu viaje. Las fechas se muestran en horario de Uruguay.</p>
    <form method="GET" class="filtros">
        <input type="hidden" name="mes" value={data.mes} />
        <label>Desde<input type="date" name="desde" value={data.desde} /></label>
        <label>Hasta<input type="date" name="hasta" value={data.hasta} /></label>
        <label>Nombre o lugar<input name="buscar" maxlength="100" value={data.buscar} placeholder="Melo, motos…" /></label>
        <button class="t-button">Buscar eventos</button><a class="t-link" href="/eventos">Limpiar</a>
    </form>
    <div class="columnas">
        <section class="calendario" aria-label="Calendario mensual">
            <nav class="mes" aria-label="Mes del calendario"><a href={mover(-1)} aria-label="Mes anterior">←</a><h2>{tituloMes}</h2><a href={mover(1)} aria-label="Mes siguiente">→</a></nav>
            <div class="dias">
                {#each ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'] as dia}<span class="semana">{dia}</span>{/each}
                {#each Array(vacios) as _}<span></span>{/each}
                {#each Array(cantidad) as _, i}
                    {@const dia = `${data.mes}-${String(i+1).padStart(2,'0')}`}{@const eventos = enDia(dia)}
                    <a class:conEvento={eventos.length > 0} class:hoy={dia===data.hoy} class:elegido={dia===data.desde && (!data.hasta || data.hasta===dia)} href={`?mes=${data.mes}&desde=${dia}&hasta=${dia}`} aria-label={`${dia}: ${eventos.length} eventos`} title={eventos.map(e=>e.titulo).join(', ')}>{i+1}{#if eventos.length}<small>{eventos.length}</small>{/if}</a>
                {/each}
            </div><p class="leyenda">Los días verdes tienen eventos. Elegí un día para verlos.</p>
            {#if data.truncado}<p>Agenda extensa: se muestran los primeros 1000 eventos del mes. Usá el buscador para afinar.</p>{/if}
            <a class="t-link" href="/eventos/carnaval-melo-2026">Carnaval de Melo: fecha pendiente →</a>
        </section>
        <section aria-label="Resultados de eventos">
            <h2 class="resultados">{data.desde ? 'Eventos durante las fechas elegidas' : 'Eventos del mes'}</h2>
            {#if data.eventos.length}<div class="tarjetas">{#each data.eventos as evento (evento.id)}<EventoCard {evento} />{/each}</div>
            {:else}<div class="t-empty"><h3>No hay eventos publicados para esta búsqueda</h3><p>Probá otro mes o cambiá las fechas.</p></div>{/if}
            <nav class="t-pagination" aria-label="Páginas de eventos">{#if data.pagina>1}<a class="t-link" href={paginar(data.pagina-1)}>Anterior</a>{/if}{#if data.eventos.length===12}<a class="t-link" href={paginar(data.pagina+1)}>Más eventos →</a>{/if}</nav>
        </section>
    </div>
</main><HomeFooter /></div>
<style>
.agenda{max-width:1300px;margin:auto;padding:130px 24px 64px}.filtros{display:flex;flex-wrap:wrap;align-items:end;gap:16px;margin:28px 0 36px}.filtros label{display:grid;gap:7px;font-size:13px}.filtros input{border:1px solid #cedacf;border-radius:8px;padding:11px;background:white;min-width:0}.columnas{display:grid;grid-template-columns:370px 1fr;gap:32px}.calendario{align-self:start;padding:22px;background:white;border:1px solid #dde6dd;border-radius:18px}.mes{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.mes h2{text-transform:capitalize;font-size:18px;font-weight:600}.mes a{padding:8px}.dias{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.dias>a{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:46px;border-radius:8px;font-size:14px}.dias>a:hover{outline:2px solid #477967}.semana{text-align:center;font-size:12px;color:#657369;margin-bottom:8px}.conEvento{background:#e3eee3;color:#285c43;font-weight:600}.dias .elegido{background:#2f6d50;color:white}.hoy{border:1px solid #477967}small{font-size:9px}.leyenda{font-size:12px;color:#63756a;margin:20px 0}.tarjetas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.resultados{font-size:20px;font-weight:600;margin-bottom:20px}@media(max-width:950px){.columnas{grid-template-columns:1fr}.calendario{max-width:480px;width:100%}}@media(max-width:600px){.tarjetas{grid-template-columns:1fr}.agenda{padding:110px 18px 48px}}
</style>
