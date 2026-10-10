<script lang="ts">
    import { tick } from 'svelte';
    import { emptyPlace, validatePlace, type DemoPlace } from '$lib/admin/places';
    let { categories, onsave, onremove, live = false }: { live?: boolean; categories: string[]; onsave: (place: DemoPlace) => void | Promise<void>; onremove: (id: string) => void | Promise<void> } = $props();
    let dialog: HTMLDialogElement;
    let mode = $state<'detail' | 'edit' | 'visibility' | 'delete'>('detail');
    let original = $state<DemoPlace | null>(null);
    let draft = $state<DemoPlace>(emptyPlace());
    let saving = $state(false);
    async function save(event: SubmitEvent) { event.preventDefault(); if(saving)return; saving=true; try { await persist(event); } catch(error) { message=error instanceof Error?error.message:'No se pudo guardar.'; } finally { saving=false; } }
    async function confirm() { if(saving)return; saving=true; try { await persistConfirmation(); } catch(error) { message=error instanceof Error?error.message:'No se pudo completar la operación.'; } finally { saving=false; } }
    let message = $state('');
    let errorBox = $state<HTMLParagraphElement>();
    export async function open(place?: DemoPlace) {
        original = place ? { ...place } : null;
        draft = place ? { ...place } : emptyPlace();
        mode = place ? 'detail' : 'edit';
        message = '';
        await tick();
        dialog.showModal();
    }
    export function close() {
        dialog?.close();
    }
    async function persist(event: SubmitEvent) {
        event.preventDefault();
        message = validatePlace(draft);
        if (message) {
            await tick();
            errorBox?.focus();
            return;
        }
        const clean = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as DemoPlace;
        await onsave({ ...clean, id: original?.id ?? 'L-' + crypto.randomUUID(), latitud: String(Number(clean.latitud)), longitud: String(Number(clean.longitud)) });
        dialog.close();
    }
    async function persistConfirmation() {
        if (!original) return;
        if (mode === 'delete') await onremove(original.id);
        else if (mode === 'visibility') onsave({ ...original, estado: original.estado === 'Publicado' ? 'Oculto' : 'Publicado' });
        dialog.close();
    }
</script>

<dialog class="admin-dialog place-dialog" bind:this={dialog} oncancel={(event) => { if(saving)event.preventDefault(); }} aria-labelledby="place-title">
    <div class="dialog-header"><span class="eyebrow">{live ? "LUGAR TURÍSTICO" : "LUGAR DE EJEMPLO"}</span><button disabled={saving} aria-label="Cerrar lugar" onclick={() => dialog.close()}>✕</button></div>
    <h2 id="place-title">
        {mode === 'edit'
            ? original
                ? 'Editar lugar'
                : 'Crear lugar turístico'
            : mode === 'delete'
              ? 'Eliminar lugar'
              : mode === 'visibility'
                ? original?.estado === 'Publicado'
                    ? 'Ocultar lugar'
                    : 'Mostrar lugar'
                : original?.nombre}
    </h2>
    <p class="dialog-note">{live ? "Los cambios se guardan en la plataforma. Revisá los datos antes de confirmar." : "Simulación con datos ficticios. Los cambios se reinician al recargar."}</p>
    {#if mode === 'edit'}
        <form class="place-form" onsubmit={save}>
            <p class="field-help">Los campos con * son obligatorios. Las coordenadas se ingresan con punto decimal.</p>
            <div class="place-fields">
                <label class="wide">Nombre *<input bind:value={draft.nombre} required minlength="3" maxlength="150" autocomplete="off" /></label>
                <label
                    >Categoría *<select bind:value={draft.detalle} required
                        ><option value="" disabled>Seleccionar categoría</option>{#each categories as category}<option>{category}</option>{/each}</select
                    ></label
                >
                <label>Localidad *<input bind:value={draft.extra} required maxlength="120" /></label>
                <label class="wide">Descripción *<textarea bind:value={draft.descripcion} rows="3" required minlength="10" maxlength="5000"></textarea></label>
                <label class="wide">Dirección<input bind:value={draft.direccion} maxlength="255" /></label>
                <label>Latitud *<input bind:value={draft.latitud} required inputmode="decimal" placeholder="Ej.: -32.37" aria-describedby="coordinates-help" /></label>
                <label>Longitud *<input bind:value={draft.longitud} required inputmode="decimal" placeholder="Ej.: -54.17" aria-describedby="coordinates-help" /></label>
                <p class="field-help wide" id="coordinates-help">Latitud: entre -90 y 90. Longitud: entre -180 y 180.</p>
                <label>Teléfono<input type="tel" bind:value={draft.telefono} maxlength="30" /></label>
                <label>Estado<select bind:value={draft.estado}><option>Oculto</option><option>Publicado</option></select></label>
                <label class="wide">Sitio web<input type="url" bind:value={draft.sitioWeb} maxlength="500" placeholder="https://…" /></label>
                <label class="wide">Horario<input bind:value={draft.horario} maxlength="255" placeholder="Ej.: Lunes a viernes, de 09:00 a 18:00" /></label>
            </div>
            <p class="field-error" tabindex="-1" bind:this={errorBox} role="alert">{message}</p>
            <div class="review-actions">
                <button
                    type="button"
                    class="detail-button"
                    onclick={() => {
                        if (original) {
                            mode = 'detail';
                            message = '';
                        } else dialog.close();
                    }}>Cancelar</button
                ><button disabled={saving} class="admin-button" type="submit">{saving ? 'Guardando…' : original ? (live ? 'Guardar cambios' : 'Guardar cambios de ejemplo') : (live ? 'Crear lugar' : 'Crear lugar de ejemplo')}</button>
            </div>
        </form>
    {:else if mode === 'detail' && original}
        <p class="dialog-description place-description">{original.descripcion}</p>
        <dl>
            <div>
                <dt>Categoría</dt>
                <dd>{original.detalle}</dd>
            </div>
            <div>
                <dt>Localidad</dt>
                <dd>{original.extra}</dd>
            </div>
            <div>
                <dt>Estado</dt>
                <dd><span class={'badge ' + (original.estado === 'Publicado' ? 'positive' : 'neutral')}>{original.estado}</span></dd>
            </div>
            <div>
                <dt>Dirección</dt>
                <dd>{original.direccion || 'Sin especificar'}</dd>
            </div>
            <div>
                <dt>Coordenadas</dt>
                <dd>{original.latitud}, {original.longitud}</dd>
            </div>
            <div>
                <dt>Teléfono</dt>
                <dd>{original.telefono || 'Sin especificar'}</dd>
            </div>
            <div>
                <dt>Sitio web</dt>
                <dd>{original.sitioWeb || 'Sin especificar'}</dd>
            </div>
            <div>
                <dt>Horario</dt>
                <dd>{original.horario || 'Sin especificar'}</dd>
            </div>
        </dl>
        <div class="review-actions">
            <button disabled={saving} class="reject-button" onclick={() => (mode = 'delete')}>Eliminar</button><button disabled={saving} class="detail-button" onclick={() => (mode = 'visibility')}
                >{original.estado === 'Publicado' ? 'Ocultar' : 'Mostrar'}</button
            ><button
                class="admin-button"
                onclick={() => {
                    draft = { ...original! };
                    message = '';
                    mode = 'edit';
                }}>Editar lugar</button
            >
        </div>
    {:else if original}
        <p class="dialog-description"><strong>{original.nombre}</strong></p>
        <p class="approval-summary">
            {mode === 'delete'
                ? (live ? 'Se eliminará el lugar de la plataforma junto con sus favoritos y comentarios asociados. Esta acción no se puede deshacer.' : 'El lugar se quitará de la lista de ejemplo y volverá al recargar.')
                : original.estado === 'Publicado'
                  ? 'El lugar pasará a oculto. Su información se conservará y podrás volver a mostrarlo.'
                  : (live ? 'El lugar se mostrará públicamente.' : 'El lugar pasará a publicado solo en esta demostración.')}
        </p>
        <div class="review-actions">
            <button disabled={saving} class="detail-button" onclick={() => (mode = 'detail')}>Cancelar</button><button
                class={mode === 'delete' ? 'reject-button filled' : 'admin-button'}
                onclick={confirm}>{mode === 'delete' ? 'Confirmar eliminación' : 'Confirmar cambio'}</button
            >
        </div>
    {/if}
{#if mode !== "edit"}<p class="field-error" role="alert">{message}</p>{/if}
</dialog>

<style>
    .place-dialog {
        width: min(660px, calc(100% - 32px));
        max-height: 90dvh;
        overflow-y: auto;
    }
    .place-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    .place-fields label {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 12px;
        font-weight: 600;
        min-width: 0;
    }
    .place-fields :is(input, select, textarea) {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #c9d6c5;
        border-radius: 6px;
        background-color: #fff;
        font: inherit;
        font-weight: 400;
        color: #284837;
    }
    .place-fields textarea {
        resize: vertical;
    }
    .wide {
        grid-column: 1 / -1;
    }
    .field-help {
        line-height: 1.6;
        margin: 12px 0 18px;
    }
    .place-description {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }
    .place-dialog dd {
        overflow-wrap: anywhere;
        max-width: 65%;
    }
    @media (max-width: 480px) {
        .place-fields {
            grid-template-columns: 1fr;
        }
    }
</style>
