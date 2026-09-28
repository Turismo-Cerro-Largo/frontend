<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
    import { GenerarIcono } from '$lib/util/GenerarIcono';
    import mapboxgl from 'mapbox-gl';
    import 'mapbox-gl/dist/mapbox-gl.css';
    import { onDestroy, onMount } from 'svelte';

    // Vars
    let contenedor = $state<HTMLDivElement>();
    let mapa = $state<mapboxgl.Map>();
    const marcadores: mapboxgl.Marker[] = [];

    const locations = [
        { id: 1, name: 'Melo', lat: -32.3667, lon: -54.1833, categoria: 'Alojamiento' },
        { id: 2, name: 'Río Branco', lat: -32.5978, lon: -53.3881, categoria: 'Gastronomia' },
        { id: 3, name: 'Laguna Merín', lat: -32.6272, lon: -53.2814, categoria: 'Culturales' },
        { id: 4, name: 'Fraile Muerto', lat: -32.5208, lon: -54.5367, categoria: 'naturaleza' },
        { id: 5, name: 'Isidoro Noblía', lat: -31.9675, lon: -54.0208, categoria: 'sociales' },
        { id: 6, name: 'Aceguá', lat: -31.8653, lon: -54.1664, categoria: 'ciudad' },
        { id: 7, name: 'Tupambaé', lat: -32.8153, lon: -54.8986, categoria: 'Culturales' },
        { id: 8, name: 'Arévalo', lat: -32.6311, lon: -55.2289, categoria: 'sociales' },
        { id: 9, name: 'Plácido Rosas', lat: -32.7456, lon: -53.7689, categoria: 'Gastronomia' },
        { id: 10, name: 'Centurion', lat: -32.1469, lon: -53.7622, categoria: 'Alojamiento' },
    ];

    const limitesCerroLargo: [[number, number], [number, number]] = [
        [-54.85, -33.05],
        [-53.55, -31.7],
    ];

    /**
     * @param map viene del scope cuando se usa dentro de `onMount()` (Linea: 79 a 81)
     *
     */
    function agreagar(map: mapboxgl.Map) {
        // REF: https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/markers/
        // REF: https://docs.mapbox.com/mapbox-gl-js/api/markers/
        for (const localidad of locations) {
            const marcador = GenerarIcono(localidad.categoria.toLocaleLowerCase());

            // REF: https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/markers/#click-events
            marcador.addEventListener('click', async () => {
                const url = new URL(page.url);
                url.searchParams.set('localidad', String(localidad.id));

                await goto(url, { replaceState: true, noScroll: true, keepFocus: true });
            });

            const marker = new mapboxgl.Marker({
                element: marcador,
            })
                .setLngLat([localidad.lon, localidad.lat])
                .addTo(map);

            marcadores.push(marker);
        }
    }

    onMount(() => {
        if (!contenedor) return;
        mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;

        // Configuracion
        const map = new mapboxgl.Map({
            container: contenedor,
            style: 'mapbox://styles/mapbox/standard',
            center: [-54.168, -32.2],
            zoom: 8,

            // Limitacion de los rangos de vision en 3D
            // Nota: Se rompe al ver el horizonte
            pitch: 60,
            maxPitch: 60,
            minPitch: 0,

            //
            bearing: -20,
            maxBounds: limitesCerroLargo,
            minZoom: 8,
        });

        mapa = map;

        // Configuracion de estilos y datos POIS
        // REVISAR DIF
        map.on('style.load', () => {
            map.setConfigProperty('basemap', 'lightPreset', 'night');
            map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
            map.setConfigProperty('basemap', 'showPlaceLabels', false);
            map.setConfigProperty('basemap', 'showRoadLabels', false);
            map.setConfigProperty('basemap', 'showTransitLabels', false);
        });

        map.on('load', () => {
            agreagar(map);
        });
    });

    onDestroy(() => {
        marcadores.forEach((m) => m.remove());
        mapa?.remove();
    });
</script>

<div bind:this={contenedor} class="h-screen w-full"></div>

<style>
</style>
