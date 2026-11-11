const servidores = ['de2', 'de1'];
const localidades = ['Melo', 'Río Branco', 'Aceguá', 'Fraile Muerto', 'Laguna Merín', 'Isidoro Noblía', 'Tupambaé', 'Arévalo', 'Plácido Rosas', 'Centurión'];

const conocidas: [string, string, string, string[], string?][] = [
    ['La Voz de Melo', '1340 AM', 'Melo', ['Voz de Melo']],
    ['Radio Río Branco', '1360 AM', 'Río Branco', ['Rio Branco 1360']],
    ['Radio María', '1470 AM', 'Melo', ['Radio Maria Uruguay']],
    ['Radio Acuarela', '1520 AM', 'Melo', ['Acuarela 1520']],
    ['Ritmo FM', '88.1 FM', 'Melo', ['Ritmo 88.1']],
    ['Sirio FM', '89.5 FM', 'Fraile Muerto', ['Sirio 89.5']],
    ['Radio Pueblo', '89.7 FM', 'Río Branco', ['Radiopueblo', 'Radio Positiva 89.7']],
    ['La Bruja FM', '89.9 FM', 'Melo', ['Radio La Bruja'], 'https://rr5100.globalhost1.com/8452/stream'],
    ['Aceguá FM', '90.3 FM', 'Aceguá', ['Acegua 90.3']],
    ['Amiga FM', '92.1 FM', 'Laguna Merín', ['Amiga 92.1']],
    ['Renovación FM', '95.1 FM', 'Melo', ['Renovacion 95.1']],
    ['Ecos de la Costa', '96.1 FM', 'Cerro Largo', ['Ecos Costa']],
    ['Radiodifusión Nacional', '97.7 FM', 'Río Branco', ['Radio Uruguay 97.7', 'RNU 97.7']],
    ['Nova FM', '98.3 FM', 'Melo', ['Radio Nova 98.3']],
    ['Ciudad de Melo FM', '99.1 FM', 'Melo', ['Ciudad de Melo', 'Emisora Ciudad de Melo', '99.1 FM Melo']],
    ['FM Integración', '101.5 FM', 'Aceguá', ['Radio Integracion', 'Integracion 101.5']],
    ['La Galena', '105.5 FM', 'Río Branco', ['Galena FM', 'La Gelena']],
    ['Emisora del Sur', '106.9 FM', 'Melo', ['Radio Uruguay 106.9'], 'https://radios.iwstreaming.uy/8034/stream'],
];

type Estacion = {
    name: string;
    state: string;
    countrycode: string;
    url: string;
    url_resolved: string;
    lastcheckok: number;
};

type Radio = { id: string; nombre: string; frecuencia: string; localidad: string; enlaces: string[] };

function normalizar(texto: string) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function contiene(texto: string, nombre: string) {
    return ` ${texto} `.includes(` ${nombre} `);
}

function enlaceSeguro(valor: unknown) {
    if (typeof valor !== 'string') return [];
    try {
        const url = new URL(valor);
        return url.protocol === 'https:' && !url.username && !url.password ? [url.href] : [];
    } catch {
        return [];
    }
}

let cache: { estaciones: Estacion[]; vence: number } | undefined;

async function cargarEstaciones(fetcher: typeof fetch) {
    if (cache && cache.vence > Date.now()) return cache.estaciones;

    for (const servidor of servidores) {
        try {
            const respuesta = await fetcher(`https://${servidor}.api.radio-browser.info/json/stations/bycountrycodeexact/UY?limit=1000`, {
                headers: { 'User-Agent': 'CerroLargo360/1.0' },
                signal: AbortSignal.timeout(4000),
            });
            if (!respuesta.ok) continue;
            const estaciones = await respuesta.json();
            if (!Array.isArray(estaciones) || !estaciones.length) continue;
            const lista = (estaciones as Estacion[]).filter((e) => e?.countrycode === 'UY' && typeof e.name === 'string' && e.name.trim());
            cache = { estaciones: lista, vence: Date.now() + 300_000 };
            return lista;
        } catch {
            continue;
        }
    }

    const estaciones = cache?.estaciones ?? [];
    cache = { estaciones, vence: Date.now() + 30_000 };
    return estaciones;
}

export async function radiosDeCerroLargo(fetcher: typeof fetch) {
    const estaciones = await cargarEstaciones(fetcher);
    const radios = new Map<string, Radio>();

    for (const [nombre, frecuencia, localidad, , enlace] of conocidas) {
        if (enlace) {
            const id = normalizar(nombre);
            radios.set(id, { id, nombre, frecuencia, localidad, enlaces: [enlace] });
        }
    }

    const ordenadas = [...estaciones].sort((a, b) => Number(b.lastcheckok === 1) - Number(a.lastcheckok === 1));
    for (const estacion of ordenadas) {
        const nombreApi = normalizar(estacion.name);
        const region = normalizar(typeof estacion.state === 'string' ? estacion.state : '');
        const localidadApi = localidades.find((localidad) => {
            const nombre = normalizar(localidad);
            return contiene(region, nombre) || contiene(nombreApi, nombre);
        });
        const conocida = conocidas.find(([nombre, , , alias]) =>
            [nombre, ...alias].some((valor) => {
                const candidato = normalizar(valor);
                return nombreApi === candidato || (candidato.length >= 8 && contiene(nombreApi, candidato));
            })
        );
        if (!conocida && !localidadApi && !contiene(region, 'cerro largo')) continue;
        if (region && !localidadApi && !contiene(region, 'cerro largo') && region !== 'uruguay') continue;

        const enlaces = [...enlaceSeguro(estacion.url_resolved), ...enlaceSeguro(estacion.url)];
        if (!enlaces.length) continue;

        const nombre = conocida?.[0] ?? estacion.name.trim();
        const id = normalizar(nombre);
        const radio = radios.get(id) ?? {
            id,
            nombre,
            frecuencia: conocida?.[1] ?? '',
            localidad: conocida?.[2] ?? localidadApi ?? 'Cerro Largo',
            enlaces: [],
        };
        radio.enlaces = [...new Set([...radio.enlaces, ...enlaces])].slice(0, 5);
        radios.set(id, radio);
    }

    return [...radios.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-UY'));
}
