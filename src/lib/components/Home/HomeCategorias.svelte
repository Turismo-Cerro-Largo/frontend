<script>
    import { Bed, ForkKnife, MusicNotes, Tree, Book } from 'phosphor-svelte';
    import { sectionTight, container } from '$lib/styles/tokens';

    const categories = [
        { label: 'Alojamiento', href: '/alojamiento', icon: Bed },
        { label: 'Restaurantes', href: '/restaurantes', icon: ForkKnife },
        { label: 'Cultura', href: '/cultura', icon: Book },
        { label: 'Eventos sociales', href: '/eventos', icon: MusicNotes },
        { label: 'Parques / Naturaleza', href: '/naturaleza', icon: Tree },
    ];
</script>

<section class={sectionTight}>
    <div
        class="
            {container}
            flex flex-wrap justify-center gap-2
            md:justify-normal md:gap-3
            lg:grid lg:grid-cols-5
        "
    >
        {#each categories as category}
            {@const Icon = category.icon}
            <a
                href={category.href}
                class="
                    group flex h-10 w-auto items-center gap-1.5
                    rounded-lg border border-zinc-200 bg-white px-2.5
                    font-Poppins shadow-sm
                    transition-all duration-200
                    hover:border-amber-400 hover:shadow-md

                    sm:h-11 sm:gap-2 sm:px-3

                    lg:h-18 lg:w-full lg:gap-3 lg:px-4
                "
            >
                <Icon size={19} weight="duotone" class="shrink-0 text-zinc-700 transition-colors group-hover:text-amber-500 sm:size-5.5! lg:size-7!" />
                <span
                    class="
                        whitespace-nowrap text-[10.5px] font-semibold leading-none text-zinc-700
                        transition-colors group-hover:text-amber-600

                        sm:text-xs lg:text-sm
                    "
                >
                    {category.label}
                </span>
            </a>
        {/each}
    </div>
</section>
