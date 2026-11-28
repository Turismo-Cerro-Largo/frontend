<script lang="ts">
    import PaginaInformativa from '#lib/components/shared/PaginaInformativa.svelte';

    const equipo = [
        ['Julio Herrera', 'Líder del proyecto, frontend y seguridad'],
        ['Mauricio Santana', 'Base de datos'],
        ['Victor Camano', 'Backend'],
        ['Carlos Morales', 'Backend y pruebas'],
        ['Regina Valeiron', 'Documentación y diagramas'],
        ['Tania Guzzo', 'Documentación y diseño UX/UI'],
    ];
</script>

<PaginaInformativa titulo="Sobre nosotros" descripcion="Conocé el proyecto Cerro Largo 360 y a su equipo.">
    <p>Cerro Largo 360 es una guía para descubrir lugares, eventos y actividades del departamento de Cerro Largo, Uruguay.</p>
    <h2 class="text-xl font-semibold text-zinc-900">Equipo</h2>
    <ul class="divide-y divide-zinc-200 border-y border-zinc-200">
        {#each equipo as [nombre, rol] (nombre)}
            <li class="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-6">
                <strong>{nombre}</strong>
                <span>{rol}</span>
            </li>
        {/each}
    </ul>
</PaginaInformativa>
