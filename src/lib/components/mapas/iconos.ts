const iconos: Record<string, { archivo: string; color: string }> = {
    alojamiento: { archivo: 'alojamiento', color: '#2563eb' },
    restaurantes: { archivo: 'restaurantes', color: '#ea580c' },
    cultura: { archivo: 'cultura', color: '#9333ea' },
    eventos: { archivo: 'eventos', color: '#db2777' },
    compras: { archivo: 'compras', color: '#0891b2' },
    naturaleza: { archivo: 'naturaleza', color: '#16a34a' }
};

export function iconoCategoria(nombre: string) {
    const categoria = nombre.toLowerCase();
    const clave = categoria.includes('naturaleza') ? 'naturaleza'
        : categoria.startsWith('eventos') ? 'eventos' : categoria;
    return iconos[clave];
}
