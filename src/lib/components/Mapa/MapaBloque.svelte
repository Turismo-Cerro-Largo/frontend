<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, titulo }: { children: Snippet; titulo?: string } = $props();
</script>

<div class="flex flex-col justify-between gap-1">
    {#if titulo}
        <span class="font-Poppins font-thin pl-2">{titulo}</span>
    {/if}
    {@render children()}
</div>
