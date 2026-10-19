<script lang="ts">
    import { rangoEvento, type EventoPublico } from '$lib/types/agenda';
    let { evento }: { evento: EventoPublico } = $props();
    const imagen = $derived(evento.recursos.find(r => r.tipo === 'IMAGEN'));
</script>
<a class="evento" href={`/eventos/${evento.id}`}>
    {#if imagen}<img src={`/api/recursos/${imagen.id}`} alt={`Afiche de ${evento.titulo}`} loading="lazy" />{/if}
    <div><p class="fecha">{rangoEvento(evento)}</p><h3>{evento.titulo}</h3><p>{evento.lugar_evento || 'Lugar a confirmar'}</p><span>Ver detalles y ubicación →</span></div>
</a>
<style>
.evento { display:block;overflow:hidden;border-radius:18px;background:white;border:1px solid #dfe6df;color:#263c32;text-decoration:none;transition:box-shadow .2s; }
.evento:hover { box-shadow:0 8px 24px #183c2714; } img { width:100%;height:320px;object-fit:contain;background:#edf1eb; } .evento>div {padding:22px;} h3 {font-size:21px;font-weight:600;line-height:1.35;margin:8px 0 12px;} p {font-size:14px;color:#63756a;} .fecha,span {color:#356b53;font-size:13px;font-weight:600;} span {display:block;margin-top:20px;}
</style>
