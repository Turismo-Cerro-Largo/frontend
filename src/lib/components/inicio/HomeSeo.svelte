<script lang="ts">
    import { page } from '$app/state';

    const nombre = 'Cerro Largo 360';
    const titulo = 'Turismo en Cerro Largo, Uruguay | Cerro Largo 360';
    const descripcion = 'Descubrí qué hacer en Cerro Largo, Uruguay. Explorá lugares y localidades, consultá la agenda de eventos y los horarios de ómnibus, y escuchá radios locales.';
    const imagenAlt = 'Cerro Largo 360, turismo en Cerro Largo, Uruguay';
    const canonical = $derived(new URL('/', page.url).href);
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
                url: canonical,
                logo: { '@type': 'ImageObject', url: logo },
                sameAs: ['https://www.instagram.com/cerrolargo360/']
            },
            {
                '@type': 'WebSite',
                '@id': canonical + '#website',
                url: canonical,
                name: nombre,
                inLanguage: 'es-UY',
                publisher: { '@id': canonical + '#organization' }
            },
            {
                '@type': 'WebPage',
                '@id': canonical + '#webpage',
                url: canonical,
                name: titulo,
                description: descripcion,
                inLanguage: 'es-UY',
                isPartOf: { '@id': canonical + '#website' },
                primaryImageOfPage: { '@type': 'ImageObject', url: imagen, caption: imagenAlt },
                about: { '@type': 'AdministrativeArea', name: 'Cerro Largo', containedInPlace: { '@type': 'Country', name: 'Uruguay' } }
            }
        ]
    }).replace(/</g, '\\u003c'));
</script>

<svelte:head>
    <title>{titulo}</title>
    <meta name="description" content={descripcion} />
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
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={imagenAlt} />

    {@html `<script type="application/ld+json">${datos}</script>`}
</svelte:head>
