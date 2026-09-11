<script lang="ts">
    import { slides } from '$lib/constants/constants';
    import { sineInOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';

    let contador: number = $state(0);

    $effect(() => {
        const intervalo = setInterval(() => {
            contador = (contador + 1) % slides.length;
        }, 6000);

        return () => clearInterval(intervalo);
    });
</script>

<section
    class="
        relative
        w-full
        h-[65svh]
        min-h-125
        md:h-[calc(100svh-80px)]
        md:min-h-162.5
        overflow-hidden
        bg-black
    "
>
    {#key contador}
        <img
            src={slides[contador].src}
            alt={slides[contador].destino}
            loading={contador === 0 ? 'eager' : 'lazy'}
            fetchpriority={contador === 0 ? 'high' : 'auto'}
            class="
                absolute inset-0
                h-full w-full
                object-cover
                animate-kenburns
            "
            in:fade={{
                duration: 1800,
                easing: sineInOut,
            }}
            out:fade={{
                duration: 1200,
                easing: sineInOut,
            }}
        />
    {/key}

    <div
        class="
            pointer-events-none
            absolute inset-0
            z-1
            bg-black/10
        "
    ></div>

    <div
        class="
            pointer-events-none
            absolute inset-0
            z-2
            bg-linear-to-r
            from-black/55
            via-black/15
            to-transparent
        "
    ></div>

    <div
        class="
            pointer-events-none
            absolute inset-0
            z-2
            bg-linear-to-t
            from-black/35
            via-transparent
            to-transparent
        "
    ></div>

    <div
        class="
            absolute
            inset-0
            z-10
            flex
            items-center
        "
    >
        <div
            class="
                ml-[7vw]
                mt-[4vh]
                text-white
            "
        >
            <h1
                class="
                    flex
                    flex-col
                    font-serif
                    font-normal
                    leading-[0.88]
                    tracking-[-0.045em]
                    drop-shadow-[0_3px_15px_rgba(0,0,0,0.25)]
                "
            >
                <span
                    class="
                        text-[clamp(2.6rem,6vw,7.5rem)]
                    "
                >
                    Disfruta del turismo
                </span>

                <span
                    class="
                        mt-2
                        text-[clamp(3rem,7vw,8.5rem)]
                    "
                >
                    En Cerro Largo
                </span>
            </h1>
        </div>
    </div>

    <div
        class="
            absolute
            bottom-6 right-6
            md:bottom-10 md:right-12
            z-20
            text-right
            text-white
        "
    >
        {#key contador}
            <div
                class="flex items-center justify-end gap-3"
                in:fade={{
                    duration: 1500,
                    easing: sineInOut,
                    delay: 250,
                }}
                out:fade={{
                    duration: 800,
                    easing: sineInOut,
                }}
            >
                <span
                    class="
                        hidden sm:block
                        h-px w-10 md:w-16
                        bg-white/80
                    "
                ></span>

                <span
                    class="
                        font-Poppins
                        text-sm
                        font-medium
                        tracking-[0.08em]
                        md:text-lg
                        drop-shadow-md
                    "
                >
                    {slides[contador].destino}
                </span>
            </div>
        {/key}
    </div>

    <div class=" absolute bottom-6 left-6 md:bottom-10 md:left-12 z-20 flex items-baseline gap-2text-white">
        <span class="text-lg md:text-2xl font-medium text-white/80">
            {String(contador + 1).padStart(2, '0')}
        </span>

        <span class="text-xs text-white/60"> / </span>

        <span class="text-xs text-white/60">
            {String(slides.length).padStart(2, '0')}
        </span>
    </div>
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
        will-change: transform;
    }
</style>
