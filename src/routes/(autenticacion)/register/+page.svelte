<script lang="ts">
    import { goto } from '$app/navigation';
    import { slide } from 'svelte/transition';
    import SvgGoogle from '$lib/components/svg/SvgGoogle.svelte';

    let metodo = $state<'turista' | 'organizador'>('turista');

    let cargando = $state(false);
    let error = $state(false);

    const departamentos = [
        'Artigas',
        'Canelones',
        'Cerro Largo',
        'Colonia',
        'Durazno',
        'Flores',
        'Florida',
        'Lavalleja',
        'Maldonado',
        'Montevideo',
        'Paysandú',
        'Río Negro',
        'Rivera',
        'Rocha',
        'Salto',
        'San José',
        'Soriano',
        'Tacuarembó',
        'Treinta y Tres',
    ];

    const enviar = async (evento: SubmitEvent) => {
        evento.preventDefault();

        if (cargando) return;

        cargando = true;
        error = false;

        try {
            const formulario = evento.currentTarget as HTMLFormElement;
            const datos = new FormData(formulario);

            const endpoint = metodo === 'organizador' ? '/api/auth/register-organizador' : '/api/auth/register';

            const respuesta = await fetch(endpoint, {
                method: 'POST',
                body: datos,
            });

            if (!respuesta.ok) {
                error = true;
                return;
            }

            await goto(metodo === 'organizador' ? '/organizador' : '/turista', { replaceState: true });
        } catch {
            error = true;
        } finally {
            cargando = false;
        }
    };

    const ingresarConGoogle = () => {
        window.location.href = '/api/auth/google';
    };
</script>

<svelte:head>
    <title>Registrarse · CerroLargo360</title>
</svelte:head>

<section class="flex items-center justify-center w-full min-h-dvh px-4 py-8">
    <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
            <h2 class="text-lg font-semibold text-green-600 tracking-wide">CerroLargo360</h2>

            <h1 class="text-2xl font-bold text-slate-800 mt-1">Registrarse</h1>
        </div>

        <!-- Selector del tipo de cuenta -->
        <div class="flex flex-row my-5 border-b border-slate-200">
            <button
                type="button"
                disabled={cargando}
                onclick={() => {
                    metodo = 'turista';
                    error = false;
                }}
                class={[
                    'flex-1 text-center pb-2 border-b-2 transition-all cursor-pointer',
                    metodo === 'turista' ? 'border-green-600 text-slate-800 font-semibold text-base' : 'border-transparent text-slate-400 font-medium text-sm',
                ]}
            >
                Turista
            </button>

            <button
                type="button"
                disabled={cargando}
                onclick={() => {
                    metodo = 'organizador';
                    error = false;
                }}
                class={[
                    'flex-1 text-center pb-2 border-b-2 transition-all cursor-pointer',
                    metodo === 'organizador' ? 'border-green-600 text-slate-800 font-semibold text-base' : 'border-transparent text-slate-400 font-medium text-sm',
                ]}
            >
                Organizador
            </button>
        </div>

        <!-- Error -->
        {#if error}
            <div in:slide|local out:slide|local class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                No se pudo completar el registro. Revisá los datos ingresados.
            </div>
        {/if}

        <form onsubmit={enviar} enctype="multipart/form-data" class="flex flex-col gap-4" aria-busy={cargando}>
            <!-- CAMPOS TURISTA -->
            {#if metodo === 'turista'}
                <div transition:slide={{ duration: 200 }} class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1">
                        <label for="nombres" class="text-sm font-medium text-slate-700"> Nombres </label>

                        <input
                            disabled={cargando}
                            id="nombres"
                            name="nombres"
                            type="text"
                            required
                            minlength="1"
                            autocomplete="given-name"
                            class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="apellidos" class="text-sm font-medium text-slate-700"> Apellidos </label>

                        <input
                            disabled={cargando}
                            id="apellidos"
                            name="apellidos"
                            type="text"
                            required
                            minlength="1"
                            autocomplete="family-name"
                            class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                        />
                    </div>
                </div>
            {/if}

            <!-- CAMPO ORGANIZADOR -->
            {#if metodo === 'organizador'}
                <div transition:slide={{ duration: 200 }} class="flex flex-col gap-1">
                    <label for="nombreOrganizacion" class="text-sm font-medium text-slate-700"> Nombre de la organización </label>

                    <input
                        disabled={cargando}
                        id="nombreOrganizacion"
                        name="nombreOrganizacion"
                        type="text"
                        required
                        minlength="1"
                        class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                    />
                </div>
            {/if}

            <!-- EMAIL -->
            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-slate-700"> Correo electrónico </label>

                <input
                    disabled={cargando}
                    id="email"
                    name="email"
                    type="email"
                    required
                    autocomplete="email"
                    minlength="7"
                    maxlength="45"
                    pattern="^[a-zA-Z0-9._%+\-]+@(gmail\.com|tuta\.com|tutanota\.com|hotmail\.com|outlook\.com|live\.com|proton\.me|protonmail\.com|yahoo\.com|icloud\.com)$"
                    title="Por favor, usa un proveedor de correo reconocido (Gmail, Outlook, Hotmail, Tuta, Proton, Yahoo o iCloud)."
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                />
            </div>

            <!-- PASSWORD -->
            <div class="flex flex-col gap-1">
                <label for="password" class="text-sm font-medium text-slate-700"> Contraseña </label>

                <input
                    disabled={cargando}
                    id="password"
                    name="password"
                    type="password"
                    required
                    minlength="8"
                    maxlength="32"
                    autocomplete="new-password"
                    pattern="^(?=.*[a-z])(?=.*[A-Z]).*$"
                    title="La contraseña debe tener al menos 8 caracteres, una letra minúscula y una letra mayúscula."
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                />
            </div>

            <!-- DEPARTAMENTO -->
            <div class="flex flex-col gap-1">
                <label for="departamento" class="text-sm font-medium text-slate-700"> Departamento </label>

                <select
                    disabled={cargando}
                    id="departamento"
                    name="departamento"
                    required
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                >
                    <option value="" disabled selected> Seleccioná un departamento </option>

                    {#each departamentos as departamento}
                        <option value={departamento}>
                            {departamento}
                        </option>
                    {/each}
                </select>
            </div>

            <!-- CAMPOS EXCLUSIVOS TURISTA -->
            {#if metodo === 'turista'}
                <div transition:slide={{ duration: 200 }} class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1">
                        <label for="genero" class="text-sm font-medium text-slate-700"> Género </label>

                        <select
                            disabled={cargando}
                            id="genero"
                            name="genero"
                            required
                            class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                        >
                            <option value="" disabled selected> Seleccioná un género </option>

                            <option value="masculino"> Masculino </option>

                            <option value="femenino"> Femenino </option>

                            <option value="otro"> Otro </option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="fecha_nacimiento" class="text-sm font-medium text-slate-700"> Fecha de nacimiento </label>

                        <input
                            disabled={cargando}
                            id="fecha_nacimiento"
                            name="fecha_nacimiento"
                            type="date"
                            required
                            class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                        />
                    </div>
                </div>
            {/if}

            <!-- CAMPOS EXCLUSIVOS ORGANIZADOR -->
            {#if metodo === 'organizador'}
                <div transition:slide={{ duration: 250 }} class="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider"> Datos de Organizador </span>

                    <div class="flex flex-col gap-1">
                        <label for="rut" class="text-sm font-medium text-slate-700"> RUT / RUC </label>

                        <input
                            disabled={cargando}
                            id="rut"
                            name="rut"
                            type="text"
                            required
                            placeholder="Ej. 211234560018"
                            class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="telefono" class="text-sm font-medium text-slate-700"> Teléfono </label>

                        <input
                            disabled={cargando}
                            id="telefono"
                            name="telefono"
                            type="tel"
                            required
                            autocomplete="tel"
                            placeholder="Ej. 099 123 456"
                            class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="fotoCedulaFrente" class="text-sm font-medium text-slate-700"> Cédula (Frente) </label>

                        <input
                            disabled={cargando}
                            id="fotoCedulaFrente"
                            name="fotoCedulaFrente"
                            type="file"
                            accept="image/*,.pdf"
                            required
                            class="block w-full text-sm text-slate-500
                                file:mr-4
                                file:py-2
                                file:px-4
                                file:rounded-lg
                                file:border-0
                                file:text-sm
                                file:font-semibold
                                file:bg-green-50
                                file:text-green-700
                                hover:file:bg-green-100
                                cursor-pointer"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="fotoCedulaDorso" class="text-sm font-medium text-slate-700"> Cédula (Dorso) </label>

                        <input
                            disabled={cargando}
                            id="fotoCedulaDorso"
                            name="fotoCedulaDorso"
                            type="file"
                            accept="image/*,.pdf"
                            required
                            class="block w-full text-sm text-slate-500
                                file:mr-4
                                file:py-2
                                file:px-4
                                file:rounded-lg
                                file:border-0
                                file:text-sm
                                file:font-semibold
                                file:bg-green-50
                                file:text-green-700
                                hover:file:bg-green-100
                                cursor-pointer"
                        />
                    </div>
                </div>
            {/if}

            <!-- REGISTRARSE -->
            <button
                type="submit"
                disabled={cargando}
                class="h-11 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-98 transition-all cursor-pointer text-white font-medium rounded-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
                {#if cargando}
                    <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />

                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="opacity-75" />
                    </svg>

                    Registrando...
                {:else}
                    Registrarse
                {/if}
            </button>

            <!-- GOOGLE SOLO PARA TURISTA -->
            {#if metodo === 'turista'}
                <div transition:slide={{ duration: 200 }} class="flex flex-col gap-4">
                    <div class="flex items-center gap-3">
                        <div class="flex-1 h-px bg-slate-200"></div>

                        <span class="text-xs text-slate-400"> o </span>

                        <div class="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <button
                        disabled={cargando}
                        type="button"
                        onclick={ingresarConGoogle}
                        class="h-11 flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer text-slate-700 font-medium rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <div class="w-5 h-5">
                            <SvgGoogle />
                        </div>

                        Continuar con Google
                    </button>
                </div>
            {/if}
        </form>

        <p class="text-sm text-slate-500 text-center mt-6">
            ¿Ya tenés cuenta?

            <a href="/login" data-sveltekit-replacestate class="text-green-600 font-medium hover:underline"> Ingresar </a>
        </p>
    </div>
</section>
