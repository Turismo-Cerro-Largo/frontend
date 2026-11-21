<script lang="ts">
    import { onDestroy, onMount, tick } from 'svelte';
    import MapaPublico from '$lib/components/mapas/MapaPublico.svelte';
    import FichaLugarMapa from '$lib/components/mapas/FichaLugarMapa.svelte';
    import Galeria from '$lib/components/turista/Galeria.svelte';
    import { iconoCategoria } from '$lib/components/mapas/iconos';
    import { rangoEvento } from '$lib/utils/agenda';
    import type { PageProps } from './$types';
    import type { LugarMapa } from '$lib/types/mapa';
    import type { DetalleLugar } from '$lib/types/turista';

    let { data }: PageProps = $props();
    let buscar = $state('');
    let categoriasSeleccionadas = $state<string[]>([]);
    let categoriasAmpliadas = $state(false);
    let localidadId = $state('');
    const localidadesDisponibles = $derived(data.localidades.map((localidad) => ({
        ...localidad,
        latitud: localidad.latitud ?? (localidad.limites ? (localidad.limites[0][1] + localidad.limites[1][1]) / 2 : null),
        longitud: localidad.longitud ?? (localidad.limites ? (localidad.limites[0][0] + localidad.limites[1][0]) / 2 : null)
    })).filter(({ latitud, longitud }) =>
        latitud !== null && longitud !== null && Number.isFinite(latitud) && Number.isFinite(longitud) &&
        Math.abs(latitud) <= 90 && Math.abs(longitud) <= 180
    ).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
    const localidadSeleccionada = $derived(localidadesDisponibles.find(({ id }) => String(id) === localidadId));
    let panelAbierto = $state(false);
    let vista3d = $state(false);
    let oscuro = $state(false);
    let seleccionado = $state<LugarMapa>();
    let grupo = $state<LugarMapa[]>([]);
    let detalle = $state<DetalleLugar>();
    let cargando = $state(false);
    let error = $state('');
    let panel: HTMLElement;
    let botonLugares: HTMLButtonElement;
    let solicitud: AbortController | undefined;
    let busquedaAplicada = $state('');
    const buscando = $derived(buscar !== busquedaAplicada);
    const fichas = new Map<number, { detalle: DetalleLugar; fecha: number }>();

    $effect(() => {
        const texto = buscar;
        const temporizador = setTimeout(() => { busquedaAplicada = texto; }, 300);
        return () => clearTimeout(temporizador);
    });

    function normalizar(texto: string) {
        return texto.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim();
    }

    const puntos = $derived<LugarMapa[]>([
        ...data.lugares,
        ...data.eventos.map((evento) => ({
            id: -evento.id,
            nombre: evento.titulo,
            localidad: evento.lugar_evento || 'Cerro Largo',
            latitud: Number(evento.latitud),
            longitud: Number(evento.longitud),
            categoria: evento.categoria || { nombre: 'Eventos' },
            evento
        }))
    ]);
    function prioridadCategoria(nombre: string) {
        const categoria = normalizar(nombre);
        const indice = ['alojamiento', 'restaurantes', 'cultura', 'eventos', 'naturaleza']
            .findIndex((principal) => categoria.includes(principal));
        return indice === -1 ? 5 : indice;
    }

    const categorias = $derived([...new Set(puntos.map((lugar) => lugar.categoria.nombre))]
        .sort((a, b) => prioridadCategoria(a) - prioridadCategoria(b) || a.localeCompare(b, 'es')));
    const categoriasVisibles = $derived(categoriasAmpliadas ? categorias : categorias.slice(0, 5));
    const seleccionadasOcultas = $derived(categorias.slice(5).filter((nombre) => categoriasSeleccionadas.includes(nombre)).length);
    const consulta = $derived(normalizar(busquedaAplicada));
    const lugares = $derived(puntos.filter((lugar) =>
        (!categoriasSeleccionadas.length || categoriasSeleccionadas.includes(lugar.categoria.nombre)) &&
        normalizar(`${lugar.nombre} ${lugar.localidad} ${lugar.categoria.nombre}`).includes(consulta)
    ));

    async function abrirPanel() {
        panelAbierto = true;
        await tick();
        panel.focus();
    }

    function cerrarPanel() {
        panelAbierto = false;
        botonLugares.focus();
    }

    async function volver() {
        solicitud?.abort();
        seleccionado = undefined;
        detalle = undefined;
        grupo = [];
        cargando = false;
        error = '';
        await tick();
        panel.scrollTop = 0;
        panel.focus({ preventScroll: true });
    }

    async function elegir(lugar: LugarMapa) {
        if (seleccionado?.id === lugar.id && (detalle || cargando || lugar.evento)) {
            await abrirPanel();
            return;
        }
        solicitud?.abort();
        const actual = new AbortController();
        solicitud = actual;
        panelAbierto = true;
        seleccionado = lugar;
        detalle = undefined;
        cargando = !lugar.evento;
        error = '';
        await tick();
        if (actual.signal.aborted) return;
        panel.scrollTop = 0;
        panel.focus();
        if (lugar.evento) return;
        const anterior = fichas.get(lugar.id);
        if (anterior && Date.now() - anterior.fecha < 60_000) {
            detalle = anterior.detalle;
            cargando = false;
            return;
        }

        await new Promise<void>((resolve) => {
            const temporizador = setTimeout(resolve, 180);
            actual.signal.addEventListener('abort', () => {
                clearTimeout(temporizador);
                resolve();
            }, { once: true });
        });
        if (actual.signal.aborted) return;

        try {
            const respuesta = await fetch(`/mapa/detalle/${lugar.id}`, { signal: actual.signal });
            if (!respuesta.ok) throw new Error();
            const resultado: DetalleLugar = await respuesta.json();
            if (!actual.signal.aborted) {
                detalle = resultado;
                if (fichas.size >= 30) fichas.clear();
                fichas.set(lugar.id, { detalle: resultado, fecha: Date.now() });
            }
        } catch {
            if (!actual.signal.aborted) error = 'No pudimos cargar la ficha.';
        } finally {
            if (!actual.signal.aborted) cargando = false;
        }
    }

    function seleccionar(marcador: LugarMapa[]) {
        grupo = marcador.length > 1 ? marcador : [];
        void elegir(marcador[0]);
    }

    onMount(() => { panelAbierto = window.matchMedia('(min-width: 768px)').matches; });
    onDestroy(() => solicitud?.abort());
</script>

<svelte:head>
    <title>Mapa de lugares · Cerro Largo 360</title>
    <meta name="description" content="Explorá los lugares turísticos de Cerro Largo en el mapa. Consultá sus direcciones, fotos y valoraciones." />
</svelte:head>

<main class="explorador">
    <div class="mapa">
        <MapaPublico {lugares} localidades={[]} {localidadSeleccionada} pantallaCompleta {seleccionado} {seleccionar} {vista3d} {oscuro} />
        <div class="controles" role="group" aria-label="Controles del mapa">
            <button class="icono" type="button" aria-label="Vista 3D" title={vista3d ? 'Cambiar a 2D' : 'Cambiar a 3D'} aria-pressed={vista3d} onclick={() => vista3d = !vista3d}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    {#if vista3d}<path d="m12 4 8 4.5v7L12 20l-8-4.5v-7L12 4Zm0 9 8-4.5M12 13 4 8.5m8 4.5v7" />
                    {:else}<path d="m12 5 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5" />{/if}
                </svg>
            </button>
            <button class="icono" type="button" aria-label="Modo oscuro" title={oscuro ? 'Cambiar a mapa claro' : 'Cambiar a mapa oscuro'} aria-pressed={oscuro} onclick={() => oscuro = !oscuro}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
                    {#if oscuro}<circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
                    {:else}<path d="M20 15.4A8.5 8.5 0 0 1 8.6 4 8.5 8.5 0 1 0 20 15.4Z" />{/if}
                </svg>
            </button>
        </div>
    </div>

    <div class="lateral" class:panelAbierto>
    <button class="pestana" type="button" bind:this={botonLugares} aria-controls="panel-lugares" aria-expanded={panelAbierto}
        aria-label={panelAbierto ? 'Minimizar panel' : 'Abrir panel'} title={panelAbierto ? 'Minimizar panel' : 'Abrir panel'} onclick={panelAbierto ? cerrarPanel : abrirPanel}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            {#if panelAbierto}<path d="m9 6 6 6-6 6" />{:else}<path d="m15 6-6 6 6 6" />{/if}
        </svg>
    </button>
    <div class="marco-panel">
    {#if !detalle}
    <button class="cerrar-menu-movil" type="button" aria-label="Cerrar menú del mapa" onclick={cerrarPanel}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
    </button>
    {/if}
    <aside class:menuInicial={!seleccionado} inert={!panelAbierto} class:seleccionado={Boolean(seleccionado)} id="panel-lugares" bind:this={panel} tabindex="-1" aria-label="Lugares del mapa">
        {#if seleccionado}
            {#if !detalle}<button class="volver" type="button" onclick={volver}>← Ver lugares</button>{/if}
            {#if grupo.length}
                <div class="grupo" aria-label="Lugares en este marcador">
                    {#each grupo as lugar (lugar.id)}
                        <button type="button" aria-pressed={lugar.id === seleccionado.id} onclick={() => elegir(lugar)}>{lugar.nombre}</button>
                    {/each}
                </div>
            {/if}
            {#if !detalle}<p class="meta etiqueta">{seleccionado.categoria.nombre} · {seleccionado.localidad}</p>
            <h1>{seleccionado.nombre}</h1>{/if}
            {#if seleccionado.evento}
                {@const evento = seleccionado.evento}
                <p><strong>{rangoEvento(evento)}</strong></p>
                <Galeria recursos={evento.recursos} nombre={evento.titulo} />
                <p>{evento.descripcion}</p>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${seleccionado.latitud},${seleccionado.longitud}`)}`} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
            {:else if cargando}
                <div class="carga-ficha" role="status" aria-label="Cargando ficha">
                    <div class="esqueleto foto-esqueleto"></div>
                    <div class="esqueleto linea-esqueleto"></div>
                    <div class="esqueleto linea-esqueleto corta"></div>
                    <p><span class="rueda" aria-hidden="true"></span>Cargando ficha…</p>
                </div>
            {:else if error}
                <p role="status">{error}</p>
                <button type="button" onclick={() => seleccionado && elegir(seleccionado)}>Reintentar</button>
            {:else if detalle}
                {#key detalle.lugar.id}
                    <FichaLugarMapa {detalle} turista={data.cuenta?.rol === 'TURISTA'} cerrar={volver} />
                {/key}
            {/if}
            {#if !detalle}<p><a class="ficha" href={seleccionado.evento ? `/eventos/${seleccionado.evento.id}` : `/lugares/${seleccionado.id}`}>Ver ficha completa →</a></p>{/if}
        {:else}

            <div class="menu-inicial">
            <div class="menu-cabecera">
                <a class="inicio-mapa" href="/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>Cerro Largo 360</a>
                <h1>Explorá Cerro Largo</h1>
                <div class="buscador">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
                    <label class="sr-only" for="buscar-lugar">Buscar lugar o localidad</label>
                    <input id="buscar-lugar" type="search" bind:value={buscar} placeholder="Lugares, eventos o localidades" />
                    {#if buscando}<span class="rueda" role="status" aria-label="Buscando lugares"></span>{/if}
                </div>
            </div>
            <div id="categorias-mapa" class="categorias-menu" role="group" aria-label="Filtrar por categoría">
                <button type="button" aria-pressed={!categoriasSeleccionadas.length} onclick={() => categoriasSeleccionadas = []}>Todas</button>
                {#each categoriasVisibles as nombre (nombre)}
                    {@const icono = iconoCategoria(puntos.find(punto => punto.categoria.nombre === nombre)?.categoria || nombre)}
                    <button type="button" aria-pressed={categoriasSeleccionadas.includes(nombre)} onclick={() => categoriasSeleccionadas = categoriasSeleccionadas.includes(nombre) ? categoriasSeleccionadas.filter((item) => item !== nombre) : [...categoriasSeleccionadas, nombre]}>
                        {#if icono}<img decoding="async" loading="lazy" fetchpriority="auto" src={icono.url} style:background={icono.color} alt="" />{/if}{nombre}
                    </button>
                {/each}
                {#if categorias.length > 5}
                    <button class="ampliar-categorias" type="button" aria-expanded={categoriasAmpliadas} aria-controls="categorias-mapa" onclick={() => categoriasAmpliadas = !categoriasAmpliadas}>
                        {categoriasAmpliadas ? 'Ver menos' : `Ver más (${categorias.length - 5})`}{!categoriasAmpliadas && seleccionadasOcultas ? ` · ${seleccionadasOcultas} seleccionadas` : ''}
                    </button>
                {/if}
            </div>
            <div class="selector-localidad">
                <label for="localidad-mapa">Ir a una localidad</label>
                <select id="localidad-mapa" bind:value={localidadId} disabled={!localidadesDisponibles.length}>
                    <option value="">Elegí una localidad</option>
                    {#each localidadesDisponibles as localidad (localidad.id)}
                        <option value={String(localidad.id)}>{localidad.nombre}</option>
                    {/each}
                </select>
            </div>
            {#if data.error}<p role="status">{data.error}</p>{/if}
            {#if data.errorEventos}<p role="status">No pudimos cargar los eventos.</p>{/if}
            {#if data.limitado}<p><a href="/lugares">Ver catálogo completo</a></p>{/if}
            <div aria-busy={buscando} class:buscando>
            {#if !consulta && !categoriasSeleccionadas.length && data.recomendaciones.length}
                <section class="recomendaciones">
                    <h2>Para descubrir</h2>
                    <ul class="tarjetas">
                        {#each data.recomendaciones as { lugar, imagen } (lugar.id)}
                            <li><button type="button" onclick={() => seleccionar([lugar])}>
                                <span class="portada" aria-hidden="true">
                                    {#if imagen}
                                        <img decoding="async" fetchpriority="auto" src={imagen} alt="" loading="lazy" onerror={(event) => event.currentTarget.setAttribute('hidden', '')} />
                                    {/if}
                                </span>
                                <span class="texto-tarjeta">
                                    <strong>{lugar.nombre}</strong>
                                    <span class="meta">{lugar.localidad} · {lugar.categoria.nombre}</span>
                                </span>
                            </button></li>
                        {/each}
                    </ul>
                </section>
            {/if}
            {#if consulta || categoriasSeleccionadas.length}
                <div class="encabezado-resultados"><h2>Resultados</h2><span>{lugares.length}</span></div>
                <ul class="resultados">
                    {#each lugares as lugar (lugar.id)}
                        <li>
                            <button type="button" onclick={() => seleccionar([lugar])}>
                                <strong>{lugar.nombre}</strong>
                                <span class="meta">{lugar.localidad} · {lugar.categoria.nombre}</span>
                            </button>
                        </li>
                    {:else}
                        {#if !data.error}<li class="sin-resultados"><strong>No encontramos resultados</strong><p>Probá con otro nombre o quitá los filtros.</p><button type="button" onclick={() => { buscar = ''; categoriasSeleccionadas = []; }}>Limpiar búsqueda</button></li>{/if}
                    {/each}
                </ul>
            {/if}
            </div>
            </div>
        {/if}
    </aside>
    </div>
    </div>
</main>

<style>
    .explorador { position:relative; display:grid; height:100dvh; overflow:clip; background:#fff; color:#233c35; }
    .mapa { position: relative; min-width: 0; min-height: 0; }
    .controles { position: absolute; top: .75rem; left: .75rem; right: 3.5rem; z-index: 1; display: flex; flex-wrap: wrap; gap: .4rem; }
    .controles button { min-height: 44px; padding: .45rem .75rem; background: #fff; border: 1px solid #93a99f; border-radius: .55rem; font-weight: 650; }
    .controles button[aria-pressed="true"] { background: #28654d; color: #fff; }
    .controles .icono { display: grid; place-items: center; width: 44px; padding: 0; }
    .icono svg { width: 22px; height: 22px; }
    .lateral { position:absolute; inset:0 0 0 auto; z-index:2; width:clamp(21rem,34vw,27rem); min-width:0; min-height:0; transform:translateX(100%); transition:transform .24s ease; pointer-events:none; }
    .lateral.panelAbierto { transform:translateX(0); }
    .marco-panel { box-sizing:border-box; height:100%; padding:4px; overflow:hidden; border-radius:30px 0 0 30px; background:#fff; box-shadow:0 3px 20px #192a2329; visibility:hidden; transition:visibility 0s linear .24s; }
    aside { box-sizing:border-box; height:100%; min-width:0; overflow:auto; overscroll-behavior:contain; padding:16px; overflow-wrap:anywhere; background:#fff; border-radius:24px; scrollbar-width:thin; scrollbar-color:#c5cbc7 transparent; }
    .panelAbierto .marco-panel { visibility:visible; transition-delay:0s; pointer-events:auto; }
    .pestana { position:absolute; top:35%; right:100%; display:grid; place-items:center; width:30px; height:52px; border-radius:12px 0 0 12px; background:#fff; color:#5f6862; box-shadow:-3px 2px 8px #192a231a; pointer-events:auto; }
    .pestana:hover { background:#edf4ef; color:#28654d; }
    .pestana:focus-visible { outline:2px solid #28654d; outline-offset:2px; }
    .pestana svg { width:20px; height:20px; }
    .cerrar-menu-movil { display:none; }
    aside.seleccionado { padding:0; }
    aside.seleccionado > .volver, aside.seleccionado > .grupo, aside.seleccionado > .meta, aside.seleccionado > h1 { margin:16px 24px; }
    h1 { font-size: clamp(1.25rem, 3vw, 2rem); line-height: 1.15; margin: .8rem 0; }
    h2 { font-size: 1.2rem; margin-top: 1.2rem; }
    p { margin: .55rem 0; }
    .meta, label { font-size: .85rem; color: #465b52; display: block; }
    a, .volver { color: #28654d; font-weight: 650; }
    button { cursor: pointer; }
    input { box-sizing: border-box; width: 100%; margin: .3rem 0 .8rem; padding: .65rem; border: 1px solid #93a99f; border-radius: .55rem; }
    ul { list-style: none; padding: 0; }
    li { border-bottom: 1px solid #d7e1d8; }
    li button { width: 100%; text-align: left; padding: .75rem .2rem; min-height: 44px; }
    li button:hover, .grupo button:hover, .grupo button[aria-pressed="true"] { background: #edf4ee; }
    .grupo { display: grid; gap: .25rem; margin: .5rem 0; }
    .grupo button { text-align: left; padding: .4rem; border: 1px solid #d7e1d8; border-radius: .4rem; }
    .ficha { display: inline-block; margin-block: 1rem; }
    .etiqueta { margin-top: 1rem; font-weight: 600; }
    .tarjetas { display: grid; gap: .7rem; margin-top: .6rem; }
    .tarjetas li { overflow: hidden; border: 1px solid #d7e1d8; border-radius: .8rem; }
    .tarjetas button { display: block; padding: 0; }
    .portada { display: block; width: 100%; aspect-ratio: 2.1; object-fit: cover; }
    .texto-tarjeta { display: block; padding: .65rem .75rem; }
    @media (max-width: 767px) {
        .categorias-menu { justify-content:center; }
        .lateral { width:100%; }
        .panelAbierto .cerrar-menu-movil { position:absolute; top:14px; left:14px; z-index:4; display:grid; place-items:center; width:44px; height:44px; padding:0; border:1px solid #e1e8e2; border-radius:50%; background:#fff; color:#536359; box-shadow:0 2px 8px #192a2320; pointer-events:auto; }
        .cerrar-menu-movil svg { width:22px; height:22px; }
        .cerrar-menu-movil:focus-visible { outline:2px solid #28654d; outline-offset:2px; }
        .menu-cabecera { padding-top:48px; }
        .pestana { width:44px; height:56px; }
    }
    @media (prefers-reduced-motion: reduce) {
        .lateral, .marco-panel { transition:none; }
    }

    .menu-inicial { box-sizing:border-box; min-height:100%; border-radius:24px; overflow:clip; padding:16px; background:#f7faf8; }
    aside.menuInicial { padding:0; }
    .menu-cabecera { padding:4px 0 0; }
    .inicio-mapa { display:inline-flex; align-items:center; gap:6px; color:#61726a; font-size:12px; font-weight:500; min-height:36px; }
    .inicio-mapa svg { width:17px; height:17px; }
    .menu-cabecera h1 { margin:8px 0 16px; font-size:23px; letter-spacing:-.8px; font-weight:550; color:#20382c; }
    .buscador { display:flex; align-items:center; gap:9px; padding:0 12px; border:1px solid #e0e7e2; border-radius:28px; background:#f6f8f6; box-shadow:0 2px 7px #253c2910; }
    .buscador > svg { width:18px; height:18px; flex-shrink:0; color:#5f7467; }
    .buscador input { margin:0; padding:10px 0; border:0; background:transparent; min-height:42px; height:42px; font-size:12px; min-width:0; outline:none; }
    .buscador:focus-within { outline:2px solid #42846b; outline-offset:2px; }
    .categorias-menu { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:20px 0 26px; }
    .categorias-menu button { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-width:0; border:1px solid #e1e8e2; border-radius:22px; padding:9px 10px; font-size:11px; min-height:42px; color:#536359; background:white; }
    .categorias-menu button img { width:22px; height:22px; padding:3px; border-radius:50%; flex-shrink:0; }
    .categorias-menu .ampliar-categorias { border-style:dashed; background:transparent; }
    .categorias-menu button[aria-pressed=true] { color:#1c5b43; background:#e4f0e9; border-color:#bad6c5; font-weight:600; }
    .categorias-menu button:hover { background:#eef4ef; }
    .selector-localidad { margin:-10px 0 24px; }
    .selector-localidad label { display:block; margin-bottom:7px; font-size:12px; color:#536359; font-weight:500; }
    .selector-localidad select { box-sizing:border-box; width:100%; min-height:44px; padding:10px 12px; border:1px solid #e1e8e2; border-radius:14px; background:white; color:#26392f; font:inherit; font-size:13px; }
    .selector-localidad select:focus-visible { outline:2px solid #42846b; outline-offset:2px; }
    .recomendaciones h2,.encabezado-resultados h2 { font-size:18px; font-weight:550; letter-spacing:-.3px; }
    .recomendaciones h2 { margin:0 0 14px; }
    .tarjetas { gap:12px; }
    .tarjetas li { background:white; border-color:#e7ece8; border-radius:18px; box-shadow:0 2px 8px #203d2c08; }
    .tarjetas button { display:flex; align-items:stretch; min-height:104px; }
    .tarjetas .portada { position:relative; display:block; width:104px; min-height:104px; flex-shrink:0; background:#e5e7eb; }
    .tarjetas .portada img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
    .tarjetas .portada :global(img[hidden]) { display:none; }
    .tarjetas .texto-tarjeta { flex:1; align-self:center; padding:12px 14px; min-width:0; }
    .texto-tarjeta strong { display:block; font-size:14px; font-weight:550; line-height:1.4; color:#26392f; }
    .texto-tarjeta .meta { margin-top:6px; font-size:11px; color:#748076; line-height:1.5; }
    .encabezado-resultados { display:flex; align-items:center; justify-content:space-between; }
    .encabezado-resultados span { color:#748076; font-size:12px; }
    .resultados li { border-color:#e7ece8; }
    .resultados li button { padding:16px 10px; border-radius:12px; }
    .resultados strong { font-size:14px; font-weight:550; }
    .resultados .meta { margin-top:5px; font-size:11px; }
    .sin-resultados { padding:24px 8px; border:0; }
    .sin-resultados p { color:#748076; font-size:13px; }
    .sin-resultados button { color:#24634b; }
    .sr-only { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    @media(max-width:400px) { .tarjetas .portada { width:85px; min-height:100px; } .tarjetas .texto-tarjeta { padding:10px; } }

    .rueda { display:inline-block; width:17px; height:17px; flex-shrink:0; border:2px solid #d9e8de; border-top-color:#287454; border-radius:50%; animation:girar .7s linear infinite; }
    .carga-ficha { padding:0 0 24px; }
    .carga-ficha p { display:flex; align-items:center; gap:9px; margin:20px 24px; color:#5d7064; font-size:13px; }
    .esqueleto { background:linear-gradient(90deg,#edf2ef 25%,#fafcfb 50%,#edf2ef 75%); background-size:200% 100%; animation:brillar 1.3s ease-in-out infinite; }
    .foto-esqueleto { height:clamp(300px,42dvh,420px); border-radius:24px 24px 0 0; }
    .linea-esqueleto { height:20px; border-radius:8px; margin:20px 24px 0; }
    .linea-esqueleto.corta { width:45%; height:14px; margin-top:12px; }
    .buscando { opacity:.5; transition:opacity .15s; }
    @keyframes girar { to { transform:rotate(360deg); } }
    @keyframes brillar { to { background-position:-200% 0; } }
    @media(prefers-reduced-motion:reduce) { .rueda,.esqueleto { animation:none; } .buscando { transition:none; } }
</style>
