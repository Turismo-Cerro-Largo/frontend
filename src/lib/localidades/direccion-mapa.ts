function normalizar(nombre: string) {
  return nombre.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase();
}

export function crearBusquedaDireccion(campos: {
  localidades: () => string[];
  localidad: (valor: string) => void;
  direccion: (valor: string) => void;
  estado: (valor: string) => void;
}) {
  let pendiente: AbortController | undefined;
  let cambiosLocalidad = 0;
  let cambiosDireccion = 0;

  return {
    editarLocalidad() { cambiosLocalidad++; },
    editarDireccion() { cambiosDireccion++; },
    cancelar() { pendiente?.abort(); },
    async buscar(longitud: number, latitud: number) {
      pendiente?.abort();
      const solicitud = new AbortController();
      pendiente = solicitud;
      const versionLocalidad = cambiosLocalidad;
      const versionDireccion = cambiosDireccion;
      campos.estado('Buscando dirección y localidad…');

      try {
        await new Promise((resolver) => setTimeout(resolver, 450));
        if (solicitud.signal.aborted) return;
        const parametros = new URLSearchParams({ lat: String(latitud), lon: String(longitud) });
        const url = `/geocodificacion-inversa?${parametros}`;
        const opcionesSolicitud: RequestInit = { signal: solicitud.signal, credentials: 'same-origin', cache: 'no-store' };
        let respuesta = await fetch(url, opcionesSolicitud);
        if (respuesta.status === 429) {
          const espera = Number(respuesta.headers.get('Retry-After') || '1');
          if (!Number.isFinite(espera) || espera > 5) throw new Error('El servicio está ocupado. Probá nuevamente en un minuto.');
          await new Promise((resolver) => setTimeout(resolver, Math.max(1100, espera * 1000)));
          if (solicitud.signal.aborted) return;
          respuesta = await fetch(url, opcionesSolicitud);
        }
        if (respuesta.status === 401) throw new Error('Tu sesión venció. Volvé a iniciar sesión.');
        if (respuesta.status === 403) throw new Error('La búsqueda de direcciones está disponible para organizadores y administradores.');
        if (!respuesta.ok) throw new Error('No se pudo buscar la dirección. Podés completar los datos manualmente.');
        const datos = await respuesta.json() as { direccion: string; localidades: string[] };
        if (solicitud.signal.aborted) return;
        if (typeof datos.direccion !== 'string' || !Array.isArray(datos.localidades) || !datos.localidades.every(nombre => typeof nombre === 'string')) throw new Error('La búsqueda no devolvió una dirección válida. Completala manualmente.');

        const opciones = campos.localidades();
        const localidad = datos.localidades.map((nombre) => opciones.find(
          (opcion) => normalizar(opcion) === normalizar(nombre)
        )).find(Boolean);

        if (localidad && cambiosLocalidad === versionLocalidad) campos.localidad(localidad);
        if (datos.direccion && cambiosDireccion === versionDireccion) campos.direccion(datos.direccion);
        campos.estado(localidad && datos.direccion ? '' : 'Completá manualmente los datos que falten.');
      } catch (error) {
        if (!solicitud.signal.aborted) {
          campos.estado(error instanceof Error && !['TypeError', 'AbortError'].includes(error.name)
            ? error.message
            : 'No se pudo buscar la dirección. Podés completar los datos manualmente.');
        }
      } finally {
        if (pendiente === solicitud) pendiente = undefined;
      }
    }
  };
}
