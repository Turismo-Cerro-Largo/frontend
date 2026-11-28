<script lang="ts">
    import { page } from '$app/state';
    import { dev } from '$app/env';
    import PaginaInformativa from '#lib/components/shared/PaginaInformativa.svelte';

    const redes = [
        { nombre: 'Instagram', url: 'https://www.instagram.com/cerrolargo360/' },
        { nombre: 'Facebook', url: 'https://www.facebook.com/Cerro.Largo.360/' },
    ];
    const origen = $derived(dev ? page.url.origin : 'https://cerrolargo360.vercel.app');
    const datos = $derived(JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        '@id': `${origen}/contacto#webpage`,
        url: `${origen}/contacto`,
        name: 'Contacto con Cerro Largo 360',
        inLanguage: 'es-UY',
        mainEntity: {
            '@type': 'Organization',
            '@id': `${origen}/#organization`,
            name: 'Cerro Largo 360',
            url: origen,
            email: 'proyectoturismomelo@gmail.com',
            sameAs: redes.map(red => red.url),
        },
    }).replace(/</g, '\\u003c'));
</script>

<svelte:head>
    {@html `<script type="application/ld+json">${datos}</script>`}
</svelte:head>

<PaginaInformativa titulo="Contacto" descripcion="Contactá al equipo de Cerro Largo 360 por correo, Instagram o Facebook. Consultas sobre la guía de turismo, lugares y eventos de Cerro Largo, Uruguay.">
    <p>¿Tenés una consulta o querés compartir información sobre un lugar o evento de Cerro Largo? Escribinos.</p>
    <div class="grid gap-3">
        <a class="rounded-xl border border-zinc-200 bg-white p-4 text-[#245c4e] underline break-all" href="mailto:proyectoturismomelo@gmail.com">proyectoturismomelo@gmail.com</a>
        {#each redes as red (red.nombre)}
            <a class="flex min-h-12 items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 text-[#245c4e]" href={red.url} target="_blank" rel="noopener noreferrer">
                <span>{red.nombre}</span><span aria-hidden="true">↗</span>
            </a>
        {/each}
    </div>
    <p class="text-sm">Melo, Cerro Largo, Uruguay.</p>
</PaginaInformativa>
