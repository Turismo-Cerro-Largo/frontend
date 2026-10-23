<script lang="ts">
    import { onMount } from 'svelte';
    import { obtenerLocalidadesPublicas } from '$lib/localidades/api';
    import { subirRecursosDelFormulario } from '$lib/admin/subir-recursos';
    import 'mapbox-gl/dist/mapbox-gl.css';
    import { goto } from '$app/navigation';
    import { env } from '$env/dynamic/public';
    const PUBLIC_MAPBOX_TOKEN = env.PUBLIC_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || '';
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
    type VistaPrevia = { url: string; tipo: 'IMAGEN' | 'VIDEO'; nombre: string };
    let vistasPrevias = $state<VistaPrevia[]>([]);
    let recursos = $state<Recurso[]>([]),
        cargando = $state(true),
        guardando = $state(false),
        error = $state(''),
        mensaje = $state('');
    let subiendo = $state(false),
        inputArchivo: HTMLInputElement;
    let formulario: HTMLFormElement;
    let contenedor: HTMLDivElement;
    let mapa: any = null,
        marcador: any = null;
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
    let localidadesDisponibles = $state<string[]>([]);
    let errorLocalidades = $state('');
    let cargandoLocalidades = $state(true);
    onMount(() => {
        let activo = true;
        obtenerLocalidadesPublicas()
            .then((datos) => { if (activo) localidadesDisponibles = datos.map((item) => item.nombre); })
            .catch(() => { if (activo) errorLocalidades = 'No se pudieron cargar las localidades.'; })
            .finally(() => { if (activo) cargandoLocalidades = false; });
        async function cargar() {
            try {
                const cr = await fetch('/api/categorias', { credentials: 'include' });
                if (!cr.ok) throw new Error(`No se pudieron cargar las categorías (${cr.status}).`);
                const cats = await cr.json();
                categorias = Array.isArray(cats) ? cats : (cats.categorias ?? []);
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
            for (const vista of vistasPrevias) URL.revokeObjectURL(vista.url);
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
            await subirRecursosDelFormulario(formulario, inputArchivo, seleccion, (cargados, lote) => {
                recursos = [...recursos, ...cargados];
                vistasPrevias = [...vistasPrevias, ...lote.map((file) => ({
                    url: URL.createObjectURL(file),
                    tipo: file.type.startsWith('video/') ? 'VIDEO' as const : 'IMAGEN' as const,
                    nombre: file.name,
                }))];
            });
        } catch (e) {
            error = e instanceof Error ? e.message : 'No se pudieron subir los archivos.';
        } finally {
            subiendo = false;
            if (inputArchivo) inputArchivo.value = '';
        }
    }
    async function guardar() {
        if (guardando || subiendo) return;
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
            const r = await fetch('/api/admin/ubicaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...form, recursos }),
            });
            if (!r.ok) {
                const body = await r.json().catch(() => ({}));
                throw new Error(body.error ?? `No se pudo guardar (${r.status}).`);
            }
            mensaje = 'Ubicación creada correctamente.';
            await goto('/administrador/ubicaciones');
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error inesperado';
        } finally {
            guardando = false;
        }
    }
</script>

<svelte:head><title>Nueva ubicación | Cerro Largo 360</title></svelte:head>
<section class="ubicaciones-scroll-fix mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-8">
    <a href="/administrador/ubicaciones" class="text-sm font-medium text-[#477967] hover:underline">← Volver a ubicaciones</a>
    <header>
        <h1 class="text-3xl font-semibold">Nueva ubicación turística</h1>
        <p class="mt-1 text-slate-500">Primero seleccioná la ubicación en Mapbox; después completá la información del lugar.</p>
    </header>
    {#if cargando}<p class="rounded-xl border p-6">Cargando formulario…</p>{/if}
    {#if error}<p role="alert" class="rounded-lg bg-rose-50 p-4 text-rose-800">{error}</p>{/if}{#if mensaje}<p role="status" class="rounded-lg bg-emerald-50 p-4 text-emerald-800">
            {mensaje}
        </p>{/if}
    <form bind:this={formulario} method="post" enctype="multipart/form-data"
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
                <label class="block min-w-0 text-sm">Localidad *
                    <span class="relative mt-1 flex items-center">
                        <span aria-hidden="true" class="pointer-events-none absolute left-3.5 text-[22px] leading-none text-[#2f6d50]">⌖</span>
                        <select required bind:value={form.localidad} disabled={cargandoLocalidades || (!localidadesDisponibles.length && !form.localidad)} class="min-h-12 w-full cursor-pointer appearance-none rounded-[11px] border border-[#b7cebd] bg-white py-2.5 pl-10 pr-9 text-sm font-semibold text-[#233c35] disabled:cursor-not-allowed disabled:opacity-60">
                            <option value="" disabled>{cargandoLocalidades ? 'Cargando localidades…' : 'Seleccionar localidad'}</option>
                            {#if form.localidad && !localidadesDisponibles.includes(form.localidad)}
                                <option value={form.localidad}>{form.localidad} (valor actual)</option>
                            {/if}
                            {#each localidadesDisponibles as nombre}<option value={nombre}>{nombre}</option>{/each}
                        </select>
                        <span aria-hidden="true" class="pointer-events-none absolute right-3.5 text-[22px] leading-none text-[#2f6d50]">⌄</span>
                    </span>
                    {#if errorLocalidades}<span class="mt-1 block text-xs text-red-700">{errorLocalidades} <a href="/administrador/localidades" class="underline">Administrar localidades</a></span>{/if}
                    {#if !cargandoLocalidades && !errorLocalidades && !localidadesDisponibles.length}<span class="mt-1 block text-xs text-amber-800">No hay localidades publicadas. <a href="/administrador/localidades" class="underline">Administrar localidades</a></span>{/if}
                </label><label class="text-sm"
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

        <div class="min-w-0 rounded-2xl border bg-white p-5">
            <h2 class="mb-3 text-xl font-semibold">Paso 3 · Imágenes y videos</h2>
            <input
                bind:this={inputArchivo}
                id="recurso-ubicacion"
                type="file" name="recursos"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                multiple
                class="hidden"
                onchange={(e) => {
                    if (e.currentTarget.files) void subirArchivos(e.currentTarget.files);
                }}
            />
            <div class="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    disabled={subiendo}
                    onclick={() => inputArchivo?.click()}
                    class="inline-flex cursor-pointer items-center rounded-lg bg-[#477967] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >Subir imágenes o videos</button
                >
                <span class="text-sm text-slate-500" role="status">
                    {subiendo ? 'Subiendo archivos…' : `${recursos.length} de 20 archivos cargados`}
                </span>
            </div>
            {#if vistasPrevias.length > 0}
                <div class="mt-4 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Vista previa de archivos cargados">
                    {#each vistasPrevias as vista (vista.url)}
                        <div class="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {#if vista.tipo === 'IMAGEN'}
                                <img src={vista.url} alt={vista.nombre} loading="lazy" class="block h-28 w-full object-cover sm:h-32" />
                            {:else}
                                <video src={vista.url} controls muted preload="metadata" class="block h-28 w-full bg-black object-contain sm:h-32" aria-label={vista.nombre}>
                                    <track kind="captions" />
                                </video>
                            {/if}
                            <p class="truncate px-2 py-1.5 text-xs text-slate-600" title={vista.nombre}>{vista.nombre}</p>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
        <div class="flex flex-wrap justify-end gap-3">
            <a href="/administrador/ubicaciones" class="rounded-lg border px-5 py-3">Cancelar</a><button
                type="submit"
                disabled={guardando || cargando || subiendo}
                class="rounded-lg bg-[#477967] px-5 py-3 font-medium text-white disabled:opacity-50">{guardando ? 'Guardando…' : 'Crear ubicación'}</button
            >
        </div>
    </form>
</section>

<style>
    .ubicaciones-scroll-fix {
        width: 100%;
        min-width: 0;
        max-width: 72rem;
        padding-bottom: 2rem;
    }
</style>
