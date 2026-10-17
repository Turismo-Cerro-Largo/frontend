<script lang="ts">
    import { onMount } from 'svelte';
    type Rol = 'TURISTA' | 'ADMINISTRADOR';
    type Usuario = {
        id: number;
        nombres: string;
        apellidos: string;
        email: string;
        departamento: string | null;
        rol: Rol;
        creado_en: string;
        _count: { comentarios: number; favoritos: number };
    };
    type Datos = { usuarios: Usuario[]; total: number; offset: number; limit: number; resumen: { turistas: number; administradores: number; recientes: number } };
    let usuarios = $state<Usuario[]>([]);
    let total = $state(0);
    let resumen = $state({ turistas: 0, administradores: 0, recientes: 0 });
    let buscar = $state('');
    let rol = $state('');
    let departamento = $state('');
    let pagina = $state(0);
    const tamano = 12;
    let cargando = $state(true);
    let error = $state('');
    let revision = 0;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let paginaMax = $derived(Math.max(1, Math.ceil(total / tamano)));
    const fecha = (v: string) => new Date(v).toLocaleDateString('es-UY');

    async function cargar() {
        const rev = ++revision;
        cargando = true;
        error = '';
        try {
            const query = new URLSearchParams({ offset: String(pagina * tamano), limit: String(tamano) });
            if (buscar.trim()) query.set('buscar', buscar.trim());
            if (rol) query.set('rol', rol);
            if (departamento.trim()) query.set('departamento', departamento.trim());
            const r = await fetch(`/api/admin/usuarios?${query}`, { credentials: 'include', cache: 'no-store' });
            if (!r.ok) throw new Error(r.status === 403 ? 'No tenés permisos de administrador.' : `No se pudieron cargar los usuarios (${r.status}).`);
            const data: Datos = await r.json();
            if (rev !== revision) return;
            usuarios = data.usuarios;
            total = data.total;
            resumen = data.resumen;
        } catch (e) {
            if (rev === revision) error = e instanceof Error ? e.message : 'Error de conexión';
        } finally {
            if (rev === revision) cargando = false;
        }
    }
    function filtrar() {
        pagina = 0;
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            void cargar();
        }, 280);
    }
    function filtroInmediato() {
        pagina = 0;
        clearTimeout(debounce);
        void cargar();
    }
    function cambiarPagina(n: number) {
        if (n < 0 || n >= paginaMax) return;
        pagina = n;
        void cargar();
    }
    onMount(() => {
        void cargar();
        return () => {
            clearTimeout(debounce);
            revision++;
        };
    });
</script>

<svelte:head><title>Gestión de usuarios | Cerro Largo 360</title></svelte:head>
<section class="mx-auto w-full min-w-0 max-w-7xl space-y-6 pb-8 text-[#26382e]">
    <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-3xl font-semibold">Gestión de usuarios</h1>
            <p class="mt-1 text-sm text-[#718178]">Consultá turistas y administradores registrados.</p>
        </div>
        <button
            type="button"
            onclick={() => void cargar()}
            disabled={cargando}
            class="rounded-xl border border-[#bfd0c3] bg-white px-4 py-2 text-sm font-medium disabled:opacity-60">Actualizar</button
        >
    </header>
    <div class="grid gap-4 sm:grid-cols-3">
        {#each [{ t: 'Turistas', v: resumen.turistas }, { t: 'Administradores', v: resumen.administradores }, { t: 'Registrados en 30 días', v: resumen.recientes }] as estadistica}
            <div class="rounded-2xl border border-[#e0e6df] bg-white p-5 shadow-sm">
                <p class="text-sm text-slate-500">{estadistica.t}</p>
                <p class="mt-2 text-3xl font-semibold">{estadistica.v}</p>
            </div>
        {/each}
    </div>
    <div class="rounded-2xl border border-[#e0e6df] bg-white p-5 shadow-sm">
        <div class="grid gap-3 md:grid-cols-3">
            <label class="block min-w-0 text-sm font-medium"
                >Buscar por nombre o correo<input
                    type="search"
                    bind:value={buscar}
                    oninput={filtrar}
                    placeholder="Buscar usuario..."
                    class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                /></label
            >
            <label class="block text-sm font-medium"
                >Rol<select bind:value={rol} onchange={filtroInmediato} class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    ><option value="">Todos</option><option value="TURISTA">Turista</option><option value="ADMINISTRADOR">Administrador</option></select
                ></label
            >
            <label class="block text-sm font-medium"
                >Departamento<input
                    bind:value={departamento}
                    oninput={filtrar}
                    placeholder="Ej. Cerro Largo"
                    class="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5"
                /></label
            >
        </div>
        {#if error}<p role="alert" class="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>{/if}
        <div class="mt-5 w-full overflow-x-auto">
            <table class="w-full min-w-190 text-left text-sm">
                <thead class="border-b border-slate-200 bg-[#f7f9f6] text-xs text-[#69776c]"
                    ><tr
                        ><th class="p-3">Usuario</th><th class="p-3">Departamento</th><th class="p-3">Rol</th><th class="p-3">Registro</th><th class="p-3">Actividad</th><th
                            class="p-3 text-right">Acción</th
                        ></tr
                    ></thead
                >
                <tbody>
                    {#each usuarios as u (u.id)}
                        <tr class="border-b border-slate-100 hover:bg-[#f9fbf8]"
                            ><td class="p-3"
                                ><div class="font-medium">{u.nombres} {u.apellidos}</div>
                                <div class="text-xs text-slate-500">{u.email}</div></td
                            ><td class="p-3">{u.departamento ?? 'No indicado'}</td><td class="p-3"
                                ><span class="rounded-full px-2 py-1 text-xs {u.rol === 'ADMINISTRADOR' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}"
                                    >{u.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Turista'}</span
                                ></td
                            ><td class="p-3">{fecha(u.creado_en)}</td><td class="p-3 text-xs">{u._count.comentarios} comentarios · {u._count.favoritos} favoritos</td><td
                                class="p-3 text-right"><a class="font-semibold text-[#477967] hover:underline" href={`/administrador/usuarios/${u.id}`}>Ver perfil</a></td
                            ></tr
                        >
                    {/each}
                    {#if !cargando && usuarios.length === 0}<tr><td colspan="6" class="p-8 text-center text-slate-500">No se encontraron usuarios.</td></tr>{/if}
                </tbody>
            </table>
        </div>
        <footer class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <p>{cargando ? 'Cargando…' : `${total} usuarios encontrados`}</p>
            <div class="flex items-center gap-3">
                <button type="button" disabled={cargando || pagina === 0} onclick={() => cambiarPagina(pagina - 1)} class="rounded-lg border px-3 py-2 disabled:opacity-40"
                    >Anterior</button
                ><span>{pagina + 1} / {paginaMax}</span><button
                    type="button"
                    disabled={cargando || pagina + 1 >= paginaMax}
                    onclick={() => cambiarPagina(pagina + 1)}
                    class="rounded-lg border px-3 py-2 disabled:opacity-40">Siguiente</button
                >
            </div>
        </footer>
    </div>
</section>
