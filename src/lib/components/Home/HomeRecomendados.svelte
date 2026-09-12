<script lang="ts">
    import { container, section, h2, cardInteractive } from '$lib/styles/tokens';

    const datos = [
        {
            icono: 'https://instagram.fmvd4-1.fna.fbcdn.net/v/t51.82787-19/639451170_18509176018076490_7668569125813805903_n.jpg?...',
            name: 'Silvia Techera',
            link: 'https://www.instagram.com/silviatecheraoficial',
        },
        {
            icono: 'https://i.ibb.co/CK2BpGKj/557472232-18092648545776934-1231051150075288602-n.jpg',
            name: 'Cerro Largo al Día',
            link: 'https://www.instagram.com/cerrolargoaldia',
        },
        {
            icono: 'https://i.ibb.co/JwD8HzxF/images.jpg',
            name: 'Cerro Largo Portal',
            link: 'https://www.instagram.com/cerrolargoportal',
        },
    ];
</script>

<section class={section}>
    <div class={container}>
        <h2 class="{h2} mb-6">Páginas sugeridas</h2>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each datos as dato}
                <a href={dato.link} target="_blank" rel="noopener noreferrer" class="{cardInteractive} group flex items-center gap-4 p-4">
                    <img src={dato.icono} alt={dato.name} loading="lazy" class="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-zinc-100" />

                    <div class="min-w-0 flex-1">
                        <h3 class="truncate font-medium text-zinc-900">{dato.name}</h3>
                        <p class="mt-0.5 text-[13px] text-zinc-500">Ver en Instagram</p>
                    </div>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        class="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6" />
                    </svg>
                </a>
            {/each}
        </div>
    </div>
</section>
