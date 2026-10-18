<script lang="ts">
    import { page } from '$app/state';
    import { invalidateAll, goto } from '$app/navigation';
</script>

<div class="flex min-h-[65vh] items-center justify-center px-4 py-10">
    <div
        class="w-full max-w-lg rounded-2xl border border-[#ded8cf]
               bg-white px-6 py-10 text-center shadow-sm sm:px-10"
    >
        <div
            class="mx-auto mb-6 flex h-16 w-16 items-center
                   justify-center rounded-2xl bg-[#fbeeed]"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b4534c"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
            </svg>
        </div>

        <p class="mb-2 text-sm font-semibold text-[#b4534c]">
            Error {page.status}
        </p>

        <h1 class="text-2xl font-bold text-[#26382e]">
            {#if page.status === 400}
                Solicitud incorrecta
            {:else if page.status === 401}
                Sesión requerida
            {:else if page.status === 403}
                Acceso denegado
            {:else if page.status === 404}
                Categoría no encontrada
            {:else if page.status === 409}
                Conflicto de datos
            {:else if page.status === 429}
                Demasiadas solicitudes
            {:else if page.status === 500}
                Error del servidor
            {:else if page.status === 503}
                Servicio no disponible
            {:else}
                Ocurrió un problema
            {/if}
        </h1>

        <p class="mt-3 text-sm leading-6 text-[#68746c]">
            {#if page.status === 400}
                Los datos enviados no son válidos. Revisá la información e intentá nuevamente.
            {:else if page.status === 401}
                Necesitás iniciar sesión para acceder a esta sección.
            {:else if page.status === 403}
                No tenés permisos suficientes para realizar esta operación.
            {:else if page.status === 404}
                La categoría solicitada no existe o fue eliminada.
            {:else if page.status === 409}
                La operación genera un conflicto con los datos existentes.
            {:else if page.status === 429}
                Realizaste demasiadas solicitudes. Intentá nuevamente más tarde.
            {:else if page.status === 500}
                Ocurrió un error interno. Intentá nuevamente.
            {:else if page.status === 503}
                No podemos conectar con el servidor en este momento.
            {:else}
                {page.error?.message ?? 'No pudimos completar la solicitud.'}
            {/if}
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
            <a
                href="/administrador/categorias"
                class="inline-flex cursor-pointer items-center
                       justify-center rounded-xl border border-[#ded8cf]
                       bg-white px-5 py-3 text-sm font-medium
                       text-[#52675a] transition-all duration-200 ease-out
                       hover:border-[#b8c9bd] hover:bg-[#f1f5f1]
                       active:scale-[0.97]"
            >
                Volver a categorías
            </a>

            {#if page.status === 401}
                <a
                    href="/login"
                    class="inline-flex cursor-pointer items-center
                           justify-center rounded-xl bg-[#D89994]
                           px-5 py-3 text-sm font-semibold text-[#442b29]
                           shadow-sm transition-all duration-200
                           hover:bg-[#cb8580] hover:shadow-md
                           active:scale-[0.97]"
                >
                    Iniciar sesión
                </a>
            {:else if page.status !== 403 && page.status !== 404 && page.status !== 409}
                <button
                    type="button"
                    onclick={async () => {
                        await goto(page.url.pathname + page.url.search, {
                            invalidateAll: true,
                        });
                        await invalidateAll();
                    }}
                    class="inline-flex cursor-pointer items-center
                           justify-center rounded-xl bg-[#D89994]
                           px-5 py-3 text-sm font-semibold text-[#442b29]
                           shadow-sm transition-all duration-200
                           hover:bg-[#cb8580] hover:shadow-md
                           active:scale-[0.97]"
                >
                    Reintentar
                </button>
            {/if}
        </div>
    </div>
</div>
