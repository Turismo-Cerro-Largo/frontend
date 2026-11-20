<script lang="ts">
  let { estado }: { estado: string } = $props();
</script>

<div class="mt-2 text-sm text-slate-600">
  <p role="status">{estado}</p>
  <a class="text-xs underline" href="https://www.openstreetmap.org/copyright">Direcciones © OpenStreetMap</a>
</div>
