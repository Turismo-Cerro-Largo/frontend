<script lang="ts">
    import ListadoCategoria from '$lib/components/catalogo/ListadoCategoria.svelte';
    import type { DatosCategoria } from '$lib/types/categoria';

    let { data }: { data: DatosCategoria } = $props();
</script>

<ListadoCategoria titulo="Restaurantes en Cerro Largo" descripcion="Descubrí restaurantes, parrilladas y lugares gastronómicos." elementos={data.elementos} error={data.error} />
