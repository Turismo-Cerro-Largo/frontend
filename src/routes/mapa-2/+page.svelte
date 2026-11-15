<script lang="ts">
    import { onDestroy, tick } from 'svelte';
    import MapaPublico from '$lib/components/mapas/MapaPublico.svelte';
    import Galeria from '$lib/components/turista/Galeria.svelte';
    import { iconoCategoria } from '$lib/components/mapas/iconos';
    import { rangoEvento } from '$lib/utils/agenda';
    import type { PageProps } from './$types';
    import type { LugarMapa } from '$lib/types/mapa';
    import type { DetalleLugar } from '$lib/types/turista';

    let { data }: PageProps = $props();
    let buscar = $state('');
    let categoria = $state('');
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
            categoria: { nombre: 'Eventos' },
            evento
        }))
    ]);
    const categorias = $derived([...new Set(puntos.map((lugar) => lugar.categoria.nombre))]
        .sort((a, b) => a.localeCompare(b, 'es')));
    const consulta = $derived(normalizar(buscar));
    const lugares = $derived(puntos.filter((lugar) =>
        (!categoria || lugar.categoria.nombre === categoria) &&
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

    function volver() {
        solicitud?.abort();
        seleccionado = undefined;
        detalle = undefined;
        grupo = [];
        cargando = false;
        error = '';
        panel.scrollTop = 0;
    }

    async function elegir(lugar: LugarMapa) {
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

        try {
            const respuesta = await fetch(`/mapa-2/detalle/${lugar.id}`, { signal: actual.signal });
            if (!respuesta.ok) throw new Error();
            const resultado: DetalleLugar = await respuesta.json();
            if (!actual.signal.aborted) detalle = resultado;
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

    onDestroy(() => solicitud?.abort());
</script>

<svelte:head>
    <title>Mapa de lugares · Cerro Largo 360</title>
    <meta name="description" content="Explorá los lugares turísticos de Cerro Largo en el mapa. Consultá sus direcciones, fotos y valoraciones." />
</svelte:head>

<main class="explorador">
    <div class="mapa">
        <MapaPublico {lugares} localidades={[]} pantallaCompleta {seleccionado} {seleccionar} {vista3d} {oscuro} />
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
        aria-label={panelAbierto ? 'Cerrar panel' : 'Explorar lugares'} onclick={panelAbierto ? cerrarPanel : abrirPanel}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            {#if panelAbierto}<path d="m9 6 6 6-6 6" />{:else}<path d="m10 6-6 6 6 6M15 7h5m-5 5h5m-5 5h5" />{/if}
        </svg>
    </button>
    <aside id="panel-lugares" bind:this={panel} tabindex="-1" aria-label="Lugares del mapa">
        {#if seleccionado}
            <button class="volver" type="button" onclick={volver}>← Ver lugares</button>
            {#if grupo.length}
                <div class="grupo" aria-label="Lugares en este marcador">
                    {#each grupo as lugar (lugar.id)}
                        <button type="button" aria-pressed={lugar.id === seleccionado.id} onclick={() => elegir(lugar)}>{lugar.nombre}</button>
                    {/each}
                </div>
            {/if}
            <p class="meta etiqueta">{seleccionado.categoria.nombre} · {seleccionado.localidad}</p>
            <h1>{seleccionado.nombre}</h1>
            {#if seleccionado.evento}
                {@const evento = seleccionado.evento}
                <p><strong>{rangoEvento(evento)}</strong></p>
                <Galeria recursos={evento.recursos} nombre={evento.titulo} />
                <p>{evento.descripcion}</p>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${seleccionado.latitud},${seleccionado.longitud}`)}`} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
            {:else if cargando}
                <p role="status">Cargando ficha…</p>
            {:else if error}
                <p role="status">{error}</p>
                <button type="button" onclick={() => seleccionado && elegir(seleccionado)}>Reintentar</button>
            {:else if detalle}
                {@const portada = detalle.lugar.recursos?.find((recurso) => recurso.tipo === 'IMAGEN')}
                {@const galeria = detalle.lugar.recursos?.filter((recurso) => recurso.id !== portada?.id) ?? []}
                {#if detalle.promedio !== null}
                    <p class="valoracion"><span aria-hidden="true">★</span> {Number(detalle.promedio).toFixed(1)} de 5 <span class="meta">· {detalle.totalValoraciones} valoraciones</span></p>
                {/if}
                {#if portada}
                    <img class="foto-ficha" src={`/api/recursos/${portada.id}`} alt={portada.descripcion || detalle.lugar.nombre} />
                {/if}
                <a class="indicaciones" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${seleccionado.latitud},${seleccionado.longitud}`)}`} target="_blank" rel="noopener noreferrer">Cómo llegar ↗</a>
                {#if detalle.lugar.descripcion}<p class="descripcion">{detalle.lugar.descripcion}</p>{/if}
                {#if detalle.lugar.direccion || detalle.lugar.horario || detalle.lugar.telefono}
                    <dl class="datos-ficha">
                        {#if detalle.lugar.direccion}<div><dt>Dirección</dt><dd>{detalle.lugar.direccion}</dd></div>{/if}
                        {#if detalle.lugar.horario}<div><dt>Horario</dt><dd>{detalle.lugar.horario}</dd></div>{/if}
                        {#if detalle.lugar.telefono}<div><dt>Teléfono</dt><dd>{detalle.lugar.telefono}</dd></div>{/if}
                    </dl>
                {/if}
                {#if galeria.length}<Galeria recursos={galeria} nombre={detalle.lugar.nombre} />{/if}
                <section class="comentarios" aria-label="Comentarios">
                    <h2>Comentarios</h2>
                    {#each detalle.comentarios as comentario (comentario.id)}
                        <article>
                            <strong>{comentario.usuario.nombres}</strong>
                            <p aria-label={`${comentario.calificacion} de 5 estrellas`}>{'★'.repeat(comentario.calificacion)}</p>
                            {#if comentario.texto}<p>{comentario.texto}</p>{/if}
                        </article>
                    {:else}
                        <p>Todavía no hay comentarios publicados.</p>
                    {/each}
                </section>
            {/if}
            <p><a class="ficha" href={seleccionado.evento ? `/eventos/${seleccionado.evento.id}` : `/lugares/${seleccionado.id}`}>Ver ficha completa →</a></p>
        {:else}
            <a class="volver" href="/">← Inicio</a>
            <h1>Lugares de Cerro Largo</h1>
            <label for="buscar-lugar">Buscar lugar o localidad</label>
            <input id="buscar-lugar" type="search" bind:value={buscar} placeholder="Ej. Melo" />
            <label for="categoria-lugar">Categoría</label>
            <select id="categoria-lugar" bind:value={categoria}>
                <option value="">Todas las categorías</option>
                {#each categorias as nombre (nombre)}<option value={nombre}>{nombre}</option>{/each}
            </select>
            {#if data.error}<p role="status">{data.error}</p>{/if}
            {#if data.errorEventos}<p role="status">No pudimos cargar los eventos.</p>{/if}
            {#if data.limitado}<p><a href="/lugares">Ver catálogo completo</a></p>{/if}
            {#if !consulta && !categoria && data.recomendaciones.length}
                <section>
                    <h2>Recomendados</h2>
                    <ul class="tarjetas">
                        {#each data.recomendaciones as { lugar, imagen } (lugar.id)}
                            {@const icono = iconoCategoria(lugar.categoria.nombre)}
                            <li><button type="button" onclick={() => seleccionar([lugar])}>
                                {#if imagen}
                                    <img class="portada" src={imagen} alt="" loading="lazy" />
                                {:else if icono}
                                    <span class="portada alternativa" style:background={icono.color}>
                                        <img src={`/iconos-mapa/${icono.archivo}.svg`} alt="" />
                                    </span>
                                {/if}
                                <span class="texto-tarjeta">
                                    <strong>{lugar.nombre}</strong>
                                    <span class="meta">{lugar.localidad} · {lugar.categoria.nombre}</span>
                                </span>
                            </button></li>
                        {/each}
                    </ul>
                </section>
            {/if}
            {#if consulta || categoria}
                <h2>Resultados</h2>
                <ul>
                    {#each lugares as lugar (lugar.id)}
                        <li>
                            <button type="button" onclick={() => seleccionar([lugar])}>
                                <strong>{lugar.nombre}</strong>
                                <span class="meta">{lugar.localidad} · {lugar.categoria.nombre}</span>
                            </button>
                        </li>
                    {:else}
                        {#if !data.error}<li>No encontramos resultados.</li>{/if}
                    {/each}
                </ul>
            {/if}
        {/if}
    </aside>
    </div>
</main>

<style>
    .explorador { display: grid; grid-template-columns: minmax(0, 1fr) clamp(11rem, 48vw, 25rem); height: 100dvh; background: #fff; color: #233c35; }
    .mapa { position: relative; min-width: 0; min-height: 0; }
    .controles { position: absolute; top: .75rem; left: .75rem; right: 3.5rem; z-index: 1; display: flex; flex-wrap: wrap; gap: .4rem; }
    .controles button { min-height: 44px; padding: .45rem .75rem; background: #fff; border: 1px solid #93a99f; border-radius: .55rem; font-weight: 650; }
    .controles button[aria-pressed="true"] { background: #28654d; color: #fff; }
    .controles .icono { display: grid; place-items: center; width: 44px; padding: 0; }
    .icono svg { width: 22px; height: 22px; }
    .pestana { display: none; }
    .lateral { min-width: 0; min-height: 0; }
    aside { height: 100%; min-width: 0; overflow: auto; overscroll-behavior: contain; padding: clamp(.9rem, 2vw, 1.5rem); border-left: 1px solid #d7e1d8; overflow-wrap: anywhere; background: #fff; }
    h1 { font-size: clamp(1.25rem, 3vw, 2rem); line-height: 1.15; margin: .8rem 0; }
    h2 { font-size: 1.2rem; margin-top: 1.2rem; }
    p { margin: .55rem 0; }
    .meta, label { font-size: .85rem; color: #465b52; display: block; }
    a, .volver { color: #28654d; font-weight: 650; }
    button { cursor: pointer; }
    input, select { box-sizing: border-box; width: 100%; margin: .3rem 0 .8rem; padding: .65rem; border: 1px solid #93a99f; border-radius: .55rem; }
    ul { list-style: none; padding: 0; }
    li, article { border-bottom: 1px solid #d7e1d8; }
    li button { width: 100%; text-align: left; padding: .75rem .2rem; min-height: 44px; }
    li button:hover, .grupo button:hover, .grupo button[aria-pressed="true"] { background: #edf4ee; }
    .grupo { display: grid; gap: .25rem; margin: .5rem 0; }
    .grupo button { text-align: left; padding: .4rem; border: 1px solid #d7e1d8; border-radius: .4rem; }
    article { padding: .7rem 0; }
    .ficha { display: inline-block; margin-block: 1rem; }
    .etiqueta { margin-top: 1rem; font-weight: 600; }
    .valoracion { display: flex; flex-wrap: wrap; align-items: baseline; gap: .35rem; font-weight: 650; margin-bottom: .85rem; }
    .valoracion > span:first-child, .comentarios article p:first-of-type { color: #875808; }
    .foto-ficha { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: .8rem; }
    .indicaciones { display: grid; place-items: center; min-height: 44px; margin: .85rem 0; border-radius: .55rem; background: #28654d; color: #fff; }
    .descripcion { line-height: 1.55; }
    .datos-ficha { display: grid; gap: .7rem; margin: 1rem 0; padding: .85rem; border: 1px solid #d7e1d8; border-radius: .65rem; background: #f5f8f4; }
    .datos-ficha dt { font-size: .8rem; font-weight: 700; }
    .datos-ficha dd { margin: .15rem 0 0; }
    .tarjetas { display: grid; gap: .7rem; margin-top: .6rem; }
    .tarjetas li { overflow: hidden; border: 1px solid #d7e1d8; border-radius: .8rem; }
    .tarjetas button { display: block; padding: 0; }
    .portada { display: block; width: 100%; aspect-ratio: 2.1; object-fit: cover; }
    .alternativa { display: grid; place-items: center; }
    .alternativa img { width: 36px; height: 36px; }
    .texto-tarjeta { display: block; padding: .65rem .75rem; }
    @media (max-width: 767px) {
        .explorador { position: relative; grid-template-columns: minmax(0, 1fr); overflow: clip; }
        .lateral { position: absolute; inset: 0 0 0 auto; z-index: 2; width: min(calc(100vw - 48px), 24rem); transform: translateX(100%); transition: transform .24s ease; pointer-events: none; }
        .lateral.panelAbierto { transform: translateX(0); }
        aside { visibility: hidden; transition: visibility 0s linear .24s; box-shadow: -8px 0 24px #192a2340; }
        .panelAbierto aside { visibility: visible; transition-delay: 0s; pointer-events: auto; }
        .pestana { position: absolute; top: 35%; right: 100%; display: grid; place-items: center; width: 44px; height: 56px; border-radius: .7rem 0 0 .7rem; background: #28654d; color: #fff; box-shadow: -2px 2px 12px #192a2340; pointer-events: auto; }
        .pestana svg { width: 22px; }
        @media (prefers-reduced-motion: reduce) {
            .lateral, aside { transition: none; }
        }
    }
</style>
