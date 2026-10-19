<script lang="ts">
    import { isMobile } from '$lib/hooks/isMobile.svelte';
    import { fly, fade } from 'svelte/transition';
    import MenuCuenta from './MenuCuenta.svelte';

    let { solid = false }: { solid?: boolean } = $props();
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
        { href: '/lugares', label: 'Destinos' },
        { href: '/mapa', label: 'Mapa' },
        { href: '/horarios-omnibus', label: 'Horarios de ómnibus' },
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

        {solid || scrolled || menuAbierto ? 'bg-white border-b border-black/5 shadow-sm' : 'bg-transparent border-b border-transparent'}
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
        <a
            href="/"
            class="
                shrink-0
                text-[17px]
                md:text-[36px]
                font-semibold
                tracking-[-0.03em]
                transition-colors
                duration-500
                font-Cave

                {solid || scrolled || menuAbierto ? 'text-zinc-900' : 'text-white'}
            "
        >
            Cerro Largo
            <span class="font-normal opacity-70">360</span>
        </a>

        {#if mobil.current}
            <MenuCuenta claro={solid || scrolled || menuAbierto} />
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

                    {solid || scrolled || menuAbierto ? 'text-zinc-900 hover:bg-zinc-100' : 'text-white hover:bg-white/10'}
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

                            {solid || scrolled ? 'text-zinc-700 hover:text-black' : 'text-white/90 hover:text-white'}
                        "
                    >
                        {link.label}
                    </a>
                {/each}
            </div>

            <div class="flex items-center gap-2">
                <button
                    type="button"
                    aria-label="Buscar"
                    onclick={() => window.location.assign('/lugares')}
                    class="
                        flex
                        h-10 w-10
                        items-center
                        justify-center
                        rounded-full
                        transition-all
                        duration-300

                        {solid || scrolled ? 'text-zinc-700 hover:bg-zinc-100 hover:text-black' : 'text-white hover:bg-white/10'}
                    "
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <circle cx="11" cy="11" r="6" />
                        <path d="M16 16L20 20" />
                    </svg>
                </button>

                <MenuCuenta claro={solid || scrolled || menuAbierto} />
            </div>
        {/if}
    </div>
</nav>

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
            <form action="/lugares" method="GET" onsubmit={() => (menuAbierto = false)}
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
                    type="search" name="buscar" maxlength="100" aria-label="Buscar lugares por nombre o localidad"
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
<button type="submit" class="text-sm font-semibold text-[#356b53]">Buscar</button>
            </form>

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
        </div>
    </div>
{/if}
