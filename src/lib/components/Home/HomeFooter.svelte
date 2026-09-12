<script lang="ts">
    import { container, eyebrow, iconBtn } from '$lib/styles/tokens';

    const explora = [
        { href: '/destinos', label: 'Destinos' },
        { href: '/intereses', label: 'Intereses' },
        { href: '/planificador', label: 'Planificá tu viaje' },
        { href: '/eventos', label: 'Eventos' },
    ];

    const recursos = [
        { href: '/radios-locales', label: 'Radios locales' },
        { href: '/mapa', label: 'Mapa interactivo' },
        { href: '/sobre-nosotros', label: 'Sobre nosotros' },
        { href: '/contacto', label: 'Contacto' },
    ];

    const redes = [
        {
            label: 'Instagram',
            href: 'https://instagram.com',
            path: 'M7 2H17C19.7614 2 22 4.23858 22 7V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2Z M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.7988C15.2063 14.5455 14.5931 15.1509 13.8416 15.5297C13.0901 15.9085 12.2384 16.0413 11.4078 15.9089C10.5771 15.7766 9.80977 15.3856 9.21485 14.7913C8.62061 14.196 8.22997 13.4287 8.09761 12.5981C7.96526 11.7674 8.09802 10.9157 8.47686 10.1642C8.85571 9.41267 9.46107 8.79955 10.2078 8.41202C10.9544 8.02449 11.8044 7.88245 12.6366 8.00575C13.4855 8.13157 14.2701 8.53008 14.8724 9.14232C15.4747 9.75455 15.8618 10.5216 15.98 11.37H16Z M17.5 6.5H17.51',
        },
        {
            label: 'Facebook',
            href: 'https://facebook.com',
            path: 'M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z',
        },
        {
            label: 'YouTube',
            href: 'https://youtube.com',
            path: 'M22 12C22 8.1 22 6.15 20.775 4.925C19.55 3.7 17.6 3.7 13.7 3.7H10.3C6.4 3.7 4.45 3.7 3.225 4.925C2 6.15 2 8.1 2 12C2 15.9 2 17.85 3.225 19.075C4.45 20.3 6.4 20.3 10.3 20.3H13.7C17.6 20.3 19.55 20.3 20.775 19.075C22 17.85 22 15.9 22 12Z M10 9.5L14.5 12L10 14.5V9.5Z',
        },
    ];

    const anio = new Date().getFullYear();

    const linkClass = 'w-fit text-[13px] text-zinc-600 transition-colors duration-300 hover:text-zinc-950';
    const contactIcon = 'shrink-0 text-zinc-400';
</script>

<footer class="w-full border-t border-zinc-100 bg-white font-Poppins">
    <div class="{container} py-14 md:py-16">
        <div class="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr_1fr_1.2fr] md:gap-8">
            <div class="flex flex-col gap-4">
                <a href="/" class="text-[19px] font-semibold tracking-[-0.03em] text-zinc-900">
                    Cerro Largo
                    <span class="font-normal opacity-70">360</span>
                </a>

                <p class="max-w-xs text-[13px] leading-relaxed text-zinc-500">
                    Descubrí los destinos, la cultura y los sabores de Cerro Largo. Tu guía para planificar cada rincón del departamento.
                </p>

                <div class="mt-1 flex items-center gap-2">
                    {#each redes as red}
                        <a href={red.href} target="_blank" rel="noopener noreferrer" aria-label={red.label} class={iconBtn}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d={red.path} />
                            </svg>
                        </a>
                    {/each}
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <span class={eyebrow}>Explorá</span>
                <div class="flex flex-col gap-3">
                    {#each explora as link}
                        <a href={link.href} class={linkClass}>{link.label}</a>
                    {/each}
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <span class={eyebrow}>Recursos</span>
                <div class="flex flex-col gap-3">
                    {#each recursos as link}
                        <a href={link.href} class={linkClass}>{link.label}</a>
                    {/each}
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <span class={eyebrow}>Contacto</span>
                <div class="flex flex-col gap-3 text-[13px] text-zinc-600">
                    <div class="flex items-start gap-2.5">
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="mt-0.5 {contactIcon}"
                        >
                            <path
                                d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                            />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Melo, Cerro Largo, Uruguay</span>
                    </div>

                    <a href="mailto:contacto@cerrolargo360.uy" class="flex items-center gap-2.5 transition-colors duration-300 hover:text-zinc-950">
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class={contactIcon}
                        >
                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" />
                            <path d="M22 6L12 13L2 6" />
                        </svg>
                        contacto@cerrolargo360.uy
                    </a>

                    <div class="flex items-center gap-2.5">
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class={contactIcon}
                        >
                            <path
                                d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09501 3.90347 2.12787 3.62476 2.21649 3.36163C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.04981 2.28271 3.30379 2.17052C3.55778 2.05833 3.83234 2.00026 4.10999 2H7.10999C7.59522 1.99522 8.06574 2.16708 8.43376 2.48353C8.80178 2.79999 9.04202 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
                            />
                        </svg>
                        (0000) 00 000
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-12 flex flex-col-reverse items-center gap-4 border-t border-zinc-100 pt-6 md:flex-row md:justify-between">
            <p class="text-[12px] text-zinc-400">© {anio} Cerro Largo 360. Todos los derechos reservados.</p>

            <div class="flex items-center gap-6">
                <a href="/privacidad" class="text-[12px] text-zinc-400 transition-colors duration-300 hover:text-zinc-700">Privacidad</a>
                <a href="/terminos" class="text-[12px] text-zinc-400 transition-colors duration-300 hover:text-zinc-700">Términos</a>
            </div>
        </div>
    </div>
</footer>
