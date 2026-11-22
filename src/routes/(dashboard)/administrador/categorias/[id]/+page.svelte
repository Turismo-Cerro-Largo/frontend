<script lang="ts">
    import CategoriaFormulario from '#lib/components/admin/CategoriaFormulario.svelte';
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
</script>
{#key data.categoria.id}<CategoriaFormulario categoria={data.categoria} />{/key}
