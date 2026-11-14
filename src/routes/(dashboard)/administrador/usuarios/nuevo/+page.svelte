<script lang="ts">
    import { goto } from '$app/navigation';

    let enviando = $state(false);
    let error = $state('');

    async function crear(evento: SubmitEvent) {
        evento.preventDefault();
        if (enviando || !(evento.currentTarget instanceof HTMLFormElement)) return;

        const datos = Object.fromEntries(new FormData(evento.currentTarget));
        enviando = true;
        error = '';
        try {
            const respuesta = await fetch('/api/admin/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const cuenta = await respuesta.json().catch(() => null);
            if (!respuesta.ok) throw new Error(cuenta?.message ?? 'No se pudo crear el administrador.');
            await goto(`/administrador/usuarios/${cuenta.id}`);
        } catch (e) {
            error = e instanceof Error ? e.message : 'No se pudo completar la solicitud.';
        } finally {
            enviando = false;
        }
    }
</script>

<svelte:head><title>Crear administrador | Cerro Largo 360</title></svelte:head>

<section class="mx-auto w-full max-w-xl space-y-5 text-[#26382e]">
    <a href="/administrador/usuarios" class="text-sm font-semibold text-[#477967] hover:underline">← Volver a usuarios</a>
    <h1 class="text-3xl font-semibold">Crear administrador</h1>
    <form onsubmit={crear} aria-busy={enviando} class="space-y-4 rounded-2xl border border-[#e0e6df] bg-white p-6">
        {#each ([
            { nombre: 'nombres', etiqueta: 'Nombres', tipo: 'text', autocomplete: 'given-name', min: 2, max: 60 },
            { nombre: 'apellidos', etiqueta: 'Apellidos', tipo: 'text', autocomplete: 'family-name', min: 2, max: 60 },
            { nombre: 'email', etiqueta: 'Correo electrónico', tipo: 'email', autocomplete: 'off', min: 7, max: 45 },
            { nombre: 'password', etiqueta: 'Contraseña', tipo: 'password', autocomplete: 'new-password', min: 8, max: 32 }
        ] as const) as campo (campo.nombre)}
            <div class="flex flex-col gap-1">
                <label for={campo.nombre} class="text-sm font-medium">
                    {campo.etiqueta} <span class="ml-1 text-xs font-semibold text-red-700">Obligatorio</span>
                </label>
                <input id={campo.nombre} name={campo.nombre} type={campo.tipo} autocomplete={campo.autocomplete}
                    minlength={campo.min} maxlength={campo.max} required disabled={enviando}
                    aria-describedby={campo.nombre === 'password' ? 'ayuda-password' : undefined}
                    class="rounded-lg border-slate-300 focus:border-green-600 focus:ring-green-600" />
                {#if campo.nombre === 'password'}
                    <p id="ayuda-password" class="text-xs text-slate-600">De 8 a 32 caracteres, con mayúsculas y minúsculas.</p>
                {/if}
            </div>
        {/each}
        {#if error}<p role="alert" class="text-sm text-red-700">{error}</p>{/if}
        <button type="submit" disabled={enviando} class="rounded-lg bg-[#38634a] px-4 py-2 font-semibold text-white disabled:opacity-50">
            {enviando ? 'Creando…' : 'Crear administrador'}
        </button>
    </form>
</section>
