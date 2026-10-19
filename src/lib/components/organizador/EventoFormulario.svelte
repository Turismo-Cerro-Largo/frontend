
<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
  import type { Map, Marker } from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  import {
    contactoEvento,
    fechaInput,
    guardarEvento,
    obtenerCategorias
  } from '$lib/organizador/eventos';

  import type {
    CategoriaEvento,
    Evento
  } from '$lib/types/evento';

  let { evento = null }: { evento?: Evento | null } = $props();

  const inicial = untrack(() => evento);
  const inicioAnterior = fechaInput(inicial?.inicio ?? null);
  const finAnterior = fechaInput(inicial?.fin ?? null);
  const partesLugar = (inicial?.lugar_evento ?? '').split(' | ');
  const contacto = contactoEvento(inicial?.contacto ?? null);

  let nombre = $state(inicial?.titulo ?? '');
  let descripcion = $state(inicial?.descripcion ?? '');

  // CATEGORÍAS DE MYSQL
  let categorias = $state<CategoriaEvento[]>([]);
  let categoriaId = $state(String(inicial?.id_categoria ?? ''));
  let cargandoCategorias = $state(true);
  let errorCategorias = $state('');

  // FECHA Y HORARIOS
  let fecha = $state(inicioAnterior.fecha);
  let horaInicio = $state(inicioAnterior.hora);
  let fechaFin = $state(finAnterior.fecha);
  let horaFin = $state(finAnterior.hora);

  // UBICACIÓN
  let localidad = $state(
    partesLugar.length > 1 ? partesLugar[partesLugar.length - 1] : ''
  );
  let direccion = $state(
    partesLugar.length > 1
      ? partesLugar.slice(0, -1).join(' | ')
      : (inicial?.lugar_evento ?? '')
  );

  let latitud = $state<number | null>(
    inicial?.latitud == null ? null : Number(inicial.latitud)
  );
  let longitud = $state<number | null>(
    inicial?.longitud == null ? null : Number(inicial.longitud)
  );

  let mapContainer: HTMLDivElement;
  let mapa: Map | null = null;
  let marcador: Marker | null = null;
  let mensajeMapa = $state('');

  // ENTRADA
  let tipoEntrada = $state(
    inicial?.es_gratuito === false ? 'pago' : 'gratuito'
  );
  let precio = $state(
    inicial?.precio == null ? '' : String(inicial.precio)
  );

  // CONTACTO
  let telefono = $state(contacto.telefono);
  let correo = $state(contacto.correo);
  let redes = $state(contacto.redes);

  let archivos = $state<File[]>([]);
  let guardando = $state(false);
  let mensaje = $state('');

  const localidades = [
    'Melo',
    'Río Branco',
    'Laguna Merín',
    'Fraile Muerto',
    'Isidoro Noblía',
    'Aceguá',
    'Tupambaé',
    'Arévalo',
    'Plácido Rosas'
  ];

  // OBTENER CATEGORÍAS DE LA BASE DE DATOS
  async function cargarCategorias() {
    cargandoCategorias = true;
    errorCategorias = '';

    try {
      categorias = await obtenerCategorias();

      if (categorias.length === 0) {
        errorCategorias = 'No hay categorías registradas en MySQL.';
      } else if (
        categoriaId &&
        !categorias.some((cat) => String(cat.id) === categoriaId)
      ) {
        categoriaId = '';
        errorCategorias = 'La categoría anterior ya no está disponible.';
      }
    } catch (error) {
      categorias = [];
      errorCategorias =
        error instanceof Error
          ? error.message
          : 'Error al cargar las categorías.';
    } finally {
      cargandoCategorias = false;
    }
  }

  onMount(() => {
    let destruido = false;

    // CARGAR CATEGORÍAS AL ABRIR EL FORMULARIO
    void cargarCategorias();

    // INICIAR MAPBOX
    void (async () => {
      try {
        if (!PUBLIC_MAPBOX_TOKEN) {
          throw new Error('Falta configurar el token de Mapbox.');
        }

        const mapboxgl = (await import('mapbox-gl')).default;
        if (destruido) return;

        mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;

        mapa = new mapboxgl.Map({
          container: mapContainer,
          style: 'mapbox://styles/mapbox/streets-v12',
          center:
            latitud !== null && longitud !== null
              ? [longitud, latitud]
              : [-54.167, -32.366],
          zoom: latitud === null ? 9 : 13
        });

        mapa.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );

        if (latitud !== null && longitud !== null) {
          marcador = new mapboxgl.Marker({
            color: '#D89994'
          })
            .setLngLat([longitud, latitud])
            .addTo(mapa);
        }

        mapa.on('click', ({ lngLat }) => {
          longitud = Number(lngLat.lng.toFixed(7));
          latitud = Number(lngLat.lat.toFixed(7));

          if (!mapa) return;

          if (!marcador) {
            marcador = new mapboxgl.Marker({
              color: '#D89994'
            })
              .setLngLat([longitud!, latitud!])
              .addTo(mapa);
          } else {
            marcador.setLngLat([longitud!, latitud!]);
          }
        });
      } catch (error) {
        mensajeMapa =
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el mapa.';
      }
    })();

    return () => {
      destruido = true;
      marcador?.remove();
      mapa?.remove();
    };
  });

  function manejarImagenes(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    archivos = Array.from(input.files ?? []);
  }

  function validar(accion: 'borrador' | 'revision') {
    mensaje = '';

    if (
      !nombre.trim() ||
      !descripcion.trim() ||
      !categoriaId ||
      !fecha ||
      !horaInicio
    ) {
      mensaje =
        'Completá nombre, descripción, categoría, fecha y hora.';
      return false;
    }

    if (nombre.trim().length < 2 || descripcion.trim().length < 5) {
      mensaje =
        'El nombre debe tener al menos 2 caracteres y la descripción al menos 5.';
      return false;
    }

    if ((fechaFin && !horaFin) || (!fechaFin && horaFin)) {
      mensaje =
        'Completá fecha y hora de finalización o dejá ambas vacías.';
      return false;
    }

    if (
      accion === 'revision' &&
      (!localidad ||
        !direccion.trim() ||
        latitud === null ||
        longitud === null)
    ) {
      mensaje =
        'Completá la ubicación y seleccioná el punto en el mapa.';
      return false;
    }

    if (
      accion === 'revision' &&
      tipoEntrada === 'pago' &&
      !(Number(precio) > 0)
    ) {
      mensaje = 'Ingresá un precio válido.';
      return false;
    }

    if (
      archivos.length > 5 ||
      archivos.some(
        (archivo) =>
          !['image/png', 'image/jpeg', 'image/webp'].includes(archivo.type) ||
          archivo.size === 0 ||
          archivo.size > 5 * 1024 * 1024
      )
    ) {
      mensaje =
        'Seleccioná hasta 5 imágenes JPG, PNG o WEBP de máximo 5 MB.';
      return false;
    }

    return true;
  }

  function fechaISO(dia: string, hora: string) {
    return new Date(`${dia}T${hora}:00-03:00`).toISOString();
  }

  async function guardar(accion: 'borrador' | 'revision') {
    if (guardando || !validar(accion)) return;

    guardando = true;
    mensaje = '';

    try {
      const datos = new FormData();

      const campos: Record<string, string> = {
        titulo: nombre.trim(),
        descripcion: descripcion.trim(),
        id_categoria: categoriaId,
        inicio: fechaISO(fecha, horaInicio),
        fin:
          fechaFin && horaFin
            ? fechaISO(fechaFin, horaFin)
            : '',
        localidad,
        direccion: direccion.trim(),
        latitud: latitud === null ? '' : String(latitud),
        longitud: longitud === null ? '' : String(longitud),
        es_gratuito:
          tipoEntrada === 'gratuito' ? 'true' : 'false',
        precio: tipoEntrada === 'gratuito' ? '' : precio,
        telefono: telefono.trim(),
        correo: correo.trim(),
        redes: redes.trim(),
        accion
      };

      for (const [clave, valor] of Object.entries(campos)) {
        datos.append(clave, valor);
      }

      for (const archivo of archivos) {
        datos.append('recursos', archivo);
      }

      const guardado = await guardarEvento(evento, datos);

      await goto(`/organizador/eventos/${guardado.id}`);
    } catch (error) {
      mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el evento.';
    } finally {
      guardando = false;
    }
  }
</script>

<svelte:head>
  <title>
    {evento ? 'Editar evento' : 'Crear evento'} | Cerro Largo 360
  </title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
  <header class="mb-8">
    <a
      href="/organizador/eventos"
      class="mb-4 inline-block text-sm font-medium text-[#65756b] hover:underline"
    >
      ← Volver a mis eventos
    </a>

    <p class="mb-1 text-sm font-medium text-[#708076]">
      Panel del organizador
    </p>

    <h1 class="text-3xl font-bold text-[#26382e]">
      {evento ? 'Editar evento' : 'Crear nuevo evento'}
    </h1>

    <p class="mt-2 text-[#68746c]">
      Completá los datos y guardá el evento o envialo a revisión.
    </p>
  </header>

  <form
    class="max-w-5xl space-y-6"
    onsubmit={(event) => event.preventDefault()}
  >
    <!-- INFORMACIÓN -->
    <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-xl font-bold text-[#26382e]">
        Información del evento
      </h2>

      <div class="space-y-5">
        <div>
          <label for="nombre" class="mb-2 block text-sm font-semibold">
            Nombre del evento *
          </label>

          <input
            id="nombre"
            bind:value={nombre}
            maxlength="180"
            placeholder="Ej: Feria de artesanos de Melo"
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>

        <!-- CATEGORÍA DINÁMICA -->
        <div>
          <label for="categoria" class="mb-2 block text-sm font-semibold">
            Categoría del evento *
          </label>

          <select
            id="categoria"
            bind:value={categoriaId}
            disabled={cargandoCategorias || categorias.length === 0}
            required
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3 disabled:opacity-60"
          >
            <option value="">
              {cargandoCategorias
                ? 'Cargando categorías...'
                : 'Seleccionar categoría'}
            </option>

            {#each categorias as categoria (categoria.id)}
              <option value={String(categoria.id)}>
                {categoria.nombre}
              </option>
            {/each}
          </select>

          {#if errorCategorias}
            <div class="mt-2" role="alert">
              <p class="text-sm text-red-700">
                {errorCategorias}
              </p>

              <button
                type="button"
                onclick={() => void cargarCategorias()}
                class="mt-2 text-sm font-semibold text-[#75514e] underline"
              >
                Reintentar
              </button>
            </div>
          {:else if !cargandoCategorias}
            <p class="mt-2 text-xs text-[#738078]">
              {categorias.length} categorías cargadas desde MySQL.
            </p>
          {/if}
        </div>

        <div>
          <label for="descripcion" class="mb-2 block text-sm font-semibold">
            Descripción *
          </label>

          <textarea
            id="descripcion"
            bind:value={descripcion}
            maxlength="5000"
            rows="5"
            placeholder="Descripción del evento..."
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          ></textarea>

          <p class="mt-1 text-right text-xs text-[#8a938d]">
            {descripcion.length}/5000
          </p>
        </div>
      </div>
    </div>

    <!-- FECHA -->
    <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-xl font-bold text-[#26382e]">
        Fecha y horario
      </h2>

      <div class="grid gap-5 md:grid-cols-2">
        <div>
          <label for="fecha" class="mb-2 block text-sm font-semibold">
            Fecha de inicio *
          </label>
          <input
            id="fecha"
            type="date"
            bind:value={fecha}
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>

        <div>
          <label for="horaInicio" class="mb-2 block text-sm font-semibold">
            Hora de inicio *
          </label>
          <input
            id="horaInicio"
            type="time"
            bind:value={horaInicio}
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>

        <div>
          <label for="fechaFin" class="mb-2 block text-sm font-semibold">
            Fecha de finalización
          </label>
          <input
            id="fechaFin"
            type="date"
            bind:value={fechaFin}
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>

        <div>
          <label for="horaFin" class="mb-2 block text-sm font-semibold">
            Hora de finalización
          </label>
          <input
            id="horaFin"
            type="time"
            bind:value={horaFin}
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>
      </div>
    </div>

    <!-- UBICACIÓN -->
    <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
      <h2 class="mb-2 text-xl font-bold text-[#26382e]">
        Ubicación
      </h2>

      <p class="mb-5 text-sm text-[#738078]">
        Indicá el lugar del evento y marcá su ubicación en el mapa.
      </p>

      <div class="grid gap-5 md:grid-cols-2">
        <div>
          <label for="localidad" class="mb-2 block text-sm font-semibold">
            Localidad
          </label>
          <select
            id="localidad"
            bind:value={localidad}
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          >
            <option value="">Seleccionar localidad</option>
            {#each localidades as opcion}
              <option value={opcion}>{opcion}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="direccion" class="mb-2 block text-sm font-semibold">
            Dirección / lugar
          </label>
          <input
            id="direccion"
            bind:value={direccion}
            maxlength="150"
            placeholder="Ej: Plaza Constitución, Melo"
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>
      </div>

      <p class="mt-6 mb-2 text-sm font-semibold">
        Ubicación en el mapa
      </p>

      <div class="overflow-hidden rounded-2xl border border-[#cbd5cd]">
        <div
          bind:this={mapContainer}
          class="h-[420px] w-full"
        ></div>
      </div>

      {#if mensajeMapa}
        <p class="mt-2 text-sm text-red-700">{mensajeMapa}</p>
      {/if}

      <p class="mt-3 text-sm text-[#52675a]">
        {latitud === null
          ? 'Todavía no seleccionaste una ubicación.'
          : `Latitud: ${latitud} | Longitud: ${longitud}`}
      </p>
    </div>

    <!-- FOTOGRAFÍAS -->
    <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
      <h2 class="mb-3 text-xl font-bold text-[#26382e]">
        Fotografías
      </h2>

      <p class="mb-4 text-sm text-[#738078]">
        Hasta 5 imágenes JPG, PNG o WEBP, de máximo 5 MB cada una.
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onchange={manejarImagenes}
        class="w-full rounded-xl border border-dashed border-[#cbd5cd] bg-[#fafbf9] p-5"
      />

      {#if archivos.length > 0}
        <p class="mt-3 text-sm text-[#52675a]">
          {archivos.length} imágenes seleccionadas.
        </p>
      {/if}

      {#if evento?.recursos.length}
        <div class="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {#each evento.recursos as recurso (recurso.id)}
            <img
              src={recurso.uri}
              alt="Imagen guardada del evento"
              class="h-28 w-full rounded-xl object-cover"
            />
          {/each}
        </div>
      {/if}
    </div>

    <!-- ENTRADA -->
    <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-xl font-bold text-[#26382e]">
        Entrada
      </h2>

      <div class="flex gap-6">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            value="gratuito"
            bind:group={tipoEntrada}
          />
          Gratuita
        </label>

        <label class="flex items-center gap-2">
          <input
            type="radio"
            value="pago"
            bind:group={tipoEntrada}
          />
          Paga
        </label>
      </div>

      {#if tipoEntrada === 'pago'}
        <div class="mt-5 max-w-xs">
          <label for="precio" class="mb-2 block text-sm font-semibold">
            Precio ($UYU)
          </label>
          <input
            id="precio"
            type="number"
            min="0"
            step="0.01"
            value={precio}
            oninput={(e) => precio = e.currentTarget.value}
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>
      {/if}
    </div>

    <!-- CONTACTO -->
    <div class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-xl font-bold text-[#26382e]">
        Datos de contacto
      </h2>

      <div class="grid gap-5 md:grid-cols-2">
        <div>
          <label for="telefono" class="mb-2 block text-sm font-semibold">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            bind:value={telefono}
            maxlength="30"
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>

        <div>
          <label for="correo" class="mb-2 block text-sm font-semibold">
            Correo electrónico
          </label>
          <input
            id="correo"
            type="email"
            bind:value={correo}
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>

        <div class="md:col-span-2">
          <label for="redes" class="mb-2 block text-sm font-semibold">
            Redes sociales
          </label>
          <input
            id="redes"
            bind:value={redes}
            maxlength="80"
            placeholder="Ej: @feriacerrolargo"
            class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3"
          />
        </div>
      </div>
    </div>

    <!-- MENSAJES -->
    {#if mensaje}
      <div
        role="alert"
        class="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
      >
        {mensaje}
      </div>
    {/if}

    <div
      class="rounded-xl border border-[#ead79c] bg-[#fff8e5] p-5 text-sm text-[#67582d]"
    >
      Los eventos enviados quedan pendientes de revisión del administrador.
    </div>

    <!-- BOTONES -->
    <div
      class="flex flex-col-reverse gap-3 border-t border-[#ded8cf] pt-6 sm:flex-row sm:justify-end"
    >
      <a
        href="/organizador/eventos"
        class="rounded-xl border border-[#c8c4bd] bg-white px-6 py-3 text-center text-sm font-semibold"
      >
        Cancelar
      </a>

      <button
        type="button"
        disabled={guardando || cargandoCategorias || categorias.length === 0 || !!errorCategorias}
        onclick={() => guardar('borrador')}
        class="rounded-xl border border-[#9eaea2] bg-[#d7e5db] px-6 py-3 text-sm font-semibold text-[#35483c] disabled:opacity-50"
      >
        {guardando ? 'Guardando...' : 'Guardar borrador'}
      </button>

      <button
        type="button"
        disabled={guardando || cargandoCategorias || categorias.length === 0 || !!errorCategorias}
        onclick={() => guardar('revision')}
        class="rounded-xl bg-[#D89994] px-6 py-3 text-sm font-semibold text-[#442b29] disabled:opacity-50"
      >
        {guardando ? 'Guardando...' : 'Enviar a revisión'}
      </button>
    </div>
  </form>
</section>
