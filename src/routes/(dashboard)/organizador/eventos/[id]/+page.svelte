<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { goto } from '$app/navigation';
    import { obtenerLocalidadesPublicas } from '$lib/localidades-client';
    import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
    import 'mapbox-gl/dist/mapbox-gl.css';

    import { page } from '$app/state';

    type Evento = {
        id: number;
        id_organizador: number;
        titulo: string;
        descripcion: string;
        inicio: string;
        fin: string | null;
        id_categoria: number;
        lugar_evento: string | null;
        latitud: string | number | null;
        longitud: string | number | null;
        es_gratuito: boolean;
        precio: string | number | null;
        contacto: string | null;
        estado: string;
        motivo_rechazo: string | null;
        recursos: { uri: string; tipo: string; orden: number }[];
    };

    let id = $derived(page.params.id ?? ''); // SvelteKit permite undefined en rutas dinámicas
    let categorias = $state<{ id: number; nombre: string }[]>([]);
    let evento = $state<Evento | null>(null);
    let error = $state('');
    let cargando = $state(true);
    let enviando = $state(false);
    let mapaElemento = $state<HTMLDivElement>();
    let latitud = $state('');
    let longitud = $state('');
    let categoriaId = $state('');
    let titulo = $state('');
    let descripcion = $state('');
    let localidad = $state('');
    let direccion = $state('');
    let telefono = $state('');
    let correo = $state('');
    let redes = $state('');
    let esGratuito = $state('true');
    let precio = $state('');
    let fechaInicio = $state('');
    let horaInicio = $state('');
    let fechaFin = $state('');
    let horaFin = $state('');

    let localidades = $state<string[]>([]);

    const aISO = (fecha: string, hora: string) => (fecha && hora ? new Date(`${fecha}T${hora}:00-03:00`).toISOString() : '');
    const inicio = $derived(aISO(fechaInicio, horaInicio));
    const fin = $derived(aISO(fechaFin, horaFin));

    function separarFecha(valor: string | null) {
        if (!valor) return ['', ''];
        const partes = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'America/Montevideo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(new Date(valor));
        const campo = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
        return [`${campo('year')}-${campo('month')}-${campo('day')}`, `${campo('hour')}:${campo('minute')}`];
    }

    onMount(() => {
        let mapa: import('mapbox-gl').Map | undefined;
        let marcador: import('mapbox-gl').Marker | undefined;
        let activo = true;

        (async () => {
            try {
                if (!id) throw new Error('ID de evento inválido.');
                const [rc, re, localidadesData] = await Promise.all([fetch('/api/categorias'), fetch(`/api/eventos/${encodeURIComponent(id)}`, { credentials: 'include' }), obtenerLocalidadesPublicas()]);
                if (!rc.ok || !re.ok) throw new Error(re.status === 404 ? 'El evento no existe.' : 'No se pudo cargar el evento.');
                const [categoriasData, datos] = await Promise.all([rc.json(), re.json()]);
                if (!activo) return;
                categorias = categoriasData.categorias;
                localidades = localidadesData.map((item) => item.nombre);
                evento = datos as Evento;
                if (!['BORRADOR', 'RECHAZADO'].includes(evento.estado)) return;
                titulo = evento.titulo;
                descripcion = evento.descripcion;
                categoriaId = String(evento.id_categoria);
                [fechaInicio, horaInicio] = separarFecha(evento.inicio);
                [fechaFin, horaFin] = separarFecha(evento.fin);
                const partesLugar = (evento.lugar_evento ?? '').split(', ');
                localidad = localidades.includes(partesLugar[0]) ? partesLugar.shift()! : '';
                direccion = localidad ? partesLugar.join(', ') : (evento.lugar_evento ?? '');
                [telefono = '', correo = '', redes = ''] = (evento.contacto ?? '').split(' | ');
                latitud = evento.latitud == null ? '' : String(evento.latitud);
                longitud = evento.longitud == null ? '' : String(evento.longitud);
                esGratuito = String(evento.es_gratuito);
                precio = evento.precio == null ? '' : String(evento.precio);

                cargando = false;
                await tick(); // Mostrar el formulario antes de montar Mapbox
                const mapboxgl = (await import('mapbox-gl')).default;
                if (!activo || !mapaElemento) return;
                mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;
                mapa = new mapboxgl.Map({
                    container: mapaElemento,
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: longitud && latitud ? [Number(longitud), Number(latitud)] : [-54.167, -32.366],
                    zoom: latitud && longitud ? 13 : 9,
                });
                mapa.addControl(new mapboxgl.NavigationControl(), 'top-right');
                if (longitud && latitud) {
                    marcador = new mapboxgl.Marker({ color: '#D89994' }).setLngLat([Number(longitud), Number(latitud)]).addTo(mapa);
                }
                mapa.on('click', ({ lngLat }) => {
                    latitud = lngLat.lat.toFixed(7);
                    longitud = lngLat.lng.toFixed(7);
                    marcador?.remove();
                    if (mapa) marcador = new mapboxgl.Marker({ color: '#D89994' }).setLngLat(lngLat).addTo(mapa);
                });
            } catch (e) {
                if (activo) error = e instanceof Error ? e.message : 'No se pudo cargar el evento';
            } finally {
                if (activo) cargando = false;
            }
        })();

        return () => {
            activo = false;
            marcador?.remove();
            mapa?.remove();
        };
    });

    async function guardar(event: SubmitEvent) {
        event.preventDefault();
        if (enviando) return;
        error = '';
        const datos = new FormData(event.currentTarget as HTMLFormElement, event.submitter as HTMLElement);
        enviando = true;
        try {
            const respuesta = await fetch(`/api/eventos/${encodeURIComponent(id)}`, {
                method: 'PUT',
                credentials: 'include',
                body: datos,
            });
            if (!respuesta.ok) {
                const resultado = await respuesta.json().catch(() => ({}));
                throw new Error(resultado.message || `Error HTTP ${respuesta.status}`);
            }
            await goto('/organizador/eventos');
        } catch (e) {
            error = e instanceof Error ? e.message : 'No se pudo guardar el evento';
        } finally {
            enviando = false;
        }
    }
</script>

<svelte:head>
    <title>Evento | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
    <header class="mb-8">
        <a href="/organizador/eventos" class="mb-4 inline-block text-sm font-medium text-[#65756b] hover:underline">← Volver a mis eventos</a>
        <a href={`/organizador/eventos/${id}/preview`} target="_blank" rel="noopener noreferrer" class="ml-4 inline-block text-sm font-medium text-[#75514e] hover:underline"
            >Abrir vista previa ↗</a
        >
        <p class="mb-1 text-sm font-medium text-[#708076]">Panel del organizador</p>
        <h1 class="text-3xl font-bold text-[#26382e]">{evento && ['BORRADOR', 'RECHAZADO'].includes(evento.estado) ? 'Editar evento' : 'Ver evento'}</h1>
        <p class="mt-2 text-[#68746c]">
            {evento && ['BORRADOR', 'RECHAZADO'].includes(evento.estado) ? 'Actualizá los datos y guardá como borrador o enviá a revisión.' : 'Consultá la información del evento.'}
        </p>
    </header>

    {#if cargando}
        <p class="text-[#68746c]">Cargando evento...</p>
    {:else if !evento}
        <p role="alert" class="text-red-700">{error || 'No se encontró el evento.'}</p>
    {:else if !['BORRADOR', 'RECHAZADO'].includes(evento.estado)}
        <div class="max-w-5xl space-y-5">
            <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
                <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 class="text-2xl font-bold text-[#26382e]">{evento.titulo}</h2>
                    <span class="rounded-full bg-[#d7e5db] px-3 py-1 text-sm font-semibold text-[#385443]">{evento.estado.replaceAll('_', ' ')}</span>
                </div>
                <p class="whitespace-pre-wrap text-[#45564b]">{evento.descripcion}</p>
            </div>
            <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
                <h3 class="mb-3 text-lg font-bold text-[#26382e]">Información</h3>
                <dl class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt class="text-sm text-[#68746c]">Inicio</dt>
                        <dd>{new Date(evento.inicio).toLocaleString('es-UY', { timeZone: 'America/Montevideo' })}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-[#68746c]">Fin</dt>
                        <dd>{evento.fin ? new Date(evento.fin).toLocaleString('es-UY', { timeZone: 'America/Montevideo' }) : 'Sin definir'}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-[#68746c]">Lugar</dt>
                        <dd>{evento.lugar_evento || 'Sin definir'}</dd>
                    </div>
                    <div>
                        <dt class="text-sm text-[#68746c]">Entrada</dt>
                        <dd>{evento.es_gratuito ? 'Gratuita' : `$ ${evento.precio ?? 'Sin definir'}`}</dd>
                    </div>
                </dl>
                {#if evento.motivo_rechazo}<p class="mt-4 text-red-700">Motivo del rechazo: {evento.motivo_rechazo}</p>{/if}
            </div>
            {#if evento.recursos?.length}
                <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
                    <h3 class="mb-3 text-lg font-bold text-[#26382e]">Recursos</h3>
                    <ul class="space-y-2">
                        {#each evento.recursos as recurso, indice (indice)}
                            <li><a href={recurso.uri} target="_blank" rel="noopener noreferrer" class="text-[#75514e] underline">Archivo {indice + 1}</a></li>
                        {/each}
                    </ul>
                </div>
            {/if}
            <a href="/organizador/eventos" class="inline-block rounded-xl bg-[#d7e5db] px-5 py-3 text-sm font-semibold text-[#385443]">Volver a mis eventos</a>
        </div>
    {:else}
        {#if evento.motivo_rechazo}
            <p class="mb-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">Motivo del rechazo: {evento.motivo_rechazo}</p>
        {/if}
        <form method="POST" enctype="multipart/form-data" onsubmit={guardar} class="max-w-5xl space-y-6">
            <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
                <h2 class="mb-5 text-xl font-bold text-[#26382e]">Información del evento</h2>
                <div class="space-y-5">
                    <div>
                        <label for="titulo" class="mb-2 block text-sm font-semibold">Nombre del evento *</label>
                        <input
                            id="titulo"
                            name="titulo"
                            bind:value={titulo}
                            minlength="2"
                            maxlength="180"
                            required
                            placeholder="Ej: Feria de artesanos de Melo"
                            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                        />
                    </div>
                    <div>
                        <label for="id_categoria" class="mb-2 block text-sm font-semibold">Categoría del evento *</label>
                        <select id="id_categoria" name="id_categoria" bind:value={categoriaId} required class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3">
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
                            bind:value={descripcion}
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
                        <select id="localidad" name="localidad" bind:value={localidad} class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3">
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
                            bind:value={direccion}
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
                <p class="mb-4 text-sm text-[#738078]">Podés agregar imágenes JPG, PNG o WEBP. Las anteriores se conservan. Total del formulario inferior a 20 MB.</p>
                <p class="mb-2 text-sm text-[#68746c]">Archivos actuales: {evento.recursos.length}</p>
                <input
                    type="file"
                    name="recursos"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    class="w-full rounded-xl border border-dashed border-[#cbd5cd] bg-[#fafbf9] p-5"
                />
            </div>

            <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
                <h2 class="mb-5 text-xl font-bold text-[#26382e]">Entrada</h2>
                <div class="flex gap-6">
                    <label class="flex items-center gap-2"><input type="radio" name="es_gratuito" value="true" bind:group={esGratuito} /> Gratuita</label>
                    <label class="flex items-center gap-2"><input type="radio" name="es_gratuito" value="false" bind:group={esGratuito} /> Paga</label>
                </div>
                <div class="mt-5 max-w-xs">
                    <label for="precio" class="mb-2 block text-sm font-semibold">Precio ($UYU). Solo si es paga</label>
                    <input id="precio" name="precio" bind:value={precio} type="number" min="0" step="0.01" class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3" />
                </div>
            </div>

            <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
                <h2 class="mb-5 text-xl font-bold text-[#26382e]">Datos de contacto</h2>
                <div class="grid gap-5 md:grid-cols-2">
                    <div>
                        <label for="telefono" class="mb-2 block text-sm font-semibold">Teléfono</label><input
                            id="telefono"
                            name="telefono"
                            bind:value={telefono}
                            type="tel"
                            maxlength="30"
                            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                        />
                    </div>
                    <div>
                        <label for="correo" class="mb-2 block text-sm font-semibold">Correo electrónico</label><input
                            id="correo"
                            name="correo"
                            bind:value={correo}
                            type="email"
                            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
                        />
                    </div>
                    <div class="md:col-span-2">
                        <label for="redes" class="mb-2 block text-sm font-semibold">Redes sociales</label><input
                            id="redes"
                            name="redes"
                            bind:value={redes}
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
    {/if}
</section>
