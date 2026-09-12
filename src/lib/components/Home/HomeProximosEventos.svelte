<script>
    import { container, section, h2 } from '$lib/styles/tokens';

    const eventos_proximos = [
        {
            link: '',
            img: 'https://scontent.fmvd4-1.fna.fbcdn.net/v/t39.30808-6/752659007_37072202559092434_6548332176590782275_n.jpg?stp=dst-jpg_tt6&cstp=mx996x1498&ctp=s590x590&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=V6MHqDiCDu8Q7kNvwF7zES4&_nc_oc=Adqz-0BcrvKpWD-Ez6_q0nav5eRYCNibWiEe215cc1FsBbBWxBraT1HEHMRJ_kM31RCrkYpYUPyMoKyhOTvEeXXo&_nc_zt=23&_nc_ht=scontent.fmvd4-1.fna&_nc_gid=gJgY7FQarUj-I73MC8Bcng&_nc_ss=7b289&oh=00_AQKW_1mlFZ_e9XzfZ3JI1w1vtmvQLZdS0W0R5_wzNRY6Uw&oe=6AA9EA9A',
        },
        {
            link: '',
            img: 'https://scontent.fmvd2-2.fna.fbcdn.net/v/t39.30808-6/634145338_1341054168051697_5097806873834098573_n.jpg?stp=dst-jpg_tt6&cstp=mx1152x1440&ctp=s640x640&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=-pR4nd0ifH8Q7kNvwGtPyXh&_nc_oc=AdrmgbSkekeJZKSq-fc5qIHBxxatlmjAnfbUzgxC0UaxUps1LuKSt7NAvUnAh5W4Kn-1gCUTVwCKJTxF1rIvVYxB&_nc_zt=23&_nc_ht=scontent.fmvd2-2.fna&_nc_gid=THwv99jx77puT33QkPaxIQ&_nc_ss=7b289&oh=00_AQIfQ-Uz6EOvKmNJGDR24hwzJeHOiBOtxepuCyYgziP_IQ&oe=6AA9F825',
        },
        {
            link: '',
            img: 'https://scontent.fmvd3-1.fna.fbcdn.net/v/t39.99422-6/790412057_1696667988092693_4521465445171994086_n.png?stp=dst-jpg_tt6&cstp=mx1080x1350&ctp=s640x640&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=YwY57IA5dMwQ7kNvwF3Sg4f&_nc_oc=Adp8NK3ByENcS_NACFYblDKdVCUiUPwhoKBTvovbzdo024u2ZbIwrimyhzxXvin3I5NAc56gJ25Sq9s2kYaeD5Ev&_nc_zt=14&_nc_ht=scontent.fmvd3-1.fna&_nc_gid=6X55j4PYWggHSQxQWMpvKQ&_nc_ss=7b289&oh=00_AQLsCxFx6W5ln1w-_Q4TZFczXOE84LHR95JtoAnn8yDiOQ&oe=6AA9DA84',
        },
    ];
</script>

<section class={section}>
    <div class={container}>
        <h2 class="{h2} mb-6">Próximos eventos</h2>

        <div
            class="
                flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide

                lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:snap-none
            "
        >
            {#each eventos_proximos as evento}
                <a href={evento.link} class="w-[85%] flex-none snap-start lg:w-auto lg:snap-none">
                    <img src={evento.img} loading="lazy" alt="Evento" class="aspect-4/5 w-full rounded-xl object-cover transition-transform duration-300 hover:scale-[1.02]" />
                </a>
            {/each}
        </div>
    </div>
</section>
