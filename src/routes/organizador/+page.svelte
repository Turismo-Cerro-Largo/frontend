<script lang="ts">
	const resumen = [
		{
			numero: 4,
			texto: 'Total de eventos'
		},
		{
			numero: 1,
			texto: 'Pendientes'
		},
		{
			numero: 2,
			texto: 'Publicados'
		},
		{
			numero: 1,
			texto: 'Borradores'
		}
	];

	const eventos = [
		{
			id: 1,
			nombre: 'Feria de artesanos',
			fecha: '12/10/2026',
			estado: 'Publicado'
		},
		{
			id: 2,
			nombre: 'Festival local',
			fecha: '18/10/2026',
			estado: 'Pendiente'
		},
		{
			id: 3,
			nombre: 'Encuentro cultural',
			fecha: '25/10/2026',
			estado: 'Borrador'
		}
	];

	function colorEstado(estado: string) {
		switch (estado) {
			case 'Publicado':
				return 'bg-[#d7e5db] text-[#385443]';

			case 'Pendiente':
				return 'bg-[#fff1c9] text-[#765e19]';

			case 'Rechazado':
				return 'bg-[#f6d8d6] text-[#883b36]';

			case 'Cancelado':
				return 'bg-[#eadede] text-[#704848]';

			default:
				return 'bg-[#ecebea] text-[#585858]';
		}
	}
</script>

<svelte:head>
	<title>Panel del organizador | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">

	<!-- CABECERA -->
	<div
		class="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
	>
		<div>
			<p class="mb-1 text-sm font-medium text-[#708076]">
				Panel del organizador
			</p>

			<h1 class="text-3xl font-bold text-[#26382e]">
				Hola, Organizador
			</h1>

			<p class="mt-2 text-[#68746c]">
				Desde acá podés crear y gestionar tus eventos.
			</p>
		</div>

		<a
			href="/organizador/eventos/nuevo"
			class="inline-flex w-fit items-center justify-center rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29] shadow-sm transition hover:opacity-90"
		>
			+ Crear nuevo evento
		</a>
	</div>

	<!-- RESUMEN -->
	<div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each resumen as tarjeta}
			<div
				class="rounded-2xl border border-[#ded8cf] bg-white p-5 shadow-sm"
			>
				<p class="text-3xl font-bold text-[#26382e]">
					{tarjeta.numero}
				</p>

				<p class="mt-1 text-sm text-[#69736c]">
					{tarjeta.texto}
				</p>
			</div>
		{/each}
	</div>

	<!-- EVENTOS -->
	<div class="mb-4 flex items-center justify-between gap-4">
		<h2 class="text-xl font-bold text-[#26382e]">
			Mis eventos recientes
		</h2>

		<a
			href="/organizador/eventos"
			class="text-sm font-medium text-[#75514e] hover:underline"
		>
			Ver todos
		</a>
	</div>

	<div
		class="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm"
	>

		<!-- Escritorio -->
		<div class="hidden overflow-x-auto md:block">
			<table class="w-full text-left">
				<thead class="border-b border-[#e7e2da] bg-[#faf9f6]">
					<tr>
						<th class="px-6 py-4 text-sm font-semibold text-[#36463c]">
							Evento
						</th>

						<th class="px-6 py-4 text-sm font-semibold text-[#36463c]">
							Fecha
						</th>

						<th class="px-6 py-4 text-sm font-semibold text-[#36463c]">
							Estado
						</th>

						<th class="px-6 py-4 text-sm font-semibold text-[#36463c]">
							Acciones
						</th>
					</tr>
				</thead>

				<tbody>
					{#each eventos as evento}
						<tr class="border-b border-[#eeeae4] last:border-b-0">

							<td class="px-6 py-5 text-sm font-medium text-[#303c34]">
								{evento.nombre}
							</td>

							<td class="px-6 py-5 text-sm text-[#647067]">
								{evento.fecha}
							</td>

							<td class="px-6 py-5">
								<span
									class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(
										evento.estado
									)}`}
								>
									{evento.estado}
								</span>
							</td>

							<td class="px-6 py-5">
								<div class="flex gap-4">
									<a
										href={`/organizador/eventos/${evento.id}/editar`}
										class="text-sm font-medium text-[#75514e] hover:underline"
									>
										Editar
									</a>

									<a
										href={`/organizador/eventos/${evento.id}`}
										class="text-sm font-medium text-[#52675a] hover:underline"
									>
										Ver
									</a>
								</div>
							</td>

						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Celular -->
		<div class="divide-y divide-[#eeeae4] md:hidden">

			{#each eventos as evento}
				<article class="p-5">

					<div class="flex items-start justify-between gap-4">

						<div>
							<h3 class="font-semibold text-[#303c34]">
								{evento.nombre}
							</h3>

							<p class="mt-1 text-sm text-[#6d776f]">
								{evento.fecha}
							</p>
						</div>

						<span
							class={`rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(
								evento.estado
							)}`}
						>
							{evento.estado}
						</span>

					</div>

					<div class="mt-4 flex gap-4">

						<a
							href={`/organizador/eventos/${evento.id}/editar`}
							class="text-sm font-medium text-[#75514e]"
						>
							Editar
						</a>

						<a
							href={`/organizador/eventos/${evento.id}`}
							class="text-sm font-medium text-[#52675a]"
						>
							Ver
						</a>

					</div>

				</article>
			{/each}

		</div>

	</div>

	<!-- MENSAJE INFORMATIVO -->
	<div
		class="mt-6 rounded-xl border border-[#ead79c] bg-[#fff8e5] px-5 py-4"
	>
		<p class="text-sm text-[#67582d]">
			Los eventos enviados deben ser revisados por un administrador antes de publicarse.
		</p>
	</div>

</section>