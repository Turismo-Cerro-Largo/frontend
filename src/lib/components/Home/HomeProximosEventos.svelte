<script lang="ts">
    import { container, section, h2 } from '$lib/styles/tokens';
    import { rangoEvento, type EventoPublico } from '$lib/types/agenda';

    let { eventos, error }: { eventos: EventoPublico[]; error: boolean } = $props();
</script>

<section class={section}>
    <div class={container}>
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 class={h2}>Próximos eventos</h2>
            <a href="/eventos" class="inline-flex items-center gap-2 rounded-xl bg-[#2f6d50] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#24573f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6d50]">
                Ver todos los eventos <span aria-hidden="true">→</span>
            </a>
        </div>

        {#if eventos.length}
            <div
                class="
                    flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide
                    lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:snap-none
                "
            >
                {#each eventos as evento (evento.id)}
                    {@const imagen = evento.recursos.find((recurso) => recurso.tipo === 'IMAGEN')}
                    <a href={'/eventos/' + evento.id} aria-label={'Ver ' + evento.titulo} class="event-card group relative block w-[85%] flex-none snap-start overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#477967] lg:w-auto lg:snap-none">
                        {#if imagen}
                            <img src={imagen.uri ?? '/api/recursos/' + imagen.id} loading="lazy" alt={'Afiche de ' + evento.titulo} class="aspect-4/5 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]" />
                            <span class="poster-caption pointer-events-none absolute inset-x-0 bottom-0 flex min-h-[38%] flex-col justify-end bg-gradient-to-t from-[#10291f]/95 via-[#10291f]/65 to-transparent px-5 pb-6 pt-12 text-white">
                                <span class="text-xs font-medium text-white/85">{rangoEvento(evento)}</span>
                                <span class="mt-1 font-serif text-xl leading-snug sm:text-2xl">{evento.titulo}</span>
                            </span>
                        {:else}
                            <div class="flex aspect-4/5 flex-col justify-end rounded-xl bg-[#e7eee6] p-6 text-[#274534] transition-transform duration-300 hover:scale-[1.02]">
                                <span class="text-sm">{rangoEvento(evento)}</span>
                                <span class="mt-3 font-serif text-2xl">{evento.titulo}</span>
                            </div>
                        {/if}
                    </a>
                {/each}
            </div>
        {:else}
            <p class="text-sm text-slate-600">{error ? 'No pudimos cargar los eventos por ahora.' : 'Todavía no hay eventos próximos publicados.'}</p>
        {/if}
    </div>
</section>
<style>
    .poster-caption { opacity: 0; transform: translateY(12px); transition: opacity .3s ease, transform .3s ease; }
    .event-card:hover .poster-caption, .event-card:focus-visible .poster-caption { opacity: 1; transform: translateY(0); }
    @media (hover: none) { .poster-caption { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .poster-caption { transition: none; } }
</style>