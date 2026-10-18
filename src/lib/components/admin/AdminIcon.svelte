<script lang="ts">
  let { name, size = 20 }: { name: string; size?: number } = $props();
  const paths: Record<string, string> = {
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    calendar: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16 M8 15h2 M14 15h2',
    people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87',
    message: 'M21 15a3 3 0 0 1-3 3H8l-5 4V5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z M7 7h10 M7 12h6',
    image: 'M3 3h18v18H3z M3 16l5-5 4 4 3-3 6 6 M16 7h.01',
    bus: 'M5 4h14v15H5z M5 12h14 M8 19v3 M16 19v3 M8 16h.01 M16 16h.01 M8 1h8',
    clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z M12 6v6l4 2',
    arrow: 'M5 12h14 M13 6l6 6-6 6',
    search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z M15 15l6 6',
    menu: 'M4 6h16 M4 12h16 M4 18h16',
    mountain: 'M2 20 9 5l4 8 3-5 6 12Z M6 11l3 2 2-3',
    shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z M8 12l3 3 5-6'
  };
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.grid} /></svg>
