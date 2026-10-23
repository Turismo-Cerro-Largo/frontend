<script lang="ts">
    import { page } from '$app/state';
</script>

<main style="max-width:650px;margin:12vh auto;padding:30px;font-family:Arial,sans-serif">
    <h1>Lugar no disponible</h1>
    <p>{page.error?.message}</p>
    <a href="/lugares">Explorar otros lugares</a> · <a href="/">Ir al inicio</a>
</main>
