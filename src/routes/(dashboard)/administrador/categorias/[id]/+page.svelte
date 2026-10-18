<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    let enviando = $state(false);
    let error = $state('');

    async function editarCategoria(event: SubmitEvent) {
        event.preventDefault();

        if (enviando) return;

        const form = event.currentTarget as HTMLFormElement;
        const datos = new FormData(form);

        enviando = true;
        error = '';

        try {
            const respuesta = await fetch(`/api/categorias/${data.categoria.id}`, {
                method: 'PUT',
                body: datos,
                credentials: 'include',
            });

            if (!respuesta.ok) {
                if (respuesta.status === 409) {
                    throw new Error('Ya existe otra categoría con ese nombre.');
                }

                if (respuesta.status === 400) {
                    throw new Error('Revisá los datos ingresados.');
                }

                if (respuesta.status === 401 || respuesta.status === 403) {
                    throw new Error('No tenés permisos para editar categorías.');
                }

                if (respuesta.status === 404) {
                    throw new Error('La categoría ya no existe.');
                }

                throw new Error('No se pudo actualizar la categoría.');
            }

            await goto('/administrador/categorias', { replaceState: true });
        } catch (e) {
            error = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
        } finally {
            enviando = false;
        }
    }
</script>

<div class="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#26382e]">Editar categoría</h1>

        <p class="mt-2 text-sm text-[#68746c]">Modificá los datos de la categoría seleccionada.</p>
    </div>

    <form
        onsubmit={editarCategoria}
        class="overflow-hidden rounded-2xl border border-[#ded8cf]
               bg-white shadow-sm"
    >
        <fieldset disabled={enviando} class="space-y-6 p-6 sm:p-8">
            <!-- NOMBRE -->
            <div class="space-y-2">
                <label for="nombre" class="block text-sm font-semibold text-[#36463c]">
                    Nombre de la categoría
                    <span class="text-[#b4534c]">*</span>
                </label>

                <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={data.categoria.nombre}
                    required
                    maxlength="28"
                    placeholder="Ej.: Naturaleza"
                    class="w-full rounded-xl border border-[#ded8cf]
                           bg-white px-4 py-3 text-sm text-[#303c34]
                           outline-none transition-all duration-200
                           placeholder:text-[#a1a9a2]
                           hover:border-[#b8c9bd]
                           focus:border-[#91ae9b]
                           focus:ring-2 focus:ring-[#d7e5db]
                           disabled:opacity-60"
                />

                <p class="text-xs text-[#89938b]">Nombre que se mostrará en la plataforma.</p>
            </div>

            <!-- DESCRIPCIÓN -->
            <div class="space-y-2">
                <label for="descripcion" class="block text-sm font-semibold text-[#36463c]">
                    Descripción
                    <span class="text-[#b4534c]">*</span>
                </label>

                <textarea
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    maxlength="500"
                    required
                    placeholder="Describí brevemente la categoría..."
                    class="w-full resize-y rounded-xl
                           border border-[#ded8cf] bg-white
                           px-4 py-3 text-sm text-[#303c34]
                           outline-none transition-all duration-200
                           placeholder:text-[#a1a9a2]
                           hover:border-[#b8c9bd]
                           focus:border-[#91ae9b]
                           focus:ring-2 focus:ring-[#d7e5db]
                           disabled:opacity-60">{data.categoria.descripcion ?? ''}</textarea
                >

                <p class="text-xs text-[#89938b]">Agregá una descripción clara y breve.</p>
            </div>

            {#if error}
                <div
                    role="alert"
                    class="rounded-xl border border-[#f0cfcc]
                           bg-[#fff2f0] px-4 py-3
                           text-sm text-[#93453f]"
                >
                    {error}
                </div>
            {/if}
        </fieldset>

        <!-- ACCIONES -->
        <div
            class="flex flex-wrap items-center justify-end gap-3
                   border-t border-[#eeeae4]
                   bg-[#faf9f6] px-6 py-4 sm:px-8"
        >
            <a
                href="/administrador/categorias"
                data-sveltekit-preload-data
                aria-disabled={enviando}
                onclick={(event) => {
                    if (enviando) event.preventDefault();
                }}
                class="inline-flex cursor-pointer items-center
                       justify-center rounded-xl
                       border border-[#ded8cf] bg-white
                       px-5 py-2.5 text-sm font-medium text-[#52675a]
                       transition-all duration-200
                       hover:border-[#b8c9bd]
                       hover:bg-[#f1f5f1]
                       active:scale-[0.97]"
            >
                Cancelar
            </a>

            <button
                type="submit"
                disabled={enviando}
                class="inline-flex min-w-40 cursor-pointer
                       items-center justify-center gap-2
                       rounded-xl bg-[#D89994] px-5 py-2.5
                       text-sm font-semibold text-[#442b29]
                       shadow-sm transition-all duration-200
                       hover:bg-[#cb8580] hover:shadow-md
                       active:scale-[0.97]
                       disabled:cursor-not-allowed
                       disabled:opacity-60"
            >
                {#if enviando}
                    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                        <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                {:else}
                    Guardar cambios
                {/if}
            </button>
        </div>
    </form>
</div>
