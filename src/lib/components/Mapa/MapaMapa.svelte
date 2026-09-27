<script lang="ts">
    import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
    import mapboxgl from 'mapbox-gl';
    import 'mapbox-gl/dist/mapbox-gl.css';
    import { onDestroy, onMount } from 'svelte';

    // Vars
    let contenedor = $state<HTMLDivElement>();
    let mapa = $state<mapboxgl.Map>();
    const marcadores: mapboxgl.Marker[] = [];

    interface Location {
        name: string;
        lat: number;
        lon: number;
    }

    const locations: Location[] = [
        { name: 'Melo', lat: -32.3667, lon: -54.1833 },
        { name: 'Río Branco', lat: -32.5978, lon: -53.3881 },
        { name: 'Laguna Merín', lat: -32.6272, lon: -53.2814 },
        { name: 'Fraile Muerto', lat: -32.5208, lon: -54.5367 },
        { name: 'Isidoro Noblía', lat: -31.9675, lon: -54.0208 },
        { name: 'Aceguá', lat: -31.8653, lon: -54.1664 },
        { name: 'Tupambaé', lat: -32.8153, lon: -54.8986 },
        { name: 'Arévalo', lat: -32.6311, lon: -55.2289 },
        { name: 'Plácido Rosas', lat: -32.7456, lon: -53.7689 },
        { name: 'Centurion', lat: -32.1469, lon: -53.7622 },
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
            const pop = new mapboxgl.Popup({ offset: 12 }).setText(localidad.name);
            const marker = new mapboxgl.Marker().setLngLat([localidad.lon, localidad.lat]).setPopup(pop).addTo(map);

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
            pitch: 60,
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
