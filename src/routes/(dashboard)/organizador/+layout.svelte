<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    let { children, data } = $props();

    let aprobado = $derived(data.estadoOrganizador === 'APROBADO');

    let ruta = $derived(page.url.pathname.replace(/\/$/, '') || '/');

    let inicioActivo = $derived(ruta === '/organizador');
    let crearActivo = $derived(ruta === '/organizador/eventos/nuevo');
    let eventosActivo = $derived(ruta === '/organizador/eventos' || (ruta.startsWith('/organizador/eventos/') && !crearActivo));
    let perfilActivo = $derived(ruta === '/organizador/perfil');

    async function cerrarSession() {
        const respuesta = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (!respuesta.ok) return;

        await goto('/', { replaceState: true, invalidateAll: true });
    }
</script>

<div class="min-h-screen bg-[#f7f5f0] font-Poppins lg:flex lg:h-screen lg:min-h-0 lg:overflow-hidden">
    <aside class="w-full border-b border-[#bfd0c3] bg-[#d7e5db] lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div class="flex h-full flex-col">
            <div class="px-6 py-7">
                <a href="/" class="text-xl font-bold text-[#26382e]">Cerro Largo 360</a>
                <p class="mt-1 text-sm text-[#52645a]">Panel del organizador</p>
            </div>

            <nav class="flex flex-col gap-2 px-4" aria-label="NavegaciĂłn del organizador">
                <a
                    href="/organizador"
                    aria-current={inicioActivo ? 'page' : undefined}
                    class={`rounded-xl px-4 py-3 text-sm font-medium text-[#26382e] transition ${inicioActivo ? 'bg-white shadow-sm' : 'hover:bg-white/70'}`}
                >
                    Inicio
                </a>
                {#if aprobado}
                    <a
                        href="/organizador/eventos"
                        aria-current={eventosActivo ? 'page' : undefined}
                        class={`rounded-xl px-4 py-3 text-sm font-medium text-[#26382e] transition ${eventosActivo ? 'bg-white shadow-sm' : 'hover:bg-white/70'}`}
                    >
                        Mis eventos
                    </a>
                    <a
                        href="/organizador/eventos/nuevo"
                        aria-current={crearActivo ? 'page' : undefined}
                        class={`rounded-xl px-4 py-3 text-sm font-medium text-[#26382e] transition ${crearActivo ? 'bg-white shadow-sm' : 'hover:bg-white/70'}`}
                    >
                        + Crear evento
                    </a>
                {/if}
                <a
                    href="/organizador/perfil"
                    aria-current={perfilActivo ? 'page' : undefined}
                    class={`rounded-xl px-4 py-3 text-sm font-medium text-[#26382e] transition ${perfilActivo ? 'bg-white shadow-sm' : 'hover:bg-white/70'}`}
                >
                    Mi perfil
                </a>
            </nav>

            {#if !aprobado}
                <div class="mx-4 mt-5 rounded-xl border border-[#dbc995] bg-[#fff8e5] p-3 text-sm text-[#765e19]">
                    {data.estadoOrganizador === 'RECHAZADO' ? 'Solicitud rechazada. Consultá tu perfil para más información.' : 'Tu cuenta está pendiente de aprobación.'}
                </div>
            {/if}
            <div class="mt-auto px-4 py-6">
                <button
                    onclick={cerrarSession}
                    type="button"
                    class="w-full rounded-xl cursor-pointer border border-[#9daf9f] px-4 py-3 text-left text-sm font-medium text-[#26382e] transition hover:bg-white/70"
                >
                    Cerrar sesion
                </button>
            </div>
        </div>
    </aside>

    <main class="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        {@render children()}
    </main>
</div>
