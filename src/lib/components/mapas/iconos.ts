const iconos: Record<string, { archivo: string; color: string }> = {
    alojamiento: { archivo: 'alojamiento', color: '#2563eb' },
    restaurantes: { archivo: 'restaurantes', color: '#ea580c' },
    cultura: { archivo: 'cultura', color: '#9333ea' },
    eventos: { archivo: 'eventos', color: '#db2777' },
    compras: { archivo: 'compras', color: '#0891b2' },
    naturaleza: { archivo: 'naturaleza', color: '#16a34a' }
};

export function iconoCategoria(valor: string | import('#lib/types/mapa.ts').CategoriaMarcador) {
    if (typeof valor !== 'string' && valor.icono_url && /^\/api\/categorias\/\d+\/[a-z0-9-]+\.svg\?v=[a-f0-9]{16}$/.test(valor.icono_url)) {
        return { url: valor.icono_url, color: /^#[0-9a-f]{6}$/i.test(valor.color || '') ? valor.color! : '#2563eb' };
    }
    const nombre = typeof valor === 'string' ? valor : valor.nombre;
    const categoria = nombre.toLowerCase();
    const clave = categoria.includes('naturaleza') ? 'naturaleza'
        : categoria.startsWith('eventos') ? 'eventos' : categoria;
    const icono = iconos[clave];
    return icono ? { url: `/iconos-mapa/${icono.archivo}.svg`, color: typeof valor !== 'string' && valor.color ? valor.color : icono.color } : undefined;
}
