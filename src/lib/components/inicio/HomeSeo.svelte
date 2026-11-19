<script lang="ts">
    import { page } from '$app/state';
    import { dev } from '$app/environment';

    const nombre = 'Cerro Largo 360';
    const titulo = 'Turismo en Cerro Largo: qué hacer y eventos | Cerro Largo 360';
    const descripcion = 'Descubrí qué hacer en Cerro Largo, Uruguay: lugares para visitar, eventos, naturaleza y cultura en Melo, Río Branco y Laguna Merín. Planificá tu visita.';
    const palabrasClave = [
        'turismo en Cerro Largo', 'qué hacer en Cerro Largo', 'eventos en Cerro Largo',
        'visitar Cerro Largo', 'visita Cerro Largo', 'lugares para visitar en Cerro Largo',
        'Cerro Largo Uruguay', 'turismo en Melo', 'qué hacer en Melo', 'eventos en Melo',
        'turismo en Río Branco', 'Laguna Merín', 'Paso Centurión',
        'museos en Cerro Largo', 'turismo de naturaleza en Cerro Largo',
        'mapa turístico de Cerro Largo', 'Cerro Largo 360'
    ];
    const imagenAlt = 'Cerro Largo 360, turismo en Cerro Largo, Uruguay';
    const canonical = $derived(new URL('/', dev ? page.url.origin : 'https://cerrolargo360.vercel.app').href);
    const imagen = $derived(new URL('/SEO/open-graph-1200x630.png', canonical).href);
    const logo = $derived(new URL('/SEO/logo-seo-1080.png', canonical).href);
    const rss = $derived(new URL('/rss.xml', canonical).href);
    const datos = $derived(JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': canonical + '#organization',
                name: nombre,
                alternateName: 'CerroLargo360',
                url: canonical,
                description: 'Guía digital para descubrir lugares, localidades y eventos de Cerro Largo, Uruguay.',
                logo: { '@type': 'ImageObject', url: logo },
                sameAs: ['https://www.instagram.com/cerrolargo360/']
            },
            {
                '@type': 'WebSite',
                '@id': canonical + '#website',
                url: canonical,
                name: nombre,
                alternateName: 'CerroLargo360',
                description: descripcion,
                inLanguage: 'es-UY',
                publisher: { '@id': canonical + '#organization' }
            },
            {
                '@type': 'WebPage',
                '@id': canonical + '#webpage',
                url: canonical,
                name: titulo,
                description: descripcion,
                keywords: palabrasClave,
                inLanguage: 'es-UY',
                isPartOf: { '@id': canonical + '#website' },
                primaryImageOfPage: { '@id': canonical + '#primaryimage' },
                image: { '@id': canonical + '#primaryimage' },
                publisher: { '@id': canonical + '#organization' },
                relatedLink: ['/lugares', '/localidades', '/eventos', '/mapa'].map(ruta => new URL(ruta, canonical).href),
                about: { '@type': 'AdministrativeArea', name: 'Cerro Largo', containedInPlace: { '@type': 'Country', name: 'Uruguay' } }
            },
            {
                '@type': 'ImageObject',
                '@id': canonical + '#primaryimage',
                url: imagen,
                contentUrl: imagen,
                caption: imagenAlt,
                inLanguage: 'es-UY',
                representativeOfPage: true
            }
        ]
    }).replace(/</g, '\\u003c'));
</script>

<svelte:head>
    <title>{titulo}</title>
    <meta name="description" content={descripcion} />
    <meta name="keywords" content={palabrasClave.join(', ')} />
    <meta name="application-name" content={nombre} />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" type="application/rss+xml" title="Eventos de Cerro Largo" href={rss} />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={nombre} />
    <meta property="og:locale" content="es_UY" />
    <meta property="og:title" content={titulo} />
    <meta property="og:description" content={descripcion} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={imagen} />
    <meta property="og:image:secure_url" content={imagen} />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={imagenAlt} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={titulo} />
    <meta name="twitter:description" content={descripcion} />
    <meta name="twitter:image" content={imagen} />
    <meta name="twitter:image:alt" content={imagenAlt} />

    {@html `<script type="application/ld+json">${datos}</script>`}
</svelte:head>
