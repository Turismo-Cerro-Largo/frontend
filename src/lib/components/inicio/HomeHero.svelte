<script lang="ts">
    import { onMount } from 'svelte';
    import { sineInOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';

    let contador: number = $state(0);
    let hero: HTMLElement;
    let pausado = $state(false);
    let visible = $state(false);
    let documentoVisible = $state(true);
    let movimientoReducido = $state(false);
    onMount(() => {
        const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)');
        const actualizarPreferencia = () => movimientoReducido = preferencia.matches;
        const actualizarVisibilidad = () => documentoVisible = document.visibilityState === 'visible';
        actualizarPreferencia();
        actualizarVisibilidad();
        const observador = new IntersectionObserver(([entrada]) => visible = entrada.isIntersecting, { threshold: .05 });
        observador.observe(hero);
        preferencia.addEventListener('change', actualizarPreferencia);
        document.addEventListener('visibilitychange', actualizarVisibilidad);
        return () => {
            observador.disconnect();
            preferencia.removeEventListener('change', actualizarPreferencia);
            document.removeEventListener('visibilitychange', actualizarVisibilidad);
        };
    });
    export const slides = [
        { src: 'https://ladiaria.com.uy/media/photologue/photos/cache/paisaje_opt_schema_image.jpeg', destino: 'Centurion' },
        { src: 'https://cfluna.com/darkolighting.com.uy/cdn/files/tmp/compressed/normal/mccxxqfho7eqcg9w9u4s.jpg', destino: 'Río Branco' },
        { src: 'https://www.lavozdemelo.com.uy/wp-content/uploads/2026/10/WhatsApp-Image-2026-10-29-at-21.04.29.jpeg', destino: 'Melo' },
        { src: 'https://www.lavozdemelo.com.uy/wp-content/uploads/2024/01/lago-merin-laguna-merin-aerea.jpg', destino: 'Laguna Merin' },
    ];

    $effect(() => {
        if (pausado || !visible || !documentoVisible || movimientoReducido) return;
        const intervalo = setInterval(() => {
            contador = (contador + 1) % slides.length;
        }, 6000);

        return () => clearInterval(intervalo);
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://ladiaria.com.uy" />
    <link rel="preload" as="image" href={slides[0].src} fetchpriority="high" />
</svelte:head>

<section bind:this={hero} class="relative h-[65svh] min-h-125 w-full overflow-hidden bg-black md:h-[calc(100svh-80px)] md:min-h-162.5">
    {#key contador}
        <img decoding="async"
            src={slides[contador].src}
            alt={slides[contador].destino}
            loading="eager"
            fetchpriority={contador === 0 ? 'high' : 'auto'}
            class="absolute inset-0 h-full w-full object-cover animate-kenburns"
            class:animacionActiva={!pausado && visible && documentoVisible && !movimientoReducido}
            in:fade={{ duration: movimientoReducido ? 0 : 400, easing: sineInOut }}
            out:fade={{ duration: movimientoReducido ? 0 : 300, easing: sineInOut }}
        />
    {/key}

    <div class="pointer-events-none absolute inset-0 z-1 bg-black/10"></div>
    <div class="pointer-events-none absolute inset-0 z-2 bg-linear-to-r from-black/55 via-black/15 to-transparent"></div>
    <div class="pointer-events-none absolute inset-0 z-2 bg-linear-to-t from-black/35 via-transparent to-transparent"></div>

    <div class="absolute inset-0 z-10 flex items-center">
        <div class="ml-[7vw] mt-[4vh] text-white">
            <h1 class="flex flex-col font-serif font-normal leading-[0.88] tracking-[-0.045em] drop-shadow-[0_3px_15px_rgba(0,0,0,0.25)]">
                <span class="text-[clamp(2.6rem,6vw,7.5rem)]">Disfruta del turismo</span>
                <span class="mt-2 text-[clamp(3rem,7vw,8.5rem)]">En Cerro Largo</span>
            </h1>
        </div>
    </div>

    <div class="absolute right-6 bottom-6 z-20 text-right text-white md:right-12 md:bottom-10">
        {#key contador}
            <div class="flex items-center justify-end gap-3" in:fade={{ duration: 1500, easing: sineInOut, delay: 250 }} out:fade={{ duration: 800, easing: sineInOut }}>
                <span class="hidden h-px w-10 bg-white/80 sm:block md:w-16"></span>
                <span class="font-Poppins text-sm font-medium tracking-[0.08em] drop-shadow-md md:text-lg">
                    {slides[contador].destino}
                </span>
            </div>
        {/key}
    </div>

    <div class="absolute bottom-6 left-6 z-20 flex items-baseline gap-2 text-white md:bottom-10 md:left-12">
        <span class="text-lg font-medium text-white/80 md:text-2xl">
            {String(contador + 1).padStart(2, '0')}
        </span>
        <span class="text-xs text-white/60"> / </span>
        <span class="text-xs text-white/60">
            {String(slides.length).padStart(2, '0')}
        </span>
    </div>
    <button type="button" class="absolute bottom-5 left-1/2 z-20 grid size-11 -translate-x-1/2 place-items-center rounded-full border border-white/50 bg-black/35 text-white focus-visible:outline-white md:bottom-9" aria-label={pausado ? 'Reanudar carrusel' : 'Pausar carrusel'} aria-pressed={pausado} onclick={() => pausado = !pausado}>
        <svg viewBox="0 0 24 24" fill="currentColor" class="size-4" aria-hidden="true">{#if pausado}<path d="m8 5 11 7-11 7z" />{:else}<path d="M6 5h4v14H6zm8 0h4v14h-4z" />{/if}</svg>
    </button>
</section>

<style>
    @keyframes kenburns {
        from {
            transform: scale(1.02);
        }
        to {
            transform: scale(1.1);
        }
    }

    .animate-kenburns {
        animation: kenburns 6.5s ease-out forwards;
        animation-play-state: paused;
    }
    .animacionActiva {
        animation-play-state: running;
        will-change: transform;
    }
    @media (prefers-reduced-motion: reduce) { .animate-kenburns { animation: none; } }
</style>
