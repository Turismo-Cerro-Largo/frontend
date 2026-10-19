<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';

    type Favorito = {
        id: number;
        creado_en: string;
        ubicacion: {
            id: number;
            nombre: string;
            localidad: string;
            direccion: string | null;
            estado: string;
            categoria: { nombre: string };
        };
    };
    type Respuesta = {
        usuario: { id: number; nombres: string; apellidos: string; email: string };
        favoritos: Favorito[];
        total: number;
        offset: number;
        limit: number;
    };

    let datos = $state<Respuesta | null>(null);
    let pagina = $state(0);
    let cargando = $state(true);
    let error = $state('');
    const limite = 12;
    let version = 0;
    let controller: AbortController | null = null;
    const fecha = (v: string) => new Date(v).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let totalPaginas = $derived(Math.max(1, Math.ceil((datos?.total ?? 0) / limite)));

    async function cargar() {
        controller?.abort();
        const actual = ++version;
        const solicitud = new AbortController();
        controller = solicitud;
        cargando = true;
        error = '';
        try {
            const id = page.params.id ?? "";
            const params = new URLSearchParams({ offset: String(pagina * limite), limit: String(limite) });
            const res = await fetch(`/api/admin/usuarios/${encodeURIComponent(id)}/favoritos?${params}`, {
                credentials: 'include',
                signal: solicitud.signal,
            });
            if (!res.ok) {
                throw new Error(
                    res.status === 404
                        ? 'Usuario no encontrado.'
                        : res.status === 401 || res.status === 403
                          ? 'No tenés permisos para consultar favoritos.'
                          : `No se pudieron cargar los favoritos (${res.status}).`
                );
            }
            const resultado: Respuesta = await res.json();
            if (actual === version) datos = resultado;
        } catch (e) {
            if (!solicitud.signal.aborted && actual === version) {
                error = e instanceof Error ? e.message : 'Error al cargar los favoritos.';
            }
        } finally {
            if (actual === version) cargando = false;
        }
    }

    function cambiarPagina(siguiente: number) {
        if (siguiente < 0 || siguiente >= totalPaginas || cargando) return;
        pagina = siguiente;
        void cargar();
    }

    onMount(() => {
        void cargar();
        return () => {
            version++;
            controller?.abort();
        };
    });
</script>

<svelte:head>
    <title>Favoritos del usuario | Cerro Largo 360</title>
</svelte:head>

<section class="mx-auto w-full max-w-6xl space-y-6 pb-8 text-[#26382e]">
    <a href={`/administrador/usuarios/${page.params.id}`} class="inline-block text-sm font-semibold text-[#477967] hover:underline">← Volver al perfil</a>

    <header class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e0e6df] bg-white p-6 shadow-sm">
        <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-[#718178]">Administración de usuarios</p>
            <h1 class="mt-2 text-2xl font-semibold">Favoritos guardados</h1>
            {#if datos}
                <p class="mt-1 text-sm text-slate-500">{datos.usuario.nombres} {datos.usuario.apellidos} · {datos.usuario.email}</p>
            {/if}
        </div>
        <button
            type="button"
            onclick={() => void cargar()}
            disabled={cargando}
            class="rounded-xl border border-[#bfd0c3] px-4 py-2 text-sm font-medium hover:bg-[#f4f8f3] disabled:opacity-50">Actualizar</button
        >
    </header>

    <div class="overflow-hidden rounded-2xl border border-[#e0e6df] bg-white shadow-sm">
        {#if error}
            <p role="alert" class="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
        {:else if cargando}
            <p class="p-8 text-center text-sm text-slate-500">Cargando favoritos…</p>
        {:else if !datos || datos.favoritos.length === 0}
            <p class="p-8 text-center text-sm text-slate-500">Este usuario no tiene favoritos guardados.</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full min-w-[720px] text-left text-sm">
                    <thead class="bg-[#f7f9f6] text-[#69776c]">
                        <tr>
                            <th class="p-4">Lugar favorito</th>
                            <th class="p-4">Categoría</th>
                            <th class="p-4">Localidad</th>
                            <th class="p-4">Dirección</th>
                            <th class="p-4">Fecha guardada</th>
                            <th class="p-4">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each datos.favoritos as favorito (favorito.id)}
                            <tr class="border-t border-slate-100 hover:bg-[#f9fbf8]">
                                <td class="p-4 font-semibold">{favorito.ubicacion.nombre}</td>
                                <td class="p-4">{favorito.ubicacion.categoria.nombre}</td>
                                <td class="p-4">{favorito.ubicacion.localidad}</td>
                                <td class="p-4">{favorito.ubicacion.direccion ?? 'No indicada'}</td>
                                <td class="p-4">{fecha(favorito.creado_en)}</td>
                                <td class="p-4">{favorito.ubicacion.estado}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
        <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-sm text-slate-500">
            <span>{datos?.total ?? 0} favoritos</span>
            <div class="flex items-center gap-3">
                <button type="button" disabled={pagina === 0 || cargando} onclick={() => cambiarPagina(pagina - 1)} class="rounded-lg border px-3 py-2 disabled:opacity-40"
                    >Anterior</button
                >
                <span>{pagina + 1} / {totalPaginas}</span>
                <button
                    type="button"
                    disabled={pagina + 1 >= totalPaginas || cargando}
                    onclick={() => cambiarPagina(pagina + 1)}
                    class="rounded-lg border px-3 py-2 disabled:opacity-40">Siguiente</button
                >
            </div>
        </footer>
    </div>
</section>
