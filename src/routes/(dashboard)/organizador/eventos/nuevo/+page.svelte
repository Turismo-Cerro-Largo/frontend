<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { obtenerLocalidadesPublicas } from '$lib/localidades/api';
    import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
    import 'mapbox-gl/dist/mapbox-gl.css';

    let categorias = $state<{ id: number; nombre: string }[]>([]);
    let error = $state('');
    let enviando = $state(false);
    let mapaElemento = $state<HTMLDivElement>();
    let latitud = $state('');
    let longitud = $state('');
    let fechaInicio = $state('');
    let horaInicio = $state('');
    let fechaFin = $state('');
    let horaFin = $state('');

    let localidades = $state<string[]>([]);

    // Valores compuestos
    const aISO = (fecha: string, hora: string) => (fecha && hora ? new Date(`${fecha}T${hora}:00-03:00`).toISOString() : '');
    let inicio = $derived(aISO(fechaInicio, horaInicio));
    let fin = $derived(aISO(fechaFin, horaFin));

    onMount(() => {
        let mapa: import('mapbox-gl').Map | undefined;
        let marcador: import('mapbox-gl').Marker | undefined;
        let activo = true;

        // Cargar las categorias
        fetch('/api/categorias')
            .then((r) => {
                if (!r.ok) throw new Error('No se pudieron cargar las categorías');
                return r.json();
            })
            .then((data) => {
                if (activo) categorias = data.categorias;
            })
            .catch((e) => {
                if (activo) error = e.message;
            });

        obtenerLocalidadesPublicas()
            .then((datos) => { if (activo) localidades = datos.map((item) => item.nombre); })
            .catch((e) => { if (activo) error = e.message; });

        // Cargar el mapa
        (async () => {
            try {
                const mapboxgl = (await import('mapbox-gl')).default;
                if (!activo || !mapaElemento) return;
                mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;
                mapa = new mapboxgl.Map({
                    container: mapaElemento,
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: [-54.167, -32.366],
                    zoom: 9,
                });
                mapa.addControl(new mapboxgl.NavigationControl(), 'top-right');
                mapa.on('click', ({ lngLat }) => {
                    latitud = lngLat.lat.toFixed(7);
                    longitud = lngLat.lng.toFixed(7);
                    marcador?.remove();
                    marcador = new mapboxgl.Marker({ color: '#D89994' }).setLngLat(lngLat).addTo(mapa!);
                });
            } catch {
                if (activo) error = 'No se pudo cargar el mapa';
            }
        })();

        return () => {
            activo = false;
            marcador?.remove();
            mapa?.remove();
        };
    });

    // Funcion para publicar evento
    async function crear(event: SubmitEvent) {
        event.preventDefault();
        if (enviando) return;
        error = '';
        const datos = new FormData(event.currentTarget as HTMLFormElement, event.submitter as HTMLElement);

        enviando = true;
        try {
            const respuesta = await fetch('/api/eventos', {
                method: 'POST',
                credentials: 'include',
                body: datos,
            });
            if (!respuesta.ok) {
                const resultado = await respuesta.json().catch(() => ({}));
                throw new Error(resultado.message || `Error HTTP ${respuesta.status}`);
            }
            await goto('/organizador/eventos');
        } catch (e) {
            error = e instanceof Error ? e.message : 'No se pudo crear el evento';
        } finally {
            enviando = false;
        }
    }
</script>

<svelte:head>
    <title>Crear evento | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
    <header class="mb-8">
        <a href="/organizador/eventos" class="mb-4 inline-block text-sm font-medium text-[#65756b] hover:underline">← Volver a mis eventos</a>
        <p class="mb-1 text-sm font-medium text-[#708076]">Panel del organizador</p>
        <h1 class="text-3xl font-bold text-[#26382e]">Crear nuevo evento</h1>
        <p class="mt-2 text-[#68746c]">Completá los datos y guardá el evento o envialo a revisión.</p>
    </header>

    <form method="POST" enctype="multipart/form-data" onsubmit={crear} class="max-w-5xl space-y-6">
        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <h2 class="mb-5 text-xl font-bold text-[#26382e]">Información del evento</h2>
            <div class="space-y-5">
                <div>
                    <label for="titulo" class="mb-2 block text-sm font-semibold">Nombre del evento *</label>
                    <input
                        id="titulo"
                        name="titulo"
                        minlength="2"
                        maxlength="180"
                        required
                        placeholder="Ej: Feria de artesanos de Melo"
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
                <div>
                    <label for="id_categoria" class="mb-2 block text-sm font-semibold">Categoría del evento *</label>
                    <select id="id_categoria" name="id_categoria" required class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3">
                        <option value="">Seleccionar categoría</option>
                        {#each categorias as categoria (categoria.id)}
                            <option value={String(categoria.id)}>{categoria.nombre}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <label for="descripcion" class="mb-2 block text-sm font-semibold">Descripción *</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        minlength="5"
                        maxlength="5000"
                        rows="5"
                        required
                        placeholder="Descripción del evento..."
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"></textarea>
                </div>
            </div>
        </div>

        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <h2 class="mb-5 text-xl font-bold text-[#26382e]">Fecha y horario</h2>
            <div class="grid gap-5 md:grid-cols-2">
                <div>
                    <label for="fecha" class="mb-2 block text-sm font-semibold">Fecha de inicio *</label><input
                        id="fecha"
                        type="date"
                        bind:value={fechaInicio}
                        required
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
                <div>
                    <label for="horaInicio" class="mb-2 block text-sm font-semibold">Hora de inicio *</label><input
                        id="horaInicio"
                        type="time"
                        bind:value={horaInicio}
                        required
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
                <div>
                    <label for="fechaFin" class="mb-2 block text-sm font-semibold">Fecha de finalización</label><input
                        id="fechaFin"
                        type="date"
                        bind:value={fechaFin}
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
                <div>
                    <label for="horaFin" class="mb-2 block text-sm font-semibold">Hora de finalización</label><input
                        id="horaFin"
                        type="time"
                        bind:value={horaFin}
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
            </div>
            <input type="hidden" name="inicio" value={inicio} />
            <input type="hidden" name="fin" value={fin} />
        </div>

        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <h2 class="mb-2 text-xl font-bold text-[#26382e]">Ubicación</h2>
            <p class="mb-5 text-sm text-[#738078]">Indicá el lugar del evento y marcá su ubicación en el mapa.</p>
            <div class="grid gap-5 md:grid-cols-2">
                <div>
                    <label for="localidad" class="mb-2 block text-sm font-semibold">Localidad</label>
                    <select id="localidad" name="localidad" class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3">
                        <option value="">Seleccionar localidad</option>
                        {#each localidades as opcion}
                            <option value={opcion}>{opcion}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <label for="direccion" class="mb-2 block text-sm font-semibold">Dirección / lugar</label><input
                        id="direccion"
                        name="direccion"
                        maxlength="130"
                        placeholder="Ej: Plaza Constitución, Melo"
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
            </div>
            <p class="mb-2 mt-6 text-sm font-semibold">Ubicación en el mapa</p>
            <div class="overflow-hidden rounded-2xl border border-[#cbd5cd]"><div bind:this={mapaElemento} class="h-105 w-full"></div></div>
            <input type="hidden" name="latitud" value={latitud} />
            <input type="hidden" name="longitud" value={longitud} />

            <p class="mt-3 text-sm text-[#52675a]">{latitud ? `Latitud: ${latitud} | Longitud: ${longitud}` : 'Todavía no seleccionaste una ubicación.'}</p>
        </div>

        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <h2 class="mb-3 text-xl font-bold text-[#26382e]">Fotografías</h2>
            <p class="mb-4 text-sm text-[#738078]">Imágenes JPG, PNG o WEBP. Total del formulario inferior a 20 MB.</p>
            <input type="file" name="recursos" accept="image/jpeg,image/png,image/webp" multiple class="w-full rounded-xl border border-dashed border-[#cbd5cd] bg-[#fafbf9] p-5" />
        </div>

        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <h2 class="mb-5 text-xl font-bold text-[#26382e]">Entrada</h2>
            <div class="flex gap-6">
                <label class="flex items-center gap-2"><input type="radio" name="es_gratuito" value="true" checked /> Gratuita</label>
                <label class="flex items-center gap-2"><input type="radio" name="es_gratuito" value="false" /> Paga</label>
            </div>
            <div class="mt-5 max-w-xs">
                <label for="precio" class="mb-2 block text-sm font-semibold">Precio ($UYU). Solo si es paga</label>
                <input id="precio" name="precio" type="number" min="0" step="0.01" class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3" />
            </div>
        </div>

        <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
            <h2 class="mb-5 text-xl font-bold text-[#26382e]">Datos de contacto</h2>
            <div class="grid gap-5 md:grid-cols-2">
                <div>
                    <label for="telefono" class="mb-2 block text-sm font-semibold">Teléfono</label><input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        maxlength="30"
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
                <div>
                    <label for="correo" class="mb-2 block text-sm font-semibold">Correo electrónico</label><input
                        id="correo"
                        name="correo"
                        type="email"
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
                <div class="md:col-span-2">
                    <label for="redes" class="mb-2 block text-sm font-semibold">Redes sociales</label><input
                        id="redes"
                        name="redes"
                        maxlength="80"
                        placeholder="Ej: @feriacerrolargo"
                        class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                    />
                </div>
            </div>
        </div>

        {#if error}<div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div>{/if}
        <div class="rounded-xl border border-[#ead79c] bg-[#fff8e5] p-5 text-sm text-[#67582d]">Los eventos enviados quedan pendientes de revisión del administrador.</div>
        <div class="flex flex-col-reverse gap-3 border-t border-[#ded8cf] pt-6 sm:flex-row sm:justify-end">
            <a href="/organizador/eventos" class="rounded-xl border border-[#c8c4bd] bg-white px-6 py-3 text-center text-sm font-semibold">Cancelar</a>
            <button
                type="submit"
                name="accion"
                value="borrador"
                disabled={enviando || categorias.length === 0}
                class="rounded-xl border border-[#9eaea2] bg-[#d7e5db] px-6 py-3 text-sm font-semibold text-[#35483c] disabled:opacity-50"
                >{enviando ? 'Guardando...' : 'Guardar borrador'}</button
            >
            <button
                type="submit"
                name="accion"
                value="revision"
                disabled={enviando || categorias.length === 0}
                class="rounded-xl bg-[#D89994] px-6 py-3 text-sm font-semibold text-[#442b29] disabled:opacity-50">{enviando ? 'Guardando...' : 'Enviar a revisión'}</button
            >
        </div>
    </form>
</section>
