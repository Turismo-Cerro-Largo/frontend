<script lang="ts">
    import { goto } from '$app/navigation';
    import { container, section, cardDark, chip, label, dateWrapper, dateIcon, btnPrimary } from '$lib/styles/tokens';

    let desde = $state('');
    let hasta = $state('');

    function formatDate(iso: string) {
        if (!iso) return '';
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    }

    function buscar(e: Event) {
        e.preventDefault();
        if (!desde || !hasta) return;
        goto(`/planificador?desde=${desde}&hasta=${hasta}`);
    }
</script>

<section class={section}>
    <div class={container}>
        <div class="{cardDark} relative overflow-hidden px-6 py-10 shadow-2xl sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div aria-hidden="true" class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl"></div>
            <div aria-hidden="true" class="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-amber-400/5 blur-3xl"></div>

            <div class="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
                <div class="flex flex-col gap-3 lg:max-w-lg lg:flex-1">
                    <span class={chip}>Planificador</span>

                    <h2 class="font-serif text-[26px] leading-tight font-normal text-white sm:text-[30px] lg:text-[36px]">¿Querés armar tu viaje?</h2>

                    <p class="text-[13.5px] leading-relaxed text-zinc-400 lg:text-[15px]">
                        Contanos cuándo llegás y cuándo te vas. Con esas fechas armamos un calendario a medida con los eventos de Cerro Largo que van a pasar durante tu estadía.
                    </p>
                </div>

                <form onsubmit={buscar} class="flex w-full flex-col gap-4 lg:w-auto lg:min-w-105">
                    <div class="flex flex-col gap-4 sm:flex-row sm:gap-3">
                        <label class="flex flex-1 flex-col gap-1.5">
                            <span class={label}>Llegada</span>
                            <div class={dateWrapper}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.75"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class={dateIcon}
                                    aria-hidden="true"
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2V6" />
                                    <path d="M8 2V6" />
                                    <path d="M3 10H21" />
                                </svg>
                                <div class="relative w-full min-w-0">
                                    <span class="block truncate text-base font-medium sm:text-[14px] {desde ? 'text-zinc-900' : 'text-zinc-400'}">
                                        {desde ? formatDate(desde) : 'dd/mm/aaaa'}
                                    </span>
                                    <input
                                        type="date"
                                        bind:value={desde}
                                        required
                                        aria-label="Fecha de llegada"
                                        class="absolute inset-0 h-full w-full cursor-pointer opacity-0 scheme-light"
                                    />
                                </div>
                            </div>
                        </label>

                        <label class="flex flex-1 flex-col gap-1.5">
                            <span class={label}>Salida</span>
                            <div class={dateWrapper}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.75"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class={dateIcon}
                                    aria-hidden="true"
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2V6" />
                                    <path d="M8 2V6" />
                                    <path d="M3 10H21" />
                                </svg>
                                <div class="relative w-full min-w-0">
                                    <span class="block truncate text-base font-medium sm:text-[14px] {hasta ? 'text-zinc-900' : 'text-zinc-400'}">
                                        {hasta ? formatDate(hasta) : 'dd/mm/aaaa'}
                                    </span>
                                    <input
                                        type="date"
                                        bind:value={hasta}
                                        required
                                        min={desde || undefined}
                                        aria-label="Fecha de salida"
                                        class="absolute inset-0 h-full w-full cursor-pointer opacity-0 scheme-light"
                                    />
                                </div>
                            </div>
                        </label>
                    </div>

                    <button type="submit" class="{btnPrimary} w-full">
                        Buscar
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.25"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21L16.65 16.65" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
</section>
