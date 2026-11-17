<script lang="ts">
    import { onMount } from 'svelte';
    import { enviar } from '$lib/turista/api';
    import Galeria from '$lib/components/turista/Galeria.svelte';
    import type { DetalleLugar } from '$lib/types/turista';

    let { detalle, turista = false, cerrar }: {
        detalle: DetalleLugar;
        turista?: boolean;
        cerrar: () => void;
    } = $props();
    let pestana = $state<'general' | 'opiniones' | 'fotos'>('general');
    let guardado = $state(false);
    let listo = $state(false);
    let ocupado = $state(false);
    let mensaje = $state('');
    let buscar = $state('');
    let orden = $state('recientes');
    let expandida = $state(false);
    let opinionExpandida = $state<number[]>([]);
    const distribucion = $derived([5, 4, 3, 2, 1].map((estrellas) => ({ estrellas, cantidad: detalle.comentarios.filter((c) => c.calificacion === estrellas).length })));
    const lugar = $derived(detalle.lugar);
    const portada = $derived(lugar.recursos?.find((r) => r.tipo === 'IMAGEN'));
    const opiniones = $derived([...detalle.comentarios]
        .filter((c) => `${c.usuario.nombres} ${c.texto ?? ''}`.toLocaleLowerCase('es').includes(buscar.toLocaleLowerCase('es')))
        .sort((a, b) => orden === 'mejores' ? b.calificacion - a.calificacion :
            orden === 'peores' ? a.calificacion - b.calificacion : Date.parse(b.creado_en) - Date.parse(a.creado_en)));
    const sitio = $derived(lugar.sitio_web && /^https?:\/\//i.test(lugar.sitio_web) ? lugar.sitio_web : null);
    const indicaciones = $derived('https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(lugar.latitud + ',' + lugar.longitud));
    const telefono = $derived(lugar.telefono?.replace(/[^+0-9]/g, '') ?? '');
    onMount(() => {
        let activo = true;
        if (turista) {
            enviar<{ favorito: boolean }>(`lugares/${lugar.id}`, 'GET')
                .then((r) => { if (activo) { guardado = r.favorito; listo = true; } })
                .catch(() => { if (activo) mensaje = 'No pudimos consultar tus favoritos.'; });
        }
        return () => { activo = false; };
    });
    async function guardar() {
        ocupado = true;
        mensaje = '';
        try {
            await enviar(`favoritos/${lugar.id}`, guardado ? 'DELETE' : 'PUT');
            guardado = !guardado;
        } catch (e) { mensaje = (e as Error).message; }
        finally { ocupado = false; }
    }
    async function compartir() {
        const url = new URL(`/lugares/${lugar.id}`, window.location.origin).href;
        try {
            if (navigator.share) await navigator.share({ title: lugar.nombre, url });
            else { await navigator.clipboard.writeText(url); mensaje = 'Enlace copiado.'; }
        } catch (e) {
            if ((e as Error).name !== 'AbortError') mensaje = 'Podés compartir el enlace desde la ficha completa.';
        }
    }
</script>


{#snippet icono(nombre: string)}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        {#if nombre === 'ruta'}<path d="m12 3 9 9-9 9-9-9 9-9Z" /><path d="M8 14v-4h7m-3-3 3 3-3 3" />
        {:else if nombre === 'guardar'}<path d="M6 4h12v17l-6-4-6 4V4Z" fill={guardado ? 'currentColor' : 'none'} />
        {:else if nombre === 'compartir'}<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4" />
        {:else if nombre === 'direccion'}<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
        {:else if nombre === 'hora'}<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        {:else if nombre === 'telefono'}<path d="m7 3 3 5-3 3a15 15 0 0 0 6 6l3-3 5 3-1 4C11 22 2 13 3 4l4-1Z" />
        {:else if nombre === 'web'}<circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" />
        {:else if nombre === 'opinion'}<path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5" />
        {:else if nombre === 'cerrar'}<path d="m6 6 12 12M6 18 18 6" />
        {:else}<path d="M7 17 17 7M7 7h10v10" />{/if}
    </svg>
{/snippet}

{#snippet estrellas(valor: number)}
    <span class="cinco-estrellas" role="img" aria-label={`${valor.toFixed(1)} de 5 estrellas`}>
        <span class="base">★★★★★</span>
        <span class="relleno" style:width={`${Math.max(0, Math.min(100, valor * 20))}%`} aria-hidden="true">★★★★★</span>
    </span>
{/snippet}

<div class="ficha-mapa">
    <div class="hero">
        {#if portada}
            <button class="abrir-foto" onclick={() => pestana = 'fotos'} aria-label={`Ver fotos de ${lugar.nombre}`}>
                <img src={`/api/recursos/${portada.id}`} alt={portada.descripcion || lugar.nombre} />
                <span class="ver-fotos">Ver fotos</span>
            </button>
        {:else}<div class="sin-foto">Cerro Largo 360</div>{/if}
        <button class="cerrar" onclick={cerrar} aria-label="Volver a explorar lugares">{@render icono('cerrar')}</button>
    </div>
    <header>
        <h1>{lugar.nombre}</h1>
        {#if detalle.promedio !== null}
            <button class="puntuacion" onclick={() => pestana = 'opiniones'}>
                {Number(detalle.promedio).toFixed(1)} {@render estrellas(Number(detalle.promedio))}
                <span>({detalle.totalValoraciones})</span>
            </button>
        {:else}<p>Sin opiniones todavía</p>{/if}
        <p>{lugar.categoria.nombre} · {lugar.localidad}</p>
    </header>
    <nav class="tabs" aria-label="Secciones del lugar">
        <button aria-pressed={pestana === 'general'} onclick={() => pestana = 'general'}>Descripción general</button>
        <button aria-pressed={pestana === 'opiniones'} onclick={() => pestana = 'opiniones'}>Opiniones</button>
        {#if lugar.recursos?.length}<button aria-pressed={pestana === 'fotos'} onclick={() => pestana = 'fotos'}>Fotos</button>{/if}
    </nav>
    <div class="acciones">
        <a href={indicaciones} target="_blank" rel="noopener noreferrer"><span>{@render icono('ruta')}</span>Cómo llegar</a>
        {#if turista}
            <button disabled={ocupado || !listo} aria-pressed={guardado} onclick={guardar}><span>{@render icono('guardar')}</span>{guardado ? 'Guardado' : 'Guardar'}</button>
        {:else}<a href="/login"><span>{@render icono('guardar')}</span>Guardar</a>{/if}
        <button onclick={compartir}><span>{@render icono('compartir')}</span>Compartir</button>
    </div>
    {#if mensaje}<p class="mensaje" role="status">{mensaje}</p>{/if}
    {#if pestana === 'general'}
        <section class="general">
            {#if lugar.descripcion}
                <div class="acerca">
                    <h2>Acerca de este lugar</h2>
                    <p id="descripcion-lugar" class="descripcion" class:recortada={!expandida && lugar.descripcion.length > 180}>{lugar.descripcion}</p>
                    {#if lugar.descripcion.length > 180}
                        <button class="expandir" aria-expanded={expandida} aria-controls="descripcion-lugar" onclick={() => expandida = !expandida}>{expandida ? 'Mostrar menos' : 'Leer más'}</button>
                    {/if}
                </div>
            {/if}
            {#if lugar.direccion || lugar.horario || lugar.telefono || sitio}
                <div class="contacto" aria-label="Información y contacto">
                    {#if lugar.direccion}
                        <a class="dato" href={indicaciones} target="_blank" rel="noopener noreferrer">
                            <span class="dato-icono">{@render icono('direccion')}</span>
                            <span><small>Dirección</small><strong>{lugar.direccion}</strong></span>
                            <span class="salida">{@render icono('salir')}</span>
                        </a>
                    {/if}
                    {#if lugar.horario}
                        <div class="dato"><span class="dato-icono">{@render icono('hora')}</span><span><small>Horario</small><strong>{lugar.horario}</strong></span></div>
                    {/if}
                    {#if telefono}
                        <a class="dato" href={`tel:${telefono}`}>
                            <span class="dato-icono">{@render icono('telefono')}</span>
                            <span><small>Teléfono</small><strong>{lugar.telefono}</strong></span>
                            <span class="salida">{@render icono('salir')}</span>
                        </a>
                    {/if}
                    {#if sitio}
                        <a class="dato" href={sitio} target="_blank" rel="noopener noreferrer">
                            <span class="dato-icono">{@render icono('web')}</span>
                            <span><small>Sitio web</small><strong>{new URL(sitio).hostname}</strong></span>
                            <span class="salida">{@render icono('salir')}</span>
                        </a>
                    {/if}
                </div>
            {/if}
        </section>
    {/if}
    {#if pestana === 'fotos'}
        <section><Galeria recursos={lugar.recursos ?? []} nombre={lugar.nombre} /></section>
    {:else}
        <section class="opiniones">
            <h2>Resumen de calificaciones</h2>
            {#if detalle.promedio !== null}
                <div class="resumen">
                    <div class="barras" aria-label="Distribución de las opiniones cargadas">
                        {#each distribucion as fila (fila.estrellas)}
                            <div class="barra-fila"><span>{fila.estrellas}</span><div class="barra"><span style:width={`${detalle.comentarios.length ? fila.cantidad / detalle.comentarios.length * 100 : 0}%`}></span></div><span class="cantidad">{fila.cantidad}</span></div>
                        {/each}
                    </div>
                    <div class="nota"><strong>{Number(detalle.promedio).toFixed(1)}</strong>{@render estrellas(Number(detalle.promedio))}<span>{detalle.totalValoraciones} {detalle.totalValoraciones === 1 ? 'opinión' : 'opiniones'}</span></div>
                </div>
                {#if detalle.totalValoraciones > detalle.comentarios.length}<p class="alcance">Las barras corresponden a las últimas {detalle.comentarios.length} opiniones. La nota incluye todas.</p>{/if}
            {:else}<p class="vacio">Todavía no hay calificaciones. Compartí tu experiencia.</p>{/if}
            <a class="escribir" href={`/lugares/${lugar.id}#tu-experiencia`}>{@render icono('opinion')} Escribir una opinión</a>
            {#if detalle.comentarios.length}
                <div class="encabezado-opiniones"><h2>Opiniones</h2><span>{detalle.totalValoraciones}</span></div>
                {#if pestana === 'opiniones'}
                    <label for="buscar-opinion">Buscar en estas opiniones</label>
                    <input id="buscar-opinion" type="search" bind:value={buscar} placeholder="Buscar una opinión" />
                    <label for="orden-opiniones">Ordenar</label>
                    <select id="orden-opiniones" bind:value={orden}><option value="recientes">Más recientes</option><option value="mejores">Mayor calificación</option><option value="peores">Menor calificación</option></select>
                {/if}
                {#each (pestana === 'general' ? detalle.comentarios.slice(0, 3) : opiniones) as opinion (opinion.id)}
                    <article>
                        <div class="autor"><span class="avatar" aria-hidden="true">{opinion.usuario.nombres.trim().slice(0, 1).toLocaleUpperCase('es')}</span><strong>{opinion.usuario.nombres}</strong></div>
                        <div class="opinion-meta">{@render estrellas(opinion.calificacion)}<time datetime={opinion.creado_en}>{new Date(opinion.creado_en).toLocaleDateString('es-UY')}</time></div>
                        {#if opinion.texto}
                            <p id={`opinion-${opinion.id}`} class:recortada={opinion.texto.length > 200 && !opinionExpandida.includes(opinion.id)}>{opinion.texto}</p>
                            {#if opinion.texto.length > 200}<button class="expandir" aria-expanded={opinionExpandida.includes(opinion.id)} aria-controls={`opinion-${opinion.id}`} onclick={() => opinionExpandida = opinionExpandida.includes(opinion.id) ? opinionExpandida.filter((id) => id !== opinion.id) : [...opinionExpandida, opinion.id]}>{opinionExpandida.includes(opinion.id) ? 'Mostrar menos' : 'Leer más'}</button>{/if}
                        {/if}
                    </article>
                {:else}<p>No hay coincidencias.</p>{/each}
                {#if pestana === 'general'}<button class="todas" onclick={() => pestana = 'opiniones'}>Ver opiniones {@render icono('salir')}</button>{/if}
            {/if}
        </section>
    {/if}
    <a class="ver-ficha" href={`/lugares/${lugar.id}`}>Ver ficha completa {@render icono('salir')}</a>
</div>

<style>
    .ficha-mapa { color:#202124; background:#fff; font-family:inherit; border-radius:24px; overflow:clip; }
    .hero { position:relative; background:#e9efed; border-radius:24px 24px 0 0; overflow:hidden; }
    .hero img,.sin-foto { width:100%; height:clamp(300px,42dvh,420px); object-fit:cover; display:block; }
    .abrir-foto { display:block; width:100%; position:relative; text-align:left; }
    .ver-fotos { position:absolute; right:18px; bottom:18px; background:#fff; color:#303d37; border-radius:20px; padding:7px 15px; font-size:12px; font-weight:600; box-shadow:0 2px 10px #0002; }
    .sin-foto { display:grid; place-items:center; color:#285c46; }
    .cerrar { position:absolute; right:16px; top:16px; width:44px; height:44px; display:grid; place-items:center; background:#fffe; border-radius:50%; box-shadow:0 2px 12px #0002; }
    svg { width:21px; height:21px; flex-shrink:0; }
    header { padding:24px 24px 15px; }
    h1 { font-size:27px; line-height:1.25; font-weight:550; margin:0 0 10px; letter-spacing:-.6px; }
    p { margin:8px 0; line-height:1.65; font-size:14px; }
    header p,.puntuacion > span:last-child,.alcance,time { color:#68716c; font-size:12px; }
    .puntuacion { display:flex; align-items:center; gap:8px; min-height:30px; font-size:14px; }
    .cinco-estrellas { display:inline-block; position:relative; font-size:17px; line-height:1.3; letter-spacing:1px; white-space:nowrap; }
    .base { color:#d9ddda; }
    .relleno { position:absolute; left:0; top:0; overflow:hidden; color:#e6a100; }
    .tabs { display:flex; border-bottom:1px solid #e6e9e7; padding:0 16px; position:sticky; top:0; background:#fffffff5; z-index:1; }
    .tabs button { flex:1; min-height:54px; font-size:12px; border-bottom:3px solid transparent; }
    .tabs button[aria-pressed=true] { color:#087e8b; border-bottom-color:#087e8b; font-weight:600; }
    .acciones { display:flex; justify-content:space-evenly; padding:20px 12px; gap:10px; }
    .acciones a,.acciones button { display:flex; flex-direction:column; align-items:center; gap:9px; font-size:12px; color:#086977; text-align:center; }
    .acciones > a > span,.acciones > button > span { display:grid; place-items:center; width:46px; height:46px; border-radius:50%; background:#e2f4f4; transition:background .15s; }
    .acciones a:first-child > span { background:#087e8b; color:white; }
    .acciones button[aria-pressed=true] > span { background:#cdebe0; color:#24614b; }
    button { cursor:pointer; }
    button:disabled { opacity:.5; cursor:wait; }
    button:focus-visible,a:focus-visible { outline:2px solid #087e8b; outline-offset:3px; }
    section { padding:22px 24px; }
    .general { padding-top:8px; }
    .acerca { margin-bottom:22px; }
    .recortada { display:-webkit-box; line-clamp:3; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
    .expandir { color:#087e8b; font-size:13px; font-weight:600; min-height:36px; }
    .contacto { border:1px solid #e0e7e3; border-radius:18px; overflow:hidden; background:#f8faf9; }
    .dato { display:flex; align-items:center; gap:14px; padding:17px 16px; border-bottom:1px solid #e5ebe7; }
    .dato:last-child { border-bottom:0; }
    a.dato:hover { background:#edf4f0; }
    .dato-icono { color:#2b7665; display:flex; }
    .dato > span:nth-child(2) { flex:1; min-width:0; }
    .dato small { display:block; font-size:11px; color:#68766f; margin-bottom:3px; }
    .dato strong { font-size:13px; font-weight:450; overflow-wrap:anywhere; }
    .salida { color:#83928a; display:flex; }
    .salida svg { width:17px; height:17px; }
    h2 { font-size:17px; font-weight:550; margin:0 0 12px; letter-spacing:-.2px; }
    .opiniones { border-top:7px solid #f2f5f3; }
    .resumen { display:flex; align-items:center; gap:25px; margin:22px 0; }
    .barras { flex:1; display:grid; gap:7px; }
    .barra-fila { display:flex; align-items:center; gap:9px; font-size:11px; color:#647168; }
    .barra { flex:1; background:#edf0ed; height:8px; border-radius:8px; overflow:hidden; }
    .barra span { display:block; height:100%; background:#f3b600; border-radius:8px; }
    .cantidad { min-width:14px; text-align:right; }
    .nota { display:flex; flex-direction:column; align-items:center; min-width:110px; gap:5px; }
    .nota strong { font-size:46px; font-weight:400; line-height:1; }
    .nota > span:last-child { font-size:12px; color:#087e8b; }
    .escribir,.todas { display:flex; justify-content:center; align-items:center; gap:9px; border:1px solid #d5e9e5; border-radius:25px; padding:12px 16px; color:#086977; font-size:13px; font-weight:550; }
    .escribir { background:#edf8f6; }
    .encabezado-opiniones { display:flex; align-items:center; justify-content:space-between; margin-top:30px; }
    .encabezado-opiniones span { color:#647168; font-size:12px; }
    label { display:block; font-size:12px; color:#5f6368; margin:12px 0 5px; }
    input,select { width:100%; min-height:44px; border:1px solid #dadce0; border-radius:22px; padding:8px 14px; }
    article { border-bottom:1px solid #edf0ed; padding:20px 0; font-size:14px; }
    .autor { display:flex; align-items:center; gap:11px; }
    .autor strong { font-size:13px; font-weight:550; }
    .avatar { display:grid; place-items:center; width:34px; height:34px; border-radius:50%; background:#e0ebe4; color:#32644c; font-size:14px; }
    .opinion-meta { display:flex; align-items:center; gap:12px; margin-top:10px; flex-wrap:wrap; }
    .todas { width:100%; margin-top:18px; }
    .ver-ficha { display:flex; justify-content:space-between; align-items:center; margin:0 24px; padding:20px 0 28px; color:#087e8b; font-size:13px; }
    .mensaje { padding:8px 24px; font-size:13px; }
    .vacio { color:#68716c; margin-bottom:18px; }
    @media (max-width:400px) { header,section { padding-left:18px; padding-right:18px; } .resumen { gap:14px; } .nota { min-width:94px; } }
</style>
