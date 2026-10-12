<script lang="ts">
    import { onMount } from 'svelte';
    import 'mapbox-gl/dist/mapbox-gl.css';
    import { goto } from '$app/navigation';
    import { env } from '$env/dynamic/public';
    const PUBLIC_MAPBOX_TOKEN = env.PUBLIC_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || '';
    let { id = null }: { id?: string | null } = $props();
    type Estado = 'PUBLICADO' | 'OCULTADO';
    type Categoria = { id: number; nombre: string };
    type Ubicacion = {
        nombre: string;
        descripcion: string;
        direccion: string | null;
        localidad: string;
        telefono: string | null;
        sitio_web: string | null;
        horario: string | null;
        latitud: number;
        longitud: number;
        estado: Estado;
        id_categoria: number;
        recursos?: { uri: string; tipo: string }[];
    };
    let categorias = $state<Categoria[]>([]),
        form = $state<Ubicacion>({
            nombre: '',
            descripcion: '',
            direccion: '',
            localidad: '',
            telefono: '',
            sitio_web: '',
            horario: '',
            latitud: -32.365,
            longitud: -54.17,
            estado: 'OCULTADO',
            id_categoria: 0,
        });
    type Recurso = { tipo: 'IMAGEN' | 'VIDEO'; uri: string };
    let recursos = $state<Recurso[]>([]),
        cargando = $state(true),
        guardando = $state(false),
        error = $state(''),
        mensaje = $state('');
    let zonaArrastre = $state(false),
        subiendo = $state(false),
        inputArchivo: HTMLInputElement;
    let contenedor: HTMLDivElement;
    let mapa: any = null,
        marcador: any = null;
    let esNuevo = $derived(id === null);
    async function iniciarMapa() {
        if (!contenedor || !PUBLIC_MAPBOX_TOKEN) return;
        const mb = (await import('mapbox-gl')).default;
        mb.accessToken = PUBLIC_MAPBOX_TOKEN;
        mapa = new mb.Map({ container: contenedor, style: 'mapbox://styles/mapbox/streets-v12', center: [form.longitud, form.latitud], zoom: 11 });
        mapa.scrollZoom.enable();
        mapa.doubleClickZoom.enable();
        mapa.touchZoomRotate.enable();
        mapa.addControl(new mb.NavigationControl(), 'top-right');
        marcador = new mb.Marker({ draggable: true, color: '#477967' }).setLngLat([form.longitud, form.latitud]).addTo(mapa);
        marcador.on('dragend', () => {
            const p = marcador.getLngLat();
            form.latitud = Number(p.lat.toFixed(6));
            form.longitud = Number(p.lng.toFixed(6));
        });
        mapa.on('click', (e: any) => {
            form.latitud = Number(e.lngLat.lat.toFixed(6));
            form.longitud = Number(e.lngLat.lng.toFixed(6));
            marcador.setLngLat([form.longitud, form.latitud]);
        });
        mapa.on('load', () => mapa.resize());
    }
    function moverMapa() {
        if (mapa && marcador && Number.isFinite(form.latitud) && Number.isFinite(form.longitud)) {
            marcador.setLngLat([form.longitud, form.latitud]);
            mapa.flyTo({ center: [form.longitud, form.latitud], zoom: Math.max(mapa.getZoom(), 11) });
        }
    }
    onMount(() => {
        let activo = true;
        async function cargar() {
            try {
                const cr = await fetch('/api/categorias', { credentials: 'include' });
                if (!cr.ok) throw new Error(`No se pudieron cargar las categorías (${cr.status}).`);
                const cats = await cr.json();
                categorias = Array.isArray(cats) ? cats : (cats.categorias ?? []);
                if (!esNuevo) {
                    const r = await fetch(`/api/admin/ubicaciones/${id}`, { credentials: 'include' });
                    if (!r.ok) throw new Error(`No se pudo abrir la ubicación (${r.status}).`);
                    const u: Ubicacion = await r.json();
                    if (activo) {
                        form = {
                            nombre: u.nombre,
                            descripcion: u.descripcion,
                            direccion: u.direccion,
                            localidad: u.localidad,
                            telefono: u.telefono,
                            sitio_web: u.sitio_web,
                            horario: u.horario,
                            latitud: Number(u.latitud),
                            longitud: Number(u.longitud),
                            estado: u.estado,
                            id_categoria: u.id_categoria,
                        };
                        recursos = (u.recursos ?? []).filter((x) => x.tipo === 'IMAGEN' || x.tipo === 'VIDEO').map((x) => ({ tipo: x.tipo as 'IMAGEN' | 'VIDEO', uri: x.uri }));
                    }
                }
                if (activo) {
                    if (!form.id_categoria && categorias.length) form.id_categoria = categorias[0].id;
                    await iniciarMapa();
                }
            } catch (e) {
                if (activo) error = e instanceof Error ? e.message : 'Error inesperado';
            } finally {
                if (activo) cargando = false;
            }
        }
        void cargar();
        return () => {
            activo = false;
            mapa?.remove();
        };
    });

    async function subirArchivos(files: FileList | File[]) {
        if (subiendo) return;
        const seleccion = Array.from(files);
        if (!seleccion.length) return;
        if (recursos.length + seleccion.length > 20) {
            error = 'Podés registrar hasta 20 recursos por ubicación.';
            return;
        }
        error = '';
        subiendo = true;
        try {
            for (const file of seleccion) {
                if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) throw new Error(`${file.name}: seleccioná una imagen o video.`);
                const fd = new FormData();
                fd.append('archivo', file);
                const response = await fetch('/api/admin/ubicaciones/recursos/upload', { method: 'POST', credentials: 'include', body: fd });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error ?? `Error al subir ${file.name} (${response.status}).`);
                recursos = [...recursos, { tipo: data.tipo as 'IMAGEN' | 'VIDEO', uri: data.uri }];
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'No se pudo subir el archivo.';
        } finally {
            subiendo = false;
            if (inputArchivo) inputArchivo.value = '';
        }
    }
    function soltar(e: DragEvent) {
        e.preventDefault();
        zonaArrastre = false;
        if (e.dataTransfer?.files) void subirArchivos(e.dataTransfer.files);
    }
    function moverRecurso(i: number, delta: number) {
        const j = i + delta;
        if (j < 0 || j >= recursos.length) return;
        const lista = [...recursos];
        [lista[i], lista[j]] = [lista[j], lista[i]];
        recursos = lista;
    }
    async function guardar() {
        if (guardando) return;
        error = '';
        mensaje = '';
        if (!form.nombre.trim() || !form.descripcion.trim() || !form.localidad.trim() || !form.id_categoria) {
            error = 'Completá nombre, descripción, localidad y categoría.';
            return;
        }
        if (!Number.isFinite(form.latitud) || !Number.isFinite(form.longitud) || Math.abs(form.latitud) > 90 || Math.abs(form.longitud) > 180) {
            error = 'Las coordenadas no son válidas.';
            return;
        }
        guardando = true;
        try {
            const r = await fetch(esNuevo ? '/api/admin/ubicaciones' : `/api/admin/ubicaciones/${id}`, {
                method: esNuevo ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...form, recursos }),
            });
            if (!r.ok) {
                const body = await r.json().catch(() => ({}));
                throw new Error(body.error ?? `No se pudo guardar (${r.status}).`);
            }
            mensaje = 'Cambios guardados correctamente.';
            await goto('/administrador/ubicaciones');
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error inesperado';
        } finally {
            guardando = false;
        }
    }
</script>

<svelte:head><title>{esNuevo ? 'Nueva ubicación' : 'Editar ubicación'} | Cerro Largo 360</title></svelte:head>
<section class="ubicaciones-scroll-fix mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-8">
    <a href="/administrador/ubicaciones" class="text-sm font-medium text-[#477967] hover:underline">← Volver a ubicaciones</a>
    <header>
        <h1 class="text-3xl font-semibold">{esNuevo ? 'Nueva ubicación turística' : 'Detalle y edición del lugar'}</h1>
        <p class="mt-1 text-slate-500">Primero seleccioná la ubicación en Mapbox; después completá la información del lugar.</p>
    </header>
    {#if cargando}<p class="rounded-xl border p-6">Cargando formulario…</p>{/if}
    {#if error}<p role="alert" class="rounded-lg bg-rose-50 p-4 text-rose-800">{error}</p>{/if}{#if mensaje}<p role="status" class="rounded-lg bg-emerald-50 p-4 text-emerald-800">
            {mensaje}
        </p>{/if}
    <form
        class="flex min-w-0 flex-col gap-6"
        onsubmit={(e) => {
            e.preventDefault();
            void guardar();
        }}
    >
        <div class="min-w-0 space-y-3 rounded-2xl border bg-white p-5">
            <h2 class="text-xl font-semibold">Paso 1 · Seleccioná la ubicación en el mapa</h2>
            <p class="text-sm text-slate-500">Hacé clic para marcar un lugar, arrastrá el marcador o usá la rueda del mouse para acercar y alejar.</p>
            {#if !PUBLIC_MAPBOX_TOKEN}<p class="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Falta PUBLIC_MAPBOX_TOKEN en el .env del frontend.</p>{/if}
            <div bind:this={contenedor} class="h-90 w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-slate-100 md:h-120"></div>
            <div class="grid gap-3 sm:grid-cols-2">
                <label class="text-sm"
                    >Latitud<input type="number" step="any" min="-90" max="90" bind:value={form.latitud} onchange={moverMapa} class="mt-1 w-full rounded-lg border p-2" /></label
                ><label class="text-sm"
                    >Longitud<input
                        type="number"
                        step="any"
                        min="-180"
                        max="180"
                        bind:value={form.longitud}
                        onchange={moverMapa}
                        class="mt-1 w-full rounded-lg border p-2"
                    /></label
                >
            </div>
        </div>
        <div class="min-w-0 space-y-4 rounded-2xl border bg-white p-5">
            <h2 class="text-xl font-semibold">Paso 2 · Información del lugar</h2>
            <label class="block text-sm">Nombre *<input required maxlength="120" bind:value={form.nombre} class="mt-1 w-full rounded-lg border p-2" /></label><label
                class="block text-sm"
                >Descripción *<textarea required rows="5" maxlength="5000" bind:value={form.descripcion} class="mt-1 w-full rounded-lg border p-2"></textarea></label
            >
            <div class="grid gap-3 sm:grid-cols-2">
                <label class="text-sm">Localidad *<input required bind:value={form.localidad} class="mt-1 w-full rounded-lg border p-2" /></label><label class="text-sm"
                    >Categoría *<select required bind:value={form.id_categoria} class="mt-1 w-full rounded-lg border p-2"
                        ><option value={0} disabled>Seleccionar</option>{#each categorias as c}<option value={c.id}>{c.nombre}</option>{/each}</select
                    ></label
                >
            </div>
            <label class="block text-sm">Dirección<input bind:value={form.direccion} class="mt-1 w-full rounded-lg border p-2" /></label>
            <div class="grid gap-3 sm:grid-cols-2">
                <label class="text-sm">Teléfono<input bind:value={form.telefono} class="mt-1 w-full rounded-lg border p-2" /></label><label class="text-sm"
                    >Horario<input bind:value={form.horario} class="mt-1 w-full rounded-lg border p-2" /></label
                >
            </div>
            <label class="block text-sm">Sitio web<input type="url" bind:value={form.sitio_web} class="mt-1 w-full rounded-lg border p-2" placeholder="https://" /></label><label
                class="block text-sm"
                >Estado<select bind:value={form.estado} class="mt-1 w-full rounded-lg border p-2"
                    ><option value="OCULTADO">Ocultado</option><option value="PUBLICADO">Publicado</option></select
                ></label
            >
        </div>

        <div class="min-w-0 space-y-3 rounded-2xl border bg-white p-5">
            <h2 class="text-xl font-semibold">Paso 3 · Imágenes y videos</h2>
            <p class="text-sm text-slate-500">
                Hasta 20 imágenes y videos por lugar. Arrastrá archivos o seleccionalos desde tu equipo. Los recursos se agregan exclusivamente mediante carga de archivos.
            </p>
            <div
                role="region"
                aria-label="Subir imágenes y videos"
                class={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${zonaArrastre ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}
                ondragover={(e) => {
                    e.preventDefault();
                    zonaArrastre = true;
                }}
                ondragleave={() => (zonaArrastre = false)}
                ondrop={soltar}
            >
                <p class="font-medium">Arrastrá imágenes o videos aquí</p>
                <p class="mb-3 text-sm text-slate-500">JPG, PNG, WebP, GIF hasta 10 MB; MP4 y WebM hasta 80 MB</p>
                <input
                    bind:this={inputArchivo}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                    multiple
                    class="sr-only"
                    id="recurso-ubicacion"
                    onchange={(e) => {
                        if (e.currentTarget.files) void subirArchivos(e.currentTarget.files);
                    }}
                /><label for="recurso-ubicacion" class="inline-block cursor-pointer rounded-lg bg-[#477967] px-4 py-2 text-sm font-medium text-white">Seleccionar archivos</label
                >{#if subiendo}<p role="status" class="mt-2 text-sm text-emerald-700">Subiendo archivos…</p>{/if}
            </div>
            {#each recursos as recurso, i}<div class="flex items-center gap-3 rounded-lg bg-slate-50 p-2">
                    <div class="h-16 w-24 shrink-0 overflow-hidden rounded bg-slate-200">
                        {#if recurso.tipo === 'IMAGEN'}<img alt={`Imagen ${i + 1}`} src={recurso.uri} class="h-full w-full object-cover" />{:else}<video
                                src={recurso.uri}
                                class="h-full w-full object-cover"
                                controls
                                preload="metadata"><track kind="captions" /></video
                            >{/if}
                    </div>
                    <div class="min-w-0 flex-1">
                        <span class="text-xs font-semibold">{recurso.tipo === 'IMAGEN' ? 'Imagen' : 'Video'} {i + 1}</span>
                        <p class="truncate text-xs text-slate-500">{recurso.uri}</p>
                    </div>
                    <div class="flex gap-1">
                        <button
                            type="button"
                            aria-label={`Subir recurso ${i + 1}`}
                            disabled={i === 0}
                            onclick={() => moverRecurso(i, -1)}
                            class="rounded border px-2 py-1 disabled:opacity-30">↑</button
                        ><button
                            type="button"
                            aria-label={`Bajar recurso ${i + 1}`}
                            disabled={i === recursos.length - 1}
                            onclick={() => moverRecurso(i, 1)}
                            class="rounded border px-2 py-1 disabled:opacity-30">↓</button
                        ><button type="button" class="rounded border px-2 py-1 text-rose-700" onclick={() => (recursos = recursos.filter((_, j) => i !== j))}>Quitar</button>
                    </div>
                </div>{/each}
            <p class="text-xs text-slate-500">{recursos.length} de 20 recursos</p>
        </div>
        <div class="flex flex-wrap justify-end gap-3">
            <a href="/administrador/ubicaciones" class="rounded-lg border px-5 py-3">Cancelar</a><button
                type="submit"
                disabled={guardando || cargando || subiendo}
                class="rounded-lg bg-[#477967] px-5 py-3 font-medium text-white disabled:opacity-50"
                >{guardando ? 'Guardando…' : esNuevo ? 'Crear ubicación' : 'Guardar cambios'}</button
            >
        </div>
    </form>
</section>

<style>
    :global(html:has(.ubicaciones-scroll-fix)),
    :global(body:has(.ubicaciones-scroll-fix)) {
        height: 100%;
        overflow: hidden;
    }

    .ubicaciones-scroll-fix {
        width: 100%;
        min-width: 0;
        max-width: 72rem;
        padding-bottom: 2rem;
    }
</style>
