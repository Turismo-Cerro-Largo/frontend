<script lang="ts">
    import SeoPagina from '#lib/components/shared/SeoPagina.svelte';
    import Navbar from '#lib/components/shared/Navbar.svelte';
    import HomeFooter from '#lib/components/inicio/HomeFooter.svelte';
    import EventoCard from '#lib/components/turista/EventoCard.svelte';
    import { diaUruguay } from '#lib/utils/agenda.ts';
    import '#lib/components/turista/turista.css';
    let { data } = $props();
    const inicio = $derived(new Date(`${data.mes}-01T12:00:00Z`));
    const vacios = $derived((inicio.getUTCDay()+6)%7);
    const cantidad = $derived(new Date(Date.UTC(inicio.getUTCFullYear(),inicio.getUTCMonth()+1,0)).getUTCDate());
    const tituloMes = $derived(inicio.toLocaleDateString('es-UY',{month:'long',year:'numeric',timeZone:'UTC'}));
    function mover(delta:number) { return `/eventos?mes=${new Date(Date.UTC(inicio.getUTCFullYear(),inicio.getUTCMonth()+delta,1)).toISOString().slice(0,7)}`; }
    function enDia(dia:string) { return data.calendario.filter(e=>diaUruguay(e.inicio)<=dia && diaUruguay(e.fin || e.inicio)>=dia); }
    function paginar(p:number) { return `?${new URLSearchParams({mes:data.mes,desde:data.desde,hasta:data.hasta,buscar:data.buscar,pagina:String(p)})}`; }
</script>
<SeoPagina titulo="Eventos en Cerro Largo" descripcion="Consultá la agenda de eventos de Cerro Largo, Uruguay. Descubrí actividades culturales, encuentros y propuestas para disfrutar en Melo y las localidades." parametros={['mes', 'pagina']} />
<div class="t-public agenda-public"><Navbar solid />
<main class="agenda">
    <div class="encabezado">
        <a class="volver" href="/">← Inicio</a>
        <span class="etiqueta">La agenda de Cerro Largo</span>
        <h1>Encontrá tu próximo plan</h1>
        <p>Cultura, encuentros y actividades para disfrutar durante tu visita.</p>
    </div>
    <search aria-label="Buscar eventos">
    <form action="/eventos" method="GET" class="filtros">
        <input type="hidden" name="mes" value={data.mes} />
        <label for="agenda-desde">Desde<input id="agenda-desde" type="date" name="desde" value={data.desde} /></label>
        <label for="agenda-hasta">Hasta<input id="agenda-hasta" type="date" name="hasta" value={data.hasta} /></label>
        <label class="busqueda" for="agenda-buscar">Nombre o lugar
            <span class="campo-busqueda">
                <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
                <input id="agenda-buscar" type="search" name="buscar" maxlength="100" value={data.buscar} placeholder="Buscá un evento o una localidad" autocapitalize="none" />
            </span>
        </label>
        <div class="acciones"><button type="submit" class="t-button">Buscar eventos <span aria-hidden="true">→</span></button><a href="/eventos">Limpiar</a></div>
    </form>
    </search>
    <div class="columnas">
        <section class="calendario" aria-label="Calendario mensual">
            <nav class="mes" aria-label="Mes del calendario"><a href={mover(-1)} aria-label="Mes anterior">←</a><h2>{tituloMes}</h2><a href={mover(1)} aria-label="Mes siguiente">→</a></nav>
            <div class="dias">
                {#each ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'] as dia (dia)}<span class="semana">{dia}</span>{/each}
                {#each Array(vacios) as _, i (i)}<span></span>{/each}
                {#each Array(cantidad) as _, i (i)}
                    {@const dia = `${data.mes}-${String(i+1).padStart(2,'0')}`}{@const eventos = enDia(dia)}
                    <a class:conEvento={eventos.length > 0} class:hoy={dia===data.hoy} class:elegido={dia===data.desde && (!data.hasta || data.hasta===dia)} href={`?mes=${data.mes}&desde=${dia}&hasta=${dia}`} aria-label={`${dia}: ${eventos.length} eventos`} title={eventos.map(e=>e.titulo).join(', ')}>{i+1}{#if eventos.length}<small>{eventos.length}</small>{/if}</a>
                {/each}
            </div><p class="leyenda"><span class="punto" aria-hidden="true"></span> Días con eventos · Horario de Uruguay</p>
            {#if data.truncado}<p>Agenda extensa: se muestran los primeros 1000 eventos del mes. Usá el buscador para afinar.</p>{/if}
            <a class="t-link" href="/eventos/carnaval-melo-2026">Carnaval de Melo: fecha pendiente →</a>
        </section>
        <section aria-label="Resultados de eventos">
            <div class="resultados"><div><span class="etiqueta">PARA DESCUBRIR</span><h2>{data.desde ? 'Para las fechas que elegiste' : 'Qué pasa este mes'}</h2></div><span class="cantidad">{data.eventos.length}{data.eventos.length === 12 ? '+' : ''} {data.eventos.length === 1 ? 'evento' : 'eventos'}</span></div>
            {#if data.eventos.length}<div class="tarjetas">{#each data.eventos as evento, indice (evento.id)}<EventoCard {evento} prioritaria={indice === 0} />{/each}</div>
            {:else}<div class="t-empty vacio"><svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 5h3m2 0h3" /></svg><h3>Todavía no hay planes por acá</h3><p>No encontramos eventos publicados para esta búsqueda. Probá otro mes o cambiá las fechas.</p><a class="t-button secondary" href="/eventos">Ver la agenda del mes</a></div>{/if}
            <nav class="t-pagination" aria-label="Páginas de eventos">{#if data.pagina>1}<a class="t-link" href={paginar(data.pagina-1)}>Anterior</a>{/if}{#if data.eventos.length===12}<a class="t-link" href={paginar(data.pagina+1)}>Más eventos →</a>{/if}</nav>
        </section>
    </div>
</main><HomeFooter /></div>
<style>
.agenda-public { padding: 0; }
.agenda { max-width: 1280px; margin: auto; padding: 124px 32px 64px; }
.encabezado { margin-bottom: 28px; }
.volver { display: inline-flex; color: var(--t-muted); font-size: 12px; margin-bottom: 22px; padding-block: 4px; }
.etiqueta { display: block; color: var(--t-green); font-size: 11px; font-weight: 600; margin-bottom: 8px; }
.encabezado h1 { font-size: clamp(28px, 4vw, 42px); line-height: 1.15; font-weight: 600; margin-bottom: 12px; }
.encabezado p { color: var(--t-muted); font-size: 14px; max-width: 540px; }
.filtros { display: grid; grid-template-columns: minmax(140px, 1fr) minmax(140px, 1fr) minmax(220px, 1.7fr) auto; align-items: end; gap: 16px; padding: 22px; margin-bottom: 32px; background: white; border: 1px solid var(--t-line); border-radius: 20px; }
.filtros label { display: grid; gap: 8px; min-width: 0; font-size: 12px; font-weight: 500; }
.filtros input { width: 100%; min-width: 0; min-height: 48px; border: 1px solid #acbab2; border-radius: 10px; padding: 11px 12px; background: #fff; font: inherit; font-size: 16px; color: var(--t-ink); }
.filtros input[type='date'] { min-inline-size: 0; appearance: none; font-family: system-ui, sans-serif; padding-inline: 8px; }
.campo-busqueda { display: flex; align-items: center; position: relative; }
.campo-busqueda svg { position: absolute; left: 12px; pointer-events: none; color: var(--t-muted); }
.campo-busqueda input { padding-left: 39px; }
.campo-busqueda input::placeholder { font-size: 13px; color: var(--t-muted); }
.acciones { display: flex; align-items: center; gap: 16px; }
.acciones .t-button { min-height: 48px; border-radius: 10px; white-space: nowrap; }
.acciones>a { display: inline-flex; min-height: 44px; align-items: center; font-size: 12px; color: var(--t-muted); text-decoration: underline; text-underline-offset: 3px; }
.columnas { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 32px; align-items: start; }
.calendario { padding: 22px; background: white; border: 1px solid var(--t-line); border-radius: 20px; }
.mes { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 8px; }
.mes h2 { text-transform: capitalize; font-size: 17px; font-weight: 600; text-align: center; }
.mes a { display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid var(--t-line); border-radius: 50%; color: var(--t-green); flex-shrink: 0; }
.mes a:hover { background: #edf3ed; }
.dias { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; font-variant-numeric: tabular-nums; }
.dias>a { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 42px; border-radius: 10px; font-size: 13px; }
.dias>a:hover { outline: 2px solid var(--t-green); outline-offset: -2px; }
.semana { text-align: center; font-size: 10px; color: var(--t-muted); margin-bottom: 9px; }
.conEvento { background: #e6f0e9; color: #245c4e; font-weight: 600; }
.dias .elegido { background: var(--t-green); color: white; }
.hoy { border: 1px solid var(--t-green); }
small { font-size: 9px; line-height: 1.1; }
.leyenda { display: flex; align-items: center; gap: 7px; font-size: 10px; color: var(--t-muted); margin: 18px 0; }
.punto { width: 7px; height: 7px; border-radius: 50%; background: #628e74; flex-shrink: 0; }
.calendario>.t-link { padding-top: 16px; border-top: 1px solid var(--t-line); width: 100%; font-size: 11px; }
.tarjetas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.resultados { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.resultados h2 { font-size: 22px; font-weight: 600; line-height: 1.3; }
.resultados .etiqueta { font-size: 10px; margin-bottom: 5px; }
.cantidad { flex-shrink: 0; padding: 6px 11px; border: 1px solid var(--t-line); border-radius: 24px; color: var(--t-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.vacio { border-style: solid; padding: 40px 24px; border-radius: 20px; }
.vacio h3 { font-size: 19px; font-weight: 600; margin-bottom: 8px; }
.vacio p { font-size: 13px; }
@media(max-width: 1100px) { .filtros { grid-template-columns: 1fr 1fr; } .busqueda { grid-column: 1 / -1; } .acciones { grid-column: 1 / -1; } }
@media(max-width: 950px) { .columnas { grid-template-columns: minmax(0, 1fr); } .calendario { width: 100%; max-width: 480px; } }
@media(max-width: 600px) {
 .agenda { padding: 94px 18px 40px; }
 .encabezado { margin-bottom: 20px; }
 .volver { margin-bottom: 14px; }
 .encabezado h1 { font-size: 29px; }
 .encabezado p { font-size: 13px; }
 .filtros { padding: 16px; gap: 14px 12px; margin-bottom: 24px; border-radius: 18px; }
 .acciones .t-button { flex: 1; }
 .acciones>a { padding-inline: 6px; }
 .columnas { gap: 28px; }
 .calendario { padding: 18px; border-radius: 18px; }
 .dias>a { min-height: 43px; }
 .tarjetas { grid-template-columns: minmax(0, 1fr); }
 .resultados h2 { font-size: 20px; }
 .cantidad { font-size: 10px; padding: 5px 9px; }
}
</style>
