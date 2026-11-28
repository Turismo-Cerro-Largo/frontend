import * as env from '$app/env/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type DireccionNominatim = {
  country_code?: string;
  house_number?: string;
  road?: string;
  pedestrian?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  locality?: string;
};

type Resultado = { direccion: string; localidades: string[] };

const cache = new Map<string, Resultado>();
let proximaConsulta = 0;
let consultando = false;

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.cuenta) return json({ error: 'Sesión requerida' }, { status: 401 });
  const rol = locals.cuenta.rol;
  if (rol !== 'ADMINISTRADOR' && rol !== 'ORGANIZADOR') {
    return json({ error: 'Sin acceso' }, { status: 403 });
  }

  const lat = url.searchParams.get('lat')?.trim();
  const lon = url.searchParams.get('lon')?.trim();
  if (!lat || !lon || !(Math.abs(Number(lat)) <= 90) || !(Math.abs(Number(lon)) <= 180)) {
    return json({ error: 'Coordenadas inválidas' }, { status: 400 });
  }

  const latitud = Number(lat).toFixed(5);
  const longitud = Number(lon).toFixed(5);
  const clave = `${latitud},${longitud}`;
  const guardado = cache.get(clave);
  if (guardado) return json(guardado);
  if (consultando || Date.now() < proximaConsulta) {
    return json({ error: 'Búsqueda ocupada' }, { status: 429, headers: { 'Retry-After': '1' } });
  }

  consultando = true;
  proximaConsulta = Date.now() + 1100;
  try {
    const destino = new URL(env.GEOCODING_REVERSE_URL || 'https://nominatim.openstreetmap.org/reverse');
    destino.searchParams.set('lat', latitud);
    destino.searchParams.set('lon', longitud);
    destino.searchParams.set('format', 'jsonv2');
    destino.searchParams.set('addressdetails', '1');
    const respuesta = await fetch(destino, {
      headers: {
        'User-Agent': 'CerroLargo360/1.0 (+https://cerrolargo360.vercel.app)',
        'Accept-Language': 'es-UY,es;q=0.9'
      },
      signal: AbortSignal.timeout(5000)
    });
    if (!respuesta.ok && respuesta.status !== 404) {
      if (respuesta.status === 429) proximaConsulta = Date.now() + 60_000;
      return json({ error: 'Servicio de geocodificación no disponible' }, { status: 503 });
    }
    const datos = respuesta.ok ? await respuesta.json() as { address?: DireccionNominatim } : {};
    const direccion = datos.address?.country_code === 'uy' ? datos.address : {};
    const calle = direccion.road || direccion.pedestrian;
    const resultado = {
      direccion: calle ? [calle, direccion.house_number].filter(Boolean).join(' ').slice(0, 130) : '',
      localidades: [direccion.city, direccion.town, direccion.village, direccion.hamlet, direccion.locality]
        .filter((nombre): nombre is string => Boolean(nombre))
    };

    if (cache.size >= 1000) {
      const primera = cache.keys().next();
      if (!primera.done) cache.delete(primera.value);
    }
    cache.set(clave, resultado);
    return json(resultado);
  } catch {
    return json({ error: 'Servicio de geocodificación no disponible' }, { status: 503 });
  } finally {
    consultando = false;
  }
};
