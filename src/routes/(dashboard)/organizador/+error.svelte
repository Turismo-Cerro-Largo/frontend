<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
</script>

<section class="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
    <div class="max-w-2xl rounded-2xl border border-[#ded8cf] bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-bold text-[#26382e]">
            {page.status === 403 ? 'Cuenta pendiente de verificación' : 'Ocurrió un problema'}
        </h1>

        <div
            class={`mt-5 rounded-xl border px-5 py-4 text-sm ${
                page.status === 403 ? 'border-[#ead79c] bg-[#fff8e5] text-[#67582d]' : 'border-[#e5b8b4] bg-[#fbe8e6] text-[#7d3732]'
            }`}
        >
            {page.error?.message}
        </div>

        <button
            type="button"
            onclick={() => goto('/organizador', { replaceState: true })}
            class="mt-6 inline-block cursor-pointer text-sm font-medium text-[#65756b] hover:underline"
        >
            ← Volver al panel
        </button>
    </div>
</section>
