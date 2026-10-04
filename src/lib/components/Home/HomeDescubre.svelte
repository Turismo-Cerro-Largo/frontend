<script lang="ts">
    import { onDestroy } from 'svelte';
    import { body, card, container, h2, h3, label, sectionAfterHero } from '$lib/styles/tokens';

    type Localidad = {
        id: string;
        svgId: string;
        nombre: string;
        img: string;
        href: string;
    };

    const localidades: Localidad[] = [
        {
            id: 'Melo',
            svgId: 'melo',
            nombre: 'Melo',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnfmJFRbJJC-ajemxVkoRbgmdKx2_z_VCmSqGMPPj_5AFW-DAdqIoUz5lf&s=10',
            href: '/localidades/Melo',
        },
        {
            id: 'Rio-Branco',
            svgId: 'rio-branco',
            nombre: 'Río Branco',
            img: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/PUENTE-1024x717-1.png',
            href: '/localidades/Rio-Branco',
        },
        {
            id: 'Centurion',
            svgId: 'centurion',
            nombre: 'Centurión',
            img: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/PAASO-CENTURION-2-1-600x400.jpg',
            href: '/localidades/Centurion',
        },
        {
            id: 'Tupambae',
            svgId: 'tupambae',
            nombre: 'Tupambaé',
            img: 'https://destinocerrolargo.uy/wp-content/uploads/2024/08/cueva_murcielagos1-780x470.jpg',
            href: '/localidades/Tupambae',
        },
        {
            id: 'Acegua',
            svgId: 'acegua',
            nombre: 'Aceguá',
            img: 'https://cantoyfogon.com.uy/inicio/wp-content/uploads/2026/04/acegua.jpg',
            href: '/localidades/Acegua',
        },
        {
            id: 'Laguna-Merin',
            svgId: 'laguna-merin',
            nombre: 'Laguna Merín',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSqLiPMa-bTdadB7BdCuO-SIN2krQqJmwjUaYPhDha7QfmwSKn9YDHSC8&s=10',
            href: '/localidades/Laguna-Merin',
        },
        {
            id: 'Fraile-Muerto',
            svgId: 'fraile-muerto',
            nombre: 'Fraile Muerto',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA9_VtZF_LmEw_N1N_HZiKD9mxkYOcYDDxc9xXDuEi5P0Ps5gU0QIsdsY&s=10',
            href: '/localidades/Fraile-Muerto',
        },
        {
            id: 'Isidoro-Noblia',
            svgId: 'isidoro-noblia',
            nombre: 'Isidoro Noblía',
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxj0f-GbTlu_7MyyF4UaLpitqtb5wP9COTR4qriQZ7qFSIuuN95syFhYM&s=10',
            href: '/localidades/Isidoro-Noblia',
        },
        {
            id: 'Arevalo',
            svgId: 'arevalo',
            nombre: 'Arévalo',
            img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/05-11.jpg',
            href: '/localidades/Arevalo',
        },
        {
            id: 'Placido-Rosas',
            svgId: 'placido-rosas',
            nombre: 'Plácido Rosas',
            img: 'https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/01-12.jpg',
            href: '/localidades/Placido-Rosas',
        },
    ];

    let selectedIndex = $state(0);
    let mapObject: HTMLObjectElement | undefined;
    let cleanupMapListeners: Array<() => void> = [];

    let selected = $derived(localidades[selectedIndex]);

    function clearMapListeners() {
        cleanupMapListeners.forEach((cleanup) => cleanup());
        cleanupMapListeners = [];
    }

    function getSvgDocument() {
        return mapObject?.contentDocument ?? null;
    }

    function updateMapSelection(index = selectedIndex) {
        const svgDocument = getSvgDocument();
        if (!svgDocument) return;

        const activeSvgId = localidades[index]?.svgId;

        svgDocument.querySelectorAll<SVGGElement>('g.localidad').forEach((group) => {
            const isSelected = group.id === activeSvgId;

            if (isSelected) {
                group.setAttribute('data-selected', 'true');
                group.setAttribute('aria-pressed', 'true');
            } else {
                group.removeAttribute('data-selected');
                group.setAttribute('aria-pressed', 'false');
            }
        });
    }

    function selectLocalidad(index: number) {
        const normalizedIndex = ((index % localidades.length) + localidades.length) % localidades.length;

        selectedIndex = normalizedIndex;
        updateMapSelection(normalizedIndex);
    }

    function previousLocalidad() {
        selectLocalidad((selectedIndex - 1 + localidades.length) % localidades.length);
    }

    function nextLocalidad() {
        selectLocalidad((selectedIndex + 1) % localidades.length);
    }

    function handleMapLoad() {
        clearMapListeners();

        const svgDocument = getSvgDocument();
        if (!svgDocument) return;

        svgDocument.querySelectorAll<SVGGElement>('g.localidad').forEach((group) => {
            const index = localidades.findIndex((localidad) => localidad.svgId === group.id);
            if (index === -1) return;

            group.setAttribute('role', 'button');
            group.setAttribute('aria-pressed', index === selectedIndex ? 'true' : 'false');

            const handleClick = () => {
                selectLocalidad(index);
                (svgDocument.activeElement as HTMLElement | null)?.blur?.();
            };

            const handleKeydown = (event: KeyboardEvent) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;

                event.preventDefault();
                selectLocalidad(index);
                (svgDocument.activeElement as HTMLElement | null)?.blur?.();
            };

            group.addEventListener('click', handleClick);
            group.addEventListener('keydown', handleKeydown);

            cleanupMapListeners.push(() => {
                group.removeEventListener('click', handleClick);
                group.removeEventListener('keydown', handleKeydown);
            });
        });

        updateMapSelection();
    }

    onDestroy(clearMapListeners);
</script>

<section class={sectionAfterHero}>
    <div class={container}>
        <div class="mb-5 flex flex-col gap-2 md:mb-7">
            <h2 class={h2}>Descubrí Cerro Largo</h2>
            <p class={`max-w-2xl ${body}`}>Elegí una localidad en el mapa y empezá a recorrer el departamento.</p>
        </div>

        <div class="grid gap-5 md:gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch lg:gap-8">
            <div
                class="order-1 flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 p-2 sm:min-h-96 sm:p-4 lg:order-2 lg:min-h-126 lg:p-5"
            >
                <object
                    bind:this={mapObject}
                    data="/cerro-largo-360-mapa-localidades-v2.svg"
                    type="image/svg+xml"
                    aria-label="Mapa interactivo de localidades de Cerro Largo"
                    onload={handleMapLoad}
                    class="block h-full max-h-125 w-full"
                >
                    Mapa interactivo de Cerro Largo
                </object>
            </div>

            <div class="order-2 lg:order-1">
                <div>
                    <article class={`h-140 w-full min-w-0 overflow-hidden ${card} sm:h-152 lg:h-152`} aria-live="polite">
                        <div class="flex h-full flex-col bg-white">
                            <div class="relative h-56 shrink-0 overflow-hidden bg-zinc-100 sm:h-64 lg:h-72">
                                <img src={selected.img} alt={selected.nombre} class="absolute inset-0 h-full w-full object-cover" />

                                <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"></div>

                                <div
                                    class="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-zinc-700 shadow-sm backdrop-blur-sm"
                                >
                                    <div
                                        class="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-zinc-700 shadow-sm backdrop-blur-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="size-3.25 shrink-0 fill-current text-amber-500" aria-hidden="true">
                                            <path
                                                d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"
                                            ></path>
                                        </svg>

                                        Cerro Largo
                                    </div>
                                     Cerro Largo
                                </div>

                                <div class="absolute bottom-4 right-4 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                    {String(selectedIndex + 1).padStart(2, '0')} /
                                    {String(localidades.length).padStart(2, '0')}
                                </div>
                            </div>

                            <div class="flex min-h-0 flex-1 flex-col bg-white p-5 sm:p-6 lg:p-7">
                                <div class="min-h-0">
                                    <p class={`mb-2 ${label}`}>Localidad</p>
                                    <h3 class={h3}>{selected.nombre}</h3>
                                    <p class={`mt-3 max-w-md leading-relaxed ${body}`}>
                                        Conocé {selected.nombre} y encontrá lugares, actividades y experiencias para sumar a tu recorrido.
                                    </p>
                                </div>

                                <div class="mt-auto flex shrink-0 items-center justify-between gap-4 pt-5">
                                    <a href={selected.href} class="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-700 hover:text-zinc-950">
                                        Explorar localidad

                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="size-3.75 shrink-0 fill-current" aria-hidden="true">
                                            <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path>
                                        </svg>
                                    </a>

                                    <div class="flex items-center gap-2">
                                        <button
                                            type="button"
                                            class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white shadow-sm active:bg-zinc-800"
                                            aria-label="Localidad anterior"
                                            onclick={previousLocalidad}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="size-4.25 shrink-0 fill-current" aria-hidden="true">
                                                <path
                                                    d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
                                                ></path>
                                            </svg>
                                        </button>

                                        <button
                                            type="button"
                                            class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white shadow-sm active:bg-zinc-800"
                                            aria-label="Siguiente localidad"
                                            onclick={nextLocalidad}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="size-4.25 shrink-0 fill-current" aria-hidden="true">
                                                <path
                                                    d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"
                                                ></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    </div>
</section>
