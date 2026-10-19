<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';

    type Estado = 'PENDIENTE_REVISION' | 'PUBLICADO' | 'OCULTADO';
    type Comentario = {
        id: number;
        texto: string | null;
        calificacion: number;
        estado: Estado;
        creado_en: string;
        ubicacion: { id: number; nombre: string; localidad: string };
    };
    type Usuario = { id: number; nombres: string; apellidos: string; email: string };
    type Respuesta = { comentarios: Comentario[]; total: number; offset: number; limit: number };

    let usuario = $state<Usuario | null>(null);
    let comentarios = $state<Comentario[]>([]);
    let total = $state(0);
    let pagina = $state(0);
    let cargando = $state(true);
    let error = $state('');
    const limite = 12;
    let consulta = 0;
    let controller: AbortController | null = null;
    let totalPaginas = $derived(Math.max(1, Math.ceil(total / limite)));
    const fecha = (v: string) => new Date(v).toLocaleDateString('es-UY');
    const etiquetas: Record<Estado, string> = {
        PENDIENTE_REVISION: 'Pendiente',
        PUBLICADO: 'Publicado',
        OCULTADO: 'Ocultado',
    };

    async function cargar() {
        controller?.abort();
        const actual = ++consulta;
        const solicitud = new AbortController();
        controller = solicitud;
        cargando = true;
        error = '';
        try {
            const id = page.params.id;
            if (!id || !/^\d+$/.test(id)) throw new Error('Identificador de usuario inválido.');
            const params = new URLSearchParams({
                id_usuario: id,
                offset: String(pagina * limite),
                limit: String(limite),
            });
            const [rUsuario, rComentarios] = await Promise.all([
                fetch(`/api/admin/usuarios/${encodeURIComponent(id)}`, {
                    credentials: 'include',
                    signal: solicitud.signal,
                }),
                fetch(`/api/admin/comentarios?${params}`, {
                    credentials: 'include',
                    signal: solicitud.signal,
                }),
            ]);
            if (!rUsuario.ok || !rComentarios.ok) {
                const status = !rUsuario.ok ? rUsuario.status : rComentarios.status;
                throw new Error(
                    status === 404
                        ? 'Usuario no encontrado.'
                        : status === 401 || status === 403
                          ? 'No tenés permisos de administrador.'
                          : `No se pudieron cargar los comentarios (${status}).`
                );
            }
            const datosUsuario: Usuario = await rUsuario.json();
            const datos: Respuesta = await rComentarios.json();
            if (actual === consulta) {
                usuario = datosUsuario;
                comentarios = datos.comentarios;
                total = datos.total;
            }
        } catch (e) {
            if (!solicitud.signal.aborted && actual === consulta) {
                error = e instanceof Error ? e.message : 'Error de conexión.';
            }
        } finally {
            if (actual === consulta) cargando = false;
        }
    }

    function cambiarPagina(n: number) {
        if (n < 0 || n >= totalPaginas || cargando) return;
        pagina = n;
        void cargar();
    }

    onMount(() => {
        void cargar();
        return () => {
            consulta++;
            controller?.abort();
        };
    });
</script>

<svelte:head><title>Comentarios del usuario | Cerro Largo 360</title></svelte:head>

<section class="mx-auto w-full max-w-6xl space-y-6 pb-8 text-[#26382e]">
    <a href={`/administrador/usuarios/${page.params.id}`} class="inline-block text-sm font-semibold text-[#477967] hover:underline">← Volver al perfil</a>

    <header class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e0e6df] bg-white p-6 shadow-sm">
        <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-[#718178]">Administración de usuarios</p>
            <h1 class="mt-2 text-2xl font-semibold">Comentarios del usuario</h1>
            {#if usuario}
                <p class="mt-1 text-sm text-slate-500">{usuario.nombres} {usuario.apellidos} · {usuario.email}</p>
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
            <p class="p-8 text-center text-sm text-slate-500">Cargando comentarios…</p>
        {:else if comentarios.length === 0}
            <p class="p-8 text-center text-sm text-slate-500">Este usuario no tiene comentarios registrados.</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full min-w-[820px] text-left text-sm">
                    <thead class="bg-[#f7f9f6] text-[#69776c]">
                        <tr
                            ><th class="p-4">Lugar</th><th class="p-4">Comentario</th><th class="p-4">Calificación</th><th class="p-4">Fecha</th><th class="p-4">Estado</th><th
                                class="p-4">Acción</th
                            ></tr
                        >
                    </thead>
                    <tbody>
                        {#each comentarios as comentario (comentario.id)}
                            <tr class="border-t border-[#e9eee8] hover:bg-[#fbfcfa]">
                                <td class="p-4"
                                    ><p class="font-semibold">{comentario.ubicacion.nombre}</p>
                                    <p class="text-xs text-slate-500">{comentario.ubicacion.localidad}</p></td
                                >
                                <td class="max-w-xs p-4"><p class="line-clamp-2 break-words">{comentario.texto ?? 'Sin texto'}</p></td>
                                <td class="whitespace-nowrap p-4">{comentario.calificacion} / 5 ★</td>
                                <td class="whitespace-nowrap p-4">{fecha(comentario.creado_en)}</td>
                                <td class="p-4"
                                    ><span
                                        class={`rounded-full px-3 py-1 text-xs font-medium ${comentario.estado === 'PENDIENTE_REVISION' ? 'bg-amber-100 text-amber-900' : comentario.estado === 'PUBLICADO' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}
                                        >{etiquetas[comentario.estado]}</span
                                    ></td
                                >
                                <td class="p-4"
                                    ><a
                                        href={`/administrador/comentarios/${comentario.id}`}
                                        class="inline-block whitespace-nowrap rounded-xl bg-[#d7e5db] px-4 py-2 font-semibold text-[#385443] hover:bg-[#c4d9c9]">Ver y moderar</a
                                    ></td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
        <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-[#e9eee8] p-5 text-sm text-slate-500">
            <span>{total} comentarios · Página {pagina + 1} de {totalPaginas}</span>
            <div class="flex gap-2">
                <button disabled={pagina === 0 || cargando} onclick={() => cambiarPagina(pagina - 1)} class="rounded-lg border px-3 py-2 disabled:opacity-40">Anterior</button>
                <button disabled={pagina + 1 >= totalPaginas || cargando} onclick={() => cambiarPagina(pagina + 1)} class="rounded-lg border px-3 py-2 disabled:opacity-40"
                    >Siguiente</button
                >
            </div>
        </footer>
    </div>
</section>
