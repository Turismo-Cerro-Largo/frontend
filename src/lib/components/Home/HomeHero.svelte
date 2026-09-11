<script lang="ts">
    import { sineInOut } from "svelte/easing";
    import { fade } from "svelte/transition";

    let contador: number = $state(0);

    const slides = [
        { src: "https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/01-12.jpg", destino: "Melo" },
        { src: "https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/05-11.jpg", destino: "Río Branco" },
        { src: "https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/04-11.jpg", destino: "Aceguá" },
        { src: "https://destinocerrolargo.uy/wp-content/uploads/2024/08/cueva_murcielagos1-780x470.jpg", destino: "Tupambaé" },
    ];

    $effect(() => {
        const intervalo = setInterval(() => {
            contador = (contador + 1) % slides.length;
        }, 6000);
        return () => clearInterval(intervalo);
    });
</script>

<section class="relative w-full h-[45vh] md:h-[80vh] overflow-hidden bg-slate-900 mx-auto">
    {#key contador}
        <img
            class="w-full h-full object-cover absolute inset-0 animate-kenburns"
            in:fade={{ duration: 2000, easing: sineInOut }}
            out:fade={{ duration: 2000, easing: sineInOut }}
            src={slides[contador].src}
            loading="lazy"
            alt={slides[contador].destino}
        />
    {/key}

    <div class="absolute inset-0 bg-linear-to-r from-black/55 via-black/15 to-transparent"></div>

    <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-16 z-10">
        <div class="flex flex-col items-center justify-center">
            <h1 class="text-5xl md:text-7xl font-bold text-white leading-[0.9] drop-shadow-lg font-Cave">
                Descubre Cerro Largo
            </h1>
            <div class="flex items-center gap-2 mt-4 mb-3 md:mt-6 md:mb-4 w-44 md:w-64">
                <span class="h-px flex-1 bg-white/50"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></span>
                <span class="h-px flex-1 bg-white/50"></span>
            </div>
            <a href="/destinos" class="text-base md:text-xl font-bold text-white hover:text-green-400 transition-colors">
                Encontrá tu destino ›
            </a>
        </div>
    </div>

    <div class="absolute bottom-5 right-5 md:bottom-10 md:right-10 z-10 text-white w-40 md:w-64 text-right">
        {#key contador}
            <span
                in:fade={{ duration: 2500, easing: sineInOut, delay: 200 }}
                out:fade={{ duration: 1500, easing: sineInOut }}
                class="text-xl md:text-3xl font-bold drop-shadow-md font-Cave block absolute right-0 bottom-0 w-full"
            >
                {slides[contador].destino}
            </span>
        {/key}
    </div>
</section>

<style>
    @keyframes kenburns {
        0% { transform: scale(1); }
        100% { transform: scale(1.15); }
    }
    .animate-kenburns {
        animation: kenburns 6s linear forwards;
    }
</style>