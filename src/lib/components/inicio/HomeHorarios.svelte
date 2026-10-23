<script lang="ts">
    import { container, section, h2 } from '$lib/styles/tokens';
    import { URUBUS_URL } from '$lib/transporte/urubus';
    import type { HorarioOmnibus } from '$lib/types/transporte';
    let { horarios, error = false }: { horarios: HorarioOmnibus[]; error?: boolean } = $props();
</script>

<section class={section} aria-labelledby="titulo-horarios">
    <div class={container}>
        <div class="transporte-home">
            <header class="encabezado">
                <div>
                    <span class="etiqueta">TU PRÓXIMA PARADA</span>
                    <h2 id="titulo-horarios" class={h2}>Horarios de ómnibus</h2>
                    <p>Tu viaje empieza acá. Encontrá cómo llegar y seguir recorriendo Cerro Largo.</p>
                </div>
                <a class="ver-todos" href="/horarios-omnibus">Ver todos los horarios <span aria-hidden="true">→</span></a>
            </header>
            {#if horarios.length}
                <div class="tarjetas">
                    {#each horarios as horario (horario.id)}
                        <a class="horario" href={URUBUS_URL} target="_blank" rel="noopener noreferrer" aria-label={`Consultar en Urubus: ${horario.origen} a ${horario.destino}, salida ${horario.hora_salida} (abre en otra pestaña)`}>
                            <div class="empresa">
                                <span class="icono" aria-hidden="true">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 11h14M8 19v2m8-2v2M9 15h.01M15 15h.01M9 6h6"/></svg>
                                </span>
                                <span>{horario.empresa.nombre}</span>
                                <span class="flecha" aria-hidden="true">↗</span>
                            </div>
                            <h3>{horario.origen} <span aria-hidden="true">→</span> {horario.destino}</h3>
                            {#if horario.empresa.nombre.endsWith('(Ficticia)')}<span class="prueba">Servicio ficticio de prueba</span>{/if}
                            <div class="trayecto">
                                <div><small>Salida</small><strong>{horario.hora_salida}</strong></div>
                                <div class="linea" aria-hidden="true"><span></span><i></i><span></span></div>
                                <div class="llegada"><small>Llegada</small><strong class:sin-hora={!horario.hora_llegada}>{horario.hora_llegada || 'A confirmar'}</strong></div>
                            </div>
                            <p class="dias">{horario.dias}</p>
                            <footer><span>{horario.tipo_servicio === 'DEPARTAMENTAL' ? 'Departamental' : 'Interdepartamental'}</span><b>Consultar en Urubus ↗</b></footer>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="vacio">
                    <p>{error ? 'No pudimos cargar los horarios en este momento.' : 'Pronto vas a encontrar los recorridos y sus horarios acá.'}</p>
                    <a href={URUBUS_URL} target="_blank" rel="noopener noreferrer">Consultar viajes en Urubus ↗</a>
                </div>
            {/if}
            <p class="nota">Elegí un horario para continuar en Urubus y consultar disponibilidad para tu fecha.</p>
        </div>
    </div>
</section>

<style>
    .transporte-home{padding:32px;border:1px solid #e2e9df;border-radius:28px;background:linear-gradient(135deg,#f3f7ef,#faf9f5)}
    .encabezado{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:28px}
    .etiqueta{display:block;margin-bottom:10px;color:#526d50;font-size:10px;font-weight:600;letter-spacing:.16em}
    .encabezado p{max-width:510px;margin-top:12px;font-size:13px;line-height:1.8;color:#697366}
    .ver-todos{display:inline-flex;align-items:center;gap:12px;flex-shrink:0;font-size:12px;font-weight:600;color:#365a41;padding:12px 0}
    .tarjetas{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .horario{display:flex;flex-direction:column;min-width:0;padding:22px;border:1px solid #e1e6de;border-radius:18px;background:#fff;transition:transform .2s,border-color .2s,box-shadow .2s}
    .horario:hover{transform:translateY(-4px);border-color:#8ba583;box-shadow:0 12px 28px #29422e0c}
    .horario:focus-visible,.ver-todos:focus-visible,.vacio a:focus-visible{outline:2px solid #356b53;outline-offset:4px}
    .empresa{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:500;color:#64715f}
    .icono{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:38px;height:38px;border-radius:12px;background:#eef4e9;color:#486340}
    .flecha{margin-left:auto;font-size:20px;color:#476743}
    h3{margin-top:20px;font-size:16px;font-weight:600;line-height:1.6;color:#28372b;overflow-wrap:anywhere}h3 span{padding:0 4px;color:#94a08d}
    .trayecto{display:flex;align-items:center;gap:15px;margin:22px 0 12px}.trayecto small{display:block;margin-bottom:5px;color:#7a8375;font-size:10px}.trayecto strong{font-size:26px;letter-spacing:-.04em;color:#25392b;font-weight:500;white-space:nowrap}.trayecto strong.sin-hora{font-size:13px;letter-spacing:0}.llegada{text-align:right}.linea{display:flex;align-items:center;flex:1;margin-top:16px}.linea span{width:6px;height:6px;border:1px solid #acb9a3;border-radius:50%}.linea i{flex:1;border-top:1px dashed #c3cdbd}
    .dias{margin-bottom:20px;color:#747d70;font-size:11px;line-height:1.6}
    footer{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;margin-top:auto;padding-top:16px;border-top:1px solid #edf0e9;font-size:9px;color:#808879}footer b{font-size:10px;font-weight:600;color:#3c6341}
    .nota{margin-top:20px;color:#7d8577;font-size:10px;line-height:1.7}.prueba{margin-top:8px;font-size:10px;color:#8b652c}
    .vacio{padding:28px;border:1px dashed #c9d5c2;border-radius:16px;background:#ffffff80;font-size:13px;color:#626e5c}.vacio a{display:inline-block;margin-top:14px;color:#365a41;font-weight:600}
    @media(max-width:1000px){.tarjetas{grid-template-columns:repeat(2,minmax(0,1fr))}.encabezado{align-items:start;flex-direction:column;gap:10px}}
    @media(max-width:600px){.transporte-home{padding:24px 16px;border-radius:20px}.tarjetas{grid-template-columns:1fr}.horario{padding:20px}.encabezado p{font-size:12px}}
    @media(prefers-reduced-motion:reduce){.horario{transition:none}.horario:hover{transform:none}}
</style>
