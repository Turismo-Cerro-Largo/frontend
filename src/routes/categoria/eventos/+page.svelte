<script lang="ts">
    import ListadoCategoria from '$lib/components/catalogo/ListadoCategoria.svelte';
    import type { DatosCategoria } from '$lib/types/categoria';

    let { data }: { data: DatosCategoria } = $props();
</script>

<ListadoCategoria
    titulo="Eventos sociales en Cerro Largo"
    descripcion="Descubrí festivales, conciertos, ferias y actividades de Cerro Largo."
    elementos={data.elementos}
    error={data.error}
/>
