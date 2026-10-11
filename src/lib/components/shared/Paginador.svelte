
<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    let {
        total,
        query = ''
    }: {
        total: number;
        query?: string;
    } = $props();

    let offset = $derived(
        Math.max(0, Number(page.url.searchParams.get('offset') ?? 0) || 0)
    );

    let limit = $derived(
        Math.max(1, Number(page.url.searchParams.get('limit') ?? 10) || 10)
    );

    let paginaActual = $derived(Math.floor(offset / limit) + 1);
    let totalPaginas = $derived(Math.max(1, Math.ceil(total / limit)));

    function actualizar(nuevoOffset: number, nuevoLimit: number) {
        const url = new URL(page.url);

        url.searchParams.set('offset', String(nuevoOffset));
        url.searchParams.set('limit', String(nuevoLimit));

        if (query) {
            url.searchParams.set('query', query);
        }

        goto(`${url.pathname}${url.search}`, {
            keepFocus: true,
            noScroll: true
        });
    }

    function cambiarLimit(event: Event) {
        const nuevoLimit = Number(
            (event.currentTarget as HTMLSelectElement).value
        );

        actualizar(0, nuevoLimit);
    }
</script>

<div
    class="flex flex-wrap items-center justify-between gap-4
           border-t border-[#eeeae4] px-6 py-4"
>
    <p class="text-sm font-medium text-[#647067]">
        {#if total === 0}
            Sin resultados
        {:else}
            Mostrando {offset + 1}-{Math.min(offset + limit, total)} de {total}
        {/if}
    </p>

    <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
            <label for="limit" class="text-sm font-medium text-[#647067]">
                Límite:
            </label>

            <select
                id="limit"
                value={limit}
                onchange={cambiarLimit}
                class="cursor-pointer rounded-xl
                       border border-[#ded8cf] bg-white
                       px-3 py-2 text-sm text-[#303c34]
                       shadow-sm outline-none
                       transition-all duration-200 ease-in-out
                       hover:border-[#D89994] hover:bg-[#faf9f6]
                       focus:border-[#D89994] focus:ring-2
                       focus:ring-[#D89994]/20"
            >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>

        <div class="flex items-center gap-2">
            <button
                type="button"
                disabled={offset === 0}
                onclick={() => actualizar(Math.max(0, offset - limit), limit)}
                class="cursor-pointer rounded-xl
                       border border-[#ded8cf] bg-white
                       px-4 py-2 text-sm font-medium text-[#36463c]
                       shadow-sm
                       transition-all duration-200 ease-in-out
                       hover:border-[#D89994]
                       hover:bg-[#faf5f3]
                       hover:text-[#75514e]
                       hover:shadow-md
                       active:scale-[0.97]
                       disabled:cursor-not-allowed
                       disabled:opacity-40
                       disabled:hover:border-[#ded8cf]
                       disabled:hover:bg-white
                       disabled:hover:text-[#36463c]
                       disabled:hover:shadow-sm
                       disabled:active:scale-100"
            >
                Anterior
            </button>

            <span
                class="min-w-16 text-center text-sm
                       font-medium text-[#647067]"
            >
                {paginaActual} / {totalPaginas}
            </span>

            <button
                type="button"
                disabled={offset + limit >= total}
                onclick={() => actualizar(offset + limit, limit)}
                class="cursor-pointer rounded-xl
                       border border-[#ded8cf] bg-white
                       px-4 py-2 text-sm font-medium text-[#36463c]
                       shadow-sm
                       transition-all duration-200 ease-in-out
                       hover:border-[#D89994]
                       hover:bg-[#faf5f3]
                       hover:text-[#75514e]
                       hover:shadow-md
                       active:scale-[0.97]
                       disabled:cursor-not-allowed
                       disabled:opacity-40
                       disabled:hover:border-[#ded8cf]
                       disabled:hover:bg-white
                       disabled:hover:text-[#36463c]
                       disabled:hover:shadow-sm
                       disabled:active:scale-100"
            >
                Siguiente
            </button>
        </div>
    </div>
</div>
