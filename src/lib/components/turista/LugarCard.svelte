<script lang="ts">
    import Icono from './Icono.svelte';
    import type { Lugar } from '$lib/types/turista';
    let { lugar }: { lugar: Lugar } = $props();
</script>

<a class="t-lugar" href={`/lugares/${lugar.id}`}>
    {#if lugar.recursos?.find(r => r.tipo === "IMAGEN")}
        {@const foto = lugar.recursos.find(r => r.tipo === "IMAGEN")}
        <img src={`/api/recursos/${foto?.id}`} alt={foto?.descripcion || lugar.nombre} loading="lazy" style="width:100%;height:190px;object-fit:cover" />
    {:else}<div class="t-lugar-symbol"><Icono nombre="explorar" size={34} /><span>{lugar.localidad}</span></div>{/if}
    <div class="t-lugar-content">
        <span class="t-eyebrow">{lugar.categoria.nombre}</span>
        <h2>{lugar.nombre}</h2>
        <p>{lugar.descripcion}</p>
        <span class="t-link">Conocer el lugar <Icono nombre="flecha" size={17} /></span>
    </div>
</a>
