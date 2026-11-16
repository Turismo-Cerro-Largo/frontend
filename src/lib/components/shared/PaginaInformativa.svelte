<script lang="ts">
    import type { Snippet } from 'svelte';
    import Navbar from './Navbar.svelte';
    import HomeFooter from '$lib/components/inicio/HomeFooter.svelte';

    let { titulo, descripcion, children }: {
        titulo: string;
        descripcion: string;
        children: Snippet;
    } = $props();
</script>

<svelte:head>
    <title>{titulo} | Cerro Largo 360</title>
    <meta name="description" content={descripcion} />
</svelte:head>

<Navbar solid />
<main class="mx-auto max-w-3xl px-6 pb-16 pt-32 text-zinc-700">
    <h1 class="mb-6 text-3xl font-semibold text-zinc-900">{titulo}</h1>
    <div class="space-y-5 leading-relaxed">
        {@render children()}
    </div>
</main>
<HomeFooter />
