import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { contextoAnalitica } from '../src/lib/identidad-analitica.ts';

const fuenteVisitas = await readFile(new URL('../src/lib/visitas.ts', import.meta.url), 'utf8');
const fuenteSdk = await readFile(new URL('../src/lib/analitica.ts', import.meta.url), 'utf8');
const preparar = fuente => stripTypeScriptTypes(fuente).replace(/^import .*;\r?$/gm, '').replace(/export /g, '');

function escenario() {
    const eventos = [];
    const llamadas = [];
    const almacenamiento = () => {
        const datos = new Map();
        return { getItem: clave => datos.get(clave) ?? null, setItem: (clave, valor) => datos.set(clave, valor) };
    };
    const visitas = new Function('dev', 'env', 'contextoAnalitica', 'localStorage', 'sessionStorage', 'crypto', 'performance', 'document', 'window', 'location', 'fetch', `${preparar(fuenteVisitas)}; return { registrarVisita, idVisitante, identidadAnalitica, actualizarIdVisitante };`)(
        false, {}, contextoAnalitica, almacenamiento(), almacenamiento(), crypto, performance,
        { visibilityState: 'visible', addEventListener() {} }, { addEventListener() {} }, { origin: 'https://ejemplo.test' },
        async (_url, opciones) => eventos.push(JSON.parse(opciones.body)),
    );
    let distinto = '';
    const ph = {
        init(_clave, config) { distinto = config.bootstrap.distinctID; llamadas.push(['init', config]); },
        identify(id) { distinto = id; llamadas.push(['identify', id]); },
        reset() { distinto = crypto.randomUUID(); llamadas.push(['reset']); },
        get_distinct_id() { return distinto; },
        register(propiedades) { llamadas.push(['register', propiedades]); },
        set_config(config) { llamadas.push(['config', config]); },
        startSessionRecording() { llamadas.push(['grabar']); },
        stopSessionRecording() {},
        capture(nombre, propiedades) { llamadas.push(['capture', nombre, propiedades]); },
    };
    const sdk = new Function('dev', 'env', 'idVisitante', 'identidadAnalitica', 'actualizarIdVisitante', 'ph', `${preparar(fuenteSdk).replace("import('posthog-js')", 'Promise.resolve({ default: ph })')}; return { actualizarAnalitica, registrarEvento };`)(false, {}, visitas.idVisitante, visitas.identidadAnalitica, visitas.actualizarIdVisitante, ph);
    async function navegar(ruta, cuenta) {
        visitas.registrarVisita(ruta, cuenta);
        await sdk.actualizarAnalitica(cuenta?.rol, ruta);
    }
    return { eventos, llamadas, visitas, sdk, navegar, ph };
}

test('visitas e interacciones se vinculan al ID interno y cambian al cambiar de cuenta', async () => {
    const e = escenario();
    await e.navegar('/', { id: 41, rol: 'TURISTA', nombre: 'No enviar', email: 'privado@ejemplo.test' });
    const sesion = e.visitas.identidadAnalitica().sesionId;
    await e.navegar('/lugares/10', { id: 41, rol: 'TURISTA' });
    assert.equal(e.visitas.identidadAnalitica().sesionId, sesion);
    assert.equal(e.ph.get_distinct_id(), 'cuenta:41');
    assert.equal(e.eventos.at(-1).properties.distinct_id, 'cuenta:41');
    await e.navegar('/organizador', { id: 52, rol: 'ORGANIZADOR' });
    assert.equal(e.ph.get_distinct_id(), 'cuenta:52');
    assert.notEqual(e.visitas.identidadAnalitica().sesionId, sesion);
    assert.ok(e.llamadas.some(c => c[0] === 'reset'));
    assert.ok(!JSON.stringify(e.eventos).includes('privado@ejemplo.test'));
    assert.ok(!JSON.stringify(e.eventos).includes('No enviar'));
});

test('salir de la cuenta deja una identidad anónima nueva y consistente', async () => {
    const e = escenario();
    await e.navegar('/organizador', { id: 52, rol: 'ORGANIZADOR' });
    await e.navegar('/', null);
    const identidad = e.visitas.identidadAnalitica();
    assert.equal(identidad.identificada, false);
    assert.equal(identidad.id, e.ph.get_distinct_id());
    assert.notEqual(identidad.id, 'cuenta:52');
    await e.navegar('/eventos', null);
    assert.equal(e.eventos.at(-1).properties.distinct_id, identidad.id);
    assert.equal(e.eventos.at(-1).properties.$process_person_profile, false);
});

test('administradores y rutas administrativas no inicializan ni envían analítica', async () => {
    const e = escenario();
    await e.navegar('/', { id: 1, rol: 'ADMINISTRADOR' });
    await e.navegar('/administrador', null);
    e.sdk.registrarEvento('registro_enviado', {});
    await Promise.resolve();
    assert.equal(e.eventos.length, 0);
    assert.equal(e.llamadas.filter(c => c[0] === 'init').length, 0);
    assert.equal(e.llamadas.filter(c => c[0] === 'capture').length, 0);
});

test('cambiar a administrador detiene la captura incluso con el SDK cargado', async () => {
    const e = escenario();
    await e.navegar('/organizador', { id: 52, rol: 'ORGANIZADOR' });
    await e.navegar('/administrador', { id: 1, rol: 'ADMINISTRADOR' });
    const cantidad = e.eventos.length;
    await e.navegar('/eventos', { id: 1, rol: 'ADMINISTRADOR' });
    e.sdk.registrarEvento('registro_resultado', { exito: false });
    await Promise.resolve();
    assert.equal(e.eventos.length, cantidad);
    assert.equal(e.llamadas.filter(c => c[0] === 'capture').length, 0);
    const config = e.llamadas.find(c => c[0] === 'init')[1];
    assert.equal(config.before_send({ properties: {} }), null);
});
