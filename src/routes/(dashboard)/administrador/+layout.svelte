<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import type { Snippet } from 'svelte';

    let { children }: { children: Snippet } = $props();
    let cerrandoSesion = $state(false);
    let errorSesion = $state('');

    const opciones = [
        { nombre: 'Resumen', ruta: '/administrador' },
        { nombre: 'Ubicaciones', ruta: '/administrador/ubicaciones' },
        { nombre: 'Categorias', ruta: '/administrador/categorias' },
        { nombre: 'Organizadores', ruta: '/administrador/organizadores' },
    ];

    const rutaActual = $derived(page.url.pathname.replace(/\/$/, '') || '/');

    const tituloActual = $derived(opciones.find((opcion) => opcion.ruta === rutaActual)?.nombre ?? 'Home');

    async function cerrarSesion() {
        if (cerrandoSesion) return;
        cerrandoSesion = true;
        errorSesion = '';
        try {
            const respuesta = await fetch('/api/auth/logout');
            if (!respuesta.ok) throw new Error('No se pudo cerrar sesión');
            await goto('/', { replaceState: true, invalidateAll: true });
        } catch {
            errorSesion = 'No se pudo cerrar sesión. Intentá nuevamente.';
        } finally {
            cerrandoSesion = false;
        }
    }
</script>

<svelte:head>
    <title>{tituloActual} | Cerro Largo 360</title>
</svelte:head>

<div class="flex h-dvh min-w-275 overflow-hidden bg-[#f7f5f0] font-Poppins">
    <aside class="flex h-full w-72 shrink-0 flex-col border-r border-[#bfd0c3] bg-[#d7e5db]">
        <div class="shrink-0 border-b border-[#bfd0c3] px-6 py-7">
            <a href="/administrador" class="text-xl font-bold text-[#26382e] no-underline">
                Cerro Largo <span class="text-[#527b62]">360</span>
            </a>
            <p class="mt-2 text-xs font-medium text-[#52645a]">Panel de administración</p>
        </div>

        <nav class="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-label="Navegación del administrador">
            <p class="mb-3 px-3 text-[11px] font-bold tracking-wider text-[#667c6d]">ADMINISTRACIÓN</p>
            <div class="flex flex-col gap-1">
                {#each opciones as opcion (opcion.ruta)}
                    <a
                        href={opcion.ruta}
                        aria-current={rutaActual === opcion.ruta ? 'page' : undefined}
                        class={`block rounded-xl px-4 py-3 text-sm font-medium no-underline transition-colors ${
                            rutaActual === opcion.ruta ? 'bg-white text-[#26382e] shadow-sm' : 'text-[#405649] hover:bg-white/60'
                        }`}>{opcion.nombre}</a
                    >
                {/each}
            </div>
        </nav>

        <div class="mt-auto shrink-0 border-t border-[#bfd0c3] p-4">
            {#if errorSesion}
                <p class="mb-3 text-xs text-red-700" role="alert">{errorSesion}</p>
            {/if}
            <button
                type="button"
                onclick={cerrarSesion}
                disabled={cerrandoSesion}
                class="w-full cursor-pointer rounded-xl border border-[#d2aaaa] px-4 py-3 text-left text-sm font-semibold text-[#a44242] transition-colors hover:bg-[#f6e5e5] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
        </div>
    </aside>

    <div class="flex h-full min-w-0 flex-1 flex-col">
        <header class="flex h-20 shrink-0 items-center justify-between border-b border-[#e0e6df] bg-white px-8">
            <div>
                <p class="text-xs text-[#78877d]">Administración / {tituloActual}</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="text-right">
                    <p class="text-sm font-semibold text-[#26382e]">Administrador</p>
                    <p class="text-xs text-[#78877d]">Cerro Largo 360</p>
                </div>
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7e5db] font-bold text-[#365b43]" aria-hidden="true">A</div>
            </div>
        </header>
        <main class="min-h-0 flex-1 overflow-y-auto p-8">
            {@render children()}
        </main>
    </div>
</div>
