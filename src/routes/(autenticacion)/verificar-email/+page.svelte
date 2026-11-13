<script lang="ts">
    import { onMount } from 'svelte';



    let email = $state('');
    let esOrganizador = $state(false);
    let codigo = $state('');
    let cargando = $state(false);
    let reenviando = $state(false);
    let completado = $state(false);
    let correoEnviado = $state(true);
    let error = $state('');
    let mensaje = $state('');

    onMount(() => {
        const guardado = sessionStorage.getItem(
            'registroPendiente'
        );

        if (!guardado) return;

        try {
            const datos = JSON.parse(guardado);

            if (typeof datos.email === 'string') {
                email = datos.email;
            }



            correoEnviado = datos.enviado !== false;
        } catch {
            sessionStorage.removeItem('registroPendiente');
        }
    });

    async function confirmar(evento: SubmitEvent) {
        evento.preventDefault();

        if (cargando) return;

        cargando = true;
        error = '';
        mensaje = '';

        try {
            const respuesta = await fetch(
                '/api/auth/verificacion/confirmar',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    codigo
                })
                }
            );

            const datos = await respuesta.json()
                .catch(() => null);

            if (!respuesta.ok) {
                error = datos?.message ||
                    'El código es incorrecto o venció.';
                return;
            }
            esOrganizador = datos.tipo === 'ORGANIZADOR';

            completado = true;
            mensaje = datos.message;

            sessionStorage.removeItem('registroPendiente');
        } catch {
            error = 'No se pudo conectar con el servidor.';
        } finally {
            cargando = false;
        }
    }

    async function reenviar() {
        if (reenviando) return;

        reenviando = true;
        error = '';
        mensaje = '';

        try {
            const respuesta = await fetch(
                '/api/auth/verificacion/reenviar',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        
                    })
                }
            );

            const datos = await respuesta.json()
                .catch(() => null);

            if (!respuesta.ok) {
                error = datos?.message ||
                    'No se pudo solicitar otro código.';
                return;
            }

           correoEnviado = true;

            mensaje = datos?.message ||
            'Si tu cuenta sigue pendiente y se cumplen los límites de reenvío, recibirás otro código.';

            codigo = '';
        } catch {
            error = 'No se pudo conectar con el servidor.';
        } finally {
            reenviando = false;
        }
    }
</script>

<svelte:head>
    <title>Verificar correo · Cerro Largo 360</title>
</svelte:head>

<section
    class="min-h-dvh flex items-center justify-center
           bg-slate-50 px-4 py-8"
>
    <div
        class="w-full max-w-md rounded-2xl bg-white
               border border-slate-200 p-8 shadow-sm"
    >
        {#if completado}

            <div class="text-center space-y-5">
                <div class="text-5xl">✅</div>

                <h1 class="text-2xl font-bold text-green-700">
                    Correo verificado
                </h1>

                <p class="text-slate-600">
                    {mensaje}
                </p>

                {#if esOrganizador}
                    <p
                        class="rounded-lg bg-amber-50
                               p-4 text-sm text-amber-800"
                    >
                        Tu correo está confirmado.
                        Tu solicitud todavía debe ser
                        revisada y aprobada por el
                        administrador.
                    </p>
                {/if}

                <a
                    href="/login"
                    class="block rounded-lg bg-green-600
                           px-4 py-3 text-white font-medium
                           hover:bg-green-700"
                >
                    Ir al inicio de sesión
                </a>
            </div>

        {:else}

            <div class="text-center mb-7">
                <div class="text-4xl mb-4">✉️</div>

                <h1
                    class="text-2xl font-bold text-slate-800"
                >
                    Verificá tu correo
                </h1>

                <p class="text-slate-500 mt-3 text-sm">
                    Ingresá el código de 6 dígitos
                    que enviamos a tu email.
                </p>

                <p class="text-sm font-semibold
                          text-green-700 mt-2">
                    El código vence en 15 minutos.
                </p>
            </div>

            {#if !correoEnviado}
                <p
                    class="mb-4 rounded-lg bg-amber-50
                           p-3 text-sm text-amber-800"
                >
                    No se pudo enviar el primer correo.
                    Solicitá un código nuevo.
                </p>
            {/if}

            {#if error}
                <p
                    role="alert"
                    class="mb-4 rounded-lg bg-red-50
                           p-3 text-sm text-red-700"
                >
                    {error}
                </p>
            {/if}

            {#if mensaje}
                <p
                    role="status"
                    class="mb-4 rounded-lg bg-green-50
                           p-3 text-sm text-green-700"
                >
                    {mensaje}
                </p>
            {/if}

            <form
                onsubmit={confirmar}
                class="flex flex-col gap-5"
            >
                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium
                               text-slate-700 mb-2"
                    >
                        Correo electrónico
                    </label>

                    <input
                 id="email"
                 type="email"
                bind:value={email}
                readonly
                required
                autocomplete="email"
                class="w-full rounded-lg
                 border-slate-300
                  bg-slate-100
                  text-slate-600
                 cursor-not-allowed
                 focus:ring-0
                 focus:border-slate-300"
/>


                </div>
                <div>
                    <label
                        for="codigo"
                        class="block text-sm font-medium
                               text-slate-700 mb-2"
                    >
                        Código de verificación
                    </label>

                    <input
                        id="codigo"
                        type="text"
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        pattern={'[0-9]{6}'}
                        maxlength="6"
                        minlength="6"
                        placeholder="000000"
                        bind:value={codigo}
                        required
                        class="w-full rounded-lg
                               border-slate-300 p-3
                               text-center text-2xl
                               tracking-widest"
                    />
                </div>

                <button
    type="submit"
    disabled={cargando}
    class="w-full h-12 flex items-center justify-center
           rounded-lg bg-green-600 px-4
           font-semibold text-white
           hover:bg-green-700
           transition-colors
           disabled:opacity-60
           disabled:cursor-not-allowed"
>
    {cargando
        ? 'Verificando...'
        : 'Verificar mi cuenta'}
</button>
            </form>

            <div class="text-center mt-6 space-y-3">
                <p class="text-sm text-slate-500">
                    ¿No recibiste el código?
                </p>

                <button
                    type="button"
                    onclick={reenviar}
                    disabled={reenviando || !email.trim()}
                    class="text-green-700 font-semibold
                           hover:underline
                           disabled:opacity-50"
                >
                    {reenviando
                        ? 'Solicitando...'
                        : 'Reenviar código'}
                </button>

                <p class="text-xs text-slate-400">
                    Revisá también la carpeta de spam.
                </p>

                <a
                    href="/login"
                    class="inline-block text-sm
                           text-slate-500 hover:underline"
                >
                    Volver a iniciar sesión
                </a>
            </div>

        {/if}
    </div>
</section>