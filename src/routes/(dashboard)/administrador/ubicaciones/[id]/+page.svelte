<script lang="ts">
    import UbicacionForm from '../UbicacionForm.svelte';
    import { page } from '$app/state';
</script>

<UbicacionForm id={page.params.id} />
