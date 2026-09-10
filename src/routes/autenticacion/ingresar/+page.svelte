<script lang="ts">
    import SvgGoogle from "$lib/components/svg/SvgGoogle.svelte";
</script>

<svelte:head>
    <title>Ingresar · CerroLargo360</title>
</svelte:head>

<div class="flex items-center justify-center w-full min-h-dvh px-4">
    <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
            <h2 class="text-lg font-semibold text-green-600 tracking-wide">
                CerroLargo360
            </h2>
            <h1 class="text-2xl font-bold text-slate-800 mt-1">Ingresar</h1>
        </div>

        <form class="flex flex-col gap-4">
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

            <button
                type="submit"
                class="h-11 bg-green-600 hover:bg-green-700 active:scale-98 transition-all cursor-pointer text-white font-medium rounded-lg"
            >
                Ingresar
            </button>

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
        </form>

        <p class="text-sm text-slate-500 text-center mt-6">
            ¿No tenés cuenta?
            <a
                href="/autenticacion/registrarse"
                class="text-green-600 font-medium hover:underline"
            >
                Registrate
            </a>
        </p>
    </div>
</div>
