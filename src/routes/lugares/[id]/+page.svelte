<script lang="ts">
    import Galeria from "$lib/components/turista/Galeria.svelte";
    import EliminarValoracion from '$lib/components/turista/EliminarValoracion.svelte';
    import Estrellas from '$lib/components/turista/Estrellas.svelte';
    import Navbar from '$lib/components/shared/Navbar.svelte';
    import HomeFooter from '$lib/components/inicio/HomeFooter.svelte';
    import { invalidateAll } from '$app/navigation';
    import { enviar } from '$lib/turista/api';
    import { estados } from '$lib/turista/valoraciones';
    import Icono from '$lib/components/turista/Icono.svelte';
    import '$lib/components/turista/turista.css';
    let { data } = $props();
    let ocupado = $state(false);
    let mensaje = $state('');
    let esError = $state(false);
    async function favorito() {
        ocupado = true;
        mensaje = '';
        try {
            await enviar(`favoritos/${data.lugar.id}`, data.personal?.favorito ? 'DELETE' : 'PUT');
            await invalidateAll();
        } catch (e) {
            esError = true;
            mensaje = (e as Error).message;
        } finally {
            ocupado = false;
        }
    }
    async function valorar(event: SubmitEvent) {
        event.preventDefault();
        const form = new FormData(event.currentTarget as HTMLFormElement);
        ocupado = true;
        mensaje = '';
        try {
            await enviar(`lugares/${data.lugar.id}/valoracion`, 'POST', { calificacion: Number(form.get('calificacion')), texto: form.get('texto') });
            await invalidateAll();
            esError = false;
            mensaje = 'Recibimos tu valoración. La revisaremos antes de publicarla.';
        } catch (e) {
            esError = true;
            mensaje = (e as Error).message;
        } finally {
            ocupado = false;
        }
    }
    const sitioSeguro = $derived(data.lugar.sitio_web && /^https?:\/\//i.test(data.lugar.sitio_web) ? data.lugar.sitio_web : null);
</script>

<svelte:head><title>{data.lugar.nombre} · Cerro Largo 360</title></svelte:head>
<div class="t-public">
    <Navbar solid /><div class="t-public-inner" style="padding-top:130px">
        <a class="t-link" href="/lugares">← Explorar lugares</a>
        <span class="t-eyebrow">{data.lugar.categoria.nombre} · {data.lugar.localidad}</span>
        <h1 class="t-title">{data.lugar.nombre}</h1>
        <p class="t-intro">
            {#if data.promedio !== null}<span class="t-stars">★</span> {data.promedio.toFixed(1)} de 5 · {data.totalValoraciones} valoraciones publicadas{:else}Todavía no hay
                valoraciones publicadas.{/if}
        </p>
        {#if mensaje}<p class="t-message" class:error={esError} role={esError ? 'alert' : 'status'}>{mensaje}</p>{/if}
        <Galeria recursos={data.lugar.recursos || []} nombre={data.lugar.nombre} />
        <div class="t-two">
            <section class="t-panel">
                <h2>Conocé este lugar</h2>
                <p class="t-description">{data.lugar.descripcion}</p>
                <dl class="t-details">
                    {#if data.lugar.direccion}<div>
                            <dt>Dirección</dt>
                            <dd>{data.lugar.direccion}</dd>
                        </div>{/if}
                    <div>
                        <dt>Localidad</dt>
                        <dd>{data.lugar.localidad}</dd>
                    </div>
                    {#if data.lugar.horario}<div>
                            <dt>Horario</dt>
                            <dd>{data.lugar.horario}</dd>
                        </div>{/if}{#if data.lugar.telefono}<div>
                            <dt>Teléfono</dt>
                            <dd>{data.lugar.telefono}</dd>
                        </div>{/if}{#if sitioSeguro}<div>
                            <dt>Sitio web</dt>
                            <dd><a class="t-link" href={sitioSeguro} target="_blank" rel="noopener noreferrer">Visitar sitio ↗</a></dd>
                        </div>{/if}
                </dl>
                <div class="t-actions">
                    {#if data.personal}<button class="t-button" onclick={favorito} disabled={ocupado}
                            ><Icono nombre="favoritos" size={18} />{data.personal.favorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}</button
                        >{:else if !data.cuenta}<a class="t-button" href="/login">Ingresar para guardar y valorar</a>{/if}<a
                        class="t-button secondary"
                        href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(data.lugar.latitud)}&mlon=${encodeURIComponent(data.lugar.longitud)}#map=16/${encodeURIComponent(data.lugar.latitud)}/${encodeURIComponent(data.lugar.longitud)}`}
                        target="_blank"
                        rel="noopener noreferrer">Ver ubicación ↗</a
                    >
                </div>
            </section>
            <section class="t-panel">
                <h2>Tu experiencia</h2>
                {#if data.personal?.valoracion}<div class="t-stars" aria-label={`${data.personal.valoracion.calificacion} de 5 estrellas`}>
                        {'★'.repeat(data.personal.valoracion.calificacion)}{'☆'.repeat(5 - data.personal.valoracion.calificacion)}
                    </div>
                    <span class="t-badge" class:published={data.personal.valoracion.estado === 'PUBLICADO'}>{estados[data.personal.valoracion.estado]}</span
                    >{#if data.personal.valoracion.texto}<p class="t-description">{data.personal.valoracion.texto}</p>{/if}
                    {#if data.personal.valoracion.estado === 'PENDIENTE_REVISION'}<EliminarValoracion id={data.personal.valoracion.id} />{/if}
                    <div class="t-actions"><a class="t-link" href="/turista/valoraciones">Ver mis valoraciones →</a></div>
                {:else if data.personal}<p>¿Ya visitaste este lugar? Elegí de 1 a 5 estrellas y, si querés, contanos cómo fue.</p>
                    <form onsubmit={valorar}>
                        {#key data.lugar.id}<Estrellas disabled={ocupado} />{/key}
                        <label class="t-field"
                            >Comentario (opcional)<textarea name="texto" rows="4" maxlength="2000" placeholder="Compartí tu experiencia con otros visitantes…" disabled={ocupado}
                            ></textarea><small>Hasta 2000 caracteres. Tu valoración será revisada antes de publicarse.</small></label
                        >
                        <div class="t-actions"><button class="t-button" type="submit" disabled={ocupado}>{ocupado ? 'Enviando…' : 'Enviar valoración'}</button></div>
                    </form>
                {:else}<p>
                        {data.cuenta
                            ? 'La participación desde este panel está disponible para cuentas de turista.'
                            : 'Ingresá con tu cuenta de turista para compartir tu experiencia.'}
                    </p>
                    {#if !data.cuenta}<a class="t-link" href="/login">Ingresar →</a>{/if}{/if}
            </section>
        </div>
        <section style="margin-top:32px">
            <h2 style="font-size:22px;font-weight:600;margin-bottom:18px">Experiencias de visitantes</h2>
            {#if data.comentarios.length}<p class="t-date" style="margin-bottom:16px">Se muestran las últimas {data.comentarios.length} valoraciones publicadas.</p>
                <div class="t-list">
                    {#each data.comentarios as comentario (comentario.id)}<article class="t-review">
                            <div class="t-review-head">
                                <h3>{comentario.usuario.nombres}</h3>
                                <time class="t-date" datetime={comentario.creado_en}>{new Date(comentario.creado_en).toLocaleDateString('es-UY', { timeZone: 'UTC' })}</time>
                            </div>
                            <span class="t-stars" aria-label={`${comentario.calificacion} de 5 estrellas`}
                                >{'★'.repeat(comentario.calificacion)}{'☆'.repeat(5 - comentario.calificacion)}</span
                            >{#if comentario.texto}<p>{comentario.texto}</p>{/if}
                        </article>{/each}
                </div>{:else}<div class="t-empty">
                    <Icono nombre="valoraciones" size={34} />
                    <p>Las experiencias aprobadas por el equipo aparecerán acá.</p>
                </div>{/if}
        </section>
    </div>
<HomeFooter />
</div>
