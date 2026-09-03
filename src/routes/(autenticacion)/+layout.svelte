<script lang="ts">
    let { children } = $props();
</script>

<main class="min-h-dvh w-full flex items-center justify-center px-4 py-6">
    {@render children()}
</main>
