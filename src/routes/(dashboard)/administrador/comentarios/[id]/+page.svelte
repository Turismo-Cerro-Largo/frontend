<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    type Estado = 'PENDIENTE_REVISION' | 'PUBLICADO' | 'OCULTADO';
    type Recurso = { uri: string; tipo: string };
    type Comentario = {
        id: number;
        texto: string;
        calificacion: number;
        estado: Estado;
        creado_en: string;
        usuario: { id: number; nombres: string; apellidos: string; email: string };
        ubicacion: { id: number; nombre: string; localidad: string };
        recursos: Recurso[];
    };
    const id = $derived(page.params.id);
    let comentario = $state<Comentario | null>(null);
    let cargando = $state(true);
    let guardando = $state(false);
    let error = $state('');
    let aviso = $state('');
    let confirmar = $state<Estado | null>(null);
    async function cargar() {
        cargando = true;
        error = '';
        try {
            const r = await fetch(`/api/admin/comentarios/${id}`, { credentials: 'include' });
            if (!r.ok) throw new Error(r.status === 404 ? 'El comentario no existe.' : `No se pudo abrir el comentario (${r.status}).`);
            comentario = await r.json();
        } catch (e) {
            error = e instanceof Error ? e.message : 'No se pudo cargar.';
        } finally {
            cargando = false;
        }
    }
    async function actualizar() {
        if (!comentario || !confirmar || guardando) return;
        guardando = true;
        error = '';
        aviso = '';
        try {
            const r = await fetch(`/api/admin/comentarios/${comentario.id}/estado`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: confirmar }),
            });
            if (!r.ok) {
                const body = await r.json().catch(() => ({}));
                throw new Error(body.error || `No se pudo actualizar (${r.status}).`);
            }
            const resultado: { estado: Estado } = await r.json();
            comentario = { ...comentario, estado: resultado.estado };
            aviso = 'Estado actualizado correctamente.';
            confirmar = null;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error al actualizar.';
        } finally {
            guardando = false;
        }
    }
    const etiqueta = (e: Estado) => (e === 'PUBLICADO' ? 'Publicado' : e === 'OCULTADO' ? 'Ocultado' : 'Pendiente de revisión');
    onMount(() => {
        void cargar();
    });
</script>

<svelte:head><title>Revisar comentario | Cerro Largo 360</title></svelte:head>
<section class="mx-auto w-full min-w-0 max-w-5xl space-y-6 pb-8 text-[#26382e]">
    <a href="/administrador/comentarios" class="inline-block text-sm font-semibold text-[#477967] hover:underline">← Volver a comentarios</a>
    <header>
        <h1 class="text-3xl font-semibold">Revisión de comentario</h1>
        <p class="mt-1 text-sm text-slate-500">Consultá el contenido y decidí si debe ser visible para los turistas.</p>
    </header>
    {#if error}<p role="alert" class="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>{/if}
    {#if aviso}<p role="status" class="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{aviso}</p>{/if}
    {#if cargando}<p class="rounded-2xl bg-white p-6">Cargando comentario…</p>{:else if comentario}
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div class="space-y-5">
                <article class="rounded-2xl border border-[#e0e6df] bg-white p-6 shadow-sm">
                    <div class="flex flex-wrap justify-between gap-2">
                        <h2 class="text-lg font-semibold">Contenido del comentario</h2>
                        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{etiqueta(comentario.estado)}</span>
                    </div>
                    <p class="mt-4 whitespace-pre-wrap break-words text-slate-700">{comentario.texto}</p>
                    <p class="mt-4 text-sm font-semibold text-amber-700">Calificación: {comentario.calificacion} / 5 ★</p>
                    <p class="mt-2 text-xs text-slate-500">
                        Creado: {new Intl.DateTimeFormat('es-UY', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(comentario.creado_en))}
                    </p>
                </article>
                {#if comentario.recursos?.length}<article class="rounded-2xl border border-[#e0e6df] bg-white p-6">
                        <h2 class="mb-4 text-lg font-semibold">Recursos adjuntos</h2>
                        <div class="grid gap-3 sm:grid-cols-2">
                            {#each comentario.recursos as recurso, i}{#if recurso.tipo === 'IMAGEN'}<img
                                        src={recurso.uri}
                                        alt={`Recurso del comentario ${i + 1}`}
                                        class="h-52 w-full rounded-xl object-cover"
                                    />{:else if recurso.tipo === 'VIDEO'}<video src={recurso.uri} controls class="w-full rounded-xl"><track kind="captions" /></video>{/if}{/each}
                        </div>
                    </article>{/if}
            </div>
            <aside class="space-y-5">
                <div class="rounded-2xl border border-[#e0e6df] bg-white p-5">
                    <h2 class="font-semibold">Autor</h2>
                    <p class="mt-3 text-sm">{comentario.usuario.nombres} {comentario.usuario.apellidos}</p>
                    <p class="mt-1 break-all text-xs text-slate-500">{comentario.usuario.email}</p>
                    <a href={`/administrador/usuarios/${comentario.usuario.id}`} class="mt-3 inline-block text-sm font-semibold text-[#477967] hover:underline">Ver perfil</a>
                </div>
                <div class="rounded-2xl border border-[#e0e6df] bg-white p-5">
                    <h2 class="font-semibold">Ubicación comentada</h2>
                    <p class="mt-3 text-sm">{comentario.ubicacion.nombre}</p>
                    <p class="mt-1 text-xs text-slate-500">{comentario.ubicacion.localidad}</p>
                    <a href={`/administrador/ubicaciones/${comentario.ubicacion.id}`} class="mt-3 inline-block text-sm font-semibold text-[#477967] hover:underline"
                        >Ver ubicación</a
                    ><a href={`/administrador/comentarios/ubicacion/${comentario.ubicacion.id}`} class="mt-3 block text-sm font-semibold text-[#477967] hover:underline"
                        >Todos sus comentarios</a
                    >
                </div>
                <div class="rounded-2xl border border-[#e0e6df] bg-white p-5">
                    <h2 class="font-semibold">Moderación</h2>
                    <p class="mt-1 text-xs text-slate-500">Los cambios se guardan sin recargar la página.</p>
                    <div class="mt-4 flex flex-col gap-2">
                        <button
                            type="button"
                            disabled={guardando || comentario.estado === 'PUBLICADO'}
                            onclick={() => (confirmar = 'PUBLICADO')}
                            class="rounded-xl bg-[#477967] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Publicar comentario</button
                        ><button
                            type="button"
                            disabled={guardando || comentario.estado === 'OCULTADO'}
                            onclick={() => (confirmar = 'OCULTADO')}
                            class="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 disabled:opacity-40">Ocultar comentario</button
                        ><button
                            type="button"
                            disabled={guardando || comentario.estado === 'PENDIENTE_REVISION'}
                            onclick={() => (confirmar = 'PENDIENTE_REVISION')}
                            class="rounded-xl border px-4 py-2.5 text-sm font-medium disabled:opacity-40">Marcar como pendiente</button
                        >
                    </div>
                </div>
            </aside>
        </div>
        {#if confirmar}<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="presentation">
                <div role="dialog" aria-modal="true" aria-label="Confirmar moderación" class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <h2 class="text-xl font-semibold">¿Cambiar el estado?</h2>
                    <p class="mt-2 text-sm text-slate-600">El comentario pasará a: <strong>{etiqueta(confirmar)}</strong>.</p>
                    <div class="mt-6 flex justify-end gap-2">
                        <button type="button" disabled={guardando} onclick={() => (confirmar = null)} class="rounded-xl border px-4 py-2 text-sm">Cancelar</button><button
                            type="button"
                            disabled={guardando}
                            onclick={() => void actualizar()}
                            class="rounded-xl bg-[#477967] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{guardando ? 'Guardando…' : 'Confirmar'}</button
                        >
                    </div>
                </div>
            </div>{/if}
    {/if}
</section>
