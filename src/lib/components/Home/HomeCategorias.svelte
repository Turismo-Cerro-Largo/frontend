<script>
    import { Bed, ForkKnife, MusicNotes, Tree, Book } from 'phosphor-svelte';

    const categories = [
        {
            label: 'Alojamiento',
            href: '/alojamiento',
            icon: Bed,
        },
        {
            label: 'Restaurantes',
            href: '/restaurantes',
            icon: ForkKnife,
        },
        {
            label: 'Cultura',
            href: '/cultura',
            icon: Book,
        },
        {
            label: 'Eventos sociales',
            href: '/eventos',
            icon: MusicNotes,
        },
        {
            label: 'Parques / Naturaleza',
            href: '/naturaleza',
            icon: Tree,
        },
    ];
</script>

<section class="w-full py-2 sm:py-3 lg:py-3">
    <div
        class="
            flex
            flex-wrap
            gap-2
            px-4
            justify-center
            md:justify-normal

            sm:px-6

            lg:mx-auto
            lg:grid
            lg:max-w-6xl
            lg:grid-cols-5
            lg:gap-3
            lg:px-8
        "
    >
        {#each categories as category}
            {@const Icon = category.icon}

            <a
                href={category.href}
                class="
                    group
                    flex
                    h-10
                    w-auto
                    items-center
                    gap-1.5

                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-2.5

                    font-poppins
                    shadow-sm

                    transition-all
                    duration-200

                    hover:border-green-400
                    hover:shadow-md

                    sm:h-11
                    sm:gap-2
                    sm:px-3

                    lg:h-18
                    lg:w-full
                    lg:gap-3
                    lg:px-4
                "
            >
                <Icon
                    size={19}
                    weight="duotone"
                    class="
                        shrink-0
                        border-green-800

                        sm:size-5.5!
                        lg:size-7!
                    "
                />

                <span
                    class="
                        whitespace-nowrap
                        text-[10.5px]
                        font-semibold
                        leading-none
                        text-slate-700

                        transition-colors
                        group-hover:text-green-500

                        sm:text-xs
                        lg:text-sm
                    "
                >
                    {category.label}
                </span>
            </a>
        {/each}
    </div>
</section>
