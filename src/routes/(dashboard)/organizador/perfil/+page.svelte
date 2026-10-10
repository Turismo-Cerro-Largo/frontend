<script lang="ts">
    import { onMount } from 'svelte';

    type Perfil = {
        id: number;
        nombre_organizacion: string;
        email: string;
        rut_ruc: string;
        departamento: string;
        telefono: string;
        sitio_web: string;
        estado: string;
        creado_en: string;
    };

    const departamentos = [
        'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
        'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
        'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
        'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
    ];

    const campo = 'w-full rounded-xl border border-[#ded8cf] bg-white px-4 py-3 text-sm text-[#26382e] outline-none focus:border-[#8ba996] disabled:bg-[#f5f3ef] disabled:text-[#70776f]';

    let perfil = $state<Perfil | null>(null);
    let original: Perfil | null = null;
    let cargando = $state(true);
    let guardando = $state(false);
    let editando = $state(false);
    let error = $state('');
    let mensaje = $state('');

    function normalizar(datos: Perfil): Perfil {
        return {
            ...datos,
            departamento: datos.departamento ?? '',
            sitio_web: datos.sitio_web ?? ''
        };
    }

    function nombreEstado(estado: string) {
        if (estado === 'APROBADO') return 'Aprobado';
        if (estado === 'RECHAZADO') return 'Rechazado';
        return 'Pendiente de revisión';
    }

    async function cargarPerfil() {
        try {
            const respuesta = await fetch('/api/organizador/perfil');

            if (!respuesta.ok) {
                throw new Error('No se pudo cargar el perfil.');
            }

            perfil = normalizar(await respuesta.json());
            original = { ...perfil };
        } catch {
            error = 'No se pudieron cargar tus datos. Intentá actualizar la página.';
        } finally {
            cargando = false;
        }
    }

    function cancelar() {
        if (original) perfil = { ...original };
        editando = false;
        error = '';
        mensaje = '';
    }

    async function guardar(evento: SubmitEvent) {
        evento.preventDefault();
        if (!perfil || guardando) return;

        guardando = true;
        error = '';
        mensaje = '';

        try {
            const respuesta = await fetch('/api/organizador/perfil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_organizacion: perfil.nombre_organizacion.trim(),
                    departamento: perfil.departamento,
                    telefono: perfil.telefono.trim(),
                    sitio_web: perfil.sitio_web.trim()
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.message || 'No se pudieron guardar los cambios.');
            }

            perfil = normalizar(datos);
            original = { ...perfil };
            editando = false;
            mensaje = 'Los cambios se guardaron correctamente.';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Ocurrió un error al guardar.';
        } finally {
            guardando = false;
        }
    }

    onMount(() => {
        void cargarPerfil();
    });
</script>

<svelte:head>
    <title>Mi perfil | Cerro Largo 360</title>
</svelte:head>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
    <div class="mb-8">
        <p class="mb-1 text-sm font-medium text-[#708076]">Panel del organizador</p>
        <h1 class="text-3xl font-bold text-[#26382e]">Mi perfil</h1>
        <p class="mt-2 text-[#68746c]">Consultá tus datos y actualizá la información de contacto.</p>
    </div>

    {#if cargando}
        <p class="text-[#68746c]">Cargando datos...</p>
    {:else if perfil}
        <div class="max-w-4xl">
            <div class="mb-6 rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 class="text-xl font-bold text-[#26382e]">{perfil.nombre_organizacion}</h2>
                        <p class="mt-1 text-sm text-[#68746c]">Cuenta de organizador</p>
                    </div>
                    <span class="w-fit rounded-full bg-[#d7e5db] px-4 py-2 text-sm font-medium text-[#385443]">
                        {nombreEstado(perfil.estado)}
                    </span>
                </div>
            </div>

            {#if error}
                <p role="alert" class="mb-4 rounded-xl bg-[#f6d8d6] px-4 py-3 text-sm text-[#883b36]">{error}</p>
            {/if}

            {#if mensaje}
                <p role="status" class="mb-4 rounded-xl bg-[#d7e5db] px-4 py-3 text-sm text-[#385443]">{mensaje}</p>
            {/if}

            <form onsubmit={guardar} class="rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm sm:p-8">
                <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 class="text-xl font-bold text-[#26382e]">Datos de la organización</h2>
                        <p class="mt-1 text-sm text-[#68746c]">Podés modificar los campos habilitados.</p>
                    </div>

                    {#if !editando}
                        <button type="button" onclick={() => { editando = true; mensaje = ''; }}
                            class="rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29] hover:opacity-90">
                            Editar datos
                        </button>
                    {/if}
                </div>

                <div class="grid gap-5 sm:grid-cols-2">
                    <div class="sm:col-span-2">
                        <label for="organizacion" class="mb-2 block text-sm font-medium text-[#36463c]">Nombre de la organización</label>
                        <input id="organizacion" type="text" bind:value={perfil.nombre_organizacion}
                            minlength="2" maxlength="100" required disabled={!editando || guardando} class={campo} />
                    </div>

                    <div>
                        <label for="email" class="mb-2 block text-sm font-medium text-[#36463c]">Correo electrónico</label>
                        <input id="email" type="email" value={perfil.email} disabled class={campo} />
                        <p class="mt-1 text-xs text-[#7b817b]">Este dato no se puede editar desde acá.</p>
                    </div>

                    <div>
                        <label for="rut" class="mb-2 block text-sm font-medium text-[#36463c]">RUT</label>
                        <input id="rut" type="text" value={perfil.rut_ruc} disabled class={campo} />
                    </div>

                    <div>
                        <label for="departamento" class="mb-2 block text-sm font-medium text-[#36463c]">Departamento</label>
                        <select id="departamento" bind:value={perfil.departamento}
                            required disabled={!editando || guardando} class={campo}>
                            <option value="" disabled>Seleccioná un departamento</option>
                            {#each departamentos as departamento}
                                <option value={departamento}>{departamento}</option>
                            {/each}
                        </select>
                    </div>

                    <div>
                        <label for="telefono" class="mb-2 block text-sm font-medium text-[#36463c]">Teléfono</label>
                        <input id="telefono" type="tel" bind:value={perfil.telefono}
                            minlength="8" maxlength="20" pattern="\+?[0-9 -]+"
                            required disabled={!editando || guardando} class={campo} />
                    </div>

                    <div class="sm:col-span-2">
                        <label for="sitio_web" class="mb-2 block text-sm font-medium text-[#36463c]">Sitio web (opcional)</label>
                        <input id="sitio_web" type="url" bind:value={perfil.sitio_web}
                            maxlength="500" placeholder="https://ejemplo.com"
                            disabled={!editando || guardando} class={campo} />
                    </div>
                </div>

                <div class="mt-7 border-t border-[#eeeae4] pt-6">
                    <h3 class="mb-4 font-semibold text-[#26382e]">Información de la cuenta</h3>
                    <div class="grid gap-5 sm:grid-cols-2">
                        <div>
                            <p class="text-sm text-[#68746c]">Estado de la cuenta</p>
                            <p class="mt-1 font-medium text-[#26382e]">{nombreEstado(perfil.estado)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-[#68746c]">Fecha de registro</p>
                            <p class="mt-1 font-medium text-[#26382e]">
                                {new Date(perfil.creado_en).toLocaleDateString('es-UY')}
                            </p>
                        </div>
                    </div>
                </div>

                {#if editando}
                    <div class="mt-8 flex flex-wrap justify-end gap-3">
                        <button type="button" onclick={cancelar} disabled={guardando}
                            class="rounded-xl border border-[#ded8cf] px-5 py-3 text-sm font-medium text-[#26382e] disabled:opacity-60">
                            Cancelar
                        </button>
                        <button type="submit" disabled={guardando}
                            class="rounded-xl bg-[#D89994] px-5 py-3 text-sm font-semibold text-[#442b29] hover:opacity-90 disabled:opacity-60">
                            {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                {/if}
            </form>
        </div>
    {:else}
        <p role="alert" class="text-[#883b36]">{error}</p>
    {/if}
</section>
