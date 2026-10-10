<script lang="ts">
    import { onDestroy, tick } from 'svelte';
    import { definitions, validateRecord, recordRow, type RecordRow, type Field } from '$lib/admin/management';
    let {
        live = false,
        records,
        destinations,
        onsave,
        onremove,
    }: {
        live?: boolean;
        records: Record<string, RecordRow[]>;
        destinations: { id: string; nombre: string }[];
        onsave: (section: string, row: RecordRow, file?: File) => void | Promise<void>;
        onremove: (section: string, id: string) => void | Promise<void>;
    } = $props();
    let dialog: HTMLDialogElement;
    let errorElement = $state<HTMLParagraphElement>();
    let section = $state('categorias');
    let original = $state<RecordRow | null>(null);
    let draft = $state<Record<string, string>>({});
    let mode = $state<'detail' | 'edit' | 'confirm'>('detail');
    let action = $state<'delete' | 'publish' | 'hide'>('delete');
    let saving = $state(false);
    async function save(event: SubmitEvent) { event.preventDefault(); if(saving)return; saving=true; try { await persist(event); } catch(error) { await fail(error instanceof Error?error.message:'No se pudo guardar.'); } finally { saving=false; } }
    async function confirm() { if(saving)return; saving=true; try { await persistConfirmation(); } catch(error) { await fail(error instanceof Error?error.message:'No se pudo completar la operación.'); } finally { saving=false; } }
    let message = $state('');
    let file = $state<File | null>(null);
    let fileInput = $state<HTMLInputElement>();
    const definition = $derived(definitions[section]);
    const objectUrls = new Set<string>();
    onDestroy(() => objectUrls.forEach((url) => URL.revokeObjectURL(url)));
    export async function open(key: string, row?: RecordRow, editing = false) {
        section = key;
        original = row ? { ...row, data: { ...row.data } } : null;
        draft = row ? { ...row.data } : { entrada: 'Gratuita', precio: '0', diaLlegada: 'Mismo día', organizador: live ? '' : 'Administración de ejemplo' };
        mode = !row || editing ? 'edit' : 'detail';
        message = '';
        file = null;
        await tick();
        if (fileInput) fileInput.value = '';
        dialog.showModal();
    }
    export function close() {
        dialog?.close();
    }
    function options(field: Field) {
        if(live && field.key==='organizador') return [{value:'',label:'Administración'}, ...records.organizadores.filter((item)=>item.estado==='Aprobado').map((item)=>({value:item.id,label:item.nombre}))];
        if (field.relation === 'destinos') return destinations.map((item) => ({ value: item.id, label: item.nombre }));
        if (field.relation) return (records[field.relation] ?? []).map((item) => ({ value: item.id, label: item.nombre }));
        return (field.options ?? []).map((value) => ({ value, label: value }));
    }
    function label(field: Field, value: string) {
        return options(field).find((item) => item.value === value)?.label ?? (value || 'Sin especificar');
    }
    async function fail(text: string) {
        message = text;
        await tick();
        errorElement?.focus();
    }
    async function persist(event: SubmitEvent) {
        event.preventDefault();
        const data = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, String(value ?? '').trim()]));
        const problem = validateRecord(section, live && section==='eventos' && !data.organizador ? {...data,organizador:'Administración'} : data, records[section] ?? [], original?.id);
        if (problem) {
            await fail(problem);
            return;
        }
        for (const field of definition.fields.filter((field) => field.relation)) {
            if (!options(field).some((option) => option.value === data[field.key])) {
                await fail('La referencia seleccionada ya no está disponible. Elegí otra.');
                return;
            }
        }
        if (section === 'eventos' && data.entrada === 'Gratuita') data.precio = '0';
        if (section === 'multimedia') {
            if (!file && !data.url) {
                await fail('Seleccioná una imagen o un video.');
                return;
            }
            if (file) {
                if (!['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.type)) {
                    await fail('Usá imágenes JPG, PNG o WebP, o videos MP4 o WebM.');
                    return;
                }
                if (file.size === 0 || file.size > 20 * 1024 * 1024) {
                    await fail('El archivo debe tener contenido y pesar como máximo 20 MB en esta demostración.');
                    return;
                }
                if(!live) { data.url = URL.createObjectURL(file); objectUrls.add(data.url); }
                data.archivo = file.name;
                data.tipo = file.type.startsWith('image/') ? 'Imagen' : 'Video';
            }
        }
        const row = recordRow(section, data, original?.id ?? section + '-' + crypto.randomUUID(), original?.estado);
        if (section === 'multimedia') row.detalle = destinations.find((item) => item.id === data.destino)?.nombre ?? '';
        if (section === 'horarios') row.detalle = (records.transporte.find((item) => item.id === data.empresa)?.nombre ?? '') + ' · ' + data.dias;
        await onsave(section, row, file ?? undefined);
        dialog.close();
    }
    function requestAction(next: typeof action) {
        action = next;
        mode = 'confirm';
        message = '';
    }
    async function persistConfirmation() {
        if (!original) return;
        if (action === 'delete') {
            if (section === 'eventos' && records.multimedia.some((item) => item.data.destino === 'eventos:' + original!.id)) {
                await fail('Retirá o reasigná primero los recursos multimedia de este evento.');
                return;
            }
            await onremove(section, original.id);
        } else await onsave(section, { ...original, estado: action === 'publish' ? 'Publicado' : 'Oculto' });
        dialog.close();
    }
</script>

<dialog class="admin-dialog record-dialog" bind:this={dialog} oncancel={(event) => { if(saving)event.preventDefault(); }} aria-labelledby="record-title">
    <div class="dialog-header"><span class="eyebrow">{live ? "ADMINISTRACIÓN" : "GESTIÓN DE EJEMPLO"}</span><button disabled={saving} aria-label="Cerrar" onclick={() => dialog.close()}>✕</button></div>
    <h2 id="record-title">
        {mode === 'edit' ? (original ? 'Editar ' : 'Crear ') + definition.title.toLocaleLowerCase('es') : mode === 'confirm' ? 'Confirmar acción' : original?.nombre}
    </h2>
    <p class="dialog-note">{live ? "Los cambios y archivos se guardan en el servidor. Revisá la información antes de confirmar." : "Datos de ejemplo. Los cambios y archivos se reinician al recargar."}</p>
    {#if mode === 'edit'}
        <form class="record-form" onsubmit={save}>
            <p class="field-help">* Campo obligatorio.</p>
            {#each definition.fields as field}
                <label
                    >{field.label}{field.required && !(live && field.key==='organizador') ? ' *' : ''}
                    {#if field.options || field.relation || live && field.key==='organizador'}<select bind:value={draft[field.key]} required={field.required && !(live && field.key==='organizador')}
                            ><option value="">Seleccionar…</option>{#each options(field) as option}<option value={option.value}>{option.label}</option>{/each}</select
                        >
                    {:else if field.type === 'textarea'}<textarea rows="3" bind:value={draft[field.key]} required={field.required && !(live && field.key==='organizador')} maxlength={field.max ?? 5000}></textarea>
                    {:else}<input
                            type={field.type ?? 'text'}
                            value={draft[field.key] ?? ''}
                            oninput={(event) => (draft[field.key] = event.currentTarget.value)}
                            required={field.required && !(live && field.key==='organizador')}
                            maxlength={field.max ?? 5000}
                            min={field.type === 'number' ? 0 : undefined}
                            step={field.type === 'number' ? '0.01' : undefined}
                        />{/if}
                </label>
            {/each}
            {#if section === 'multimedia'}<label
                    >{original?.data.url ? 'Reemplazar archivo' : 'Archivo *'}<input
                        bind:this={fileInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                        onchange={(event) => (file = event.currentTarget.files?.[0] ?? null)}
                    /></label
                >
                <p class="field-help">JPG, PNG, WebP, MP4 o WebM. Máximo de 20 MB por archivo.</p>{/if}
            {#if section === 'eventos'}<p class="field-help">
                    {live ? "Al guardar un evento nuevo como administrador, quedará publicado." : "Al guardar, el evento quedará publicado solo en esta demostración."} Las imágenes y videos se agregan desde Multimedia.
                </p>{/if}
            <div class="review-actions">
                <button disabled={saving} type="button" class="detail-button" onclick={() => dialog.close()}>Cancelar</button><button disabled={saving} class="admin-button" type="submit"
                    >{saving ? 'Guardando…' : section === 'eventos' && !original ? (live ? 'Crear y publicar evento' : 'Crear y publicar ejemplo') : (live ? 'Guardar cambios' : 'Guardar ejemplo')}</button
                >
            </div>
        </form>
    {:else if mode === 'detail' && original}
        <p class="dialog-description">{original.detalle}</p>
        <dl>
            <div>
                <dt>Estado</dt>
                <dd>{original.estado}</dd>
            </div>
            {#each definition.fields as field}<div>
                    <dt>{field.label}</dt>
                    <dd>{label(field, original.data[field.key])}</dd>
                </div>{/each}
            {#if section === 'comentarios'}<div>
                    <dt>Calificación</dt>
                    <dd>{original.extra}</dd>
                </div>{/if}
        </dl>
        {#if section === 'multimedia' && original.data.url}
            {#if original.data.tipo === 'Imagen'}<img class="media-preview" src={original.data.url} alt={original.data.descripcion} />{:else}
                <!-- svelte-ignore a11y_media_has_caption: vista previa de un video local; el flujo de subtítulos queda pendiente de acordar. -->
                <video class="media-preview" src={original.data.url} controls preload="metadata"></video>
            {/if}
            <p class="field-help">Archivo local: {original.data.archivo}</p>
        {/if}
        {#if section === 'eventos'}
            <h3>Multimedia asociada</h3>
            {#each records.multimedia.filter((item) => item.data.destino === 'eventos:' + original!.id) as media}<p>{media.nombre}</p>
                {#if media.data.tipo === 'Imagen' && media.data.url}<img class="media-preview" src={media.data.url} alt={media.data.descripcion} />{/if}{:else}<p
                    class="field-help"
                >
                    Sin recursos asociados. Agregalos desde Imágenes y videos.
                </p>{/each}
        {/if}
        <div class="review-actions">
            {#if definition.removable}<button disabled={saving} class="reject-button" onclick={() => requestAction('delete')}>Eliminar</button>{/if}
            {#if section === 'comentarios'}<button disabled={saving} class="admin-button" onclick={() => requestAction(original!.estado === 'Publicado' ? 'hide' : 'publish')}
                    >{original.estado === 'Publicado' ? 'Ocultar' : 'Aprobar y mostrar'}</button
                >{/if}
            {#if section === 'eventos' && original.estado === 'Borrador'}<button disabled={saving} class="admin-button" onclick={() => requestAction('publish')}>Publicar borrador</button>{/if}
            {#if definition.editable}<button
                    class="detail-button"
                    onclick={() => {
                        draft = { ...original!.data };
                        mode = 'edit';
                    }}>Editar</button
                >{/if}
        </div>
    {:else if original}
        <p class="dialog-description">{original.nombre}</p>
        <p>
            {action === 'delete'
                ? (live ? 'Se eliminará este registro de la plataforma. Esta acción no se puede deshacer.' : 'Se quitará este registro de los datos de ejemplo.')
                : action === 'publish'
                  ? (live ? 'El registro se mostrará públicamente.' : 'El registro pasará a publicado en la demostración.')
                  : (live ? 'El registro dejará de mostrarse públicamente.' : 'El registro se ocultará en la demostración.')}
        </p>
        {#if section === 'comentarios'}<p class="field-help">
                No se cambiará la puntuación escrita por el turista. El efecto sobre los promedios reales requiere integración.
            </p>{/if}
        <div class="review-actions">
            <button disabled={saving} class="detail-button" onclick={() => (mode = 'detail')}>Cancelar</button><button
                class={action === 'delete' ? 'reject-button filled' : 'admin-button'}
                onclick={confirm}>{live ? "Confirmar" : "Confirmar simulación"}</button
            >
        </div>
    {/if}
    <p class="field-error" role="alert" tabindex="-1" bind:this={errorElement}>{message}</p>
</dialog>

<style>
    .record-dialog {
        width: min(700px, calc(100% - 32px));
        max-height: 90dvh;
        overflow-y: auto;
    }
    .record-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    .record-form label {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 12px;
        font-weight: 600;
        min-width: 0;
    }
    .record-form :is(input, select, textarea) {
        width: 100%;
        border: 1px solid #c9d6c5;
        border-radius: 6px;
        padding: 10px;
        font: inherit;
        font-weight: 400;
        background: #fff;
        color: #284837;
    }
    .record-form :is(p, .review-actions) {
        grid-column: 1 / -1;
    }
    .record-dialog dd {
        max-width: 65%;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
    }
    .media-preview {
        width: 100%;
        max-height: 280px;
        object-fit: contain;
        border-radius: 8px;
        background: #f2f5ef;
    }
    .record-dialog h3 {
        font-size: 15px;
        margin: 20px 0 10px;
    }
    @media (max-width: 540px) {
        .record-form {
            grid-template-columns: 1fr;
        }
    }
</style>
