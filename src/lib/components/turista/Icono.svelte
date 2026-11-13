<script lang="ts">
    let { nombre, size = 22 }: { nombre: string; size?: number } = $props();
    const paths: Record<string, string> = {
        explorar: 'm12 3 9 18H3Zm0 0-3 11 3-2 3 2',
        favoritos: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
        valoraciones: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
        flecha: 'M4 12h16m-6-6 6 6-6 6',
    };
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    ><path d={paths[nombre] || paths.explorar} /></svg
>
