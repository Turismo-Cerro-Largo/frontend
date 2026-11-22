<script lang="ts">
    import { page } from '$app/state';
    import { dev } from '$app/env';

    let { titulo, descripcion, parametros = [] }: { titulo: string; descripcion: string; parametros?: string[] } = $props();
    const canonical = $derived.by(() => {
        const url = new URL(page.url.pathname, dev ? page.url.origin : 'https://cerrolargo360.vercel.app');
        for (const clave of parametros) {
            const valor = page.url.searchParams.get(clave);
            if (valor) url.searchParams.set(clave, valor);
        }
        return url.href;
    });
    const imagen = $derived(new URL('/SEO/open-graph-1200x630.png', canonical).href);
    const busqueda = $derived(Boolean(page.url.searchParams.get('buscar')?.trim()));
</script>

<svelte:head>
    <title>{titulo} | Cerro Largo 360</title>
    <meta name="description" content={descripcion} />
    <meta name="robots" content={busqueda ? 'noindex, follow' : 'index, follow, max-image-preview:large'} />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cerro Largo 360" />
    <meta property="og:locale" content="es_UY" />
    <meta property="og:title" content={titulo} />
    <meta property="og:description" content={descripcion} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={imagen} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Cerro Largo 360, guía de turismo de Cerro Largo, Uruguay" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={titulo} />
    <meta name="twitter:description" content={descripcion} />
    <meta name="twitter:image" content={imagen} />
    <meta name="twitter:image:alt" content="Cerro Largo 360, guía de turismo de Cerro Largo, Uruguay" />
</svelte:head>
