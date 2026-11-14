<script lang="ts">
    let { endpoint, estado, actualizar }: {
        endpoint: string;
        estado: 'ACTIVO' | 'BLOQUEADO' | 'ELIMINADO';
        actualizar: (estado: 'ACTIVO' | 'BLOQUEADO' | 'ELIMINADO') => void;
    } = $props();

    let guardando = $state(false);
    let error = $state('');

    async function cambiar(nuevo: typeof estado) {
        if (guardando) return;
        if (nuevo === 'ELIMINADO' && !confirm('¿Eliminar la cuenta? Perderá el acceso de forma permanente. Su historial se conserva.')) return;

        guardando = true;
        error = '';
        try {
            const respuesta = await fetch(endpoint + (nuevo === 'ELIMINADO' ? '' : '/acceso'), {
                method: nuevo === 'ELIMINADO' ? 'DELETE' : 'PATCH',
                ...(nuevo === 'ELIMINADO' ? {} : {
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado_acceso: nuevo })
                })
            });
            if (!respuesta.ok) {
                const datos = await respuesta.json().catch(() => null);
                throw new Error(datos?.message ?? 'No se pudo cambiar el acceso.');
            }
            actualizar(nuevo);
        } catch (e) {
            error = e instanceof Error ? e.message : 'No se pudo cambiar el acceso.';
        } finally {
            guardando = false;
        }
    }
</script>

<section class="rounded-2xl border border-[#e0e6df] bg-white p-5">
    <h2 class="font-semibold">Acceso a la cuenta</h2>
    <p class="mt-2 text-sm text-slate-700" role="status">
        {estado === 'ACTIVO' ? 'Acceso habilitado' : estado === 'BLOQUEADO' ? 'Cuenta bloqueada' : 'Cuenta eliminada'}
    </p>
    {#if estado !== 'ELIMINADO'}
        <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={guardando} onclick={() => cambiar(estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO')}
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50">
                {estado === 'ACTIVO' ? 'Bloquear cuenta' : 'Desbloquear cuenta'}
            </button>
            <button type="button" disabled={guardando} onclick={() => cambiar('ELIMINADO')}
                class="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">
                Eliminar cuenta
            </button>
        </div>
    {/if}
    {#if error}<p class="mt-3 text-sm text-red-700" role="alert">{error}</p>{/if}
</section>
