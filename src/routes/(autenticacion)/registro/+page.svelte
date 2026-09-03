<script lang="ts">
    import SvgGoogle from "$lib/components/svg/SvgGoogle.svelte";
    import { slide } from "svelte/transition";

    let modo = $state<"turista" | "organizador">("turista");
</script>

<svelte:head>
    <title>Registro</title>
</svelte:head>

<form enctype="multipart/form-data" class="w-full max-w-sm flex flex-col gap-4">
    <span class="font-Maru font-medium text-2xl"> Crea tu cuenta </span>

    <!-- Selector de rol -->
    <div class="flex flex-row gap-2">
        <button
            class="flex-1 hover:cursor-pointer hover:bg-amber-600 rounded-md border-2 border-amber-600 h-12 md:h-10 font-Maru font-semibold"
            class:bg-amber-600={modo === "turista"}
            class:text-white={modo === "turista"}
            onclick={() => (modo = "turista")}
        >
            Turista
        </button>
        <button
            class="flex-1 hover:cursor-pointer hover:bg-amber-600 rounded-md border-2 border-amber-600 h-12 md:h-10 font-Maru font-semibold"
            class:bg-amber-600={modo === "organizador"}
            class:text-white={modo === "organizador"}
            onclick={() => (modo = "organizador")}
        >
            Organizador
        </button>
    </div>

    <div class="flex flex-col gap-6">
        <!-- Correo -->
        <div>
            <label for="email" class="block text-sm font-medium mb-2">
                Ingrese su correo
            </label>
            <input
                id="email"
                class="w-full h-12 px-4 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                type="email"
                placeholder="test@correo.com"
                autocomplete="email"
                minlength="8"
                required
            />
        </div>

        {#if modo === "organizador"}
            <div transition:slide>
                <!-- Cedula -->
                <div>
                    <label for="cedula" class="block text-sm font-medium mb-2">
                        Ingrese su cédula
                    </label>
                    <input
                        id="cedula"
                        class="w-full h-12 px-4 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        type="text"
                        placeholder="12345678"
                        autocomplete="off"
                        required
                    />
                </div>

                <!-- RUT/RUK -->
                <div class="mt-4">
                    <label for="rut" class="block text-sm font-medium mb-2">
                        Ingrese su RUT o RUK
                    </label>
                    <input
                        id="rut"
                        class="w-full h-12 px-4 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        type="text"
                        placeholder="12.345.678-9"
                        autocomplete="off"
                        required
                    />
                </div>

                <!-- Cedula -->
                <div class="mt-4">
                    <label for="rut" class="block text-sm font-medium mb-2">
                        Fotografia de la cedula
                    </label>
                    <input
                        id="rut"
                        name="cedula"
                        class="w-full h-12 px-4 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                        required
                    />
                    <p class="text-sm text-slate-500 mt-1">
                        Formatos permitidos: PNG, JPEG, WebP
                    </p>
                </div>
            </div>
        {/if}

        <!-- Contra -->
        <div>
            <label for="password" class="block text-sm font-medium mb-2">
                Ingrese su contraseña
            </label>
            <input
                id="password"
                type="password"
                class="w-full h-12 px-4 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="••••••••"
                autocomplete="new-password"
                required
                minlength="8"
            />
        </div>

        <!-- login -->
        <div class="block text-sm text-black/70 font-medium text-center">
            <a href="/login">¿ Tienes cuenta ? Inicia sesión</a>
        </div>

        <button
            class="w-full text-lg font-Maru rounded-lg font-semibold h-10 bg-amber-500 hover:bg-amber-600 transition-colors"
        >
            Registrar cuenta
        </button>

        <!-- Google -->
        {#if modo === "turista"}
            <a
                in:slide
                out:slide
                type="button"
                href="/"
                class="w-full h-11 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 flex items-center justify-center gap-2 text-slate-700 font-medium"
            >
                <span class="w-5 h-5 shrink-0">
                    <SvgGoogle />
                </span>
                <span>Continuar con Google</span>
            </a>
        {/if}
    </div>
</form>
