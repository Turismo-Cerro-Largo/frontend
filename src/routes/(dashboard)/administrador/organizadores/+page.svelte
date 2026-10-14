<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    type Estado = 'PENDIENTE_REVISION' | 'APROBADO' | 'RECHAZADO';
    type FiltroEstado = Estado | 'TODOS';

    type Organizador = {
        id: number;
        nombre_organizacion: string;
        email: string;
        rut_ruc: string;
        departamento: string;
        estado: Estado;
        creado_en: string;
    };

    let organizadores = $state<Organizador[]>([]);
    let busqueda = $state('');
    let pagina = $state(1);
    let cargando = $state(true);
    let error = $state('');

    const tamano = 10;

    const estados: { v: FiltroEstado; n: string }[] = [
        { v: 'TODOS', n: 'Todos los estados' },
        { v: 'PENDIENTE_REVISION', n: 'Pendientes' },
        { v: 'APROBADO', n: 'Aprobados' },
        { v: 'RECHAZADO', n: 'Rechazados' },
    ];

    const etiquetas: Record<Estado, string> = {
        PENDIENTE_REVISION: 'Pendiente',
        APROBADO: 'Aprobado',
        RECHAZADO: 'Rechazado',
    };

    // Leer y validar el estado recibido en la URL.
    function obtenerEstadoURL(): FiltroEstado {
        const parametro = page.url.searchParams.get('estado');

        if (parametro === 'PENDIENTE_REVISION' || parametro === 'APROBADO' || parametro === 'RECHAZADO') {
            return parametro;
        }

        return 'TODOS';
    }

    // El filtro se actualiza cuando cambia la URL.
    let estado = $derived(obtenerEstadoURL());

    // Aplicar filtros de estado y búsqueda.
    let filtrados = $derived(
        organizadores.filter(
            (o) =>
                (estado === 'TODOS' || o.estado === estado) &&
                `${o.nombre_organizacion} ${o.email} ${o.rut_ruc} ${o.departamento}`.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es').trim())
        )
    );

    let totalPaginas = $derived(Math.max(1, Math.ceil(filtrados.length / tamano)));

    let paginaVisible = $derived(Math.min(pagina, totalPaginas));

    let visibles = $derived(filtrados.slice((paginaVisible - 1) * tamano, paginaVisible * tamano));

    // Actualizar la URL al cambiar el filtro manualmente.
    function cambiarEstado(nuevoEstado: string) {
        const url = new URL(page.url);

        if (nuevoEstado === 'TODOS') {
            url.searchParams.delete('estado');
        } else {
            url.searchParams.set('estado', nuevoEstado);
        }

        pagina = 1;

        void goto(`${url.pathname}${url.search}`, {
            keepFocus: true,
            noScroll: true,
        });
    }

    // Reiniciar paginación cuando cambie la búsqueda.
    function cambiarBusqueda() {
        pagina = 1;
    }

    // Cargar organizadores desde el backend.
    async function cargar() {
        cargando = true;
        error = '';

        try {
            const lista: Organizador[] = [];
            let offset = 0;

            while (true) {
                const r = await fetch(`/api/organizador/lista?offset=${offset}&limit=50`, {
                    credentials: 'include',
                });

                if (!r.ok) {
                    throw new Error(r.status === 403 || r.status === 401 ? 'No tenés permiso para ver organizadores.' : 'No se pudo cargar el listado.');
                }

                const lote = await r.json();

                if (!Array.isArray(lote)) {
                    throw new Error('Respuesta inesperada del servidor.');
                }

                lista.push(...lote);

                if (lote.length < 50) break;

                offset += lote.length;

                if (offset > 10000) {
                    throw new Error('Demasiados registros para cargar de una sola vez.');
                }
            }

            organizadores = lista;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Ocurrió un error.';
        } finally {
            cargando = false;
        }
    }

    onMount(() => {
        void cargar();
    });
</script>

<svelte:head>
    <title>Validación de organizadores</title>
</svelte:head>

<div class="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm">
    <!-- Encabezado -->
    <header class="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeae4] p-6">
        <div>
            <h1 class="text-xl font-semibold text-[#26382e]">Validación de organizadores</h1>

            <p class="mt-1 text-sm text-[#68746c]">Revisá la documentación y aprobá o rechazá solicitudes.</p>
        </div>

        <button
            onclick={cargar}
            disabled={cargando}
            class="rounded-xl border border-[#cbd6cb] px-4 py-2 text-sm text-[#385443] transition-colors hover:bg-[#eef4ef] disabled:opacity-50"
        >
            {cargando ? 'Actualizando...' : 'Actualizar lista'}
        </button>
    </header>

    <!-- Búsqueda y filtros -->
    <section class="flex flex-wrap gap-3 border-b border-[#eeeae4] p-5">
        <label class="flex min-w-56 flex-1 flex-col gap-1 text-xs font-medium text-[#52675a]">
            Buscar

            <input
                bind:value={busqueda}
                oninput={cambiarBusqueda}
                placeholder="Organización, correo, RUT..."
                class="rounded-xl border border-[#ded8cf] p-3 text-sm outline-none focus:ring-2 focus:ring-[#d7e5db]"
            />
        </label>

        <label class="flex min-w-48 flex-col gap-1 text-xs font-medium text-[#52675a]">
            Estado

            <select
                value={estado}
                onchange={(e) => cambiarEstado(e.currentTarget.value)}
                class="rounded-xl border border-[#ded8cf] p-3 text-sm outline-none focus:ring-2 focus:ring-[#d7e5db]"
            >
                {#each estados as e}
                    <option value={e.v}>
                        {e.n}
                    </option>
                {/each}
            </select>
        </label>
    </section>

    <!-- Mensaje de error -->
    {#if error}
        <p role="alert" class="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
        </p>
    {/if}

    <!-- Estado de carga -->
    {#if cargando}
        <p class="p-8 text-center text-sm text-[#68746c]">Cargando organizadores...</p>
    {:else if visibles.length === 0}
        <p class="p-8 text-center text-sm text-[#68746c]">No se encontraron organizadores.</p>
    {:else}
        <!-- Tabla de organizadores -->
        <div class="overflow-x-auto">
            <table class="w-full min-w-205 text-left text-sm">
                <thead class="bg-[#f7f8f5] text-[#586a5d]">
                    <tr>
                        <th class="p-4">Organización</th>
                        <th class="p-4">RUT / RUC</th>
                        <th class="p-4">Departamento</th>
                        <th class="p-4">Fecha</th>
                        <th class="p-4">Estado</th>
                        <th class="p-4">Acción</th>
                    </tr>
                </thead>

                <tbody>
                    {#each visibles as o (o.id)}
                        <tr in:fade={{ duration: 160 }} class="border-t border-[#eeeae4] transition-colors hover:bg-[#fbfcfa]">
                            <!-- Organización -->
                            <td class="p-4">
                                <span class="font-semibold text-[#26382e]">
                                    {o.nombre_organizacion}
                                </span>

                                <div class="text-xs text-[#68746c]">
                                    {o.email}
                                </div>
                            </td>

                            <!-- RUT -->
                            <td class="p-4">
                                {o.rut_ruc}
                            </td>

                            <!-- Departamento -->
                            <td class="p-4">
                                {o.departamento}
                            </td>

                            <!-- Fecha -->
                            <td class="p-4">
                                {new Date(o.creado_en).toLocaleDateString('es-UY')}
                            </td>

                            <!-- Estado -->
                            <td class="p-4">
                                <span
                                    class={`rounded-full px-3 py-1 text-xs font-medium text-[#385443] ${
                                        o.estado === 'PENDIENTE_REVISION' ? 'bg-amber-100' : o.estado === 'APROBADO' ? 'bg-green-100' : 'bg-red-100'
                                    }`}
                                >
                                    {etiquetas[o.estado]}
                                </span>
                            </td>

                            <!-- Acción -->
                            <td class="p-4">
                                <a
                                    href={`/administrador/organizadores/${o.id}`}
                                    class="rounded-xl bg-[#d7e5db] px-4 py-2 font-semibold text-[#385443] transition-colors hover:bg-[#c4d9c9]"
                                >
                                    Ver perfil
                                </a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

    <!-- Paginación -->
    <footer class="flex items-center justify-between gap-3 border-t border-[#eeeae4] p-5 text-sm text-[#68746c]">
        <span>
            {filtrados.length} organizadores
        </span>

        <div class="flex items-center gap-3">
            <button disabled={paginaVisible === 1} onclick={() => (pagina = paginaVisible - 1)} class="rounded-lg border px-3 py-2 disabled:opacity-40"> Anterior </button>

            <span>
                {paginaVisible} / {totalPaginas}
            </span>

            <button disabled={paginaVisible >= totalPaginas} onclick={() => (pagina = paginaVisible + 1)} class="rounded-lg border px-3 py-2 disabled:opacity-40">
                Siguiente
            </button>
        </div>
    </footer>
</div>
