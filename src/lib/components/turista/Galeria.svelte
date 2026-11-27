<script lang="ts">
    import type { Medio } from '#lib/types/agenda.ts';
    import ImagenAmpliable from './ImagenAmpliable.svelte';
    import { rotacionCarrusel } from '#lib/actions/rotacion-carrusel.ts';
    let { recursos, nombre, prioritaria = false, ampliar = true, formato = 'galeria' }: {
        recursos: Medio[]; nombre: string; prioritaria?: boolean; ampliar?: boolean; formato?: 'galeria' | 'tarjeta' | 'portada';
    } = $props();
    let pista = $state<HTMLDivElement>();
    let posicion = $state(0);
    let anunciado = $state(0);
    let pendiente = $state<number | null>(null);
    let pausada = $state(false);
    const actual = $derived(Math.min(pendiente ?? posicion, Math.max(0, recursos.length - 1)));
    const primeraImagen = $derived(recursos.find(recurso => recurso.tipo === 'IMAGEN')?.id);
    function ir(indice: number) {
        if (!pista || !recursos.length) return;
        const destino = (indice + recursos.length) % recursos.length;
        pendiente = destino;
        const figura = pista.children[destino] as HTMLElement;
        pista.scrollTo({ left: figura.offsetLeft - (pista.children[0] as HTMLElement).offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
    function actualizar() {
        if (!pista) return;
        const siguiente = Math.max(0, Math.min(recursos.length - 1, Math.round(pista.scrollLeft / (pista.clientWidth || 1))));
        if (siguiente === posicion) return;
        posicion = siguiente;
        for (const video of pista.querySelectorAll('video')) {
            if (video.closest('figure') !== pista.children[posicion]) video.pause();
        }
    }
    function terminar() { actualizar(); anunciado = posicion; pendiente = null; }
    function seguimiento(nodo: HTMLDivElement) {
        let demora: ReturnType<typeof setTimeout>;
        const nativo = 'onscrollend' in nodo;
        function scroll() {
            actualizar();
            if (!nativo) { clearTimeout(demora); demora = setTimeout(terminar, 150); }
        }
        nodo.addEventListener('scroll', scroll, { passive: true });
        if (nativo) nodo.addEventListener('scrollend', terminar);
        return { destroy() { clearTimeout(demora); nodo.removeEventListener('scroll', scroll); nodo.removeEventListener('scrollend', terminar); } };
    }
</script>

{#if recursos.length}
    <section use:rotacionCarrusel={{ avanzar: () => ir(actual + 1), pausada: () => pausada, total: recursos.length, reducirMovimiento: () => pausada = true }} aria-label={`Fotos y videos de ${nombre}`} aria-roledescription="carrusel" class="galeria" class:tarjeta={formato === 'tarjeta'} class:portada={formato === 'portada'}>
        <div class="media" class:video={recursos[actual]?.tipo === 'VIDEO'}>
        <div class="pista" bind:this={pista} use:seguimiento role="group" aria-label="Imágenes y videos disponibles">
            {#each recursos as recurso, indice (recurso.id)}
                <figure role="group" aria-roledescription="diapositiva" aria-label={`${indice + 1} de ${recursos.length}`}>
                    {#if recurso.tipo === 'IMAGEN'}
                        {#if ampliar}
                            <ImagenAmpliable src={`/api/recursos/${recurso.id}`} alt={recurso.descripcion || nombre} loading={prioritaria && recurso.id === primeraImagen ? 'eager' : 'lazy'} fetchpriority={prioritaria && recurso.id === primeraImagen ? 'high' : 'auto'} />
                        {:else}
                            <a href={`/api/recursos/${recurso.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar imagen de ${nombre}`}><img decoding="async" src={`/api/recursos/${recurso.id}`} alt={recurso.descripcion || nombre} loading="lazy" /></a>
                        {/if}
                    {:else}
                        <video controls muted playsinline preload="none" poster={primeraImagen ? `/api/recursos/${primeraImagen}` : undefined} aria-label={recurso.descripcion || `Video de ${nombre}`} src={`/api/recursos/${recurso.id}`}>Tu navegador no permite reproducir este video.</video>
                    {/if}
                </figure>
            {/each}
        </div>
        {#if recursos.length > 1}
            <div class="controles">
                <button type="button" onclick={() => ir(actual - 1)} aria-label={`Recurso anterior de ${nombre}`}><span aria-hidden="true">‹</span></button>
                <span class="contador">{actual + 1} / {recursos.length}</span>
                <button class="pausa" type="button" onclick={() => pausada = !pausada} aria-label={pausada ? `Reanudar carrusel de ${nombre}` : `Pausar carrusel de ${nombre}`} aria-pressed={pausada}>
                    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">{#if pausada}<path d="m8 5 11 7-11 7Z" />{:else}<path d="M6 5h4v14H6zm8 0h4v14h-4z" />{/if}</svg>
                </button>
                <button type="button" onclick={() => ir(actual + 1)} aria-label={`Recurso siguiente de ${nombre}`}><span aria-hidden="true">›</span></button>
            </div>
            <p class="sr-only" role="status" aria-live={pausada ? 'polite' : 'off'}>Recurso {anunciado + 1} de {recursos.length}</p>
            <div class="indicadores" role="group" aria-label="Elegir recurso">
                {#each recursos as recurso, indice (recurso.id)}
                    <button type="button" aria-label={`Ver recurso ${indice + 1} de ${nombre}`} aria-current={actual === indice ? 'true' : undefined} onclick={() => ir(indice)}><span></span></button>
                {/each}
            </div>
        {/if}
        </div>
        {#if formato === 'galeria' && recursos[actual]?.descripcion}<p class="descripcion">{recursos[actual].descripcion}</p>{/if}
    </section>
{/if}

<style>
    .galeria { min-width:0;overflow:hidden;border:1px solid #dfe6df;border-radius:16px;background:white;margin:24px 0 32px; }
    .media { position:relative; }
    .pista { display:flex;position:relative;height:300px;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:none;touch-action:pan-x pan-y pinch-zoom; }
    .pista::-webkit-scrollbar { display:none; }
    figure { flex:0 0 100%;min-width:0;height:100%;margin:0;scroll-snap-align:center; }
    .pista :global(.miniatura) { height:100%; }
    .pista :global(.miniatura img) { height:100%;max-height:none; }
    img,video { display:block;width:100%;height:300px;object-fit:contain;background:#edf1eb; }
    .descripcion { margin:0;padding:12px 16px;font-size:12px;color:#59685f; }
    .controles { position:absolute;left:50%;bottom:25px;transform:translateX(-50%);display:flex;justify-content:center;align-items:center;gap:2px;padding:0 4px;border-radius:30px;background:#14231bd9;color:white;box-shadow:0 2px 10px #0002; }
    .controles button { display:grid;place-items:center;width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:inherit;font-size:26px;cursor:pointer;touch-action:manipulation; }
    .controles button:hover { background:#ffffff20; }
    .contador { min-width:42px;text-align:center;font-size:11px;font-variant-numeric:tabular-nums;color:white; }
    .indicadores { position:absolute;bottom:2px;left:50%;transform:translateX(-50%);display:flex;max-width:90%;overflow-x:auto;scrollbar-width:none; }
    .indicadores::-webkit-scrollbar { display:none; }
    .media.video .controles { bottom:60px; }
    .media.video .indicadores { bottom:36px; }
    .indicadores button { display:grid;place-items:center;width:24px;height:24px;background:transparent;border:0;cursor:pointer; }
    .indicadores button { flex-shrink:0; }
    .indicadores span { width:6px;height:6px;border-radius:8px;background:#ffffffa0;box-shadow:0 1px 4px #0008; }
    .indicadores button[aria-current=true] span { width:16px;background:white; }
    button:focus-visible,.pista:focus-visible { outline:3px solid #087e8b;outline-offset:-3px; }
    .tarjeta,.portada { margin:0;border:0;border-radius:0; }
    .tarjeta .pista { height:190px; }
    .portada .pista { height:clamp(280px,40dvh,420px); }
    .tarjeta :global(.miniatura img),.tarjeta video { height:190px;max-height:none;object-fit:cover; }
    .portada :global(.miniatura img),.portada video { height:clamp(280px,40dvh,420px);max-height:none;object-fit:cover; }
    @media(prefers-reduced-motion:no-preference) { .pista { scroll-behavior:smooth; } }
    @media(max-width:639px) { .galeria:not(.tarjeta):not(.portada) .pista { height:clamp(240px,70vw,400px); } }
</style>
