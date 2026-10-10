<script lang="ts">
    import type { RecordRow } from '$lib/admin/management';
    let { events, onopen }: { events: RecordRow[]; onopen: (row: RecordRow) => void } = $props();
    let month = $state(new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Montevideo', year: 'numeric', month: '2-digit' }).format(new Date()));
    const days = $derived.by(() => {
        if (!/^\d{4}-\d{2}$/.test(month)) return [];
        const [year, m] = month.split('-').map(Number);
        const first = new Date(year, m - 1, 1).getDay();
        const offset = (first + 6) % 7;
        const count = new Date(year, m, 0).getDate();
        return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
            const day = index - offset + 1;
            return day > 0 && day <= count ? { day, items: events.filter((row) => row.data.inicio?.slice(0, 10) === month + '-' + String(day).padStart(2, '0')) } : null;
        });
    });
</script>

<section class="calendar" aria-label="Calendario de eventos">
    <label>Mes <input type="month" bind:value={month} required /></label>
    <p>Incluye eventos de todos los estados. Abrí uno para revisar su información.</p>
    <div class="calendar-scroll">
        <div class="calendar-grid">
            {#each ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as name}<div class="weekday">{name}</div>{/each}
            {#each days as cell}<div class="day">
                    {#if cell}<span>{cell.day}</span>{#each cell.items as event}<button onclick={() => onopen(event)}
                                ><strong>{event.nombre}</strong><small>{event.data.inicio.slice(11)} · {event.estado}</small></button
                            >{/each}{/if}
                </div>{/each}
        </div>
    </div>
    {#if !events.some((row) => row.data.inicio?.startsWith(month))}<p>No hay eventos en este mes.</p>{/if}
</section>

<style>
    .calendar {
        margin: 20px 0;
        padding: 20px;
        border: 1px solid #e2e9e5;
        border-radius: 10px;
        background: white;
    }
    .calendar label {
        display: flex;
        gap: 15px;
        align-items: center;
        font-size: 13px;
    }
    .calendar input {
        border: 1px solid #d4dfd0;
        border-radius: 5px;
        padding: 8px;
    }
    .calendar p {
        font-size: 12px;
        color: #687c69;
        margin: 14px 0;
    }
    .calendar-scroll {
        overflow-x: auto;
    }
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        min-width: 650px;
    }
    .weekday {
        padding: 12px;
        font-size: 11px;
        background: #f5f8f2;
    }
    .day {
        min-height: 100px;
        border: 1px solid #ecf0e8;
        padding: 7px;
        font-size: 11px;
    }
    .day button {
        display: block;
        width: 100%;
        text-align: left;
        padding: 8px;
        border: 0;
        border-radius: 4px;
        margin-top: 7px;
        background: #eaf2e4;
        color: #31543d;
    }
    .day strong {
        display: block;
        font-size: 11px;
    }
    .day small {
        display: block;
        margin-top: 5px;
        font-size: 9px;
    }
</style>
