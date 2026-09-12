<script lang="ts">
    import { isMobile } from '$lib/hooks/isMobile.svelte';
    import { container, section, h2 } from '$lib/styles/tokens';

    const mobile = isMobile();

    const localidades = [
        { id: 'Melo', nombre: 'Melo', img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/01-12.jpg', grande: true, desktop: 'md:col-start-1 md:row-start-1' },
        {
            id: 'Rio-Branco',
            nombre: 'Río Branco',
            img: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/PUENTE-1024x717-1.png',
            grande: false,
            desktop: 'md:col-start-3 md:row-start-1',
        },
        {
            id: 'Centurion',
            nombre: 'Centurión',
            img: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/PAASO-CENTURION-2-1-600x400.jpg',
            grande: false,
            desktop: 'md:col-start-4 md:row-start-1',
        },
        {
            id: 'Tupambae',
            nombre: 'Tupambaé',
            img: 'https://destinocerrolargo.uy/wp-content/uploads/2024/08/cueva_murcielagos1-780x470.jpg',
            grande: false,
            desktop: 'md:col-start-3 md:row-start-2',
        },
        { id: 'Acegua', nombre: 'Aceguá', img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/04-11.jpg', grande: false, desktop: 'md:col-start-4 md:row-start-2' },
        {
            id: 'Laguna-Merin',
            nombre: 'Laguna Merín',
            img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/05-11.jpg',
            grande: true,
            desktop: 'md:col-start-3 md:row-start-3',
        },
        {
            id: 'Fraile-Muerto',
            nombre: 'Fraile Muerto',
            img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/01-12.jpg',
            grande: false,
            desktop: 'md:col-start-1 md:row-start-3',
        },
        {
            id: 'Isidoro-Noblia',
            nombre: 'Isidoro Noblía',
            img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/04-11.jpg',
            grande: false,
            desktop: 'md:col-start-2 md:row-start-3',
        },
        { id: 'Arevalo', nombre: 'Arévalo', img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/05-11.jpg', grande: false, desktop: 'md:col-start-1 md:row-start-4' },
        {
            id: 'Placido-Rosas',
            nombre: 'Plácido Rosas',
            img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/01-12.jpg',
            grande: false,
            desktop: 'md:col-start-2 md:row-start-4',
        },
    ];

    let visibles = $derived(mobile.current ? localidades.slice(0, 5) : localidades);
</script>

<section class={section}>
    <div class={container}>
        <div class="mb-6 flex flex-col gap-2 md:mb-8">
            <h2 class={h2}>Recorré Cerro Largo</h2>
        </div>

        <div
            class="
                grid grid-cols-2 grid-flow-dense auto-rows-36 gap-2.5

                md:grid-cols-4 md:auto-rows-42.5 md:gap-3
                lg:auto-rows-47.5
            "
        >
            {#each visibles as loc (loc.id)}
                <a
                    href="/localidades/{loc.id}"
                    class="
                        group relative block overflow-hidden rounded-xl bg-zinc-100

                        {loc.grande ? 'col-span-2 row-span-2' : ''}
                        {loc.desktop}
                    "
                >
                    <img
                        src={loc.img}
                        alt={loc.nombre}
                        loading="lazy"
                        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    <div class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent"></div>
                    <span class="absolute bottom-0 left-0 w-full p-3 text-[13px] font-medium text-white drop-shadow-sm md:p-4 md:text-[15px]">
                        {loc.nombre}
                    </span>
                </a>
            {/each}
        </div>

        {#if mobile.current}
            <a href="/localidades" class="mt-4 flex items-center justify-center gap-1.5 text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-900 md:hidden">
                Ver todas las localidades
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12H19" />
                    <path d="M14 7L19 12L14 17" />
                </svg>
            </a>
        {/if}
    </div>
</section>
