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
        const parametros = new URLSearchParams({ lat: String(latitud), lon: String(longitud) });
        const url = `/geocodificacion-inversa?${parametros}`;
        const opcionesSolicitud = { signal: solicitud.signal };
        let respuesta = await fetch(url, opcionesSolicitud);
        if (respuesta.status === 429) {
          await new Promise((resolver) => setTimeout(resolver, 1100));
          if (solicitud.signal.aborted) return;
          respuesta = await fetch(url, opcionesSolicitud);
        }
        if (!respuesta.ok) throw new Error('Error de geocodificación');
        const datos = await respuesta.json() as { direccion: string; localidades: string[] };
        if (solicitud.signal.aborted) return;

        const opciones = campos.localidades();
        const localidad = datos.localidades.map((nombre) => opciones.find(
          (opcion) => normalizar(opcion) === normalizar(nombre)
        )).find(Boolean);

        if (localidad && cambiosLocalidad === versionLocalidad) campos.localidad(localidad);
        if (datos.direccion && cambiosDireccion === versionDireccion) campos.direccion(datos.direccion);
        campos.estado(localidad && datos.direccion ? '' : 'Completá manualmente los datos que falten.');
      } catch {
        if (!solicitud.signal.aborted) {
          campos.estado('No se pudo buscar la dirección. Podés completar los datos manualmente.');
        }
      } finally {
        if (pendiente === solicitud) pendiente = undefined;
      }
    }
  };
}
