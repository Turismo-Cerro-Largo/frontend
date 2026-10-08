<script lang="ts">
    import { onMount } from 'svelte';
    import Navbar from '$lib/components/shared/Navbar.svelte';

    type EstadoRadio = 'cargando' | 'lista' | 'sin-stream';

    type Radio = {
        id: string;
        nombre: string;
        frecuencia: string;
        localidad: string;
        buscar: string;
        stream?: string;
        estado: EstadoRadio;
    };

    type RadioBrowserItem = {
        name: string;
        url: string;
        url_resolved: string;
        countrycode: string;
        lastcheckok: number;
    };

    let radios = $state<Radio[]>([
        {
            id: 'voz-melo',
            nombre: 'La Voz de Melo',
            frecuencia: '1340 AM',
            localidad: 'Melo',
            buscar: 'La Voz de Melo',
            estado: 'cargando',
        },
        {
            id: 'rio-branco',
            nombre: 'Radio Río Branco',
            frecuencia: '1360 AM',
            localidad: 'Río Branco',
            buscar: 'Radio Rio Branco',
            estado: 'cargando',
        },
        {
            id: 'radio-maria',
            nombre: 'Radio María',
            frecuencia: '1470 AM',
            localidad: 'Melo',
            buscar: 'Radio Maria Uruguay',
            estado: 'cargando',
        },
        {
            id: 'acuarela',
            nombre: 'Radio Acuarela',
            frecuencia: '1520 AM',
            localidad: 'Melo',
            buscar: 'Radio Acuarela',
            estado: 'cargando',
        },
        {
            id: 'ritmo',
            nombre: 'Ritmo FM',
            frecuencia: '88.1 FM',
            localidad: 'Melo',
            buscar: 'Ritmo FM 88.1',
            estado: 'cargando',
        },
        {
            id: 'sirio',
            nombre: 'Sirio FM',
            frecuencia: '89.5 FM',
            localidad: 'Fraile Muerto',
            buscar: 'Sirio FM',
            estado: 'cargando',
        },
        {
            id: 'pueblo',
            nombre: 'Radio Pueblo',
            frecuencia: '89.7 FM',
            localidad: 'Río Branco',
            buscar: 'Radio Pueblo 89.7',
            estado: 'cargando',
        },
        {
            id: 'bruja',
            nombre: 'La Bruja FM',
            frecuencia: '89.9 FM',
            localidad: 'Melo',
            buscar: 'La Bruja FM',
            stream: 'https://rr5100.globalhost1.com/8452/stream',
            estado: 'lista',
        },
        {
            id: 'acegua',
            nombre: 'Aceguá FM',
            frecuencia: '90.3 FM',
            localidad: 'Aceguá',
            buscar: 'Acegua FM',
            estado: 'cargando',
        },
        {
            id: 'amiga',
            nombre: 'Amiga FM',
            frecuencia: '92.1 FM',
            localidad: 'Laguna Merín',
            buscar: 'Amiga FM',
            estado: 'cargando',
        },
        {
            id: 'renovacion',
            nombre: 'Renovación FM',
            frecuencia: '95.1 FM',
            localidad: 'Melo',
            buscar: 'Renovacion FM 95.1',
            estado: 'cargando',
        },
        {
            id: 'ecos-costa',
            nombre: 'Ecos de la Costa',
            frecuencia: '96.1 FM',
            localidad: 'Cerro Largo',
            buscar: 'Ecos de la Costa',
            estado: 'cargando',
        },
        {
            id: 'rnu-rio-branco',
            nombre: 'Radiodifusión Nacional',
            frecuencia: '97.7 FM',
            localidad: 'Río Branco',
            buscar: 'Radiodifusion Nacional Uruguay',
            estado: 'cargando',
        },
        {
            id: 'nova',
            nombre: 'Nova FM',
            frecuencia: '98.3 FM',
            localidad: 'Melo',
            buscar: 'Nova FM',
            estado: 'cargando',
        },
        {
            id: 'ciudad-melo',
            nombre: 'Ciudad de Melo FM',
            frecuencia: '99.1 FM',
            localidad: 'Melo',
            buscar: 'Ciudad de Melo FM',
            estado: 'cargando',
        },
        {
            id: 'integracion',
            nombre: 'FM Integración',
            frecuencia: '101.5 FM',
            localidad: 'Aceguá',
            buscar: 'FM Integracion 101.5',
            estado: 'cargando',
        },
        {
            id: 'galena',
            nombre: 'La Galena',
            frecuencia: '105.5 FM',
            localidad: 'Río Branco',
            buscar: 'La Galena',
            estado: 'cargando',
        },
        {
            id: 'emisora-sur',
            nombre: 'Emisora del Sur',
            frecuencia: '106.9 FM',
            localidad: 'Melo',
            buscar: 'Emisora del Sur',
            stream: 'https://radios.iwstreaming.uy/8034/stream',
            estado: 'lista',
        },
    ]);

    function normalizar(texto: string) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    async function cargarStream(radio: Radio) {
        if (radio.stream) {
            radio.estado = 'lista';
            return;
        }

        radio.estado = 'cargando';

        try {
            const parametros = new URLSearchParams({
                name: radio.buscar,
                countrycode: 'UY',
                hidebroken: 'true',
                limit: '10',
            });

            const respuesta = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${parametros}`);

            if (!respuesta.ok) {
                throw new Error('No se pudo consultar la emisora');
            }

            const resultados = (await respuesta.json()) as RadioBrowserItem[];

            const busqueda = normalizar(radio.buscar);

            const coincidencia =
                resultados.find((resultado) => {
                    const nombre = normalizar(resultado.name);

                    return nombre.includes(busqueda) || busqueda.includes(nombre);
                }) ?? resultados[0];

            const url = coincidencia?.url_resolved || coincidencia?.url;

            if (url) {
                radio.stream = url;
                radio.estado = 'lista';
            } else {
                radio.estado = 'sin-stream';
            }
        } catch (error) {
            console.error(`Error cargando ${radio.nombre}:`, error);
            radio.estado = 'sin-stream';
        }
    }

    function pausarOtrasRadios(event: Event) {
        const radioActual = event.currentTarget as HTMLAudioElement;

        document.querySelectorAll('audio').forEach((audio) => {
            if (audio !== radioActual) {
                audio.pause();
            }
        });
    }

    onMount(() => {
        for (const radio of radios) {
            if (!radio.stream) {
                void cargarStream(radio);
            }
        }
    });
</script>

<svelte:head>
    <title>Radios locales | Cerro Largo 360</title>
    <meta name="description" content="Escuchá las radios locales del departamento de Cerro Largo, Uruguay." />
</svelte:head>

<Navbar />

<main class="min-h-screen bg-zinc-50">
    <!-- Encabezado -->
    <section
        class="
            bg-linear-to-br
            from-zinc-950
            to-zinc-800
            px-5
            pb-14
            pt-32
            text-white
            md:px-10
            md:pb-20
            md:pt-40
        "
    >
        <div class="mx-auto max-w-7xl">
            <div
                class="
                    mb-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                "
            >
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="2" />
                    <path d="M8.5 8.5a5 5 0 0 0 0 7" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M5.5 5.5a9 9 0 0 0 0 13" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                </svg>
            </div>

            <p
                class="
                    mb-2
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-white/60
                "
            >
                Cerro Largo · Uruguay
            </p>

            <h1
                class="
                    max-w-2xl
                    text-3xl
                    font-semibold
                    tracking-tight
                    md:text-5xl
                "
            >
                Radios locales
            </h1>

            <p
                class="
                    mt-4
                    max-w-xl
                    text-sm
                    leading-6
                    text-white/65
                    md:text-base
                "
            >
                Escuchá en vivo las emisoras de Melo, Río Branco, Aceguá, Fraile Muerto y otras localidades del departamento.
            </p>
        </div>
    </section>

    <!-- Radios -->
    <section class="px-5 py-10 md:px-10 md:py-16">
        <div class="mx-auto max-w-7xl">
            <div class="mb-8">
                <h2
                    class="
                        text-2xl
                        font-semibold
                        tracking-tight
                        text-zinc-900
                        md:text-3xl
                    "
                >
                    Emisoras de Cerro Largo
                </h2>

                <p class="mt-2 text-sm text-zinc-500">Seleccioná una emisora para comenzar a escuchar.</p>
            </div>

            <div
                class="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-2
                    lg:grid-cols-3
                "
            >
                {#each radios as radio (radio.id)}
                    <article
                        class="
                            flex
                            flex-col
                            rounded-2xl
                            border
                            border-zinc-200
                            bg-white
                            p-5
                            shadow-sm
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-md
                        "
                    >
                        <!-- Parte superior -->
                        <div class="flex items-start gap-4">
                            <div
                                class="
                                    flex
                                    h-14
                                    w-14
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#d7e5db]
                                    text-zinc-800
                                "
                            >
                                <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="7" width="18" height="13" rx="2" />
                                    <path d="M7 7l9-4" />
                                    <circle cx="8" cy="13" r="2" />
                                    <path d="M13 12h5" />
                                    <path d="M13 16h5" />
                                </svg>
                            </div>

                            <div class="min-w-0 flex-1">
                                <p
                                    class="
                                        text-xs
                                        font-medium
                                        text-zinc-400
                                    "
                                >
                                    {radio.localidad}
                                </p>

                                <h3
                                    class="
                                        mt-0.5
                                        text-base
                                        font-semibold
                                        text-zinc-900
                                    "
                                >
                                    {radio.nombre}
                                </h3>

                                <span
                                    class="
                                        mt-2
                                        inline-flex
                                        rounded-full
                                        bg-[#d7e5db]
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        text-zinc-700
                                    "
                                >
                                    {radio.frecuencia}
                                </span>
                            </div>

                            {#if radio.estado === 'lista'}
                                <div
                                    class="
                                        flex
                                        items-center
                                        gap-1.5
                                        text-[11px]
                                        font-medium
                                        text-green-700
                                    "
                                >
                                    <span
                                        class="
                                            h-2
                                            w-2
                                            rounded-full
                                            bg-green-500
                                        "
                                    ></span>

                                    En vivo
                                </div>
                            {/if}
                        </div>

                        <!-- Reproductor -->
                        <div class="mt-5 border-t border-zinc-100 pt-5">
                            {#if radio.estado === 'cargando'}
                                <div
                                    class="
                                        flex
                                        h-12
                                        items-center
                                        gap-3
                                        rounded-xl
                                        bg-zinc-50
                                        px-4
                                        text-sm
                                        text-zinc-500
                                    "
                                >
                                    <span
                                        class="
                                            h-4
                                            w-4
                                            animate-spin
                                            rounded-full
                                            border-2
                                            border-zinc-300
                                            border-t-zinc-800
                                        "
                                    ></span>

                                    Buscando transmisión...
                                </div>
                            {:else if radio.estado === 'lista' && radio.stream}
                                <audio
                                    controls
                                    preload="none"
                                    src={radio.stream}
                                    class="w-full"
                                    onplay={pausarOtrasRadios}
                                    onerror={() => {
                                        radio.estado = 'sin-stream';
                                        radio.stream = '';
                                    }}
                                >
                                    <track kind="captions" />
                                </audio>
                            {:else}
                                <div
                                    class="
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                        rounded-xl
                                        bg-zinc-50
                                        px-4
                                        py-3
                                    "
                                >
                                    <div>
                                        <p
                                            class="
                                                text-xs
                                                font-medium
                                                text-zinc-700
                                            "
                                        >
                                            Transmisión no disponible
                                        </p>

                                        <p
                                            class="
                                                mt-0.5
                                                text-[11px]
                                                text-zinc-400
                                            "
                                        >
                                            La emisora puede estar fuera de línea.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onclick={() => cargarStream(radio)}
                                        class="
                                            shrink-0
                                            rounded-full
                                            border
                                            border-zinc-200
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-medium
                                            text-zinc-700
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-white
                                        "
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </article>
                {/each}
            </div>

            <div
                class="
                    mt-10
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    p-4
                    text-xs
                    leading-5
                    text-zinc-500
                "
            >
                Las transmisiones dependen de la disponibilidad online de cada emisora. Algunas radios pueden no emitir por internet durante determinados horarios.
            </div>
        </div>
    </section>
</main>
