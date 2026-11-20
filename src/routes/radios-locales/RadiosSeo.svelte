<script lang="ts">
    let { canonical }: { canonical: string } = $props();

    const titulo = 'Radios de Cerro Largo en vivo | Cerro Largo 360';
    const descripcion = 'Escuchá radios locales de Cerro Largo, Uruguay. Encontrá emisoras de Melo, Río Branco y otras localidades con transmisión en vivo por internet.';
    const imagen = $derived(new URL('/SEO/open-graph-1200x630.png', canonical).href);
    const datos = $derived(JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: titulo,
        description: descripcion,
        url: canonical,
        inLanguage: 'es-UY'
    }).replace(/</g, '\\u003c'));
</script>

<svelte:head>
    <title>{titulo}</title>
    <meta name="description" content={descripcion} />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cerro Largo 360" />
    <meta property="og:locale" content="es_UY" />
    <meta property="og:title" content={titulo} />
    <meta property="og:description" content={descripcion} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={imagen} />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Cerro Largo 360, turismo en Cerro Largo, Uruguay" />
    {@html `<script type="application/ld+json">${datos}</script>`}
</svelte:head>
