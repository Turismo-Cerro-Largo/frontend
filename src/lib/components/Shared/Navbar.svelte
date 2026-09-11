<script lang="ts">
    import { isMobile } from '$lib/hooks/isMobile.svelte';
    import { fly, fade } from 'svelte/transition';

    let scrolled = $state(false);
    let menuAbierto = $state(false);

    $effect(() => {
        function onScroll() {
            scrolled = window.scrollY > 80;
        }

        onScroll();

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    });

    const mobil = isMobile();

    const links = [
        { href: '/destinos', label: 'Destinos' },
        { href: '/intereses', label: 'Intereses' },
        { href: '/planificador', label: 'Planificá tu viaje' },
        { href: '/radios-locales', label: 'Radios locales' },
        { href: '/eventos', label: 'Eventos' },
    ];
</script>

<nav
    class="
        fixed
        top-0 left-0
        z-50
        w-full
        font-Poppins
        transition-all
        duration-500
        ease-out

        {scrolled || menuAbierto ? 'bg-white border-b border-black/5 shadow-sm' : 'bg-transparent border-b border-transparent'}
    "
>
    <div
        class="
            mx-auto
            flex
            h-18 md:h-22
            max-w-[1600px]
            items-center
            justify-between
            px-5
            md:px-10
            lg:px-14
        "
    >
        <!-- LOGO -->
        <a
            href="/"
            class="
                shrink-0
                text-[17px]
                md:text-[19px]
                font-semibold
                tracking-[-0.03em]
                transition-colors
                duration-500

                {scrolled || menuAbierto ? 'text-zinc-900' : 'text-white'}
            "
        >
            Cerro Largo
            <span class="font-normal opacity-70">360</span>
        </a>

        <!-- Telefono -->
        {#if mobil.current}
            <button
                type="button"
                class="
                    flex
                    h-10 w-10
                    items-center
                    justify-center
                    rounded-full
                    transition-colors
                    duration-300

                    {scrolled || menuAbierto ? 'text-zinc-900 hover:bg-zinc-100' : 'text-white hover:bg-white/10'}
                "
                aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuAbierto}
                onclick={() => (menuAbierto = !menuAbierto)}
            >
                {#if menuAbierto}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <path d="M6 6L18 18" />
                        <path d="M18 6L6 18" />
                    </svg>
                {:else}
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <path d="M4 8H20" />
                        <path d="M4 16H20" />
                    </svg>
                {/if}
            </button>
        {:else}
            <!-- PC -->
            <div
                class="
                    absolute
                    left-1/2
                    -translate-x-1/2
                    flex
                    items-center
                    gap-8
                    lg:gap-10
                "
            >
                {#each links as link}
                    <a
                        href={link.href}
                        class="
                            relative
                            text-[13px]
                            font-medium
                            tracking-[-0.01em]
                            transition-colors
                            duration-300

                            after:absolute
                            after:-bottom-1.5
                            after:left-0
                            after:h-px
                            after:w-0
                            after:bg-current
                            after:transition-all
                            after:duration-300

                            hover:after:w-full

                            {scrolled ? 'text-zinc-700 hover:text-black' : 'text-white/90 hover:text-white'}
                        "
                    >
                        {link.label}
                    </a>
                {/each}
            </div>

            <!-- PC -->
            <div class="flex items-center gap-2">
                <button
                    type="button"
                    aria-label="Buscar"
                    class="
                        flex
                        h-10 w-10
                        items-center
                        justify-center
                        rounded-full
                        transition-all
                        duration-300

                        {scrolled ? 'text-zinc-700 hover:bg-zinc-100 hover:text-black' : 'text-white hover:bg-white/10'}
                    "
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <circle cx="11" cy="11" r="6" />
                        <path d="M16 16L20 20" />
                    </svg>
                </button>

                <a
                    href="/autenticacion/ingresar"
                    class="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-5
                        py-2.5
                        text-[13px]
                        font-medium
                        transition-all
                        duration-300

                        {scrolled
                        ? 'border-zinc-200 text-zinc-800 hover:bg-zinc-950 hover:text-white hover:border-zinc-950'
                        : 'border-white/40 text-white hover:bg-white hover:text-zinc-900'}
                    "
                >
                    Ingresar

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12H19" />
                        <path d="M14 7L19 12L14 17" />
                    </svg>
                </a>
            </div>
        {/if}
    </div>
</nav>

<!-- Menu telefonos -->
{#if mobil.current && menuAbierto}
    <button
        class="
            fixed
            inset-0
            z-40
            bg-black/20
            backdrop-blur-[2px]
        "
        aria-label="Cerrar menú"
        onclick={() => (menuAbierto = false)}
        in:fade={{ duration: 200 }}
        out:fade={{ duration: 150 }}
    ></button>

    <div
        class="
            fixed
            top-18
            left-0
            z-40
            w-full
            bg-white
            font-Poppins
            shadow-xl
        "
        in:fly={{ y: -15, duration: 250 }}
        out:fly={{ y: -15, duration: 180 }}
    >
        <div class="flex flex-col px-5 pt-4 pb-6">
            <div
                class="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-zinc-200
                    py-4
                "
            >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="shrink-0 text-zinc-400">
                    <circle cx="11" cy="11" r="6" />
                    <path d="M16 16L20 20" />
                </svg>

                <input
                    type="text"
                    placeholder="Buscar en Cerro Largo"
                    class="
                        w-full
                        bg-transparent
                        text-sm
                        text-zinc-800
                        outline-none
                        placeholder:text-zinc-400
                    "
                />
            </div>

            <div class="flex flex-col py-3">
                {#each links as link}
                    <a
                        href={link.href}
                        class="
                            border-b
                            border-zinc-100
                            py-4
                            text-[15px]
                            font-medium
                            text-zinc-800
                            transition-colors
                            hover:text-zinc-500
                        "
                        onclick={() => (menuAbierto = false)}
                    >
                        {link.label}
                    </a>
                {/each}
            </div>

            <a
                href="/autenticacion/ingresar"
                class="
                    mt-3
                    flex
                    items-center
                    justify-between
                    rounded-full
                    bg-zinc-950
                    px-5
                    py-3.5
                    text-sm
                    font-medium
                    text-white
                "
                onclick={() => (menuAbierto = false)}
            >
                Ingresar

                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12H19" />
                    <path d="M14 7L19 12L14 17" />
                </svg>
            </a>
        </div>
    </div>
{/if}
