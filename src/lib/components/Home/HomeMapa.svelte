<script>
    import SvgCerroLargo from '../svg/SvgCerroLargo.svelte';
</script>

<section class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Localidades de Cerro Largo</h2>

    <div class="flex flex-col-reverse md:flex-row items-center gap-10 lg:gap-16">
        <!-- Información de la localidad -->
        <article class="w-full md:w-2/5">
            <div class="w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100">
                <img class="w-full h-56 object-cover" src="https://www.ambiente.gub.uy/oan/wp-content/uploads/2020/12/01-12.jpg" alt="Melo, Cerro Largo" />

                <div class="p-6">
                    <span class="inline-block text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2"> Cerro Largo </span>

                    <h3 class="text-2xl font-bold text-gray-900 mb-3">Melo</h3>

                    <p class="text-gray-600 leading-relaxed">
                        El nevado norte de Japón, con sus crudos y blancos inviernos y exuberantes veranos, es todo un refugio para los amantes de la naturaleza, la gastronomía y
                        la aventura al aire libre que busquen una buena dosis de adrenalina.
                    </p>
                </div>
            </div>
        </article>

        <!-- Mapa -->
        <article class="w-full md:w-3/5 flex items-center justify-center">
            <div class="w-full max-w-2xl">
                <SvgCerroLargo />
            </div>
        </article>
    </div>
</section>
