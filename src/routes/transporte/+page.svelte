<script lang="ts">
    import { onMount } from 'svelte';
    type Horario = {
        id: number;
        origen: string;
        destino: string;
        hora_salida: string;
        hora_llegada: string | null;
        dias: string;
        precio: number | null;
        tipo_servicio: string;
        empresa: { nombre: string };
    };
    let horarios = $state<Horario[]>([]),
        cargando = $state(true),
        error = $state(''),
        buscar = $state('');
    let filtrados = $derived(horarios.filter((h) => `${h.origen} ${h.destino} ${h.empresa.nombre} ${h.dias}`.toLowerCase().includes(buscar.toLowerCase())));
    onMount(async () => {
        try {
            const r = await fetch('/api/transporte/horarios');
            if (!r.ok) throw new Error('No se pudieron cargar los horarios');
            horarios = (await r.json()).horarios;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error';
        } finally {
            cargando = false;
        }
    });
</script>

<svelte:head><title>Horarios de ómnibus | Cerro Largo 360</title></svelte:head>
<main class="mx-auto max-w-6xl space-y-5 px-4 py-10">
    <h1 class="text-3xl font-bold text-[#285f4d]">Horarios de ómnibus</h1>
    <p class="text-slate-600">Consultá empresas, destinos y horarios publicados de Cerro Largo.</p>
    <input aria-label="Buscar horarios" class="w-full rounded-xl border p-3" placeholder="Buscar empresa, origen o destino" bind:value={buscar} />{#if cargando}<p>
            Cargando...
        </p>{:else if error}<p class="text-red-700" role="alert">{error}</p>{:else if filtrados.length === 0}<p>No hay horarios disponibles para esta búsqueda.</p>{:else}<div
            class="overflow-x-auto rounded-2xl border"
        >
            <table class="w-full min-w-[650px] text-left text-sm">
                <thead class="bg-slate-100"
                    ><tr
                        ><th class="p-4">Empresa</th><th class="p-4">Trayecto</th><th class="p-4">Salida</th><th class="p-4">Llegada</th><th class="p-4">Días</th><th class="p-4"
                            >Servicio</th
                        ><th class="p-4">Precio</th></tr
                    ></thead
                ><tbody
                    >{#each filtrados as h (h.id)}<tr class="border-t"
                            ><td class="p-4">{h.empresa.nombre}</td><td class="p-4">{h.origen} → {h.destino}</td><td class="p-4">{h.hora_salida}</td><td class="p-4"
                                >{h.hora_llegada ?? '—'}</td
                            ><td class="p-4">{h.dias}</td><td class="p-4">{h.tipo_servicio === 'DEPARTAMENTAL' ? 'Departamental' : 'Interdepartamental'}</td><td class="p-4"
                                >{h.precio === null ? 'Consultar' : `$ ${h.precio}`}</td
                            ></tr
                        >{/each}</tbody
                >
            </table>
        </div>{/if}
    <p class="text-xs text-slate-500">Los horarios pueden cambiar. Confirmá directamente con la empresa antes de viajar.</p>
</main>
