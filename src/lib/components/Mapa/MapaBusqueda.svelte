<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import MapaBloque from './MapaBloque.svelte';

    // https://phosphoricons.com/?q=magnifying-glass
    const categorias = [
        { id: 1, nombre: 'Cultural' },
        { id: 2, nombre: 'Naturaleza' },
        { id: 3, nombre: 'Gastronomía' },
        { id: 4, nombre: 'Alojamiento' },
        { id: 5, nombre: 'Salud' },
        { id: 6, nombre: 'Eventos' },
    ];

    const recomendaciones = [
        {
            id: 1,
            nombre: 'Catedral de Melo',
            categoria: 'Cultural',
            imagen: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/CATEDRAL-CERRO-2-1-1-600x400.jpg',
        },
        {
            id: 2,
            nombre: 'Parque Zorrilla',
            categoria: 'Naturaleza',
            imagen: 'https://uruguaydesdeloalto.com/wp-content/uploads/2022/03/P4P_67407-560x373.jpg',
        },
        {
            id: 3,
            nombre: 'Mercado Central',
            categoria: 'Gastronomía',
            imagen: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/CATEDRAL-CERRO-2-1-1-600x400.jpg',
        },
    ];

    let query = $state(page.url.searchParams.get('query') ?? '');
    const categoriasActivas = $derived(page.url.searchParams.getAll('categorias'));

    const buscar = async (event: SubmitEvent) => {
        event.preventDefault();

        const url = new URL(page.url);
        if (query.trim()) {
            url.searchParams.set('query', query.trim());
        } else {
            url.searchParams.delete('query');
        }

        await goto(url, { replaceState: true, noScroll: true, keepFocus: true });
    };

    const alternarCategoria = async (id: number) => {
        const url = new URL(page.url);
        const idStr = String(id);
        const activas = url.searchParams.getAll('categorias');

        url.searchParams.delete('categorias');
        const nuevas = activas.includes(idStr) ? activas.filter((c) => c !== idStr) : [...activas, idStr];
        for (const c of nuevas) {
            url.searchParams.append('categorias', c);
        }

        await goto(url, { replaceState: true, noScroll: true, keepFocus: true });
    };

    const irALugar = async (id: number) => {
        const url = new URL(page.url);
        url.searchParams.set('localidad', String(id));

        await goto(url, { replaceState: true, noScroll: true, keepFocus: true });
    };
</script>

<div class="flex h-full w-full flex-col gap-4 p-4">
    <!-- Buscador -->
    <form onsubmit={buscar} class="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="h-5 w-5 shrink-0 text-stone-400">
            <path d="M229.66,218.34,179.6,168.28a88.11,88.11,0,1,0-11.32,11.32l50.06,50.06a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
        </svg>

        <input
            type="search"
            bind:value={query}
            placeholder="Buscar lugares, eventos…"
            class="w-full bg-transparent font-Poppins text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
        />
    </form>

    <!-- Categorias -->
    <MapaBloque titulo="Categorías">
        <div class="flex flex-wrap gap-2 px-1 pt-1">
            {#each categorias as categoria}
                {@const activa = categoriasActivas.includes(String(categoria.id))}
                <button
                    onclick={() => alternarCategoria(categoria.id)}
                    class="rounded-full border px-3 py-1.5 font-Poppins text-sm transition-colors duration-150 {activa
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}"
                >
                    {categoria.nombre}
                </button>
            {/each}
        </div>
    </MapaBloque>

    <!-- Recomendaciones -->
    <MapaBloque titulo="Recomendaciones">
        <div class="flex flex-col gap-2 px-1 pt-1">
            {#each recomendaciones as lugar}
                <button
                    onclick={() => irALugar(lugar.id)}
                    class="flex items-center gap-3 rounded-xl border border-stone-200 p-2 text-left transition-colors duration-150 hover:bg-stone-50"
                >
                    <img src={lugar.imagen} alt={lugar.nombre} class="h-16 w-16 shrink-0 rounded-lg object-cover" />

                    <div class="flex flex-col gap-1">
                        <span class="font-Poppins text-sm font-medium text-stone-900">{lugar.nombre}</span>
                        <span class="w-fit rounded-full bg-amber-100 px-2 py-0.5 font-Poppins text-xs font-medium text-amber-800">{lugar.categoria}</span>
                    </div>
                </button>
            {/each}
        </div>
    </MapaBloque>
</div>
