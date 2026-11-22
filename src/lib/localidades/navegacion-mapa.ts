import type { Map } from 'mapbox-gl';
import type { LocalidadPublica } from '#lib/types/localidad.ts';

export function crearNavegacionLocalidades() {
    let mapa: Pick<Map, 'flyTo' | 'fitBounds'> | undefined;
    let localidades: LocalidadPublica[] = [];
    let seleccion = '';

    function centrar() {
        const localidad = localidades.find(item => item.nombre === seleccion);
        if (!mapa || !localidad) return;
        if (localidad.latitud == null || localidad.longitud == null) {
            const limites = localidad.limites;
            if (limites && limites.flat().every(Number.isFinite) && limites[0][0] <= limites[1][0] && limites[0][1] <= limites[1][1]) {
                mapa.fitBounds(limites, { padding: 60, maxZoom: 13, duration: 800 });
            }
            return;
        }
        const latitud = Number(localidad.latitud);
        const longitud = Number(localidad.longitud);
        if (!Number.isFinite(latitud) || !Number.isFinite(longitud) || Math.abs(latitud) > 90 || Math.abs(longitud) > 180) return;
        mapa.flyTo({ center: [longitud, latitud], zoom: 13, duration: 800 });
    }

    return {
        establecerMapa(valor: Pick<Map, 'flyTo' | 'fitBounds'>) { mapa = valor; if (seleccion) centrar(); },
        establecerLocalidades(datos: LocalidadPublica[]) { localidades = datos; if (seleccion) centrar(); },
        seleccionar(nombre: string) { seleccion = nombre; if (seleccion) centrar(); }
    };
}
