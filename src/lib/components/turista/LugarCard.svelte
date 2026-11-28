<script lang="ts">
    import Icono from './Icono.svelte';
    import Galeria from './Galeria.svelte';
    import type { Lugar } from '#lib/types/turista.ts';
    let { lugar, prioritaria = false }: { lugar: Lugar; prioritaria?: boolean } = $props();
</script>

<article class="t-lugar">
    {#if lugar.recursos?.length}
        <Galeria recursos={lugar.recursos} nombre={lugar.nombre} {prioritaria} formato="tarjeta" />
    {:else}<div class="t-lugar-symbol"><Icono nombre="explorar" size={34} /><span>{lugar.localidad}</span></div>{/if}
    <a class="t-lugar-content" href={`/lugares/${lugar.id}`}>
        <span class="t-eyebrow">{lugar.categoria.nombre}</span>
        <h2>{lugar.nombre}</h2>
        <p>{lugar.descripcion}</p>
        <span class="t-link">Conocer el lugar <Icono nombre="flecha" size={17} /></span>
    </a>
</article>

<style>.t-lugar-content { display:block;color:inherit; }</style>
