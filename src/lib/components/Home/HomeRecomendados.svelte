<script lang="ts">
    const datos = [
        {
            icono: 'https://instagram.fmvd4-1.fna.fbcdn.net/v/t51.82787-19/639451170_18509176018076490_7668569125813805903_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=voTIAfM9b70Q7kNvwG5tkdy&_nc_oc=AdqOLVzse7gSnTFkGkSG736A6BZ8HUHT0DRP2T1K-e85--aDyc96Cs2F0HePROnYuxN8X12-sre3MDuW83jCdjIs&_nc_zt=24&_nc_ht=instagram.fmvd4-1.fna&_nc_gid=GcFPw5krvH1CPlV3DNx64g&_nc_ss=7b6a8&oh=00_AQK_-ecpNmHr8wQjOJ3AwTgT7tGOuBon6FCSFYSNRl7Mdw&oe=6AAA159F',
            name: 'Silvia Techera',
            link: 'https://www.instagram.com/silviatecheraoficial',
        },
        {
            icono: 'https://i.ibb.co/CK2BpGKj/557472232-18092648545776934-1231051150075288602-n.jpg',
            name: 'Cerro Largo al Día',
            link: 'https://www.instagram.com/cerrolargoaldia',
        },
        {
            icono: 'https://i.ibb.co/JwD8HzxF/images.jpg',
            name: 'Cerro Largo Portal',
            link: 'https://www.instagram.com/cerrolargoportal',
        },
    ];
</script>

<section class="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h2 class="text-3xl font-serif mb-6">Páginas sugeridas</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each datos as dato}
            <a
                href={dato.link}
                target="_blank"
                rel="noopener noreferrer"
                class="
                    group
                    flex items-center gap-4
                    rounded-xl
                    border border-gray-200
                    bg-white
                    p-4
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:border-gray-300
                    hover:shadow-md
                "
            >
                <img
                    src={dato.icono}
                    alt={dato.name}
                    loading="lazy"
                    class="
                        h-14 w-14
                        shrink-0
                        rounded-full
                        object-cover
                        ring-2 ring-gray-100
                    "
                />

                <div class="min-w-0 flex-1">
                    <h3 class="truncate font-medium text-gray-900">
                        {dato.name}
                    </h3>

                    <p class="mt-0.5 text-sm text-gray-500">Ver en Instagram</p>
                </div>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    class="
                        h-5 w-5
                        shrink-0
                        text-gray-400
                        transition-transform
                        group-hover:translate-x-1
                    "
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6" />
                </svg>
            </a>
        {/each}
    </div>
</section>
