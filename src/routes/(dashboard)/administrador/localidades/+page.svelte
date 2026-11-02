<script lang="ts">
    import { onMount } from 'svelte';

    type Localidad = {
        id: number;
        slug: string;
        nombre: string;
        descripcion: string | null;
        latitud: number | null;
        longitud: number | null;
        icono: string | null;
        estado: 'PUBLICADO' | 'OCULTADO';
    };
    type Campos = {
        slug: string;
        nombre: string;
        descripcion: string;
        latitud: string;
        longitud: string;
        estado: Localidad['estado'];
    };
    const vacio = (): Campos => ({
        slug: '', nombre: '', descripcion: '', latitud: '', longitud: '', estado: 'PUBLICADO'
    });

    let localidades = $state<Localidad[]>([]);
    let campos = $state<Campos>(vacio());
    let editando = $state<Localidad | null>(null);
    let quitarIcono = $state(false);
    let cargando = $state(true);
    let guardando = $state(false);
    let error = $state('');
    let mensaje = $state('');

    async function cargar() {
        cargando = true;
        error = '';
        try {
            const respuesta = await fetch('/api/admin/localidades', { credentials: 'include' });
            if (!respuesta.ok) throw new Error('No se pudieron cargar las localidades.');
            localidades = await respuesta.json();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error inesperado.';
        } finally {
            cargando = false;
        }
    }
    function editar(localidad: Localidad) {
        editando = localidad;
        campos = {
            slug: localidad.slug,
            nombre: localidad.nombre,
            descripcion: localidad.descripcion ?? '',
            latitud: localidad.latitud === null ? '' : String(localidad.latitud),
            longitud: localidad.longitud === null ? '' : String(localidad.longitud),
            estado: localidad.estado
        };
        quitarIcono = false;
        error = '';
        mensaje = '';
    }
    function nueva() {
        editando = null;
        campos = vacio();
        quitarIcono = false;
        error = '';
        mensaje = '';
    }
    async function guardar(event: SubmitEvent) {
        event.preventDefault();
        if (guardando) return;
        const formulario = event.currentTarget as HTMLFormElement;
        guardando = true;
        error = '';
        mensaje = '';
        try {
            const respuesta = await fetch('/api/admin/localidades' + (editando ? '/' + editando.id : ''), {
                method: editando ? 'PUT' : 'POST',
                credentials: 'include',
                body: new FormData(formulario)
            });
            if (!respuesta.ok) {
                const datos = await respuesta.json().catch(() => ({}));
                throw new Error(datos.message ?? datos.error ?? 'No se pudo guardar la localidad.');
            }
            mensaje = editando ? 'Localidad actualizada.' : 'Localidad creada.';
            nueva();
            mensaje = 'Los cambios de la localidad se guardaron correctamente.';
            await cargar();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error al guardar.';
        } finally {
            guardando = false;
        }
    }
    async function eliminar(localidad: Localidad) {
        if (!confirm('¿Eliminar ' + localidad.nombre + '? Si está en uso, el servidor lo impedirá.')) return;
        error = '';
        mensaje = '';
        try {
            const respuesta = await fetch('/api/admin/localidades/' + localidad.id, {
                method: 'DELETE', credentials: 'include'
            });
            if (!respuesta.ok) {
                const datos = await respuesta.json().catch(() => ({}));
                throw new Error(datos.message ?? datos.error ?? 'No se pudo eliminar. Podés ocultar la localidad desde el formulario.');
            }
            if (editando?.id === localidad.id) nueva();
            mensaje = 'Localidad eliminada.';
            await cargar();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error al eliminar.';
        }
    }
    onMount(() => { void cargar(); });
</script>

<svelte:head><title>Localidades | Cerro Largo 360</title></svelte:head>
<section class="mx-auto w-full max-w-6xl space-y-6 pb-10">
    <header>
        <p class="text-sm text-slate-500">Administración</p>
        <h1 class="text-3xl font-semibold text-[#26382e]">Localidades</h1>
        <p class="mt-2 text-sm text-slate-600">Administrá las localidades del mapa. El icono es opcional; las coordenadas permiten mostrar el marcador en el mapa interactivo.</p>
    </header>

    {#if error}<p role="alert" class="rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>{/if}
    {#if mensaje}<p role="status" class="rounded-xl bg-emerald-50 p-4 text-emerald-800">{mensaje}</p>{/if}

    <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="min-w-0 rounded-2xl border border-[#d9e4da] bg-white p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
                <h2 class="text-xl font-semibold">Localidades registradas</h2>
                <span class="rounded-full bg-[#e7f0e8] px-3 py-1 text-sm text-[#285544]">{localidades.length}</span>
            </div>
            {#if cargando}<p class="py-8 text-slate-500">Cargando localidades…</p>
            {:else if !localidades.length}<p class="py-8 text-slate-500">Todavía no hay localidades. Creá la primera desde el formulario.</p>
            {:else}
                <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {#each localidades as localidad (localidad.id)}
                        <article class="flex items-center gap-4 rounded-xl border border-[#e0e8df] p-3">
                            {#if localidad.icono}
                                <img src={localidad.icono} alt="" class="h-14 w-14 shrink-0 rounded-xl border object-cover" />
                            {:else}
                                <span class="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#e7f0e8] text-2xl text-[#2f6d50]" aria-hidden="true">⌖</span>
                            {/if}
                            <div class="min-w-0 flex-1">
                                <h3 class="font-semibold text-[#26382e]">{localidad.nombre}</h3>
                                <p class="truncate text-xs text-slate-500">{localidad.slug} · {localidad.estado === 'PUBLICADO' ? 'Visible' : 'Oculta'}</p>
                                <p class="text-xs text-slate-500">{localidad.latitud === null ? 'Sin coordenadas' : 'Marcador configurado'}</p>
                            </div>
                            <div class="flex shrink-0 flex-col gap-1">
                                <button type="button" onclick={() => editar(localidad)} class="rounded-lg px-2 py-1 text-sm font-medium text-[#285544] hover:bg-[#e7f0e8]">Editar</button>
                                <button type="button" onclick={() => eliminar(localidad)} class="rounded-lg px-2 py-1 text-sm text-rose-700 hover:bg-rose-50">Eliminar</button>
                            </div>
                        </article>
                    {/each}
                </div>
            {/if}
        </div>

        <form method="post" enctype="multipart/form-data" onsubmit={guardar} class="h-fit space-y-4 rounded-2xl border border-[#d9e4da] bg-white p-5">
            <div class="flex items-center justify-between gap-2">
                <h2 class="text-xl font-semibold">{editando ? 'Editar localidad' : 'Nueva localidad'}</h2>
                {#if editando}<button type="button" onclick={nueva} class="text-sm text-[#285544] underline">Cancelar</button>{/if}
            </div>
            <label class="block text-sm font-medium">Nombre
                <input name="nombre" bind:value={campos.nombre} required minlength="2" maxlength="120" class="mt-1 w-full rounded-lg border border-slate-300 p-2.5" placeholder="Melo" />
            </label>
            <label class="block text-sm font-medium">Slug para la URL
                <input name="slug" bind:value={campos.slug} required minlength="2" maxlength="120" pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" class="mt-1 w-full rounded-lg border border-slate-300 p-2.5" placeholder="Melo" />
            </label>
            <label class="block text-sm font-medium">Descripción
                <textarea name="descripcion" bind:value={campos.descripcion} maxlength="500" rows="3" class="mt-1 w-full rounded-lg border border-slate-300 p-2.5" placeholder="Descripción breve de la localidad"></textarea>
            </label>
            <div class="grid grid-cols-2 gap-3">
                <label class="block text-sm font-medium">Latitud
                    <input name="latitud" bind:value={campos.latitud} type="number" step="any" min="-90" max="90" class="mt-1 w-full rounded-lg border border-slate-300 p-2.5" placeholder="-32.37" />
                </label>
                <label class="block text-sm font-medium">Longitud
                    <input name="longitud" bind:value={campos.longitud} type="number" step="any" min="-180" max="180" class="mt-1 w-full rounded-lg border border-slate-300 p-2.5" placeholder="-54.17" />
                </label>
            </div>
            <label class="block text-sm font-medium">Estado
                <select name="estado" bind:value={campos.estado} class="mt-1 w-full rounded-lg border border-slate-300 p-2.5">
                    <option value="PUBLICADO">Visible</option><option value="OCULTADO">Oculta</option>
                </select>
            </label>
            <label class="block text-sm font-medium">Icono del mapa
                <input name="recursos" type="file" accept="image/jpeg,image/png,image/webp" class="mt-1 block w-full text-sm" />
                <small class="text-slate-500">JPG, PNG o WebP. Máximo 2 MB.</small>
            </label>
            {#if editando?.icono}
                <label class="flex items-center gap-2 text-sm"><input name="quitar_icono" type="checkbox" value="true" bind:checked={quitarIcono} /> Quitar icono actual</label>
            {/if}
            <button disabled={guardando} type="submit" class="w-full rounded-xl bg-[#477967] px-4 py-3 font-semibold text-white hover:bg-[#376554] disabled:opacity-50">
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear localidad'}
            </button>
        </form>
    </div>
</section>