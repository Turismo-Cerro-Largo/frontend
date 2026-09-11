<script lang="ts">
    import { isMobile } from "$lib/hooks/isMobile.svelte";
    import { fly, fade } from "svelte/transition";

    let scrolled = $state(false);
    let menuAbierto = $state(false);

    $effect(() => {
        function onScroll() {
            scrolled = window.scrollY > 190;
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    });

    const mobil = isMobile();

    const links = [
        { href: "/destinos", label: "Destinos" },
        { href: "/intereses", label: "Intereses" },
        { href: "/planificador", label: "Planificá tu viaje" },
        { href: "/radios-locales", label: "Radios locales" },
        { href: "/eventos", label: "Eventos" },
    ];
</script>

{#if scrolled}
    <nav
        class="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 font-poppins"
        in:fly={{ y: -30, duration: 350 }}
        out:fly={{ y: -30, duration: 250 }}
    >
        <div class="flex items-center justify-between h-20 px-6 md:px-10">
            <span class="font-Cave text-2xl md:text-3xl shrink-0 font-bold">
                Cerro Largo <span class="text-green-600">360</span>
            </span>
            <!-- Menu cerrado para mobiles -->
            {#if mobil.current}
                <button
                    class="p-2 -mr-2"
                    aria-label="Abrir menú"
                    aria-expanded={menuAbierto}
                    onclick={() => (menuAbierto = !menuAbierto)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        fill="#1f2937"
                        viewBox="0 0 256 256"
                    >
                        <path
                            d="M220,128a4,4,0,0,1-4,4H40a4,4,0,0,1,0-8H216A4,4,0,0,1,220,128ZM40,68H216a4,4,0,0,0,0-8H40a4,4,0,0,0,0,8ZM216,188H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z"
                        ></path>
                    </svg>
                </button>
            {:else}
                <!-- menu para pc -->
                <div class="flex items-center gap-8">
                    {#each links as link}
                        <a
                            href={link.href}
                            class="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                        >
                            {link.label}
                        </a>
                    {/each}
                </div>

                <div class="flex items-center gap-4">
                    <button
                        class="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                    >
                        Buscar
                    </button>
                    <a
                        href="/autenticacion/ingresar"
                        class="flex items-center gap-2 border border-gray-300 rounded-full px-5 py-2.5 text-base font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                        Ingresar
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path
                                d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"
                            ></path>
                        </svg>
                    </a>
                </div>
            {/if}
        </div>
    </nav>

    <!-- Mobiles con el menu abierto -->
    {#if mobil.current && menuAbierto}
        <button
            class="fixed inset-0 z-40 bg-black/40 cursor-default"
            aria-label="Cerrar menú"
            onclick={() => (menuAbierto = false)}
            in:fade={{ duration: 200 }}
            out:fade={{ duration: 200 }}
        ></button>
        <div
            class="fixed top-20 left-0 w-full z-40 bg-white flex flex-col max-h-[calc(100vh-5rem)] overflow-y-auto font-poppins"
            in:fly={{ y: -20, duration: 250 }}
            out:fly={{ y: -20, duration: 200 }}
        >
            <div class="flex items-center px-6 py-4 border-b border-gray-100">
                <input
                    type="text"
                    placeholder="¿Qué lugar, evento o servicio buscas?"
                    class="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
            </div>

            {#each links as link}
                <a
                    href={link.href}
                    class="px-6 py-4 text-base font-medium text-gray-700 border-b border-gray-100"
                    onclick={() => (menuAbierto = false)}
                >
                    {link.label}
                </a>
            {/each}

            <a
                href="/autenticacion/ingresar"
                class="mx-6 my-4 flex items-center justify-center gap-2 text-center border border-gray-300 rounded-full px-5 py-3 text-base font-semibold text-gray-800"
                onclick={() => (menuAbierto = false)}
            >
                Ingresar
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                >
                    <path
                        d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"
                    ></path>
                </svg>
            </a>
        </div>
    {/if}
{/if}
