<script>
    import { eventos_proximos } from '$lib/constants/constants';
</script>

<section class="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
    <h2 class="text-3xl font-serif mb-6">Próximos eventos</h2>

    <div
        class="flex gap-4
            overflow-x-auto
            snap-x snap-mandatory
            scroll-smooth
            lg:grid lg:grid-cols-3
            lg:overflow-visible
            lg:snap-none
            scrollbar-hide
        "
    >
        {#each eventos_proximos as evento}
            <a href={evento.link} class="flex-none w-[85%] snap-start lg:w-auto lg:snap-none">
                <img src={evento.img} loading="lazy" alt="Evento 1" class="w-full aspect-4/5 object-cover hover:scale-101 transition-transform duration-300" />
            </a>
        {/each}
    </div>
</section>
