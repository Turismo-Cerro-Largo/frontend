<script lang="ts">
import Navbar from '$lib/components/shared/Navbar.svelte';
import HomeFooter from '$lib/components/Home/HomeFooter.svelte';
import MapaPublico from '$lib/components/Mapa/MapaPublico.svelte';
import '$lib/components/turista/turista.css';
let {data}=$props();
let vista3d=$state(false);
</script>
<svelte:head><title>Mapa interactivo · Cerro Largo 360</title></svelte:head>
<div class="t-public"><Navbar solid /><main class="pagina-mapa">
<a class="t-link" href="/">← Inicio</a><h1 class="t-title">Mapa interactivo</h1><p class="t-intro">Buscá lugares por nombre, localidad o categoría. Tocá un marcador para abrir su ficha.</p>
<form method="GET" class="t-search"><label class="sr-only" for="buscar-mapa">Nombre, localidad o categoría</label><input id="buscar-mapa" name="buscar" maxlength="100" value={data.buscar} placeholder="Melo, museo, naturaleza…" /><button class="t-button">Buscar en el mapa</button></form>
<div class="t-actions"><button class="t-button secondary" aria-pressed={vista3d} onclick={()=>vista3d=!vista3d}>{vista3d?'Ver en 2D':'Ver en 3D'}</button>{#if data.buscar}<a class="t-link" href="/mapa">Quitar filtro</a>{/if}<a class="t-link" href="/lugares">Explorar todas las fichas →</a></div>
{#if data.error}<p class="t-message error" role="alert">{data.error}</p>{/if}
<div class="contenido"><MapaPublico lugares={data.lugares} {vista3d} /><aside aria-label="Lugares del mapa"><h2>{data.lugares.length} lugares encontrados</h2>{#if data.limitado}<p>Se muestran hasta 500 lugares. Afiná la búsqueda.</p>{/if}{#each data.lugares as lugar (lugar.id)}<a class="resultado" href={`/lugares/${lugar.id}`}><strong>{lugar.nombre} →</strong><span>{lugar.categoria.nombre} · {lugar.localidad}</span></a>{:else}<p>No hay lugares publicados que coincidan con la búsqueda.</p>{/each}</aside></div>
</main><HomeFooter /></div>
<style>.pagina-mapa{max-width:1450px;margin:auto;padding:130px 24px 64px}.contenido{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:24px;margin-top:24px}aside{background:white;padding:20px;border:1px solid #dbe4db;border-radius:16px;max-height:65vh;overflow:auto}aside h2{font-size:17px;font-weight:600;margin-bottom:16px}.resultado{display:grid;gap:5px;padding:18px 0;border-bottom:1px solid #e5ebe4;color:#2d604a}.resultado span{font-size:12px;color:#61776a}@media(max-width:850px){.contenido{grid-template-columns:1fr}aside{max-height:350px}}</style>
