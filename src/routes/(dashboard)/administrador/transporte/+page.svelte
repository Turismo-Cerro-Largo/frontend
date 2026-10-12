<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    type Empresa = { id: number; nombre: string; telefono: string | null; sitio_web: string | null; _count?: { horarios: number } };
    type Horario = {
        id: number;
        id_empresa: number;
        empresa?: { id: number; nombre: string };
        origen: string;
        destino: string;
        hora_salida: string;
        hora_llegada: string | null;
        dias: string;
        tipo_servicio: 'DEPARTAMENTAL' | 'INTERDEPARTAMENTAL';
        precio: number | null;
        estado: 'PUBLICADO' | 'OCULTADO';
    };
    let tab = $state<'empresas' | 'horarios'>('horarios');
    let empresas = $state<Empresa[]>([]);
    let horarios = $state<Horario[]>([]);
    let cargando = $state(true),
        guardando = $state(false),
        error = $state(''),
        aviso = $state('');
    let buscar = $state(''),
        filtroEmpresa = $state(''),
        filtroEstado = $state(''),
        filtroTipo = $state('');
    let pagina = $state(1),
        limite = 10;
    let modal = $state<'empresa' | 'horario' | null>(null),
        borrando = $state<{ tipo: 'empresa' | 'horario'; id: number; nombre: string } | null>(null);
    const emptyEmpresa = () => ({ nombre: '', telefono: '', sitio_web: '' });
    type HorarioForm = Omit<Horario, 'id' | 'empresa' | 'hora_llegada' | 'precio'> & { hora_llegada: string; precio: string };
    const emptyHorario = (): HorarioForm => ({
        id_empresa: 0,
        origen: '',
        destino: '',
        hora_salida: '08:00',
        hora_llegada: '',
        dias: 'Lunes a viernes',
        tipo_servicio: 'DEPARTAMENTAL',
        precio: '',
        estado: 'PUBLICADO',
    });
    let empresaForm = $state(emptyEmpresa());
    let horarioForm = $state(emptyHorario());
    let editId = $state<number | null>(null);
    let filtradosEmpresas = $derived(empresas.filter((x) => `${x.nombre} ${x.telefono ?? ''}`.toLowerCase().includes(buscar.toLowerCase())));
    let filtradosHorarios = $derived(
        horarios.filter((x) => {
            const term = `${x.origen} ${x.destino} ${x.empresa?.nombre ?? ''} ${x.dias}`.toLowerCase();
            return (
                term.includes(buscar.toLowerCase()) &&
                (!filtroEmpresa || x.id_empresa === Number(filtroEmpresa)) &&
                (!filtroEstado || x.estado === filtroEstado) &&
                (!filtroTipo || x.tipo_servicio === filtroTipo)
            );
        })
    );
    let lista = $derived(tab === 'empresas' ? filtradosEmpresas : filtradosHorarios);
    let totalPaginas = $derived(Math.max(1, Math.ceil(lista.length / limite)));
    let paginaActual = $derived(Math.min(pagina, totalPaginas));
    let paginaEmpresas = $derived(filtradosEmpresas.slice((paginaActual - 1) * limite, paginaActual * limite));
    let paginaHorarios = $derived(filtradosHorarios.slice((paginaActual - 1) * limite, paginaActual * limite));
    let activos = $derived(horarios.filter((x) => x.estado === 'PUBLICADO').length);
    async function request(url: string, init?: RequestInit) {
        const r = await fetch(url, { credentials: 'include', ...init });
        if (!r.ok) {
            if (r.status === 401 || r.status === 403) throw new Error('Tu sesión no tiene permisos de administrador. Volvé a iniciar sesión.');
            if (r.status === 409) throw new Error('No se puede realizar la operación: hay datos asociados o duplicados.');
            const data = await r.json().catch(() => ({}));
            throw new Error(data.message || data.error || 'No se pudo completar la operación.');
        }
        return r.json();
    }
    async function cargar() {
        cargando = true;
        error = '';
        try {
            const [e, h] = await Promise.all([request('/api/transporte/empresas'), request('/api/transporte/horarios/admin')]);
            empresas = e.empresas;
            horarios = h.horarios;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error de conexión';
        } finally {
            cargando = false;
        }
    }
    onMount(cargar);
    function cambiarTab(n: 'empresas' | 'horarios') {
        tab = n;
        buscar = '';
        pagina = 1;
        error = '';
        aviso = '';
    }
    function abrirEmpresa(e?: Empresa) {
        editId = e?.id ?? null;
        empresaForm = { nombre: e?.nombre ?? '', telefono: e?.telefono ?? '', sitio_web: e?.sitio_web ?? '' };
        modal = 'empresa';
        error = '';
    }
    function abrirHorario(h?: Horario) {
        editId = h?.id ?? null;
        horarioForm = {
            id_empresa: h?.id_empresa ?? empresas[0]?.id ?? 0,
            origen: h?.origen ?? '',
            destino: h?.destino ?? '',
            hora_salida: h?.hora_salida ?? '08:00',
            hora_llegada: h?.hora_llegada ?? '',
            dias: h?.dias ?? 'Lunes a viernes',
            tipo_servicio: h?.tipo_servicio ?? 'DEPARTAMENTAL',
            precio: h?.precio == null ? '' : String(h.precio),
            estado: h?.estado ?? 'PUBLICADO',
        };
        modal = 'horario';
        error = '';
    }
    async function guardarEmpresa(ev: SubmitEvent) {
        ev.preventDefault();
        if (guardando) return;
        guardando = true;
        error = '';
        try {
            const payload = { nombre: empresaForm.nombre.trim(), telefono: empresaForm.telefono.trim() || null, sitio_web: empresaForm.sitio_web.trim() || null };
            const updated = await request(editId ? `/api/transporte/empresas/${editId}` : '/api/transporte/empresas', {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (editId) empresas = empresas.map((e) => (e.id === editId ? { ...e, ...updated } : e));
            else empresas = [...empresas, { ...updated, _count: { horarios: 0 } }].sort((a, b) => a.nombre.localeCompare(b.nombre));
            aviso = editId ? 'Empresa actualizada.' : 'Empresa creada.';
            modal = null;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error al guardar';
        } finally {
            guardando = false;
        }
    }
    async function guardarHorario(ev: SubmitEvent) {
        ev.preventDefault();
        if (guardando) return;
        guardando = true;
        error = '';
        try {
            const payload = {
                ...horarioForm,
                id_empresa: Number(horarioForm.id_empresa),
                hora_llegada: horarioForm.hora_llegada || null,
                precio: horarioForm.precio === '' ? null : Number(horarioForm.precio),
            };
            const updated: Horario = await request(editId ? `/api/transporte/horarios/${editId}` : '/api/transporte/horarios', {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (editId) horarios = horarios.map((h) => (h.id === editId ? updated : h));
            else horarios = [updated, ...horarios];
            // Recalcular contador para mostrar el cambio sin recargar.
            empresas = empresas.map((e) => ({ ...e, _count: { horarios: horarios.filter((h) => h.id_empresa === e.id).length } }));
            aviso = editId ? 'Horario actualizado.' : 'Horario creado.';
            modal = null;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error al guardar';
        } finally {
            guardando = false;
        }
    }
    async function eliminar() {
        if (!borrando || guardando) return;
        guardando = true;
        error = '';
        try {
            await request(`/api/transporte/${borrando.tipo === 'empresa' ? 'empresas' : 'horarios'}/${borrando.id}`, { method: 'DELETE' });
            if (borrando.tipo === 'empresa') empresas = empresas.filter((e) => e.id !== borrando?.id);
            else {
                horarios = horarios.filter((h) => h.id !== borrando?.id);
                empresas = empresas.map((e) => ({ ...e, _count: { horarios: horarios.filter((h) => h.id_empresa === e.id).length } }));
            }
            aviso = 'Registro eliminado correctamente.';
            borrando = null;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error al eliminar';
        } finally {
            guardando = false;
        }
    }
    async function alternar(h: Horario) {
        error = '';
        try {
            const estado = h.estado === 'PUBLICADO' ? 'OCULTADO' : 'PUBLICADO';
            const nuevo = await request(`/api/transporte/horarios/${h.id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado }),
            });
            horarios = horarios.map((x) => (x.id === h.id ? { ...x, ...nuevo } : x));
            aviso = 'Estado actualizado.';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Error al cambiar estado';
        }
    }
</script>

<svelte:head><title>Gestión de transporte | Cerro Largo 360</title></svelte:head>
<div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <p class="text-sm font-semibold text-emerald-700">ADMINISTRACIÓN</p>
            <h1 class="text-3xl font-bold text-slate-800">Gestión de transporte</h1>
            <p class="mt-1 text-sm text-slate-500">Empresas y horarios de ómnibus de Cerro Largo</p>
        </div>
        <button
            onclick={() => (tab === 'empresas' ? abrirEmpresa() : abrirHorario())}
            disabled={tab === 'horarios' && !empresas.length}
            class="rounded-xl bg-[#285f4d] px-5 py-3 font-semibold text-white hover:bg-[#1d4c3d] disabled:opacity-50"
            >+ {tab === 'empresas' ? 'Nueva empresa' : 'Nuevo horario'}</button
        >
    </div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Empresas</p>
            <p class="text-3xl font-bold text-slate-800">{empresas.length}</p>
        </div>
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Horarios registrados</p>
            <p class="text-3xl font-bold text-slate-800">{horarios.length}</p>
        </div>
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Horarios publicados</p>
            <p class="text-3xl font-bold text-emerald-700">{activos}</p>
        </div>
    </div>
    <div class="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div class="border-b p-4">
            <div class="flex flex-wrap gap-2">
                <button onclick={() => cambiarTab('horarios')} class={`rounded-lg px-4 py-2 font-medium ${tab === 'horarios' ? 'bg-[#285f4d] text-white' : 'bg-slate-100'}`}
                    >Horarios</button
                ><button onclick={() => cambiarTab('empresas')} class={`rounded-lg px-4 py-2 font-medium ${tab === 'empresas' ? 'bg-[#285f4d] text-white' : 'bg-slate-100'}`}
                    >Empresas</button
                >
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
                <input
                    aria-label="Buscar"
                    placeholder="Buscar por empresa, origen o destino"
                    class="min-w-52 flex-1 rounded-lg border px-3 py-2"
                    bind:value={buscar}
                    oninput={() => (pagina = 1)}
                />{#if tab === 'horarios'}<select aria-label="Filtrar empresa" class="rounded-lg border px-3 py-2" bind:value={filtroEmpresa} onchange={() => (pagina = 1)}
                        ><option value="">Todas las empresas</option>{#each empresas as e}<option value={e.id}>{e.nombre}</option>{/each}</select
                    ><select aria-label="Filtrar estado" class="rounded-lg border px-3 py-2" bind:value={filtroEstado} onchange={() => (pagina = 1)}
                        ><option value="">Todos los estados</option><option value="PUBLICADO">Publicado</option><option value="OCULTADO">Oculto</option></select
                    ><select aria-label="Filtrar tipo" class="rounded-lg border px-3 py-2" bind:value={filtroTipo} onchange={() => (pagina = 1)}
                        ><option value="">Todos los servicios</option><option value="DEPARTAMENTAL">Departamental</option><option value="INTERDEPARTAMENTAL"
                            >Interdepartamental</option
                        ></select
                    >{/if}
            </div>
        </div>
        {#if aviso}<p transition:fade={{ duration: 160 }} role="status" class="m-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{aviso}</p>{/if}
        {#if error}<p role="alert" class="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>{/if}
        {#if cargando}<p class="p-8 text-center text-slate-500">Cargando transporte...</p>{:else if !lista.length}<div class="p-12 text-center text-slate-500">
                No se encontraron registros. {#if !empresas.length}Comenzá creando una empresa.{/if}
            </div>{:else}<div class="overflow-x-auto">
                <table class="w-full min-w-187.5 text-left text-sm">
                    <thead class="bg-slate-50 text-slate-600"
                        ><tr
                            >{#if tab === 'empresas'}<th class="p-4">Empresa</th><th class="p-4">Teléfono</th><th class="p-4">Sitio web</th><th class="p-4">N.º horarios</th
                                >{:else}<th class="p-4">Empresa</th><th class="p-4">Origen → destino</th><th class="p-4">Salida / llegada</th><th class="p-4">Días</th><th
                                    class="p-4">Servicio</th
                                ><th class="p-4">Precio</th><th class="p-4">Estado</th>{/if}<th class="p-4 text-right">Acciones</th></tr
                        ></thead
                    ><tbody
                        >{#if tab === 'empresas'}{#each paginaEmpresas as e (e.id)}<tr out:fly={{ x: -12, duration: 220 }} class="border-t hover:bg-slate-50"
                                    ><td class="p-4 font-semibold">{e.nombre}</td><td class="p-4">{e.telefono || '—'}</td><td class="p-4"
                                        >{#if e.sitio_web}<a class="text-emerald-700 underline" href={e.sitio_web} target="_blank" rel="noopener noreferrer">Visitar</a
                                            >{:else}—{/if}</td
                                    ><td class="p-4">{e._count?.horarios ?? horarios.filter((h) => h.id_empresa === e.id).length}</td><td class="p-4"
                                        ><div class="flex justify-end gap-3">
                                            <button class="text-emerald-700 hover:underline" onclick={() => abrirEmpresa(e)}>Editar</button><button
                                                class="text-red-700 hover:underline"
                                                onclick={() => {
                                                    borrando = { tipo: 'empresa', id: e.id, nombre: e.nombre };
                                                    error = '';
                                                }}>Eliminar</button
                                            >
                                        </div></td
                                    ></tr
                                >{/each}{:else}{#each paginaHorarios as h (h.id)}<tr out:fly={{ x: -12, duration: 220 }} class="border-t hover:bg-slate-50"
                                    ><td class="p-4 font-medium">{h.empresa?.nombre}</td><td class="p-4">{h.origen} → {h.destino}</td><td class="p-4"
                                        >{h.hora_salida} / {h.hora_llegada || '—'}</td
                                    ><td class="p-4">{h.dias}</td><td class="p-4">{h.tipo_servicio === 'DEPARTAMENTAL' ? 'Departamental' : 'Interdepartamental'}</td><td class="p-4"
                                        >{h.precio == null ? '—' : `$ ${h.precio}`}</td
                                    ><td class="p-4"
                                        ><button
                                            title="Cambiar estado"
                                            onclick={() => alternar(h)}
                                            class={`rounded-full px-3 py-1 text-xs font-semibold ${h.estado === 'PUBLICADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}
                                            >{h.estado === 'PUBLICADO' ? 'Publicado' : 'Oculto'}</button
                                        ></td
                                    ><td class="p-4"
                                        ><div class="flex justify-end gap-3">
                                            <button class="text-emerald-700 hover:underline" onclick={() => abrirHorario(h)}>Editar</button><button
                                                class="text-red-700 hover:underline"
                                                onclick={() => {
                                                    borrando = { tipo: 'horario', id: h.id, nombre: `${h.origen} → ${h.destino}` };
                                                    error = '';
                                                }}>Eliminar</button
                                            >
                                        </div></td
                                    ></tr
                                >{/each}{/if}</tbody
                    >
                </table>
            </div>{/if}
        <div class="flex items-center justify-between gap-3 border-t p-4 text-sm">
            <span class="text-slate-500">{lista.length} registro(s) · Página {paginaActual} de {totalPaginas}</span>
            <div class="flex gap-2">
                <button class="rounded-lg border px-3 py-1.5 disabled:opacity-40" disabled={paginaActual <= 1} onclick={() => (pagina = Math.max(1, pagina - 1))}>Anterior</button
                ><button
                    class="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                    disabled={paginaActual >= totalPaginas}
                    onclick={() => (pagina = Math.min(totalPaginas, pagina + 1))}>Siguiente</button
                >
            </div>
        </div>
    </div>
</div>
{#if modal}<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" transition:fade={{ duration: 130 }} role="presentation">
        <div
            class="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            in:fly={{ y: 12, duration: 170 }}
            role="dialog"
            aria-modal="true"
            aria-label={modal === 'empresa' ? 'Formulario de empresa' : 'Formulario de horario'}
        >
            <div class="mb-5 flex justify-between">
                <h2 class="text-xl font-bold">{editId ? 'Editar' : 'Crear'} {modal === 'empresa' ? 'empresa' : 'horario'}</h2>
                <button
                    aria-label="Cerrar"
                    onclick={() => {
                        modal = null;
                        error = '';
                    }}>✕</button
                >
            </div>
            {#if error}<p role="alert" class="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>{/if}{#if modal === 'empresa'}<form
                    onsubmit={guardarEmpresa}
                    class="space-y-4"
                >
                    <label class="block text-sm font-medium"
                        >Nombre *<input class="mt-1 w-full rounded-lg border p-3" bind:value={empresaForm.nombre} required maxlength="150" /></label
                    ><label class="block text-sm font-medium">Teléfono<input class="mt-1 w-full rounded-lg border p-3" bind:value={empresaForm.telefono} maxlength="50" /></label
                    ><label class="block text-sm font-medium"
                        >Sitio web<input type="url" class="mt-1 w-full rounded-lg border p-3" placeholder="https://..." bind:value={empresaForm.sitio_web} /></label
                    >
                    <div class="flex justify-end gap-2">
                        <button type="button" class="rounded-lg border px-4 py-2" onclick={() => (modal = null)}>Cancelar</button><button
                            disabled={guardando}
                            class="rounded-lg bg-[#285f4d] px-4 py-2 text-white disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar empresa'}</button
                        >
                    </div>
                </form>{:else}<form onsubmit={guardarHorario} class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label class="text-sm font-medium sm:col-span-2"
                        >Empresa *<select required class="mt-1 w-full rounded-lg border p-3" bind:value={horarioForm.id_empresa}
                            >{#each empresas as e}<option value={e.id}>{e.nombre}</option>{/each}</select
                        ></label
                    ><label class="text-sm font-medium">Origen *<input required maxlength="150" class="mt-1 w-full rounded-lg border p-3" bind:value={horarioForm.origen} /></label
                    ><label class="text-sm font-medium"
                        >Destino *<input required maxlength="150" class="mt-1 w-full rounded-lg border p-3" bind:value={horarioForm.destino} /></label
                    ><label class="text-sm font-medium">Salida *<input type="time" required class="mt-1 w-full rounded-lg border p-3" bind:value={horarioForm.hora_salida} /></label
                    ><label class="text-sm font-medium">Llegada<input type="time" class="mt-1 w-full rounded-lg border p-3" bind:value={horarioForm.hora_llegada} /></label><label
                        class="text-sm font-medium sm:col-span-2"
                        >Días de circulación *<input
                            required
                            maxlength="100"
                            placeholder="Ej.: Lunes a viernes"
                            class="mt-1 w-full rounded-lg border p-3"
                            bind:value={horarioForm.dias}
                        /></label
                    ><label class="text-sm font-medium"
                        >Servicio<select class="mt-1 w-full rounded-lg border p-3" bind:value={horarioForm.tipo_servicio}
                            ><option value="DEPARTAMENTAL">Departamental</option><option value="INTERDEPARTAMENTAL">Interdepartamental</option></select
                        ></label
                    ><label class="text-sm font-medium"
                        >Precio (UYU)<input type="number" min="0" step="0.01" class="mt-1 w-full rounded-lg border p-3" bind:value={horarioForm.precio} /></label
                    ><label class="text-sm font-medium sm:col-span-2"
                        >Estado<select class="mt-1 w-full rounded-lg border p-3" bind:value={horarioForm.estado}
                            ><option value="PUBLICADO">Publicado</option><option value="OCULTADO">Oculto</option></select
                        ></label
                    >
                    <div class="flex justify-end gap-2 sm:col-span-2">
                        <button type="button" class="rounded-lg border px-4 py-2" onclick={() => (modal = null)}>Cancelar</button><button
                            disabled={guardando}
                            class="rounded-lg bg-[#285f4d] px-4 py-2 text-white disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar horario'}</button
                        >
                    </div>
                </form>{/if}
        </div>
    </div>{/if}
{#if borrando}<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" transition:fade={{ duration: 150 }} role="presentation">
        <div role="alertdialog" aria-modal="true" aria-label="Confirmar eliminación" class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" in:fly={{ y: 10, duration: 180 }}>
            <h2 class="text-xl font-bold">¿Eliminar {borrando.tipo}?</h2>
            <p class="mt-3 text-slate-600">Se eliminará <strong>{borrando.nombre}</strong>. Esta acción no se puede deshacer.</p>
            {#if error}<p class="mt-3 text-sm text-red-700" role="alert">{error}</p>{/if}
            <div class="mt-6 flex justify-end gap-2">
                <button
                    class="rounded-lg border px-4 py-2"
                    disabled={guardando}
                    onclick={() => {
                        borrando = null;
                        error = '';
                    }}>Cancelar</button
                ><button class="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50" disabled={guardando} onclick={eliminar}
                    >{guardando ? 'Eliminando...' : 'Eliminar'}</button
                >
            </div>
        </div>
    </div>{/if}
