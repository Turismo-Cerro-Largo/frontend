<script>
    import { Bed, ForkKnife, MusicNotes, Tree, CaretRight, Book } from 'phosphor-svelte';

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

<section class="w-full py-2 sm:py-8 lg:py-10">
    <div
        class="
            categories-scroll
            flex gap-2.5
            overflow-x-auto
            snap-x snap-mandatory
            px-4

            sm:px-6

            lg:max-w-6xl
            lg:mx-auto
            lg:px-8
            lg:grid
            lg:grid-cols-5
            lg:gap-3
            lg:overflow-visible
            lg:snap-none
        "
    >
        {#each categories as category}
            {@const Icon = category.icon}

            <a
                href={category.href}
                class="
                    group
                    flex
                    min-w-42.5
                    h-14.5
                    shrink-0
                    snap-start
                    items-center
                    gap-2.5

                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-3

                    font-poppins
                    shadow-sm

                    transition-all
                    duration-200

                    hover:border-sky-300
                    hover:shadow-md

                    sm:min-w-47.5
                    sm:h-16
                    sm:px-4

                    lg:min-w-0
                    lg:w-full
                    lg:h-18
                "
            >
                <div
                    class="
                        flex
                        size-8
                        shrink-0
                        items-center
                        justify-center
                        text-sky-500

                        sm:size-9
                        lg:size-10
                    "
                >
                    <Icon size={25} weight="duotone" class="sm:size-7! lg:size-7.5!" />
                </div>

                <span
                    class="
                        min-w-0
                        flex-1
                        text-[12px]
                        font-semibold
                        leading-tight
                        text-slate-700

                        sm:text-[13px]
                        lg:text-sm

                        group-hover:text-sky-500
                        transition-colors
                    "
                >
                    {category.label}
                </span>

                <CaretRight
                    size={16}
                    weight="bold"
                    class="
                        shrink-0
                        text-sky-500
                        transition-transform
                        duration-200
                        group-hover:translate-x-0.5
                    "
                />
            </a>
        {/each}
    </div>
</section>

<style>
    .categories-scroll {
        scrollbar-width: none;
        -ms-overflow-style: none;
        -webkit-overflow-scrolling: touch;
    }

    .categories-scroll::-webkit-scrollbar {
        display: none;
    }
</style>
