<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    type Estado = 'PENDIENTE_REVISION' | 'APROBADO' | 'RECHAZADO';
    type Organizador = {
        id: number;
        nombre_organizacion: string;
        email: string;
        rut_ruc: string;
        departamento: string;
        telefono: string;
        sitio_web: string | null;
        estado: Estado;
        creado_en: string;
        motivo_rechazo: string | null;
        documentos: { tipo: string; uri: string }[];
    };
    let organizador = $state<Organizador | null>(null),
        cargando = $state(true),
        guardando = $state(false),
        error = $state(''),
        exito = $state('');
    let confirmacion = $state<'APROBADO' | 'RECHAZADO' | null>(null),
        motivo = $state('');
    let fotos = $state<Record<string, string>>({});
    let imagenError = $state<Record<string, string>>({});
    let urls: string[] = [];
    let id = $derived(page.params.id);
    async function cargar() {
        cargando = true;
        error = '';
        try {
            const r = await fetch(`/api/organizador/${encodeURIComponent(id)}`, { credentials: 'include' });
            if (!r.ok)
                throw new Error(
                    r.status === 404
                        ? 'Organizador no encontrado.'
                        : r.status === 403 || r.status === 401
                          ? 'No tenés permiso para revisar esta solicitud.'
                          : 'No se pudo cargar el perfil.'
                );
            organizador = await r.json();
            await Promise.all(
                organizador!.documentos.map(async (d) => {
                    try {
                        const imagen = await fetch(`/api/archivos/privados/${encodeURIComponent(d.uri)}`, { credentials: 'include' });
                        if (!imagen.ok) throw new Error('Documento no disponible.');
                        const blob = await imagen.blob();
                        if (!blob.type.startsWith('image/')) throw new Error('El documento no es una imagen.');
                        const url = URL.createObjectURL(blob);
                        urls.push(url);
                        fotos[d.tipo] = url;
                    } catch (e) {
                        imagenError[d.tipo] = e instanceof Error ? e.message : 'No disponible';
                    }
                })
            );
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error inesperado.';
        } finally {
            cargando = false;
        }
    }
    onMount(() => {
        void cargar();
        return () => {
            urls.forEach((u) => URL.revokeObjectURL(u));
        };
    });
    async function cambiarEstado() {
        if (!organizador || !confirmacion || guardando) return;
        if (confirmacion === 'RECHAZADO' && motivo.trim().length < 5) {
            error = 'Escribí un motivo de rechazo de al menos 5 caracteres.';
            return;
        }
        guardando = true;
        error = '';
        exito = '';
        try {
            const r = await fetch(`/api/organizador/${organizador.id}/estado`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: confirmacion, ...(confirmacion === 'RECHAZADO' ? { motivo_rechazo: motivo.trim() } : {}) }),
            });
            if (!r.ok) {
                const body = await r.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo cambiar el estado.');
            }
            const actualizado = await r.json();
            organizador = { ...organizador, estado: actualizado.estado, motivo_rechazo: actualizado.motivo_rechazo };
            exito = 'Estado actualizado correctamente.';
            confirmacion = null;
            motivo = '';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error inesperado.';
        } finally {
            guardando = false;
        }
    }
</script>

<svelte:head><title>Revisar organizador</title></svelte:head>
<div class="mx-auto max-w-5xl space-y-5 text-[#26382e]">
    <a href="/administrador/organizadores" class="inline-block text-sm font-medium text-[#52675a] hover:underline">← Volver a organizadores</a>
    {#if cargando}<div class="rounded-2xl bg-white p-8 text-center">Cargando perfil y documentos...</div>
    {:else if organizador}
        <section class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-semibold">{organizador.nombre_organizacion}</h1>
                    <p class="mt-1 text-sm text-[#68746c]">Registro #{organizador.id} · {new Date(organizador.creado_en).toLocaleDateString('es-UY')}</p>
                </div>
                <span class="rounded-full bg-[#d7e5db] px-4 py-2 text-sm font-medium">{organizador.estado.replaceAll('_', ' ')}</span>
            </div>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
                {#each [['Correo', organizador.email], ['RUT / RUC', organizador.rut_ruc], ['Departamento', organizador.departamento], ['Teléfono', organizador.telefono], ['Sitio web', organizador.sitio_web ?? 'No indicado']] as item}<div
                        class="rounded-xl bg-[#f7f8f5] p-4"
                    >
                        <div class="text-xs text-[#68746c]">{item[0]}</div>
                        <div class="mt-1 break-words font-medium">{item[1]}</div>
                    </div>{/each}
            </div>
            {#if organizador.motivo_rechazo}<p class="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"><strong>Motivo de rechazo:</strong> {organizador.motivo_rechazo}</p>{/if}
        </section>
        <section class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold">Documentación de identidad</h2>
            <p class="mb-5 text-sm text-[#68746c]">Documentos privados, visibles únicamente con sesión autorizada.</p>
            <div class="grid gap-5 sm:grid-cols-2">
                {#each [{ tipo: 'CEDULA_FRENTE', nombre: 'Cédula (frente)' }, { tipo: 'CEDULA_DORSO', nombre: 'Cédula (dorso)' }] as documento}<div>
                        <h3 class="mb-2 text-sm font-semibold">{documento.nombre}</h3>
                        {#if fotos[documento.tipo]}<a href={fotos[documento.tipo]} target="_blank" rel="noreferrer" aria-label={`Ampliar ${documento.nombre}`}
                                ><img
                                    src={fotos[documento.tipo]}
                                    alt={documento.nombre}
                                    class="h-64 w-full rounded-xl border border-[#ded8cf] bg-[#f7f8f5] object-contain transition-transform duration-200 hover:scale-[1.01]"
                                /></a
                            >{:else}<div class="flex h-64 items-center justify-center rounded-xl border border-dashed p-4 text-center text-sm text-[#68746c]">
                                {imagenError[documento.tipo] ?? 'No se adjuntó una imagen.'}
                            </div>{/if}
                    </div>{/each}
            </div>
        </section>
        <section class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold">Decisión administrativa</h2>
            <p class="mt-1 text-sm text-[#68746c]">Verificá los datos y ambas caras de la cédula antes de cambiar el estado.</p>
            {#if exito}<p role="status" class="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{exito}</p>{/if}
            {#if error}<p role="alert" class="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>{/if}
            {#if !confirmacion}<div class="mt-5 flex flex-wrap gap-3">
                    <button
                        onclick={() => {
                            confirmacion = 'APROBADO';
                            error = '';
                        }}
                        disabled={organizador.estado === 'APROBADO'}
                        class="rounded-xl bg-[#d7e5db] px-5 py-3 font-semibold text-[#385443] transition-colors hover:bg-[#c5dac9] disabled:opacity-40">Aprobar organizador</button
                    ><button
                        onclick={() => {
                            confirmacion = 'RECHAZADO';
                            error = '';
                        }}
                        disabled={organizador.estado === 'RECHAZADO'}
                        class="rounded-xl bg-[#D89994] px-5 py-3 font-semibold text-[#442b29] transition-colors hover:bg-[#cb8580] disabled:opacity-40">Rechazar organizador</button
                    >
                </div>
            {:else}<div class="mt-5 space-y-4 rounded-xl bg-[#f7f8f5] p-5">
                    <p class="font-semibold">¿Confirmás que querés {confirmacion === 'APROBADO' ? 'aprobar' : 'rechazar'} esta organización?</p>
                    {#if confirmacion === 'RECHAZADO'}<label class="block text-sm font-medium"
                            >Motivo de rechazo (obligatorio)<textarea
                                bind:value={motivo}
                                maxlength="2000"
                                rows="4"
                                placeholder="Explicá por qué se rechaza la solicitud"
                                class="mt-2 w-full rounded-xl border border-[#ded8cf] bg-white p-3 outline-none focus:ring-2 focus:ring-[#d7e5db]"></textarea></label
                        >{/if}
                    <div class="flex flex-wrap gap-3">
                        <button onclick={cambiarEstado} disabled={guardando} class="rounded-xl bg-[#385443] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
                            >{guardando ? 'Guardando...' : 'Confirmar decisión'}</button
                        ><button
                            onclick={() => {
                                confirmacion = null;
                                motivo = '';
                                error = '';
                            }}
                            disabled={guardando}
                            class="rounded-xl border border-[#ded8cf] px-5 py-2.5">Cancelar</button
                        >
                    </div>
                </div>{/if}
        </section>
    {:else if error}<p role="alert" class="rounded-xl bg-red-50 p-5 text-red-700">{error}</p>{/if}
</div>
