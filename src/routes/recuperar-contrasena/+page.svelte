<script lang="ts">
    let cargando = $state(false),
        mensaje = $state(''),
        error = $state('');
    async function enviar(e: SubmitEvent) {
        e.preventDefault();
        if (cargando) return;
        const email = String(new FormData(e.currentTarget as HTMLFormElement).get('email') || '');
        cargando = true;
        error = '';
        mensaje = '';
        try {
            const r = await fetch('/api/auth/recuperacion/solicitar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
            const data = await r.json();
            if (!r.ok) {
                error = data.message || 'No pudimos procesar la solicitud.';
                return;
            }
            mensaje = data.message;
        } catch {
            error = 'No pudimos conectar con el servidor. Intentá nuevamente.';
        } finally {
            cargando = false;
        }
    }
</script>

<svelte:head><title>Recuperar contraseña · Cerro Largo 360</title><meta name="referrer" content="no-referrer" /></svelte:head>
<main class="min-h-dvh flex items-center justify-center px-5 py-12 bg-white">
    <section class="w-full max-w-sm text-slate-800" aria-labelledby="titulo">
        <a href="/" class="text-green-700 font-semibold">Cerro Largo 360</a>
        <h1 id="titulo" class="text-2xl font-bold mt-4 mb-3">Recuperá tu contraseña</h1>
        <p class="text-sm text-slate-600 mb-6">Ingresá el correo de tu cuenta. Te enviaremos un enlace para elegir una nueva contraseña.</p>
        {#if mensaje}<p role="status" class="p-4 mb-5 rounded-lg border border-green-200 bg-green-50 text-green-800">{mensaje}</p>{/if}
        {#if error}<p role="alert" class="p-4 mb-5 rounded-lg border border-red-200 bg-red-50 text-red-800">{error}</p>{/if}
        <form onsubmit={enviar} class="flex flex-col gap-3" aria-busy={cargando}>
            <label for="email" class="text-sm font-medium">Correo electrónico</label>
            <input
                id="email"
                name="email"
                type="email"
                required
                maxlength="254"
                autocomplete="email"
                disabled={cargando}
                class="rounded-lg border-slate-300 focus:ring-green-600 focus:border-green-600"
            />
            <button disabled={cargando} class="rounded-lg bg-green-700 hover:bg-green-800 text-white py-3 mt-2 disabled:opacity-60"
                >{cargando ? 'Enviando…' : 'Enviar enlace'}</button
            >
        </form>
        <p class="text-sm text-slate-600 mt-5">Si ingresás únicamente con Google, usá «Continuar con Google» en el inicio de sesión.</p>
        <a href="/login" class="inline-block mt-6 text-green-700 underline underline-offset-4">Volver a ingresar</a>
    </section>
</main>
