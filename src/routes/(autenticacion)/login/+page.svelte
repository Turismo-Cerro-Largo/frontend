<script>
    import SvgGoogle from "$lib/components/svg/SvgGoogle.svelte";
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

<main class="min-h-dvh w-full flex items-center justify-center px-4 py-6">
    <form class="w-full max-w-sm flex flex-col gap-4">
        <span class="font-Maru font-medium text-2xl">
            Inicia sesión en tu cuenta
        </span>

        <div class="flex flex-col gap-6">
            <!-- Email -->
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
                    autocomplete="current-password"
                    required
                    minlength="8"
                />
            </div>

            <div class="block text-sm text-black/70 font-medium text-center">
                <a href="/registro">¿ No tienes cuenta ?</a>
            </div>

            <!-- Accion -->
            <button
                class="w-full text-lg font-Maru rounded-lg font-semibold h-10 bg-amber-500 hover:bg-amber-600 transition-colors"
            >
                Login
            </button>

            <!-- Google -->
            <a
                type="button"
                href="/"
                class="w-full h-11 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 flex items-center justify-center gap-2 text-slate-700 font-medium"
            >
                <span class="w-5 h-5 shrink-0">
                    <SvgGoogle />
                </span>
                <span>Continuar con Google</span>
            </a>
        </div>
    </form>
</main>
