<script lang="ts">
    import ListadoCategoria from '$lib/components/catalogo/ListadoCategoria.svelte';
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
</script>

<ListadoCategoria
    titulo="Alojamientos en Cerro Largo"
    descripcion="Encontrá hoteles, posadas y cabañas para disfrutar de tu estadía."
    elementos={data.alojamientos}
    error={data.error}
/>
