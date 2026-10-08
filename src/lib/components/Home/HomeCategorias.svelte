<script lang="ts">
    import { sectionTight, container } from '$lib/styles/tokens';
</script>

<section class={sectionTight}>
    <div
        class="
            {container}
            flex flex-wrap justify-center gap-2
            md:justify-normal md:gap-3
            lg:grid lg:grid-cols-5
        "
    >
        <!-- Alojamiento -->
        <a
            href="/alojamiento"
            class="
                group flex h-10 w-auto items-center gap-1.5
                rounded-lg border border-zinc-200 bg-white px-2.5
                font-Poppins shadow-sm
                transition-all duration-200
                hover:border-amber-400 hover:shadow-md
                sm:h-11 sm:gap-2 sm:px-3
                lg:h-18 lg:w-full lg:gap-3 lg:px-4
            "
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                class="size-4.75 shrink-0 fill-current text-zinc-700 transition-colors group-hover:text-amber-500 sm:size-5.5 lg:size-7"
                aria-hidden="true"
            >
                <path d="M216,72H32V48a8,8,0,0,0-16,0V208a8,8,0,0,0,16,0V176H240v32a8,8,0,0,0,16,0V112A40,40,0,0,0,216,72ZM32,88h72v72H32Zm88,72V88h96a24,24,0,0,1,24,24v48Z"
                ></path>
            </svg>

            <span
                class="
                    whitespace-nowrap text-[10.5px] font-semibold leading-none text-zinc-700
                    transition-colors group-hover:text-amber-600
                    sm:text-xs lg:text-sm
                "
            >
                Alojamiento
            </span>
        </a>

        <!-- Restaurantes -->
        <a
            href="/restaurantes"
            class="
                group flex h-10 w-auto items-center gap-1.5
                rounded-lg border border-zinc-200 bg-white px-2.5
                font-Poppins shadow-sm
                transition-all duration-200
                hover:border-amber-400 hover:shadow-md
                sm:h-11 sm:gap-2 sm:px-3
                lg:h-18 lg:w-full lg:gap-3 lg:px-4
            "
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                class="size-4.75 shrink-0 fill-current text-zinc-700 transition-colors group-hover:text-amber-500 sm:size-5.5 lg:size-7"
                aria-hidden="true"
            >
                <path
                    d="M72,88V40a8,8,0,0,1,16,0V88a8,8,0,0,1-16,0ZM216,40V224a8,8,0,0,1-16,0V176H152a8,8,0,0,1-8-8,268.75,268.75,0,0,1,7.22-56.88c9.78-40.49,28.32-67.63,53.63-78.47A8,8,0,0,1,216,40ZM200,53.9c-32.17,24.57-38.47,84.42-39.7,106.1H200ZM119.89,38.69a8,8,0,1,0-15.78,2.63L112,88.63a32,32,0,0,1-64,0l7.88-47.31a8,8,0,1,0-15.78-2.63l-8,48A8.17,8.17,0,0,0,32,88a48.07,48.07,0,0,0,40,47.32V224a8,8,0,0,0,16,0V135.32A48.07,48.07,0,0,0,128,88a8.17,8.17,0,0,0-.11-1.31Z"
                ></path>
            </svg>

            <span
                class="
                    whitespace-nowrap text-[10.5px] font-semibold leading-none text-zinc-700
                    transition-colors group-hover:text-amber-600
                    sm:text-xs lg:text-sm
                "
            >
                Restaurantes
            </span>
        </a>

        <!-- Cultura -->
        <a
            href="/cultura"
            class="
                group flex h-10 w-auto items-center gap-1.5
                rounded-lg border border-zinc-200 bg-white px-2.5
                font-Poppins shadow-sm
                transition-all duration-200
                hover:border-amber-400 hover:shadow-md
                sm:h-11 sm:gap-2 sm:px-3
                lg:h-18 lg:w-full lg:gap-3 lg:px-4
            "
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                class="size-4.75 shrink-0 fill-current text-zinc-700 transition-colors group-hover:text-amber-500 sm:size-5.5 lg:size-7"
                aria-hidden="true"
            >
                <path
                    d="M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,8,8H192a8,8,0,0,0,0-16H56a16,16,0,0,1,16-16H208a8,8,0,0,0,8-8V32A8,8,0,0,0,208,24Zm-8,160H72a31.82,31.82,0,0,0-16,4.29V56A16,16,0,0,1,72,40H200Z"
                ></path>
            </svg>

            <span
                class="
                    whitespace-nowrap text-[10.5px] font-semibold leading-none text-zinc-700
                    transition-colors group-hover:text-amber-600
                    sm:text-xs lg:text-sm
                "
            >
                Cultura
            </span>
        </a>

        <!-- Eventos sociales -->
        <a
            href="/eventos"
            class="
                group flex h-10 w-auto items-center gap-1.5
                rounded-lg border border-zinc-200 bg-white px-2.5
                font-Poppins shadow-sm
                transition-all duration-200
                hover:border-amber-400 hover:shadow-md
                sm:h-11 sm:gap-2 sm:px-3
                lg:h-18 lg:w-full lg:gap-3 lg:px-4
            "
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                class="size-4.75 shrink-0 fill-current text-zinc-700 transition-colors group-hover:text-amber-500 sm:size-5.5 lg:size-7"
                aria-hidden="true"
            >
                <path
                    d="M212.92,17.69a8,8,0,0,0-6.86-1.45l-128,32A8,8,0,0,0,72,56V166.08A36,36,0,1,0,88,196V110.25l112-28v51.83A36,36,0,1,0,216,164V24A8,8,0,0,0,212.92,17.69ZM52,216a20,20,0,1,1,20-20A20,20,0,0,1,52,216ZM88,93.75V62.25l112-28v31.5ZM180,184a20,20,0,1,1,20-20A20,20,0,0,1,180,184Z"
                ></path>
            </svg>

            <span
                class="
                    whitespace-nowrap text-[10.5px] font-semibold leading-none text-zinc-700
                    transition-colors group-hover:text-amber-600
                    sm:text-xs lg:text-sm
                "
            >
                Eventos sociales
            </span>
        </a>

        <!-- Parques / Naturaleza -->
        <a
            href="/naturaleza"
            class="
                group flex h-10 w-auto items-center gap-1.5
                rounded-lg border border-zinc-200 bg-white px-2.5
                font-Poppins shadow-sm
                transition-all duration-200
                hover:border-amber-400 hover:shadow-md
                sm:h-11 sm:gap-2 sm:px-3
                lg:h-18 lg:w-full lg:gap-3 lg:px-4
            "
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                class="size-4.75 shrink-0 fill-current text-zinc-700 transition-colors group-hover:text-amber-500 sm:size-5.5 lg:size-7"
                aria-hidden="true"
            >
                <path
                    d="M198.1,62.59a76,76,0,0,0-140.2,0A71.71,71.71,0,0,0,16,127.8C15.9,166,48,199,86.14,200A72.09,72.09,0,0,0,120,192.47V232a8,8,0,0,0,16,0V192.47A72.17,72.17,0,0,0,168,200l1.82,0C208,199,240.11,166,240,127.8A71.71,71.71,0,0,0,198.1,62.59ZM169.45,184a56.08,56.08,0,0,1-33.45-10v-41l43.58-21.78a8,8,0,1,0-7.16-14.32L136,115.06V88a8,8,0,0,0-16,0v51.06L83.58,120.84a8,8,0,1,0-7.16,14.32L120,156.94v17a56,56,0,0,1-33.45,10C56.9,183.23,31.92,157.52,32,127.84A55.77,55.77,0,0,1,67.11,76a8,8,0,0,0,4.53-4.67,60,60,0,0,1,112.72,0A8,8,0,0,0,188.89,76,55.79,55.79,0,0,1,224,127.84C224.08,157.52,199.1,183.23,169.45,184Z"
                ></path>
            </svg>

            <span
                class="
                    whitespace-nowrap text-[10.5px] font-semibold leading-none text-zinc-700
                    transition-colors group-hover:text-amber-600
                    sm:text-xs lg:text-sm
                "
            >
                Parques / Naturaleza
            </span>
        </a>
    </div>
</section>
