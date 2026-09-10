<script lang="ts">
    import { slide } from "svelte/transition";
    import SvgGoogle from "$lib/components/svg/SvgGoogle.svelte";

    let metodo = $state<"turista" | "organizador">("turista");

    const fechaHoy = new Date();
    fechaHoy.setFullYear(fechaHoy.getFullYear() - 18);
    const fechaMaximaMayorEdad = fechaHoy.toISOString().split("T")[0];

    const departamentos = [
        "Artigas",
        "Canelones",
        "Cerro Largo",
        "Colonia",
        "Durazno",
        "Flores",
        "Florida",
        "Lavalleja",
        "Maldonado",
        "Montevideo",
        "Paysandú",
        "Río Negro",
        "Rivera",
        "Rocha",
        "Salto",
        "San José",
        "Soriano",
        "Tacuarembó",
        "Treinta y Tres",
    ];
</script>

<svelte:head>
    <title>Registrarse · CerroLargo360</title>
</svelte:head>

<div class="flex items-center justify-center w-full min-h-dvh px-4 py-8">
    <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
            <h2 class="text-lg font-semibold text-green-600 tracking-wide">
                CerroLargo360
            </h2>
            <h1 class="text-2xl font-bold text-slate-800 mt-1">Registrarse</h1>
        </div>

        <div class="flex flex-row my-5 border-b border-slate-200">
            <button
                type="button"
                onclick={() => (metodo = "turista")}
                class={[
                    "flex-1 text-center pb-2 border-b-2 transition-all cursor-pointer",
                    metodo === "turista"
                        ? "border-green-600 text-slate-800 font-semibold text-base"
                        : "border-transparent text-slate-400 font-medium text-sm",
                ]}
            >
                Turista
            </button>
            <button
                type="button"
                onclick={() => (metodo = "organizador")}
                class={[
                    "flex-1 text-center pb-2 border-b-2 transition-all cursor-pointer",
                    metodo === "organizador"
                        ? "border-green-600 text-slate-800 font-semibold text-base"
                        : "border-transparent text-slate-400 font-medium text-sm",
                ]}
            >
                Organizador
            </button>
        </div>

        <form enctype="multipart/form-data" class="flex flex-col gap-4">
            <input type="hidden" name="metodo" value={metodo} />

            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-slate-700">
                    Correo electrónico
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                />
            </div>

            <div class="flex flex-col gap-1">
                <label
                    for="password"
                    class="text-sm font-medium text-slate-700"
                >
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minlength="8"
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                />
            </div>

            <div class="flex flex-col gap-1">
                <label for="genero" class="text-sm font-medium text-slate-700">
                    Género
                </label>
                <select
                    id="genero"
                    name="genero"
                    required
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                >
                    <option value="" disabled selected
                        >Seleccioná un género</option
                    >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                </select>
            </div>

            <div class="flex flex-col gap-1">
                <label
                    for="localidad"
                    class="text-sm font-medium text-slate-700"
                >
                    Localidad
                </label>
                <select
                    id="localidad"
                    name="localidad"
                    required
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                >
                    <option value="" disabled selected
                        >Seleccioná una localidad</option
                    >
                    {#each departamentos as depto}
                        <option value={depto}>{depto}</option>
                    {/each}
                </select>
            </div>

            <div class="flex flex-col gap-1">
                <label
                    for="fechaNacimiento"
                    class="text-sm font-medium text-slate-700"
                >
                    Fecha de nacimiento
                </label>
                <input
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    type="date"
                    max={metodo === "organizador"
                        ? fechaMaximaMayorEdad
                        : undefined}
                    required
                    class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                />
            </div>

            {#if metodo === "organizador"}
                <div
                    transition:slide={{ duration: 250 }}
                    class="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden"
                >
                    <span
                        class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                        Datos de Organizador
                    </span>

                    <div class="flex flex-col gap-1">
                        <label
                            for="cedula"
                            class="text-sm font-medium text-slate-700"
                        >
                            Cédula de Identidad
                        </label>
                        <input
                            id="cedula"
                            name="cedula"
                            type="text"
                            required
                            placeholder="Ej. 1.234.567-8"
                            class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label
                            for="rut"
                            class="text-sm font-medium text-slate-700"
                        >
                            RUT / RUC
                        </label>
                        <input
                            id="rut"
                            name="rut"
                            type="text"
                            required
                            placeholder="Ej. 211234560018"
                            class="rounded-lg border-slate-300 text-slate-800 focus:border-green-600 focus:ring-green-600"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label
                            for="fotoCedulaFrente"
                            class="text-sm font-medium text-slate-700"
                        >
                            Cédula (Frente)
                        </label>
                        <input
                            id="fotoCedulaFrente"
                            name="fotoCedulaFrente"
                            type="file"
                            accept="image/*,.pdf"
                            required
                            class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label
                            for="fotoCedulaDorso"
                            class="text-sm font-medium text-slate-700"
                        >
                            Cédula (Dorso)
                        </label>
                        <input
                            id="fotoCedulaDorso"
                            name="fotoCedulaDorso"
                            type="file"
                            accept="image/*,.pdf"
                            required
                            class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                        />
                    </div>
                </div>
            {/if}

            <button
                type="submit"
                class="h-11 bg-green-600 hover:bg-green-700 active:scale-98 transition-all cursor-pointer text-white font-medium rounded-lg mt-2"
            >
                Registrarse
            </button>

            {#if metodo === "turista"}
                <div
                    transition:slide={{ duration: 200 }}
                    class="flex flex-col gap-4"
                >
                    <div class="flex items-center gap-3">
                        <div class="flex-1 h-px bg-slate-200"></div>
                        <span class="text-xs text-slate-400">o</span>
                        <div class="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <button
                        type="button"
                        class="h-11 flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer text-slate-700 font-medium rounded-lg"
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
            <a
                href="/autenticacion/ingresar"
                class="text-green-600 font-medium hover:underline"
            >
                Ingresar
            </a>
        </p>
    </div>
</div>
