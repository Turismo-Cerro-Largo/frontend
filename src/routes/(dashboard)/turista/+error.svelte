<script lang="ts">import { page } from '$app/state';</script>
<main style="max-width:650px;margin:12vh auto;padding:30px;font-family:Arial,sans-serif"><h1>No pudimos cargar tu cuenta</h1><p>{page.error?.message}</p><p><a href={page.url.pathname} data-sveltekit-reload>Volver a intentar</a> · <a href="/login">Ingresar</a> · <a href="/">Ir al inicio</a></p></main>
