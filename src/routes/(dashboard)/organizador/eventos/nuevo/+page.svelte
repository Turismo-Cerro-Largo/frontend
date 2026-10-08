<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import type { Map, Marker } from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';


	let nombre = $state('');
	let descripcion = $state('');

	let fecha = $state('');
	let horaInicio = $state('');
	let horaFin = $state('');

	let localidad = $state('');
	let direccion = $state('');

	// MAPA
	let mapContainer: HTMLDivElement;
	let mapa: Map | null = null;
	let marcador: Marker | null = null;

	let latitud = $state<number | null>(null);
	let longitud = $state<number | null>(null);

	let tipoEntrada = $state('gratuito');
	let precio = $state('');

	let telefono = $state('');
	let correo = $state('');
	let redes = $state('');

	let archivos = $state<File[]>([]);

	let mensaje = $state('');
	let tipoMensaje = $state<'ok' | 'error' | ''>('');

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

	onMount(() => {
		let destruido = false;

		void (async () => {
			const mapboxgl = (await import('mapbox-gl')).default;

			if (destruido) return;

			mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;

			mapa = new mapboxgl.Map({
				container: mapContainer,
				style: 'mapbox://styles/mapbox/streets-v12',

				// Melo como punto inicial
				center: [-54.167, -32.366],

				zoom: 9
			});

			mapa.addControl(
				new mapboxgl.NavigationControl(),
				'top-right'
			);

			mapa.on('click', (evento) => {
				longitud = Number(
					evento.lngLat.lng.toFixed(6)
				);

				latitud = Number(
					evento.lngLat.lat.toFixed(6)
				);

				if (!marcador) {
					marcador = new mapboxgl.Marker({
						color: '#D89994'
					})
						.setLngLat([
							longitud,
							latitud
						])
						.addTo(mapa!);
				} else {
					marcador.setLngLat([
						longitud,
						latitud
					]);
				}
			});
		})();

		return () => {
			destruido = true;

			marcador?.remove();
			mapa?.remove();
		};
	});

	function manejarImagenes(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		if (input.files) {
			archivos = Array.from(input.files);
		}
	}

	function validarFormulario() {
		if (
			!nombre ||
			!descripcion ||
			!fecha ||
			!horaInicio ||
			!localidad ||
			!direccion
		) {
			tipoMensaje = 'error';
			mensaje =
				'Completá los campos obligatorios antes de continuar.';

			return false;
		}

		if (
			latitud === null ||
			longitud === null
		) {
			tipoMensaje = 'error';
			mensaje =
				'Marcá en el mapa la ubicación del evento.';

			return false;
		}

		if (
			tipoEntrada === 'pago' &&
			!precio
		) {
			tipoMensaje = 'error';
			mensaje =
				'Indicá el precio de la entrada.';

			return false;
		}

		return true;
	}

	function guardarBorrador() {
		tipoMensaje = 'ok';
		mensaje =
			'Evento guardado como borrador.';
	}

	function enviarRevision() {
		if (!validarFormulario()) return;

		tipoMensaje = 'ok';
		mensaje =
			'Evento enviado para revisión del administrador.';
	}
</script>

<svelte:head>
	<title>Crear evento | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">

	<!-- ENCABEZADO -->
	<div class="mb-8">
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
			Crear nuevo evento
		</h1>

		<p class="mt-2 max-w-2xl text-[#68746c]">
			Completá la información del evento. Cuando esté listo,
			podrás enviarlo para revisión antes de que sea publicado.
		</p>
	</div>

	<form class="max-w-5xl">

		<!-- DATOS PRINCIPALES -->
		<div
			class="mb-6 rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm"
		>
			<div class="mb-6">
				<h2 class="text-xl font-bold text-[#26382e]">
					Información del evento
				</h2>

				<p class="mt-1 text-sm text-[#738078]">
					Ingresá los datos principales.
				</p>
			</div>

			<div class="space-y-5">

				<div>
					<label
						for="nombre"
						class="mb-2 block text-sm font-semibold text-[#35483c]"
					>
						Nombre del evento *
					</label>

					<input
						id="nombre"
						type="text"
						bind:value={nombre}
						placeholder="Ej: Feria de artesanos de Melo"
						class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8] px-4 py-3
						text-[#303c34] placeholder:text-[#a2aaa5]
						focus:border-[#91aa99] focus:ring-[#91aa99]"
					/>
				</div>

				<div>
					<div class="mb-2 flex justify-between gap-4">
						<label
							for="descripcion"
							class="block text-sm font-semibold text-[#35483c]"
						>
							Descripción *
						</label>

						<span class="text-xs text-[#8a938d]">
							{descripcion.length}/500
						</span>
					</div>

					<textarea
						id="descripcion"
						bind:value={descripcion}
						maxlength="500"
						rows="5"
						placeholder="Contá brevemente de qué se trata el evento..."
						class="w-full resize-none rounded-xl border-[#d7d3cc]
						bg-[#fcfbf8] px-4 py-3 text-[#303c34]
						placeholder:text-[#a2aaa5]
						focus:border-[#91aa99] focus:ring-[#91aa99]"
					></textarea>
				</div>

			</div>
		</div>

		<!-- FECHA Y HORARIO -->
		<div
			class="mb-6 rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm"
		>
			<h2 class="text-xl font-bold text-[#26382e]">
				Fecha y horario
			</h2>

			<p class="mt-1 text-sm text-[#738078]">
				Indicá cuándo se realizará.
			</p>

			<div class="mt-6 grid gap-5 md:grid-cols-3">

				<div>
					<label
						for="fecha"
						class="mb-2 block text-sm font-semibold text-[#35483c]"
					>
						Fecha *
					</label>

					<input
						id="fecha"
						type="date"
						bind:value={fecha}
						class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8]
						px-4 py-3 focus:border-[#91aa99] focus:ring-[#91aa99]"
					/>
				</div>

				<div>
					<label
						for="horaInicio"
						class="mb-2 block text-sm font-semibold text-[#35483c]"
					>
						Hora de inicio *
					</label>

					<input
						id="horaInicio"
						type="time"
						bind:value={horaInicio}
						class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8]
						px-4 py-3 focus:border-[#91aa99] focus:ring-[#91aa99]"
					/>
				</div>

				<div>
					<label
						for="horaFin"
						class="mb-2 block text-sm font-semibold text-[#35483c]"
					>
						Hora de finalización
					</label>

					<input
						id="horaFin"
						type="time"
						bind:value={horaFin}
						class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8]
						px-4 py-3 focus:border-[#91aa99] focus:ring-[#91aa99]"
					/>
				</div>

			</div>
		</div>

		<!-- UBICACIÓN -->
<div
	class="mb-6 rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm"
>
	<div class="mb-6">
		<h2 class="text-xl font-bold text-[#26382e]">
			Ubicación
		</h2>

		<p class="mt-1 text-sm text-[#738078]">
			Seleccioná la localidad y marcá en el mapa
			dónde se realizará el evento.
		</p>
	</div>

	<!-- LOCALIDAD Y DIRECCIÓN -->
	<div class="grid gap-5 md:grid-cols-2">

		<div>
			<label
				for="localidad"
				class="mb-2 block text-sm font-semibold text-[#35483c]"
			>
				Localidad *
			</label>

			<select
				id="localidad"
				bind:value={localidad}
				class="w-full rounded-xl border-[#d7d3cc]
				bg-[#fcfbf8] px-4 py-3
				focus:border-[#91aa99]
				focus:ring-[#91aa99]"
			>
				<option value="">
					Seleccionar localidad
				</option>

				{#each localidades as opcion}
					<option value={opcion}>
						{opcion}
					</option>
				{/each}

			</select>
		</div>

		<div>
			<label
				for="direccion"
				class="mb-2 block text-sm font-semibold text-[#35483c]"
			>
				Dirección / lugar *
			</label>

			<input
				id="direccion"
				type="text"
				bind:value={direccion}
				placeholder="Ej: Plaza Constitución, Melo"
				class="w-full rounded-xl border-[#d7d3cc]
					bg-[#fcfbf8] px-4 py-3
					placeholder:text-[#a2aaa5]
					focus:border-[#91aa99]
					focus:ring-[#91aa99]"
			/>
		</div>

	</div>

	<!-- MAPA -->
	<div class="mt-6">

		<div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

			<div>
				<p class="text-sm font-semibold text-[#35483c]">
	Ubicación en el mapa *
</p>

				<p class="mt-1 text-xs text-[#7b877f]">
					Hacé clic sobre el mapa para colocar el marcador.
				</p>
			</div>

			{#if latitud !== null && longitud !== null}
				<span
					class="w-fit rounded-full bg-[#d7e5db]
						px-3 py-1 text-xs font-semibold
						text-[#405347]"
				>
					Ubicación seleccionada
				</span>
			{/if}

		</div>

		<div
			class="overflow-hidden rounded-2xl
				border border-[#cbd5cd]"
		>
			<div
				bind:this={mapContainer}
				class="h-105 w-full"
			></div>
		</div>

		<!-- COORDENADAS -->
		{#if latitud !== null && longitud !== null}

			<div
				class="mt-4 grid gap-3 rounded-xl
					bg-[#f4f7f4] p-4 sm:grid-cols-2"
			>

				<div>
					<p class="text-xs font-medium text-[#7a857e]">
						Latitud
					</p>

					<p class="mt-1 text-sm font-semibold text-[#3c4c42]">
						{latitud}
					</p>
				</div>

				<div>
					<p class="text-xs font-medium text-[#7a857e]">
						Longitud
					</p>

					<p class="mt-1 text-sm font-semibold text-[#3c4c42]">
						{longitud}
					</p>
				</div>

			</div>

		{:else}

			<div
				class="mt-4 rounded-xl border border-[#ead79c]
					bg-[#fff8e5] px-4 py-3"
			>
				<p class="text-sm text-[#67582d]">
					Todavía no seleccionaste una ubicación.
					Hacé clic sobre el mapa para marcarla.
				</p>
			</div>

		{/if}

	</div>
</div>

		<!-- FOTOGRAFÍAS -->
		<div
			class="mb-6 rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm"
		>
			<h2 class="text-xl font-bold text-[#26382e]">
				Fotografías
			</h2>

			<p class="mt-1 text-sm text-[#738078]">
				Podés seleccionar una o varias imágenes del evento.
			</p>

			<div
				class="mt-6 rounded-xl border-2 border-dashed border-[#cbd5cd]
				bg-[#fafbf9] p-8 text-center"
			>
				<label
					for="imagenes"
					class="cursor-pointer"
				>
					<div class="text-3xl">
						📷
					</div>

					<p class="mt-2 font-semibold text-[#405347]">
						Seleccionar imágenes
					</p>

					<p class="mt-1 text-sm text-[#7d8981]">
						JPG, PNG o WEBP
					</p>
				</label>

				<input
					id="imagenes"
					type="file"
					accept="image/png,image/jpeg,image/webp"
					multiple
					onchange={manejarImagenes}
					class="hidden"
				/>

				{#if archivos.length > 0}
					<p class="mt-4 text-sm font-medium text-[#52675a]">
						{archivos.length}
						{archivos.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
					</p>
				{/if}
			</div>
		</div>

		<!-- PRECIO -->
		<div
			class="mb-6 rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm"
		>
			<h2 class="text-xl font-bold text-[#26382e]">
				Entrada
			</h2>

			<div class="mt-6">

				<p class="mb-3 text-sm font-semibold text-[#35483c]">
					Tipo de entrada
				</p>

				<div class="flex flex-wrap gap-5">

					<label class="flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							value="gratuito"
							bind:group={tipoEntrada}
							class="text-[#78917f] focus:ring-[#91aa99]"
						/>

						<span class="text-sm text-[#435149]">
							Entrada gratuita
						</span>
					</label>

					<label class="flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							value="pago"
							bind:group={tipoEntrada}
							class="text-[#78917f] focus:ring-[#91aa99]"
						/>

						<span class="text-sm text-[#435149]">
							Entrada paga
						</span>
					</label>

				</div>
			</div>

			{#if tipoEntrada === 'pago'}
				<div class="mt-5 max-w-xs">

					<label
						for="precio"
						class="mb-2 block text-sm font-semibold text-[#35483c]"
					>
						Precio *
					</label>

					<div class="relative">
						<span
							class="absolute top-1/2 left-4 -translate-y-1/2 text-[#68746c]"
						>
							$
						</span>

						<input
							id="precio"
							type="number"
							min="0"
							bind:value={precio}
							placeholder="0"
							class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8]
							py-3 pr-4 pl-8
							focus:border-[#91aa99] focus:ring-[#91aa99]"
						/>
					</div>

				</div>
			{/if}
		</div>

		<!-- CONTACTO -->
		<div
			class="mb-6 rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm"
		>
			<h2 class="text-xl font-bold text-[#26382e]">
				Datos de contacto
			</h2>

			<p class="mt-1 text-sm text-[#738078]">
				Información para que los visitantes puedan comunicarse.
			</p>

			<div class="mt-6 grid gap-5 md:grid-cols-2">

				<div>
					<label
						for="telefono"
						class="mb-2 block text-sm font-semibold text-[#35483c]"
					>
						Teléfono
					</label>

					<input
						id="telefono"
						type="tel"
						bind:value={telefono}
						placeholder="Ej: 099 123 456"
						class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8]
						px-4 py-3 placeholder:text-[#a2aaa5]
						focus:border-[#91aa99] focus:ring-[#91aa99]"
					/>
				</div>

				<div>
					<label
						for="correo"
						class="mb-2 block text-sm font-semibold text-[#35483c]"
					>
						Correo electrónico
					</label>

					<input
						id="correo"
						type="email"
						bind:value={correo}
						placeholder="evento@ejemplo.com"
						class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8]
						px-4 py-3 placeholder:text-[#a2aaa5]
						focus:border-[#91aa99] focus:ring-[#91aa99]"
					/>
				</div>

				<div class="md:col-span-2">
					<label
						for="redes"
						class="mb-2 block text-sm font-semibold text-[#35483c]"
					>
						Redes sociales
					</label>

					<input
						id="redes"
						type="text"
						bind:value={redes}
						placeholder="Ej: @feriacerrolargo"
						class="w-full rounded-xl border-[#d7d3cc] bg-[#fcfbf8]
						px-4 py-3 placeholder:text-[#a2aaa5]
						focus:border-[#91aa99] focus:ring-[#91aa99]"
					/>
				</div>

			</div>
		</div>

		<!-- MENSAJE -->
		{#if mensaje}
			<div
				class={`mb-6 rounded-xl border px-5 py-4 text-sm ${
					tipoMensaje === 'error'
						? 'border-[#e5b8b4] bg-[#fbe8e6] text-[#7d3732]'
						: 'border-[#bcd2c0] bg-[#edf5ef] text-[#365a40]'
				}`}
			>
				{mensaje}
			</div>
		{/if}

		<!-- INFORMACIÓN -->
		<div
			class="mb-6 rounded-xl border border-[#ead79c] bg-[#fff8e5] px-5 py-4"
		>
			<p class="text-sm text-[#67582d]">
				Al enviar el evento, quedará en estado
				<strong>Pendiente</strong>
				hasta que un administrador lo revise.
			</p>
		</div>

		<!-- BOTONES -->
		<div
			class="flex flex-col-reverse gap-3 border-t border-[#ded8cf]
			pt-6 sm:flex-row sm:justify-end"
		>
			<a
				href="/organizador/eventos"
				class="rounded-xl border border-[#c8c4bd] bg-white
				px-6 py-3 text-center text-sm font-semibold text-[#58645c]
				transition hover:bg-[#f5f4f1]"
			>
				Cancelar
			</a>

			<button
				type="button"
				onclick={guardarBorrador}
				class="rounded-xl border border-[#9eaea2]
				bg-[#d7e5db] px-6 py-3 text-sm font-semibold
				text-[#35483c] transition hover:bg-[#cbded0]"
			>
				Guardar borrador
			</button>

			<button
				type="button"
				onclick={enviarRevision}
				class="rounded-xl bg-[#D89994] px-6 py-3
				text-sm font-semibold text-[#442b29]
				shadow-sm transition hover:opacity-90"
			>
				Enviar a revisión
			</button>
		</div>

	</form>
</section>