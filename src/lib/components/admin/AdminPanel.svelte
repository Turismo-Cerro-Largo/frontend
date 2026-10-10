<script lang="ts">
    import { page } from '$app/state';
    import { untrack } from 'svelte';
    import { adminRequest, type AdminSnapshot } from '$lib/admin/live';
    let { initialSnapshot }: { initialSnapshot?: AdminSnapshot } = $props();
    const live = $derived(initialSnapshot !== undefined);
    let reviewing = $state(false);
    async function reloadData() {
        const result = await adminRequest('/datos') as AdminSnapshot;
        records = result.records; places = result.places; decisions = {};
    }
    import { navigation, sections, isPending, type DemoRow } from '$lib/admin/demo';
    import Icon from './AdminIcon.svelte';
    import './admin.css';
    import PlaceManager from './PlaceManager.svelte';
    import { examplePlaces, type DemoPlace } from '$lib/admin/places';
    import RecordManager from './RecordManager.svelte';
    import EventCalendar from './EventCalendar.svelte';
    import { initialRecords, definitions, type RecordRow } from '$lib/admin/management';

    let records = $state(untrack(() => initialSnapshot?.records ?? initialRecords()));
    let places = $state<DemoPlace[]>(untrack(() => initialSnapshot?.places ?? examplePlaces()));
    let recordManager: RecordManager;
    let showCalendar = $state(false);
    const destinations = $derived([
        ...places.map((place) => ({ id: 'lugares:' + place.id, nombre: 'Lugar: ' + place.nombre })),
        ...records.eventos.map((event) => ({ id: 'eventos:' + event.id, nombre: 'Evento: ' + event.nombre })),
    ]);
    const selectedOrganizer = $derived(records.organizadores.find((row)=>row.id===selected?.id));
    const selectedEvent = $derived(records.eventos.find((event) => event.id === selected?.id));
    async function saveRecord(section: string, row: RecordRow, file?: File) {
        if (live) {
            const exists=records[section].some((item)=>item.id===row.id);
            if(section==='comentarios') await adminRequest('/comentarios/'+row.id+'/estado','PATCH',{estado:row.estado});
            else if(section==='multimedia') {
                const form=new FormData();
                for(const key of ['nombre','descripcion','destino']) form.set(key,row.data[key]??'');
                if(file) form.set('archivo',file);
                await adminRequest('/multimedia'+(exists?'/'+row.id:''),exists?'PUT':'POST',form);
            } else await adminRequest('/'+section+(exists?'/'+row.id:''),exists?'PUT':'POST',{data:row.data});
            await reloadData(); search=''; status='Todos'; feedback='Cambios guardados en la base de datos.'; return;
        }
        const previous = records[section].find((item) => item.id === row.id);
        if (section === 'categorias' && previous) places = places.map((place) => (place.detalle === previous.nombre ? { ...place, detalle: row.nombre } : place));
        records[section] = previous ? records[section].map((item) => (item.id === row.id ? row : item)) : [...records[section], row];
        search = '';
        status = 'Todos';
        feedback = 'Simulación: «' + row.nombre + '» guardado. No se modificó la base de datos.';
    }
    async function removeRecord(section: string, id: string) {
        if(live) { await adminRequest('/'+section+'/'+id,'DELETE'); await reloadData(); feedback='Registro eliminado.'; return; }
        records[section] = records[section].filter((item) => item.id !== id);
        search = '';
        status = 'Todos';
        feedback = 'Registro eliminado de los datos de ejemplo. No se modificó la base de datos.';
    }
    function createRecord() {
        if (active?.id === 'lugares') placeManager.open();
        else if (active && definitions[active.id]) recordManager.open(active.id);
    }
    function manageEvent() {
        if (!selectedEvent) return;
        const row = { ...selectedEvent, estado: currentRow(selectedEvent).estado };
        dialog.close();
        selected = null;
        recordManager.open('eventos', row);
    }

    let placeManager: PlaceManager;
    const categories = $derived(records.categorias.map((row) => row.nombre));
    async function savePlace(place: DemoPlace) {
        if(live) {
            const exists=places.some((item)=>item.id===place.id);
            await adminRequest('/lugares'+(exists?'/'+place.id:''),exists?'PUT':'POST',place);
            await reloadData(); search=''; status='Todos'; feedback='Lugar guardado en la base de datos.'; return;
        }
        const exists = places.some((item) => item.id === place.id);
        places = exists ? places.map((item) => (item.id === place.id ? place : item)) : [...places, place];
        search = '';
        status = 'Todos';
        feedback = `Simulación: «${place.nombre}» ${exists ? 'actualizado' : 'creado'}. No se modificó la base de datos.`;
    }
    async function removePlace(id: string) {
        if(live) { await adminRequest('/lugares/'+id,'DELETE'); await reloadData(); feedback='Lugar eliminado.'; return; }
        if (records.multimedia.some((item) => item.data.destino === 'lugares:' + id)) {
            feedback = 'No se eliminó el lugar de ejemplo. Retirá o reasigná primero sus recursos en Imágenes y videos.';
            return;
        }
        const name = places.find((item) => item.id === id)?.nombre ?? 'Lugar';
        places = places.filter((item) => item.id !== id);
        search = '';
        status = 'Todos';
        feedback = `Simulación: «${name}» eliminado de la lista de ejemplo. No se modificó la base de datos.`;
    }

    let menuOpen = $state(false);
    let search = $state('');
    let status = $state('Todos');
    let selected = $state<DemoRow | null>(null);
    let dialog: HTMLDialogElement;
    type Decision = { estado: string; motivo: string };
    let decisions = $state<Record<string, Decision>>({});
    let reviewMode = $state<'detail' | 'approve' | 'reject'>('detail');
    let reason = $state('');
    let reasonError = $state('');
    let feedback = $state('');
    function currentRow(row: DemoRow): DemoRow {
        return { ...row, estado: decisions[row.id]?.estado ?? row.estado };
    }
    const events = $derived(records.eventos.map((row) => ({ ...row, estado: currentRow(row).estado })));
    const pendingReviews = $derived(records.comentarios.filter((row) => isPending(row.estado)));
    const organizers = $derived(records.organizadores.map(currentRow));
    const pendingEvents = $derived(events.filter((row) => isPending(row.estado)));
    const pendingOrganizers = $derived(organizers.filter((row) => isPending(row.estado)));
    const active = $derived.by(() => {
        const section = navigation.find((item) => item.id === page.url.searchParams.get('seccion'));
        if (!section) return undefined;
        let filas: DemoRow[] = section.id === 'lugares' ? places : section.id === 'pendientes' ? pendingEvents : (records[section.id] ?? section.filas).map(currentRow);
        if (section.id === 'multimedia')
            filas = records.multimedia.map((row) => ({ ...row, detalle: destinations.find((item) => item.id === row.data.destino)?.nombre ?? 'Referencia no disponible' }));
        if (section.id === 'horarios')
            filas = records.horarios.map((row) => ({ ...row, detalle: (records.transporte.find((item) => item.id === row.data.empresa)?.nombre ?? '') + ' · ' + row.data.dias }));
        return { ...section, filas: filas, columnas: section.id === 'transporte' ? ['Empresa', 'Teléfono', 'Sitio web'] : section.columnas };
    });
    const canReview = $derived(selected && isPending(selected.estado) && (selected.id.startsWith('E-') || selected.id.startsWith('O-')));
    const isOrganizer = $derived(selected?.id.startsWith('O-') ?? false);
    const title = $derived(active?.nombre ?? 'Resumen general');
    const statuses = $derived([
        ...new Set([
            ...(active?.filas.map((row) => row.estado) ?? []),
            ...(['eventos', 'pendientes', 'comentarios'].includes(active?.id ?? '')
                ? ['Pendiente de revisión']
                : active?.id === 'organizadores'
                  ? ['Pendiente de verificación']
                  : []),
        ]),
    ]);
    const rows = $derived(
        (active?.filas ?? []).filter(
            (row) => (status === 'Todos' || row.estado === status) && Object.values(row).join(' ').toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es'))
        )
    );
    const stats = $derived([
        { label: 'Usuarios registrados', value: records.usuarios.length, icon: 'people', section: 'usuarios' },
        { label: 'Lugares turísticos', value: places.length, icon: 'pin', section: 'lugares' },
        { label: 'Eventos publicados', value: events.filter((r) => r.estado === 'Publicado').length, icon: 'calendar', section: 'eventos' },
        { label: 'Revisiones pendientes', value: pendingEvents.length + pendingOrganizers.length + pendingReviews.length, icon: 'clock', section: 'pendientes' },
    ]);
    const pending = $derived([
        { label: 'Eventos por aprobar', description: 'Revisá la información antes de publicarlos.', count: pendingEvents.length, section: 'pendientes', icon: 'calendar' },
        {
            label: 'Solicitudes de organizadores',
            description: 'Conocé a quienes quieren organizar actividades.',
            count: pendingOrganizers.length,
            section: 'organizadores',
            icon: 'people',
        },
        { label: 'Comentarios por moderar', description: 'Revisá las experiencias de los visitantes.', count: pendingReviews.length, section: 'comentarios', icon: 'message' },
    ]);
    function navigate() {
        menuOpen = false;
        search = '';
        status = 'Todos';
        selected = null;
        dialog?.close();
    }
    function details(row: DemoRow) {
        reasonError="";
        const place = places.find((item) => item.id === row.id);
        if (place) {
            placeManager.open(place);
            return;
        }
        const managedSection = Object.keys(definitions).find((key) => key !== 'eventos' && records[key]?.some((item) => item.id === row.id));
        if (managedSection) {
            recordManager.open(
                managedSection,
                records[managedSection].find((item) => item.id === row.id)
            );
            return;
        }
        selected = currentRow(row);
        reviewMode = 'detail';
        reason = '';
        reasonError = '';
        dialog.showModal();
    }
    async function decide(event: SubmitEvent) {
        event.preventDefault();
        if (!selected || !canReview || reviewMode === 'detail' || decisions[selected.id]) return;
        if(reviewing) return;
        const rejection = reviewMode === 'reject';
        if (rejection && reason.trim().length > 500) {
            reasonError = 'El motivo puede tener hasta 500 caracteres.';
            return;
        }
        const estado = rejection ? 'Rechazado' : isOrganizer ? 'Aprobado' : 'Publicado';
        if(live) {
            reviewing=true; reasonError='';
            try {
                await adminRequest('/decisiones/'+(isOrganizer?'organizadores':'eventos')+'/'+selected.id,'POST',{estado,motivo:rejection?reason.trim():''});
                await reloadData(); feedback='Decisión guardada en la base de datos.'; dialog.close(); selected=null; reviewMode='detail';
            } catch(error) { reasonError=error instanceof Error?error.message:'No se pudo guardar la decisión.'; }
            finally { reviewing=false; }
            return;
        }
        decisions = { ...decisions, [selected.id]: { estado, motivo: rejection ? reason.trim() : '' } };
        feedback = 'Simulación: «' + selected.nombre + '» quedó en estado ' + estado.toLowerCase() + '. No se modificó la base de datos.';
        dialog.close();
        selected = null;
        reviewMode = 'detail';
    }
    function tone(value: string) {
        return ['Publicado', 'Activo', 'Activa', 'Aprobado'].includes(value) ? 'positive' : isPending(value) ? 'pending' : 'neutral';
    }
    $effect(() => {
        page.url.search;
        placeManager?.close();
        recordManager?.close();
        search = '';
        status = 'Todos';
        selected = null;
        dialog?.close();
    });
</script>

<svelte:head><title>{title} · Administración | Cerro Largo 360</title><meta name="robots" content="noindex, nofollow" /></svelte:head>

<div class="admin-app">
    <a class="admin-skip" href="#admin-main">Saltar al contenido</a>
    <aside class:open={menuOpen} class="admin-sidebar" aria-label="Panel de administración">
        <a class="admin-brand" href="?" onclick={navigate}
            ><span class="brand-mark"><Icon name="mountain" size={28} /></span><span>Cerro Largo <b>360</b><small>ADMINISTRACIÓN</small></span></a
        >
        <div class="sidebar-label">PLATAFORMA</div>
        <nav aria-label="Administración" id="admin-navigation">
            <a class:current={!active} href="?" onclick={navigate} aria-current={!active ? 'page' : undefined}><Icon name="grid" />Resumen general</a>
            {#each navigation as item}
                <a class:current={active?.id === item.id} href={`?seccion=${item.id}`} onclick={navigate} aria-current={active?.id === item.id ? 'page' : undefined}
                    ><Icon name={item.icono} /><span>{item.nombre}</span>{#if item.id === 'pendientes'}<span class="nav-count">{pendingEvents.length}</span>{/if}</a
                >
            {/each}
        </nav>
        <div class="sidebar-bottom">
            <Icon name="shield" />
            <div>Espacio de administración<small>Acceso reservado por rol</small></div>
        </div>
        <a class="back-site" href="/">Volver al sitio público <Icon name="arrow" size={16} /></a>
    </aside>

    <div class="admin-body">
        <header class="admin-topbar">
            <button
                class="menu-toggle"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
                aria-controls="admin-navigation"
                onclick={() => (menuOpen = !menuOpen)}><Icon name="menu" /></button
            >
            <span class="breadcrumb">Administración <span>/</span> <strong>{title}</strong></span>
            <span class="admin-profile"><span class="avatar">A</span><span>Administrador<small>{live ? "Sesión administrativa" : "Vista de diseño"}</small></span></span>
        </header>

        <main id="admin-main" class="admin-main">
            <div class="demo-notice">
                <span class="demo-dot"></span>
                <p><strong>{live ? "Conectado al backend." : "Vista de ejemplo."}</strong> {live ? "Las acciones se guardan en la base de datos. Revisá la información antes de confirmar." : "Los datos son ficticios. Las acciones se reinician al recargar."}</p>
            </div>
            <div class="review-feedback" role="status" aria-live="polite">
                {#if feedback}<p>{feedback}</p>
                    <button aria-label="Cerrar aviso" onclick={() => (feedback = '')}>✕</button>{/if}
            </div>
            <div class="page-heading">
                <div>
                    <p class="eyebrow">CERRO LARGO, EN UN SOLO LUGAR</p>
                    <h1>{title}</h1>
                    <p class="page-description">{active?.descripcion ?? 'Una mirada a la plataforma y a lo que necesita tu atención.'}</p>
                </div>
                {#if active?.accion}<button class="admin-button" title="Crear registro" onclick={createRecord}>+ {active.accion}</button>{:else if !active}<a
                        class="admin-button"
                        href="?seccion=pendientes"
                        onclick={navigate}>Revisar pendientes <Icon name="arrow" size={17} /></a
                    >{/if}
            </div>

            {#if active?.id === 'eventos'}
                <div class="calendar-switch">
                    <button class="detail-button" aria-expanded={showCalendar} onclick={() => (showCalendar = !showCalendar)}
                        >{showCalendar ? 'Ocultar calendario' : 'Ver calendario'}</button
                    >
                </div>
                {#if showCalendar}<EventCalendar {events} onopen={details} />{/if}
            {/if}
            {#if !active}
                <section class="stats-grid" aria-label="Estadísticas de la plataforma">
                    {#each stats as stat}<a class="stat-card" href={`?seccion=${stat.section}`} onclick={navigate}
                            ><div><span class="stat-label">{stat.label}</span><span class="stat-number">{stat.value}</span><small>{live ? "Registros en la plataforma" : "Registros de ejemplo"}</small></div>
                            <span class="stat-icon"><Icon name={stat.icon} size={23} /></span></a
                        >{/each}
                </section>
                <div class="overview-grid">
                    <section class="admin-card attention-card">
                        <div class="card-heading">
                            <div>
                                <h2>Necesita tu atención</h2>
                                <p>Solicitudes y contenido pendientes de revisión.</p>
                            </div>
                            <span class="badge pending">{stats[3].value} pendientes</span>
                        </div>
                        <div class="pending-list">
                            {#each pending as item}<a href={`?seccion=${item.section}`} onclick={navigate}
                                    ><span class="pending-icon"><Icon name={item.icon} /></span><span class="pending-text"
                                        ><strong>{item.label}</strong><small>{item.description}</small></span
                                    ><b>{item.count}</b><Icon name="arrow" size={18} /></a
                                >{/each}
                        </div>
                    </section>
                    <section class="welcome-card">
                        <span class="welcome-icon"><Icon name="mountain" size={40} /></span>
                        <p class="eyebrow">CUIDAMOS CADA EXPERIENCIA</p>
                        <h2>Un destino que se construye entre todos.</h2>
                        <p>Mantené la información al día y ayudá a los visitantes a descubrir Cerro Largo.</p>
                        <a href="?seccion=lugares" onclick={navigate}>Explorar lugares <Icon name="arrow" size={18} /></a>
                    </section>
                </div>
                <section class="admin-card">
                    <div class="card-heading">
                        <div>
                            <h2>Eventos para revisar</h2>
                            <p>Una vista previa de la bandeja de aprobación.</p>
                        </div>
                        <a class="text-link" href="?seccion=pendientes" onclick={navigate}>Ver todos <Icon name="arrow" size={16} /></a>
                    </div>
                    <div class="table-scroll">
                        <table>
                            <caption class="sr-only">Eventos pendientes</caption><thead
                                ><tr><th>Evento</th><th>Organizador</th><th>Fecha</th><th>Estado</th><th><span class="sr-only">Acciones</span></th></tr></thead
                            ><tbody
                                >{#each pendingEvents as row}<tr
                                        ><td><strong>{row.nombre}</strong><small>{row.id}</small></td><td>{row.detalle}</td><td>{row.extra}</td><td><span class="badge pending">{row.estado}</span></td><td
                                            ><button class="detail-button" onclick={() => details(row)}
                                                >{isPending(row.estado) && (row.id.startsWith('E-') || row.id.startsWith('O-')) ? 'Revisar solicitud' : 'Ver detalle'}
                                                <span class="sr-only">de {row.nombre}</span></button
                                            ></td
                                        ></tr
                                    >{:else}<tr
                                        ><td colspan="5"
                                            ><div class="empty-state">
                                                <h2>Todo al día</h2>
                                                <p>No quedan eventos pendientes de revisión.</p>
                                            </div></td
                                        ></tr
                                    >{/each}</tbody
                            >
                        </table>
                    </div>
                </section>
            {:else}
                <section class="admin-card">
                    <div class="table-tools">
                        <label class="search-field"
                            ><Icon name="search" size={19} /><input
                                aria-label={`Buscar en ${active.nombre}`}
                                placeholder="Buscar por nombre o información…"
                                bind:value={search}
                            /></label
                        ><label class="status-filter"
                            >Estado <select bind:value={status}
                                ><option>Todos</option>{#each statuses as option}<option>{option}</option>{/each}</select
                            ></label
                        >
                    </div>
                    <div class="table-scroll">
                        <table>
                            <caption class="sr-only">{active.nombre}</caption><thead
                                ><tr
                                    >{#each active.columnas as col}<th>{col}</th>{/each}<th>Estado</th><th><span class="sr-only">Acciones</span></th></tr
                                ></thead
                            ><tbody
                                >{#each rows as row}<tr
                                        ><td><strong>{row.nombre}</strong><small>{row.id}</small></td><td>{row.detalle}</td>{#if active?.id !== 'categorias'}<td>{row.extra}</td
                                            >{/if}<td><span class={`badge ${tone(row.estado)}`}>{row.estado}</span></td><td
                                            ><button class="detail-button" onclick={() => details(row)}
                                                >{isPending(row.estado) && (row.id.startsWith('E-') || row.id.startsWith('O-')) ? 'Revisar solicitud' : 'Ver detalle'}
                                                <span class="sr-only">de {row.nombre}</span></button
                                            ></td
                                        ></tr
                                    >{:else}<tr
                                        ><td colspan={active?.id === 'categorias' ? 4 : 5}
                                            ><div class="empty-state">
                                                <Icon name="search" size={30} />
                                                <h2>{active.id === 'pendientes' && active.filas.length === 0 ? 'Todo al día' : 'No hay resultados'}</h2>
                                                <p>
                                                    {active.id === 'pendientes' && active.filas.length === 0
                                                        ? 'No quedan eventos pendientes de revisión.'
                                                        : 'Probá con otra búsqueda o cambiá el filtro.'}
                                                </p>
                                                <button
                                                    class="detail-button"
                                                    onclick={() => {
                                                        search = '';
                                                        status = 'Todos';
                                                    }}>Limpiar filtros</button
                                                >
                                            </div></td
                                        ></tr
                                    >{/each}</tbody
                            >
                        </table>
                    </div>
                    <div class="table-footer" aria-live="polite">{rows.length} de {active.filas.length} {live ? "registros" : "registros de ejemplo"}</div>
                </section>
                <div class="connection-note">
                    <Icon name="shield" size={19} />
                    <p>
                        {live && active.id !== 'usuarios' ? 'Los cambios confirmados se guardan en la plataforma.' : active.id === 'usuarios'
                            ? 'La gestión de usuarios se presenta en modo consulta. Los permisos reales se validan en el servidor.'
                            : active.id === 'lugares'
                              ? 'Creá un lugar o abrí su detalle para editarlo, ocultarlo, mostrarlo o eliminarlo. Todo se simula en esta vista.'
                              : 'Podés simular la aprobación o el rechazo de eventos y organizadores. Para guardar cambios reales se necesita conectar el backend.'}
                    </p>
                </div>
            {/if}
            <footer class="admin-footer"><span>Cerro Largo 360 · Panel de administración</span><span>{live ? "Datos de la plataforma" : "Prototipo con datos de ejemplo"}</span></footer>
        </main>
    </div>
</div>

<PlaceManager {live} bind:this={placeManager} {categories} onsave={savePlace} onremove={removePlace} />
<RecordManager {live} bind:this={recordManager} {records} {destinations} onsave={saveRecord} onremove={removeRecord} />

<dialog class="admin-dialog" bind:this={dialog} oncancel={(event) => { if(reviewing) event.preventDefault(); }} onclose={() => (selected = null)} aria-labelledby="detail-title">
    {#if selected}
        <div class="dialog-header"><span class="eyebrow">{live ? "REVISIÓN ADMINISTRATIVA" : "REGISTRO DE EJEMPLO"}</span><button aria-label="Cerrar detalle" disabled={reviewing} onclick={() => dialog.close()}>✕</button></div>
        <h2 id="detail-title">
            {reviewMode === 'approve' ? (isOrganizer ? 'Aprobar organizador' : 'Aprobar y publicar evento') : reviewMode === 'reject' ? 'Rechazar solicitud' : selected.nombre}
        </h2>
        {#if reviewMode === 'detail'}
            <p class="dialog-description">{selected.detalle}</p>
            <dl>
                <div>
                    <dt>Identificador</dt>
                    <dd>{selected.id}</dd>
                </div>
                <div>
                    <dt>Estado</dt>
                    <dd><span class={'badge ' + tone(selected.estado)}>{selected.estado}</span></dd>
                </div>
                <div>
                    <dt>Información adicional</dt>
                    <dd>{selected.extra}</dd>
                </div>
            </dl>
            {#if selectedEvent}
                <h3>Información para la revisión</h3>
                <dl>
                    {#each definitions.eventos.fields.filter((field) => field.key !== 'nombre') as field}<div>
                            <dt>{field.label}</dt>
                            <dd>
                                {field.key === 'categoria'
                                    ? records.categorias.find((row) => row.id === selectedEvent.data.categoria)?.nombre
                                    : selectedEvent.data[field.key] || 'Sin especificar'}
                            </dd>
                        </div>{/each}
                </dl>
                <h3>Fotografías y videos</h3>
                {#each records.multimedia.filter((row) => row.data.destino === 'eventos:' + selectedEvent.id) as media}
                    <p>{media.nombre}</p>
                    {#if media.data.url && media.data.tipo === 'Imagen'}<img class="review-photo" src={media.data.url} alt={media.data.descripcion} />{:else if media.data.url}<a
                            href={media.data.url}
                            target="_blank"
                            rel="noreferrer">Ver video local</a
                        >{/if}
                {:else}<p class="field-help">Sin archivos asociados.</p>{/each}
                <button class="detail-button" onclick={manageEvent}>Gestionar evento: editar o eliminar</button>
            {/if}
            {#if isOrganizer}
                <h3>Datos de la organización</h3>
                <dl>
                    <div>
                        <dt>Empresa, institución o emprendimiento</dt>
                        <dd>{selected.nombre}</dd>
                    </div>
                    <div>
                        <dt>Localidad</dt>
                        <dd>{selected.extra}</dd>
                    </div>
                    <div>
                        <dt>RUT/RUC</dt>
                        <dd>{selectedOrganizer?.data.rut || 'Sin especificar'}</dd>
                    </div>
                    <div>
                        <dt>Correo de contacto</dt>
                        <dd>{selectedOrganizer?.data.email || 'Sin especificar'}</dd>
                    </div>
                    <div>
                        <dt>Teléfono</dt>
                        <dd>{selectedOrganizer?.data.telefono || 'Sin especificar'}</dd>
                    </div>
                </dl>
                <h3>Documentación de identidad</h3>
                <dl>
                    <div>
                        <dt>Cédula: frente</dt>
                        <dd>{#if selectedOrganizer?.data.frente}<a href={selectedOrganizer.data.frente} target="_blank" rel="noreferrer">Abrir documento privado</a>{:else}Sin archivo adjunto{/if}</dd>
                    </div>
                    <div>
                        <dt>Cédula: dorso</dt>
                        <dd>{#if selectedOrganizer?.data.dorso}<a href={selectedOrganizer.data.dorso} target="_blank" rel="noreferrer">Abrir documento privado</a>{:else}Sin archivo adjunto{/if}</dd>
                    </div>
                </dl>
                <p class="dialog-note">
                    {live ? 'Revisá la documentación y los datos antes de aprobar. Los documentos solo son accesibles para administradores.' : 'Esta demostración no verifica documentos ni habilita una cuenta real.'}
                </p>
            {/if}
            {#if decisions[selected.id]?.motivo || selectedOrganizer?.data.motivo || selectedEvent?.data.motivo}<div class="rejection-reason">
                    <h3>Motivo del rechazo</h3>
                    <p>{decisions[selected.id]?.motivo || selectedOrganizer?.data.motivo || selectedEvent?.data.motivo}</p>
                </div>{/if}
            <p class="dialog-note">
                {live ? 'La decisión se guarda en la plataforma.' : canReview
                    ? 'Podés probar la revisión con este registro ficticio. La aprobación o el rechazo solo cambiará esta vista, hasta que recargues la página.'
                    : 'Registro ficticio. Esta vista no modifica datos reales ni envía notificaciones.'}
            </p>
            {#if canReview}
                <div class="review-actions">
                    <button class="reject-button" onclick={() => (reviewMode = 'reject')}>Rechazar</button><button class="admin-button" onclick={() => (reviewMode = 'approve')}
                        >{isOrganizer ? 'Aprobar organizador' : 'Aprobar y publicar'}</button
                    >
                </div>
            {:else}<form method="dialog"><button class="admin-button">Cerrar detalle</button></form>{/if}
        {:else}
            <p class="dialog-description">{selected.nombre}</p>
            <form class="decision-form" onsubmit={decide}>
                {#if reviewMode === 'reject'}
                    <label for="rejection-reason">Motivo del rechazo <span>(opcional)</span></label>
                    <textarea
                        id="rejection-reason"
                        bind:value={reason}
                        maxlength="500"
                        rows="4"
                        placeholder="Explicá qué información falta o qué debe corregirse…"
                        aria-describedby="reason-help reason-error"
                        aria-invalid={reasonError ? 'true' : undefined}
                        oninput={() => (reasonError = '')}></textarea>
                    <p id="reason-help" class="field-help">Podés indicar un motivo de hasta 500 caracteres o dejarlo vacío. {live ? 'Quedará guardado junto a la decisión.' : 'En esta demostración no se enviará al organizador.'}</p>

                {:else}<p class="approval-summary">
                        {live ? (isOrganizer ? 'La organización quedará aprobada y podrá gestionar sus eventos.' : 'El evento quedará publicado y disponible en la consulta pública.') : isOrganizer
                            ? 'En esta simulación, la solicitud pasará de pendiente a aprobada. No se concederán permisos reales.'
                            : 'En esta simulación, el evento pasará de pendiente a publicado y saldrá de la bandeja de revisión. No aparecerá en el sitio público.'}
                    </p>{/if}
                <p id="reason-error" class="field-error" role="alert">{reasonError}</p>
                <div class="review-actions">
                    <button
                        type="button"
                        class="detail-button"
                        disabled={reviewing}
                        onclick={() => {
                            reviewMode = 'detail';
                            reasonError = '';
                        }}>Volver</button
                    ><button type="submit" disabled={reviewing} class={reviewMode === 'reject' ? 'reject-button filled' : 'admin-button'}
                        >{reviewing ? 'Guardando…' : reviewMode === 'reject' ? 'Confirmar rechazo' : 'Confirmar aprobación'}</button
                    >
                </div>
            </form>
        {/if}
    {/if}
</dialog>
