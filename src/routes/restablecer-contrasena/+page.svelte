<script lang="ts">
    import { onMount } from 'svelte';
    let token = $state(''),
        listo = $state(false),
        cargando = $state(false),
        mensaje = $state(''),
        error = $state('');
    onMount(() => {
        token = new URLSearchParams(location.hash.slice(1)).get('token') || '';
        history.replaceState(history.state, '', location.pathname);
        listo = true;
    });
    async function enviar(e: SubmitEvent) {
        e.preventDefault();
        if (cargando) return;
        const form = new FormData(e.currentTarget as HTMLFormElement),
            password = String(form.get('password') || '');
        if (password !== form.get('confirmacion')) {
            error = 'Las contraseñas no coinciden.';
            return;
        }
        cargando = true;
        error = '';
        try {
            const r = await fetch('/api/auth/recuperacion/confirmar', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await r.json();
            if (!r.ok) {
                error = data.message || 'No pudimos cambiar la contraseña.';
                return;
            }
            token = '';
            mensaje = data.message;
        } catch {
            error = 'No pudimos conectar con el servidor. Intentá nuevamente.';
        } finally {
            cargando = false;
        }
    }
</script>

<svelte:head><title>Nueva contraseña · Cerro Largo 360</title><meta name="referrer" content="no-referrer" /><meta name="robots" content="noindex" /></svelte:head>
<main class="min-h-dvh flex items-center justify-center px-5 py-12 bg-white">
    <section class="w-full max-w-sm text-slate-800" aria-labelledby="titulo">
        <a href="/" class="text-green-700 font-semibold">Cerro Largo 360</a>
        <h1 id="titulo" class="text-2xl font-bold mt-4 mb-3">Elegí una nueva contraseña</h1>
        {#if mensaje}
            <p role="status" class="p-4 rounded-lg border border-green-200 bg-green-50 text-green-800">{mensaje}</p>
        {:else if listo && /^[a-f0-9]{64}$/.test(token)}
            <p id="ayuda" class="text-sm text-slate-600 mb-6">Usá entre 8 y 32 caracteres, incluyendo una mayúscula y una minúscula. Tus sesiones anteriores se cerrarán.</p>
            {#if error}<p role="alert" class="p-4 mb-5 rounded-lg border border-red-200 bg-red-50 text-red-800">{error}</p>{/if}
            <form onsubmit={enviar} class="flex flex-col gap-3" aria-busy={cargando}>
                <label for="password" class="text-sm font-medium">Nueva contraseña</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minlength="8"
                    maxlength="32"
                    autocomplete="new-password"
                    aria-describedby="ayuda"
                    disabled={cargando}
                    class="rounded-lg border-slate-300 focus:ring-green-600 focus:border-green-600"
                />
                <label for="confirmacion" class="text-sm font-medium">Repetí la contraseña</label>
                <input
                    id="confirmacion"
                    name="confirmacion"
                    type="password"
                    required
                    minlength="8"
                    maxlength="32"
                    autocomplete="new-password"
                    disabled={cargando}
                    class="rounded-lg border-slate-300 focus:ring-green-600 focus:border-green-600"
                />
                <button disabled={cargando} class="rounded-lg bg-green-700 hover:bg-green-800 text-white py-3 mt-2 disabled:opacity-60"
                    >{cargando ? 'Guardando…' : 'Guardar contraseña'}</button
                >
            </form>
        {:else if listo}<p role="alert">Este enlace no es válido. Solicitá uno nuevo.</p>
        {:else}<p>Cargando…</p>{/if}
        <div class="flex flex-wrap gap-5 mt-6 text-green-700 underline underline-offset-4">
            <a href="/login">Volver a ingresar</a>{#if !mensaje}<a href="/recuperar-contrasena">Pedir otro enlace</a>{/if}
        </div>
    </section>
</main>
