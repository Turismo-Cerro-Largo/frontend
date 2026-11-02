<script lang="ts">
    let { disabled = false }: { disabled?: boolean } = $props();
    let seleccion = $state<number>();
    let hover = $state(0);
    const visibles = $derived(hover || seleccion || 0);
</script>

<fieldset class="estrellas" {disabled}>
    <legend>Tu calificación</legend>
    <div class="opciones">
        {#each [1, 2, 3, 4, 5] as valor}
            <label class:seleccionada={valor <= visibles} onpointerenter={() => { if (!disabled) hover = valor; }} onpointerleave={() => hover = 0} style={`--paso:${valor - 1}`}>
                <input type="radio" name="calificacion" value={valor} bind:group={seleccion} required aria-label={`${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`} />
                {#key visibles}
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" /></svg>
                {/key}
            </label>
        {/each}
    </div>
    <span class="estado" aria-live="polite">{seleccion ? `${seleccion} de 5 estrellas` : 'Seleccioná una estrella'}</span>
</fieldset>

<style>
    .estrellas { border:0;margin:18px 0;padding:0; }
    legend { font-size:13px;font-weight:600; }
    .opciones { display:flex;gap:4px;margin:6px 0; }
    label { position:relative;display:grid;place-items:center;width:44px;height:44px;cursor:pointer;border-radius:8px; }
    input { position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap; }
    svg { width:34px;height:34px;fill:transparent;stroke:#87948b;stroke-width:1.5;transition:fill 160ms,stroke 160ms; }
    .seleccionada svg { fill:#d49a29;stroke:#aa7518;animation:encender 240ms ease-out both;animation-delay:calc(var(--paso) * 30ms); }
    input:focus-visible { outline:none; }
    label:has(input:focus-visible) svg { stroke:#245c4e;stroke-width:2.5;filter:drop-shadow(0 0 3px #245c4e66); }
    .seleccionada svg { stroke:#aa7518;stroke-width:2.5;filter:drop-shadow(0 0 3px #d49a2966); }
    .estado { font-size:12px;color:#64736d; }
    fieldset:disabled label { cursor:wait;opacity:.6; }
    @keyframes encender { from { transform:scale(.85); } 60% { transform:scale(1.15); } to { transform:scale(1); } }
    @media (prefers-reduced-motion:reduce) { svg,.seleccionada svg { animation:none;transition:none; } }
</style>
