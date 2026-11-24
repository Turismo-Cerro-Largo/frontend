<script lang="ts">
    let { src, alt, loading = 'lazy', fetchpriority = 'auto' }: { src: string; alt: string; loading?: 'eager' | 'lazy'; fetchpriority?: 'high' | 'low' | 'auto' } = $props();
    let dialogo: HTMLDialogElement;
    let abierta = $state(false);
    let zoom = $state(1);
    let inicioFuera = false;

    function abrir() {
        zoom = 1;
        abierta = true;
        dialogo.showModal();
    }

    function fuera(evento: PointerEvent) {
        const rect = dialogo.getBoundingClientRect();
        return evento.clientX < rect.left || evento.clientX > rect.right || evento.clientY < rect.top || evento.clientY > rect.bottom;
    }
</script>

<button class="miniatura" type="button" onclick={abrir} aria-label={`Ampliar imagen: ${alt}`}>
    <img {src} {alt} {loading} {fetchpriority} decoding="async" />
</button>

<dialog bind:this={dialogo} closedby="any" aria-label={`Imagen ampliada: ${alt}`} onclose={() => abierta = false}
    onpointerdown={(evento) => inicioFuera = fuera(evento)}
    onpointerup={(evento) => { if (!('closedBy' in HTMLDialogElement.prototype) && inicioFuera && fuera(evento)) dialogo.close(); inicioFuera = false; }}>
    <div class="controles">
        <button type="button" aria-label="Reducir zoom" disabled={zoom === 1} onclick={() => zoom = Math.max(1, zoom - 0.5)}>−</button>
        <button type="button" aria-label="Restablecer zoom" onclick={() => zoom = 1}>{Math.round(zoom * 100)} %</button>
        <button type="button" aria-label="Aumentar zoom" disabled={zoom === 3} onclick={() => zoom = Math.min(3, zoom + 0.5)}>+</button>
        <button type="button" aria-label="Cerrar imagen" onclick={() => dialogo.close()}>✕</button>
    </div>
    <div class="visor">
        {#if abierta}<div class="lienzo" style:width={`${zoom * 100}%`} style:height={`${zoom * 100}%`}><img {src} {alt} decoding="async" /></div>{/if}
    </div>
</dialog>

<style>
    .miniatura { display:block;width:100%;padding:0;border:0;background:#edf1eb;cursor:zoom-in; }
    .miniatura img { display:block;width:100%;height:300px;object-fit:contain; }
    button:focus-visible { outline:3px solid #47c9ad;outline-offset:-3px; }
    dialog { box-sizing:border-box;position:fixed;inset:0;margin:auto;width:calc(100% - 24px);max-width:1100px;height:min(720px,calc(100dvh - 48px));max-height:calc(100dvh - 48px);padding:0;overflow:hidden;border:1px solid #ffffff30;border-radius:16px;background:#151918;color:white;box-shadow:0 24px 80px #0006; }
    dialog[open] { display:flex;flex-direction:column; }
    dialog:modal { overscroll-behavior:contain; }
    dialog::backdrop { background:#000c;overflow:hidden;overscroll-behavior:contain; }
    .controles { display:flex;flex:none;justify-content:center;gap:8px;padding:10px;border-bottom:1px solid #ffffff18; }
    .controles button:last-child { margin-left:auto; }
    .controles button { min-width:44px;min-height:44px;border:1px solid #ffffff40;border-radius:10px;background:#ffffff12;color:white;font:inherit;cursor:pointer; }
    .controles button:disabled { opacity:.35;cursor:default; }
    .visor { flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;touch-action:pan-x pan-y pinch-zoom; }
    .lienzo { min-width:100%;min-height:100%; }
    .visor img { display:block;width:100%;height:100%;max-width:none;object-fit:contain; }
    @media (min-width:640px) { dialog { width:calc(100% - 64px);border-radius:20px; } .controles { padding:12px 16px; } }
</style>
