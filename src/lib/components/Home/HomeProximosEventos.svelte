<script>
    import { container, section, h2 } from '$lib/styles/tokens';

    const eventos_proximos = [
        {
            link: '',
            img: 'https://files.catbox.moe/fjw1jn.jpg',
        },
        {
            link: '',
            img: 'https://files.catbox.moe/6bjjqx.jpg',
        },
        {
            link: '',
            img: 'https://files.catbox.moe/dittyx.jpg',
        },
    ];
</script>

<section class={section}>
    <div class={container}>
        <h2 class="{h2} mb-6">Próximos eventos</h2>

        <div
            class="
                flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide

                lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:snap-none
            "
        >
            {#each eventos_proximos as evento}
                <a href={evento.link} class="w-[85%] flex-none snap-start lg:w-auto lg:snap-none">
                    <img src={evento.img} loading="lazy" alt="Evento" class="aspect-4/5 w-full rounded-xl object-cover transition-transform duration-300 hover:scale-[1.02]" />
                </a>
            {/each}
        </div>
    </div>
</section>
