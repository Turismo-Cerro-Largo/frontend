<script lang="ts">
    import ListadoCategoria from '$lib/components/Categorias/ListadoCategoria.svelte';
    import type { DatosCategoria } from '$lib/types/categoria';

    let { data }: { data: DatosCategoria } = $props();
</script>

<ListadoCategoria titulo="Parques y Naturaleza" descripcion="Explorá parques, reservas naturales, lagunas y playas de Cerro Largo." elementos={data.elementos} error={data.error} />
