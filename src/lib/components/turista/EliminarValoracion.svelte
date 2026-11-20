<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { enviar } from '$lib/turista/api';
    let { id }: { id: number } = $props();
    let confirmar = $state(false);
    let ocupado = $state(false);
    let mensaje = $state('');
    async function eliminar() {
        ocupado = true; mensaje = '';
        try {
            await enviar(`valoraciones/${id}`, 'DELETE');
            await invalidateAll();
        } catch (error) {
            mensaje = (error as Error).message;
        } finally { ocupado = false; }
    }
</script>

<div class="t-actions">
    {#if confirmar}
        <p>¿Eliminar esta valoración pendiente? Podrás enviar una nueva.</p>
        <button class="t-button" disabled={ocupado} onclick={eliminar}>{ocupado ? 'Eliminando…' : 'Sí, eliminar'}</button>
        <button class="t-button secondary" disabled={ocupado} onclick={() => confirmar = false}>Cancelar</button>
    {:else}
        <button class="t-button secondary" onclick={() => confirmar = true}>Eliminar valoración</button>
    {/if}
</div>
{#if mensaje}<p class="t-message error" role="alert">{mensaje}</p>{/if}
