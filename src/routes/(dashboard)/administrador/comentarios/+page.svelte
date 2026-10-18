<script lang="ts">
    import { onMount } from 'svelte';
    type Estado = 'PENDIENTE_REVISION' | 'PUBLICADO' | 'OCULTADO';
    type Comentario = {
        id: number;
        texto: string;
        calificacion: number;
        estado: Estado;
        creado_en: string;
        usuario: { nombres: string; apellidos: string };
        ubicacion: { id: number; nombre: string };
    };
    type Respuesta = { comentarios: Comentario[]; total: number; resumen: { pendientes: number; publicados: number; ocultados: number } };
    let comentarios = $state<Comentario[]>([]);
    let total = $state(0);
    let resumen = $state({ pendientes: 0, publicados: 0, ocultados: 0 });
    let buscar = $state('');
    let estado = $state('');
    let pagina = $state(0);
    let cargando = $state(false);
    let error = $state('');
    const limite = 12;
    let secuencia = 0;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const paginas = $derived(Math.max(1, Math.ceil(total / limite)));
    const fecha = (s: string) => new Intl.DateTimeFormat('es-UY', { dateStyle: 'medium' }).format(new Date(s));
    const nombreEstado = (s: Estado) => (s === 'PENDIENTE_REVISION' ? 'Pendiente' : s === 'PUBLICADO' ? 'Publicado' : 'Ocultado');
    const colorEstado = (s: Estado) =>
        s === 'PENDIENTE_REVISION' ? 'bg-amber-100 text-amber-800' : s === 'PUBLICADO' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700';
    async function cargar() {
        const actual = ++secuencia;
        cargando = true;
        error = '';
        try {
            const p = new URLSearchParams({ offset: String(pagina * limite), limit: String(limite) });
            if (estado) p.set('estado', estado);
            if (buscar.trim()) p.set('buscar', buscar.trim());
            const r = await fetch(`/api/admin/comentarios?${p.toString()}`, { credentials: 'include' });
            if (!r.ok) throw new Error(r.status === 403 || r.status === 401 ? 'No tenés permisos para consultar comentarios.' : `No se pudo cargar el listado (${r.status}).`);
            const d: Respuesta = await r.json();
            if (actual !== secuencia) return;
            comentarios = d.comentarios;
            total = d.total;
            resumen = d.resumen;
        } catch (e) {
            if (actual === secuencia) error = e instanceof Error ? e.message : 'Error al consultar comentarios.';
        } finally {
            if (actual === secuencia) cargando = false;
        }
    }
    function filtrar() {
        pagina = 0;
        if (temporizador) clearTimeout(temporizador);
        temporizador = setTimeout(() => void cargar(), 250);
    }
    function seleccionarEstado(value: string) {
        estado = value;
        pagina = 0;
        void cargar();
    }
    function mover(delta: number) {
        pagina = Math.min(paginas - 1, Math.max(0, pagina + delta));
        void cargar();
    }
    onMount(() => {
        void cargar();
        return () => {
            secuencia++;
            if (temporizador) clearTimeout(temporizador);
        };
    });
</script>

<svelte:head><title>Comentarios | Cerro Largo 360</title></svelte:head>
<section class="mx-auto w-full min-w-0 max-w-7xl space-y-6 pb-8 text-[#26382e]">
    <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-3xl font-semibold">Moderación de comentarios</h1>
            <p class="mt-1 text-sm text-slate-500">Revisá opiniones sobre ubicaciones turísticas.</p>
        </div>
        <button
            type="button"
            onclick={() => void cargar()}
            disabled={cargando}
            class="rounded-xl border border-[#bfd0c3] bg-white px-4 py-2 text-sm font-medium hover:bg-[#edf5ef] disabled:opacity-50">Actualizar</button
        >
    </header>
    <div class="grid gap-3 sm:grid-cols-3">
        {#each [{ nombre: 'Pendientes de revisión', valor: resumen.pendientes, clase: 'text-amber-700' }, { nombre: 'Publicados', valor: resumen.publicados, clase: 'text-green-700' }, { nombre: 'Ocultados', valor: resumen.ocultados, clase: 'text-slate-600' }] as tarjeta}
            <div class="rounded-2xl border border-[#e0e6df] bg-white p-5">
                <p class="text-sm text-slate-500">{tarjeta.nombre}</p>
                <p class={`mt-2 text-3xl font-semibold ${tarjeta.clase}`}>{tarjeta.valor}</p>
            </div>
        {/each}
    </div>
    <div class="rounded-2xl border border-[#e0e6df] bg-white p-5 shadow-sm">
        <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <label class="block text-sm font-medium"
                >Buscar comentarios, usuarios o lugares<input
                    type="search"
                    bind:value={buscar}
                    oninput={filtrar}
                    placeholder="Escribí para buscar…"
                    class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5"
                /></label
            >
            <label class="block text-sm font-medium"
                >Estado<select value={estado} onchange={(e) => seleccionarEstado(e.currentTarget.value)} class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    ><option value="">Todos</option><option value="PENDIENTE_REVISION">Pendientes</option><option value="PUBLICADO">Publicados</option><option value="OCULTADO"
                        >Ocultados</option
                    ></select
                ></label
            >
        </div>
        {#if error}<p role="alert" class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>{/if}
        <div class="mt-5 min-w-0 overflow-x-auto">
            <table class="w-full min-w-[780px] text-left text-sm">
                <thead class="border-b border-slate-200 bg-slate-50 text-slate-600"
                    ><tr
                        ><th class="p-3">Comentario</th><th class="p-3">Usuario</th><th class="p-3">Ubicación</th><th class="p-3">Calificación</th><th class="p-3">Estado</th><th
                            class="p-3">Fecha</th
                        ><th class="p-3">Acción</th></tr
                    ></thead
                >
                <tbody
                    >{#each comentarios as c (c.id)}<tr class="border-b border-slate-100"
                            ><td class="max-w-64 p-3"><p class="truncate" title={c.texto}>{c.texto}</p></td><td class="p-3">{c.usuario.nombres} {c.usuario.apellidos}</td><td
                                class="p-3">{c.ubicacion.nombre}</td
                            ><td class="p-3">{c.calificacion} / 5</td><td class="p-3"
                                ><span class={`rounded-full px-2.5 py-1 text-xs font-semibold ${colorEstado(c.estado)}`}>{nombreEstado(c.estado)}</span></td
                            ><td class="p-3">{fecha(c.creado_en)}</td><td class="p-3"
                                ><a class="font-semibold text-[#477967] hover:underline" href={`/administrador/comentarios/${c.id}`}>Revisar</a></td
                            ></tr
                        >{/each}</tbody
                >
            </table>
            {#if !cargando && !error && comentarios.length === 0}<p class="p-8 text-center text-sm text-slate-500">No se encontraron comentarios.</p>{/if}
        </div>
        <footer class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span>{cargando ? 'Cargando…' : `${total} comentario(s) · Página ${pagina + 1} de ${paginas}`}</span>
            <div class="flex gap-2">
                <button type="button" disabled={cargando || pagina === 0} onclick={() => mover(-1)} class="rounded-lg border px-3 py-2 disabled:opacity-40">Anterior</button><button
                    type="button"
                    disabled={cargando || pagina >= paginas - 1}
                    onclick={() => mover(1)}
                    class="rounded-lg border px-3 py-2 disabled:opacity-40">Siguiente</button
                >
            </div>
        </footer>
    </div>
</section>
