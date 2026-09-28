<script lang="ts">
    import { isMobile } from '$lib/hooks/isMobile.svelte';
    import MapaBloque from './MapaBloque.svelte';
    import MapaComentario from './MapaComentario.svelte';
    import MapaSeparador from './MapaSeparador.svelte';

    const lugarEjemplo = {
        id: 1,
        nombre: 'Catedral de Melo', // x
        // X
        descripcion: 'Catedral histórica ubicada en el centro de Melo, referencia arquitectónica y religiosa de la ciudad, construida a fines del siglo XIX.',
        direccion: 'Av. Brasil esq. 18 de Julio', // X
        telefonoContacto: '+598 4642 1234', // X
        sitioWeb: 'https://catedraldemelo.uy', // X
        horario: 'Lun a Dom 08:00 - 19:00', // O
        // ,
        latitud: -32.37334670318527,
        longitud: -54.180038437446186,
        estado: 'ACTIVO',
        idCategoria: 3,
        idLocalidad: 1,

        categoria: {
            id: 3,
            nombre: 'Cultural',
            descripcion: 'Sitios históricos y arquitectónicos',
        },

        localidad: {
            id: 1,
            nombre: 'Melo',
            departamento: 'Cerro Largo',
        },

        recursos: [
            {
                id: 1,
                tipo: 'IMAGEN',
                url: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/CATEDRAL-CERRO-2-1-1-600x400.jpg',
                descripcion: 'Fachada principal',
                orden: 0,
                idLugar: 1,
            },
            {
                id: 2,
                tipo: 'IMAGEN',
                url: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/CATEDRAL-CERRO-2-1-1-600x400.jpg',
                descripcion: 'Vista lateral',
                orden: 1,
                idLugar: 1,
            },
            {
                id: 3,
                tipo: 'IMAGEN',
                url: 'https://www.infoturismo19.com.uy/wp-content/uploads/2023/08/CATEDRAL-CERRO-2-1-1-600x400.jpg',
                descripcion: 'Interior',
                orden: 2,
                idLugar: 1,
            },
        ],

        resenas: [
            {
                id: 1,
                comentario: 'Muy linda visita, la recomiendo.',
                calificacion: 4,
                fecha: '2026-05-10T14:30:00.000Z',
                estado: 'PUBLICADA',
                idUsuario: 1,
                idLugar: 1,
                usuario: {
                    id: 1,
                    nombres: 'Ana',
                    apellidos: 'Pérez',
                },
            },
            {
                id: 2,
                comentario: null,
                calificacion: 3,
                fecha: '2026-06-02T10:15:00.000Z',
                estado: 'PUBLICADA',
                idUsuario: 2,
                idLugar: 1,
                usuario: {
                    id: 2,
                    nombres: 'Juan',
                    apellidos: 'Gómez',
                },
            },
            {
                id: 3,
                comentario: 'Excelente arquitectura, vale la pena.',
                calificacion: 4,
                fecha: '2026-07-15T09:00:00.000Z',
                estado: 'PUBLICADA',
                idUsuario: 3,
                idLugar: 1,
                usuario: {
                    id: 3,
                    nombres: 'Lucía',
                    apellidos: 'Fernández',
                },
            },
        ],

        favoritos: [
            { id: 1, fechaGuardado: '2026-05-01T12:00:00.000Z', idUsuario: 1, idLugar: 1 },
            { id: 2, fechaGuardado: '2026-05-20T09:30:00.000Z', idUsuario: 4, idLugar: 1 },
        ],
    };

    const movil = $derived(isMobile());

    let carrusel = $state<HTMLDivElement>();

    // -- Funciones del carrusel
    const avanzar = () => {
        carrusel?.scrollBy({ left: carrusel.clientWidth, behavior: 'smooth' });
    };

    const retroceder = () => {
        carrusel?.scrollBy({ left: -carrusel.clientWidth, behavior: 'smooth' });
    };
</script>

<!--  -->
<div class="flex min-h-full w-full flex-col gap-3 p-2">
    <!-- Seccion con imagenes -->
    <div class="relative flex h-68 w-full flex-row gap-2 rounded-2xl bg-stone-200">
        <div bind:this={carrusel} class="scrollbar-hide snap-x rounded-2xl snap-mandatory overflow-x-auto flex h-full w-full gap-2">
            {#each lugarEjemplo.recursos as recurso}
                <img class="h-full w-full shrink-0 snap-start object-cover" src={recurso.url} alt="Catedral de Melo" />
            {/each}
        </div>

        <!-- https://phosphoricons.com/?q=carret-left -->
        <button
            onclick={retroceder}
            aria-label="Anterior"
            class="absolute top-1/2 left-3 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-700 shadow-sm backdrop-blur-sm transition-transform duration-150 hover:scale-105 hover:bg-white active:scale-95"
        >
            <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                fill="none"
                stroke="currentColor"
                stroke-width="16"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="160 208 80 128 160 48" />
            </svg>
        </button>

        <!-- https://phosphoricons.com/?q=carret-right -->
        <button
            onclick={avanzar}
            aria-label="Siguiente"
            class="absolute top-1/2 right-3 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-700 shadow-sm backdrop-blur-sm transition-transform duration-150 hover:scale-105 hover:bg-white active:scale-95"
        >
            <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                fill="none"
                stroke="currentColor"
                stroke-width="16"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="96 48 176 128 96 208" />
            </svg>
        </button>
    </div>

    <div class="flex flex-col gap-2 px-1">
        <!-- Nombre y categoria -->
        <div class="flex items-start justify-between gap-3">
            <span class="font-Poppins text-2xl leading-tight font-semibold text-stone-900">
                {lugarEjemplo.nombre}
            </span>

            <span class="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 font-Poppins text-xs font-medium text-amber-800">
                {lugarEjemplo.categoria.nombre}
            </span>
        </div>

        <!-- Nombre de localidad: ej: Melo Cerro Largo -->
        <div class="flex items-center gap-1.5 text-stone-500 pl-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="h-3.5 w-3.5 shrink-0">
                <path
                    d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"
                />
            </svg>
            <span class="text-sm">{lugarEjemplo.localidad.nombre}, {lugarEjemplo.localidad.departamento}</span>
        </div>

        <!-- Descripcion -->
        <div class="rounded-xl border border-stone-200 p-2">
            <p class="text-sm leading-relaxed text-stone-600 font-Poppins">{lugarEjemplo.descripcion}</p>
        </div>

        <!-- Horarios  -->
        <MapaBloque titulo="Horario">
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p class="text-sm leading-relaxed text-stone-600 font-Poppins">{lugarEjemplo.horario}</p>
            </div>
        </MapaBloque>

        <MapaBloque titulo="Acerca de">
            <div class="flex flex-col divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                <!-- Telefono -->
                <!-- REF: https://rafarjonilla.com/tutorial/crear-enlace-html-para-llamar-por-telefono/ -->
                {#if lugarEjemplo.telefonoContacto}
                    {@const telefono = 'tel:' + lugarEjemplo.telefonoContacto.replace(' ', '')}
                    <div class="flex h-12 flex-row">
                        <div class="w-1/5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256" class="h-6 w-6 text-stone-800"
                                ><path
                                    d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"
                                ></path></svg
                            >
                        </div>
                        <a href={telefono} class="w-4/5 text-balance leading-relaxed flex items-center">
                            <p class="font-Poppins text-balance text-sm">{lugarEjemplo.telefonoContacto}</p>
                        </a>
                    </div>
                {/if}

                <!-- Direccion -->
                {#if lugarEjemplo.direccion}
                    {@const ubicacion = String(lugarEjemplo.latitud) + ',' + String(lugarEjemplo.longitud)}
                    <div class="flex h-12 flex-row">
                        <div class="w-1/5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256" class="h-6 w-6 text-stone-800"
                                ><path
                                    d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"
                                ></path></svg
                            >
                        </div>

                        <a
                            href={movil ? `https://www.google.com/maps?q=${ubicacion}` : `geo:0,0?q=${ubicacion}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="w-4/5 text-balance leading-relaxed flex items-center"
                        >
                            <p class="font-Poppins text-balance text-sm">
                                {lugarEjemplo.direccion.length > 25 ? lugarEjemplo.direccion.slice(0, 25) + '…' : lugarEjemplo.direccion}
                            </p>
                        </a>
                    </div>
                {/if}

                <!-- Web -->
                {#if lugarEjemplo.sitioWeb}
                    {@const url = lugarEjemplo.sitioWeb.replace('https://', '').replace('http://', '')}

                    <div class="flex h-12 flex-row">
                        <div class="flex w-1/5 items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" class="h-5 w-5 text-stone-800">
                                <path
                                    d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z"
                                />
                            </svg>
                        </div>

                        <a href={lugarEjemplo.sitioWeb} target="_blank" rel="noopener noreferrer" class="w-4/5 text-balance leading-relaxed flex items-center">
                            <p class="font-Poppins text-balance text-sm">{url.length > 25 ? url.slice(0, 25) + '…' : url}</p>
                        </a>
                    </div>
                {/if}
            </div>
        </MapaBloque>

        <!-- Promedio en base resenia -->
        <MapaBloque titulo="Calificar y Opinar">
            <div class="flex w-full items-center justify-center px-2 py-4">
                <div class="flex w-1/2 flex-col items-center justify-center gap-2">
                    <div class="flex items-center gap-1.5">
                        {#each Array(5) as _, i}
                            <svg
                                class="h-7 w-7 {i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-300'}"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="1"
                                aria-hidden="true"
                            >
                                <path d="M12 2.5l2.94 5.95 6.56.95-4.75 4.63 1.12 6.54L12 17.48l-5.87 3.09 1.12-6.54L2.5 9.4l6.56-.95L12 2.5z" />
                            </svg>
                        {/each}
                    </div>

                    <span class="text-sm text-gray-500"> 12 calificaciones </span>
                </div>

                <div class="flex w-1/2 flex-col items-center justify-center border-l border-gray-200">
                    <span class="font-Poppins text-5xl font-semibold leading-none"> 4.8 </span>

                    <span class="mt-2 text-sm text-gray-500"> promedio </span>
                </div>
            </div>
        </MapaBloque>

        <MapaBloque titulo="Opiniones">
            <MapaSeparador />
            <MapaComentario />
            <MapaSeparador />
            <MapaComentario />
            <MapaSeparador />
            <MapaComentario />
        </MapaBloque>
    </div>
</div>

<style>
    .scrollbar-hide {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
</style>
