<script lang="ts">
    import { untrack } from 'svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    type Categoria = { id: number; nombre: string; descripcion: string | null; icono: string | null; icono_url: string | null; color: string };
    let { categoria }: { categoria?: Categoria } = $props();
    const inicial = untrack(() => categoria);
    let nombre = $state(inicial?.nombre || '');
    let descripcion = $state(inicial?.descripcion || '');
    let icono = $state(inicial?.icono || '');
    let color = $state(inicial?.color || '#2563eb');
    let preview = $state<string | null>(inicial?.icono_url || null);
    let validado = $state(inicial?.icono?.trim() || '');
    let cargando = $state(false);
    let enviando = $state(false);
    let error = $state('');
    let errorSvg = $state('');
    let reintento = $state(0);
    const visible = $derived(validado === icono.trim() ? preview : null);

    $effect(() => {
        const svg = icono.trim();
        reintento;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            if (!svg) { preview = null; errorSvg = ''; cargando = false; return; }
            cargando = true; errorSvg = '';
            try {
                const respuesta = await fetch('/api/categorias/preview', {
                    method: 'POST', headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ icono: svg }), signal: controller.signal,
                });
                const datos = await respuesta.json().catch(() => null);
                if (!respuesta.ok) throw new Error(datos?.message || 'No se pudo validar el SVG.');
                if (typeof datos?.icono !== 'string') throw new Error('La vista previa no está disponible.');
                if (!controller.signal.aborted) { preview = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(datos.icono); validado = svg; }
            } catch (e) {
                if (!controller.signal.aborted) { preview = null; errorSvg = e instanceof Error ? e.message : 'No se pudo validar el SVG.'; }
            } finally { if (!controller.signal.aborted) cargando = false; }
        }, 450);
        return () => { clearTimeout(timer); controller.abort(); };
    });

    async function guardar(event: SubmitEvent) {
        event.preventDefault();
        if (enviando || !visible || cargando) return;
        const formulario = event.currentTarget as HTMLFormElement;
        enviando = true; error = '';
        try {
            const respuesta = await fetch(inicial ? `/api/categorias/${inicial.id}` : '/api/categorias', {
                method: inicial ? 'PUT' : 'POST', body: new FormData(formulario), credentials: 'include',
            });
            if (!respuesta.ok) {
                const datos = await respuesta.json().catch(() => null);
                throw new Error(respuesta.status === 409 ? 'Ya existe una categoría con ese nombre.' : datos?.message || 'No se pudo guardar la categoría.');
            }
            await goto(resolve('/administrador/categorias'), { replaceState: !!inicial, invalidateAll: true });
        } catch (e) { error = e instanceof Error ? e.message : 'No se pudo guardar la categoría.'; }
        finally { enviando = false; }
    }
</script>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
    <h1 class="mb-2 text-2xl font-bold text-[#26382e]">{inicial ? 'Editar categoría' : 'Nueva categoría'}</h1>
    <p class="mb-6 text-sm text-[#68746c]">Configurá la categoría y el marcador que usarán sus lugares y eventos.</p>
    <form onsubmit={guardar} class="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm">
        <fieldset disabled={enviando} class="space-y-6 p-6 sm:p-8">
            <div class="space-y-2"><label for="nombre" class="block text-sm font-semibold">Nombre <span class="ml-1 text-xs text-red-700">Obligatorio</span></label><input id="nombre" name="nombre" bind:value={nombre} required maxlength="28" class="w-full rounded-xl border border-[#ded8cf] px-4 py-3" placeholder="Ej.: Restaurantes" /></div>
            <div class="space-y-2"><label for="descripcion" class="block text-sm font-semibold">Descripción <span class="ml-1 text-xs text-red-700">Obligatorio</span></label><textarea id="descripcion" name="descripcion" bind:value={descripcion} required maxlength="255" rows="3" class="w-full rounded-xl border border-[#ded8cf] px-4 py-3"></textarea></div>
            <div class="space-y-2"><label for="icono" class="block text-sm font-semibold">Código SVG del marcador <span class="ml-1 text-xs text-red-700">Obligatorio</span></label><textarea id="icono" name="icono" bind:value={icono} required maxlength="20000" rows="6" spellcheck="false" class="w-full rounded-xl border border-[#ded8cf] bg-slate-50 px-4 py-3 font-mono text-xs" placeholder={'<svg viewBox="0 0 256 256">…</svg>'}></textarea><p class="text-xs text-[#68746c]">Pegá un SVG de <a href="https://phosphoricons.com/" target="_blank" rel="noopener noreferrer" class="underline">Phosphor Icons</a> o similar. Máximo 20 KB. El dibujo se adapta a blanco sobre el color elegido.</p></div>
            <div class="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-slate-50 p-5">
                <div class="space-y-3"><label for="color" class="block text-sm font-semibold">Color del marcador</label><div class="flex items-center gap-3"><input id="color" name="color" type="color" bind:value={color} required class="h-12 w-16 cursor-pointer rounded-lg border border-slate-300 bg-white p-1" /><span class="font-mono text-sm text-slate-600">{color}</span></div></div>
                <div class="flex items-center gap-4" aria-live="polite"><div class="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-white shadow-md" style:background-color={color}>{#if visible}<img src={visible} alt={`Marcador de ${nombre || 'la categoría'}`} width="32" height="32" loading="eager" decoding="async" fetchpriority="auto" />{:else}<span class="text-xl text-white" aria-hidden="true">{cargando || icono.trim() && !errorSvg ? '…' : '⌖'}</span>{/if}</div><div><p class="text-xs text-slate-500">Vista previa</p><p class="font-semibold text-slate-800">{nombre || 'Nombre de la categoría'}</p><p class="text-xs text-slate-500">{cargando ? 'Validando SVG…' : visible ? 'Marcador listo' : 'Pegá un SVG válido'}</p></div></div>
            </div>
            {#if errorSvg}<p role="alert" class="text-sm text-red-700">{errorSvg} <button type="button" class="underline" onclick={() => reintento++}>Reintentar</button></p>{/if}
            {#if error}<p role="alert" class="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>{/if}
        </fieldset>
        <div class="flex justify-end gap-3 border-t border-[#eeeae4] bg-[#faf9f6] px-6 py-4"><a href={resolve('/administrador/categorias')} class="rounded-xl border border-[#ded8cf] bg-white px-5 py-3 text-sm">Cancelar</a><button type="submit" disabled={enviando || cargando || !visible} class="rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29] disabled:cursor-not-allowed disabled:opacity-50">{enviando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear categoría'}</button></div>
    </form>
</div>
