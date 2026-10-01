<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen bg-[#f7f5f0] font-Maru lg:flex">

	<!-- MENÚ LATERAL -->
	<aside
		class="w-full border-b border-[#bfd0c3] bg-[#d7e5db] lg:min-h-screen lg:w-64 lg:border-r lg:border-b-0"
	>
		<div class="flex h-full flex-col">

			<!-- Nombre -->
			<div class="px-6 py-7">
				<a href="/" class="text-xl font-bold text-[#26382e]">
					Cerro Largo 360
				</a>

				<p class="mt-1 text-sm text-[#52645a]">
					Panel del organizador
				</p>
			</div>

			<!-- Navegación -->
			<nav class="flex flex-col gap-2 px-4">

				<a
					href="/organizador"
					class="rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#26382e] shadow-sm transition hover:bg-[#f4f7f5]"
				>
					Inicio
				</a>

				<a
					href="/organizador/eventos"
					class="rounded-xl px-4 py-3 text-sm font-medium text-[#26382e] transition hover:bg-white/70"
				>
					Mis eventos
				</a>

				<a
					href="/organizador/eventos/nuevo"
					class="rounded-xl px-4 py-3 text-sm font-medium text-[#26382e] transition hover:bg-white/70"
				>
					+ Crear evento
				</a>

				<a
					href="/organizador/perfil"
					class="rounded-xl px-4 py-3 text-sm font-medium text-[#26382e] transition hover:bg-white/70"
				>
					Mi perfil
				</a>

			</nav>

			<!-- Cerrar sesión -->
			<div class="mt-auto px-4 py-6">
				<button
					type="button"
					class="w-full rounded-xl border border-[#9daf9f] px-4 py-3 text-left text-sm font-medium text-[#26382e] transition hover:bg-white/70"
				>
					Cerrar sesión
				</button>
			</div>

		</div>
	</aside>

	<!-- CONTENIDO DE LAS PÁGINAS -->
	<main class="flex-1">
		{@render children()}
	</main>

</div>