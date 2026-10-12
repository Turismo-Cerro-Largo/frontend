<script lang="ts">
    import { onMount } from 'svelte';
    type Estado = 'PUBLICADO' | 'OCULTADO';
    type Categoria = { id: number; nombre: string };
    type Ubicacion = {
        id: number;
        nombre: string;
        descripcion: string;
        localidad: string;
        direccion: string | null;
        estado: Estado;
        latitud: number;
        longitud: number;
        categoria: Categoria;
        recursos: { uri: string; tipo: string }[];
    };
    let ubicaciones = $state<Ubicacion[]>([]),
        categorias = $state<Categoria[]>([]);
    let buscar = $state(''),
        busqueda = $state(''),
        estado = $state(''),
        categoria = $state(''),
        pagina = $state(0),
        total = $state(0),
        publicadas = $state(0);
    let cargando = $state(true),
        error = $state(''),
        procesando = $state<number | null>(null),
        confirmar = $state<Ubicacion | null>(null);
    const limite = 12;
    let solicitud = 0;
    async function cargar() {
        const n = ++solicitud;
        cargando = true;
        error = '';
        try {
            const q = new URLSearchParams({ offset: String(pagina * limite), limit: String(limite) });
            if (busqueda) q.set('buscar', busqueda);
            if (estado) q.set('estado', estado);
            if (categoria) q.set('categoria', categoria);
            const r = await fetch(`/api/admin/ubicaciones?${q}`, { credentials: 'include' });
            if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'Acceso reservado a administradores.' : `No se pudo cargar (${r.status})`);
            const data = await r.json();
            if (n === solicitud) {
                ubicaciones = data.ubicaciones;
                total = data.total;
                publicadas = data.publicadas;
            }
        } catch (e) {
            if (n === solicitud) error = e instanceof Error ? e.message : 'Error inesperado';
        } finally {
            if (n === solicitud) cargando = false;
        }
    }
    async function cargarCategorias() {
        try {
            const r = await fetch('/api/categorias', { credentials: 'include' });
            if (r.ok) {
                const d = await r.json();
                categorias = Array.isArray(d) ? d : (d.categorias ?? []);
            }
        } catch {
            /* la tabla permanece disponible */
        }
    }
    function filtrar() {
        pagina = 0;
        void cargar();
    }
    async function cambiarEstado(u: Ubicacion) {
        procesando = u.id;
        error = '';
        try {
            const siguiente = u.estado === 'PUBLICADO' ? 'OCULTADO' : 'PUBLICADO';
            const r = await fetch(`/api/admin/ubicaciones/${u.id}/estado`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: siguiente }),
            });
            if (!r.ok) throw new Error(`No se pudo actualizar (${r.status}).`);
            ubicaciones = ubicaciones.map((x) => (x.id === u.id ? { ...x, estado: siguiente } : x));
            publicadas += siguiente === 'PUBLICADO' ? 1 : -1;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error';
        } finally {
            procesando = null;
        }
    }
    async function eliminar() {
        const u = confirmar;
        if (!u) return;
        procesando = u.id;
        error = '';
        try {
            const r = await fetch(`/api/admin/ubicaciones/${u.id}`, { method: 'DELETE', credentials: 'include' });
            if (!r.ok) throw new Error(r.status === 409 ? 'No se puede eliminar porque tiene comentarios o favoritos asociados.' : `No se pudo eliminar (${r.status}).`);
            confirmar = null;
            ubicaciones = ubicaciones.filter((x) => x.id !== u.id);
            total--;
            if (u.estado === 'PUBLICADO') publicadas--;
            if (!ubicaciones.length && pagina > 0) pagina--;
            await cargar();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error';
            confirmar = null;
        } finally {
            procesando = null;
        }
    }
    onMount(() => {
        void Promise.all([cargar(), cargarCategorias()]);
    });
</script>

<svelte:head><title>Ubicaciones | Cerro Largo 360</title></svelte:head>
<section class="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-8">
    <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <p class="text-sm text-slate-500">Administración</p>
            <h1 class="text-3xl font-semibold">Gestión de ubicaciones</h1>
            <p class="mt-1 text-sm text-slate-500">Administrá los lugares turísticos de Cerro Largo.</p>
        </div>
        <a href="/administrador/ubicaciones/nueva" class="rounded-xl bg-[#477967] px-4 py-2 text-white hover:bg-[#376554]">+ Nueva ubicación</a>
    </header>
    <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border bg-white p-5">
            <p class="text-sm text-slate-500">Resultados</p>
            <p class="mt-1 text-3xl font-semibold">{total}</p>
        </div>
        <div class="rounded-2xl border bg-white p-5">
            <p class="text-sm text-slate-500">Publicadas (total)</p>
            <p class="mt-1 text-3xl font-semibold">{publicadas}</p>
        </div>
    </div>
    <div class="rounded-2xl border bg-white p-4 space-y-4">
        <form
            class="flex flex-wrap gap-2"
            onsubmit={(e) => {
                e.preventDefault();
                busqueda = buscar.trim();
                filtrar();
            }}
        >
            <input aria-label="Buscar" class="min-w-48 flex-1 rounded-lg border p-2" placeholder="Nombre, descripción o localidad" bind:value={buscar} /><button
                class="rounded-lg border px-4 py-2">Buscar</button
            ><select aria-label="Estado" class="rounded-lg border p-2" bind:value={estado} onchange={filtrar}
                ><option value="">Todos los estados</option><option value="PUBLICADO">Publicado</option><option value="OCULTADO">Ocultado</option></select
            ><select aria-label="Categoría" class="rounded-lg border p-2" bind:value={categoria} onchange={filtrar}
                ><option value="">Todas las categorías</option>{#each categorias as c}<option value={String(c.id)}>{c.nombre}</option>{/each}</select
            >
        </form>
        {#if error}<div role="alert" class="rounded-lg bg-rose-50 p-4 text-rose-800">{error} <button class="underline" onclick={cargar}>Reintentar</button></div>{/if}
        {#if cargando}<p class="py-12 text-center text-slate-500">Cargando lugares…</p>{:else if ubicaciones.length === 0}<p class="py-12 text-center text-slate-500">
                No se encontraron lugares.
            </p>{:else}<div class="w-full max-w-full overflow-x-auto">
                <table class="w-full min-w-187.5 text-left text-sm">
                    <thead
                        ><tr class="border-b text-slate-500"
                            ><th class="p-3">Lugar</th><th class="p-3">Localidad</th><th class="p-3">Categoría</th><th class="p-3">Estado</th><th class="p-3">Acciones</th></tr
                        ></thead
                    ><tbody
                        >{#each ubicaciones as u (u.id)}<tr class="border-b last:border-0 hover:bg-slate-50"
                                ><td class="p-3 font-medium">{u.nombre}</td><td class="p-3">{u.localidad}</td><td class="p-3">{u.categoria?.nombre ?? '—'}</td><td class="p-3"
                                    ><span class={`rounded-full px-2 py-1 text-xs ${u.estado === 'PUBLICADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}
                                        >{u.estado === 'PUBLICADO' ? 'Publicado' : 'Ocultado'}</span
                                    ></td
                                ><td class="p-3"
                                    ><div class="flex flex-wrap items-center gap-3">
                                        <a class="font-medium text-[#477967] hover:underline" href={`/administrador/ubicaciones/${u.id}`}>Ver / Editar</a><a
                                            class="font-medium text-[#477967] hover:underline"
                                            href={`/administrador/comentarios/ubicacion/${u.id}`}>Comentarios</a
                                        ><button class="text-slate-600 hover:underline disabled:opacity-50" disabled={procesando === u.id} onclick={() => cambiarEstado(u)}
                                            >{u.estado === 'PUBLICADO' ? 'Ocultar' : 'Publicar'}</button
                                        ><button class="text-rose-700 hover:underline" onclick={() => (confirmar = u)}>Eliminar</button>
                                    </div></td
                                ></tr
                            >{/each}</tbody
                    >
                </table>
            </div>{/if}
        <footer class="flex justify-between items-center text-sm text-slate-500">
            <span>{total === 0 ? 0 : pagina * limite + 1}–{Math.min(total, (pagina + 1) * limite)} de {total}</span>
            <div class="flex gap-2">
                <button
                    class="rounded-lg border px-3 py-2 disabled:opacity-40"
                    disabled={pagina === 0 || cargando}
                    onclick={() => {
                        pagina--;
                        void cargar();
                    }}>Anterior</button
                ><button
                    class="rounded-lg border px-3 py-2 disabled:opacity-40"
                    disabled={(pagina + 1) * limite >= total || cargando}
                    onclick={() => {
                        pagina++;
                        void cargar();
                    }}>Siguiente</button
                >
            </div>
        </footer>
    </div>
    {#if confirmar}<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
            <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 id="confirm-title" class="text-xl font-semibold">Eliminar ubicación</h2>
                <p class="mt-3 text-slate-600">¿Querés eliminar <strong>{confirmar.nombre}</strong>? Esta acción no se puede deshacer.</p>
                <div class="mt-6 flex justify-end gap-3">
                    <button class="rounded-lg border px-4 py-2" onclick={() => (confirmar = null)}>Cancelar</button><button
                        class="rounded-lg bg-rose-700 px-4 py-2 text-white disabled:opacity-50"
                        disabled={procesando !== null}
                        onclick={eliminar}>Eliminar</button
                    >
                </div>
            </div>
        </div>{/if}
</section>
