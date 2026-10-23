<script lang="ts">
    import ListadoCategoria from '$lib/components/Categorias/ListadoCategoria.svelte';
    import type { DatosCategoria } from '$lib/types/categoria';

    let { data }: { data: DatosCategoria } = $props();
</script>

<ListadoCategoria titulo="Cultura en Cerro Largo" descripcion="Conocé museos, monumentos, plazas y lugares históricos." elementos={data.elementos} error={data.error} />
