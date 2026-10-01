<script lang="ts">
    let arrastrando = $state(false);
    let inicioX = 0;
    let scrollInicial = 0;

    const iniciarArrastre = (event: MouseEvent) => {
        const elemento = event.currentTarget as HTMLDivElement;

        arrastrando = true;
        inicioX = event.pageX - elemento.offsetLeft;
        scrollInicial = elemento.scrollLeft;
    };

    const moverArrastre = (event: MouseEvent) => {
        if (!arrastrando) return;

        const elemento = event.currentTarget as HTMLDivElement;
        const x = event.pageX - elemento.offsetLeft;
        const desplazamiento = (x - inicioX) * 1.2;

        elemento.scrollLeft = scrollInicial - desplazamiento;
    };

    const terminarArrastre = () => {
        arrastrando = false;
    };
</script>

<article class="flex flex-col gap-4 px-2 py-4">
    <!-- usuario ? calificacion -->
    <div class="flex items-center justify-between gap-3">
        <div class="flex flex-col">
            <span class="font-Poppins text-lg font-medium text-gray-900"> Carlos Perez </span>

            <span class="text-xs text-gray-400"> Hace 2 dias </span>
        </div>

        <div class="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1">
            <svg class="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.94 5.95 6.56.95-4.75 4.63 1.12 6.54L12 17.48l-5.87 3.09 1.12-6.54L2.5 9.4l6.56-.95L12 2.5z" />
            </svg>

            <span class="text-sm font-medium text-gray-700"> 2/5 </span>
        </div>
    </div>

    <!-- comentario -->
    <p class="text-sm leading-6 text-gray-600">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus officiis nemo, quidem ratione reiciendis minima! Sapiente earum ab saepe, nulla aperiam eum qui soluta
        necessitatibus illo magnam delectus maiores.
    </p>

    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- recursos -->
    <div
        role="region"
        aria-label="Fotos de la resena"
        class:cursor-grabbing={arrastrando}
        class="flex cursor-grab gap-3 overflow-x-auto pb-1 select-none scrollbar-none [&::-webkit-scrollbar]:hidden"
        onmousedown={iniciarArrastre}
        onmousemove={moverArrastre}
        onmouseup={terminarArrastre}
        onmouseleave={terminarArrastre}
    >
        {#each Array(5) as _}
            <img
                src="https://uruguaydesdeloalto.com/wp-content/uploads/2022/03/P4P_67407-560x373.jpg"
                alt="Foto de la resena"
                draggable="false"
                class="h-32 w-32 shrink-0 rounded-xl object-cover"
            />
        {/each}
    </div>
</article>
