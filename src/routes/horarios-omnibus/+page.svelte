<script lang="ts">
import { URUBUS_URL } from '$lib/transporte/urubus';
import Navbar from '$lib/components/shared/Navbar.svelte';
import HomeFooter from '$lib/components/inicio/HomeFooter.svelte';
import '$lib/components/turista/turista.css';
let {data}=$props();
function paginar(p:number){return `?${new URLSearchParams({origen:data.origen,destino:data.destino,pagina:String(p)})}`;}
</script>
<svelte:head><title>Horarios de ómnibus · Cerro Largo 360</title></svelte:head>
<div class="t-public"><Navbar solid /><main class="transporte">
<a class="t-link" href="/">← Inicio</a><span class="t-eyebrow">RECORRÉ EL DEPARTAMENTO</span><h1 class="t-title">Horarios de ómnibus</h1><p class="t-intro">Consultá recorridos, horarios y días de circulación.</p>
<form method="GET" class="filtros">
<label>Origen<select name="origen" value={data.origen}><option value="">Todos los orígenes</option>{#each data.origenes as origen}<option value={origen}>{origen}</option>{/each}</select></label>
<label>Destino<select name="destino" value={data.destino}><option value="">Todos los destinos</option>{#each data.destinos as destino}<option value={destino}>{destino}</option>{/each}</select></label>
<button class="t-button">Buscar horarios</button><a class="t-link" href="/horarios-omnibus">Limpiar filtros</a>
</form>
{#if data.error}<p class="t-message error" role="alert">{data.error}</p>{:else}
{#if data.horarios.some(h=>h.empresa.nombre.endsWith('(Ficticia)'))}<p class="t-message">Datos ficticios para probar el funcionamiento. Los servicios señalados como prueba no son viajes reales.</p>{/if}
<p class="t-date">{data.total} {data.total===1?'horario encontrado':'horarios encontrados'}</p>
<div class="horarios">{#each data.horarios as h (h.id)}<article class="t-panel">
{#if h.empresa.nombre.endsWith('(Ficticia)')}<span class="t-badge">Servicio ficticio de prueba</span>{/if}
<h2>{h.origen} → {h.destino}</h2><p>{h.empresa.nombre}</p>
<div class="horas"><div><small>Salida</small><strong>{h.hora_salida}</strong></div><span aria-hidden="true">→</span><div><small>Llegada</small><strong>{h.hora_llegada || 'A confirmar'}</strong></div></div>
<dl class="t-details"><div><dt>Días</dt><dd>{h.dias}</dd></div><div><dt>Servicio</dt><dd>{h.tipo_servicio==='DEPARTAMENTAL'?'Departamental':'Interdepartamental'}</dd></div><div><dt>Precio</dt><dd>{h.precio===null?'Consultar con la empresa':`$ ${h.precio}`}</dd></div>{#if h.empresa.telefono}<div><dt>Teléfono</dt><dd>{h.empresa.telefono}</dd></div>{/if}</dl>
<a class="t-button" href={URUBUS_URL} target="_blank" rel="noopener noreferrer">Consultar en Urubus ↗</a>
{#if h.empresa.sitio_web && /^https?:\/\//i.test(h.empresa.sitio_web)}<a class="t-link" href={h.empresa.sitio_web} target="_blank" rel="noopener noreferrer">Consultar a la empresa ↗</a>{/if}
</article>{:else}<div class="t-empty"><h2>No encontramos horarios para este recorrido</h2><p>Probá otro origen o destino.</p></div>{/each}</div>
<nav class="t-pagination" aria-label="Páginas de horarios">{#if data.pagina>1}<a href={paginar(data.pagina-1)}>Anterior</a>{/if}{#if data.pagina*data.porPagina<data.total}<a href={paginar(data.pagina+1)}>Siguiente</a>{/if}</nav>
{/if}</main><HomeFooter /></div>
<style>.transporte{max-width:1200px;margin:auto;padding:130px 24px 64px}.filtros{display:flex;gap:18px;align-items:end;flex-wrap:wrap;margin:28px 0}.filtros label{display:grid;gap:8px;font-size:14px}.filtros select{padding:12px;border:1px solid #cddbcf;border-radius:8px;background:white;min-width:210px}.horarios{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:24px;margin-top:24px}.horas{display:flex;align-items:center;gap:32px;margin:24px 0}.horas div{display:grid;gap:4px}.horas strong{font-size:26px}.horas small{color:#637267}h2{margin-top:12px}</style>
