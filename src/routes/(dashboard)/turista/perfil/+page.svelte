<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { enviar } from '$lib/turista/api';
  let { data } = $props();
  let ocupado = $state(false);
  let mensaje = $state('');
  let esError = $state(false);
  let fotoInput: HTMLInputElement;
  async function guardar(event: SubmitEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    ocupado = true; mensaje = '';
    try {
      const campos = ['nombres', 'apellidos', 'telefono', 'departamento', 'localidad'];
      if (!data.perfil.fecha_nacimiento && form.get('fecha_nacimiento')) campos.push('fecha_nacimiento');
      if (!data.perfil.genero && form.get('genero')) campos.push('genero');
      await enviar('perfil', 'PUT', Object.fromEntries(campos.map(k => [k, form.get(k)])));
      await invalidateAll(); esError = false; mensaje = 'Guardamos los cambios de tu perfil.';
    } catch (e) { esError = true; mensaje = (e as Error).message; } finally { ocupado = false; }
  }
  async function foto(quitar = false) {
    const archivo = fotoInput?.files?.[0];
    if (!quitar && !archivo) { esError = true; mensaje = 'Elegí una imagen primero.'; return; }
    if (archivo && !quitar && (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) || archivo.size > 3 * 1024 * 1024)) { esError = true; mensaje = 'Elegí una imagen JPG, PNG o WebP de hasta 3 MB.'; return; }
    ocupado = true; mensaje = '';
    try {
      const form = new FormData(); if (archivo) form.set('foto', archivo);
      await enviar('foto', quitar ? 'DELETE' : 'PUT', quitar ? undefined : form);
      await invalidateAll(); fotoInput.value = ''; esError = false; mensaje = quitar ? 'Quitamos tu foto de perfil.' : 'Actualizamos tu foto de perfil.';
    } catch (e) { esError = true; mensaje = (e as Error).message; } finally { ocupado = false; }
  }
</script>
<svelte:head><title>Mi perfil · Cerro Largo 360</title></svelte:head>
<span class="t-eyebrow">UN ESPACIO CON TU NOMBRE</span><h1 class="t-title">Mi perfil</h1><p class="t-intro">Actualizá tus datos de contacto y personalizá tu cuenta.</p>
{#if mensaje}<p role={esError ? 'alert' : 'status'} class="t-message" class:error={esError}>{mensaje}</p>{/if}
<section class="t-panel">
  <div class="t-photo-area">{#if data.perfil.foto}<img class="t-avatar" src={data.perfil.foto} alt="Tu foto de perfil" />{:else}<span class="t-avatar">{data.perfil.nombres.charAt(0)}</span>{/if}<div><h2>Foto de perfil</h2><label class="sr-only" for="foto">Elegir foto de perfil</label><input bind:this={fotoInput} disabled={ocupado} id="foto" type="file" accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG o WebP. Máximo 3 MB.</small><div class="t-actions" style="margin-top:12px"><button class="t-button secondary" onclick={() => foto()} disabled={ocupado}>Guardar foto</button>{#if data.perfil.foto}<button class="t-button secondary" onclick={() => foto(true)} disabled={ocupado}>Quitar foto</button>{/if}</div></div></div>
  <form onsubmit={guardar} class="t-form">
    <label class="t-field">Nombre<input name="nombres" autocomplete="given-name" value={data.perfil.nombres} required minlength="2" maxlength="100" disabled={ocupado} /></label>
    <label class="t-field">Apellido<input name="apellidos" autocomplete="family-name" value={data.perfil.apellidos} required minlength="2" maxlength="100" disabled={ocupado} /></label>
    <label class="t-field">Teléfono<input name="telefono" type="tel" autocomplete="tel" value={data.perfil.telefono || ''} maxlength="30" disabled={ocupado} /></label>
    <label class="t-field">Departamento<input name="departamento" autocomplete="address-level1" value={data.perfil.departamento || ''} maxlength="100" disabled={ocupado} /></label>
    <label class="t-field">Localidad<input name="localidad" autocomplete="address-level2" value={data.perfil.localidad || ''} maxlength="120" disabled={ocupado} /></label>
    <div class="t-field"><span>Correo de la cuenta</span><p>{data.perfil.email}</p><small>El correo y los datos de identidad no se modifican desde este formulario.</small></div>
    {#if data.perfil.fecha_nacimiento}
      <div class="t-field"><span>Fecha de nacimiento</span><p>{new Date(data.perfil.fecha_nacimiento).toLocaleDateString('es-UY', { timeZone: 'UTC' })}</p><small>Dato registrado. No editable.</small></div>
    {:else}
      <label class="t-field">Fecha de nacimiento<input type="date" name="fecha_nacimiento" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} disabled={ocupado} /><small>Podés completarla una sola vez. Revisala antes de guardar.</small></label>
    {/if}
    {#if data.perfil.genero}
      <div class="t-field"><span>Género</span><p>{{ masculino: 'Masculino', femenino: 'Femenino', otro: 'Otro' }[data.perfil.genero]}</p><small>Dato registrado. No editable.</small></div>
    {:else}
      <label class="t-field">Género<select name="genero" disabled={ocupado}><option value="">Sin seleccionar</option><option value="masculino">Masculino</option><option value="femenino">Femenino</option><option value="otro">Otro</option></select><small>Podés completarlo una sola vez. Revisalo antes de guardar.</small></label>
    {/if}
    <div class="t-field full"><div><button class="t-button" type="submit" disabled={ocupado}>{ocupado ? 'Guardando…' : 'Guardar cambios'}</button></div></div>
  </form>
</section>
